"""
Ask tool — lets the AI ask the user a question and wait for the answer.

When the AI calls this tool with a question, the tool:
  1. Emits a `user_question` event via on_event (picked up by the SSE stream
     and rendered as an interactive UI card by the frontend).
  2. Blocks (with a timeout) until the user submits an answer via the
     /api/answer endpoint.
  3. Returns the user's answer as the tool result, so the AI can continue
     its turn with the new information.

Question types:
  - "single_select": user picks exactly one option from `options`
  - "multi_select":  user picks any subset of `options`
  - "text":          user types a free-form answer
  - "confirm":       user clicks Yes or No (special case of single_select)

The AI decides which type to use based on context. For example:
  - "Would you like the report in PDF or Markdown?" → single_select
  - "Which sections should I include?" → multi_select
  - "What's your API key?" → text
  - "Should I proceed?" → confirm

IMPORTANT UX RULES:
  - Ask ONE question at a time. Don't batch multiple questions in a single
    tool call — call the tool once per question, get the answer, then ask
    the next one. This keeps the UI focused and lets the user see each
    question appear one by one.
  - The interactive question card appears ONLY after the AI's streaming
    text response completes. Don't try to show it mid-stream.
"""

import json
import os
import threading
import time
import uuid
from typing import Any, Dict, List, Optional

from agent.tools.base_tool import BaseTool, ToolResult
from common.log import logger


# In-memory store of pending questions, keyed by question_id.
# Each entry: { "event": threading.Event(), "answer": None, "question": {...} }
# The /api/answer endpoint sets the answer and triggers the event so the
# blocked tool call wakes up and returns to the agent.
_pending_questions: Dict[str, dict] = {}
_pending_lock = threading.Lock()

# Default timeout for an unanswered question (10 minutes).
# After this the tool returns with status="timeout" so the agent can decide
# what to do (e.g. proceed with a default, or re-ask).
DEFAULT_TIMEOUT_SECONDS = 600


class AskTool(BaseTool):
    """Tool that lets the AI ask the user a question."""

    name: str = "ask"
    description: str = (
        "Ask the user a question and wait for their answer. Use this when "
        "you need information or a decision from the user before proceeding.\n\n"
        "IMPORTANT: Ask ONE question per tool call. Don't batch multiple "
        "questions — call the tool once, get the answer, then ask the next.\n\n"
        "Question types:\n"
        "- single_select: user picks one option from `options` (e.g. PDF or Markdown)\n"
        "- multi_select:  user picks any subset of `options` (e.g. which sections)\n"
        "- text:          user types a free-form answer (e.g. API key)\n"
        "- confirm:       user clicks Yes or No (shortcut for single_select with [Yes, No])\n\n"
        "The question appears as an interactive UI card AFTER your text response "
        "finishes streaming, so the user can read your context first."
    )
    params: dict = {
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "The question to ask the user.",
            },
            "question_type": {
                "type": "string",
                "enum": ["single_select", "multi_select", "text", "confirm"],
                "description": "Type of question UI to show.",
            },
            "options": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Options for single_select / multi_select. Ignored for text. Defaults to [Yes, No] for confirm.",
            },
            "placeholder": {
                "type": "string",
                "description": "Placeholder text for text input (optional).",
            },
            "default": {
                "type": "string",
                "description": "Default answer if user skips (optional).",
            },
            "timeout_seconds": {
                "type": "number",
                "description": "How long to wait (default 600s = 10min). After timeout, returns with answer=null.",
            },
        },
        "required": ["question", "question_type"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}

    def execute(self, params: dict) -> ToolResult:
        question_text = str(params.get("question", "")).strip()
        qtype = str(params.get("question_type", "text")).strip()
        options = params.get("options") or []
        placeholder = str(params.get("placeholder", "")).strip()
        default = str(params.get("default", "")).strip()
        timeout = float(params.get("timeout_seconds", DEFAULT_TIMEOUT_SECONDS) or DEFAULT_TIMEOUT_SECONDS)

        if not question_text:
            return ToolResult.fail("Error: question is required")

        # Normalise options
        if qtype == "confirm":
            options = options or ["Yes", "No"]
        elif qtype in ("single_select", "multi_select"):
            if not options or len(options) < 2:
                return ToolResult.fail(
                    f"Error: {qtype} requires at least 2 options"
                )
            options = [str(o) for o in options]
        else:  # text
            options = []

        question_id = str(uuid.uuid4())[:12]

        # Build the question payload that gets emitted via on_event and
        # rendered as a UI card by the frontend.
        payload = {
            "question_id": question_id,
            "question": question_text,
            "type": qtype,
            "options": options,
            "placeholder": placeholder,
            "default": default,
            "created_at": time.time(),
            "status": "pending",
        }

        # Register the pending question so /api/answer can find it.
        event = threading.Event()
        with _pending_lock:
            _pending_questions[question_id] = {
                "event": event,
                "answer": None,
                "question": payload,
            }

        # Emit the question event so the SSE stream picks it up and the
        # frontend renders the interactive UI card.
        # NOTE: the on_event callback is set by the agent bridge, which
        # passes it through to the tool via the executor.
        on_event = getattr(self, "on_event", None) or getattr(self, "progress_callback", None)
        if on_event:
            try:
                on_event({
                    "type": "user_question",
                    "data": payload,
                })
            except Exception as e:
                logger.warning(f"[AskTool] on_event emit failed: {e}")

        # Block until the user answers (or timeout).
        logger.info(f"[AskTool] waiting for answer to question {question_id} (timeout={timeout}s)")
        answered = event.wait(timeout=timeout)

        with _pending_lock:
            entry = _pending_questions.pop(question_id, None)

        if not answered or not entry:
            return ToolResult.success({
                "status": "timeout",
                "answer": None,
                "question_id": question_id,
                "message": "User did not answer within the timeout. Proceed with a sensible default or re-ask.",
            })

        answer = entry.get("answer")
        return ToolResult.success({
            "status": "answered",
            "answer": answer,
            "question_id": question_id,
            "question": question_text,
        })


def submit_answer(question_id: str, answer: Any) -> bool:
    """Called by the /api/answer HTTP endpoint to deliver the user's answer.

    Returns True if the question was found and answered, False otherwise.
    """
    with _pending_lock:
        entry = _pending_questions.get(question_id)
        if not entry:
            return False
        entry["answer"] = answer
        entry["event"].set()
    logger.info(f"[AskTool] answer received for question {question_id}")
    return True


def list_pending_questions() -> List[dict]:
    """Return all currently-pending questions (for debugging / admin UI)."""
    with _pending_lock:
        return [v["question"] for v in _pending_questions.values()]
