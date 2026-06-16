# encoding:utf-8

"""Lightweight global language resolution — English-only.

The OnyxAgent app is English-only. All Chinese and other language references
have been removed. This module is kept for backward compatibility (many modules
import ``get_language`` / ``is_zh`` / ``t``) but every function now returns
English / ``False`` unconditionally.

Resolution priority (historical, now all return English):
  1. Explicit ``onyx_lang`` from config.json
  2. macOS ``defaults read -g AppleLocale``
  3. Standard locale env vars: LC_ALL > LC_MESSAGES > LANG
  4. Python locale module
  5. Default -> English
"""

import os
import subprocess
import sys

# Supported language codes (kept for backward compatibility)
ZH = "zh"
EN = "en"
SUPPORTED = (EN,)  # English only
DEFAULT_LANG = EN

# Resolved language cache; always English.
_resolved_lang = EN


def _normalize(raw):
    """Always return English ('en'). The app is English-only."""
    return EN


def _detect_from_env():
    """Always return English ('en'). The app is English-only."""
    return EN


def _detect_from_macos():
    """Always return English ('en'). The app is English-only."""
    return EN


def _detect_from_python_locale():
    """Always return English ('en'). The app is English-only."""
    return EN


def detect_language():
    """Always return English ('en'). The app is English-only."""
    return EN


def resolve_language(configured=None):
    """Always return English ('en'). The app is English-only."""
    global _resolved_lang
    _resolved_lang = EN
    return _resolved_lang


def set_language(lang):
    """Always return English ('en'). The app is English-only."""
    global _resolved_lang
    _resolved_lang = EN
    return _resolved_lang


def get_language():
    """Always return English ('en'). The app is English-only."""
    return EN


def is_zh():
    """Always return False. The app is English-only."""
    return False


def t(zh_text, en_text):
    """Always return the English string. The app is English-only.

    Intended for one-off strings where a full message catalog is overkill:
        t("已中止", "Cancelled")  ->  "Cancelled"
    """
    return en_text
