"""
Scheduler tool for creating and managing scheduled tasks.

All user-facing strings are in English.
All user-supplied times are interpreted in the configured timezone
(see tz_utils.get_configured_tz) — this fixes the bug where a user in
IST setting "7am" had it stored as 7am UTC.
"""

import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from croniter import croniter

from agent.tools.base_tool import BaseTool, ToolResult
from bridge.context import Context, ContextType
from bridge.reply import Reply, ReplyType
from common.log import logger
from agent.tools.scheduler.tz_utils import (
    get_configured_tz,
    now_in_tz,
    parse_user_datetime,
    to_naive_utc,
    from_naive_utc,
    format_display,
)


class SchedulerTool(BaseTool):
    """
    Tool for managing scheduled tasks (reminders, recurring tasks, etc.)
    """

    name: str = "scheduler"
    description: str = (
        "Create, query, and manage scheduled tasks (reminders, recurring jobs, etc.).\n\n"
        "IMPORTANT: Only use this tool when the user wants time-based / delayed / "
        "recurring execution (e.g. 'remind me at', 'every day at', 'in 5 minutes', "
        "'daily report', 'X times a day'). Do NOT use it for immediate actions.\n\n"
        "Usage:\n"
        "- create: action='create', name='Task name', message/ai_task='content', "
        "schedule_type='once|interval|cron|frequency_per_day', schedule_value='...'\n"
        "- list:   action='list'\n"
        "- get:    action='get', task_id='ID'\n"
        "- edit:   action='edit', task_id='ID', name/message/ai_task/schedule_type/schedule_value (any subset)\n"
        "- delete: action='delete', task_id='ID'\n"
        "- enable/disable: action='enable' or 'disable', task_id='ID'\n\n"
        "Schedule types:\n"
        "- once: one-time task. Value can be relative ('+5s','+10m','+1h','+1d'), "
        "time-only ('19:00' = today at 19:00 in user's tz), or full ISO datetime.\n"
        "- interval: fixed interval in seconds. E.g., '3600' = every hour.\n"
        "- cron: standard cron expression. E.g., '0 9 * * *' = daily at 9am (in user's tz).\n"
        "- frequency_per_day: run N times per day, evenly spaced. E.g., '3' = every 8 hours.\n\n"
        "All times are interpreted in the user's configured timezone (auto-detected "
        "from IP, or set manually via the 'timezone' config key). The system clock is "
        "NOT used for interpreting user-supplied times — this prevents the 7am-IST-"
        "becomes-7am-UTC bug."
    )
    params: dict = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["create", "list", "get", "edit", "delete", "enable", "disable"],
                "description": "Action: create, list, get, edit, delete, enable, or disable",
            },
            "task_id": {
                "type": "string",
                "description": "Task ID (for get/edit/delete/enable/disable)",
            },
            "name": {
                "type": "string",
                "description": "Task name (for create / edit)",
            },
            "message": {
                "type": "string",
                "description": "Fixed message content (use this OR ai_task)",
            },
            "ai_task": {
                "type": "string",
                "description": "AI task description (use this OR message). The agent will run this prompt at the scheduled time.",
            },
            "schedule_type": {
                "type": "string",
                "enum": ["cron", "interval", "once", "frequency_per_day"],
                "description": "Schedule type (for create/edit): cron, interval, once, or frequency_per_day",
            },
            "schedule_value": {
                "type": "string",
                "description": "Schedule value: cron expr / interval seconds / datetime / 'N times per day'",
            },
        },
        "required": ["action"],
    }

    def __init__(self, config: dict = None):
        super().__init__()
        self.config = config or {}

        # Will be set by agent bridge
        self.task_store = None
        self.current_context = None

    def execute(self, params: dict) -> ToolResult:
        action = params.get("action")
        kwargs = params

        if not self.task_store:
            return ToolResult.fail("Error: scheduler system not initialised")

        try:
            if action == "create":
                result = self._create_task(**kwargs)
                return ToolResult.success(result)
            elif action == "list":
                result = self._list_tasks(**kwargs)
                return ToolResult.success(result)
            elif action == "get":
                result = self._get_task(**kwargs)
                return ToolResult.success(result)
            elif action == "edit":
                result = self._edit_task(**kwargs)
                return ToolResult.success(result)
            elif action == "delete":
                result = self._delete_task(**kwargs)
                return ToolResult.success(result)
            elif action == "enable":
                result = self._enable_task(**kwargs)
                return ToolResult.success(result)
            elif action == "disable":
                result = self._disable_task(**kwargs)
                return ToolResult.success(result)
            else:
                return ToolResult.fail(f"Unknown action: {action}")
        except Exception as e:
            logger.error(f"[SchedulerTool] Error: {e}")
            return ToolResult.fail(f"Operation failed: {e}")

    def _create_task(self, **kwargs) -> str:
        """Create a new scheduled task"""
        name = kwargs.get("name")
        message = kwargs.get("message")
        ai_task = kwargs.get("ai_task")
        schedule_type = kwargs.get("schedule_type")
        schedule_value = kwargs.get("schedule_value")

        if not name:
            return "Error: missing task name (name)"

        if not message and not ai_task:
            return "Error: you must provide either `message` (fixed message) or `ai_task` (AI task description)"
        if message and ai_task:
            return "Error: provide only one of `message` or `ai_task`, not both"

        if not schedule_type:
            return "Error: missing schedule type (schedule_type)"
        if not schedule_value:
            return "Error: missing schedule value (schedule_value)"

        schedule = self._parse_schedule(schedule_type, schedule_value)
        if not schedule:
            return f"Error: invalid schedule — type: {schedule_type}, value: {schedule_value}"

        if not self.current_context:
            return "Error: cannot get current conversation context"

        context = self.current_context

        task_id = str(uuid.uuid4())[:8]

        # Capture the real chat session_id at task creation time so that
        # scheduler can later inject the delivered output into the user's
        # actual conversation.
        notify_session_id = context.get("session_id")

        if message:
            action = {
                "type": "send_message",
                "content": message,
                "receiver": context.get("receiver"),
                "receiver_name": self._get_receiver_name(context),
                "is_group": context.get("isgroup", False),
                "channel_type": self.config.get("channel_type", "unknown"),
                "notify_session_id": notify_session_id,
            }
        else:
            action = {
                "type": "agent_task",
                "task_description": ai_task,
                "receiver": context.get("receiver"),
                "receiver_name": self._get_receiver_name(context),
                "is_group": context.get("isgroup", False),
                "channel_type": self.config.get("channel_type", "unknown"),
                "notify_session_id": notify_session_id,
            }

        msg = context.kwargs.get("msg")
        if msg and hasattr(msg, 'sender_staff_id') and not context.get("isgroup", False):
            action["dingtalk_sender_staff_id"] = msg.sender_staff_id

        task_data = {
            "id": task_id,
            "name": name,
            "enabled": True,
            "created_at": now_in_tz().isoformat(),
            "updated_at": now_in_tz().isoformat(),
            "schedule": schedule,
            "action": action,
            "timezone": str(get_configured_tz()),
        }

        next_run = self._calculate_next_run(task_data)
        if next_run:
            task_data["next_run_at"] = to_naive_utc(next_run).isoformat()

        self.task_store.add_task(task_data)

        schedule_desc = self._format_schedule_description(schedule)
        receiver_desc = task_data["action"]["receiver_name"] or task_data["action"]["receiver"] or "—"

        if message:
            content_desc = f"Message: {message}"
        else:
            content_desc = f"AI task: {ai_task}"

        tz_name = str(get_configured_tz())
        next_run_str = format_display(next_run, "%Y-%m-%d %H:%M %Z") if next_run else "—"

        return (
            f"✅ Scheduled task created\n\n"
            f"Task ID: {task_id}\n"
            f"Name: {name}\n"
            f"Schedule: {schedule_desc}\n"
            f"Timezone: {tz_name}\n"
            f"Receiver: {receiver_desc}\n"
            f"{content_desc}\n"
            f"Next run: {next_run_str}"
        )

    def _edit_task(self, **kwargs) -> str:
        """Edit an existing task — any subset of fields can be updated."""
        task_id = kwargs.get("task_id")
        if not task_id:
            return "Error: missing task_id"

        task = self.task_store.get_task(task_id)
        if not task:
            return f"Error: task '{task_id}' not found"

        updates = {}

        if kwargs.get("name"):
            updates["name"] = kwargs["name"]
        if kwargs.get("message"):
            updates.setdefault("action", dict(task.get("action", {})))
            updates["action"]["type"] = "send_message"
            updates["action"]["content"] = kwargs["message"]
            updates["action"].pop("task_description", None)
        if kwargs.get("ai_task"):
            updates.setdefault("action", dict(task.get("action", {})))
            updates["action"]["type"] = "agent_task"
            updates["action"]["task_description"] = kwargs["ai_task"]
            updates["action"].pop("content", None)
        if kwargs.get("schedule_type") and kwargs.get("schedule_value"):
            new_schedule = self._parse_schedule(kwargs["schedule_type"], kwargs["schedule_value"])
            if not new_schedule:
                return f"Error: invalid schedule — type: {kwargs['schedule_type']}, value: {kwargs['schedule_value']}"
            updates["schedule"] = new_schedule
            updates["timezone"] = str(get_configured_tz())

        if not updates:
            return "Error: no editable fields provided (name, message, ai_task, schedule_type, schedule_value)"

        # Recalculate next_run_at if schedule changed.
        if "schedule" in updates:
            merged = dict(task)
            merged.update(updates)
            next_run = self._calculate_next_run(merged)
            if next_run:
                updates["next_run_at"] = to_naive_utc(next_run).isoformat()
            else:
                updates["next_run_at"] = None

        updates["updated_at"] = now_in_tz().isoformat()
        self.task_store.update_task(task_id, updates)

        fresh = self.task_store.get_task(task_id)
        schedule_desc = self._format_schedule_description(fresh.get("schedule", {}))
        next_run_str = format_display(fresh.get("next_run_at"), "%Y-%m-%d %H:%M %Z")

        return (
            f"✅ Task updated\n\n"
            f"Task ID: {task_id}\n"
            f"Name: {fresh['name']}\n"
            f"Schedule: {schedule_desc}\n"
            f"Next run: {next_run_str}"
        )

    def _list_tasks(self, **kwargs) -> str:
        """List all tasks"""
        tasks = self.task_store.list_tasks()

        if not tasks:
            return "📋 No scheduled tasks yet."

        tz_name = str(get_configured_tz())
        lines = [f"📋 Scheduled tasks ({len(tasks)} total) — times shown in {tz_name}\n"]

        for task in tasks:
            status = "✅" if task.get("enabled", True) else "❌"
            schedule_desc = self._format_schedule_description(task.get("schedule", {}))
            next_run_str = format_display(task.get("next_run_at"), "%m-%d %H:%M %Z")
            lines.append(
                f"{status} [{task['id']}] {task['name']}\n"
                f"   ⏰ {schedule_desc} | next: {next_run_str}"
            )

        return "\n".join(lines)

    def _get_task(self, **kwargs) -> str:
        """Get task details"""
        task_id = kwargs.get("task_id")
        if not task_id:
            return "Error: missing task_id"

        task = self.task_store.get_task(task_id)
        if not task:
            return f"Error: task '{task_id}' not found"

        status = "enabled" if task.get("enabled", True) else "disabled"
        schedule_desc = self._format_schedule_description(task.get("schedule", {}))
        action = task.get("action", {})
        next_run_str = format_display(task.get("next_run_at"))
        last_run_str = format_display(task.get("last_run_at"))
        created_str = format_display(task.get("created_at"))

        return (
            f"📋 Task details\n\n"
            f"ID: {task['id']}\n"
            f"Name: {task['name']}\n"
            f"Status: {status}\n"
            f"Schedule: {schedule_desc}\n"
            f"Timezone: {task.get('timezone', 'UTC')}\n"
            f"Receiver: {action.get('receiver_name', action.get('receiver'))}\n"
            f"Message: {action.get('content', action.get('task_description', '—'))}\n"
            f"Next run: {next_run_str}\n"
            f"Last run: {last_run_str}\n"
            f"Created: {created_str}"
        )

    def _delete_task(self, **kwargs) -> str:
        task_id = kwargs.get("task_id")
        if not task_id:
            return "Error: missing task_id"

        task = self.task_store.get_task(task_id)
        if not task:
            return f"Error: task '{task_id}' not found"

        self.task_store.delete_task(task_id)
        return f"✅ Task '{task['name']}' ({task_id}) deleted"

    def _enable_task(self, **kwargs) -> str:
        task_id = kwargs.get("task_id")
        if not task_id:
            return "Error: missing task_id"

        task = self.task_store.get_task(task_id)
        if not task:
            return f"Error: task '{task_id}' not found"

        self.task_store.enable_task(task_id, True)
        return f"✅ Task '{task['name']}' ({task_id}) enabled"

    def _disable_task(self, **kwargs) -> str:
        task_id = kwargs.get("task_id")
        if not task_id:
            return "Error: missing task_id"

        task = self.task_store.get_task(task_id)
        if not task:
            return f"Error: task '{task_id}' not found"

        self.task_store.enable_task(task_id, False)
        return f"✅ Task '{task['name']}' ({task_id}) disabled"

    def _parse_schedule(self, schedule_type: str, schedule_value: str) -> Optional[dict]:
        """Parse and validate schedule configuration"""
        try:
            if schedule_type == "cron":
                croniter(schedule_value)
                return {"type": "cron", "expression": schedule_value}

            elif schedule_type == "interval":
                seconds = int(schedule_value)
                if seconds <= 0:
                    return None
                return {"type": "interval", "seconds": seconds}

            elif schedule_type == "frequency_per_day":
                # Run N times per day, evenly spaced starting from the next
                # occurrence. Internally stored as an interval of 86400/N seconds.
                n = int(schedule_value)
                if n <= 0 or n > 1440:  # at most once per minute
                    return None
                seconds_per_run = 86400 // n
                return {
                    "type": "frequency_per_day",
                    "count": n,
                    "seconds": seconds_per_run,  # for the scheduler loop's interval path
                }

            elif schedule_type == "once":
                # Parse in configured tz, return as naive UTC for storage.
                aware = parse_user_datetime(schedule_value)
                return {"type": "once", "run_at": to_naive_utc(aware).isoformat()}

        except Exception as e:
            logger.error(f"[SchedulerTool] Invalid schedule: {e}")
            return None

        return None

    def _calculate_next_run(self, task: dict) -> Optional[datetime]:
        """Calculate next run time as a tz-aware datetime."""
        schedule = task.get("schedule", {})
        schedule_type = schedule.get("type")
        now = now_in_tz()

        if schedule_type == "cron":
            expression = schedule.get("expression")
            # croniter works on tz-naive datetimes — interpret `now` in the
            # configured tz but strip tzinfo for croniter, then reattach.
            now_naive_in_tz = now.replace(tzinfo=None)
            cron = croniter(expression, now_naive_in_tz)
            next_naive = cron.get_next(datetime)
            # Reattach tz
            return next_naive.replace(tzinfo=get_configured_tz())

        elif schedule_type == "interval":
            seconds = schedule.get("seconds", 0)
            return now + timedelta(seconds=seconds)

        elif schedule_type == "frequency_per_day":
            seconds = schedule.get("seconds", 0)
            return now + timedelta(seconds=seconds)

        elif schedule_type == "once":
            run_at_str = schedule.get("run_at")
            if not run_at_str:
                return None
            parsed = datetime.fromisoformat(run_at_str)
            # Stored as naive UTC — reattach.
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed

        return None

    def _format_schedule_description(self, schedule: dict) -> str:
        """Format schedule as human-readable description"""
        schedule_type = schedule.get("type")

        if schedule_type == "cron":
            expr = schedule.get("expression", "")
            # Friendly descriptions for common patterns
            common = {
                "0 0 * * *": "Daily at midnight",
                "0 9 * * *": "Daily at 9am",
                "0 12 * * *": "Daily at noon",
                "0 18 * * *": "Daily at 6pm",
                "0 21 * * *": "Daily at 9pm",
                "0 */1 * * *": "Every hour",
                "0 */2 * * *": "Every 2 hours",
                "0 */6 * * *": "Every 6 hours",
                "0 */12 * * *": "Every 12 hours",
                "*/30 * * * *": "Every 30 minutes",
                "*/15 * * * *": "Every 15 minutes",
                "*/5 * * * *": "Every 5 minutes",
            }
            return common.get(expr, f"Cron: {expr}")

        elif schedule_type == "interval":
            seconds = schedule.get("seconds", 0)
            if seconds >= 86400:
                days = seconds // 86400
                return f"Every {days} day(s)"
            elif seconds >= 3600:
                hours = seconds // 3600
                return f"Every {hours} hour(s)"
            elif seconds >= 60:
                minutes = seconds // 60
                return f"Every {minutes} minute(s)"
            else:
                return f"Every {seconds} second(s)"

        elif schedule_type == "frequency_per_day":
            n = schedule.get("count", 0)
            return f"{n} times per day"

        elif schedule_type == "once":
            run_at = schedule.get("run_at", "")
            try:
                return f"Once at {format_display(run_at, '%Y-%m-%d %H:%M %Z')}"
            except Exception:
                return "Once"

        return "Unknown"

    def _get_receiver_name(self, context: Context) -> str:
        """Get receiver name from context"""
        try:
            msg = context.get("msg")
            if msg:
                if context.get("isgroup"):
                    return msg.other_user_nickname or "group chat"
                else:
                    return msg.from_user_nickname or "user"
        except Exception:
            pass
        return "unknown"
