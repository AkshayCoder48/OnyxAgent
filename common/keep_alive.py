"""
Keep-alive + self-healing + ephemeral package replay for HF Spaces.

1. KEEP-ALIVE: Periodically pings the Space's own /health endpoint to
   prevent it from sleeping (HF Spaces sleep after 48h of inactivity).

2. SELF-HEALING: Monitors the main app process. If it crashes, it
   restarts automatically within 5 seconds.

3. EPHEMERAL PACKAGE REPLAY: Records all pip/apt/npm installs done
   during a session and replays them on next boot, so installed
   packages survive Space restarts.

4. TERMINAL ACCESS: Optional JupyterLab terminal for debugging.
   Set DEV_MODE=true to enable at /terminal/.

Usage (in hf-entrypoint.sh or app.py):
  from common.keep_alive import KeepAlive, SelfHealer, PackageReplay
  KeepAlive().start()
  SelfHealer(lambda: start_app()).run()
  PackageReplay().replay()
"""

import os
import subprocess
import threading
import time
import json
import sys
from typing import Callable, Optional, List

from common.log import logger


# ─── Keep-Alive ──────────────────────────────────────────────────────────

class KeepAlive:
    """Pings the Space's /health endpoint to prevent sleeping."""

    def __init__(self):
        self.space_host = os.environ.get("SPACE_HOST", "").strip()
        self.interval = int(os.environ.get("KEEPALIVE_INTERVAL", "600"))  # 10 min
        self._thread = None
        self._stop = threading.Event()

    @property
    def enabled(self) -> bool:
        return bool(self.space_host)

    def start(self):
        if not self.enabled:
            logger.debug("[KeepAlive] Disabled (no SPACE_HOST)")
            return
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        logger.info(f"[KeepAlive] Started (ping every {self.interval}s)")

    def stop(self):
        self._stop.set()

    def _loop(self):
        import requests
        while not self._stop.is_set():
            try:
                url = f"https://{self.space_host}/health"
                resp = requests.get(url, timeout=10)
                logger.debug(f"[KeepAlive] Ping {url} → {resp.status_code}")
            except Exception as e:
                logger.debug(f"[KeepAlive] Ping failed: {e}")
            self._stop.wait(self.interval)


# ─── Self-Healing App Wrapper ────────────────────────────────────────────

class SelfHealer:
    """Wraps the main app function. If it crashes, restarts automatically."""

    def __init__(self, app_func: Callable, max_restarts: int = 0, delay: int = 5):
        """
        Args:
            app_func: The function that starts the app (e.g., lambda: app.run())
            max_restarts: Max restart attempts (0 = unlimited)
            delay: Seconds between restart attempts
        """
        self.app_func = app_func
        self.max_restarts = max_restarts
        self.delay = delay
        self.restart_count = 0

    def run(self):
        """Run the app in a self-healing loop."""
        while True:
            try:
                logger.info(f"[SelfHealer] Starting app (attempt {self.restart_count + 1})")
                self.app_func()
                # If app_func returns normally, exit
                logger.info("[SelfHealer] App exited normally")
                break

            except KeyboardInterrupt:
                logger.info("[SelfHealer] Interrupted by user")
                break

            except SystemExit as e:
                logger.info(f"[SelfHealer] App exited with code {e.code}")
                break

            except Exception as e:
                self.restart_count += 1
                if self.max_restarts > 0 and self.restart_count > self.max_restarts:
                    logger.error(f"[SelfHealer] Max restarts ({self.max_restarts}) exceeded. Giving up.")
                    raise

                logger.error(f"[SelfHealer] App crashed: {e}")
                logger.info(f"[SelfHealer] Restarting in {self.delay}s... (restart #{self.restart_count})")
                time.sleep(self.delay)


# ─── Ephemeral Package Replay ────────────────────────────────────────────

class PackageReplay:
    """Records and replays package installs (pip, apt, npm) across restarts.

    When the user installs packages via terminal (pip install, apt-get install,
    npm install -g), they're recorded to a startup script. On next boot,
    the script is replayed so the packages are reinstalled automatically.
    """

    STARTUP_FILE = os.path.expanduser("~/onyx/startup.sh")

    def __init__(self):
        self.workspace = os.path.expanduser("~/onyx")
        os.makedirs(self.workspace, exist_ok=True)

    def record(self, command: str):
        """Record a package install command to the startup script."""
        if not command.strip():
            return
        try:
            with open(self.STARTUP_FILE, "a") as f:
                f.write(command.strip() + "\n")
            logger.info(f"[PackageReplay] Recorded: {command.strip()[:80]}")
        except Exception as e:
            logger.warning(f"[PackageReplay] Failed to record: {e}")

    def replay(self):
        """Replay all recorded package installs."""
        if not os.path.exists(self.STARTUP_FILE):
            return

        try:
            with open(self.STARTUP_FILE, "r") as f:
                commands = [line.strip() for line in f if line.strip() and not line.startswith("#")]
        except Exception:
            return

        if not commands:
            return

        logger.info(f"[PackageReplay] Replaying {len(commands)} install commands...")

        for cmd in commands:
            try:
                logger.info(f"[PackageReplay] Running: {cmd[:80]}")
                result = subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=120,
                )
                if result.returncode != 0:
                    logger.warning(f"[PackageReplay] Command failed: {cmd[:60]} — {result.stderr[:100]}")
            except subprocess.TimeoutExpired:
                logger.warning(f"[PackageReplay] Command timed out: {cmd[:60]}")
            except Exception as e:
                logger.warning(f"[PackageReplay] Error: {cmd[:60]} — {e}")

        logger.info("[PackageReplay] Replay complete")

    def install_startup_vars(self):
        """Install packages from HUGGINGMES_* env vars (Hermes-compatible)."""
        apt_packages = os.environ.get("ONYX_APT_PACKAGES", "").strip()
        pip_packages = os.environ.get("ONYX_PIP_PACKAGES", "").strip()
        npm_packages = os.environ.get("ONYX_NPM_PACKAGES", "").strip()
        run_script = os.environ.get("ONYX_RUN", "").strip()

        if apt_packages:
            cmd = f"apt-get update && apt-get install -y {apt_packages}"
            self.record(cmd)

        if pip_packages:
            cmd = f"pip install {pip_packages}"
            self.record(cmd)

        if npm_packages:
            cmd = f"npm install -g {npm_packages}"
            self.record(cmd)

        if run_script:
            # Support base64-encoded scripts
            if run_script.startswith("base64:"):
                import base64
                try:
                    decoded = base64.b64decode(run_script[7:]).decode("utf-8")
                    self.record(decoded)
                except Exception:
                    pass
            else:
                self.record(run_script)


# ─── Shell Wrapper (records installs) ────────────────────────────────────

def install_shell_wrappers():
    """Install shell wrappers that record pip/apt/npm installs.

    This creates wrapper scripts in /usr/local/bin that log installs
    to the startup.sh file before executing them.
    """
    replay = PackageReplay()

    wrappers = {
        "/usr/local/bin/pip": '''#!/bin/bash
echo "pip $@" >> ~/onyx/startup.sh 2>/dev/null
exec /usr/bin/pip "$@"
''',
        "/usr/local/bin/pip3": '''#!/bin/bash
echo "pip3 $@" >> ~/onyx/startup.sh 2>/dev/null
exec /usr/bin/pip3 "$@"
''',
        "/usr/local/bin/npm": '''#!/bin/bash
if [ "$1" = "install" ] || [ "$1" = "i" ]; then
    echo "npm $@" >> ~/onyx/startup.sh 2>/dev/null
fi
exec /usr/bin/npm "$@"
''',
    }

    for path, content in wrappers.items():
        try:
            # Find the real binary
            real_path = subprocess.run(
                ["which", os.path.basename(path)],
                capture_output=True, text=True
            ).stdout.strip()

            if real_path and real_path != path:
                # Update wrapper to use the real path
                content = content.replace(f"/usr/bin/{os.path.basename(path)}", real_path)

                with open(path, "w") as f:
                    f.write(content)
                os.chmod(path, 0o755)
                logger.info(f"[PackageReplay] Installed wrapper: {path} → {real_path}")
        except Exception as e:
            logger.debug(f"[PackageReplay] Could not install wrapper for {path}: {e}")
