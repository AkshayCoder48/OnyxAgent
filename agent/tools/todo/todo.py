"""
Todo tool — JSON-backed task lists with full CRUD.

The agent can:
  - create_list : make a new named todo list
  - add         : add an item to an existing list
  - list        : show a list (or all lists)
  - complete    : mark an item done
  - uncomplete  : mark an item not-done
  - edit        : change an item's title / notes / priority / due
  - delete      : delete an item OR an entire list
  - reorder     : move an item to a new position

Storage:
  One JSON file per list, under <workspace>/todos/<list_id>.json
  An index file <workspace>/todos/_index.json tracks list metadata so the
  'list' action (without a list_id) is fast.

The tool returns a JSON-serializable dict that the OnyxAgent card system
picks up and renders as an interactive `todo-list` card in the chat UI.
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

_VALID_PRIORITY = {"low", "medium", "high", "urgent"}
_SAFE_NAME_RE = re.compile(r"[^a-zA-Z0-9_\-]+")


def _slugify(name: str, fallback: str = "list") -> str:
    """Make a filesystem-safe list id from a human name."""
    if not name:
        return fallback
    slug = _SAFE_NAME_RE.sub("-", name.strip().lower()).strip("-")
    return slug or fallback


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _safe_workspace(workspace: Optional[str]) -> str:
    """Resolve the workspace root, defaulting to ~/onyx."""
    if workspace and isinstance(workspace, str):
        return os.path.expanduser(workspace)
    return os.path.expanduser("~/onyx")


def _todos_dir(workspace: Optional[str]) -> str:
    d = os.path.join(_safe_workspace(workspace), "todos")
    os.makedirs(d, exist_ok=True)
    return d


def _index_path(workspace: Optional[str]) -> str:
    return os.path.join(_todos_dir(workspace), "_index.json")


def _list_path(workspace: Optional[str], list_id: str) -> str:
    # Defense against path traversal — list_id must be slug-shaped.
    if not re.fullmatch(r"[a-zA-Z0-9_\-]+", list_id):
        raise ValueError(f"Invalid list_id: {list_id!r}")
    return os.path.join(_todos_dir(workspace), f"{list_id}.json")


# ─── index management ────────────────────────────────────────────────────

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


# ─── list management ──────────────────────────────────────────────────────

def _load_list(workspace: Optional[str], list_id: str) -> Optional[Dict[str, Any]]:
    p = _list_path(workspace, list_id)
    if not os.path.exists(p):
        return None
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"[TodoTool] failed to read {p}: {e}")
        return None


def _save_list(workspace: Optional[str], data: Dict[str, Any]) -> None:
    p = _list_path(workspace, data["id"])
    tmp = f"{p}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, p)


def _public_list_view(data: Dict[str, Any]) -> Dict[str, Any]:
    """Trim internal fields and compute summary stats for return to agent/UI."""
    items = data.get("items", [])
    total = len(items)
    done = sum(1 for it in items if it.get("completed"))
    pending = total - done
    return {
        "component": "todo-list",
        "id": data["id"],
        "title": data.get("title") or data["id"],
        "description": data.get("description", ""),
        "items": items,
        "stats": {"total": total, "done": done, "pending": pending},
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


def _public_index_view(idx: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    lists = []
    for lid, meta in idx.items():
        lists.append({
            "id": lid,
            "title": meta.get("title", lid),
            "description": meta.get("description", ""),
            "stats": meta.get("stats", {"total": 0, "done": 0, "pending": 0}),
            "updated_at": meta.get("updated_at"),
        })
    return {
        "component": "todo-index",
        "lists": lists,
        "count": len(lists),
    }


def _refresh_index_entry(idx: Dict[str, Dict[str, Any]], data: Dict[str, Any]) -> None:
    items = data.get("items", [])
    total = len(items)
    done = sum(1 for it in items if it.get("completed"))
    idx[data["id"]] = {
        "title": data.get("title", data["id"]),
        "description": data.get("description", ""),
        "stats": {"total": total, "done": done, "pending": total - done},
        "updated_at": data.get("updated_at"),
    }


# ─── the tool ─────────────────────────────────────────────────────────────

class TodoTool(BaseTool):
    """
    Manage todo lists as JSON files in the workspace.

    Every action returns a JSON-serializable dict (component: 'todo-list' or
    'todo-index') that the chat UI renders as an interactive card. The agent
    can therefore create, mutate, and display todo lists through one tool.
    """

    name: str = "todo"
    description: str = (
        "Create and manage JSON-backed todo lists. "
        "Actions:\n"
        "  - create_list : make a new list (title, description optional)\n"
        "  - add         : add an item to a list (list_id, title, notes?, priority?, due?)\n"
        "  - list        : show one list (list_id) or all lists (no list_id)\n"
        "  - complete    : mark an item done (list_id, item_id)\n"
        "  - uncomplete  : mark an item not-done (list_id, item_id)\n"
        "  - edit        : change an item's title/notes/priority/due (list_id, item_id, fields...)\n"
        "  - delete      : delete an item (list_id, item_id) or a whole list (list_id, delete_list=true)\n"
        "  - reorder     : move item to a new 1-based position (list_id, item_id, position)\n\n"
        "Returned JSON is rendered as an interactive card in the chat UI."
    )

    params: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": [
                    "create_list", "add", "list", "complete",
                    "uncomplete", "edit", "delete", "reorder",
                ],
                "description": "Operation to perform.",
            },
            "list_id": {
                "type": "string",
                "description": "Slug-style list identifier. If omitted on 'create_list', one is derived from the title.",
            },
            "title": {
                "type": "string",
                "description": "create_list: list title. add: item title. edit: new item title.",
            },
            "description": {
                "type": "string",
                "description": "create_list: list description.",
            },
            "item_id": {
                "type": "string",
                "description": "ID of an existing item (for add-to-existing-list, complete, uncomplete, edit, delete, reorder).",
            },
            "notes": {
                "type": "string",
                "description": "add / edit: longer notes attached to an item.",
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high", "urgent"],
                "description": "add / edit: priority level.",
            },
            "due": {
                "type": "string",
                "description": "add / edit: due date in ISO format (YYYY-MM-DD or full ISO).",
            },
            "position": {
                "type": "integer",
                "description": "reorder: 1-based new position for the item.",
            },
            "delete_list": {
                "type": "boolean",
                "description": "delete: if true, delete the entire list (not just an item).",
            },
        },
        "required": ["action"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}
        # Workspace root can be injected via config; falls back to ~/onyx.
        self.workspace = self.config.get("workspace") if isinstance(self.config, dict) else None

    # ── public entry ──────────────────────────────────────────────────────

    def execute(self, params: dict) -> ToolResult:
        action = params.get("action")
        try:
            handler = getattr(self, f"_action_{action}", None)
            if handler is None:
                return ToolResult.fail(f"Unknown action: {action}")
            payload = handler(params)
            return ToolResult.success(payload)
        except FileNotFoundError as e:
            return ToolResult.fail(str(e))
        except ValueError as e:
            return ToolResult.fail(str(e))
        except Exception as e:
            logger.error(f"[TodoTool] {action} failed: {e}")
            return ToolResult.fail(f"Todo operation failed: {e}")

    # ── actions ───────────────────────────────────────────────────────────

    def _action_create_list(self, p: dict) -> Dict[str, Any]:
        title = (p.get("title") or "").strip()
        if not title:
            raise ValueError("title is required for create_list")
        description = (p.get("description") or "").strip()
        list_id = (p.get("list_id") or "").strip() or _slugify(title)
        if not re.fullmatch(r"[a-zA-Z0-9_\-]+", list_id):
            raise ValueError(f"Invalid list_id: {list_id!r}")

        idx = _load_index(self.workspace)
        if list_id in idx:
            raise ValueError(f"A todo list with id '{list_id}' already exists")

        now = _now_iso()
        data = {
            "id": list_id,
            "title": title,
            "description": description,
            "items": [],
            "created_at": now,
            "updated_at": now,
        }
        _save_list(self.workspace, data)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        return _public_list_view(data)

    def _action_add(self, p: dict) -> Dict[str, Any]:
        list_id = (p.get("list_id") or "").strip()
        if not list_id:
            raise ValueError("list_id is required for add")
        item_title = (p.get("title") or "").strip()
        if not item_title:
            raise ValueError("title is required for add (the item text)")
        priority = (p.get("priority") or "medium").strip().lower()
        if priority not in _VALID_PRIORITY:
            raise ValueError(f"priority must be one of {sorted(_VALID_PRIORITY)}")

        data = _load_list(self.workspace, list_id)
        if data is None:
            raise FileNotFoundError(f"Todo list '{list_id}' not found")

        item = {
            "id": uuid.uuid4().hex[:8],
            "title": item_title,
            "notes": (p.get("notes") or "").strip(),
            "priority": priority,
            "due": (p.get("due") or "").strip(),
            "completed": False,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        data.setdefault("items", []).append(item)
        data["updated_at"] = _now_iso()
        _save_list(self.workspace, data)

        idx = _load_index(self.workspace)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        return _public_list_view(data)

    def _action_list(self, p: dict) -> Dict[str, Any]:
        list_id = (p.get("list_id") or "").strip()
        if not list_id:
            idx = _load_index(self.workspace)
            return _public_index_view(idx)
        data = _load_list(self.workspace, list_id)
        if data is None:
            raise FileNotFoundError(f"Todo list '{list_id}' not found")
        return _public_list_view(data)

    def _action_complete(self, p: dict) -> Dict[str, Any]:
        return self._set_completed(p, True)

    def _action_uncomplete(self, p: dict) -> Dict[str, Any]:
        return self._set_completed(p, False)

    def _set_completed(self, p: dict, completed: bool) -> Dict[str, Any]:
        list_id = (p.get("list_id") or "").strip()
        item_id = (p.get("item_id") or "").strip()
        if not list_id or not item_id:
            raise ValueError("list_id and item_id are required")
        data = _load_list(self.workspace, list_id)
        if data is None:
            raise FileNotFoundError(f"Todo list '{list_id}' not found")
        for it in data.get("items", []):
            if it.get("id") == item_id:
                it["completed"] = completed
                it["updated_at"] = _now_iso()
                data["updated_at"] = _now_iso()
                _save_list(self.workspace, data)
                idx = _load_index(self.workspace)
                _refresh_index_entry(idx, data)
                _save_index(self.workspace, idx)
                return _public_list_view(data)
        raise FileNotFoundError(f"Item '{item_id}' not found in list '{list_id}'")

    def _action_edit(self, p: dict) -> Dict[str, Any]:
        list_id = (p.get("list_id") or "").strip()
        item_id = (p.get("item_id") or "").strip()
        if not list_id or not item_id:
            raise ValueError("list_id and item_id are required for edit")
        data = _load_list(self.workspace, list_id)
        if data is None:
            raise FileNotFoundError(f"Todo list '{list_id}' not found")

        for it in data.get("items", []):
            if it.get("id") == item_id:
                if "title" in p and p["title"]:
                    it["title"] = str(p["title"]).strip()
                if "notes" in p:
                    it["notes"] = str(p.get("notes") or "").strip()
                if "priority" in p and p["priority"]:
                    pri = str(p["priority"]).strip().lower()
                    if pri not in _VALID_PRIORITY:
                        raise ValueError(f"priority must be one of {sorted(_VALID_PRIORITY)}")
                    it["priority"] = pri
                if "due" in p:
                    it["due"] = str(p.get("due") or "").strip()
                it["updated_at"] = _now_iso()
                data["updated_at"] = _now_iso()
                _save_list(self.workspace, data)
                idx = _load_index(self.workspace)
                _refresh_index_entry(idx, data)
                _save_index(self.workspace, idx)
                return _public_list_view(data)
        raise FileNotFoundError(f"Item '{item_id}' not found in list '{list_id}'")

    def _action_delete(self, p: dict) -> Dict[str, Any]:
        list_id = (p.get("list_id") or "").strip()
        if not list_id:
            raise ValueError("list_id is required for delete")
        delete_list = bool(p.get("delete_list"))

        idx = _load_index(self.workspace)

        if delete_list:
            path = _list_path(self.workspace, list_id)
            if not os.path.exists(path):
                raise FileNotFoundError(f"Todo list '{list_id}' not found")
            os.remove(path)
            if list_id in idx:
                del idx[list_id]
                _save_index(self.workspace, idx)
            return {"component": "todo-index", "deleted_list": list_id,
                    "lists": [v for k, v in idx.items()]}

        item_id = (p.get("item_id") or "").strip()
        if not item_id:
            raise ValueError("item_id is required (or set delete_list=true to delete the whole list)")
        data = _load_list(self.workspace, list_id)
        if data is None:
            raise FileNotFoundError(f"Todo list '{list_id}' not found")
        before = len(data.get("items", []))
        data["items"] = [it for it in data.get("items", []) if it.get("id") != item_id]
        if len(data["items"]) == before:
            raise FileNotFoundError(f"Item '{item_id}' not found in list '{list_id}'")
        data["updated_at"] = _now_iso()
        _save_list(self.workspace, data)
        _refresh_index_entry(idx, data)
        _save_index(self.workspace, idx)
        return _public_list_view(data)

    def _action_reorder(self, p: dict) -> Dict[str, Any]:
        list_id = (p.get("list_id") or "").strip()
        item_id = (p.get("item_id") or "").strip()
        position = p.get("position")
        if not list_id or not item_id or position is None:
            raise ValueError("list_id, item_id and position are required for reorder")
        try:
            position = int(position)
        except (TypeError, ValueError):
            raise ValueError("position must be an integer")
        if position < 1:
            raise ValueError("position must be 1-based (>=1)")

        data = _load_list(self.workspace, list_id)
        if data is None:
            raise FileNotFoundError(f"Todo list '{list_id}' not found")
        items = data.get("items", [])
        idx = next((i for i, it in enumerate(items) if it.get("id") == item_id), -1)
        if idx == -1:
            raise FileNotFoundError(f"Item '{item_id}' not found in list '{list_id}'")
        item = items.pop(idx)
        new_pos = min(max(position - 1, 0), len(items))
        items.insert(new_pos, item)
        data["items"] = items
        data["updated_at"] = _now_iso()
        _save_list(self.workspace, data)
        idx_meta = _load_index(self.workspace)
        _refresh_index_entry(idx_meta, data)
        _save_index(self.workspace, idx_meta)
        return _public_list_view(data)
