"""
HF Dataset Backup — syncs workspace data to a private HF Dataset.

On HuggingFace Spaces, the /data directory is persistent but can be lost
on space rebuild. This module syncs all workspace data (chats, memory,
skills, config) to a private HF Dataset every N seconds, and restores
on startup.

Configuration (env vars or config.json):
  HF_TOKEN          — HF write token (required for backup)
  BACKUP_DATASET    — Dataset name (default: onyxagent-backup)
  SYNC_INTERVAL     — Sync frequency in seconds (default: 120)
  SYNC_START_DELAY  — Delay before first sync (default: 5)

Usage:
  from common.hf_backup import BackupManager
  backup = BackupManager()
  backup.start()  # starts background sync thread
  backup.restore()  # restores from HF Dataset on startup
"""

import json
import os
import threading
import time
import shutil
import tempfile
from typing import Optional

from common.log import logger


class BackupManager:
    """Manages backup/restore of workspace data to HF Dataset."""

    def __init__(self):
        self.hf_token = os.environ.get("HF_TOKEN", "").strip()
        # Don't use the system HF token (it's read-only)
        if not self.hf_token or self.hf_token.startswith("hf_") and len(self.hf_token) < 20:
            # Try config.json
            try:
                from config import conf
                self.hf_token = conf().get("hf_token", "") or self.hf_token
            except Exception:
                pass

        self.dataset_name = os.environ.get("BACKUP_DATASET", "onyxagent-backup").strip()
        self.sync_interval = int(os.environ.get("SYNC_INTERVAL", "120"))
        self.sync_start_delay = int(os.environ.get("SYNC_START_DELAY", "5"))

        # Determine HF username
        self.hf_username = (
            os.environ.get("SPACE_AUTHOR_NAME", "").strip() or
            os.environ.get("HF_USERNAME", "").strip()
        )

        self._thread = None
        self._stop_event = threading.Event()
        self._last_sync_status = "idle"
        self._last_sync_time = None

    @property
    def enabled(self) -> bool:
        return bool(self.hf_token and self.hf_username)

    @property
    def dataset_id(self) -> str:
        return f"{self.hf_username}/{self.dataset_name}"

    def _get_workspace_dir(self) -> str:
        """Get the workspace directory."""
        try:
            from common.utils import expand_path
            return os.path.join(expand_path("~"), "onyx")
        except Exception:
            return os.path.expanduser("~/onyx")

    def _get_config_path(self) -> str:
        """Get the config.json path."""
        app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(app_root, "config.json")

    def restore(self) -> bool:
        """Restore workspace data from HF Dataset.

        Returns True if restore succeeded, False otherwise.
        """
        if not self.enabled:
            logger.info("[Backup] Disabled (no HF_TOKEN or username)")
            return False

        try:
            from huggingface_hub import HfApi, snapshot_download
            api = HfApi(token=self.hf_token)

            # Check if dataset exists
            try:
                api.repo_info(self.dataset_id, repo_type="dataset")
            except Exception:
                logger.info(f"[Backup] Dataset {self.dataset_id} doesn't exist yet — first run")
                return False

            logger.info(f"[Backup] Restoring from {self.dataset_id}...")

            # Download to temp dir
            with tempfile.TemporaryDirectory() as tmp_dir:
                snapshot_download(
                    self.dataset_id,
                    repo_type="dataset",
                    local_dir=tmp_dir,
                    token=self.hf_token,
                )

                workspace = self._get_workspace_dir()
                os.makedirs(workspace, exist_ok=True)

                # Restore workspace files
                restored = 0
                for root, dirs, files in os.walk(tmp_dir):
                    dirs[:] = [d for d in dirs if d not in ('.git', '__pycache__')]
                    for fname in files:
                        src = os.path.join(root, fname)
                        rel = os.path.relpath(src, tmp_dir)
                        dst = os.path.join(workspace, rel)
                        os.makedirs(os.path.dirname(dst), exist_ok=True)
                        shutil.copy2(src, dst)
                        restored += 1

                # Restore config.json if present
                config_backup = os.path.join(tmp_dir, "config.json")
                if os.path.exists(config_backup):
                    config_path = self._get_config_path()
                    shutil.copy2(config_backup, config_path)
                    logger.info("[Backup] Restored config.json")
                    restored += 1

                logger.info(f"[Backup] Restored {restored} files")
                self._last_sync_status = "restored"
                return True

        except Exception as e:
            logger.error(f"[Backup] Restore failed: {e}")
            self._last_sync_status = "error"
            return False

    def sync(self) -> bool:
        """Upload workspace data to HF Dataset.

        Returns True if sync succeeded.
        """
        if not self.enabled:
            return False

        try:
            from huggingface_hub import HfApi, create_repo
            api = HfApi(token=self.hf_token)

            # Create dataset if it doesn't exist
            try:
                create_repo(self.dataset_id, repo_type="dataset", private=True, exist_ok=True, token=self.hf_token)
            except Exception:
                pass

            workspace = self._get_workspace_dir()
            config_path = self._get_config_path()

            # Upload workspace files
            if os.path.isdir(workspace):
                api.upload_folder(
                    folder_path=workspace,
                    repo_id=self.dataset_id,
                    repo_type="dataset",
                    path_in_repo="workspace",
                    token=self.hf_token,
                )

            # Upload config.json
            if os.path.exists(config_path):
                api.upload_file(
                    path_or_fileobj=config_path,
                    path_in_repo="config.json",
                    repo_id=self.dataset_id,
                    repo_type="dataset",
                    token=self.hf_token,
                )

            self._last_sync_status = "synced"
            self._last_sync_time = time.time()
            logger.info(f"[Backup] Synced to {self.dataset_id}")
            return True

        except Exception as e:
            logger.error(f"[Backup] Sync failed: {e}")
            self._last_sync_status = "error"
            return False

    def start(self):
        """Start the background sync thread."""
        if not self.enabled:
            logger.info("[Backup] Not starting (disabled)")
            return

        if self._thread and self._thread.is_alive():
            return

        self._stop_event.clear()
        self._thread = threading.Thread(target=self._sync_loop, daemon=True)
        self._thread.start()
        logger.info(f"[Backup] Background sync started (interval={self.sync_interval}s)")

    def stop(self):
        """Stop the background sync thread."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)

    def _sync_loop(self):
        """Background sync loop."""
        # Wait before first sync
        self._stop_event.wait(self.sync_start_delay)

        while not self._stop_event.is_set():
            self.sync()
            self._stop_event.wait(self.sync_interval)

    def status(self) -> dict:
        """Get backup status."""
        return {
            "enabled": self.enabled,
            "dataset": self.dataset_id if self.enabled else None,
            "last_status": self._last_sync_status,
            "last_sync": self._last_sync_time,
            "interval": self.sync_interval,
        }


# Singleton
_backup_manager: Optional[BackupManager] = None


def get_backup_manager() -> BackupManager:
    global _backup_manager
    if _backup_manager is None:
        _backup_manager = BackupManager()
    return _backup_manager
