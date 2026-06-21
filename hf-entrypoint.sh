#!/bin/bash
set -e

echo "=== OnyxAgent HF Spaces Entrypoint ==="

# On HF Spaces, /data is the only persistent directory
# We need to store all user data there so it survives space restarts

# Detect if we're running on HF Spaces
IS_HF_SPACE=false
if [ -n "$SPACE_ID" ] || [ -n "$SPACE_AUTHOR_NAME" ] || [ -d "/data" ]; then
    IS_HF_SPACE=true
    echo "[HF] Detected HuggingFace Spaces environment"
fi

if [ "$IS_HF_SPACE" = true ]; then
    # Create persistent data directory structure
    mkdir -p /data/onyx/sessions
    mkdir -p /data/onyx/memory/long-term
    mkdir -p /data/onyx/skills
    mkdir -p /data/onyx/knowledge
    mkdir -p /data/onyx/tmp
    mkdir -p /data/onyx/scheduler

    # Handle config.json persistence
    if [ ! -f /data/config.json ]; then
        # First run: copy default config to persistent storage
        if [ -f /app/config.json ]; then
            cp /app/config.json /data/config.json
            echo "[HF] Copied default config.json to /data/"
        elif [ -f /app/config-template.json ]; then
            cp /app/config-template.json /data/config.json
            echo "[HF] Copied config-template.json to /data/config.json"
        fi
    else
        echo "[HF] Found existing config.json in /data/ — preserving user settings"
    fi

    # Always symlink the app's config.json to the persistent one
    # This way, any config changes the user makes get saved to /data
    if [ -f /app/config.json ] && [ ! -L /app/config.json ]; then
        rm -f /app/config.json
    fi
    ln -sf /data/config.json /app/config.json

    # Handle user_datas.pkl persistence
    if [ -f /app/user_datas.pkl ] && [ ! -L /app/user_datas.pkl ]; then
        if [ ! -f /data/user_datas.pkl ]; then
            cp /app/user_datas.pkl /data/user_datas.pkl 2>/dev/null || true
        fi
        rm -f /app/user_datas.pkl
    fi
    ln -sf /data/user_datas.pkl /app/user_datas.pkl 2>/dev/null || true

    # Set up workspace symlinks for ALL possible home directories
    # The app may run as root or as 'agent' user
    for home_dir in /root /home/agent; do
        if [ -d "$home_dir" ] || [ "$home_dir" = "/root" ]; then
            mkdir -p "$home_dir" 2>/dev/null || true
            if [ -d "$home_dir/onyx" ] && [ ! -L "$home_dir/onyx" ]; then
                # Migrate existing data if any
                if [ "$(ls -A "$home_dir/onyx" 2>/dev/null)" ]; then
                    cp -a "$home_dir/onyx/." /data/onyx/ 2>/dev/null || true
                    echo "[HF] Migrated existing workspace data from $home_dir/onyx to /data/onyx/"
                fi
                rm -rf "$home_dir/onyx"
            fi
            ln -sf /data/onyx "$home_dir/onyx"
            echo "[HF] Linked $home_dir/onyx → /data/onyx"
        fi
    done

    # Set workspace environment variable to use /data/onyx
    export AGENT_WORKSPACE=/data/onyx

    # ── ANTI-ABUSE: Limit agent steps on HF Spaces ──
    # HF Spaces will flag/ban the account if the agent runs too many
    # tool calls in rapid succession. We limit max_steps to 10 (down
    # from the default 20) and disable self-evolution (which can trigger
    # background bash loops) to stay under HF's radar.
    # The config.py loader reads env vars that match config keys (case-insensitive).
    export agent_max_steps=10
    export self_evolution_enabled=false
    echo "[HF] Anti-abuse: max_steps=10, self_evolution=disabled"

    echo "[HF] Persistence configured:"
    echo "[HF]   Config: /data/config.json"
    echo "[HF]   Workspace: /data/onyx/"
    echo "[HF]   Sessions: /data/onyx/sessions/"
    echo "[HF]   Memory: /data/onyx/memory/"
    echo "[HF]   Skills: /data/onyx/skills/"
    echo "[HF]   Knowledge: /data/onyx/knowledge/"
else
    echo "[Standalone] Not running on HF Spaces — using default paths"
    mkdir -p /root/onyx 2>/dev/null || true
    mkdir -p /home/agent/onyx 2>/dev/null || true
fi

# Start the application
echo "=== Starting OnyxAgent ==="
cd /app
exec python app.py
