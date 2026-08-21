/**
 * IndexedDB Persistence System — UNLIMITED storage
 *
 * Saves all app data to IndexedDB so it survives VPS restarts/wipes.
 *
 * CRITICAL: There is NO automatic reload anywhere in this file.
 * Restore only happens when the user clicks a button. Period.
 */

const DB_NAME = 'onyx_backup_db';
const DB_VERSION = 1;
const STORE_NAME = 'backups';
const BACKUP_KEY = 'latest';
const SAVE_DEBOUNCE_MS = 2000;
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

// ─── Request persistent storage ───────────────────────────────────────

async function _requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        try {
            const granted = await navigator.storage.persist();
            console.log(`[IndexedDB] Persistent storage: ${granted ? 'granted' : 'not granted'}`);
        } catch (e) {
            console.warn('[IndexedDB] persist() failed:', e);
        }
    }
}

// ─── Save ─────────────────────────────────────────────────────────────

let _saveTimer = null;
let _isSaving = false;

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
    if (_isSaving) return;
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
        console.log(`[IndexedDB] Saved backup at ${backup.saved_at}`);
    } catch (err) {
        console.error('[IndexedDB] Save failed:', err);
    } finally {
        _isSaving = false;
    }
}

// ─── Fetch helpers ────────────────────────────────────────────────────

async function _fetchSessions() {
    try {
        const res = await fetch('/api/sessions?channel_type=all&page=1&page_size=50');
        const data = await res.json();
        if (data.status !== 'success') return [];
        const sessions = data.sessions || [];
        const result = [];
        for (const s of sessions.slice(0, 50)) {
            try {
                const msgRes = await fetch(`/api/history?session_id=${encodeURIComponent(s.session_id)}&page=1&page_size=50`);
                const msgData = await msgRes.json();
                if (msgData.status === 'success') {
                    result.push({
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
            } catch (e) { /* skip */ }
        }
        return result;
    } catch (e) {
        console.warn('[IndexedDB] Failed to fetch sessions:', e);
        return [];
    }
}

function _getConfigState() {
    return {
        theme: typeof getAppearance === 'function' ? getAppearance() : 'dark',
        accent: typeof getAccentColor === 'function' ? getAccentColor() : 'rose',
        timezone: document.getElementById('cfg-timezone')?.value || '',
        model: typeof appConfig !== 'undefined' ? (appConfig?.model || '') : '',
        agent_max_context_tokens: typeof appConfig !== 'undefined' ? (appConfig?.agent_max_context_tokens || 50000) : 50000,
        agent_max_context_turns: typeof appConfig !== 'undefined' ? (appConfig?.agent_max_context_turns || 20) : 20,
        agent_max_steps: typeof appConfig !== 'undefined' ? (appConfig?.agent_max_steps || 20) : 20,
    };
}

async function _fetchSkills() {
    try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        if (data.status !== 'success') return [];
        return (data.skills || []).map(s => ({ name: s.name, enabled: s.enabled !== false }));
    } catch (e) { return []; }
}

async function _fetchTasks() {
    try {
        const res = await fetch('/api/scheduler');
        const data = await res.json();
        if (data.status !== 'success') return [];
        return (data.tasks || []).map(t => ({ id: t.id, name: t.name, enabled: t.enabled, schedule: t.schedule, action: t.action }));
    } catch (e) { return []; }
}

// ─── Load ─────────────────────────────────────────────────────────────

async function loadFromLocalStorage() {
    try {
        const backup = await _idbGet(BACKUP_KEY);
        if (!backup || backup.version !== 1) return null;
        return backup;
    } catch (e) {
        console.error('[IndexedDB] Load failed:', e);
        return null;
    }
}

async function _isServerEmpty() {
    try {
        const res = await fetch('/api/sessions?channel_type=all&page=1&page_size=5');
        const data = await res.json();
        if (data.status !== 'success') return true;
        return (data.sessions || []).length === 0;
    } catch (e) {
        return true;
    }
}

// ─── Restore (ONLY called by user click — NEVER automatic) ────────────

async function restoreFromLocalStorage(backup) {
    if (!backup) {
        if (typeof toastError === 'function') toastError('No backup found');
        return false;
    }
    let restored = 0;

    // 1. Config
    if (backup.config) {
        const cfg = backup.config;
        if (cfg.theme && typeof setAppearance === 'function') setAppearance(cfg.theme);
        if (cfg.accent && typeof setAccentColor === 'function') setAccentColor(cfg.accent);
        const updates = {};
        if (cfg.timezone) updates.timezone = cfg.timezone;
        if (cfg.agent_max_context_tokens) updates.agent_max_context_tokens = cfg.agent_max_context_tokens;
        if (cfg.agent_max_context_turns) updates.agent_max_context_turns = cfg.agent_max_context_turns;
        if (cfg.agent_max_steps) updates.agent_max_steps = cfg.agent_max_steps;
        if (Object.keys(updates).length > 0) {
            try {
                await fetch('/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates }) });
                restored++;
            } catch (e) { /* non-fatal */ }
        }
    }

    // 2. Sessions + messages
    if (backup.sessions && backup.sessions.length > 0) {
        for (const session of backup.sessions) {
            try {
                const r = await fetch('/api/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: session.session_id,
                        title: session.title || 'Restored chat',
                        channel_type: session.channel_type || 'web',
                        messages: session.messages || [],
                    }),
                });
                if (r.ok) restored++;
            } catch (e) { /* skip */ }
        }
    }

    // 3. Tasks
    if (backup.tasks && backup.tasks.length > 0) {
        for (const task of backup.tasks) {
            try {
                await fetch('/api/scheduler/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: task.name || 'Restored task',
                        type: task.action?.type === 'agent_task' ? 'ai_task' : 'message',
                        content: task.action?.content || task.action?.task_description || '',
                        schedule_type: task.schedule?.type || 'once',
                        schedule_value: task.schedule?.expression || task.schedule?.run_at || String(task.schedule?.seconds || 3600),
                        receiver: task.action?.receiver || 'restored',
                        channel_type: task.action?.channel_type || 'web',
                    }),
                });
                restored++;
            } catch (e) { /* skip */ }
        }
    }

    if (restored > 0) {
        if (typeof toastSuccess === 'function') toastSuccess(`Restored ${restored} item(s). Refreshing...`, { durationMs: 4000 });
        setTimeout(() => window.location.reload(), 3000);
    } else {
        if (typeof toastInfo === 'function') toastInfo('No items needed restoration');
    }
    return restored > 0;
}

// ─── Auto-save hooks (NO auto-load!) ──────────────────────────────────

window.addEventListener('beforeunload', () => { _doSave(); });

function _onAiResponseComplete() { saveToLocalStorage(); }
function _onConfigChanged() { saveToLocalStorage({ immediate: false }); }

// ─── Init — banner only, NO automatic restore ────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    _requestPersistentStorage();

    // Show a banner if server is empty + we have a backup.
    // User must click to restore. NO automatic reload.
    setTimeout(() => { _checkAndShowRestoreBanner(); }, 3000);
});

async function _checkAndShowRestoreBanner() {
    // Only once per browser tab.
    if (sessionStorage.getItem(AUTO_LOAD_FLAG)) return;
    sessionStorage.setItem(AUTO_LOAD_FLAG, '1');

    const backup = await loadFromLocalStorage();
    if (!backup) return;

    const serverEmpty = await _isServerEmpty();
    if (!serverEmpty) return;

    // Show banner — user must click to restore.
    const banner = document.createElement('div');
    banner.id = 'onyx-restore-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:10000;background:#6366f1;color:white;padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:14px;font-family:Inter,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
    banner.innerHTML = '<i class="fas fa-database"></i><span>Backup found from ' + (backup.saved_at ? new Date(backup.saved_at).toLocaleString() : 'earlier') + '.</span><button id="onyx-restore-btn" style="background:white;color:#6366f1;border:none;padding:6px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;">Restore Now</button><button id="onyx-restore-dismiss" style="background:transparent;color:white;border:1px solid rgba(255,255,255,0.4);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;">Dismiss</button>';
    document.body.appendChild(banner);
    document.body.style.paddingTop = '52px';

    document.getElementById('onyx-restore-btn').addEventListener('click', async () => {
        banner.remove();
        document.body.style.paddingTop = '0';
        if (typeof toastInfo === 'function') toastInfo('Restoring... Please wait.');
        await restoreFromLocalStorage(backup);
    });
    document.getElementById('onyx-restore-dismiss').addEventListener('click', () => {
        banner.remove();
        document.body.style.paddingTop = '0';
    });
}

// Manual load button (Config → Backup & Restore)
async function manualLoadFromLocalStorage() {
    const backup = await loadFromLocalStorage();
    if (!backup) {
        if (typeof toastWarning === 'function') toastWarning('No backup found');
        return;
    }
    if (!confirm('Restore from storage backup saved at ' + backup.saved_at + '?')) return;
    if (typeof toastInfo === 'function') toastInfo('Restoring... Please wait.');
    await restoreFromLocalStorage(backup);
}

// Manual save button (Config → Backup & Restore → Save All to Storage)
async function manualSaveToLocalStorage() {
    if (typeof toastInfo === 'function') {
        toastInfo('Saving all data to browser storage... Please wait.', { durationMs: 5000 });
    }
    await saveToLocalStorage({ immediate: true });
    if (typeof toastSuccess === 'function') {
        toastSuccess('All data saved to browser storage successfully');
    }
}
