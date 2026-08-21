/**
 * IndexedDB Persistence System — UNLIMITED storage
 *
 * Uses IndexedDB instead of localStorage (which is limited to ~5-10MB).
 * IndexedDB can store hundreds of MB to GB depending on the browser, and
 * with navigator.storage.persist() the data won't be evicted even under
 * storage pressure.
 *
 * What's persisted:
 *   - Chat history (all sessions + messages — NO LIMIT)
 *   - Config (appearance, accent color, telegram settings, model config)
 *   - Skills list (installed + enabled state)
 *   - Scheduled tasks list
 *
 * Save strategy:
 *   - After each AI response completes, wait 2s then save to IndexedDB.
 *   - Before page unload, save immediately.
 *   - Config changes save immediately.
 *
 * Load strategy:
 *   - On DOMContentLoaded, check if IndexedDB has saved data.
 *   - If yes AND the server's DB is empty (first open after wipe), auto-load.
 *   - IMPORTANT: Only auto-loads ONCE per browser session (tracked via
 *     sessionStorage flag). Prevents infinite reload loops.
 *   - Manual "Load from Storage" button in Config → Backup & Restore.
 */

const DB_NAME = 'onyx_backup_db';
const DB_VERSION = 1;
const STORE_NAME = 'backups';
const BACKUP_KEY = 'latest';
const SAVE_DEBOUNCE_MS = 2000;

// sessionStorage key — set after first auto-load attempt so we don't
// retry on every page navigation within the same browser session.
// sessionStorage is cleared when the tab closes, so a new tab/session
// will re-check. But the server won't be empty anymore (data was restored),
// so the auto-load will skip naturally.
const AUTO_LOAD_FLAG = 'onyx_autoload_done';

// ─── IndexedDB helpers ────────────────────────────────────────────────

function _openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function _idbGet(key) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = (e) => resolve(e.target.result ? e.target.result.data : null);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function _idbPut(key, data) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id: key, data: data });
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
    });
}

async function _idbDelete(key) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
    });
}

// ─── Request persistent storage ───────────────────────────────────────

async function _requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        try {
            const isPersisted = await navigator.storage.persisted();
            if (isPersisted) {
                console.log('[IndexedDB] Storage already persistent');
                return true;
            }
            const granted = await navigator.storage.persist();
            if (granted) {
                console.log('[IndexedDB] Persistent storage granted — data will not be evicted');
            } else {
                console.log('[IndexedDB] Persistent storage not granted — data may be evicted under pressure');
            }
            return granted;
        } catch (e) {
            console.warn('[IndexedDB] persist() failed:', e);
            return false;
        }
    }
    return false;
}

// ─── Save ─────────────────────────────────────────────────────────────

let _saveTimer = null;
let _isSaving = false;  // prevent concurrent saves

/**
 * Save all app state to IndexedDB. Debounced by default.
 */
async function saveToLocalStorage(opts = {}) {
    const { immediate = false } = opts;

    if (!immediate) {
        if (_saveTimer) clearTimeout(_saveTimer);
        _saveTimer = setTimeout(() => _doSave(), SAVE_DEBOUNCE_MS);
        return;
    }
    await _doSave();
}

async function _doSave() {
    if (_isSaving) {
        console.log('[IndexedDB] Save already in progress, skipping');
        return;
    }
    _isSaving = true;
    try {
        const backup = {
            version: 1,
            saved_at: new Date().toISOString(),
            sessions: await _fetchSessions(),
            config: _getConfigState(),
            skills: await _fetchSkills(),
            tasks: await _fetchTasks(),
        };

        await _idbPut(BACKUP_KEY, backup);
        const sizeKB = (JSON.stringify(backup).length / 1024).toFixed(1);
        console.log(`[IndexedDB] Saved backup (${sizeKB} KB) at ${backup.saved_at}`);
    } catch (err) {
        console.error('[IndexedDB] Save failed:', err);
    } finally {
        _isSaving = false;
    }
}

// ─── Fetch helpers ────────────────────────────────────────────────────

async function _fetchSessions() {
    try {
        const res = await fetch('/api/sessions?channel_type=all&page=1&page_size=200');
        const data = await res.json();
        if (data.status !== 'success') return [];

        const sessions = data.sessions || [];
        // Cap at 50 sessions to avoid overwhelming the VPS during save.
        // IndexedDB can store more, but fetching 100+ sessions × 100 msgs
        // each from the VPS during save was crashing it.
        const sessionsWithMessages = [];
        for (const s of sessions.slice(0, 50)) {
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
        console.warn('[IndexedDB] Failed to fetch sessions:', e);
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
 * Load saved data from IndexedDB. Returns null if no backup exists.
 */
async function loadFromLocalStorage() {
    try {
        const backup = await _idbGet(BACKUP_KEY);
        if (!backup || backup.version !== 1) {
            console.log('[IndexedDB] No valid backup found');
            return null;
        }
        console.log(`[IndexedDB] Found backup from ${backup.saved_at}`);
        return backup;
    } catch (e) {
        console.error('[IndexedDB] Load failed:', e);
        return null;
    }
}

/**
 * Check if the server has any data.
 */
async function _isServerEmpty() {
    try {
        const res = await fetch('/api/sessions?channel_type=all&page=1&page_size=5');
        const data = await res.json();
        if (data.status !== 'success') return true;
        const sessions = data.sessions || [];
        return sessions.length === 0;
    } catch (e) {
        return true;
    }
}

/**
 * Auto-load from IndexedDB on first app open.
 *
 * CRITICAL: This only runs ONCE per browser session (tracked via
 * sessionStorage). Without this guard, the page would reload after
 * restoring data, which would trigger auto-load again, which would
 * find the server non-empty and skip — but if the restore was slow
 * or incomplete, it could loop forever.
 *
 * The sessionStorage flag is cleared when the browser tab closes, so
 * the next time you open the app in a new tab, it will check again.
 * But by then the server should have data (from the previous restore),
 * so it will skip naturally.
 */
async function autoLoadFromLocalStorage() {
    // Guard 1: Only auto-load once per browser tab session.
    if (sessionStorage.getItem(AUTO_LOAD_FLAG)) {
        console.log('[IndexedDB] Auto-load already attempted this session, skipping');
        return false;
    }
    // Mark immediately — even if the load fails, don't retry in this session.
    sessionStorage.setItem(AUTO_LOAD_FLAG, '1');

    const backup = await loadFromLocalStorage();
    if (!backup) {
        console.log('[IndexedDB] No backup found, skipping auto-load');
        return false;
    }

    const serverEmpty = await _isServerEmpty();
    if (!serverEmpty) {
        console.log('[IndexedDB] Server has data, skipping auto-load (server is newer)');
        return false;
    }

    console.log('[IndexedDB] Server appears empty, auto-loading from IndexedDB backup...');
    return await restoreFromLocalStorage(backup);
}

/**
 * Restore all data from an IndexedDB backup.
 *
 * IMPORTANT: Only reloads the page ONCE (after all restores complete).
 * The auto-load guard (sessionStorage flag) prevents re-triggering.
 */
async function restoreFromLocalStorage(backup) {
    if (!backup) {
        if (typeof toastError === 'function') toastError('No backup found in storage');
        return false;
    }

    let restored = 0;

    // 1. Restore config
    if (backup.config) {
        const cfg = backup.config;
        if (cfg.theme) setAppearance(cfg.theme);
        if (cfg.accent) setAccentColor(cfg.accent);
        if (cfg.timezone) {
            const tzInput = document.getElementById('cfg-timezone');
            if (tzInput) tzInput.value = cfg.timezone;
        }
        const updates = {};
        if (cfg.timezone) updates.timezone = cfg.timezone;
        if (cfg.agent_max_context_tokens) updates.agent_max_context_tokens = cfg.agent_max_context_tokens;
        if (cfg.agent_max_context_turns) updates.agent_max_context_turns = cfg.agent_max_context_turns;
        if (cfg.agent_max_steps) updates.agent_max_steps = cfg.agent_max_steps;
        if (Object.keys(updates).length > 0) {
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
                console.warn(`[IndexedDB] Failed to restore session ${session.session_id}:`, e);
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
        if (typeof toastSuccess === 'function') {
            toastSuccess(`Restored ${restored} item(s) from IndexedDB storage`);
        }
        // Reload ONCE. The sessionStorage flag prevents auto-load from
        // re-triggering after this reload.
        setTimeout(() => window.location.reload(), 2000);
    } else {
        if (typeof toastInfo === 'function') toastInfo('No items needed restoration');
    }
    return restored > 0;
}

// ─── Auto-save hooks ─────────────────────────────────────────────────

window.addEventListener('beforeunload', () => {
    _doSave();
});

function _onAiResponseComplete() {
    saveToLocalStorage();
}

function _onConfigChanged() {
    saveToLocalStorage({ immediate: false });
}

// ─── Init ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Request persistent storage so data won't be evicted
    _requestPersistentStorage();

    // Auto-load from IndexedDB on first open (if server is empty)
    // Delayed slightly to let the app initialise first.
    // The sessionStorage guard ensures this only runs once per tab.
    setTimeout(() => {
        autoLoadFromLocalStorage().then((loaded) => {
            if (!loaded) {
                console.log('[IndexedDB] Auto-load skipped (already done, server has data, or no backup)');
            }
        });
    }, 3000);
});

// Manual load button handler — this ALWAYS works regardless of
// sessionStorage flag, because the user explicitly clicked the button.
async function manualLoadFromLocalStorage() {
    const backup = await loadFromLocalStorage();
    if (!backup) {
        if (typeof toastWarning === 'function') {
            toastWarning('No backup found in storage');
        } else {
            alert('No backup found in storage');
        }
        return;
    }
    if (!confirm(`Restore from storage backup saved at ${backup.saved_at}? This will re-create sessions, config, and tasks on the server.`)) {
        return;
    }
    // Clear the auto-load flag so the restore can proceed even if it
    // was already set (user is manually forcing a reload).
    sessionStorage.removeItem(AUTO_LOAD_FLAG);
    await restoreFromLocalStorage(backup);
}
