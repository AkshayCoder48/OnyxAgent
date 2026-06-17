"""
Multi-agent orchestration tool.

The orchestrator (the main chat AI) uses this tool to create, edit, delete,
enable, disable, and delegate to sub-agents. Each sub-agent has:
  - id              : stable slug
  - name            : display name
  - role            : short job title (e.g. "Backend Developer")
  - system_prompt   : the system prompt the sub-agent uses
  - svg_logo        : an inline SVG string the orchestrator generates for it
  - enabled         : bool — disabled agents are skipped during delegation
  - created_at      : ISO timestamp
  - updated_at      : ISO timestamp

Storage:
  <workspace>/agents/<id>.json   — one file per agent
  <workspace>/agents/_index.json — fast listing of all agents

Sub-agents reuse the SAME model/API config as the orchestrator. When the
orchestrator delegates a task via `delegate`, the orchestration tool simply
records the delegation (the actual sub-agent invocation is handled by the
agent runner outside this tool — see agent/orchestration/runner.py).

The tool returns JSON payloads tagged with `component: "agent-swarm"` or
`component: "agent-card"` so the chat UI can render interactive cards.
"""

import json
import os
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from agent.tools.base_tool import BaseTool, ToolResult
from common.log import logger


_VALID_NAME_RE = re.compile(r"[^a-zA-Z0-9_\-]+")


def _safe_workspace(workspace: Optional[str]) -> str:
    if workspace and isinstance(workspace, str):
        return os.path.expanduser(workspace)
    return os.path.expanduser("~/onyx")


def _agents_dir(workspace: Optional[str]) -> str:
    d = os.path.join(_safe_workspace(workspace), "agents")
    os.makedirs(d, exist_ok=True)
    return d


def _index_path(workspace: Optional[str]) -> str:
    return os.path.join(_agents_dir(workspace), "_index.json")


def _agent_path(workspace: Optional[str], agent_id: str) -> str:
    if not re.fullmatch(r"[a-zA-Z0-9_\-]+", agent_id):
        raise ValueError(f"Invalid agent id: {agent_id!r}")
    return os.path.join(_agents_dir(workspace), f"{agent_id}.json")


def _slugify(name: str, fallback: str = "agent") -> str:
    if not name:
        return fallback
    slug = _VALID_NAME_RE.sub("-", name.strip().lower()).strip("-")
    return slug or fallback


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


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


def _load_agent(workspace: Optional[str], agent_id: str) -> Optional[Dict[str, Any]]:
    p = _agent_path(workspace, agent_id)
    if not os.path.exists(p):
        return None
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"[OrchestrationTool] failed to read {p}: {e}")
        return None


def _save_agent(workspace: Optional[str], data: Dict[str, Any]) -> None:
    p = _agent_path(workspace, data["id"])
    tmp = f"{p}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, p)


def _refresh_index_entry(idx: Dict[str, Dict[str, Any]], data: Dict[str, Any]) -> None:
    idx[data["id"]] = {
        "name": data.get("name", data["id"]),
        "role": data.get("role", ""),
        "enabled": data.get("enabled", True),
        "svg_logo": data.get("svg_logo", ""),
        "updated_at": data.get("updated_at"),
    }


def _public_view(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "component": "agent-card",
        "id": data["id"],
        "name": data.get("name", data["id"]),
        "role": data.get("role", ""),
        "system_prompt": data.get("system_prompt", ""),
        "svg_logo": data.get("svg_logo", ""),
        "enabled": data.get("enabled", True),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


def _public_swarm_view(idx: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Return a swarm payload: orchestrator at center + sub-agents around it."""
    agents = []
    for aid, meta in idx.items():
        agents.append({
            "id": aid,
            "name": meta.get("name", aid),
            "role": meta.get("role", ""),
            "enabled": meta.get("enabled", True),
            "svg_logo": meta.get("svg_logo", ""),
        })
    return {
        "component": "agent-swarm",
        "orchestrator": {
            "id": "orchestrator",
            "name": "Orchestrator",
            "role": "Main coordinator",
            "svg_logo": _orchestrator_logo(),
        },
        "agents": agents,
        "count": len(agents),
    }


def _orchestrator_logo() -> str:
    """A distinctive logo SVG for the orchestrator — a hub-and-spokes icon."""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">'
            '<circle cx="24" cy="24" r="8" fill="#f43f5e"/>'
            '<circle cx="24" cy="6" r="4" fill="#f43f5e" opacity="0.85"/>'
            '<circle cx="42" cy="24" r="4" fill="#f43f5e" opacity="0.85"/>'
            '<circle cx="24" cy="42" r="4" fill="#f43f5e" opacity="0.85"/>'
            '<circle cx="6" cy="24" r="4" fill="#f43f5e" opacity="0.85"/>'
            '<line x1="24" y1="24" x2="24" y2="6" stroke="#f43f5e" stroke-width="2"/>'
            '<line x1="24" y1="24" x2="42" y2="24" stroke="#f43f5e" stroke-width="2"/>'
            '<line x1="24" y1="24" x2="24" y2="42" stroke="#f43f5e" stroke-width="2"/>'
            '<line x1="24" y1="24" x2="6" y2="24" stroke="#f43f5e" stroke-width="2"/>'
            '</svg>')


class OrchestrationTool(BaseTool):
    """
    Multi-agent orchestration — the chat AI (orchestrator) uses this to create
    and manage sub-agents. Sub-agents inherit the orchestrator's model/API
    config and have access to ALL tools EXCEPT this orchestration tool.

    Actions:
      - create    : create a new sub-agent (name, role, system_prompt, svg_logo?)
      - list      : list all agents (returns swarm view)
      - get       : get one agent by id
      - edit      : edit an agent's system_prompt / name / role / svg_logo
      - delete    : delete an agent
      - enable    : enable a disabled agent
      - disable   : disable an agent (skipped during delegation, saves compute)
      - delegate  : delegate a task to an agent (records the delegation; the
                    agent runner outside this tool performs the actual call)
    """

    name: str = "orchestration"
    description: str = (
        "Multi-agent orchestration. The orchestrator (you, the main chat AI) "
        "uses this to create and manage sub-agents for dividing complex tasks.\n\n"
        "Actions:\n"
        "  - create  : make a new sub-agent (name, role, system_prompt, svg_logo?)\n"
        "  - list    : list all sub-agents (returns a swarm card)\n"
        "  - get     : get one sub-agent by id\n"
        "  - edit    : edit a sub-agent's system_prompt / name / role / svg_logo\n"
        "  - delete  : delete a sub-agent\n"
        "  - enable  : enable a disabled sub-agent\n"
        "  - disable : disable a sub-agent (saves compute; skipped during delegation)\n"
        "  - delegate: delegate a task to a sub-agent\n\n"
        "When delegating, the sub-agent runs with its own system_prompt + the "
        "shared model config, and has access to all tools EXCEPT orchestration. "
        "Sub-agents can be specialized: backend developer, frontend developer, "
        "tester, researcher, planner, etc. Give each a clear role + system prompt."
    )

    params: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["create", "list", "get", "edit", "delete",
                         "enable", "disable", "delegate"],
                "description": "Operation to perform.",
            },
            "agent_id": {
                "type": "string",
                "description": "Agent id (for get/edit/delete/enable/disable/delegate). Auto-generated on create if omitted.",
            },
            "name": {
                "type": "string",
                "description": "create/edit: display name of the agent.",
            },
            "role": {
                "type": "string",
                "description": "create/edit: short job title (e.g. 'Backend Developer').",
            },
            "system_prompt": {
                "type": "string",
                "description": "create/edit: the system prompt the sub-agent uses.",
            },
            "svg_logo": {
                "type": "string",
                "description": "create/edit: inline SVG string the orchestrator generates for this agent. Should reflect the agent's job.",
            },
            "task": {
                "type": "string",
                "description": "delegate: the task description to send to the sub-agent.",
            },
        },
        "required": ["action"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}
        self.workspace = self.config.get("workspace") if isinstance(self.config, dict) else None

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
            logger.error(f"[OrchestrationTool] {action} failed: {e}")
            return ToolResult.fail(f"Orchestration operation failed: {e}")

    # ── actions ───────────────────────────────────────────────────────────

    def _action_create(self, p: dict) -> Dict[str, Any]:
        name = (p.get("name") or "").strip()
        if not name:
            raise ValueError("name is required for create")
        role = (p.get("role") or "").strip()
        system_prompt = (p.get("system_prompt") or "").strip()
        if not system_prompt:
            raise ValueError("system_prompt is required for create")
        svg_logo = (p.get("svg_logo") or "").strip()
        agent_id = (p.get("agent_id") or "").strip() or _slugify(name)
        if not re.fullmatch(r"[a-zA-Z0-9_\-]+", agent_id):
            raise ValueError(f"Invalid agent_id: {agent_id!r}")

        idx = _load_index(self.workspace)
        if agent_id in idx:
            raise ValueError(f"An agent with id '{agent_id}' already exists")

        now = _now_iso()
        data = {
            "id": agent_id,
            "name": name,
            "role": role,
            "system_prompt": system_prompt,
            "svg_logo": svg_logo,
            "enabled": True,
            "created_at": now,
            "updated_at": now,
        }
        _save_agent(self.workspace, data)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        return _public_view(data)

    def _action_list(self, p: dict) -> Dict[str, Any]:
        idx = _load_index(self.workspace)
        return _public_swarm_view(idx)

    def _action_get(self, p: dict) -> Dict[str, Any]:
        agent_id = (p.get("agent_id") or "").strip()
        if not agent_id:
            raise ValueError("agent_id is required for get")
        data = _load_agent(self.workspace, agent_id)
        if data is None:
            raise FileNotFoundError(f"Agent '{agent_id}' not found")
        return _public_view(data)

    def _action_edit(self, p: dict) -> Dict[str, Any]:
        agent_id = (p.get("agent_id") or "").strip()
        if not agent_id:
            raise ValueError("agent_id is required for edit")
        data = _load_agent(self.workspace, agent_id)
        if data is None:
            raise FileNotFoundError(f"Agent '{agent_id}' not found")

        changed = False
        if "name" in p and p["name"]:
            data["name"] = str(p["name"]).strip()
            changed = True
        if "role" in p and p["role"]:
            data["role"] = str(p["role"]).strip()
            changed = True
        if "system_prompt" in p and p["system_prompt"]:
            data["system_prompt"] = str(p["system_prompt"]).strip()
            changed = True
        if "svg_logo" in p:
            data["svg_logo"] = str(p.get("svg_logo") or "").strip()
            changed = True
        if not changed:
            raise ValueError("No editable fields provided (name, role, system_prompt, svg_logo)")

        data["updated_at"] = _now_iso()
        _save_agent(self.workspace, data)
        idx = _load_index(self.workspace)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        return _public_view(data)

    def _action_delete(self, p: dict) -> Dict[str, Any]:
        agent_id = (p.get("agent_id") or "").strip()
        if not agent_id:
            raise ValueError("agent_id is required for delete")
        path = _agent_path(self.workspace, agent_id)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Agent '{agent_id}' not found")
        os.remove(path)
        idx = _load_index(self.workspace)
        if agent_id in idx:
            del idx[agent_id]
            _save_index(self.workspace, idx)
        return {"component": "agent-swarm", "deleted": agent_id,
                "orchestrator": {"id": "orchestrator", "name": "Orchestrator",
                                  "svg_logo": _orchestrator_logo()},
                "agents": [{"id": k, "name": v.get("name", k), "role": v.get("role", ""),
                            "enabled": v.get("enabled", True), "svg_logo": v.get("svg_logo", "")}
                           for k, v in idx.items()],
                "count": len(idx)}

    def _action_enable(self, p: dict) -> Dict[str, Any]:
        return self._set_enabled(p, True)

    def _action_disable(self, p: dict) -> Dict[str, Any]:
        return self._set_enabled(p, False)

    def _set_enabled(self, p: dict, enabled: bool) -> Dict[str, Any]:
        agent_id = (p.get("agent_id") or "").strip()
        if not agent_id:
            raise ValueError("agent_id is required")
        data = _load_agent(self.workspace, agent_id)
        if data is None:
            raise FileNotFoundError(f"Agent '{agent_id}' not found")
        data["enabled"] = enabled
        data["updated_at"] = _now_iso()
        _save_agent(self.workspace, data)
        idx = _load_index(self.workspace)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        return _public_view(data)

    def _action_delegate(self, p: dict) -> Dict[str, Any]:
        """Record a delegation. The actual sub-agent invocation is handled by
        the agent runner (see agent/orchestration/runner.py) which reads
        pending delegations and runs the sub-agent with its system prompt.

        For now this returns a confirmation card; the runner hooks are
        added in a separate module.
        """
        agent_id = (p.get("agent_id") or "").strip()
        task = (p.get("task") or "").strip()
        if not agent_id:
            raise ValueError("agent_id is required for delegate")
        if not task:
            raise ValueError("task is required for delegate")

        data = _load_agent(self.workspace, agent_id)
        if data is None:
            raise FileNotFoundError(f"Agent '{agent_id}' not found")
        if not data.get("enabled", True):
            raise ValueError(f"Agent '{agent_id}' is disabled — enable it first")

        # Record the delegation in the agent's record (for audit).
        delegations = data.setdefault("delegations", [])
        delegations.append({
            "task": task,
            "delegated_at": _now_iso(),
            "status": "pending",
        })
        data["updated_at"] = _now_iso()
        _save_agent(self.workspace, data)

        return {
            "component": "agent-card",
            "id": data["id"],
            "name": data.get("name", data["id"]),
            "role": data.get("role", ""),
            "svg_logo": data.get("svg_logo", ""),
            "delegation": {
                "task": task,
                "status": "pending",
                "note": ("Delegation recorded. The sub-agent will run with its "
                         "system_prompt + the shared model config when the "
                         "orchestration runner picks it up."),
            },
        }
