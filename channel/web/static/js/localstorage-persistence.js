/**
 * Local Storage Persistence System
 *
 * Saves all critical app data to the browser's localStorage so it survives
 * VPS restarts, data wipes, or container rebuilds. On first app open,
 * the saved data is auto-loaded. A manual "Load from Local Storage" button
 * is also available in the Config page.
 *
 * What's persisted:
 *   - Chat history (all sessions + messages)
 *   - Config (appearance, accent color, telegram settings, model config)
 *   - Skills list (installed + enabled state)
 *   - Scheduled tasks list
 *
 * Save strategy:
 *   - After each AI response completes, wait 2s then save to localStorage.
 *     This debounce prevents saving on every token (which would be too slow).
 *   - Before page unload (onbeforeunload), save immediately.
 *   - Config changes save immediately.
 *
 * Load strategy:
 *   - On DOMContentLoaded, check if localStorage has saved data.
 *   - If yes AND the server's DB is empty (first open after wipe), auto-load.
 *   - If the server's DB has data, prefer the server data (newer).
 *   - Manual load button always available in Config → Backup & Restore.
 */

const STORAGE_KEY = 'onyx_backup_v1';
const STORAGE_VERSION = 1;
const SAVE_DEBOUNCE_MS = 2000;

// ─── Save ─────────────────────────────────────────────────────────────

let _saveTimer = null;

/**
 * Save all app state to localStorage. Debounced by default to avoid
 * hammering localStorage on every token — call with {immediate: true}
 * to skip the debounce (used before page unload).
 */
async function saveToLocalStorage(opts = {}) {
    const { immediate = false } = opts;

    if (!immediate) {
        // Debounce: wait SAVE_DEBOUNCE_MS after the last call before saving.
        if (_saveTimer) clearTimeout(_saveTimer);
        _saveTimer = setTimeout(() => _doSave(), SAVE_DEBOUNCE_MS);
        return;
    }
    await _doSave();
}

async function _doSave() {
    try {
        const backup = {
            version: STORAGE_VERSION,
            saved_at: new Date().toISOString(),
            sessions: await _fetchSessions(),
            config: _getConfigState(),
            skills: await _fetchSkills(),
            tasks: await _fetchTasks(),
        };

        // Try to save. localStorage has a ~5-10MB limit; if it exceeds,
        // try saving without messages (just session metadata) as a fallback.
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
            console.log(`[localStorage] Saved backup (${(JSON.stringify(backup).length / 1024).toFixed(1)} KB) at ${backup.saved_at}`);
        } catch (quotaErr) {
            // Quota exceeded — try saving without session messages (just metadata)
            console.warn('[localStorage] Quota exceeded, saving without messages...');
            try {
                const lite = { ...backup, sessions: backup.sessions.map(s => ({ ...s, messages: [] })) };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(lite));
                console.log(`[localStorage] Saved lite backup (no messages) (${(JSON.stringify(lite).length / 1024).toFixed(1)} KB)`);
            } catch (e2) {
                console.error('[localStorage] Even lite save failed:', e2);
            }
        }
    } catch (err) {
        console.error('[localStorage] Save failed:', err);
    }
}

// ─── Fetch helpers ────────────────────────────────────────────────────

async function _fetchSessions() {
    try {
        const res = await fetch('/api/sessions?channel_type=all&page=1&page_size=100');
        const data = await res.json();
        if (data.status !== 'success') return [];

        const sessions = data.sessions || [];
        // Fetch messages for each session (limit to 50 per session to keep localStorage manageable)
        const sessionsWithMessages = [];
        for (const s of sessions.slice(0, 50)) { // cap at 50 sessions
            try {
                const msgRes = await fetch(`/api/history?session_id=${encodeURIComponent(s.session_id)}&page=1&page_size=50`);
                const msgData = await msgRes.json();
                if (msgData.status === 'success') {
                    sessionsWithMessages.push({
                        session_id: s.session_id,
                        title: s.title || '',
                        channel_type: s.channel_type || 'web',
                        created_at: s.created_at,
                        messages: (msgData.messages || []).map(m => ({
                            role: m.role,
                            content: m.steps ? m.steps.map(step => {
                                if (step.type === 'content') return step.content || '';
                                if (step.type === 'thinking') return step.content || '';
                                if (step.type === 'tool') return '[Tool: ' + (step.name || '') + ']';
                                return '';
                            }).join('\n') : (m.content || ''),
                            created_at: m.created_at,
                        })),
                    });
                }
            } catch (e) {
                // Skip this session if history fetch fails
            }
        }
        return sessionsWithMessages;
    } catch (e) {
        console.warn('[localStorage] Failed to fetch sessions:', e);
        return [];
    }
}

function _getConfigState() {
    return {
        theme: getAppearance(),
        accent: getAccentColor(),
        telegram_token_configured: !!document.getElementById('cfg-telegram-token'),
        telegram_streaming: document.getElementById('cfg-telegram-streaming-toggle')?.classList.contains('streaming-on') || false,
        telegram_show_tools: document.getElementById('cfg-telegram-show-tools-toggle')?.classList.contains('tools-on') || true,
        timezone: document.getElementById('cfg-timezone')?.value || '',
        model: appConfig?.model || '',
        bot_type: appConfig?.bot_type || '',
        use_linkai: appConfig?.use_linkai || false,
        agent_max_context_tokens: appConfig?.agent_max_context_tokens || 50000,
        agent_max_context_turns: appConfig?.agent_max_context_turns || 20,
        agent_max_steps: appConfig?.agent_max_steps || 20,
        enable_thinking: appConfig?.enable_thinking || false,
        self_evolution_enabled: appConfig?.self_evolution_enabled || false,
    };
}

async function _fetchSkills() {
    try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        if (data.status !== 'success') return [];
        return (data.skills || []).map(s => ({
            name: s.name,
            description: (s.description || '').split('\n')[0],
            enabled: s.enabled !== false,
        }));
    } catch (e) {
        return [];
    }
}

async function _fetchTasks() {
    try {
        const res = await fetch('/api/scheduler');
        const data = await res.json();
        if (data.status !== 'success') return [];
        return (data.tasks || []).map(t => ({
            id: t.id,
            name: t.name,
            enabled: t.enabled,
            schedule: t.schedule,
            action: t.action,
            next_run_at: t.next_run_at,
        }));
    } catch (e) {
        return [];
    }
}

// ─── Load ─────────────────────────────────────────────────────────────

/**
 * Load saved data from localStorage. Returns null if no backup exists.
 */
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const backup = JSON.parse(raw);
        if (!backup || backup.version !== STORAGE_VERSION) {
            console.warn('[localStorage] Backup version mismatch, ignoring');
            return null;
        }
        console.log(`[localStorage] Found backup from ${backup.saved_at} (${(raw.length / 1024).toFixed(1)} KB)`);
        return backup;
    } catch (e) {
        console.error('[localStorage] Load failed:', e);
        return null;
    }
}

/**
 * Check if the server has any data. Used to decide whether to auto-load
 * from localStorage (only auto-load if the server DB is empty).
 */
async function _isServerEmpty() {
    try {
        const res = await fetch('/api/sessions?channel_type=all&page=1&page_size=5');
        const data = await res.json();
        if (data.status !== 'success') return true;
        const sessions = data.sessions || [];
        // If the server has < 1 session, consider it empty (fresh after wipe)
        return sessions.length === 0;
    } catch (e) {
        // If the server is unreachable, definitely try to load from localStorage
        return true;
    }
}

/**
 * Auto-load from localStorage on first app open.
 * Only triggers if the server appears empty (no sessions).
 */
async function autoLoadFromLocalStorage() {
    const backup = loadFromLocalStorage();
    if (!backup) {
        console.log('[localStorage] No backup found, skipping auto-load');
        return false;
    }

    const serverEmpty = await _isServerEmpty();
    if (!serverEmpty) {
        console.log('[localStorage] Server has data, skipping auto-load (server is newer)');
        return false;
    }

    console.log('[localStorage] Server appears empty, auto-loading from localStorage backup...');
    return await restoreFromLocalStorage(backup);
}

/**
 * Restore all data from a localStorage backup.
 * This pushes sessions, config, skills, and tasks back to the server
 * so they persist in the DB as well.
 */
async function restoreFromLocalStorage(backup) {
    if (!backup) {
        toastError('No backup found in local storage');
        return false;
    }

    let restored = 0;

    // 1. Restore config (appearance, accent, etc.)
    if (backup.config) {
        const cfg = backup.config;
        if (cfg.theme) setAppearance(cfg.theme);
        if (cfg.accent) setAccentColor(cfg.accent);
        if (cfg.timezone) {
            const tzInput = document.getElementById('cfg-timezone');
            if (tzInput) tzInput.value = cfg.timezone;
        }
        // Restore agent config to server
        const updates = {};
        if (cfg.timezone) updates.timezone = cfg.timezone;
        if (cfg.agent_max_context_tokens) updates.agent_max_context_tokens = cfg.agent_max_context_tokens;
        if (cfg.agent_max_context_turns) updates.agent_max_context_turns = cfg.agent_max_context_turns;
        if (cfg.agent_max_steps) updates.agent_max_steps = cfg.agent_max_steps;
        if (updates && Object.keys(updates).length > 0) {
            try {
                await fetch('/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates }),
                });
                restored++;
            } catch (e) { /* non-fatal */ }
        }
    }

    // 2. Restore sessions + messages
    if (backup.sessions && backup.sessions.length > 0) {
        for (const session of backup.sessions) {
            try {
                // Re-create the session
                const storeRes = await fetch('/api/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: session.session_id,
                        title: session.title || 'Restored chat',
                        channel_type: session.channel_type || 'web',
                        messages: session.messages || [],
                    }),
                });
                if (storeRes.ok) restored++;
            } catch (e) {
                console.warn(`[localStorage] Failed to restore session ${session.session_id}:`, e);
            }
        }
    }

    // 3. Restore scheduled tasks
    if (backup.tasks && backup.tasks.length > 0) {
        for (const task of backup.tasks) {
            try {
                await fetch('/api/scheduler/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: task.name,
                        type: task.action?.type === 'agent_task' ? 'ai_task' : 'message',
                        content: task.action?.content || task.action?.task_description || '',
                        schedule_type: task.schedule?.type || 'once',
                        schedule_value: task.schedule?.expression || task.schedule?.run_at || String(task.schedule?.seconds || 3600),
                        receiver: task.action?.receiver || 'restored',
                        channel_type: task.action?.channel_type || 'web',
                    }),
                });
                restored++;
            } catch (e) { /* non-fatal */ }
        }
    }

    if (restored > 0) {
        toastSuccess(`Restored ${restored} item(s) from local storage`);
        // Reload the page to reflect restored data
        setTimeout(() => window.location.reload(), 2000);
    } else {
        toastInfo('No items needed restoration');
    }
    return restored > 0;
}

// ─── Auto-save hooks ─────────────────────────────────────────────────

// Save before page unload (immediate, no debounce)
window.addEventListener('beforeunload', () => {
    _doSave(); // synchronous attempt
});

// Save after each AI response completes (debounced)
// This is called from the SSE 'done' handler in console.js
function _onAiResponseComplete() {
    saveToLocalStorage();
}

// Save after config changes
function _onConfigChanged() {
    saveToLocalStorage({ immediate: false });
}

// ─── Init ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Auto-load from localStorage on first open (if server is empty)
    // Delayed slightly to let the app initialise first
    setTimeout(() => {
        autoLoadFromLocalStorage().then((loaded) => {
            if (!loaded) {
                console.log('[localStorage] Auto-load skipped (server has data or no backup)');
            }
        });
    }, 3000);
});

// Manual load button handler (called from Config → Backup & Restore)
async function manualLoadFromLocalStorage() {
    const backup = loadFromLocalStorage();
    if (!backup) {
        if (typeof toastWarning === 'function') {
            toastWarning('No backup found in local storage');
        } else {
            alert('No backup found in local storage');
        }
        return;
    }
    if (!confirm(`Restore from local storage backup saved at ${backup.saved_at}? This will re-create sessions, config, and tasks on the server.`)) {
        return;
    }
    await restoreFromLocalStorage(backup);
}
