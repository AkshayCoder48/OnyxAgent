"""
Sub-agent runner — makes a real streaming LLM call with a sub-agent's
system prompt, using the same OpenAI-compatible API config as the
orchestrator (open_ai_api_key + open_ai_api_base + model from config.json).

The runner exposes a single function: stream_sub_agent_response().

It yields SSE-style event dicts that the web channel can forward directly
to the browser:

    {"type": "agent_start",  "agent_id": "...", "agent_name": "...", "svg_logo": "..."}
    {"type": "delta",        "content": "..."}
    {"type": "agent_end"}
    {"type": "error",        "message": "..."}

This is intentionally self-contained — it does NOT depend on the agent
bridge / bot factory, so it can't break the main orchestrator. It reads
the workspace's agent JSON file to get the system_prompt, then makes a
direct streaming HTTP call to the configured OpenAI-compatible endpoint.
"""

import json
import os
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
    """Pull the OpenAI-compatible API config from the running config."""
    try:
        from config import conf
        cfg = conf()
        # Try common key names. The orchestrator uses one of these.
        api_key = (
            cfg.get("open_ai_api_key")
            or cfg.get("api_key")
            or ""
        )
        api_base = (
            cfg.get("open_ai_api_base")
            or cfg.get("api_base")
            or "https://api.openai.com/v1"
        )
        model = (
            cfg.get("model")
            or cfg.get("model_aka")
            or "gpt-3.5-turbo"
        )
        return {"api_key": api_key, "api_base": api_base, "model": model}
    except Exception as e:
        logger.error(f"[SubAgentRunner] config load failed: {e}")
        return {"api_key": "", "api_base": "https://api.openai.com/v1", "model": "gpt-3.5-turbo"}


def stream_sub_agent_response(
    agent_id: str,
    user_message: str,
    workspace: Optional[str] = None,
) -> Iterator[Dict[str, Any]]:
    """Stream a sub-agent's response to a user message.

    Yields event dicts (see module docstring). The caller (web channel)
    converts these to SSE bytes and flushes them to the browser.
    """
    agent = _load_agent(workspace, agent_id)
    if agent is None:
        yield {"type": "error", "message": f"Agent '{agent_id}' not found"}
        return
    if not agent.get("enabled", True):
        yield {"type": "error", "message": f"Agent '{agent_id}' is disabled"}
        return

    # Announce the agent so the frontend can create a NEW chat bubble with
    # this agent's identity (name + svg_logo).
    yield {
        "type": "agent_start",
        "agent_id": agent_id,
        "agent_name": agent.get("name", agent_id),
        "agent_role": agent.get("role", ""),
        "svg_logo": agent.get("svg_logo", ""),
    }

    api_cfg = _get_api_config()
    if not api_cfg["api_key"]:
        yield {"type": "delta", "content":
               f"⚠ Sub-agent '{agent.get('name', agent_id)}' cannot run — "
               f"no API key configured. Set open_ai_api_key in config."}
        yield {"type": "agent_end"}
        return

    system_prompt = agent.get("system_prompt", "").strip()
    if not system_prompt:
        system_prompt = f"You are {agent.get('name', agent_id)}. Help the user."

    try:
        yield from _stream_openai_compatible(
            api_cfg, system_prompt, user_message, agent_id
        )
    except Exception as e:
        logger.error(f"[SubAgentRunner] streaming failed: {e}")
        yield {"type": "delta", "content": f"\n\n⚠ Streaming error: {e}"}
    finally:
        yield {"type": "agent_end"}


def _stream_openai_compatible(
    api_cfg: Dict[str, str],
    system_prompt: str,
    user_message: str,
    agent_id: str,
) -> Iterator[Dict[str, Any]]:
    """Make a streaming chat.completions request to an OpenAI-compatible API.

    Yields {"type": "delta", "content": "..."} for each token chunk.
    """
    import requests

    url = f"{api_cfg['api_base'].rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_cfg['api_key']}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }
    payload = {
        "model": api_cfg["model"],
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "stream": True,
        "temperature": 0.7,
    }

    # Use stream=True so requests doesn't buffer the whole response.
    resp = requests.post(url, headers=headers, json=payload, stream=True, timeout=120)
    if resp.status_code != 200:
        # Try to extract error message
        try:
            err_body = resp.json()
            err_msg = err_body.get("error", {}).get("message", resp.text[:300])
        except Exception:
            err_msg = resp.text[:300]
        yield {"type": "delta", "content":
               f"⚠ API returned status {resp.status_code}: {err_msg}"}
        return

    # Parse SSE: lines starting with "data: " contain JSON. "data: [DONE]" ends stream.
    for raw_line in resp.iter_lines(decode_unicode=True):
        if not raw_line:
            continue
        if not raw_line.startswith("data:"):
            continue
        data_str = raw_line[5:].strip()
        if data_str == "[DONE]":
            return
        try:
            chunk = json.loads(data_str)
            choices = chunk.get("choices", [])
            if choices:
                delta = choices[0].get("delta", {})
                content = delta.get("content", "")
                if content:
                    yield {"type": "delta", "content": content}
        except (json.JSONDecodeError, IndexError, KeyError) as e:
            logger.debug(f"[SubAgentRunner] skip malformed chunk: {e}")
            continue
