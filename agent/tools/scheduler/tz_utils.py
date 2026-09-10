"""
Timezone-aware datetime helpers for the scheduler.

The scheduler previously used `datetime.now()` (tz-naive, server-local) for
all comparisons. On a Linux VPS the system clock is UTC by default, so
when a user in IST said "schedule for 7am" the task was actually stored as
7am UTC = 12:30pm IST — and the user thought the scheduler was broken.

This module:
  - Reads `timezone` from config.json (e.g., "Asia/Kolkata").
  - If unset, tries to detect the timezone from the inbound HTTP request's
    IP address via a free IP geolocation API (cached for 24h).
  - If that fails too, falls back to the system local timezone.
  - Always returns timezone-aware datetimes so comparisons are unambiguous.
"""
import os
import json
import time
import threading
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
    _HAS_ZONEINFO = True
except ImportError:
    _HAS_ZONEINFO = False
    ZoneInfo = None  # type: ignore

from common.log import logger


_CACHE_PATH = Path.home() / ".onyx" / "tz_cache.json"
_CACHE_TTL_SECONDS = 24 * 3600
_cache_lock = threading.Lock()


def _system_local_tz_name() -> str:
    """Best-effort guess at the system's local timezone name.

    Returns IANA name like "Asia/Kolkata" if detectable, else "UTC".
    """
    # 1. TZ env var
    tz_env = os.environ.get("TZ", "").strip()
    if tz_env and _HAS_ZONEINFO:
        try:
            ZoneInfo(tz_env)
            return tz_env
        except Exception:
            pass

    # 2. /etc/timezone (Debian/Ubuntu)
    try:
        if os.path.exists("/etc/timezone"):
            with open("/etc/timezone") as f:
                name = f.read().strip()
            if name and _HAS_ZONEINFO:
                ZoneInfo(name)
                return name
    except Exception:
        pass

    # 3. localtime symlink (most distros)
    try:
        if os.path.exists("/etc/localtime"):
            target = os.path.realpath("/etc/localtime")
            # /usr/share/zoneinfo/Asia/Kolkata
            if "zoneinfo/" in target:
                name = target.split("zoneinfo/", 1)[1]
                if name and _HAS_ZONEINFO:
                    ZoneInfo(name)
                    return name
    except Exception:
        pass

    return "UTC"


def _detect_tz_from_ip() -> Optional[str]:
    """Use a free IP-geolocation API to detect the timezone.

    Cached for 24h so we don't hammer the API on every scheduler tick.
    Returns IANA name like "Asia/Kolkata", or None if detection fails.
    """
    # Check cache first
    try:
        if _CACHE_PATH.exists():
            with _cache_lock:
                with open(_CACHE_PATH) as f:
                    cache = json.load(f)
                age = time.time() - cache.get("fetched_at", 0)
                if age < _CACHE_TTL_SECONDS:
                    return cache.get("timezone") or None
    except Exception:
        pass

    # Try a chain of free APIs. Each returns JSON with a "timezone" field.
    endpoints = [
        "https://ipapi.co/json/",
        "https://ipwho.is/",
        "https://get.geojs.io/v1/ip/geo.json",
    ]
    import requests as _requests

    detected: Optional[str] = None
    for url in endpoints:
        try:
            resp = _requests.get(url, timeout=5)
            if resp.status_code != 200:
                continue
            data = resp.json()
            tz = (
                data.get("timezone")
                or data.get("time_zone")
                or (data.get("data", {}) or {}).get("timezone")
            )
            if tz and _HAS_ZONEINFO:
                ZoneInfo(tz)  # validate
                detected = tz
                break
        except Exception as e:
            logger.debug(f"[tz] {url} failed: {e}")
            continue

    # Persist cache (even on failure, so we don't retry every tick).
    try:
        with _cache_lock:
            _CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(_CACHE_PATH, "w") as f:
                json.dump({
                    "fetched_at": time.time(),
                    "timezone": detected,
                }, f)
    except Exception as e:
        logger.debug(f"[tz] cache write failed: {e}")

    return detected


def get_configured_tz():
    """Return the timezone the scheduler should use for interpreting user
    input times.

    Priority:
      1. `timezone` in config.json (manual override — wins always).
      2. Auto-detected from inbound IP (cached 24h).
      3. System local timezone (from /etc/timezone or TZ env).
      4. UTC (last resort).

    Returns a tzinfo (UTC if nothing else works).
    """
    try:
        from config import conf
        cfg_tz = str(conf().get("timezone", "") or "").strip()
        if cfg_tz and _HAS_ZONEINFO:
            try:
                return ZoneInfo(cfg_tz)
            except Exception as e:
                logger.warning(f"[tz] invalid timezone '{cfg_tz}': {e}")
    except Exception:
        pass

    # Try IP detection (cached, fast).
    try:
        detected = _detect_tz_from_ip()
        if detected and _HAS_ZONEINFO:
            try:
                return ZoneInfo(detected)
            except Exception:
                pass
    except Exception:
        pass

    # Fall back to system local.
    sys_tz = _system_local_tz_name()
    if _HAS_ZONEINFO:
        try:
            return ZoneInfo(sys_tz)
        except Exception:
            pass

    return timezone.utc


def now_in_tz():
    """Current time as a timezone-aware datetime in the configured tz."""
    return datetime.now(get_configured_tz())


def parse_user_datetime(value: str):
    """Parse a user-supplied datetime string in the configured timezone.

    Supports:
      - "+5s", "+10m", "+1h", "+1d"  (relative to now in tz)
      - "2026-08-17 19:00"           (interpreted as 19:00 in configured tz)
      - "2026-08-17T19:00:00+05:30"  (explicit offset respected)
      - "2026-08-17T19:00:00"        (interpreted as configured tz)
      - "19:00"                       (today at 19:00 in configured tz)

    Returns a timezone-aware datetime.
    """
    value = value.strip()
    if not value:
        raise ValueError("empty datetime string")

    # Relative time
    if value.startswith("+"):
        import re
        match = re.match(r'\+(\d+)([smhd])', value)
        if not match:
            raise ValueError(f"invalid relative time: {value}")
        from datetime import timedelta
        amount = int(match.group(1))
        unit = match.group(2)
        base = now_in_tz()
        if unit == 's':
            return base + timedelta(seconds=amount)
        elif unit == 'm':
            return base + timedelta(minutes=amount)
        elif unit == 'h':
            return base + timedelta(hours=amount)
        elif unit == 'd':
            return base + timedelta(days=amount)

    # Time-only "HH:MM" — today at that time in configured tz
    try:
        # Try parsing as HH:MM
        if ":" in value and len(value) <= 5 and " " not in value:
            tz = get_configured_tz()
            today = now_in_tz().date()
            hh, mm = value.split(":")
            return datetime(int(today.year), int(today.month), int(today.day),
                            int(hh), int(mm), tzinfo=tz)
    except Exception:
        pass

    # Full ISO datetime
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        # No offset given — interpret as configured tz.
        parsed = parsed.replace(tzinfo=get_configured_tz())
    return parsed


def to_naive_utc(dt):
    """Convert a tz-aware datetime to a tz-naive UTC datetime.

    Used when persisting to the JSON task store so that comparisons in
    the scheduler loop can stay tz-naive (matching the legacy code) but
    the actual stored time is unambiguous.
    """
    if dt.tzinfo is None:
        return dt  # already naive
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def from_naive_utc(dt):
    """Inverse of to_naive_utc — convert a stored tz-naive UTC datetime
    back to a tz-aware datetime in the configured tz for display.
    """
    if dt.tzinfo is not None:
        return dt
    return dt.replace(tzinfo=timezone.utc).astimezone(get_configured_tz())


def format_display(dt, fmt: str = "%Y-%m-%d %H:%M %Z") -> str:
    """Format a datetime for display to the user, in their configured tz."""
    if dt is None:
        return "—"
    try:
        if isinstance(dt, str):
            dt = datetime.fromisoformat(dt)
        aware = from_naive_utc(dt) if dt.tzinfo is None else dt
        return aware.strftime(fmt)
    except Exception:
        return str(dt)
