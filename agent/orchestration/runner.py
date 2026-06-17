"""
Sub-agent runner — runs a sub-agent with REAL tool access using the same
Agent infrastructure as the orchestrator.

The sub-agent:
  - Uses the same LLM model + API config as the orchestrator
  - Gets ALL tools EXCEPT the orchestration tool (so it can't recursively
    spawn sub-agents or modify the agent swarm)
  - Has its own system prompt (defined when the orchestrator created it)
  - Streams its response back via on_event callbacks
  - Tool calls are executed for real (web_search, bash, read, write, etc.)
    so the sub-agent can actually DO things, not just talk about doing them

The runner exposes a single function: stream_sub_agent_response().

It yields SSE-style event dicts that the web channel forwards to the browser:

    {"type": "agent_start",  "agent_id": "...", "agent_name": "...", "svg_logo": "..."}
    {"type": "delta",        "content": "..."}        # streamed text tokens
    {"type": "tool_start",   "tool": "...", "args": {...}}
    {"type": "tool_end",     "tool": "...", "status": "success|error", "result": ...}
    {"type": "agent_end"}
    {"type": "error",        "message": "..."}

This replaces the old plain-LLM-call runner that couldn't execute tools,
which caused sub-agents to emit raw <tool_call> tags as text.
"""

import json
import os
import threading
from typing import Any, Dict, Iterator, Optional

from common.log import logger


def _safe_workspace(workspace: Optional[str]) -> str:
    if workspace and isinstance(workspace, str):
        return os.path.expanduser(workspace)
    return os.path.expanduser("~/onyx")


def _load_agent(workspace: Optional[str], agent_id: str) -> Optional[Dict[str, Any]]:
    p = os.path.join(_safe_workspace(workspace), "agents", f"{agent_id}.json")
    if not os.path.exists(p):
        return None
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"[SubAgentRunner] failed to read {p}: {e}")
        return None


def _get_api_config() -> Dict[str, str]:
    """Pull the OpenAI-compatible API config from the running config.

    Resolution order (first non-empty key wins):
      1. CUSTOM PROVIDER mode (bot_type='custom' or 'custom:<id>').
      2. MODEL-SPECIFIC mode (deepseek_api_key, claude_api_key, etc.).
      3. Fallback: open_ai_api_key + open_ai_api_base.
      4. Last-resort: scan all *_api_key fields.
    Returns dict with: api_key, api_base, model, headers, bot_type.
    Used only for the "no API key" error message — the actual LLM calls
    go through the orchestrator's bridge/bot infrastructure.
    """
    try:
        from config import conf
        cfg = conf()
        model = (cfg.get("model") or "").lower()
        bot_type = (cfg.get("bot_type") or "").lower()

        # Tier 1: Custom provider mode
        if bot_type == "custom" or bot_type.startswith("custom:"):
            try:
                from models.custom_provider import resolve_custom_credentials
                api_key, api_base, custom_model, custom_headers = resolve_custom_credentials()
                if api_key:
                    return {"api_key": api_key, "api_base": api_base or "", "model": custom_model or cfg.get("model", ""), "headers": custom_headers or {}, "bot_type": bot_type}
            except Exception:
                pass
            api_key = cfg.get("custom_api_key", "") or ""
            api_base = cfg.get("custom_api_base", "") or ""
            if api_key:
                return {"api_key": api_key, "api_base": api_base, "model": cfg.get("model", ""), "headers": {}, "bot_type": bot_type}

        # Tier 2: Model-specific
        MODEL_MAP = [
            ("deepseek",  ("deepseek_api_key",  "https://api.deepseek.com/v1")),
            ("claude",    ("claude_api_key",    "https://api.anthropic.com/v1")),
            ("moonshot",  ("moonshot_api_key",  "https://api.moonshot.cn/v1")),
            ("kimi",      ("moonshot_api_key",  "https://api.moonshot.cn/v1")),
            ("gemini",    ("gemini_api_key",    "https://generativelanguage.googleapis.com/v1beta/openai")),
            ("glm",       ("zhipu_ai_api_key",  "https://open.bigmodel.cn/api/paas/v4")),
            ("qwen",      ("dashscope_api_key", "https://dashscope.aliyuncs.com/compatible-mode/v1")),
            ("qwq",       ("dashscope_api_key", "https://dashscope.aliyuncs.com/compatible-mode/v1")),
            ("doubao",    ("ark_api_key",       "https://ark.cn-beijing.volces.com/api/v3")),
            ("minimax",   ("minimax_api_key",   "https://api.minimax.chat/v1")),
            ("ernie",     ("qianfan_api_key",   "https://qianfan.baidubce.com/v2")),
            ("qianfan",   ("qianfan_api_key",   "https://qianfan.baidubce.com/v2")),
        ]
        api_key = ""
        api_base = ""
        for prefix, (key_field, base_default) in MODEL_MAP:
            if model.startswith(prefix):
                api_key = cfg.get(key_field, "") or ""
                api_base = cfg.get(f"{prefix}_api_base", "") or base_default
                break

        # Tier 3: open_ai_api_key
        if not api_key:
            api_key = cfg.get("open_ai_api_key", "") or ""
            api_base = api_base or cfg.get("open_ai_api_base", "") or "https://api.openai.com/v1"

        # Tier 4: scan all *_api_key fields
        if not api_key:
            try:
                items = cfg.items() if hasattr(cfg, 'items') else []
                for k, v in items:
                    if isinstance(k, str) and k.endswith("_api_key") and v:
                        api_key = v
                        provider = k[:-8]
                        api_base = cfg.get(f"{provider}_api_base", "") or api_base
                        break
            except Exception:
                pass

        return {"api_key": api_key, "api_base": api_base, "model": cfg.get("model", ""), "headers": {}, "bot_type": bot_type}
    except Exception as e:
        logger.error(f"[SubAgentRunner] config load failed: {e}")
        return {"api_key": "", "api_base": "", "model": "", "headers": {}, "bot_type": ""}


def stream_sub_agent_response(
    agent_id: str,
    user_message: str,
    workspace: Optional[str] = None,
) -> Iterator[Dict[str, Any]]:
    """Stream a sub-agent's response to a user message.

    Creates a REAL Agent instance (using the same bridge/bot infrastructure
    as the orchestrator) with the sub-agent's system prompt and ALL tools
    EXCEPT the orchestration tool. The agent can execute tool calls for real
    (web_search, bash, read, write, etc.) and streams its response back.

    Yields event dicts (see module docstring).
    """
    agent_data = _load_agent(workspace, agent_id)
    if agent_data is None:
        yield {"type": "error", "message": f"Agent '{agent_id}' not found"}
        return
    if not agent_data.get("enabled", True):
        yield {"type": "error", "message": f"Agent '{agent_id}' is disabled"}
        return

    # Announce the agent so the frontend can create a NEW chat bubble with
    # this agent's identity (name + svg_logo).
    yield {
        "type": "agent_start",
        "agent_id": agent_id,
        "agent_name": agent_data.get("name", agent_id),
        "agent_role": agent_data.get("role", ""),
        "svg_logo": agent_data.get("svg_logo", ""),
    }

    # Check API config — if no key, emit a helpful error and stop.
    api_cfg = _get_api_config()
    if not api_cfg["api_key"]:
        yield {"type": "delta", "content":
               f"⚠ Sub-agent '{agent_data.get('name', agent_id)}' cannot run — "
               f"no API key found in config.\n\n"
               f"Configured bot_type: `{api_cfg.get('bot_type', '(none)')}`\n"
               f"Configured model: `{api_cfg.get('model', '(none)')}`\n\n"
               f"To fix this, set ONE of these in your config:\n"
               f"• For custom providers: `custom_api_key` + `custom_api_base` + `bot_type: \"custom\"`\n"
               f"• Or add a provider to `custom_providers` and set `bot_type: \"custom:<id>\"`\n"
               f"• For OpenAI: `open_ai_api_key`\n"
               f"• For DeepSeek: `deepseek_api_key`\n"
               f"• For Claude: `claude_api_key`\n"
               f"• For Gemini: `gemini_api_key`\n"
               f"• For Qwen: `dashscope_api_key`\n"
               f"• For GLM: `zhipu_ai_api_key`\n\n"
               f"The sub-agent uses the SAME API config as the orchestrator."}
        yield {"type": "agent_end"}
        return

    system_prompt = agent_data.get("system_prompt", "").strip()
    if not system_prompt:
        system_prompt = f"You are {agent_data.get('name', agent_id)}. Help the user."

    # ── Run the sub-agent with REAL tool access ──
    # We use the orchestrator's bridge to create an Agent instance with the
    # sub-agent's system prompt. The agent gets ALL tools EXCEPT orchestration
    # (so it can't recursively spawn sub-agents or modify the swarm).
    try:
        yield from _run_subagent_with_tools(
            agent_id, agent_data, system_prompt, user_message, workspace
        )
    except Exception as e:
        logger.error(f"[SubAgentRunner] sub-agent execution failed: {e}", exc_info=True)
        yield {"type": "delta", "content": f"\n\n⚠ Sub-agent execution error: {e}"}
    finally:
        yield {"type": "agent_end"}


def _run_subagent_with_tools(
    agent_id: str,
    agent_data: Dict[str, Any],
    system_prompt: str,
    user_message: str,
    workspace: Optional[str],
) -> Iterator[Dict[str, Any]]:
    """Create a real Agent instance and run it with streaming + tool access.

    Uses the same Agent / AgentStreamExecutor / bridge infrastructure as the
    orchestrator, but with:
      - The sub-agent's system prompt
      - ALL tools EXCEPT orchestration (filtered out by name)
      - A fresh message history (sub-agents don't share the orchestrator's context)
      - An on_event callback that translates agent events to our SSE event format
    """
    # Lazy imports — these pull in the full agent stack which is heavy.
    from agent.protocol import Agent
    from bridge.agent_bridge import AgentLLMModel
    from bridge.bridge import Bridge
    from agent.tools import ToolManager

    # Get the singleton Bridge instance (same one the orchestrator uses).
    bridge = Bridge()
    model = AgentLLMModel(bridge)

    # Load all tools, then FILTER OUT the orchestration tool.
    tool_manager = ToolManager()
    tool_manager.load_tools()
    tools = []
    workspace_dir = _safe_workspace(workspace)
    for tool_name in tool_manager.tool_classes.keys():
        if tool_name == "orchestration":
            # Sub-agents CANNOT use the orchestration tool — prevents
            # recursive sub-agent spawning and swarm modification.
            continue
        try:
            tool = tool_manager.create_tool(tool_name)
            if tool:
                if workspace_dir and hasattr(tool, 'cwd'):
                    tool.cwd = workspace_dir
                tools.append(tool)
        except Exception as e:
            logger.warning(f"[SubAgentRunner] Failed to load tool {tool_name}: {e}")

    logger.info(f"[SubAgentRunner] Sub-agent '{agent_id}' loaded with {len(tools)} tools (orchestration excluded)")

    # Create the Agent instance with the sub-agent's system prompt.
    agent = Agent(
        system_prompt=system_prompt,
        description=f"Sub-agent: {agent_data.get('name', agent_id)}",
        model=model,
        tools=tools,
        max_steps=15,
        output_mode="logger",
        workspace_dir=workspace_dir,
        enable_skills=True,
    )

    # Queue to collect events from the agent's on_event callback.
    # We use a queue so the generator can yield events as they arrive.
    import queue
    event_queue: "queue.Queue" = queue.Queue()
    _SENTINEL = object()

    def on_event(event: dict):
        """Translate agent events to our SSE event format and enqueue them."""
        try:
            etype = event.get("type", "")
            data = event.get("data", {}) or {}

            if etype == "message_update":
                # Streamed text delta
                delta = data.get("delta", "")
                if delta:
                    event_queue.put({"type": "delta", "content": delta})

            elif etype == "tool_execution_start":
                event_queue.put({
                    "type": "tool_start",
                    "tool": data.get("tool", ""),
                    "args": data.get("arguments", {}),
                })

            elif etype == "tool_execution_end":
                result = data.get("result", "")
                # Truncate very long tool results so they don't blow up the UI
                if isinstance(result, str) and len(result) > 2000:
                    result = result[:2000] + "\n... [truncated]"
                event_queue.put({
                    "type": "tool_end",
                    "tool": data.get("tool", ""),
                    "status": "success" if data.get("status") != "error" else "error",
                    "result": result,
                })

            elif etype == "reasoning_update":
                # Optionally stream reasoning — we skip it to keep the UI clean.
                # The orchestrator shows reasoning in a collapsible block; sub-agents
                # just show their final answer + tool calls.
                pass

            elif etype == "error":
                event_queue.put({"type": "delta", "content": f"\n\n⚠ Error: {data.get('error', 'unknown')}"})

            # We deliberately DON'T forward agent_start/agent_end/message_start/
            # message_end/turn_start/turn_end — we emit our own agent_start at
            # the top of stream_sub_agent_response() and our own agent_end in
            # the finally block. The frontend only cares about deltas + tool calls.

        except Exception as e:
            logger.error(f"[SubAgentRunner] on_event error: {e}")

    # Run the agent in a background thread (run_stream is blocking).
    final_response_holder = {"text": ""}

    def _run():
        try:
            result = agent.run_stream(
                user_message,
                on_event=on_event,
                clear_history=True,  # sub-agents start fresh, no shared context
            )
            final_response_holder["text"] = result or ""
        except Exception as e:
            logger.error(f"[SubAgentRunner] run_stream failed: {e}", exc_info=True)
            event_queue.put({"type": "delta", "content": f"\n\n⚠ Sub-agent execution failed: {e}"})
        finally:
            event_queue.put(_SENTINEL)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()

    # Yield events as they arrive from the agent thread.
    while True:
        try:
            item = event_queue.get(timeout=300)  # 5-minute timeout
        except Exception:
            # Timeout — agent took too long
            yield {"type": "delta", "content": "\n\n⚠ Sub-agent timed out after 5 minutes."}
            break
        if item is _SENTINEL:
            break
        yield item

    # Wait for the thread to fully finish (it may still be cleaning up).
    thread.join(timeout=5)
