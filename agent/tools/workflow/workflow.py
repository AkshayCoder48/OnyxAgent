"""
Workflow tool — lets the AI create, list, edit, delete, and run multi-step
workflow pipelines.

A workflow is a named sequence of steps. Each step is either:
  - type: "ai"     → an AI prompt (with {{variable}} substitution)
  - type: "tool"   → a tool call (tool_name + tool_args)

Steps can reference outputs from previous steps via {{output_var}}.

The AI creates workflows using this tool with action='create', passing a
JSON workflow definition. The workflow is persisted to:
  <workspace>/workflows/<id>.json
  <workspace>/workflows/_index.json  (for fast listing)

The web UI reads these files via /api/workflows to render a sidebar view
that previews all workflows (like the Skills view).

Actions:
  - create : create a new workflow
  - ls     : list all workflows (returns index view)
  - get    : get one workflow by id
  - edit   : edit a workflow's name/description/steps
  - delete : delete a workflow
  - run    : execute a workflow (returns step-by-step results)
"""

import json
import os
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from agent.tools.base_tool import BaseTool, ToolResult
from common.log import logger


# ─── helpers ──────────────────────────────────────────────────────────────

_VALID_STEP_TYPES = {"ai", "tool"}


def _safe_workspace(workspace: Optional[str]) -> str:
    if workspace and isinstance(workspace, str):
        return os.path.expanduser(workspace)
    return os.path.expanduser("~/onyx")


def _workflows_dir(workspace: Optional[str]) -> str:
    d = os.path.join(_safe_workspace(workspace), "workflows")
    os.makedirs(d, exist_ok=True)
    return d


def _index_path(workspace: Optional[str]) -> str:
    return os.path.join(_workflows_dir(workspace), "_index.json")


def _workflow_path(workspace: Optional[str], wf_id: str) -> str:
    if not re.fullmatch(r"[a-zA-Z0-9_\-]+", wf_id):
        raise ValueError(f"Invalid workflow id: {wf_id!r}")
    return os.path.join(_workflows_dir(workspace), f"{wf_id}.json")


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _slugify(name: str, fallback: str = "workflow") -> str:
    if not name:
        return fallback
    slug = re.sub(r"[^a-zA-Z0-9_\-]+", "-", name.strip().lower()).strip("-")
    return slug or fallback


def _load_index(workspace: Optional[str]) -> Dict[str, Dict[str, Any]]:
    p = _index_path(workspace)
    if not os.path.exists(p):
        return {}
    try:
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _save_index(workspace: Optional[str], idx: Dict[str, Dict[str, Any]]) -> None:
    p = _index_path(workspace)
    tmp = f"{p}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, indent=2)
    os.replace(tmp, p)


def _load_workflow(workspace: Optional[str], wf_id: str) -> Optional[Dict[str, Any]]:
    p = _workflow_path(workspace, wf_id)
    if not os.path.exists(p):
        return None
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"[WorkflowTool] failed to read {p}: {e}")
        return None


def _save_workflow(workspace: Optional[str], data: Dict[str, Any]) -> None:
    p = _workflow_path(workspace, data["id"])
    tmp = f"{p}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, p)


def _validate_steps(steps: Any) -> List[Dict[str, Any]]:
    """Validate and normalize a steps list. Raises ValueError on bad shape."""
    if not isinstance(steps, list) or not steps:
        raise ValueError("steps must be a non-empty array")
    validated = []
    for i, step in enumerate(steps):
        if not isinstance(step, dict):
            raise ValueError(f"step[{i}] must be an object")
        stype = (step.get("type") or "").lower().strip()
        if stype not in _VALID_STEP_TYPES:
            raise ValueError(
                f"step[{i}].type must be 'ai' or 'tool' (got {stype!r})"
            )
        output_var = (step.get("output_var") or "").strip()
        if not output_var:
            # Auto-generate if missing
            output_var = f"step_{i+1}_output"

        if stype == "ai":
            prompt = (step.get("prompt") or "").strip()
            if not prompt:
                raise ValueError(f"step[{i}].prompt is required for ai steps")
            validated.append({
                "id": step.get("id") or uuid.uuid4().hex[:8],
                "type": "ai",
                "prompt": prompt,
                "output_var": output_var,
            })
        else:  # tool
            tool_name = (step.get("tool_name") or step.get("tool") or "").strip()
            if not tool_name:
                raise ValueError(f"step[{i}].tool_name is required for tool steps")
            tool_args = step.get("tool_args") or step.get("arguments") or {}
            if not isinstance(tool_args, dict):
                raise ValueError(f"step[{i}].tool_args must be an object")
            validated.append({
                "id": step.get("id") or uuid.uuid4().hex[:8],
                "type": "tool",
                "tool_name": tool_name,
                "tool_args": tool_args,
                "output_var": output_var,
            })
    return validated


def _substitute_variables(text: str, variables: Dict[str, str]) -> str:
    """Replace {{var_name}} placeholders with their values."""
    if not text:
        return text
    def replacer(m):
        key = m.group(1).strip()
        return str(variables.get(key, m.group(0)))
    return re.sub(r"\{\{(\w+)\}\}", replacer, text)


def _public_view(data: Dict[str, Any]) -> Dict[str, Any]:
    """Trim internal fields for return to agent/UI."""
    return {
        "component": "workflow",
        "id": data["id"],
        "name": data.get("name", data["id"]),
        "description": data.get("description", ""),
        "steps": data.get("steps", []),
        "step_count": len(data.get("steps", [])),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


def _public_index_view(idx: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Return a list-of-workflows payload for the 'ls' action."""
    workflows = []
    for wid, meta in idx.items():
        workflows.append({
            "id": wid,
            "name": meta.get("name", wid),
            "description": meta.get("description", ""),
            "step_count": meta.get("step_count", 0),
            "updated_at": meta.get("updated_at"),
        })
    return {
        "component": "workflow-index",
        "workflows": workflows,
        "count": len(workflows),
    }


def _refresh_index_entry(idx: Dict[str, Dict[str, Any]], data: Dict[str, Any]) -> None:
    idx[data["id"]] = {
        "name": data.get("name", data["id"]),
        "description": data.get("description", ""),
        "step_count": len(data.get("steps", [])),
        "updated_at": data.get("updated_at"),
    }


# ─── the tool ─────────────────────────────────────────────────────────────

class WorkflowTool(BaseTool):
    """
    Create and manage multi-step workflow pipelines.

    Each workflow is a JSON-defined sequence of steps (AI prompts and/or tool
    calls). Steps can reference outputs from previous steps via {{output_var}}.

    Actions:
      - create : create a new workflow
      - ls     : list all workflows
      - get    : get one workflow by id
      - edit   : edit a workflow's name/description/steps
      - delete : delete a workflow
      - run    : execute a workflow (runs each step, returns all outputs)

    The 'run' action executes steps sequentially:
      1. For 'ai' steps: runs the prompt through the AI (using the agent's
         model), substitutes {{variables}} from previous step outputs.
      2. For 'tool' steps: executes the named tool with the given args
         (after {{variable}} substitution in string values).
    Each step's output is captured into its output_var for use by later steps.
    """

    name: str = "workflow"
    description: str = (
        "Create and manage multi-step workflow pipelines.\n\n"
        "Actions:\n"
        "  - create : create a new workflow (name, description, steps[])\n"
        "  - ls     : list all workflows\n"
        "  - get    : get one workflow by id\n"
        "  - edit   : edit a workflow (name, description, steps)\n"
        "  - delete : delete a workflow\n"
        "  - run    : execute a workflow (runs each step, returns outputs)\n\n"
        "Step format:\n"
        '  AI step:   {"type":"ai", "prompt":"...", "output_var":"var_name"}\n'
        '  Tool step: {"type":"tool", "tool_name":"bash", "tool_args":{"command":"ls"}, "output_var":"var_name"}\n\n'
        "Steps can reference previous outputs via {{var_name}} in prompts and "
        "tool_args string values. The AI should follow this exact format when "
        "creating workflows."
    )

    params: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["create", "ls", "get", "edit", "delete", "run"],
                "description": "Operation to perform.",
            },
            "workflow_id": {
                "type": "string",
                "description": "Workflow id (for get/edit/delete/run). Auto-generated on create if omitted.",
            },
            "name": {
                "type": "string",
                "description": "create/edit: workflow name.",
            },
            "description": {
                "type": "string",
                "description": "create/edit: workflow description.",
            },
            "steps": {
                "type": "array",
                "description": (
                    "create/edit: array of step objects. "
                    'AI step: {"type":"ai","prompt":"...","output_var":"var"}. '
                    'Tool step: {"type":"tool","tool_name":"bash","tool_args":{...},"output_var":"var"}.'
                ),
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string", "enum": ["ai", "tool"]},
                        "prompt": {"type": "string"},
                        "tool_name": {"type": "string"},
                        "tool_args": {"type": "object"},
                        "output_var": {"type": "string"},
                    },
                },
            },
        },
        "required": ["action"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}
        self.workspace = self.config.get("workspace") if isinstance(self.config, dict) else None
        # The agent's model — set by the ToolManager when the tool is attached.
        # Used for 'ai' steps during workflow execution.
        self.model = None

    def execute(self, params: dict) -> ToolResult:
        action = params.get("action")
        try:
            handler = getattr(self, f"_action_{action}", None)
            if handler is None:
                return ToolResult.fail(f"Unknown action: {action}")
            return ToolResult.success(handler(params))
        except FileNotFoundError as e:
            return ToolResult.fail(str(e))
        except ValueError as e:
            return ToolResult.fail(str(e))
        except Exception as e:
            logger.error(f"[WorkflowTool] {action} failed: {e}", exc_info=True)
            return ToolResult.fail(f"Workflow operation failed: {e}")

    # ── actions ───────────────────────────────────────────────────────────

    def _action_create(self, p: dict) -> Dict[str, Any]:
        name = (p.get("name") or "").strip()
        if not name:
            raise ValueError("name is required for create")
        description = (p.get("description") or "").strip()
        steps = _validate_steps(p.get("steps"))
        wf_id = (p.get("workflow_id") or "").strip() or _slugify(name)
        if not re.fullmatch(r"[a-zA-Z0-9_\-]+", wf_id):
            raise ValueError(f"Invalid workflow_id: {wf_id!r}")

        idx = _load_index(self.workspace)
        if wf_id in idx:
            raise ValueError(f"A workflow with id '{wf_id}' already exists")

        now = _now_iso()
        data = {
            "id": wf_id,
            "name": name,
            "description": description,
            "steps": steps,
            "created_at": now,
            "updated_at": now,
        }
        _save_workflow(self.workspace, data)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        logger.info(f"[WorkflowTool] Created workflow '{wf_id}' with {len(steps)} steps")
        return _public_view(data)

    def _action_ls(self, p: dict) -> Dict[str, Any]:
        idx = _load_index(self.workspace)
        return _public_index_view(idx)

    def _action_get(self, p: dict) -> Dict[str, Any]:
        wf_id = (p.get("workflow_id") or "").strip()
        if not wf_id:
            raise ValueError("workflow_id is required for get")
        data = _load_workflow(self.workspace, wf_id)
        if data is None:
            raise FileNotFoundError(f"Workflow '{wf_id}' not found")
        return _public_view(data)

    def _action_edit(self, p: dict) -> Dict[str, Any]:
        wf_id = (p.get("workflow_id") or "").strip()
        if not wf_id:
            raise ValueError("workflow_id is required for edit")
        data = _load_workflow(self.workspace, wf_id)
        if data is None:
            raise FileNotFoundError(f"Workflow '{wf_id}' not found")

        changed = False
        if "name" in p and p["name"]:
            data["name"] = str(p["name"]).strip()
            changed = True
        if "description" in p:
            data["description"] = str(p.get("description") or "").strip()
            changed = True
        if "steps" in p:
            data["steps"] = _validate_steps(p.get("steps"))
            changed = True
        if not changed:
            raise ValueError(
                "No editable fields provided (name, description, steps)"
            )

        data["updated_at"] = _now_iso()
        _save_workflow(self.workspace, data)
        idx = _load_index(self.workspace)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        logger.info(f"[WorkflowTool] Edited workflow '{wf_id}'")
        return _public_view(data)

    def _action_delete(self, p: dict) -> Dict[str, Any]:
        wf_id = (p.get("workflow_id") or "").strip()
        if not wf_id:
            raise ValueError("workflow_id is required for delete")
        path = _workflow_path(self.workspace, wf_id)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Workflow '{wf_id}' not found")
        os.remove(path)
        idx = _load_index(self.workspace)
        if wf_id in idx:
            del idx[wf_id]
            _save_index(self.workspace, idx)
        logger.info(f"[WorkflowTool] Deleted workflow '{wf_id}'")
        return _public_index_view(idx)

    def _action_run(self, p: dict) -> Dict[str, Any]:
        """Execute a workflow step by step.

        For 'ai' steps, uses the agent's model to run the prompt (with
        variable substitution). For 'tool' steps, executes the named tool.

        Returns a structured result with all step outputs.
        """
        wf_id = (p.get("workflow_id") or "").strip()
        if not wf_id:
            raise ValueError("workflow_id is required for run")
        data = _load_workflow(self.workspace, wf_id)
        if data is None:
            raise FileNotFoundError(f"Workflow '{wf_id}' not found")

        steps = data.get("steps", [])
        variables: Dict[str, str] = {}
        step_results: List[Dict[str, Any]] = []

        for i, step in enumerate(steps):
            step_result: Dict[str, Any] = {
                "index": i,
                "type": step["type"],
                "output_var": step.get("output_var", f"step_{i+1}_output"),
                "status": "pending",
                "output": "",
            }

            try:
                if step["type"] == "ai":
                    prompt = _substitute_variables(step["prompt"], variables)
                    output = self._run_ai_step(prompt)
                    step_result["status"] = "success"
                    step_result["output"] = output
                    variables[step_result["output_var"]] = output

                elif step["type"] == "tool":
                    # Substitute variables in string-valued tool_args
                    raw_args = step.get("tool_args", {})
                    resolved_args = {}
                    for k, v in raw_args.items():
                        if isinstance(v, str):
                            resolved_args[k] = _substitute_variables(v, variables)
                        else:
                            resolved_args[k] = v
                    tool_name = step["tool_name"]
                    output = self._run_tool_step(tool_name, resolved_args)
                    step_result["status"] = "success"
                    step_result["output"] = output
                    variables[step_result["output_var"]] = output

            except Exception as e:
                logger.error(f"[WorkflowTool] step {i} failed: {e}")
                step_result["status"] = "error"
                step_result["output"] = f"Error: {e}"
                step_results.append(step_result)
                # Stop execution on error — return what we have so far
                break

            step_results.append(step_result)

        return {
            "component": "workflow-run",
            "workflow_id": wf_id,
            "workflow_name": data.get("name", wf_id),
            "steps_executed": len(step_results),
            "total_steps": len(steps),
            "completed": len(step_results) == len(steps),
            "step_results": step_results,
            "final_output": variables.get(
                steps[-1].get("output_var", "") if steps else "", ""
            ),
        }

    # ── step execution helpers ────────────────────────────────────────────

    def _run_ai_step(self, prompt: str) -> str:
        """Run an AI prompt through the agent's model and return the text."""
        # Try to use the agent's model (set by ToolManager when attached).
        if self.model is None:
            return ("[AI step skipped — no model attached to workflow tool. "
                    "Run this workflow from the chat to enable AI steps.]")

        try:
            # The model may support different interfaces. Try run_stream first
            # (non-streaming, returns final text), then fall back to direct
            # reply generation.
            if hasattr(self.model, "run_stream"):
                result = self.model.run_stream(prompt, clear_history=True)
                return str(result or "").strip()
            # Fallback: use the bridge's fetch_reply_content if available
            if hasattr(self.model, "bridge") and self.model.bridge:
                from bridge.context import Context, ContextType
                from bridge.reply import ReplyType
                ctx = Context(ContextType.TEXT, prompt)
                reply = self.model.bridge.fetch_reply_content(prompt, ctx)
                if reply and reply.content:
                    return str(reply.content).strip()
            return "[AI step failed — model has no runnable interface]"
        except Exception as e:
            logger.error(f"[WorkflowTool] AI step failed: {e}")
            return f"[AI step error: {e}]"

    def _run_tool_step(self, tool_name: str, args: dict) -> str:
        """Execute a tool by name and return its output as a string."""
        try:
            from agent.tools import ToolManager
            tm = ToolManager()
            # Ensure tools are loaded
            if not tm.tool_classes:
                tm.load_tools()
            tool = tm.create_tool(tool_name)
            if tool is None:
                return f"[Tool '{tool_name}' not found]"
            # Inherit our model so the tool can use it if needed
            if self.model is not None:
                tool.model = self.model
            result = tool.execute_tool(args)
            if result.status == "success":
                return str(result.result if result.result is not None else "")
            else:
                return f"[Tool '{tool_name}' error: {result.result}]"
        except Exception as e:
            logger.error(f"[WorkflowTool] tool step '{tool_name}' failed: {e}")
            return f"[Tool '{tool_name}' error: {e}]"
