"""
Counterfactual reasoning tool.

Lets the agent explore "what if X had been different?" scenarios without
committing them to long-term memory. Each invocation produces a structured
analysis card with:

  - observed      : the actual scenario / facts
  - hypothetical  : the counterfactual change being explored
  - branches      : 1..N alternative outcomes, each with plausibility, pros, cons
  - recommendation: the agent's overall synthesis

This tool does NOT call the LLM by itself — it accepts the agent's structured
analysis as parameters and persists it as a JSON artifact under
<workspace>/counterfactuals/<id>.json so the user can revisit the analysis
later. The returned dict is rendered as a `counterfactual` card in the chat UI.
"""

import json
import os
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from agent.tools.base_tool import BaseTool, ToolResult
from common.log import logger


_VALID_PLAUSIBILITY = {"low", "medium", "high"}


def _safe_workspace(workspace: Optional[str]) -> str:
    if workspace and isinstance(workspace, str):
        return os.path.expanduser(workspace)
    return os.path.expanduser("~/onyx")


def _cf_dir(workspace: Optional[str]) -> str:
    d = os.path.join(_safe_workspace(workspace), "counterfactuals")
    os.makedirs(d, exist_ok=True)
    return d


def _cf_path(workspace: Optional[str], cf_id: str) -> str:
    if not re.fullmatch(r"[a-zA-Z0-9_\-]+", cf_id):
        raise ValueError(f"Invalid analysis id: {cf_id!r}")
    return os.path.join(_cf_dir(workspace), f"{cf_id}.json")


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _public_view(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "component": "counterfactual",
        "id": data["id"],
        "title": data.get("title", ""),
        "observed": data.get("observed", ""),
        "hypothetical": data.get("hypothetical", ""),
        "branches": data.get("branches", []),
        "recommendation": data.get("recommendation", ""),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


class CounterfactualTool(BaseTool):
    """
    Explore "what if X had been different?" scenarios.

    Actions:
      - analyze : create a new counterfactual analysis
      - list    : list saved analyses
      - get     : retrieve one analysis by id
      - delete  : delete one analysis by id
    """

    name: str = "counterfactual"
    description: str = (
        "Counterfactual reasoning: explore 'what if X had been different?' scenarios.\n\n"
        "Actions:\n"
        "  - analyze  : create a new analysis (title, observed, hypothetical, branches[], recommendation)\n"
        "  - list     : list saved analyses\n"
        "  - get      : retrieve one analysis by id\n"
        "  - delete   : delete one analysis by id\n\n"
        "Each branch should have: outcome, plausibility (low|medium|high), pros (string or array), cons (string or array).\n"
        "Returned JSON is rendered as an interactive counterfactual card in the chat UI."
    )

    params: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["analyze", "list", "get", "delete"],
                "description": "Operation to perform.",
            },
            "id": {
                "type": "string",
                "description": "Analysis id (for get/delete). Auto-generated on analyze if omitted.",
            },
            "title": {
                "type": "string",
                "description": "Short title for the analysis (e.g. 'What if I had taken the job offer?').",
            },
            "observed": {
                "type": "string",
                "description": "What actually happened / the factual baseline.",
            },
            "hypothetical": {
                "type": "string",
                "description": "The counterfactual change being explored (e.g. 'I had taken the job offer').",
            },
            "branches": {
                "type": "array",
                "description": "1..N alternative outcomes of the hypothetical change.",
                "items": {
                    "type": "object",
                    "properties": {
                        "outcome": {"type": "string"},
                        "plausibility": {"type": "string", "enum": ["low", "medium", "high"]},
                        "pros": {"type": "string"},
                        "cons": {"type": "string"},
                    },
                },
            },
            "recommendation": {
                "type": "string",
                "description": "Overall synthesis / what the agent recommends in light of the analysis.",
            },
        },
        "required": ["action"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}
        self.workspace = self.config.get("workspace") if isinstance(self.config, dict) else None

    # ── public entry ──────────────────────────────────────────────────────

    def execute(self, params: dict) -> ToolResult:
        action = params.get("action")
        try:
            if action == "analyze":
                return ToolResult.success(self._action_analyze(params))
            if action == "list":
                return ToolResult.success(self._action_list(params))
            if action == "get":
                return ToolResult.success(self._action_get(params))
            if action == "delete":
                return ToolResult.success(self._action_delete(params))
            return ToolResult.fail(f"Unknown action: {action}")
        except FileNotFoundError as e:
            return ToolResult.fail(str(e))
        except ValueError as e:
            return ToolResult.fail(str(e))
        except Exception as e:
            logger.error(f"[CounterfactualTool] {action} failed: {e}")
            return ToolResult.fail(f"Counterfactual operation failed: {e}")

    # ── actions ───────────────────────────────────────────────────────────

    def _action_analyze(self, p: dict) -> Dict[str, Any]:
        observed = (p.get("observed") or "").strip()
        hypothetical = (p.get("hypothetical") or "").strip()
        if not observed or not hypothetical:
            raise ValueError("observed and hypothetical are required for analyze")

        title = (p.get("title") or "").strip() or f"Counterfactual: {hypothetical[:80]}"
        raw_branches = p.get("branches") or []
        if not isinstance(raw_branches, list) or not raw_branches:
            raise ValueError("at least one branch is required")

        branches: List[Dict[str, Any]] = []
        for i, b in enumerate(raw_branches):
            if not isinstance(b, dict):
                continue
            outcome = (b.get("outcome") or "").strip()
            if not outcome:
                raise ValueError(f"branch[{i}].outcome is required")
            plausibility = (b.get("plausibility") or "medium").strip().lower()
            if plausibility not in _VALID_PLAUSIBILITY:
                raise ValueError(
                    f"branch[{i}].plausibility must be one of {sorted(_VALID_PLAUSIBILITY)}"
                )
            pros = b.get("pros")
            cons = b.get("cons")
            # Normalize pros/cons to always be arrays of strings.
            pros_list = _normalize_pros_cons(pros)
            cons_list = _normalize_pros_cons(cons)
            branches.append({
                "id": uuid.uuid4().hex[:8],
                "outcome": outcome,
                "plausibility": plausibility,
                "pros": pros_list,
                "cons": cons_list,
            })

        cf_id = (p.get("id") or "").strip() or uuid.uuid4().hex[:10]
        if not re.fullmatch(r"[a-zA-Z0-9_\-]+", cf_id):
            raise ValueError(f"Invalid id: {cf_id!r}")

        path = _cf_path(self.workspace, cf_id)
        if os.path.exists(path):
            raise ValueError(f"An analysis with id '{cf_id}' already exists")

        now = _now_iso()
        data = {
            "id": cf_id,
            "title": title,
            "observed": observed,
            "hypothetical": hypothetical,
            "branches": branches,
            "recommendation": (p.get("recommendation") or "").strip(),
            "created_at": now,
            "updated_at": now,
        }
        tmp = f"{path}.tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, path)
        return _public_view(data)

    def _action_list(self, p: dict) -> Dict[str, Any]:
        d = _cf_dir(self.workspace)
        out = []
        for name in sorted(os.listdir(d)):
            if not name.endswith(".json") or name.startswith("_"):
                continue
            try:
                with open(os.path.join(d, name), "r", encoding="utf-8") as f:
                    data = json.load(f)
                out.append({
                    "id": data.get("id", name[:-5]),
                    "title": data.get("title", ""),
                    "hypothetical": data.get("hypothetical", ""),
                    "branch_count": len(data.get("branches", [])),
                    "updated_at": data.get("updated_at"),
                })
            except Exception:
                continue
        return {"component": "counterfactual-index", "analyses": out, "count": len(out)}

    def _action_get(self, p: dict) -> Dict[str, Any]:
        cf_id = (p.get("id") or "").strip()
        if not cf_id:
            raise ValueError("id is required for get")
        path = _cf_path(self.workspace, cf_id)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Analysis '{cf_id}' not found")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return _public_view(data)

    def _action_delete(self, p: dict) -> Dict[str, Any]:
        cf_id = (p.get("id") or "").strip()
        if not cf_id:
            raise ValueError("id is required for delete")
        path = _cf_path(self.workspace, cf_id)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Analysis '{cf_id}' not found")
        os.remove(path)
        return {"component": "counterfactual-index", "deleted": cf_id}


def _normalize_pros_cons(val: Any) -> List[str]:
    """Accept string, list of strings, or None; return a clean list of strings."""
    if val is None:
        return []
    if isinstance(val, str):
        # Split on newline OR comma, drop empties.
        parts = [s.strip() for s in re.split(r"[\n,]", val) if s.strip()]
        return parts
    if isinstance(val, list):
        return [str(s).strip() for s in val if str(s).strip()]
    return [str(val).strip()]
