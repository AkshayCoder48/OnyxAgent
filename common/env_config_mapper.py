"""
Simple env var config for HF Spaces.

Maps LLM_API_KEY + LLM_MODEL environment variables to OnyxAgent's config.json
on startup. This lets users configure the agent via HF Space Secrets
instead of editing config.json.

Supported LLM_MODEL prefixes (auto-maps to OnyxAgent config):
  openai/           → open_ai_api_key + openai bot_type
  anthropic/        → claude_api_key + claudeapi bot_type
  deepseek/         → deepseek_api_key + deepseek bot_type
  gemini/ or google/ → gemini_api_key + gemini bot_type
  qwen/ or alibaba/ → dashscope_api_key + qwen bot_type
  glm/ or zai/      → zhipu_ai_api_key + zhipu bot_type
  moonshot/ or kimi/ → moonshot_api_key + moonshot bot_type
  minimax/          → minimax_api_key + minimax bot_type
  doubao/           → ark_api_key + doubao bot_type
  custom/           → custom_api_key + custom bot_type

If no prefix matches, falls back to open_ai_api_key + openai bot_type.

Also maps these env vars:
  WEB_PASSWORD      → web_password
  WEB_PORT          → web_port (default 7860 for HF)
  AGENT_ENABLED     → agent (true/false)
  PROXY_URL        → cloudflare_proxy_url
  PROXY_KEY        → cloudflare_proxy_key
"""

import json
import os
from typing import Dict, Tuple


# Provider mapping: prefix → (api_key_field, bot_type)
PROVIDER_MAP = [
    ("openai/",         ("open_ai_api_key",   "openai")),
    ("anthropic/",      ("claude_api_key",    "claudeapi")),
    ("deepseek/",       ("deepseek_api_key",  "deepseek")),
    ("gemini/",         ("gemini_api_key",    "gemini")),
    ("google/",         ("gemini_api_key",    "gemini")),
    ("qwen/",           ("dashscope_api_key", "qwen")),
    ("alibaba/",        ("dashscope_api_key", "qwen")),
    ("glm/",            ("zhipu_ai_api_key",  "zhipuai")),
    ("zai/",            ("zhipu_ai_api_key",  "zhipuai")),
    ("z-ai/",           ("zhipu_ai_api_key",  "zhipuai")),
    ("moonshot/",       ("moonshot_api_key",  "moonshot")),
    ("kimi/",           ("moonshot_api_key",  "moonshot")),
    ("minimax/",        ("minimax_api_key",   "minimax")),
    ("doubao/",         ("ark_api_key",       "doubao")),
    ("ernie/",          ("qianfan_api_key",   "qianfan")),
    ("qianfan/",        ("qianfan_api_key",   "qianfan")),
    ("mimo-",           (None,                "mimo")),
    # Custom OpenAI-compatible (any URL)
    ("custom/",         ("custom_api_key",    "custom")),
    ("g4f/",            ("custom_api_key",    "custom")),
]


def resolve_provider(llm_model: str, llm_api_key: str) -> Tuple[str, str, str, str]:
    """Resolve provider from LLM_MODEL prefix.

    Returns: (api_key_field, bot_type, model_name, api_base_field_or_empty)
    """
    model_lower = llm_model.lower()

    for prefix, (key_field, bot_type) in PROVIDER_MAP:
        if model_lower.startswith(prefix):
            # Strip prefix from model name
            model_name = llm_model[len(prefix):]
            return key_field or "open_ai_api_key", bot_type, model_name, ""

    # Default: treat as OpenAI-compatible
    return "open_ai_api_key", "openai", llm_model, ""


def apply_env_config(config: dict) -> dict:
    """Apply env var overrides to the config dict.

    This is called at startup, BEFORE the config is loaded by the app.
    It modifies the config dict in-place and returns it.
    """
    llm_api_key = os.environ.get("LLM_API_KEY", "").strip()
    llm_model = os.environ.get("LLM_MODEL", "").strip()

    if llm_api_key and llm_model:
        key_field, bot_type, model_name, api_base_field = resolve_provider(llm_model, llm_api_key)

        # Set the API key in the correct field
        config[key_field] = llm_api_key

        # Set the model (strip provider prefix)
        config["model"] = model_name

        # Set bot_type
        config["bot_type"] = bot_type

        # If custom provider, set the API base from CUSTOM_API_BASE env var
        if bot_type == "custom" and api_base_field:
            api_base = os.environ.get("CUSTOM_API_BASE", "").strip()
            if api_base:
                config["custom_api_base"] = api_base

        print(f"[EnvConfig] LLM_MODEL={llm_model} → provider={bot_type}, model={model_name}, key_field={key_field}")

    # Map other env vars
    env_map = {
        "WEB_PASSWORD": ("web_password", str),
        "WEB_PORT": ("web_port", int),
        "WEB_HOST": ("web_host", str),
        "AGENT_ENABLED": ("agent", lambda v: v.lower() == "true"),
        "PROXY_URL": ("cloudflare_proxy_url", str),
        "PROXY_KEY": ("cloudflare_proxy_key", str),
        "AGENT_MAX_STEPS": ("agent_max_steps", int),
        "ENABLE_THINKING": ("enable_thinking", lambda v: v.lower() == "true"),
        "SELF_EVOLUTION": ("self_evolution_enabled", lambda v: v.lower() == "true"),
    }

    for env_key, (config_key, converter) in env_map.items():
        val = os.environ.get(env_key, "").strip()
        if val:
            try:
                config[config_key] = converter(val)
            except (ValueError, TypeError):
                config[config_key] = val

    # HF Spaces defaults
    if os.environ.get("SPACE_ID") or os.environ.get("SPACE_AUTHOR_NAME"):
        if "web_host" not in config or not config.get("web_host"):
            config["web_host"] = "0.0.0.0"
        if "web_port" not in config or not config.get("web_port"):
            config["web_port"] = 7860
        # Disable self-evolution on HF to prevent abuse loops
        if "self_evolution_enabled" not in config:
            config["self_evolution_enabled"] = False
        if "agent_max_steps" not in config:
            config["agent_max_steps"] = 10

    return config


def write_env_config_to_json(config_path: str):
    """Read config.json, apply env overrides, write back.

    Called at startup BEFORE config.py loads the config.
    """
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception:
        config = {}

    config = apply_env_config(config)

    try:
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[EnvConfig] Failed to write config.json: {e}")

    return config
