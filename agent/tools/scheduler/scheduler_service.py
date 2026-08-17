"""
Background scheduler service for executing scheduled tasks
"""

import time
import threading
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional
from croniter import croniter
from common.log import logger

# Import tz helpers — but tolerate circular import issues at module load time
# by deferring the actual call to runtime.
try:
    from agent.tools.scheduler.tz_utils import (
        get_configured_tz,
        now_in_tz,
        to_naive_utc,
        from_naive_utc,
    )
    _HAS_TZ_UTILS = True
except Exception:
    _HAS_TZ_UTILS = False
    get_configured_tz = None  # type: ignore
    now_in_tz = None  # type: ignore
    to_naive_utc = None  # type: ignore
    from_naive_utc = None  # type: ignore


def _now_naive_utc() -> datetime:
    """Current time as a tz-naive UTC datetime.

    The task store persists all timestamps as naive UTC (see scheduler_tool).
    Comparing against `datetime.now()` would be WRONG on a UTC server because
    `datetime.now()` returns the server's wall clock — which on a Linux VPS is
    UTC anyway, but on a user's local dev machine would be local time.

    Using `datetime.utcnow()` always returns UTC regardless of system tz,
    which matches what we stored. This is the correct comparison value.
    """
    return datetime.utcnow()


def _parse_naive_utc(iso_str: str) -> datetime:
    """Parse a stored ISO timestamp and normalise to tz-naive UTC.

    Legacy tasks stored their times as `datetime.now().isoformat()` which on
    a UTC server was effectively naive UTC. New tasks use `to_naive_utc()`
    explicitly. Either way we end up with naive UTC for comparison.
    """
    dt = datetime.fromisoformat(iso_str)
    if dt.tzinfo is not None:
        # Was stored tz-aware — convert to UTC and strip tzinfo.
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class SchedulerService:
    """
    Background service that executes scheduled tasks
    """
    
    def __init__(self, task_store, execute_callback: Callable):
        """
        Initialize scheduler service
        
        Args:
            task_store: TaskStore instance
            execute_callback: Function to call when executing a task
        """
        self.task_store = task_store
        self.execute_callback = execute_callback
        self.running = False
        self.thread = None
        self._lock = threading.Lock()
    
    def start(self):
        """Start the scheduler service"""
        with self._lock:
            if self.running:
                logger.warning("[Scheduler] Service already running")
                return
            
            self.running = True
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
    
    def stop(self):
        """Stop the scheduler service"""
        with self._lock:
            if not self.running:
                return
            
            self.running = False
            if self.thread:
                self.thread.join(timeout=5)
            logger.info("[Scheduler] Service stopped")
    
    def _run_loop(self):
        """Main scheduler loop"""
        logger.info("[Scheduler] Scheduler loop started (10s tick)")

        while self.running:
            try:
                self._check_and_execute_tasks()
            except Exception as e:
                logger.error(f"[Scheduler] Error in scheduler loop: {e}")

            # 10-second tick so scheduled tasks fire within ~10s of their
            # target time. The loop body is cheap (one file read + a few
            # datetime comparisons), so this is fine even on slow VPSes.
            time.sleep(10)
    
    def _check_and_execute_tasks(self):
        """Check for due tasks and execute them"""
        now = _now_naive_utc()
        tasks = self.task_store.list_tasks(enabled_only=True)

        for task in tasks:
            try:
                if self._is_task_due(task, now):
                    logger.info(f"[Scheduler] Executing task: {task['id']} - {task['name']}")
                    ok = self._execute_task(task)
                    if not ok:
                        # Leave next_run_at as-is so the next loop retries.
                        logger.warning(
                            f"[Scheduler] Task {task['id']} delivery failed, will retry next tick"
                        )
                        continue

                    next_run = self._calculate_next_run(task, now)
                    if next_run:
                        self.task_store.update_task(task['id'], {
                            "next_run_at": to_naive_utc(next_run).isoformat() if _HAS_TZ_UTILS and next_run.tzinfo else next_run.isoformat(),
                            "last_run_at": now.isoformat()
                        })
                    else:
                        self.task_store.delete_task(task['id'])
                        logger.info(f"[Scheduler] One-time task completed and removed: {task['id']}")
            except Exception as e:
                logger.error(f"[Scheduler] Error processing task {task.get('id')}: {e}")

    def _is_task_due(self, task: dict, now: datetime) -> bool:
        """
        Check if a task is due to run

        Args:
            task: Task dictionary
            now: Current datetime (tz-naive UTC)

        Returns:
            True if task should run now
        """
        next_run_str = task.get("next_run_at")
        if not next_run_str:
            # Calculate initial next_run_at
            next_run = self._calculate_next_run(task, now)
            if next_run:
                store_str = to_naive_utc(next_run).isoformat() if _HAS_TZ_UTILS and next_run.tzinfo else next_run.isoformat()
                self.task_store.update_task(task['id'], {
                    "next_run_at": store_str
                })
                return False
            return False

        try:
            next_run = _parse_naive_utc(next_run_str)

            if next_run < now:
                time_diff = (now - next_run).total_seconds()
                schedule = task.get("schedule", {})
                schedule_type = schedule.get("type")

                # Catch-up window: fire if we're within 1 HOUR of the
                # scheduled tick. For one-time tasks we fire even if very
                # late — the user explicitly wanted this task to run and
                # would rather get a late notification than none at all.
                # For recurring tasks we skip after 1 hour to avoid
                # spamming the user with a backlog of missed ticks.
                if schedule_type == "once":
                    return True

                if time_diff <= 3600:
                    return True

                logger.warning(
                    f"[Scheduler] Task {task['id']} is overdue by {int(time_diff)}s, "
                    f"skipping and scheduling next run"
                )

                if schedule_type == "once":
                    self.task_store.delete_task(task['id'])
                    logger.info(f"[Scheduler] One-time task {task['id']} expired, removed")
                    return False

                next_next_run = self._calculate_next_run(task, now)
                if next_next_run:
                    store_str = to_naive_utc(next_next_run).isoformat() if _HAS_TZ_UTILS and next_next_run.tzinfo else next_next_run.isoformat()
                    self.task_store.update_task(task['id'], {
                        "next_run_at": store_str
                    })
                    logger.info(f"[Scheduler] Rescheduled task {task['id']} to {next_next_run}")
                return False

            return now >= next_run
        except Exception as e:
            logger.error(
                f"[Scheduler] Failed to evaluate due-state for task "
                f"{task.get('id')} (next_run_at={next_run_str!r}): {e}"
            )
            return False

    def _calculate_next_run(self, task: dict, from_time: datetime) -> Optional[datetime]:
        """
        Calculate next run time for a task

        Args:
            task: Task dictionary
            from_time: Calculate from this time (tz-naive UTC)

        Returns:
            Next run datetime (tz-aware in configured tz) or None
        """
        schedule = task.get("schedule", {})
        schedule_type = schedule.get("type")

        # Convert from_time back to tz-aware in configured tz for croniter
        # (cron expressions like "0 9 * * *" should fire at 9am in the user's
        # tz, not 9am UTC).
        if _HAS_TZ_UTILS:
            from_aware = from_time.replace(tzinfo=timezone.utc).astimezone(get_configured_tz())
        else:
            from_aware = from_time.replace(tzinfo=timezone.utc)

        if schedule_type == "cron":
            expression = schedule.get("expression")
            if not expression:
                return None
            try:
                # croniter with tz-aware datetime returns tz-aware datetime
                cron = croniter(expression, from_aware)
                return cron.get_next(datetime)
            except Exception as e:
                logger.error(f"[Scheduler] Invalid cron expression '{expression}': {e}")
                return None

        elif schedule_type == "interval":
            seconds = schedule.get("seconds", 0)
            if seconds <= 0:
                return None
            return from_aware + timedelta(seconds=seconds)

        elif schedule_type == "frequency_per_day":
            # Same as interval internally — evenly spaced.
            seconds = schedule.get("seconds", 0)
            if seconds <= 0:
                return None
            return from_aware + timedelta(seconds=seconds)

        elif schedule_type == "once":
            run_at_str = schedule.get("run_at")
            if not run_at_str:
                return None
            try:
                parsed = datetime.fromisoformat(run_at_str)
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
                if parsed > from_aware:
                    return parsed
            except Exception as e:
                logger.error(
                    f"[Scheduler] Failed to parse once-task run_at "
                    f"{run_at_str!r}: {e}"
                )
            return None

        return None
    
    def _execute_task(self, task: dict) -> bool:
        """
        Execute a task.

        Returns True if delivery succeeded (caller should advance state),
        False if it failed (caller should keep next_run_at so the next
        loop iteration retries). Callback may return None for legacy
        behaviour, treated as success.
        """
        try:
            result = self.execute_callback(task)
            return False if result is False else True
        except Exception as e:
            logger.error(f"[Scheduler] Error executing task {task['id']}: {e}")
            self.task_store.update_task(task['id'], {
                "last_error": str(e),
                "last_error_at": _now_naive_utc().isoformat()
            })
            return False
