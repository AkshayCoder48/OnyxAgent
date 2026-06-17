/* =====================================================================
   OnyxAgent Console - Main Application Script
   ===================================================================== */

// =====================================================================
// Version — fetched from backend (single source: /VERSION file)
// =====================================================================
let APP_VERSION = '';

// =====================================================================
// i18n
// =====================================================================
const I18N = {
    en: {
        console: 'Console',
        nav_chat: 'Chat', nav_manage: 'Management', nav_monitor: 'Monitor',
        menu_chat: 'Chat', menu_config: 'Config', menu_models: 'Models', menu_skills: 'Skills',
        menu_memory: 'Memory', menu_knowledge: 'Knowledge', menu_files: 'Files', menu_tasks: 'Tasks',
        menu_fonts: 'Fonts',
        files_title: 'File Browser',
        files_desc: 'Browse and manage workspace files',
        files_upload: 'Upload',
        files_new_folder: 'New Folder',
        files_new_file: 'New File',
        files_ctx_download: 'Download',
        files_ctx_edit: 'Edit',
        files_ctx_rename: 'Rename',
        files_ctx_delete: 'Delete',
        files_rename_title: 'Rename',
        files_mkdir_title: 'New Folder',
        files_newfile_title: 'New File',
        menu_logs: 'Logs',
        models_title: 'Models',
        models_desc: 'Manage chat, image, voice, embedding and search capabilities in one place',
        models_section_vendors: 'Provider Credentials',
        models_section_vendors_desc: 'Configured once, shared by multiple model capabilities',
        models_section_capabilities: 'Capabilities',
        models_add_vendor: 'Add Provider',
        models_provider: 'Provider',
        models_model: 'Model',
        models_voice: 'Voice',
        models_configured: 'configured',
        models_not_configured: 'not configured',
        models_pick_to_configure: 'pick to configure',
        models_clear_credential: 'Clear credentials',
        models_base_default_hint: 'Leave blank to use the official default base URL',
        models_base_default: 'Default',
        models_custom_vendor_label: 'Custom',
        models_custom_name: 'Name',
        models_custom_delete: 'Delete',
        models_custom_delete_confirm_title: 'Delete custom provider',
        models_custom_delete_confirm_msg: 'Delete this custom provider? This cannot be undone.',
        models_custom_name_required: 'Name is required',
        models_custom_base_required: 'API Base is required',
        models_custom_edit_title: 'Edit custom provider',
        models_custom_add_title: 'Add custom provider',
        models_custom_headers_label: 'Custom Headers',
        models_custom_headers_optional: '(optional)',
        models_custom_headers_add: 'Add Header',
        models_custom_headers_key: 'Header name',
        models_custom_headers_value: 'Value',
        models_capability_chat: 'Main Model',
        models_capability_chat_desc: 'Used for basic chat and agent reasoning',
        models_capability_vision: 'Image Understanding',
        models_capability_vision_desc: 'Recognizes image content, used by image recognition tools',
        models_capability_image: 'Image Generation',
        models_capability_image_desc: 'Generates images, used by image generation skills',
        models_auto_using: 'Preferred',
        models_capability_asr: 'Speech Recognition',
        models_capability_asr_desc: 'Voice to text',
        models_capability_tts: 'Speech Synthesis',
        models_capability_tts_desc: 'Text to voice',
        models_capability_embedding: 'Embedding',
        models_capability_embedding_desc: 'Used for vectorized retrieval of memory and knowledge',
        models_capability_search: 'Web Search',
        models_capability_search_desc: 'Real-time web retrieval, used by search tools',
        models_strategy_auto: 'auto',
        models_search_strategy_label: 'Strategy',
        models_search_strategy_fixed: 'Pinned',
        models_search_strategy_auto_hint: 'Auto-pick from configured providers',
        models_search_strategy_fixed_hint: 'Always use a specific provider',
        models_pending_config: 'Pending setup',
        models_search_available_label: 'Available:',
        models_search_none_configured: 'No search provider enabled yet — click add.',
        models_search_add_provider: 'Add provider',
        models_search_add_desc: 'Pick a search provider to configure',
        models_search_bocha_title: 'Configure Bocha API Key',
        models_search_bocha_desc: 'Create a key at the Bocha open platform.',
        models_search_edit_hint: 'Click to edit',
        models_unavailable: 'unavailable',
        models_set_via_env: 'enable via environment variable',
        models_dim_label: 'dim',
        models_save_success: 'Saved',
        models_save_failed: 'Save failed',
        models_cleared: 'Cleared',
        models_clear_failed: 'Clear failed',
        models_embedding_change_title: 'Change embedding model',
        models_embedding_change_msg: 'Switching the embedding model invalidates the existing index — a rebuild will be needed. Continue?',
        models_embedding_saved_title: 'Embedding model updated',
        models_embedding_saved_msg: 'Send /memory rebuild-index in the chat to rebuild the index.',
        models_embedding_saved_ok: 'Go',
        models_pick_provider: 'Pick a provider',
        models_clear_confirm_title: 'Clear provider credentials',
        models_clear_confirm_msg: 'Remove this provider\'s API Key and Base URL? Capabilities relying on it will stop working.',
        cancel: 'Cancel',
        save: 'Save',
        ok: 'OK',
        knowledge_title: 'Knowledge', knowledge_desc: 'Browse and explore your knowledge base',
        knowledge_tab_docs: 'Documents', knowledge_tab_graph: 'Graph',
        knowledge_loading: 'Loading knowledge base...', knowledge_loading_desc: 'Knowledge pages will be displayed here',
        knowledge_select_hint: 'Select a document to view', knowledge_empty_hint: 'No knowledge pages yet',
        knowledge_empty_guide: 'Send documents, links or topics to the agent in chat, and it will automatically organize them into your knowledge base.',
        knowledge_go_chat: 'Start a conversation',
        welcome_subtitle: 'I can help you answer questions, manage your computer, create and execute skills, and keep growing through <br> long-term memory and a personal knowledge base.',
        example_sys_title: 'System', example_sys_text: 'Show me the files in the workspace',
        example_task_title: 'Scheduler', example_task_text: 'Remind me to check the server in 5 minutes',
        example_code_title: 'Coding', example_code_text: 'Search today\'s AI news and generate a visual report webpage',
        example_knowledge_title: 'Knowledge', example_knowledge_text: 'Show me the current knowledge base',
        example_skill_title: 'Skills', example_skill_text: 'Show current tools and skills',
        example_web_title: 'Commands', example_web_text: 'Show all commands',
        slash_help: 'Show this help',
        slash_status: 'Show running status',
        slash_context: 'Show conversation context',
        slash_context_clear: 'Clear conversation context',
        slash_skill_list: 'List installed skills',
        slash_skill_list_remote: 'Browse ClawHub',
        slash_skill_search: 'Search skills',
        slash_skill_install: 'Install a skill (name or GitHub URL)',
        slash_skill_uninstall: 'Uninstall a skill',
        slash_skill_info: 'Show skill details',
        slash_skill_enable: 'Enable a skill',
        slash_skill_disable: 'Disable a skill',
        slash_memory_dream: 'Trigger memory distillation (optional days, default 3)',
        slash_knowledge: 'Show knowledge base stats',
        slash_knowledge_list: 'Show knowledge base file tree',
        slash_knowledge_on: 'Enable knowledge base',
        slash_knowledge_off: 'Disable knowledge base',
        slash_config: 'Show current config',
        slash_cancel: 'Abort the running Agent task',
        slash_logs: 'Show recent logs',
        slash_version: 'Show version',
        input_placeholder: 'Type a message, or press / for commands',
        config_title: 'Configuration', config_desc: 'Manage model and agent settings',
        config_model: 'Model Configuration', config_agent: 'Agent Configuration',
        config_language: 'Language', config_language_hint: 'Language for the UI, command text, system prompts and more (synced with the top-right switch)',
        config_model_advanced: 'Advanced',
        config_channel: 'Channel Configuration',
        config_agent_enabled: 'Agent Mode',
        config_max_tokens: 'Max Context Tokens', config_max_tokens_hint: 'Max tokens the Agent can input per conversation, auto-compressed when exceeded',
        config_max_turns: 'Max Memory Turns', config_max_turns_hint: 'One Q&A pair = one turn, auto-compressed when exceeded',
        config_max_steps: 'Max Steps', config_max_steps_hint: 'Max tool calls the Agent can make in a single conversation',
        config_enable_thinking: 'Deep Thinking', config_enable_thinking_hint: 'Enable deep thinking mode',
        config_self_evolution: 'Self-Evolution', config_self_evolution_hint: 'Auto-review idle conversations to consolidate memory, improve skills, and follow up on unfinished tasks',
        evolution_badge: 'Self-learned',
        config_channel_type: 'Channel Type',
        config_provider: 'Provider', config_model_name: 'Model',
        config_custom_model_hint: 'Enter custom model name',
        config_save: 'Save', config_saved: 'Saved',
        config_save_error: 'Save failed',
        config_custom_option: 'Custom',
        config_custom_tip: 'API must follow OpenAI protocol.',
        config_security: 'Security', config_password: 'Password',
        config_password_hint: 'Leave empty to disable password protection',
        config_password_changed: 'Password updated, please re-login',
        config_password_cleared: 'Password cleared',
        skills_title: 'Skills', skills_desc: 'View, enable, or disable agent tools and skills', skills_hub_btn: 'ClawHub',
        skills_add_btn: 'Add Skill', skills_tab_my: 'My Skills', skills_tab_add: 'Add Skill',
        skills_tab_marketplace: 'Marketplace',
        skills_method_create: 'Create', skills_method_create_desc: 'Write SKILL.md',
        skills_method_upload: 'Upload', skills_method_upload_desc: 'Upload .zip file',
        skills_method_url: 'From URL', skills_method_url_desc: 'GitHub / .zip link',
        skills_create_title: 'Create Custom Skill', skills_create_name_label: 'Skill Name',
        skills_create_desc_label: 'Description (optional)', skills_create_content_label: 'SKILL.md Content',
        skills_create_btn: 'Create Skill', skills_create_success: 'Skill created successfully!',
        skills_create_error: 'Failed to create', skills_create_name_required: 'Skill name is required',
        skills_create_content_required: 'Skill content is required',
        skills_upload_title: 'Upload Skill Package', skills_upload_drag: 'Drag & drop .zip file here',
        skills_upload_or: 'or click to browse', skills_upload_name_label: 'Skill Name (optional, auto-detected from zip)',
        skills_upload_hint: 'The zip should contain a folder with a SKILL.md file, or directly contain SKILL.md at the root.',
        skills_upload_btn: 'Upload & Install', skills_upload_success: 'Skill uploaded and installed!',
        skills_upload_error: 'Upload failed', skills_upload_no_file: 'Please select a .zip file',
        skills_url_title: 'Install from URL', skills_url_label: 'Package URL',
        skills_url_hint: 'Supports direct .zip links from GitHub, GitLab, or any URL',
        skills_url_name_label: 'Skill Name (optional, auto-detected from URL)',
        skills_url_btn: 'Install Skill', skills_url_success: 'Skill installed successfully!',
        skills_url_error: 'Install failed', skills_url_required: 'URL is required',
        skills_delete_title: 'Delete Skill', skills_delete_msg: 'Are you sure you want to delete this skill? This action cannot be undone.',
        skills_delete_success: 'Skill deleted', skills_delete_error: 'Delete failed',
        skills_loading: 'Loading skills...', skills_loading_desc: 'Skills will be displayed here after loading',
        tools_section_title: 'Built-in Tools', tools_loading: 'Loading tools...',
        skills_section_title: 'Skills', skill_enable: 'Enable', skill_disable: 'Disable',
        skill_toggle_error: 'Operation failed, please try again',
        memory_title: 'Memory', memory_desc: 'View agent memory files and contents',
        memory_tab_files: 'Memory Files', memory_tab_dreams: 'Self-Evolution',
        memory_loading: 'Loading memory files...', memory_loading_desc: 'Memory files will be displayed here',
        memory_back: 'Back to list',
        memory_col_name: 'Filename', memory_col_type: 'Type', memory_col_size: 'Size', memory_col_updated: 'Updated',
        artifact_preview: 'Preview', artifact_open_tab: 'Open', artifact_copy: 'Copy',
        artifact_copied: 'Copied!', artifact_html: 'HTML Preview', artifact_svg: 'SVG Chart',
        artifact_chart: 'Data Visualization', artifact_mermaid: 'Mermaid Diagram',
        artifact_preview_btn: 'Preview', artifact_fullscreen: 'Fullscreen',

        tasks_title: 'Scheduled Tasks', tasks_desc: 'View and manage scheduled tasks',
        tasks_coming: 'Coming Soon', tasks_coming_desc: 'Scheduled task management will be available here',
        logs_title: 'Logs', logs_desc: 'Real-time log output (run.log)',
        logs_live: 'Live', logs_coming_msg: 'Log streaming will be available here. Connects to run.log for real-time output similar to tail -f.',
        new_chat: 'New Chat',
        session_history: 'History',
        today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier',
        delete_session_confirm: 'Delete this session? All messages will be removed.',
        delete_session_title: 'Delete Session',
        delete_message_confirm: 'Delete this message?',
        delete_message_title: 'Delete Message',
        edit_disabled_reply_active: 'Reply is being generated; editing is temporarily unavailable.',
        delete_disabled_reply_active: 'Reply is being generated; deletion is temporarily unavailable.',
        untitled_session: 'New Chat',
        context_cleared: '— Context above has been cleared —',
        tip_new_chat: 'New Chat',
        tip_clear_context: 'Clear Context',
        tip_attach: 'Add Attachment',
        attach_menu_file: 'Upload File',
        mic_idle_title: 'Click to record, click again to stop',
        mic_recording_title: 'Recording, click to stop',
        mic_busy_title: 'Transcribing…',
        mic_permission_denied: 'Cannot access microphone — check browser permissions',
        mic_too_short: 'Recording too short, please retry',
        mic_error: 'Speech recognition failed',
        speak_msg: 'Read this reply aloud',
        voice_reply_mode_label: 'Voice reply policy',
        voice_reply_off: 'Off',
        voice_reply_if_voice: 'Voice only if voice input',
        voice_reply_always: 'Always reply with voice',
        attach_menu_folder: 'Upload Folder',
        confirm_yes: 'Confirm',
        confirm_cancel: 'Cancel',
        error_send: 'Failed to send. Please try again.', error_timeout: 'Request timeout. Please try again.',
        thinking_in_progress: 'Thinking...', thinking_done: 'Thought', thinking_duration: 'Duration',
        edit_message: 'Edit message',
        regenerate_response: 'Regenerate',
        edit_save: 'Save and send',
        edit_cancel: 'Cancel',
    }
};

// Language is locked to English. The app is English-only — all Chinese and
// other language references have been removed. `currentLang` is kept as a
// constant so the rest of the file (which references it in a few places)
// continues to work without further edits, but it always resolves to 'en'.
let currentLang = 'en';

function t(key) {
    return (I18N.en && I18N.en[key]) || key;
}

// Resolve a localized label that may be either a plain string or
// a {zh, en} object returned by the backend. English-only.
function localizedLabel(label) {
    if (label && typeof label === 'object') {
        return label.en || '';
    }
    return label || '';
}

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset['i18nPlaceholder']);
    });
    document.querySelectorAll('[data-tip-key]').forEach(el => {
        el.setAttribute('data-tooltip', t(el.dataset.tipKey));
    });
    installCfgTipPortal();
}

// No-op language setter — the app is English-only. Kept for backward
// compatibility with any code that still calls setLanguage().
function setLanguage(_lang) {
    currentLang = 'en';
    applyI18n();
}

// Persist the language to the backend `onyx_lang` config (best-effort).
// Always sends 'en' since the app is English-only.
function syncLanguageToBackend(_lang) {
    try {
        fetch('/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { onyx_lang: 'en' } })
        }).catch(() => {});
    } catch (e) {}
}

// No-op: language controls were removed from the UI (English-only app).
function updateLangControls() {}

// No-op: language toggle was removed from the header.
function toggleLanguage() {}

// Refresh JS-rendered views after a language switch. Each branch uses the
// lightweight in-memory re-render path (no extra network round-trips).
function rerenderDynamicViews() {
    if (currentView === 'models' && typeof renderModelsView === 'function'
            && modelsState && (modelsState.providers || modelsState.capabilities)) {
        renderModelsView();
    }
}

// Floating tooltip portal for [data-tip-key] elements. Tooltip nodes are
// appended to <body> so they aren't clipped by overflow:hidden ancestors
// (e.g. the config panel's scroll container).
let _cfgTipPortalEl = null;
let _cfgTipPortalInstalled = false;
function installCfgTipPortal() {
    if (_cfgTipPortalInstalled) return;
    _cfgTipPortalInstalled = true;

    const showTip = (target) => {
        const text = target.getAttribute('data-tooltip');
        if (!text) return;
        if (!_cfgTipPortalEl) {
            _cfgTipPortalEl = document.createElement('div');
            _cfgTipPortalEl.className = 'cfg-tip-floating';
            document.body.appendChild(_cfgTipPortalEl);
        }
        _cfgTipPortalEl.textContent = text;
        const rect = target.getBoundingClientRect();
        // Render once to measure, then position above the target, centered.
        _cfgTipPortalEl.style.left = '0px';
        _cfgTipPortalEl.style.top = '0px';
        _cfgTipPortalEl.classList.add('show');
        const tipRect = _cfgTipPortalEl.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - tipRect.width / 2;
        // Clamp horizontally to the viewport with an 8px gutter.
        left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
        const top = rect.top - tipRect.height - 6;
        _cfgTipPortalEl.style.left = left + 'px';
        _cfgTipPortalEl.style.top = top + 'px';
    };
    const hideTip = () => {
        if (_cfgTipPortalEl) _cfgTipPortalEl.classList.remove('show');
    };

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tip-key]');
        if (target) showTip(target);
    });
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-tip-key]');
        if (target) hideTip();
    });
    // Hide on scroll/resize so the tooltip doesn't drift away from its anchor.
    window.addEventListener('scroll', hideTip, true);
    window.addEventListener('resize', hideTip);
}

// =====================================================================
// Theme
// =====================================================================
let currentTheme = localStorage.getItem('onyx_theme') || 'dark';

function applyTheme() {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
        root.classList.add('dark');
        document.getElementById('theme-icon').className = 'fas fa-sun';
        document.getElementById('hljs-light').disabled = true;
        document.getElementById('hljs-dark').disabled = false;
    } else {
        root.classList.remove('dark');
        document.getElementById('theme-icon').className = 'fas fa-moon';
        document.getElementById('hljs-light').disabled = false;
        document.getElementById('hljs-dark').disabled = true;
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('onyx_theme', currentTheme);
    applyTheme();
}

// =====================================================================
// PWA Install
// =====================================================================
function installPWA() {
    const prompt = window.__onyxInstallPrompt;
    if (!prompt) {
        // Fallback: show instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            alert('To install OnyxAgent:\n\n1. Tap the Share button (⬆️) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
        } else {
            alert('To install OnyxAgent:\n\n1. Look for the install icon in your browser\'s address bar\n2. Or use browser menu → "Install app" / "Add to Home Screen"');
        }
        return;
    }
    prompt.prompt();
    prompt.userChoice.then((result) => {
        console.log('[PWA] Install prompt result:', result.outcome);
        window.__onyxInstallPrompt = null;
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.classList.add('hidden');
    });
}

// =====================================================================
// Sidebar & Navigation
// =====================================================================
const VIEW_META = {
    chat:     { group: 'nav_chat',    page: 'menu_chat' },
    config:   { group: 'nav_manage',  page: 'menu_config' },
    models:   { group: 'nav_manage',  page: 'menu_models' },
    skills:   { group: 'nav_manage',  page: 'menu_skills' },
    memory:   { group: 'nav_manage',  page: 'menu_memory' },
    knowledge:{ group: 'nav_manage',  page: 'menu_knowledge' },
    files:    { group: 'nav_manage',  page: 'menu_files' },
    tasks:    { group: 'nav_manage',  page: 'menu_tasks' },
    fonts:    { group: 'nav_manage',  page: 'menu_fonts' },
    logs:     { group: 'nav_monitor', page: 'menu_logs' },
};

let currentView = 'chat';

function navigateTo(viewId) {
    if (!VIEW_META[viewId]) return;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewId);
    });
    const meta = VIEW_META[viewId];
    document.getElementById('breadcrumb-group').textContent = t(meta.group);
    document.getElementById('breadcrumb-group').dataset.i18n = meta.group;
    document.getElementById('breadcrumb-page').textContent = t(meta.page);
    document.getElementById('breadcrumb-page').dataset.i18n = meta.page;
    currentView = viewId;
    if (window.innerWidth < 1024) closeSidebar();
    if (viewId === 'files') filesLoadDirectory();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    if (isOpen) {
        closeSidebar();
    } else {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    }
}

function closeSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.add('hidden');
}

document.querySelectorAll('.menu-group > button').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('open');
    });
});

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.view));
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        document.getElementById('sidebar').classList.remove('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    } else {
        if (!document.getElementById('sidebar').classList.contains('-translate-x-full')) {
            closeSidebar();
        }
    }
});

// =====================================================================
// Markdown Renderer
// =====================================================================
const FALLBACK_HLJS = {
    getLanguage() { return false; },
    highlight(str) { return { value: escapeHtml(str) }; },
    highlightAuto(str) { return { value: escapeHtml(str) }; },
    highlightElement() {},
};

function getHljs() {
    return window.hljs || FALLBACK_HLJS;
}

function createMd() {
    const hljsLib = getHljs();
    const mdFactory = window.markdownit;
    if (typeof mdFactory !== 'function') {
        return {
            render(text) {
                return `<p>${escapeHtml(text || '')}</p>`;
            }
        };
    }
    const md = mdFactory({
        html: false, breaks: true, linkify: true, typographer: true,
        highlight: function(str, lang) {
            if (lang && hljsLib.getLanguage(lang)) {
                try { return hljsLib.highlight(str, { language: lang }).value; } catch (_) {}
            }
            return hljsLib.highlightAuto(str).value;
        }
    });
    const defaultLinkOpen = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };
    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
        tokens[idx].attrPush(['target', '_blank']);
        tokens[idx].attrPush(['rel', 'noopener noreferrer']);
        return defaultLinkOpen(tokens, idx, options, env, self);
    };
    return md;
}

const md = createMd();

const VIDEO_EXT_RE = /\.(?:mp4|webm|mov|avi|mkv)$/i;  // tested against URL without query string
const IMAGE_EXT_RE = /\.(?:jpg|jpeg|png|gif|webp|bmp|svg)$/i;  // tested against URL without query string

function _toWebUrl(url) {
    if (/^\/[A-Za-z]/.test(url) && !url.startsWith('/api/')) {
        return '/api/file?path=' + encodeURIComponent(url);
    }
    if (/^file:\/\/\//i.test(url)) {
        return '/api/file?path=' + encodeURIComponent(url.replace(/^file:\/\/\//i, '/'));
    }
    return url;
}

function _buildVideoHtml(url) {
    const webUrl = _toWebUrl(url);
    const fileName = url.split('/').pop().split('?')[0];
    return `<div style="margin:10px 0;">` +
        `<video controls preload="metadata" ` +
        `style="max-width:100%;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:block;">` +
        `<source src="${webUrl}"></video>` +
        `<a href="${webUrl}" target="_blank" ` +
        `style="display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:12px;color:#8b8fa8;text-decoration:none;">` +
        `<i class="fas fa-download"></i> ${escapeHtml(fileName)}</a></div>`;
}

function _openImageLightbox(src) {
    let overlay = document.getElementById('onyx-lightbox');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'onyx-lightbox';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out;opacity:0;transition:opacity .2s';
        overlay.onclick = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.style.display = 'none', 200); };
        const img = document.createElement('img');
        img.id = 'onyx-lightbox-img';
        img.style.cssText = 'max-width:92vw;max-height:92vh;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.5);object-fit:contain;';
        img.onclick = (e) => e.stopPropagation();
        overlay.appendChild(img);
        document.body.appendChild(overlay);
    }
    overlay.querySelector('#onyx-lightbox-img').src = src;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.style.opacity = '1');
}

function _buildImageHtml(url) {
    const webUrl = _toWebUrl(url);
    const safeUrl = webUrl.replace(/"/g, '&quot;');
    return `<div style="margin:10px 0;">` +
        `<img src="${safeUrl}" alt="image" loading="lazy" ` +
        `onclick="_openImageLightbox(this.src)" ` +
        `style="max-width:520px;width:100%;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:block;cursor:zoom-in;">` +
        `</div>`;
}

function injectVideoPlayers(html) {
    // Step 1: replace markdown-it anchor tags whose href points to a video file.
    const step1 = html.replace(
        /<a\s+href="(https?:\/\/[^"]+)"[^>]*>[^<]*<\/a>/gi,
        (match, url) => VIDEO_EXT_RE.test(url.split('?')[0]) ? _buildVideoHtml(url) : match
    );
    // Step 2: replace any remaining bare video URLs in text nodes (not inside HTML tags).
    // Split on HTML tags to avoid touching src/href attributes already in markup.
    return step1.split(/(<[^>]+>)/).map((chunk, idx) => {
        // Even indices are text nodes; odd indices are HTML tags — leave them untouched.
        if (idx % 2 !== 0) return chunk;
        return chunk.replace(/https?:\/\/\S+/gi, (url) => {
            const bare = url.replace(/[),.\s]+$/, '');  // strip trailing punctuation
            return VIDEO_EXT_RE.test(bare.split('?')[0]) ? _buildVideoHtml(bare) : url;
        });
    }).join('');
}

// Convert image URLs into inline <img> previews. Mirrors injectVideoPlayers but for images.
// Handles three cases produced by markdown-it:
//   1. <a href="...image.jpg">...</a>  (bare URL or autolink that linkify turned into an anchor)
//   2. <img src="...">                  (markdown image syntax) — leave as-is, but normalize style
//   3. raw URL still present in a text node                    — only as a safety net
function injectImagePreviews(html) {
    // Step 1: anchor whose href points to an image file -> replace with <img> preview.
    const step1 = html.replace(
        /<a\s+href="(https?:\/\/[^"]+)"[^>]*>[^<]*<\/a>/gi,
        (match, url) => IMAGE_EXT_RE.test(url.split('?')[0]) ? _buildImageHtml(url) : match
    );
    // Step 2: bare image URLs left in text nodes (rare — markdown-it's linkify usually catches them).
    return step1.split(/(<[^>]+>)/).map((chunk, idx) => {
        if (idx % 2 !== 0) return chunk;
        return chunk.replace(/https?:\/\/\S+/gi, (url) => {
            const bare = url.replace(/[),.\s]+$/, '');
            return IMAGE_EXT_RE.test(bare.split('?')[0]) ? _buildImageHtml(bare) : url;
        });
    }).join('');
}

function _rewriteLocalImgSrc(html) {
    return html.replace(/<img\s([^>]*?)src="([^"]+)"([^>]*?)>/gi, (match, pre, src, post) => {
        const webSrc = _toWebUrl(src);
        const safeSrc = webSrc.replace(/"/g, '&quot;');
        const hasClick = /onclick/i.test(pre + post);
        const clickAttr = hasClick ? '' : ` onclick="_openImageLightbox(this.src)" style="cursor:zoom-in;"`;
        // If this <img> fails to load, swap it for an inline placeholder instead of showing
        // the broken-image glyph (or leaking the alt text into the layout). This stops
        // AI-generated markdown like `![About Me](fake-file.png)` from rendering the alt
        // text as a duplicate heading.
        const hasOnerror = /onerror/i.test(pre + post);
        const onerrorAttr = hasOnerror ? '' : ` onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'onyx-broken-img',textContent:this.alt||''}))"`;
        return `<img ${pre}src="${safeSrc}"${post}${clickAttr}${onerrorAttr}>`;
    });
}

// =====================================================================
// Typewriter fade-in — gives streaming content a smooth, seamless reveal
// =====================================================================
// On every delta render we briefly toggle a CSS class on the content element.
// The class triggers a 250ms opacity animation on newly-rendered child nodes,
// so text appears to fade in smoothly character-by-character (driven by the
// speed of incoming deltas from the LLM, not an artificial speed slider).
function _onyxTriggerTypewriterFade(contentEl) {
    if (!contentEl) return;
    // Force a reflow so the animation restarts on each render.
    contentEl.classList.remove('onyx-typewriter-fade');
    void contentEl.offsetWidth; // reflow
    contentEl.classList.add('onyx-typewriter-fade');
}

// =====================================================================
// "Still thinking..." indicator — pulsing dots when LLM is silent >2s
// =====================================================================
// Shows 3 pulsing dots at the bottom of the streaming bubble when:
//   - The agent has started replying (delta received at least once)
//   - No new delta has arrived in >2 seconds
//   - We are NOT in a tool-execution phase (tool_start was the most recent)
//   - The stream hasn't ended (no message_end with has_tool_calls=false yet)
// Hidden immediately the moment a new delta arrives OR a tool starts.

const ONYX_STILL_THINKING_THRESHOLD_MS = 2000;
let _onyxStillThinkingInterval = null;

function _onyxEnsureStillThinkingMonitor() {
    if (_onyxStillThinkingInterval) return;
    _onyxStillThinkingInterval = setInterval(() => {
        // Find all active streaming content elements.
        document.querySelectorAll('.answer-content.sse-streaming').forEach(el => {
            if (!el._onyxLastDeltaTs) return; // no delta yet — agent still warming up
            const elapsed = Date.now() - el._onyxLastDeltaTs;
            if (elapsed > ONYX_STILL_THINKING_THRESHOLD_MS && !el._onyxToolActive) {
                _onyxShowStillThinking(el);
            }
        });
    }, 500);
}

function _onyxShowStillThinking(contentEl) {
    if (!contentEl) return;
    let indicator = contentEl.querySelector('.onyx-still-thinking');
    if (indicator) return; // already showing
    indicator = document.createElement('div');
    indicator.className = 'onyx-still-thinking';
    indicator.innerHTML = '<span class="onyx-dot"></span><span class="onyx-dot"></span><span class="onyx-dot"></span>';
    contentEl.appendChild(indicator);
}

function _onyxHideStillThinking(contentEl) {
    if (!contentEl) return;
    const indicator = contentEl.querySelector('.onyx-still-thinking');
    if (indicator) indicator.remove();
}

// Kick off the monitor once the script loads.
if (typeof window !== 'undefined') {
    _onyxEnsureStillThinkingMonitor();
}

function renderMarkdown(text) {
    try {
        // Pre-process: truncate long base64 data URLs in plain text so they
        // don't blow up the chat bubble.  We preserve the prefix so the user
        // can still see what it is, but collapse the payload.
        let processed = _truncateDataUris(text);
        // Pre-process: wrap bare JSON card objects (not already in code fences)
        // in ```json fences so the card processor can render them as cards.
        // This catches cases where the AI outputs `json { "component": ... }`
        // or just `{ "component": ... }` without proper markdown fencing.
        processed = _wrapBareCardJson(processed);
        let html = md.render(processed);
        html = _rewriteLocalImgSrc(html);
        // Order matters: video first (more specific), then image.
        html = injectImagePreviews(injectVideoPlayers(html));
        // Truncate any remaining base64 blobs that survived markdown (e.g. in <code>)
        html = _truncateBase64InHtml(html);
        // Note: Code block headers are added via DOM manipulation after insertion
        // See addCodeBlockHeadersToElement()
        return html;
    }
    catch (e) { return text.replace(/\n/g, '<br>'); }
}

/**
 * Pre-process raw markdown: find bare JSON objects containing a "component"
 * field that are NOT already inside a fenced code block, and wrap them in
 * ```json fences so markdown-it renders them as <pre><code class="language-json">
 * blocks — which the Onyx card processor then turns into interactive cards.
 *
 * Handles these AI output patterns:
 *   1. `json { "component": ... }`        (word "json" as prefix)
 *   2. `{ "component": ... }`              (bare object)
 *   3. ```json\n{ ... }\n```               (already fenced — left alone)
 */
function _wrapBareCardJson(text) {
    // Remove fenced code blocks temporarily so we don't touch their contents.
    // Match ```lang ... ``` blocks (including the json ones).
    const fencePattern = /```[\s\S]*?```/g;
    const placeholders = [];
    let working = text.replace(fencePattern, (m) => {
        const ph = `\x00FENCE${placeholders.length}\x00`;
        placeholders.push(m);
        return ph;
    });

    // Pattern 1: `json { ... }` — the word "json" (possibly with colon) before a brace.
    // Capture the JSON object that follows.
    working = working.replace(/(?:^|\n)\s*json\s*:?\s*(\{[\s\S]*?"component"[\s\S]*?\})\s*(?=\n|$)/g,
        (match, jsonObj) => {
            return '\n```json\n' + jsonObj.trim() + '\n```\n';
        });

    // Pattern 2: bare `{ "component": ... }` on its own (not after "json").
    // We scan line by line and find balanced JSON objects containing "component".
    working = _wrapBareComponentObjects(working);

    // Restore fenced code blocks
    working = working.replace(/\x00FENCE(\d+)\x00/g, (m, idx) => placeholders[parseInt(idx)]);

    return working;
}

/**
 * Scan text for bare `{ ... "component" ... }` JSON objects that are NOT
 * inside a code fence, and wrap each one in a ```json fence.
 * Uses brace-matching to find the complete object.
 */
function _wrapBareComponentObjects(text) {
    let result = '';
    let i = 0;
    while (i < text.length) {
        // Look for a '{' that might start a card JSON
        if (text[i] === '{') {
            // Try to find a balanced JSON object starting here
            const obj = _tryExtractJsonObject(text, i);
            if (obj && obj.json.includes('"component"')) {
                // Verify it parses and has a component field
                try {
                    const parsed = JSON.parse(obj.json);
                    if (parsed && parsed.component && typeof parsed.component === 'string') {
                        // Check we're not already inside a code fence placeholder
                        result += '```json\n' + obj.json + '\n```';
                        i = obj.endIndex;
                        continue;
                    }
                } catch (_) {
                    // Not valid JSON — fall through and keep the char
                }
            }
        }
        result += text[i];
        i++;
    }
    return result;
}

/**
 * Starting at index `start` (which must point at '{'), attempt to extract a
 * balanced JSON object string. Returns { json, endIndex } or null.
 */
function _tryExtractJsonObject(text, start) {
    if (text[start] !== '{') return null;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        if (ch === '}') {
            depth--;
            if (depth === 0) {
                return { json: text.slice(start, i + 1), endIndex: i + 1 };
            }
        }
    }
    return null;
}

/**
 * Truncate data-URI strings in raw markdown *before* rendering.
 * Keeps the scheme + media type + first ~40 chars of the payload so the
 * user can identify the asset, then adds "[…truncated]".
 * Image-style data URIs that markdown-it will turn into <img> are left
 * alone so the image still renders.
 */
function _truncateDataUris(text) {
    // Only truncate data URIs that are NOT markdown image syntax ![…](data:…)
    return text.replace(/(?<!!\[[^\]]*\]\()data:([a-zA-Z0-9/+.-]+\/[a-zA-Z0-9/+.-]+);base64,([A-Za-z0-9+/=]{80,})/g,
        (match, mimeType, payload) => {
            const head = payload.slice(0, 40);
            const totalLen = payload.length;
            return `data:${mimeType};base64,${head}…[base64 truncated, ${totalLen.toLocaleString()} chars total]`;
        });
}

/**
 * Post-process rendered HTML: truncate any base64 blobs that are still
 * visible as text (e.g. inside <code> tags or plain text nodes).
 */
function _truncateBase64InHtml(html) {
    // Match long base64 strings that appear as visible text (not inside <img src>)
    return html.replace(/(?<!src=["'])\b([A-Za-z0-9+/]{200,}={0,2})\b/g,
        (match, blob) => {
            const head = blob.slice(0, 60);
            return `${head}…[base64 truncated]`;
        });
}

function _addCodeBlockHeaders(container) {
    // Add header with language label and copy button to each <pre> block using DOM manipulation
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
        if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrapper')) return;
        // Skip <pre> elements inside onyx-tool-card — they have their own styling
        if (pre.closest('.onyx-tool-card')) return;
        
        const codeEl = pre.querySelector('code');
        if (!codeEl) return;
        
        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
        const language = langClass ? langClass.replace('language-', '') : '';
        // Hide label for unknown/empty languages (e.g. language-undefined)
        const showLang = language && language !== 'undefined' && language !== 'code';
        const langLabel = showLang ? language.charAt(0).toUpperCase() + language.slice(1) : '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        const header = document.createElement('div');
        header.className = 'code-block-header';
        header.innerHTML = `
            <span class="code-block-lang">${langLabel}</span>
            <button class="code-copy-btn" title="Copy code">
                <i class="fas fa-copy"></i>
            </button>
        `;
        
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
    });
}

// =====================================================================
// Chat Module
// =====================================================================
let isPolling = false;
let pollGeneration = 0;   // incremented on each restart to cancel stale poll loops
let loadingContainers = {};
let activeStreams = {};   // request_id -> EventSource
let sessionActiveRequest = {};   // session_id -> request_id (in-flight stream per session)

function isCurrentSessionConversationActive() {
    return !!sessionActiveRequest[sessionId];
}

function updateEditButtonsState() {
    const active = isCurrentSessionConversationActive();
    document.querySelectorAll('.edit-msg-btn, .delete-msg-btn').forEach(btn => {
        btn.disabled = active;
        if (btn.classList.contains('edit-msg-btn')) {
            btn.title = active
                ? t('edit_disabled_reply_active')
                : t('edit_message');
        } else {
            btn.title = active
                ? t('delete_disabled_reply_active')
                : t('delete_message_title');
        }
    });
}
let streamBuffers = {};   // request_id -> { items: [event...], timestamp } for re-attach replay
let isComposing = false;
let appConfig = { use_agent: false, title: 'OnyxAgent', subtitle: '', providers: {}, api_bases: {} };

const SESSION_ID_KEY = 'onyx_session_id';

function generateSessionId() {
    return 'session_' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// Restore session_id from localStorage so conversation history survives page refresh.
// A new id is only generated when the user explicitly starts a new chat.
function loadOrCreateSessionId() {
    const stored = localStorage.getItem(SESSION_ID_KEY);
    if (stored) return stored;
    const fresh = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, fresh);
    return fresh;
}

let sessionId = loadOrCreateSessionId();

// ---- Conversation history state ----
let historyPage = 0;       // last page fetched (0 = nothing fetched yet)
let historyHasMore = false;
let historyLoading = false;

fetch('/config').then(r => r.json()).then(data => {
    if (data.status === 'success') {
        appConfig = data;
        const title = data.title || 'OnyxAgent';
        document.getElementById('welcome-title').textContent = title;
        initConfigView(data);
    }
    loadHistory(1);
}).catch(() => { loadHistory(1); });

// Start polling immediately so scheduler/push messages are received at any time
startPolling();

const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-input');
const folderInput = document.getElementById('folder-input');
const attachBtn = document.getElementById('attach-btn');
const attachMenu = document.getElementById('attach-menu');
const attachFolderOption = document.getElementById('attach-folder-option');
const supportsDirectoryUpload = !!folderInput && 'webkitdirectory' in folderInput;

if (!supportsDirectoryUpload && attachFolderOption) {
    attachFolderOption.classList.add('hidden');
}

// ---------------- Mic button: in-page voice input via the configured ASR provider ----------------
(function setupMicButton() {
    const micBtn = document.getElementById('mic-btn');
    if (!micBtn) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ||
        typeof window.MediaRecorder === 'undefined') {
        micBtn.style.display = 'none';
        return;
    }

    let mediaRecorder = null;
    let stream = null;
    let chunks = [];
    let recording = false;

    const setIdle = () => {
        recording = false;
        micBtn.classList.remove('text-red-500', 'animate-pulse');
        micBtn.classList.add('text-slate-400');
        micBtn.querySelector('i').className = 'fas fa-microphone text-sm';
        micBtn.title = t('mic_idle_title');
    };
    const setRecording = () => {
        recording = true;
        micBtn.classList.remove('text-slate-400');
        micBtn.classList.add('text-red-500', 'animate-pulse');
        micBtn.querySelector('i').className = 'fas fa-stop text-sm';
        micBtn.title = t('mic_recording_title');
    };
    const setBusy = () => {
        micBtn.classList.remove('text-red-500', 'animate-pulse', 'text-slate-400');
        micBtn.classList.add('text-primary-500');
        micBtn.querySelector('i').className = 'fas fa-spinner fa-spin text-sm';
        micBtn.title = t('mic_busy_title');
    };

    const pickMimeType = () => {
        const candidates = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
        ];
        for (const m of candidates) {
            if (window.MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
                return m;
            }
        }
        return '';
    };

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
    };

    let _micTipTimer = null;
    const flashError = (msg) => {
        console.warn('[mic]', msg);
        // Pop a small bubble above the mic so the user actually notices it.
        // The mic lives inside a relatively-positioned wrapper around the
        // textarea (see chat.html), so we hang the tip off that wrapper.
        const wrapper = micBtn.parentElement;
        if (!wrapper) return;
        let tip = wrapper.querySelector('.mic-tip');
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'mic-tip absolute right-1 bottom-full mb-2 px-2 py-1 rounded-md '
                + 'text-xs text-white bg-slate-800/90 dark:bg-slate-700/90 shadow-md '
                + 'pointer-events-none whitespace-nowrap z-10';
            wrapper.appendChild(tip);
        }
        tip.textContent = msg;
        tip.style.opacity = '1';
        if (_micTipTimer) clearTimeout(_micTipTimer);
        _micTipTimer = setTimeout(() => {
            tip.style.opacity = '0';
            tip.style.transition = 'opacity 200ms';
            setTimeout(() => tip.remove(), 250);
        }, 2000);
    };

    const upload = async (blob, ext) => {
        setBusy();
        const fd = new FormData();
        fd.append('file', blob, `recording.${ext}`);
        try {
            const resp = await fetch('/api/voice/asr', { method: 'POST', body: fd });
            const data = await resp.json();
            if (data.status === 'success' && data.text) {
                // Voice-message UX: drop the recording into the conversation
                // as a playable bubble with the caption underneath, then
                // dispatch the recognised text through the regular send path.
                sendVoiceMessage(data.text, data.audio_url);
            } else {
                flashError(data.message || t('mic_error'));
            }
        } catch (e) {
            flashError(t('mic_error') + ': ' + e.message);
        } finally {
            setIdle();
        }
    };

    const start = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            flashError(t('mic_permission_denied'));
            return;
        }
        chunks = [];
        const mimeType = pickMimeType();
        try {
            mediaRecorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
        } catch (e) {
            stopStream();
            flashError(t('mic_error') + ': ' + e.message);
            return;
        }
        mediaRecorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };
        mediaRecorder.onstop = () => {
            stopStream();
            const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            // Map mime -> extension so the server picks the right file suffix.
            const mt = (mediaRecorder.mimeType || 'audio/webm').split(';')[0];
            const extMap = {
                'audio/webm': 'webm', 'audio/ogg': 'ogg',
                'audio/mp4': 'm4a',   'audio/mpeg': 'mp3',
            };
            const ext = extMap[mt] || 'webm';
            // 256 bytes ~ container header only, no actual audio. Anything
            // below that we treat as "tapped by mistake".
            if (blob.size < 256) {
                setIdle();
                flashError(t('mic_too_short'));
                return;
            }
            upload(blob, ext);
        };
        // timeslice=250ms: force the recorder to flush a chunk every 250ms.
        // Without it some browsers wait for stop() before producing any data,
        // which loses the audio on very short taps.
        mediaRecorder.start(250);
        recordStartedAt = Date.now();
        setRecording();
    };

    let recordStartedAt = 0;

    const stopWithMinDuration = () => {
        const elapsed = Date.now() - recordStartedAt;
        const minMs = 350;
        if (elapsed < minMs) {
            // Give the recorder a moment to capture at least one chunk
            // before we tell it to stop.
            setTimeout(() => stop(), minMs - elapsed);
        } else {
            stop();
        }
    };

    const stop = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    };

    micBtn.addEventListener('click', () => {
        if (recording) {
            stopWithMinDuration();
        } else {
            start();
        }
    });

    setIdle();
})();

// Smart auto-scroll: pause when user scrolls up, resume when near bottom
let _autoScrollEnabled = true;
const _SCROLL_THRESHOLD = 80; // px from bottom to re-enable auto-scroll

messagesDiv.addEventListener('scroll', () => {
    const distFromBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight;
    _autoScrollEnabled = distFromBottom <= _SCROLL_THRESHOLD;
    _updateScrollToBottomBtn();
});

// Intercept internal navigation links in chat messages
messagesDiv.addEventListener('click', (e) => {
    // Code block copy button
    const codeCopyBtn = e.target.closest('.code-copy-btn');
    if (codeCopyBtn) {
        e.preventDefault();
        const wrapper = codeCopyBtn.closest('.code-block-wrapper');
        const codeEl = wrapper && wrapper.querySelector('pre code');
        if (codeEl) {
            const codeText = codeEl.textContent;
            copyToClipboard(codeText).then(() => {
                const icon = codeCopyBtn.querySelector('i');
                if (icon) { icon.className = 'fas fa-check'; setTimeout(() => { icon.className = 'fas fa-copy'; }, 1500); }
            });
        }
        return;
    }

    const copyBtn = e.target.closest('.copy-msg-btn');
    if (copyBtn) {
        e.preventDefault();
        const msgRoot = copyBtn.closest('.flex.gap-3');
        const answerEl = msgRoot && msgRoot.querySelector('.answer-content');
        const rawMd = answerEl && answerEl.dataset.rawMd;
        if (rawMd) {
            copyToClipboard(rawMd).then(() => {
                const icon = copyBtn.querySelector('i');
                if (icon) { icon.className = 'fas fa-check'; setTimeout(() => { icon.className = 'fas fa-copy'; }, 1500); }
            });
        }
        return;
    }

    // Edit user message
    const editBtn = e.target.closest('.edit-msg-btn');
    if (editBtn) {
        e.preventDefault();
        if (isCurrentSessionConversationActive()) return;
        const msgRoot = editBtn.closest('.user-message-group');
        if (msgRoot) editUserMessage(msgRoot);
        return;
    }

    // Regenerate bot response
    const regenerateBtn = e.target.closest('.regenerate-msg-btn');
    if (regenerateBtn) {
        e.preventDefault();
        const botMsgRoot = regenerateBtn.closest('.flex.gap-3');
        if (botMsgRoot) regenerateResponse(botMsgRoot);
        return;
    }

    // Delete message (user bubble only; bot bubbles intentionally lack a
    // delete button — removing only the bot reply would leave an orphan
    // user message that breaks LLM context alternation).
    const deleteBtn = e.target.closest('.delete-msg-btn');
    if (deleteBtn) {
        e.preventDefault();
        if (isCurrentSessionConversationActive()) return;
        const userMsgEl = deleteBtn.closest('.user-message-group');
        if (!userMsgEl) return;

        showConfirmModal(t('delete_message_title'), t('delete_message_confirm'), () => {
            // Find the next bot reply for this turn (skip non-message nodes).
            let botReplyEl = null;
            let sibling = userMsgEl.nextElementSibling;
            while (sibling) {
                if (sibling.classList && sibling.classList.contains('bot-message-group')) {
                    botReplyEl = sibling;
                    break;
                }
                sibling = sibling.nextElementSibling;
            }
            userMsgEl.remove();
            if (botReplyEl) botReplyEl.remove();

            const userSeq = userMsgEl.dataset.seq;
            if (userSeq) {
                fetch('/api/messages/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, user_seq: parseInt(userSeq) })
                }).then(r => r.json()).then(data => {
                    if (data.status === 'success') console.log(`Deleted ${data.deleted} messages`);
                }).catch(err => console.error('Failed to delete:', err));
            }
        });
        return;
    }

    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href === '/memory/dreams') {
        e.preventDefault();
        navigateTo('memory');
        setTimeout(() => switchMemoryTab('dreams'), 50);
    } else if (href === '/memory/MEMORY.md') {
        e.preventDefault();
        navigateTo('memory');
        setTimeout(() => { switchMemoryTab('files'); openMemoryFile('MEMORY.md', 'memory'); }, 50);
    }
});
const attachmentPreview = document.getElementById('attachment-preview');

// Pending attachments: [{file_path, file_name, file_type, preview_url}]
// Items with _uploading=true are still in flight.
let pendingAttachments = [];
let uploadingCount = 0;

// Input history (like terminal arrow-key recall)
const inputHistory = [];
let historyIdx = -1;
let historySavedDraft = '';

// While an SSE stream is in flight, the send button morphs into a cancel
// button. Only one in-flight request is supported at a time.
let activeRequestId = null;
let sendBtnMode = 'send'; // 'send' | 'cancel'

function setSendBtnCancelMode(requestId) {
    activeRequestId = requestId;
    sendBtnMode = 'cancel';
    sendBtn.disabled = false;
    sendBtn.classList.add('send-btn-cancel');
    sendBtn.title = ('Cancel');
    sendBtn.innerHTML = '<i class="fas fa-stop text-sm"></i>';
}

function resetSendBtnSendMode() {
    activeRequestId = null;
    sendBtnMode = 'send';
    sendBtn.classList.remove('send-btn-cancel');
    sendBtn.title = '';
    sendBtn.innerHTML = '<i class="fas fa-paper-plane text-sm"></i>';
    updateSendBtnState();
}

function requestCancel() {
    const reqId = activeRequestId;
    if (!reqId) return;
    fetch('/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: reqId, session_id: sessionId, lang: currentLang }),
    }).catch(err => {
        console.warn('[cancel] request failed', err);
    });
    // Optimistic UI lock so the click visibly registers before the SSE
    // "cancelled" event arrives.
    sendBtn.disabled = true;
    sendBtn.title = ('Cancelled');
}

// Button click is the only path to Cancel. Pressing Enter still calls
// sendMessage() so users can submit "/cancel" as a regular slash command.
sendBtn.addEventListener('click', () => {
    if (sendBtnMode === 'cancel') {
        requestCancel();
    } else {
        sendMessage();
    }
});

function updateSendBtnState() {
    if (sendBtnMode === 'cancel') {
        // Self-heal a stuck Cancel button: if there's no live stream backing
        // the current request, the cancel state leaked (e.g. a stream ended
        // without resetting). Recover to Send so the input isn't blocked.
        if (!activeRequestId || !activeStreams[activeRequestId]) {
            resetSendBtnSendMode();
        } else {
            // Don't downgrade a genuinely active Cancel button on input edits.
            return;
        }
    }
    sendBtn.disabled = uploadingCount > 0 || (!chatInput.value.trim() && pendingAttachments.length === 0);
}

function renderAttachmentPreview() {
    if (pendingAttachments.length === 0) {
        attachmentPreview.classList.add('hidden');
        attachmentPreview.innerHTML = '';
        updateSendBtnState();
        return;
    }
    attachmentPreview.classList.remove('hidden');
    attachmentPreview.innerHTML = pendingAttachments.map((att, idx) => {
        if (att._uploading) {
            const suffix = att.file_type === 'directory' && att.file_count
                ? ` (${att.file_count})`
                : '';
            return `<div class="att-chip att-uploading" data-idx="${idx}">
                <i class="fas fa-spinner fa-spin"></i>
                <span class="att-name">${escapeHtml(att.file_name)}${suffix}</span>
            </div>`;
        }
        if (att.file_type === 'image') {
            return `<div class="att-thumb" data-idx="${idx}">
                <img src="${att.preview_url}" alt="${escapeHtml(att.file_name)}">
                <button class="att-remove" onclick="removeAttachment(${idx})">&times;</button>
            </div>`;
        }
        const icon = att.file_type === 'video'
            ? 'fa-film'
            : (att.file_type === 'directory' ? 'fa-folder-tree' : 'fa-file-alt');
        const suffix = att.file_type === 'directory' && att.file_count
            ? ` (${att.file_count})`
            : '';
        return `<div class="att-chip" data-idx="${idx}">
            <i class="fas ${icon}"></i>
            <span class="att-name">${escapeHtml(att.file_name)}${suffix}</span>
            <button class="att-remove" onclick="removeAttachment(${idx})">&times;</button>
        </div>`;
    }).join('');
    updateSendBtnState();
}

function removeAttachment(idx) {
    if (pendingAttachments[idx]?._uploading) return;
    pendingAttachments.splice(idx, 1);
    renderAttachmentPreview();
}

function isAttachMenuVisible() {
    return attachMenu && !attachMenu.classList.contains('hidden');
}

function hideAttachMenu() {
    if (attachMenu) attachMenu.classList.add('hidden');
}

function toggleAttachMenu(event) {
    if (!attachMenu) return;
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    attachMenu.classList.toggle('hidden');
}

function triggerFileUpload() {
    hideAttachMenu();
    fileInput?.click();
}

function triggerFolderUpload() {
    if (!supportsDirectoryUpload) return;
    hideAttachMenu();
    folderInput?.click();
}

async function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    const tasks = [];
    for (const file of files) {
        const placeholder = { file_name: file.name, file_type: 'file', _uploading: true };
        pendingAttachments.push(placeholder);
        uploadingCount++;
        renderAttachmentPreview();

        tasks.push((async () => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('session_id', sessionId);
            try {
                const resp = await fetch('/upload', { method: 'POST', body: formData });
                const data = await resp.json();
                if (data.status === 'success') {
                    placeholder.file_path = data.file_path;
                    placeholder.file_name = data.file_name;
                    placeholder.file_type = data.file_type;
                    placeholder.preview_url = data.preview_url;
                    delete placeholder._uploading;
                } else {
                    const i = pendingAttachments.indexOf(placeholder);
                    if (i !== -1) pendingAttachments.splice(i, 1);
                }
            } catch (e) {
                console.error('Upload failed:', e);
                const i = pendingAttachments.indexOf(placeholder);
                if (i !== -1) pendingAttachments.splice(i, 1);
            }
            uploadingCount--;
            renderAttachmentPreview();
        })());
    }
    await Promise.all(tasks);
}

function _makeUploadId() {
    return `dir_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function _groupDirectoryFiles(files) {
    const groups = new Map();
    for (const file of Array.from(files || [])) {
        const relPath = file.webkitRelativePath || file.name;
        const parts = relPath.split('/').filter(Boolean);
        const rootName = parts[0] || file.name;
        if (!groups.has(rootName)) groups.set(rootName, []);
        groups.get(rootName).push({ file, relPath });
    }
    return groups;
}

async function handleFolderSelect(files) {
    if (!files || files.length === 0) return;
    const groups = _groupDirectoryFiles(files);
    const groupTasks = [];

    for (const [rootName, entries] of groups.entries()) {
        const placeholder = {
            file_name: rootName,
            file_type: 'directory',
            file_count: entries.length,
            _uploading: true,
        };
        pendingAttachments.push(placeholder);
        uploadingCount++;
        renderAttachmentPreview();

        const uploadId = _makeUploadId();
        groupTasks.push((async () => {
            try {
                const formData = new FormData();
                formData.append('session_id', sessionId);
                formData.append('upload_id', uploadId);
                for (const { file, relPath } of entries) {
                    formData.append('files', file);
                    formData.append('relative_paths', relPath);
                }

                const resp = await fetch('/upload', { method: 'POST', body: formData });
                const data = await resp.json();
                if (data.status !== 'success') {
                    throw new Error(data.message || 'Upload failed');
                }
                if (!data.root_path) {
                    throw new Error('Directory root path missing');
                }
                placeholder.file_path = data.root_path;
                placeholder.file_name = data.root_name || rootName;
                delete placeholder._uploading;
            } catch (e) {
                console.error('Directory upload failed:', e);
                const i = pendingAttachments.indexOf(placeholder);
                if (i !== -1) pendingAttachments.splice(i, 1);
            } finally {
                uploadingCount--;
            }
            renderAttachmentPreview();
        })());
    }

    await Promise.all(groupTasks);
}

fileInput.addEventListener('change', function() {
    handleFileSelect(this.files);
    this.value = '';
});

folderInput.addEventListener('change', function() {
    handleFolderSelect(this.files);
    this.value = '';
});

document.addEventListener('click', (e) => {
    if (!isAttachMenuVisible()) return;
    if (attachMenu.contains(e.target) || attachBtn.contains(e.target)) return;
    hideAttachMenu();
});

// Drag-and-drop support on entire chat view
const chatView = document.getElementById('view-chat');
const chatInputArea = chatInput.closest('.flex-shrink-0');

// Create drag overlay for visual feedback
let dragOverlay = document.getElementById('drag-overlay');
if (!dragOverlay) {
    dragOverlay = document.createElement('div');
    dragOverlay.id = 'drag-overlay';
    dragOverlay.className = 'drag-overlay hidden';
    dragOverlay.innerHTML = `
        <div class="drag-overlay-content">
            <i class="fas fa-cloud-arrow-up"></i>
            <p>Drop files here to upload</p>
        </div>
    `;
    chatView.appendChild(dragOverlay);
}

let dragCounter = 0;

function showDragOverlay() {
    dragOverlay.classList.remove('hidden');
    dragOverlay.classList.add('active');
}

function hideDragOverlay() {
    dragOverlay.classList.remove('active');
    dragOverlay.classList.add('hidden');
}

chatView.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (e.dataTransfer.types.includes('Files')) {
        showDragOverlay();
    }
});

chatView.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chatInputArea.classList.add('drag-over');
});

chatView.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) {
        hideDragOverlay();
        chatInputArea.classList.remove('drag-over');
    }
});

chatView.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    hideDragOverlay();
    chatInputArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files);
    }
});

document.body.addEventListener('dragover', (e) => {
    if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
    }
});

document.body.addEventListener('drop', (e) => {
    if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
    }
});

// Paste image support
chatInput.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const item of items) {
        if (item.kind === 'file') {
            files.push(item.getAsFile());
        }
    }
    if (files.length) {
        e.preventDefault();
        handleFileSelect(files);
    }
});

chatInput.addEventListener('compositionstart', () => { isComposing = true; });
chatInput.addEventListener('compositionend', () => { setTimeout(() => { isComposing = false; }, 100); });

// ── Slash Command Menu ───────────────────────────────────────
// desc holds an i18n key, resolved via t() at render time so the menu follows
// the current UI language.
const SLASH_COMMANDS = [
    { cmd: '/help',                desc: 'slash_help' },
    { cmd: '/status',              desc: 'slash_status' },
    { cmd: '/context',             desc: 'slash_context' },
    { cmd: '/context clear',       desc: 'slash_context_clear' },
    { cmd: '/skill list',          desc: 'slash_skill_list' },
    { cmd: '/skill list --remote', desc: 'slash_skill_list_remote' },
    { cmd: '/skill search ',       desc: 'slash_skill_search' },
    { cmd: '/skill install ',      desc: 'slash_skill_install' },
    { cmd: '/skill uninstall ',    desc: 'slash_skill_uninstall' },
    { cmd: '/skill info ',         desc: 'slash_skill_info' },
    { cmd: '/skill enable ',       desc: 'slash_skill_enable' },
    { cmd: '/skill disable ',      desc: 'slash_skill_disable' },
    { cmd: '/memory dream ',       desc: 'slash_memory_dream' },
    { cmd: '/knowledge',           desc: 'slash_knowledge' },
    { cmd: '/knowledge list',      desc: 'slash_knowledge_list' },
    { cmd: '/knowledge on',        desc: 'slash_knowledge_on' },
    { cmd: '/knowledge off',       desc: 'slash_knowledge_off' },
    { cmd: '/config',              desc: 'slash_config' },
    { cmd: '/cancel',              desc: 'slash_cancel' },
    { cmd: '/logs',                desc: 'slash_logs' },
    { cmd: '/version',             desc: 'slash_version' },
];

const slashMenu = document.getElementById('slash-menu');
let slashActiveIdx = 0;
let slashFiltered = [];
let slashJustSelected = false;
let slashLastFilter = '';
let slashLastMouseX = -1;
let slashLastMouseY = -1;

function showSlashMenu(filter) {
    const q = filter.toLowerCase();
    if (q === slashLastFilter && !slashMenu.classList.contains('hidden')) return;
    slashLastFilter = q;

    const newFiltered = SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(q));
    if (newFiltered.length === 0) {
        hideSlashMenu();
        return;
    }

    const changed = newFiltered.length !== slashFiltered.length ||
        newFiltered.some((c, i) => c.cmd !== slashFiltered[i]?.cmd);
    slashFiltered = newFiltered;
    if (changed) slashActiveIdx = 0;
    slashActiveIdx = Math.min(slashActiveIdx, slashFiltered.length - 1);

    slashNavByKeyboard = true;
    renderSlashItems();
    slashMenu.classList.remove('hidden');
}

function hideSlashMenu() {
    slashMenu.classList.add('hidden');
    slashMenu.innerHTML = '';
    slashFiltered = [];
    slashActiveIdx = -1;
    slashLastFilter = '';
    slashNavByKeyboard = false;
    slashLastMouseX = -1;
    slashLastMouseY = -1;
}

function isSlashMenuVisible() {
    return !slashMenu.classList.contains('hidden') && slashFiltered.length > 0;
}

function renderSlashItems() {
    slashMenu.innerHTML =
        '<div class="slash-menu-header">Commands</div>' +
        slashFiltered.map((c, i) =>
            `<div class="slash-menu-item${i === slashActiveIdx ? ' active' : ''}" data-idx="${i}">` +
            `<span class="cmd">${escapeHtml(c.cmd)}</span>` +
            `<span class="desc">${escapeHtml(t(c.desc))}</span></div>`
        ).join('');

    const activeEl = slashMenu.querySelector('.slash-menu-item.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
}

// Delegated events on the persistent slashMenu container (not destroyed by innerHTML)
// Use coordinate comparison to distinguish real mouse movement from DOM-rebuild phantom events.
slashMenu.addEventListener('mousemove', (e) => {
    if (e.clientX === slashLastMouseX && e.clientY === slashLastMouseY) return;
    slashLastMouseX = e.clientX;
    slashLastMouseY = e.clientY;
    if (!slashNavByKeyboard) return;
    slashNavByKeyboard = false;
    const item = e.target.closest('.slash-menu-item');
    if (!item) return;
    const idx = parseInt(item.dataset.idx);
    if (idx === slashActiveIdx) return;
    slashActiveIdx = idx;
    slashMenu.querySelectorAll('.slash-menu-item').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.idx) === idx);
    });
});

slashMenu.addEventListener('mouseover', (e) => {
    if (slashNavByKeyboard) return;
    const item = e.target.closest('.slash-menu-item');
    if (!item) return;
    const idx = parseInt(item.dataset.idx);
    if (idx === slashActiveIdx) return;
    slashActiveIdx = idx;
    slashMenu.querySelectorAll('.slash-menu-item').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.idx) === idx);
    });
});

slashMenu.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.slash-menu-item');
    if (!item) return;
    e.preventDefault();
    selectSlashCommand(parseInt(item.dataset.idx));
});

function selectSlashCommand(idx) {
    if (idx < 0 || idx >= slashFiltered.length) return;
    const chosen = slashFiltered[idx].cmd;
    slashJustSelected = true;
    chatInput.value = chosen;
    chatInput.dispatchEvent(new Event('input'));
    hideSlashMenu();
    chatInput.focus();
    chatInput.selectionStart = chatInput.selectionEnd = chosen.length;
}

chatInput.addEventListener('input', function() {
    this.style.height = '42px';
    const scrollH = this.scrollHeight;
    const newH = Math.min(scrollH, 180);
    this.style.height = newH + 'px';
    this.style.overflowY = scrollH > 180 ? 'auto' : 'hidden';
    updateSendBtnState();

    const val = this.value;
    if (slashJustSelected) {
        slashJustSelected = false;
    } else if (val.startsWith('/')) {
        showSlashMenu(val);
    } else {
        hideSlashMenu();
    }
});

chatInput.addEventListener('keydown', function(e) {
    if (e.keyCode === 229 || e.isComposing || isComposing) return;

    if (e.key === 'Escape' && isAttachMenuVisible()) {
        hideAttachMenu();
        return;
    }

    if (isSlashMenuVisible()) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            slashNavByKeyboard = true;
            slashActiveIdx = Math.min(slashActiveIdx + 1, slashFiltered.length - 1);
            renderSlashItems();
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            slashNavByKeyboard = true;
            slashActiveIdx = Math.max(slashActiveIdx - 1, 0);
            renderSlashItems();
            return;
        }
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
            e.preventDefault();
            selectSlashCommand(slashActiveIdx);
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            hideSlashMenu();
            return;
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            selectSlashCommand(slashActiveIdx);
            return;
        }
    }

    // Arrow-key history recall (only when input is empty or already browsing history)
    if (e.key === 'ArrowUp' && inputHistory.length > 0 && !isSlashMenuVisible()) {
        const curVal = this.value.trim();
        const isSingleLine = !this.value.includes('\n');
        if (isSingleLine && (curVal === '' || historyIdx >= 0)) {
            e.preventDefault();
            if (historyIdx < 0) {
                historySavedDraft = this.value;
                historyIdx = inputHistory.length - 1;
            } else if (historyIdx > 0) {
                historyIdx--;
            }
            this.value = inputHistory[historyIdx];
            slashJustSelected = true;
            this.dispatchEvent(new Event('input'));
            hideSlashMenu();
            this.selectionStart = this.selectionEnd = this.value.length;
            return;
        }
    }
    if (e.key === 'ArrowDown' && historyIdx >= 0 && !isSlashMenuVisible()) {
        const isSingleLine = !this.value.includes('\n');
        if (isSingleLine) {
            e.preventDefault();
            if (historyIdx < inputHistory.length - 1) {
                historyIdx++;
                this.value = inputHistory[historyIdx];
            } else {
                historyIdx = -1;
                this.value = historySavedDraft;
                historySavedDraft = '';
            }
            slashJustSelected = true;
            this.dispatchEvent(new Event('input'));
            hideSlashMenu();
            this.selectionStart = this.selectionEnd = this.value.length;
            return;
        }
    }

    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
        this.dispatchEvent(new Event('input'));
        e.preventDefault();
    } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        sendMessage();
        e.preventDefault();
    }
});

chatInput.addEventListener('blur', () => {
    setTimeout(hideSlashMenu, 150);
});

document.querySelectorAll('.example-card').forEach(card => {
    card.addEventListener('click', () => {
        // data-send overrides the visible text (e.g. show "View all commands" but send "/help")
        const sendText = card.dataset.send;
        if (sendText) {
            chatInput.value = sendText;
            chatInput.dispatchEvent(new Event('input'));
            chatInput.focus();
            return;
        }
        const textEl = card.querySelector('[data-i18n*="text"]');
        if (textEl) {
            chatInput.value = textEl.textContent;
            chatInput.dispatchEvent(new Event('input'));
            chatInput.focus();
        }
    });
});

// Voice-message variant of sendMessage(): renders a playable audio bubble
// with the ASR caption, then dispatches the recognised text to /message
// through the same SSE/loading flow as a typed message.
function sendVoiceMessage(text, audioUrl) {
    text = (text || '').trim();
    if (!text) return;

    inputHistory.push(text);
    historyIdx = -1;
    historySavedDraft = '';

    const ws = document.getElementById('welcome-screen');
    const isFirstMessage = !!ws;
    if (ws) ws.remove();

    const titleInfo = isFirstMessage ? { sid: sessionId, userMsg: text } : null;
    const timestamp = new Date();
    addUserVoiceMessage(audioUrl, text, timestamp);
    const loadingEl = addLoadingIndicator();

    const body = {
        session_id: sessionId,
        message: text,
        stream: true,
        timestamp: timestamp.toISOString(),
        is_voice: true,
        lang: currentLang,
    };

    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1000;
    function postWithRetry(attempt) {
        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.inline_reply) {
                    // Synchronous fast-path reply (e.g. /cancel); skip SSE.
                    loadingEl.remove();
                    addBotMessage(data.inline_reply, new Date());
                } else if (data.stream) {
                    setSendBtnCancelMode(data.request_id);
                    startSSE(data.request_id, loadingEl, timestamp, titleInfo);
                } else {
                    loadingContainers[data.request_id] = loadingEl;
                }
            } else {
                loadingEl.remove();
                addBotMessage(t('error_send'), new Date());
                resetSendBtnSendMode();
            }
        })
        .catch(err => {
            if (attempt < MAX_RETRIES) {
                setTimeout(() => postWithRetry(attempt + 1), RETRY_DELAY_MS * (attempt + 1));
                return;
            }
            loadingEl.remove();
            addBotMessage(t('error_send'), new Date());
        });
    }
    postWithRetry(0);
}

function addUserVoiceMessage(audioUrl, caption, timestamp) {
    const el = document.createElement('div');
    el.className = 'flex justify-end px-4 sm:px-6 py-3';
    // Voice-message bubble: compact voice pill on top, ASR caption beneath.
    // The bubble keeps the same primary tint as a normal user message so
    // it visually slots into the conversation flow.
    el.innerHTML = `
        <div class="max-w-[75%] sm:max-w-[60%]">
            <div class="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-2xl px-3 py-2 msg-content user-bubble">
                <div class="user-voice-slot"></div>
                ${caption ? `<div class="text-xs mt-1.5 leading-snug text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-words">${escapeHtml(caption)}</div>` : ''}
            </div>
            <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-right">${formatTime(timestamp)}</div>
        </div>
    `;
    el.querySelector('.user-voice-slot').appendChild(renderVoicePill(audioUrl));
    messagesDiv.appendChild(el);
    _autoScrollEnabled = true;
    scrollChatToBottom(true);
}

// Clipboard helper with fallback for non-HTTPS environments
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    // Fallback for HTTP environments
    return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
        } catch (err) {
            reject(err);
        } finally {
            textArea.remove();
        }
    });
}

// Edit user message: extract content, remove this and subsequent messages, fill input
async function editUserMessage(msgEl) {
    if (isCurrentSessionConversationActive()) return;
    const rawContent = msgEl.dataset.rawContent;
    if (!rawContent) return;

    // Delete this message and ALL subsequent messages from database (cascade)
    // Must await to ensure delete completes before user sends a new message
    const userSeq = msgEl.dataset.seq;
    if (userSeq) {
        try {
            const resp = await fetch('/api/messages/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    session_id: sessionId, 
                    user_seq: parseInt(userSeq),
                    delete_user: true,
                    cascade: true
                })
            });
            const data = await resp.json();
            if (data.status === 'success') console.log(`Deleted ${data.deleted} old messages`);
        } catch (err) {
            console.error('Failed to delete old messages:', err);
        }
    }

    // Remove this message bubble and every later bubble that belongs to
    // this or a subsequent turn. We mirror the backend cascade contract:
    // anything with a data-seq >= current seq, plus any live SSE bubble
    // that is still being streamed (no seq yet) after this point.
    const currentSeqNum = userSeq ? parseInt(userSeq) : null;
    const messagesToRemove = [];
    let current = msgEl;
    while (current) {
        if (current.classList && (current.classList.contains('user-message-group') || current.classList.contains('bot-message-group'))) {
            const seqAttr = current.dataset.seq;
            if (seqAttr === undefined || seqAttr === '') {
                // Live message without a persisted seq yet — treat as later.
                messagesToRemove.push(current);
            } else if (currentSeqNum === null || parseInt(seqAttr) >= currentSeqNum) {
                messagesToRemove.push(current);
            }
        }
        current = current.nextElementSibling;
    }
    messagesToRemove.forEach(el => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    // Fill input with the original content
    chatInput.value = rawContent;
    chatInput.dispatchEvent(new Event("input", { bubbles: true }));
    chatInput.focus();
    chatInput.selectionStart = chatInput.selectionEnd = chatInput.value.length;
    scrollChatToBottom();
}

// Regenerate bot response: find the preceding user message and resend it
async function regenerateResponse(botMsgEl) {
    let prevEl = botMsgEl.previousElementSibling;
    while (prevEl && !prevEl.classList.contains('user-message-group')) {
        prevEl = prevEl.previousElementSibling;
    }

    if (!prevEl) {
        console.warn('No preceding user message found');
        return;
    }

    const userContent = prevEl.dataset.rawContent;
    if (!userContent) {
        console.warn('No content in preceding user message');
        return;
    }

    // Delete both the old user message AND bot reply from database
    // (because /message will create a fresh user message + new bot reply)
    // Must await to ensure delete completes before /message is sent
    const userSeq = prevEl.dataset.seq;
    if (userSeq) {
        try {
            const resp = await fetch('/api/messages/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    session_id: sessionId, 
                    user_seq: parseInt(userSeq),
                    delete_user: true
                })
            });
            const data = await resp.json();
            if (data.status === 'success') console.log(`Deleted ${data.deleted} old messages`);
        } catch (err) {
            console.error('Failed to delete old messages:', err);
        }
    }

    // Remove both the old user message and bot message from DOM
    if (prevEl.parentNode) prevEl.parentNode.removeChild(prevEl);
    if (botMsgEl.parentNode) botMsgEl.parentNode.removeChild(botMsgEl);

    // Re-add the user message to DOM (so it appears before the loading indicator)
    addUserMessage(userContent, new Date());

    // Show loading indicator
    const loadingEl = addLoadingIndicator();

    // Resend the message
    const timestamp = new Date();
    const body = { session_id: sessionId, message: userContent, stream: true, timestamp: timestamp.toISOString(), lang: currentLang };

    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1000;

    function postWithRetry(attempt) {
        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.inline_reply) {
                    loadingEl.remove();
                    addBotMessage(data.inline_reply, new Date());
                } else if (data.stream) {
                    setSendBtnCancelMode(data.request_id);
                    startSSE(data.request_id, loadingEl, timestamp, null);
                } else {
                    loadingContainers[data.request_id] = loadingEl;
                }
            } else {
                loadingEl.remove();
                addBotMessage(t('error_send'), new Date());
                resetSendBtnSendMode();
            }
        })
        .catch(err => {
            if (err.name === 'AbortError') {
                loadingEl.remove();
                addBotMessage(t('error_timeout'), new Date());
                resetSendBtnSendMode();
                return;
            }
            if (attempt < MAX_RETRIES) {
                console.warn(`[regenerateResponse] attempt ${attempt + 1} failed, retrying...`, err);
                setTimeout(() => postWithRetry(attempt + 1), RETRY_DELAY_MS * (attempt + 1));
                return;
            }
            loadingEl.remove();
            addBotMessage(t('error_send'), new Date());
            resetSendBtnSendMode();
        });
    }

    postWithRetry(0);
}

function sendMessage() {
    // Do NOT branch on sendBtnMode here: Enter should always send (so
    // typing "/cancel" submits normally). Cancel is wired only to the
    // send button's pointer click — see send-btn listener above.

    const text = chatInput.value.trim();
    if (!text && pendingAttachments.length === 0) return;

    if (text) {
        inputHistory.push(text);
        historyIdx = -1;
        historySavedDraft = '';
    }

    const ws = document.getElementById('welcome-screen');
    const isFirstMessage = !!ws;
    if (ws) ws.remove();

    const titleInfo = (isFirstMessage && text) ? { sid: sessionId, userMsg: text } : null;

    const timestamp = new Date();
    const attachments = [...pendingAttachments];
    addUserMessage(text, timestamp, attachments);

    const loadingEl = addLoadingIndicator();

    chatInput.value = '';
    chatInput.style.height = '42px';
    chatInput.style.overflowY = 'hidden';
    pendingAttachments = [];
    renderAttachmentPreview();
    sendBtn.disabled = true;

    const body = { session_id: sessionId, message: text, stream: true, timestamp: timestamp.toISOString(), lang: currentLang };
    if (attachments.length > 0) {
        body.attachments = attachments.map(a => ({
            file_path: a.file_path,
            file_name: a.file_name,
            file_type: a.file_type,
            file_count: a.file_count,
        }));
    }

    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1000;

    function postWithRetry(attempt) {
        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.inline_reply) {
                    // Channel handled synchronously (e.g. /cancel fast-path);
                    // render as a bot bubble and skip SSE entirely.
                    loadingEl.remove();
                    addBotMessage(data.inline_reply, new Date());
                } else if (data.stream) {
                    setSendBtnCancelMode(data.request_id);
                    startSSE(data.request_id, loadingEl, timestamp, titleInfo);
                } else {
                    loadingContainers[data.request_id] = loadingEl;
                }
            } else {
                loadingEl.remove();
                addBotMessage(t('error_send'), new Date());
                resetSendBtnSendMode();
            }
        })
        .catch(err => {
            if (err.name === 'AbortError') {
                loadingEl.remove();
                addBotMessage(t('error_timeout'), new Date());
                resetSendBtnSendMode();
                return;
            }
            if (attempt < MAX_RETRIES) {
                console.warn(`[sendMessage] attempt ${attempt + 1} failed, retrying...`, err);
                setTimeout(() => postWithRetry(attempt + 1), RETRY_DELAY_MS * (attempt + 1));
                return;
            }
            loadingEl.remove();
            addBotMessage(t('error_send'), new Date());
            resetSendBtnSendMode();
        });
    }

    postWithRetry(0);
}

function startSSE(requestId, loadingEl, timestamp, titleInfo, replayItems) {
    let botEl = null;
    let stepsEl = null;    // .agent-steps  (thinking summaries + tool indicators)
    let contentEl = null;  // .answer-content (final streaming answer)
    let mediaEl = null;    // .media-content (images & file attachments)
    let accumulatedText = '';
    const toolElements = new Map();
    let currentReasoningEl = null;  // live reasoning bubble
    let reasoningText = '';
    let reasoningStartTime = 0;
    let done = false;

    // The session this stream belongs to. Sessions run in parallel: the user
    // may switch to another session while this one is still streaming. The
    // stream keeps running in the background (so the reply still completes and
    // persists); when foreign it does not touch the view but still records
    // every event into a buffer, so returning to the session can rebuild the
    // bubble by replaying the buffer and then resume live rendering.
    const ownerSession = sessionId;
    const isActive = () => ownerSession === sessionId;
    sessionActiveRequest[ownerSession] = requestId;
    updateEditButtonsState();
    // Per-request event buffer used to rebuild the bubble on re-attach.
    const buffer = streamBuffers[requestId] || { items: [], timestamp };
    streamBuffers[requestId] = buffer;
    const clearOwnerRequest = () => {
        if (sessionActiveRequest[ownerSession] === requestId) {
            delete sessionActiveRequest[ownerSession];
            updateEditButtonsState();
        }
        delete streamBuffers[requestId];
    };

    const MAX_RECONNECTS = 10;
    const RECONNECT_BASE_MS = 1000;
    let reconnectCount = 0;

    function ensureBotEl() {
        if (botEl) return;
        if (loadingEl) { loadingEl.remove(); loadingEl = null; }
        botEl = document.createElement('div');
        botEl.className = 'flex gap-3 px-4 sm:px-6 py-3 bot-message-group';
        botEl.dataset.requestId = requestId;
        // Regenerate button starts hidden; it's revealed in the "done"
        // event handler once seq metadata arrives from the backend.
        botEl.innerHTML = `
            <img src="assets/ai-avatar.svg" alt="AI" class="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 shadow-sm ring-1 ring-slate-200/60 dark:ring-white/10">
            <div class="min-w-0 flex-1 max-w-[85%]">
                <div class="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm leading-relaxed msg-content text-slate-700 dark:text-slate-200">
                    <div class="agent-steps"></div>
                    <div class="answer-content sse-streaming"></div>
                    <div class="media-content"></div>
                    <div class="bot-audio-slot"></div>
                </div>
                <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-xs text-slate-400 dark:text-slate-500">${formatTime(timestamp)}</span>
                    <button class="copy-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors cursor-pointer" title="${'Copy'}" style="display:none">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="speak-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors cursor-pointer" title="${t('speak_msg')}" style="display:none;">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="regenerate-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-primary-400 dark:hover:text-primary-400 transition-colors cursor-pointer" title="${t('regenerate_response')}" style="display:none;">
                        <i class="fas fa-rotate-right"></i>
                    </button>
                </div>
            </div>
        `;
        messagesDiv.appendChild(botEl);
        stepsEl = botEl.querySelector('.agent-steps');
        contentEl = botEl.querySelector('.answer-content');
        mediaEl = botEl.querySelector('.media-content');
    }

    // Holds the live EventSource so terminal events (done/voice_attach/error)
    // can close it. During replay there is no live connection (null).
    let currentEs = null;

    // Render one SSE event into the bubble. Used by the live handler and by
    // re-attach replay alike, so both paths produce identical UI.
    function processSSEItem(item) {
            if (item.type === 'reasoning') {
                ensureBotEl();
                reasoningText += item.content;
                if (!currentReasoningEl) {
                    reasoningStartTime = Date.now();
                    currentReasoningEl = document.createElement('div');
                    currentReasoningEl.className = 'agent-step agent-thinking-step';
                    // During streaming, use a <pre> with a single text node and
                    // append-only updates. This avoids re-parsing markdown and
                    // re-setting innerHTML on every chunk, which is what causes
                    // the page to crash on long chains-of-thought.
                    currentReasoningEl.innerHTML = `
                        <div class="thinking-header" onclick="this.parentElement.classList.toggle('expanded')">
                            <i class="fas fa-lightbulb text-amber-400 flex-shrink-0"></i>
                            <span class="thinking-summary">${t('thinking_in_progress')}</span>
                            <i class="fas fa-chevron-right thinking-chevron"></i>
                        </div>
                        <div class="thinking-full"><pre class="thinking-stream-pre"></pre></div>`;
                    stepsEl.appendChild(currentReasoningEl);
                    const preEl = currentReasoningEl.querySelector('.thinking-stream-pre');
                    preEl.appendChild(document.createTextNode(''));
                    currentReasoningEl._streamTextNode = preEl.firstChild;
                    currentReasoningEl._streamPendingText = '';
                    currentReasoningEl._streamRafScheduled = false;
                    currentReasoningEl._streamCharsRendered = 0;
                    currentReasoningEl._streamCapped = false;
                }
                // Hard cap: once REASONING_RENDER_CAP chars are in the DOM, stop
                // appending further deltas. The full text is still kept in
                // `reasoningText` for finalize-time head+tail rendering.
                if (!currentReasoningEl._streamCapped) {
                    currentReasoningEl._streamPendingText += item.content;
                    if (!currentReasoningEl._streamRafScheduled) {
                        currentReasoningEl._streamRafScheduled = true;
                        const elRef = currentReasoningEl;
                        requestAnimationFrame(() => {
                            elRef._streamRafScheduled = false;
                            if (!elRef.isConnected || !elRef._streamTextNode) return;
                            let pending = elRef._streamPendingText;
                            elRef._streamPendingText = '';
                            if (!pending) return;
                            const remaining = REASONING_RENDER_CAP - elRef._streamCharsRendered;
                            if (remaining <= 0) {
                                elRef._streamCapped = true;
                            } else {
                                if (pending.length > remaining) {
                                    pending = pending.slice(0, remaining);
                                    elRef._streamCapped = true;
                                }
                                elRef._streamTextNode.appendData(pending);
                                elRef._streamCharsRendered += pending.length;
                                if (elRef._streamCapped) {
                                    elRef._streamTextNode.appendData(
                                        '\n\n... [reasoning truncated for display] ...'
                                    );
                                }
                            }
                            scrollChatToBottom();
                        });
                    }
                }

            } else if (item.type === 'delta') {
                ensureBotEl();
                if (currentReasoningEl) {
                    finalizeThinking(currentReasoningEl, reasoningStartTime, reasoningText);
                    currentReasoningEl = null;
                    reasoningText = '';
                }
                accumulatedText += item.content;
                // Track last delta time for the "Still thinking..." indicator.
                contentEl._onyxLastDeltaTs = Date.now();
                // Hide the still-thinking indicator the moment new tokens arrive.
                _onyxHideStillThinking(contentEl);
                // ── PERFORMANCE: batch & throttle all DOM updates ──
                // Accumulate raw text, schedule a single render via rAF
                if (!contentEl._onyxRafPending) {
                    contentEl._onyxRafPending = true;
                    contentEl._onyxDeltaAccum = '';
                    requestAnimationFrame(() => {
                        contentEl._onyxRafPending = false;
                        const text = accumulatedText;
                        contentEl.innerHTML = renderMarkdown(text);
                        // Trigger the typewriter fade-in on the freshly rendered content.
                        _onyxTriggerTypewriterFade(contentEl);
                        // Only run heavy pipeline every 8th render or when pending cards exist
                        if (!contentEl._onyxRenderCount) contentEl._onyxRenderCount = 0;
                        contentEl._onyxRenderCount++;
                        const hasPending = contentEl.querySelector('.code-block-wrapper[data-onyx-card-pending="true"]');
                        if (contentEl._onyxRenderCount % 8 === 0 || hasPending) {
                            _addCodeBlockHeaders(contentEl);
                            _restoreCachedCards(contentEl);
                            _addCustomJsonCards(contentEl);
                        }
                        scrollChatToBottom();
                    });
                }

            } else if (item.type === 'message_end') {
                // Hide still-thinking indicator — message is done (or transitioning to tools).
                _onyxHideStillThinking(contentEl);
                if (item.has_tool_calls && accumulatedText.trim()) {
                    ensureBotEl();
                    const frozenEl = document.createElement('div');
                    frozenEl.className = 'agent-step agent-content-step';
                    frozenEl.innerHTML = `<div class="agent-content-body">${renderMarkdown(accumulatedText.trim())}</div>`;
                    // Render any card JSON blocks in frozen text
                    const frozenBody = frozenEl.querySelector('.agent-content-body');
                    if (frozenBody) {
                        _addCodeBlockHeaders(frozenBody);
                        _restoreCachedCards(frozenBody);
                        _addCustomJsonCards(frozenBody);
                    }
                    stepsEl.appendChild(frozenEl);
                    accumulatedText = '';
                    contentEl.innerHTML = '';
                    scrollChatToBottom();
                }

            } else if (item.type === 'tool_start') {
                ensureBotEl();
                // Hide still-thinking indicator — we're now executing a tool, not
                // waiting for the LLM. The indicator should only fire when the LLM
                // itself is silent, not when a tool is chugging along.
                contentEl._onyxToolActive = true;
                _onyxHideStillThinking(contentEl);
                if (currentReasoningEl) {
                    finalizeThinking(currentReasoningEl, reasoningStartTime, reasoningText);
                    currentReasoningEl = null;
                    reasoningText = '';
                }
                accumulatedText = '';
                contentEl.innerHTML = '';

                // Add tool execution indicator (collapsible)
                const toolEl = document.createElement('div');
                toolEl.className = 'agent-step agent-tool-step tool-streaming';
                toolEl.dataset.progressReceived = 'false';
                const argsStr = formatToolArgs(item.arguments || {});
                toolEl.innerHTML = `
                    <div class="tool-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <i class="fas fa-cog fa-spin text-primary-400 flex-shrink-0 tool-icon"></i>
                        <span class="tool-name">${item.tool}</span>
                        <i class="fas fa-chevron-right tool-chevron"></i>
                    </div>
                    <div class="tool-detail">
                        <div class="tool-detail-section">
                            <div class="tool-detail-label">Input</div>
                            <pre class="tool-detail-content">${argsStr}</pre>
                        </div>
                        <div class="tool-detail-section tool-output-section">
                            <div class="tool-detail-label tool-output-label">Output</div>
                            <pre class="tool-detail-content tool-live-output"></pre>
                        </div>
                    </div>`;
                stepsEl.appendChild(toolEl);
                toolElements.set(item.tool_call_id, toolEl);

                scrollChatToBottom();

            } else if (item.type === 'tool_progress') {
                const toolEl = toolElements.get(item.tool_call_id);
                if (toolEl) {
                    if (toolEl.dataset.progressReceived !== 'true') {
                        toolEl.classList.add('expanded');
                        toolEl.dataset.progressReceived = 'true';
                    }
                    toolEl.querySelector('.tool-live-output').textContent = String(item.content || '');
                    scrollChatToBottom();
                }

            } else if (item.type === 'tool_end') {
                const toolEl = toolElements.get(item.tool_call_id);
                if (!toolEl) return;
                const toolName = (item.tool || '').toLowerCase();
                const isError = item.status !== 'success';
                const result = item.result;

                // All tool executions use old-style indicator
                // Beautiful cards are ONLY for AI-generated JSON component output
                _updateToolIndicator(toolEl, item, isError);
                toolElements.delete(item.tool_call_id);
                scrollChatToBottom();

            } else if (item.type === 'image') {
                ensureBotEl();
                const imgEl = document.createElement('img');
                imgEl.src = item.content;
                imgEl.alt = 'screenshot';
                imgEl.style.cssText = 'max-width:600px;border-radius:8px;margin:8px 0;cursor:zoom-in;box-shadow:0 1px 4px rgba(0,0,0,0.1);';
                imgEl.onclick = () => _openImageLightbox(imgEl.src);
                mediaEl.appendChild(imgEl);
                scrollChatToBottom();

            } else if (item.type === 'text') {
                // Intermediate text sent before media items; display it but keep SSE open.
                ensureBotEl();
                contentEl.classList.remove('sse-streaming');
                const textContent = item.content || accumulatedText;
                if (textContent) contentEl.innerHTML = renderMarkdown(textContent);
                applyHighlighting(botEl);
                scrollChatToBottom();

            } else if (item.type === 'video') {
                ensureBotEl();
                const wrapper = document.createElement('div');
                wrapper.innerHTML = _buildVideoHtml(item.content);
                mediaEl.appendChild(wrapper.firstElementChild || wrapper);
                scrollChatToBottom();

            } else if (item.type === 'file') {
                ensureBotEl();
                const fileName = item.file_name || item.content.split('/').pop();
                const fileEl = document.createElement('a');
                fileEl.href = item.content;
                fileEl.download = fileName;
                fileEl.target = '_blank';
                fileEl.className = 'file-attachment';
                fileEl.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:8px 14px;margin:8px 0;border-radius:8px;background:var(--bg-secondary,#f3f4f6);color:var(--text-primary,#374151);text-decoration:none;font-size:14px;border:1px solid var(--border-color,#e5e7eb);';
                fileEl.innerHTML = `<i class="fas fa-file-download" style="color:#6b7280;"></i> ${fileName}`;
                mediaEl.appendChild(fileEl);
                scrollChatToBottom();

            } else if (item.type === 'phase') {
                // Coarse progress (e.g. onyx install-browser); must not close SSE (unlike "done")
                ensureBotEl();
                const wrap = document.createElement('div');
                wrap.className = 'text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-l-2 border-primary-400 pl-2 py-1 my-0.5';
                wrap.textContent = String(item.content || '');
                stepsEl.appendChild(wrap);
                scrollChatToBottom();

            } else if (item.type === 'cancelled') {
                // Agent acknowledged the stop; mark the bubble. A trailing
                // "done" still arrives with the partial answer.
                ensureBotEl();
                if (currentReasoningEl) {
                    finalizeThinking(currentReasoningEl, reasoningStartTime, reasoningText);
                    currentReasoningEl = null;
                    reasoningText = '';
                }
                if (!botEl.querySelector('.agent-cancelled-tag')) {
                    const tag = document.createElement('div');
                    tag.className = 'agent-cancelled-tag text-xs text-amber-600 dark:text-amber-400 mt-1';
                    tag.textContent = 'Cancelled';
                    stepsEl.appendChild(tag);
                }
                resetSendBtnSendMode();

            } else if (item.type === 'done') {
                // Don't close the stream yet: the backend keeps it open
                // for a short tail to deliver async attachments such as
                // TTS audio (`voice_attach`). It will close the stream on
                // its own via onerror once the tail expires.
                done = true;
                clearOwnerRequest();
                resetSendBtnSendMode();

                const finalTextRaw = item.content || accumulatedText;
                const finalText = localizeCancelMarker(finalTextRaw);

                if (!botEl && finalText) {
                    if (loadingEl) { loadingEl.remove(); loadingEl = null; }
                    addBotMessage(finalText, new Date((item.timestamp || Date.now() / 1000) * 1000), requestId);
                } else if (botEl) {
                    contentEl.classList.remove('sse-streaming');
                    if (finalText) contentEl.innerHTML = renderMarkdown(finalText);
                    contentEl.dataset.rawMd = finalTextRaw || '';
                    const copyBtn = botEl.querySelector('.copy-msg-btn');
                    if (copyBtn && finalText) copyBtn.style.display = '';
                    _autoOpenPending = true; // Trigger auto-open of first artifact
                    // Single final pass: applyHighlighting triggers the full pipeline
                    // via its hook (code headers + cached cards + JSON cards + hljs)
                    applyHighlighting(botEl);
                    // Unhide any code blocks that were hidden during streaming but didn't become cards
                    contentEl.querySelectorAll('.code-block-wrapper[data-onyx-card-pending="true"]').forEach(w => {
                        w.style.display = '';
                        delete w.dataset.onyxCardPending;
                    });
                }

                // Backfill seq metadata so edit/regenerate buttons can call
                // the delete API without a page refresh. Backend includes
                // user_seq / bot_seq on the done event after persistence.
                const targetBotEl = botEl || (requestId ? messagesDiv.querySelector(`[data-request-id="${requestId}"]`) : null);
                if (targetBotEl) {
                    if (item.bot_seq !== undefined && item.bot_seq !== null) {
                        targetBotEl.dataset.seq = item.bot_seq;
                    }
                    // Reveal regenerate button now that the seq is wired up.
                    const regenBtn = targetBotEl.querySelector('.regenerate-msg-btn');
                    if (regenBtn) regenBtn.style.display = '';
                    if (item.user_seq !== undefined && item.user_seq !== null) {
                        // Locate the preceding user bubble for this turn.
                        let prev = targetBotEl.previousElementSibling;
                        while (prev && !prev.classList.contains('user-message-group')) {
                            prev = prev.previousElementSibling;
                        }
                        if (prev && !prev.dataset.seq) {
                            prev.dataset.seq = item.user_seq;
                        }
                    }
                }
                renderBotSpeakerButton(botEl, finalText);
                scrollChatToBottom();

                if (titleInfo) {
                    generateSessionTitle(titleInfo.sid, titleInfo.userMsg, '');
                    titleInfo = null;
                } else if (sessionPanelOpen) {
                    loadSessionList();
                }

            } else if (item.type === 'voice_attach') {
                // TTS finished — attach a playable audio element to the
                // current bot bubble. The stream closes right after.
                if (botEl && item.url) {
                    attachAudioToBotBubble(botEl, item.url, { autoplay: true });
                }
                if (currentEs) { currentEs.close(); }
                delete activeStreams[requestId];
                clearOwnerRequest();

            } else if (item.type === 'error') {
                done = true;
                if (currentEs) { currentEs.close(); }
                delete activeStreams[requestId];
                clearOwnerRequest();
                if (loadingEl) { loadingEl.remove(); loadingEl = null; }
                addBotMessage(t('error_send'), new Date());
                resetSendBtnSendMode();
            }
    }

    function connect() {
        const es = new EventSource(`/stream?request_id=${encodeURIComponent(requestId)}`);
        currentEs = es;
        activeStreams[requestId] = es;

        es.onmessage = function(e) {
            let item;
            try { item = JSON.parse(e.data); } catch (_) { return; }

            // Successful data received, reset reconnect counter
            reconnectCount = 0;

            // Record every event for re-attach replay (capped to avoid
            // unbounded growth on very long streams).
            if (item.type === 'tool_progress' && item.tool_call_id) {
                const previousIndex = buffer.items.findIndex(
                    buffered => buffered.type === 'tool_progress'
                        && buffered.tool_call_id === item.tool_call_id
                );
                if (previousIndex >= 0) buffer.items.splice(previousIndex, 1);
            }
            if (buffer.items.length < 5000) buffer.items.push(item);

            // Background session: keep the stream alive so the reply finishes
            // and persists, but skip rendering into the now-foreign view. The
            // buffer above still grows so returning to the session can rebuild
            // the bubble and resume live rendering.
            if (ownerSession !== sessionId) {
                if (item.type === 'done' || item.type === 'error' || item.type === 'voice_attach') {
                    done = true;
                    es.close();
                    delete activeStreams[requestId];
                    clearOwnerRequest();
                }
                return;
            }

            processSSEItem(item);
        };

        es.onerror = function() {
            es.close();
            delete activeStreams[requestId];

            if (done) {
                // Normal close after the post-done tail expired; nothing to do.
                return;
            }

            if (currentReasoningEl) {
                finalizeThinking(currentReasoningEl, reasoningStartTime, reasoningText);
                currentReasoningEl = null;
                reasoningText = '';
            }

            if (reconnectCount < MAX_RECONNECTS) {
                reconnectCount++;
                const delay = Math.min(RECONNECT_BASE_MS * reconnectCount, 5000);
                console.warn(`[SSE] connection lost for ${requestId}, reconnecting in ${delay}ms (attempt ${reconnectCount}/${MAX_RECONNECTS})`);
                setTimeout(connect, delay);
                return;
            }

            // Exhausted retries. Only surface the failure in the owning view —
            // a background session must not mutate the currently shown chat.
            clearOwnerRequest();
            if (!isActive()) return;
            if (loadingEl) { loadingEl.remove(); loadingEl = null; }
            if (!botEl) {
                addBotMessage(t('error_send'), new Date());
            } else if (accumulatedText) {
                contentEl.classList.remove('sse-streaming');
                contentEl.innerHTML = renderMarkdown(accumulatedText);
                applyHighlighting(botEl);
                bindChatKnowledgeLinks(botEl);
            }
            resetSendBtnSendMode();
        };
    }

    // Re-attach replay: rebuild the bubble from buffered events (snapshot,
    // not animated) before connecting for the live tail. `processSSEItem`
    // is the same renderer used by the live onmessage handler, so the
    // snapshot matches exactly what live rendering would have produced.
    if (replayItems && replayItems.length) {
        for (const item of replayItems) {
            try { processSSEItem(item); } catch (_) {}
            if (item.type === 'done' || item.type === 'error' || item.type === 'voice_attach') {
                done = true;
            }
        }
        // If the buffered stream already finished, don't reconnect — the
        // reply is complete and persisted; show its final state and stop.
        if (done) {
            clearOwnerRequest();
            resetSendBtnSendMode();
            scrollChatToBottom(true);
            return;
        }
    }

    connect();
}

function startPolling() {
    const gen = ++pollGeneration;
    isPolling = true;
    let pollInFlight = false;

    function poll() {
        if (gen !== pollGeneration) return;
        if (pollInFlight) return;
        if (document.hidden) { setTimeout(poll, 10000); return; }

        pollInFlight = true;
        fetch('/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
        })
        .then(r => r.json())
        .then(data => {
            pollInFlight = false;
            if (gen !== pollGeneration) return;
            if (data.status === 'success' && data.has_content) {
                const rid = data.request_id;
                if (loadingContainers[rid]) {
                    loadingContainers[rid].remove();
                    delete loadingContainers[rid];
                }
                // Skip if this reply is already on screen. Happens when a reply
                // arrives via both the SSE stream and the poll queue (e.g. the
                // user switched away mid-run, leaving the queued reply to be
                // re-fetched on return) — render it only once.
                const already = rid && messagesDiv.querySelector(
                    `[data-request-id="${rid}"]`
                );
                if (!already) {
                    const welcomeScreen = document.getElementById('welcome-screen');
                    if (welcomeScreen) welcomeScreen.remove();
                    addBotMessage(data.content, new Date(data.timestamp * 1000), rid);
                    scrollChatToBottom();
                }
            }
            const delay = (data.status === 'success' && data.has_content) ? 5000 : 10000;
            setTimeout(poll, delay);
        })
        .catch(() => { pollInFlight = false; setTimeout(poll, 10000); });
    }
    poll();
}

function createUserMessageEl(content, timestamp, attachments) {
    const el = document.createElement('div');
    el.className = 'flex justify-end gap-3 px-4 sm:px-6 py-3 user-message-group';

    let attachHtml = '';
    if (attachments && attachments.length > 0) {
        const items = attachments.map(a => {
            if (a.file_type === 'image') {
                return `<img src="${a.preview_url}" alt="${escapeHtml(a.file_name)}" class="user-msg-image">`;
            }
            const icon = a.file_type === 'video'
                ? 'fa-film'
                : (a.file_type === 'directory' ? 'fa-folder-tree' : 'fa-file-alt');
            const suffix = a.file_type === 'directory' && a.file_count
                ? ` (${a.file_count})`
                : '';
            return `<div class="user-msg-file"><i class="fas ${icon}"></i> ${escapeHtml(a.file_name)}${suffix}</div>`;
        }).join('');
        attachHtml = `<div class="user-msg-attachments">${items}</div>`;
    }

    const textHtml = content ? renderMarkdown(content) : '';
    el.innerHTML = `
        <div class="max-w-[75%] sm:max-w-[60%]">
            <div class="bg-primary-400 text-white rounded-2xl px-4 py-2.5 text-sm leading-relaxed msg-content user-bubble">
                ${attachHtml}${textHtml}
            </div>
            <div class="flex items-center justify-end gap-2 mt-1.5">
                <button class="edit-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-primary-400 dark:hover:text-primary-400 transition-colors cursor-pointer" title="${t('edit_message')}">
                    <i class="fas fa-pen-to-square"></i>
                </button>
                <button class="delete-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer" title="${t('delete_message_title')}">
                    <i class="fas fa-trash"></i>
                </button>
                <span class="text-xs text-slate-400 dark:text-slate-500">${formatTime(timestamp)}</span>
            </div>
        </div>
        <img src="assets/user-avatar.svg" alt="You" class="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 shadow-sm ring-1 ring-slate-200/60 dark:ring-white/10">
    `;
    // Store raw content for editing
    el.dataset.rawContent = content || '';
    return el;
}

function renderToolCallsHtml(toolCalls) {
    if (!toolCalls || toolCalls.length === 0) return '';
    return toolCalls.map(tc => {
        const argsStr = formatToolArgs(tc.arguments || {});
        const resultStr = tc.result ? escapeHtml(String(tc.result)) : '';
        const hasResult = !!resultStr;
        return `
<div class="agent-step agent-tool-step">
    <div class="tool-header" onclick="this.parentElement.classList.toggle('expanded')">
        <i class="fas fa-check text-primary-400 flex-shrink-0 tool-icon"></i>
        <span class="tool-name">${escapeHtml(tc.name || '')}</span>
        <i class="fas fa-chevron-right tool-chevron"></i>
    </div>
    <div class="tool-detail">
        <div class="tool-detail-section">
            <div class="tool-detail-label">Input</div>
            <pre class="tool-detail-content">${argsStr}</pre>
        </div>
        ${hasResult ? `
        <div class="tool-detail-section tool-output-section">
            <div class="tool-detail-label">Output</div>
            <pre class="tool-detail-content">${resultStr}</pre>
        </div>` : ''}
    </div>
</div>`;
    }).join('');
}

// Cap for rendering reasoning content in the bubble. Beyond this size,
// we skip markdown rendering entirely and show plain text head + tail to
// keep the page responsive (very long chains-of-thought can otherwise
// stall or crash the browser when re-parsed by marked.js).
// Keep this in sync with backend MAX_STORED_REASONING_CHARS and
// MAX_REASONING_STREAM_CHARS so storage / SSE / display stay aligned.
const REASONING_RENDER_CAP = 4 * 1024; // 4 KB

function _truncateReasoningForDisplay(text) {
    if (!text || text.length <= REASONING_RENDER_CAP) return { text, truncated: false, omitted: 0 };
    const half = Math.floor(REASONING_RENDER_CAP / 2);
    const head = text.slice(0, half);
    const tail = text.slice(-half);
    return {
        text: head + '\n\n... [' + (text.length - head.length - tail.length) + ' chars omitted] ...\n\n' + tail,
        truncated: true,
        omitted: text.length - head.length - tail.length,
    };
}

function _renderReasoningBody(text) {
    // For short reasoning, render as markdown. For long ones, fall back to
    // an escaped <pre> block to avoid expensive markdown parsing.
    const { text: shown, truncated } = _truncateReasoningForDisplay(text);
    if (truncated || shown.length > REASONING_RENDER_CAP) {
        return '<pre class="thinking-stream-pre">' + escapeHtml(shown) + '</pre>';
    }
    return renderMarkdown(shown);
}

function finalizeThinking(el, startTime, text) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    el.querySelector('.thinking-summary').textContent = t('thinking_done');
    const fullDiv = el.querySelector('.thinking-full');
    fullDiv.innerHTML = `<div class="thinking-duration">${t('thinking_duration')} ${elapsed}s</div>` + _renderReasoningBody(text);
}

function renderThinkingHtml(text) {
    if (!text || !text.trim()) return '';
    const full = text.trim();
    return `
<div class="agent-step agent-thinking-step">
    <div class="thinking-header" onclick="this.parentElement.classList.toggle('expanded')">
        <i class="fas fa-lightbulb text-amber-400 flex-shrink-0"></i>
        <span class="thinking-summary">${t('thinking_done')}</span>
        <i class="fas fa-chevron-right thinking-chevron"></i>
    </div>
    <div class="thinking-full">${_renderReasoningBody(full)}</div>
</div>`;
}

function renderStepsHtml(steps) {
    if (!steps || steps.length === 0) return { stepsHtml: '', finalContent: '' };

    // Find the index of the last content step — it becomes the main answer, not a step
    let lastContentIdx = -1;
    for (let i = steps.length - 1; i >= 0; i--) {
        if (steps[i].type === 'content') { lastContentIdx = i; break; }
    }

    let html = '';
    let lastContentText = '';
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.type === 'thinking') {
            html += renderThinkingHtml(step.content);
        } else if (step.type === 'content') {
            if (i === lastContentIdx) {
                lastContentText = step.content;
            } else {
                html += `<div class="agent-step agent-content-step"><div class="agent-content-body">${renderMarkdown(step.content)}</div></div>`;
            }
        } else if (step.type === 'tool') {
            const argsStr = formatToolArgs(step.arguments || {});
            const resultStr = step.result ? escapeHtml(String(step.result)) : '';
            const isErr = step.is_error === true;
            const iconClass = isErr
                ? 'fas fa-times text-red-400 flex-shrink-0 tool-icon'
                : 'fas fa-check text-primary-400 flex-shrink-0 tool-icon';
            html += `
<div class="agent-step agent-tool-step${isErr ? ' tool-failed' : ''}">
    <div class="tool-header" onclick="this.parentElement.classList.toggle('expanded')">
        <i class="${iconClass}"></i>
        <span class="tool-name">${escapeHtml(step.name || '')}</span>
        <i class="fas fa-chevron-right tool-chevron"></i>
    </div>
    <div class="tool-detail">
        <div class="tool-detail-section">
            <div class="tool-detail-label">Input</div>
            <pre class="tool-detail-content">${argsStr}</pre>
        </div>
        ${resultStr ? `
        <div class="tool-detail-section tool-output-section">
            <div class="tool-detail-label">${isErr ? 'Error' : 'Output'}</div>
            <pre class="tool-detail-content${isErr ? ' tool-error-text' : ''}">${resultStr}</pre>
        </div>` : ''}
    </div>
</div>`;
            // If this tool sent a file (send/read tool), render the media inline
            // so it persists across page refreshes (SSE-only file events are not stored).
            const mediaHtml = _renderSentFileFromToolResult(step);
            if (mediaHtml) html += mediaHtml;
        }
    }
    return { stepsHtml: html, lastContentText };
}

// Extract file-to-send metadata from a tool's result and render an inline preview.
// Returns '' if the result isn't a file_to_send payload.
function _renderSentFileFromToolResult(step) {
    if (!step || !step.result) return '';
    let payload;
    try {
        payload = typeof step.result === 'string' ? JSON.parse(step.result) : step.result;
    } catch (_) { return ''; }
    if (!payload || payload.type !== 'file_to_send' || !payload.path) return '';
    const webUrl = _toWebUrl(payload.path);
    const fileType = payload.file_type || 'file';
    const fileName = payload.file_name || payload.path.split('/').pop();
    if (fileType === 'image') {
        return `<div class="agent-step">${_buildImageHtml(webUrl)}</div>`;
    }
    if (fileType === 'video') {
        return `<div class="agent-step">${_buildVideoHtml(webUrl)}</div>`;
    }
    return `<div class="agent-step"><a href="${webUrl}" download="${escapeHtml(fileName)}" target="_blank" ` +
        `style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;margin:8px 0;border-radius:8px;` +
        `background:var(--bg-secondary,#f3f4f6);color:var(--text-primary,#374151);text-decoration:none;font-size:14px;` +
        `border:1px solid var(--border-color,#e5e7eb);">` +
        `<i class="fas fa-file-download" style="color:#6b7280;"></i> ${escapeHtml(fileName)}</a></div>`;
}

// Cosmetic translator for cancel markers persisted in history.
// History keeps the English canonical form for the LLM; only display is localized.
function localizeCancelMarker(text) {
    if (!text) return text;
    if (currentLang !== 'zh') return text;
    return text
        
        ;
}

function createBotMessageEl(content, timestamp, requestId, msg) {
    const el = document.createElement('div');
    el.className = 'flex gap-3 px-4 sm:px-6 py-3 bot-message-group';
    if (requestId) el.dataset.requestId = requestId;

    let stepsHtml = '';
    let displayContent = localizeCancelMarker(content);

    if (msg && msg.steps && msg.steps.length > 0) {
        // New format: ordered steps with interleaved content
        const result = renderStepsHtml(msg.steps);
        stepsHtml = result.stepsHtml;
        // The final content (last text after all steps) is the main answer
        displayContent = content || result.lastContentText;
    } else {
        // Legacy format: separate tool_calls + optional reasoning
        const toolCalls = msg && msg.tool_calls;
        const reasoning = msg && msg.reasoning;
        stepsHtml = renderThinkingHtml(reasoning) + renderToolCallsHtml(toolCalls);
    }

    // Self-evolution bubbles get a small badge so the user can feel the agent
    // learned something on its own (text itself stays clean). History replay
    // carries msg.kind; live pushes are identified by the evolution_ request id.
    const isEvolution = (msg && msg.kind === 'evolution')
        || (typeof requestId === 'string' && requestId.startsWith('evolution_'));
    const evolutionBadge = isEvolution
        ? `<div class="flex items-center gap-1 mb-1.5 text-xs text-slate-400 dark:text-slate-500">
                <i class="fas fa-seedling text-[11px]"></i>
                <span>${t('evolution_badge')}</span>
           </div>`
        : '';

    el.innerHTML = `
        <img src="assets/ai-avatar.svg" alt="AI" class="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 shadow-sm ring-1 ring-slate-200/60 dark:ring-white/10">
        <div class="min-w-0 flex-1 max-w-[85%]">
            <div class="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm leading-relaxed msg-content text-slate-700 dark:text-slate-200">
                ${evolutionBadge}
                ${stepsHtml ? `<div class="agent-steps">${stepsHtml}</div>` : ''}
                <div class="answer-content">${renderMarkdown(displayContent)}</div>
                <div class="bot-audio-slot"></div>
            </div>
            <div class="flex items-center gap-2 mt-1.5">
                <span class="text-xs text-slate-400 dark:text-slate-500">${formatTime(timestamp)}</span>
                <button class="copy-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors cursor-pointer" title="${'Copy'}">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="speak-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors cursor-pointer" title="${t('speak_msg')}" style="display:none;">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="regenerate-msg-btn text-xs text-slate-300 dark:text-slate-600 hover:text-primary-400 dark:hover:text-primary-400 transition-colors cursor-pointer" title="${t('regenerate_response')}">
                    <i class="fas fa-rotate-right"></i>
                </button>
            </div>
        </div>
    `;
    el.querySelector('.answer-content').dataset.rawMd = displayContent;
    // Existing TTS attachment (history replay): mount the player up-front.
    const existingAudio = msg && msg.extras && msg.extras.audio && msg.extras.audio.url;
    if (existingAudio) {
        attachAudioToBotBubble(el, existingAudio, { autoplay: false });
    }
    renderBotSpeakerButton(el, displayContent);
    // Tool steps stay as old-style indicators — beautiful cards are only
    // for AI-generated JSON component output in markdown content
    applyHighlighting(el);
    bindChatKnowledgeLinks(el);
    return el;
}

// Append (or replace) a small audio player inside a bot bubble's
// dedicated `.bot-audio-slot`. Used by both live TTS pushes and history
// replay. Silent failures: never throws.
function attachAudioToBotBubble(botEl, audioUrl, opts) {
    try {
        if (!botEl || !audioUrl) return;
        const slot = botEl.querySelector('.bot-audio-slot');
        if (!slot) return;
        slot.innerHTML = '';
        slot.style.marginTop = '6px';
        const pill = renderVoicePill(audioUrl, { autoplay: !!(opts && opts.autoplay) });
        slot.appendChild(pill);
        const speakBtn = botEl.querySelector('.speak-msg-btn');
        if (speakBtn) speakBtn.style.display = 'none';
    } catch (_) { /* silent */ }
}

// Build a compact play/pause + progress + duration pill that wraps a
// hidden <audio>. Returns the root element; safe to embed anywhere.
function renderVoicePill(audioUrl, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'voice-pill';
    wrap.innerHTML = `
        <button type="button" class="voice-pill-btn" data-state="play" aria-label="play">
            <i class="fas fa-play"></i>
        </button>
        <div class="voice-pill-track"><div class="voice-pill-fill"></div></div>
        <span class="voice-pill-time">0:00</span>
        <audio preload="metadata" src="${audioUrl}"></audio>
    `;
    const btn = wrap.querySelector('.voice-pill-btn');
    const fill = wrap.querySelector('.voice-pill-fill');
    const timeEl = wrap.querySelector('.voice-pill-time');
    const audio = wrap.querySelector('audio');

    const fmt = (s) => {
        if (!isFinite(s) || s < 0) s = 0;
        const m = Math.floor(s / 60);
        const r = Math.floor(s % 60);
        return `${m}:${r < 10 ? '0' : ''}${r}`;
    };
    const setIcon = (state) => {
        btn.dataset.state = state;
        btn.querySelector('i').className = state === 'pause' ? 'fas fa-pause' : 'fas fa-play';
        btn.setAttribute('aria-label', state === 'pause' ? 'pause' : 'play');
    };

    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) timeEl.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
        const dur = audio.duration || 0;
        if (dur > 0) {
            fill.style.width = `${Math.min(100, (audio.currentTime / dur) * 100)}%`;
            timeEl.textContent = fmt(dur - audio.currentTime);
        }
    });
    audio.addEventListener('ended', () => {
        setIcon('play');
        fill.style.width = '0%';
        timeEl.textContent = fmt(audio.duration || 0);
    });
    audio.addEventListener('play',  () => setIcon('pause'));
    audio.addEventListener('pause', () => setIcon('play'));

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
    });

    if (opts.autoplay) {
        // Autoplay may be blocked by the browser; fall back silently and
        // let the user tap the play button.
        const tryPlay = () => audio.play().catch(() => {});
        if (audio.readyState >= 2) tryPlay();
        else audio.addEventListener('canplay', tryPlay, { once: true });
    }
    return wrap;
}

// Show the manual "read aloud" button when TTS is configured but the
// bubble has no audio yet. Lazily probes capability via /api/models so
// we don't expose the button when nothing can synthesize speech.
function renderBotSpeakerButton(botEl, text) {
    if (!botEl || !text || !text.trim()) return;
    const btn = botEl.querySelector('.speak-msg-btn');
    if (!btn) return;
    if (botEl.querySelector('.bot-audio-slot audio')) return;
    _isTtsReady().then(ready => {
        if (!ready) return;
        btn.style.display = '';
        btn.onclick = () => _triggerManualTts(btn, botEl, text);
    });
}

let _ttsReadyPromise = null;
let _ttsReadyTs = 0;
function _isTtsReady() {
    // Cache for 30s to avoid hammering /api/models on every bubble.
    if (_ttsReadyPromise && Date.now() - _ttsReadyTs < 30000) {
        return _ttsReadyPromise;
    }
    _ttsReadyTs = Date.now();
    _ttsReadyPromise = fetch('/api/models')
        .then(r => r.json())
        .then(data => {
            const tts = data && data.capabilities && data.capabilities.tts;
            if (!tts) return false;
            return Boolean(tts.current_provider || tts.suggested_provider);
        })
        .catch(() => false);
    return _ttsReadyPromise;
}

function _triggerManualTts(btn, botEl, text) {
    if (btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    const icon = btn.querySelector('i');
    const prev = icon ? icon.className : '';
    if (icon) icon.className = 'fas fa-spinner fa-spin';
    fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, session_id: sessionId }),
    })
        .then(r => r.json())
        .then(data => {
            if (data && data.status === 'success' && data.audio_url) {
                attachAudioToBotBubble(botEl, data.audio_url, { autoplay: true });
            }
        })
        .catch(() => {})
        .finally(() => {
            btn.dataset.busy = '0';
            if (icon) icon.className = prev || 'fas fa-volume-up';
        });
}

function addUserMessage(content, timestamp, attachments) {
    const el = createUserMessageEl(content, timestamp, attachments);
    messagesDiv.appendChild(el);
    _autoScrollEnabled = true;
    scrollChatToBottom(true);
}

function addBotMessage(content, timestamp, requestId) {
    const el = createBotMessageEl(content, timestamp, requestId);
    messagesDiv.appendChild(el);
    scrollChatToBottom();
}

// Load conversation history from the server (page 1 = most recent messages).
// Subsequent pages prepend older messages when the user scrolls to the top.
function loadHistory(page) {
    if (historyLoading) return;
    historyLoading = true;

    fetch(`/api/history?session_id=${encodeURIComponent(sessionId)}&page=${page}&page_size=20`)
        .then(r => r.json())
        .then(data => {
            if (data.status !== 'success' || data.messages.length === 0) return;

            const prevScrollHeight = messagesDiv.scrollHeight;
            const isFirstLoad = page === 1;

            // On first load, remove the welcome screen if history exists
            if (isFirstLoad) {
                const ws = document.getElementById('welcome-screen');
                if (ws) ws.remove();
            }

            // Build a fragment of history message elements in chronological order
            const fragment = document.createDocumentFragment();

            if (data.has_more && page > 1) {
                // Keep the "load more" sentinel in place (inserted below)
            }

            const ctxStartSeq = data.context_start_seq || 0;
            let dividerInserted = false;

            data.messages.forEach(msg => {
                const hasContent = msg.content && msg.content.trim();
                const hasToolCalls = msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0;
                if (!hasContent && !hasToolCalls) return;

                // Insert context divider when transitioning from above to below boundary
                if (ctxStartSeq > 0 && !dividerInserted && msg._seq !== undefined && msg._seq >= ctxStartSeq) {
                    dividerInserted = true;
                    const divider = document.createElement('div');
                    divider.className = 'context-divider';
                    divider.innerHTML = `<span>${t('context_cleared')}</span>`;
                    fragment.appendChild(divider);
                }

                const ts = new Date(msg.created_at * 1000);
                const el = msg.role === 'user'
                    ? createUserMessageEl(msg.content, ts)
                    : createBotMessageEl(msg.content || '', ts, null, msg);
                // Store seq for delete functionality
                if (msg._seq !== undefined) {
                    el.dataset.seq = msg._seq;
                }
                fragment.appendChild(el);
            });

            // If context was cleared but no new messages exist yet, append divider at the end
            if (ctxStartSeq > 0 && !dividerInserted) {
                const divider = document.createElement('div');
                divider.className = 'context-divider';
                divider.innerHTML = `<span>${t('context_cleared')}</span>`;
                fragment.appendChild(divider);
            }

            // Prepend history above any existing messages
            const sentinel = document.getElementById('history-load-more');
            const insertBefore = sentinel ? sentinel.nextSibling : messagesDiv.firstChild;
            messagesDiv.insertBefore(fragment, insertBefore);
            updateEditButtonsState();

            // Manage the "load more" sentinel at the very top
            if (data.has_more) {
                if (!document.getElementById('history-load-more')) {
                    const btn = document.createElement('div');
                    btn.id = 'history-load-more';
                    btn.className = 'flex justify-center py-3';
                    btn.innerHTML = `<button class="text-xs text-slate-400 dark:text-slate-500 hover:text-primary-400 transition-colors" onclick="loadHistory(historyPage + 1)">Load earlier messages</button>`;
                    messagesDiv.insertBefore(btn, messagesDiv.firstChild);
                }
            } else {
                const sentinel = document.getElementById('history-load-more');
                if (sentinel) sentinel.remove();
            }

            historyHasMore = data.has_more;
            historyPage = page;

            if (isFirstLoad) {
                // Scroll to the very bottom after the DOM settles. A single
                // rAF isn't enough: markdown/code-highlight/images keep growing
                // scrollHeight after the first paint, leaving the last bubble's
                // timestamp clipped. Re-pin a few times to catch late layout.
                requestAnimationFrame(() => scrollChatToBottom(true));
                [120, 350, 700].forEach(d => setTimeout(() => scrollChatToBottom(true), d));
            } else {
                // Restore scroll position so loading older messages doesn't jump the view
                messagesDiv.scrollTop = messagesDiv.scrollHeight - prevScrollHeight;
            }
        })
        .catch(() => {})
        .finally(() => { historyLoading = false; });
}

function addLoadingIndicator() {
    const el = document.createElement('div');
    el.className = 'flex gap-3 px-4 sm:px-6 py-3';
    el.innerHTML = `
        <img src="assets/ai-avatar.svg" alt="AI" class="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 shadow-sm ring-1 ring-slate-200/60 dark:ring-white/10">
        <div class="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3">
            <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse-dot" style="animation-delay: 0s"></span>
                <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse-dot" style="animation-delay: 0.2s"></span>
                <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse-dot" style="animation-delay: 0.4s"></span>
            </div>
        </div>
    `;
    messagesDiv.appendChild(el);
    scrollChatToBottom();
    return el;
}

function newChat(optimistic = true) {
    // Do NOT close active streams: other sessions keep streaming in the
    // background (each stream self-guards against the foreign view) and their
    // replies still complete and persist.

    // Generate a fresh session and persist it so the next page load also starts clean
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    resetSendBtnSendMode();  // fresh session has no in-flight reply
    startPolling();  // bump generation so old loop self-cancels, new loop uses fresh sessionId
    messagesDiv.innerHTML = '';
    const ws = document.createElement('div');
    ws.id = 'welcome-screen';
    ws.className = 'flex flex-col items-center justify-center h-full px-6 pb-16';
    ws.style.paddingTop = '6vh';
    ws.innerHTML = `
        <img src="assets/ai-avatar.svg" alt="OnyxAgent" class="w-16 h-16 rounded-full mb-6 shadow-lg shadow-primary-500/20 ring-4 ring-primary-100 dark:ring-primary-900">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">${appConfig.title || 'OnyxAgent'}</h1>
        <p class="text-slate-500 dark:text-slate-400 text-center max-w-lg mb-10 leading-relaxed" data-i18n="welcome_subtitle">${t('welcome_subtitle')}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
            <div class="example-card group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <i class="fas fa-folder-open text-blue-500 text-xs"></i>
                    </div>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200" data-i18n="example_sys_title">${t('example_sys_title')}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" data-i18n="example_sys_text">${t('example_sys_text')}</p>
            </div>
            <div class="example-card group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                        <i class="fas fa-clock text-amber-500 text-xs"></i>
                    </div>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200" data-i18n="example_task_title">${t('example_task_title')}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" data-i18n="example_task_text">${t('example_task_text')}</p>
            </div>
            <div class="example-card group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                        <i class="fas fa-code text-rose-500 text-xs"></i>
                    </div>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200" data-i18n="example_code_title">${t('example_code_title')}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" data-i18n="example_code_text">${t('example_code_text')}</p>
            </div>
            <div class="example-card group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                        <i class="fas fa-book text-violet-500 text-xs"></i>
                    </div>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200" data-i18n="example_knowledge_title">${t('example_knowledge_title')}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" data-i18n="example_knowledge_text">${t('example_knowledge_text')}</p>
            </div>
            <div class="example-card group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                        <i class="fas fa-puzzle-piece text-rose-500 text-xs"></i>
                    </div>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200" data-i18n="example_skill_title">${t('example_skill_title')}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" data-i18n="example_skill_text">${t('example_skill_text')}</p>
            </div>
            <div class="example-card group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200" data-send="/help">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <i class="fas fa-terminal text-slate-500 text-xs"></i>
                    </div>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200" data-i18n="example_web_title">${t('example_web_title')}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" data-i18n="example_web_text">${t('example_web_text')}</p>
            </div>
        </div>
    `;
    messagesDiv.appendChild(ws);
    ws.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', () => {
            const sendText = card.dataset.send;
            if (sendText) {
                chatInput.value = sendText;
                chatInput.dispatchEvent(new Event('input'));
                chatInput.focus();
                return;
            }
            const textEl = card.querySelector('[data-i18n*="text"]');
            if (textEl) {
                chatInput.value = textEl.textContent;
                chatInput.dispatchEvent(new Event('input'));
                chatInput.focus();
            }
        });
    });
    if (currentView !== 'chat') navigateTo('chat');

    // Show panel and load full session list, then prepend the new session on top
    const panel = document.getElementById('session-panel');
    if (panel && !sessionPanelOpen) {
        sessionPanelOpen = true;
        panel.classList.remove('hidden');
        _showSessionOverlay();
        _persistPanelState();
    }
    // Only prepend an optimistic "new chat" item when this is a real new-chat
    // action. When called after deleting the current session, skip it: the
    // fresh session has no backend record yet, so inserting it would leave an
    // empty, undeletable item in the list (deleting it just spawns another).
    const newSid = sessionId;
    if (optimistic) {
        loadSessionList(() => _addOptimisticSessionItem(newSid));
    } else {
        loadSessionList();
    }
}

// =====================================================================
// Session Panel
// =====================================================================

const SESSION_PANEL_KEY = 'onyx_session_panel_open';
let sessionPanelOpen = localStorage.getItem(SESSION_PANEL_KEY) === '1';

function _persistPanelState() {
    localStorage.setItem(SESSION_PANEL_KEY, sessionPanelOpen ? '1' : '0');
}

function _isMobileView() {
    return window.innerWidth <= 768;
}

function _showSessionOverlay() {
    if (!_isMobileView()) return;
    const overlay = document.getElementById('session-panel-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function _hideSessionOverlay() {
    const overlay = document.getElementById('session-panel-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function closeSessionPanel() {
    const panel = document.getElementById('session-panel');
    if (!panel || !sessionPanelOpen) return;
    sessionPanelOpen = false;
    panel.classList.add('hidden');
    _hideSessionOverlay();
    _persistPanelState();
}

function toggleSessionPanel() {
    const panel = document.getElementById('session-panel');
    if (!panel) return;
    sessionPanelOpen = !sessionPanelOpen;
    panel.classList.toggle('hidden', !sessionPanelOpen);
    if (sessionPanelOpen) {
        _showSessionOverlay();
    } else {
        _hideSessionOverlay();
    }
    _persistPanelState();
    if (sessionPanelOpen) loadSessionList();
}

function openSessionPanel() {
    const panel = document.getElementById('session-panel');
    if (!panel || sessionPanelOpen) return;
    sessionPanelOpen = true;
    panel.classList.remove('hidden');
    _showSessionOverlay();
    _persistPanelState();
    loadSessionList();
}

function _restoreSessionPanel() {
    const panel = document.getElementById('session-panel');
    if (!panel) return;
    if (sessionPanelOpen && !_isMobileView()) {
        panel.classList.remove('hidden');
        _showSessionOverlay();
        loadSessionList();
    } else {
        panel.classList.add('hidden');
        _hideSessionOverlay();
    }
}

function _applyInputTooltips() {
    const set = (id, key, pos) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.setAttribute('data-tooltip', t(key));
        el.removeAttribute('title');
        if (pos) el.setAttribute('data-tooltip-pos', pos);
    };
    set('new-chat-btn', 'tip_new_chat');
    set('clear-context-btn', 'tip_clear_context');
    set('attach-btn', 'tip_attach');
    set('session-toggle-btn', 'session_history', 'bottom');
}

function _addOptimisticSessionItem(sid) {
    const container = document.getElementById('session-list');
    if (!container) return;

    const emptyEl = container.querySelector('.session-empty');
    if (emptyEl) emptyEl.remove();

    document.querySelectorAll('.session-item.active').forEach(el => el.classList.remove('active'));

    const todayLabel = t('today');
    let firstGroup = container.querySelector('.session-group-label');
    if (!firstGroup || firstGroup.textContent !== todayLabel) {
        const header = document.createElement('div');
        header.className = 'session-group-label';
        header.textContent = todayLabel;
        container.prepend(header);
        firstGroup = header;
    }

    const title = t('new_chat');
    const item = document.createElement('div');
    item.className = 'session-item active';
    item.dataset.sessionId = sid;
    item.innerHTML = `
        <i class="fas fa-message session-icon"></i>
        <span class="session-title" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
        <button class="session-delete" onclick="event.stopPropagation(); deleteSession('${sid}')" title="Delete">
            <i class="fas fa-trash-can"></i>
        </button>
    `;
    item.addEventListener('click', () => switchSession(sid));
    firstGroup.insertAdjacentElement('afterend', item);
}

function _sessionTimeGroup(ts) {
    const now = new Date();
    const d = new Date(ts * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d >= today) return t('today');
    if (d >= yesterday) return t('yesterday');
    return t('earlier');
}

let _sessionPage = 1;
let _sessionHasMore = false;
let _sessionLoading = false;
const _SESSION_PAGE_SIZE = 50;

function loadSessionList(onDone) {
    const container = document.getElementById('session-list');
    if (!container) return;

    _sessionPage = 1;
    _sessionHasMore = false;

    _fetchSessionPage(1, true, onDone);
}

function _fetchSessionPage(page, clear, onDone) {
    if (_sessionLoading) return;
    _sessionLoading = true;

    const container = document.getElementById('session-list');
    if (!container) { _sessionLoading = false; return; }

    // Remove existing "load more" sentinel before fetching
    const oldSentinel = container.querySelector('.session-load-more');
    if (oldSentinel) oldSentinel.remove();

    fetch(`/api/sessions?page=${page}&page_size=${_SESSION_PAGE_SIZE}`)
        .then(r => r.json())
        .then(data => {
            _sessionLoading = false;
            if (data.status !== 'success') return;

            if (clear) container.innerHTML = '';

            const sessions = data.sessions || [];
            _sessionPage = page;
            _sessionHasMore = !!data.has_more;

            if (sessions.length === 0 && page === 1) {
                container.innerHTML = '<div class="session-empty">' + t('untitled_session') + '</div>';
                if (typeof onDone === 'function') onDone();
                return;
            }

            // Track last group label already in the container
            const existingLabels = container.querySelectorAll('.session-group-label');
            let lastGroup = existingLabels.length > 0
                ? existingLabels[existingLabels.length - 1].textContent
                : '';

            sessions.forEach(s => {
                const group = _sessionTimeGroup(s.last_active);
                if (group !== lastGroup) {
                    lastGroup = group;
                    const header = document.createElement('div');
                    header.className = 'session-group-label';
                    header.textContent = group;
                    container.appendChild(header);
                }

                const item = document.createElement('div');
                const isActive = s.session_id === sessionId;
                item.className = 'session-item' + (isActive ? ' active' : '');
                item.dataset.sessionId = s.session_id;

                const title = s.title || t('untitled_session');
                item.innerHTML = `
                    <i class="fas fa-message session-icon"></i>
                    <span class="session-title" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
                    <button class="session-delete" onclick="event.stopPropagation(); deleteSession('${s.session_id}')" title="Delete">
                        <i class="fas fa-trash-can"></i>
                    </button>
                `;
                item.addEventListener('click', () => switchSession(s.session_id));
                container.appendChild(item);
            });

            if (typeof onDone === 'function') onDone();
        })
        .catch(() => { _sessionLoading = false; });
}

function _onSessionListScroll() {
    if (!_sessionHasMore || _sessionLoading) return;
    const container = document.getElementById('session-list');
    if (!container) return;
    // Trigger when scrolled near the bottom (within 60px)
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 60) {
        _fetchSessionPage(_sessionPage + 1, false);
    }
}

// Attach scroll listener once DOM is ready
(function _initSessionScroll() {
    const el = document.getElementById('session-list');
    if (el) {
        el.addEventListener('scroll', _onSessionListScroll);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const el2 = document.getElementById('session-list');
            if (el2) el2.addEventListener('scroll', _onSessionListScroll);
        });
    }
})();

// Returning to a session whose reply is still streaming in the background.
// Close the background EventSource, rebuild the bubble from the buffered
// events (snapshot), then resume live streaming via a fresh connection that
// reads the remaining tail from the backend queue. Returns true if a stream
// was re-attached. The user's own bubble is already in history (persisted
// eagerly), so it was rendered by loadHistory before this runs.
function _reattachStream(sid) {
    const requestId = sessionActiveRequest[sid];
    if (!requestId) return false;
    const buffer = streamBuffers[requestId];
    if (!buffer) return false;

    // If the buffered stream already finished, the assistant reply is already
    // persisted and rendered by loadHistory — re-attaching would duplicate it.
    // Just clean up the buffer/cursor and rely on history.
    const finished = buffer.items.some(
        it => it.type === 'done' || it.type === 'error'
    );
    if (finished) {
        const oldEs = activeStreams[requestId];
        if (oldEs) { try { oldEs.close(); } catch (_) {} delete activeStreams[requestId]; }
        delete streamBuffers[requestId];
        delete sessionActiveRequest[sid];
        resetSendBtnSendMode();
        return false;
    }

    // Stop the background stream so the rebuilt one is the sole consumer of
    // the backend queue (the queue survives until "done", so the new
    // connection picks up any remaining events).
    const oldEs = activeStreams[requestId];
    if (oldEs) { try { oldEs.close(); } catch (_) {} delete activeStreams[requestId]; }

    // Snapshot the buffered events into the replay, then start a fresh stream
    // that replays them and reconnects for the live tail.
    const replay = buffer.items.slice();
    startSSE(requestId, null, buffer.timestamp || new Date(), null, replay);
    return true;
}

function switchSession(newSessionId) {
    if (newSessionId === sessionId) {
        if (currentView !== 'chat') navigateTo('chat');
        return;
    }

    // Do NOT close active streams here: sessions run in parallel, so any
    // in-flight reply for another session must keep streaming in the
    // background (it self-guards against rendering into the foreign view).
    // Switching back re-attaches and resumes live streaming.

    sessionId = newSessionId;
    updateEditButtonsState();
    localStorage.setItem(SESSION_ID_KEY, sessionId);

    historyPage = 0;
    historyHasMore = false;
    historyLoading = false;

    messagesDiv.innerHTML = '';
    loadHistory(1);
    startPolling();

    // Restore the send button to match this session's stream state, and if a
    // reply is still streaming in the background, re-attach to resume showing
    // it live (the user turn itself comes from history above).
    const pendingReq = sessionActiveRequest[sessionId];
    if (pendingReq) {
        setSendBtnCancelMode(pendingReq);
        _reattachStream(sessionId);
    } else {
        resetSendBtnSendMode();
    }

    document.querySelectorAll('.session-item').forEach(el => {
        el.classList.toggle('active', el.dataset.sessionId === sessionId);
    });

    if (_isMobileView()) closeSessionPanel();
    if (currentView !== 'chat') navigateTo('chat');
}

function deleteSession(sid) {
    showConfirmModal(t('delete_session_title'), t('delete_session_confirm'), () => {
        // Before deleting, find the next real session to fall back to when the
        // current one is removed (the sibling item in the list, which is sorted
        // newest-first). Falls back to the welcome screen if none remain.
        const nextSid = sid === sessionId ? _findNextSessionId(sid) : null;

        fetch(`/api/sessions/${encodeURIComponent(sid)}`, { method: 'DELETE' })
            .then(r => r.json())
            .then(data => {
                if (data.status !== 'success') return;
                if (sid !== sessionId) {
                    loadSessionList();
                    return;
                }
                if (nextSid) {
                    // Switch to an existing session; refresh the list afterwards
                    // so the deleted item disappears.
                    switchSession(nextSid);
                    loadSessionList();
                } else {
                    // No other sessions: reset to a fresh empty session without
                    // inserting an optimistic placeholder (it has no backend
                    // record and would be an empty, undeletable item).
                    newChat(false);
                }
            })
            .catch(() => {});
    });
}

// Pick the session to show after deleting `sid` (the current session): prefer
// the next item below it in the list, otherwise the previous one. Returns null
// if no other session exists.
function _findNextSessionId(sid) {
    const items = Array.from(document.querySelectorAll('.session-item[data-session-id]'));
    const idx = items.findIndex(el => el.dataset.sessionId === sid);
    if (idx === -1) {
        const other = items.find(el => el.dataset.sessionId !== sid);
        return other ? other.dataset.sessionId : null;
    }
    const next = items[idx + 1] || items[idx - 1];
    return next ? next.dataset.sessionId : null;
}

function showConfirmModal(title, message, onConfirm) {
    let overlay = document.getElementById('confirm-modal-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'confirm-modal-overlay';
    overlay.className = 'confirm-overlay';

    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="confirm-title">${escapeHtml(title)}</div>
        <div class="confirm-message">${escapeHtml(message)}</div>
        <div class="confirm-actions">
            <button class="confirm-btn confirm-btn-cancel">${t('confirm_cancel')}</button>
            <button class="confirm-btn confirm-btn-ok">${t('confirm_yes')}</button>
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visible'));

    const close = () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    modal.querySelector('.confirm-btn-cancel').addEventListener('click', close);
    modal.querySelector('.confirm-btn-ok').addEventListener('click', () => {
        close();
        onConfirm();
    });
}

function clearContext() {
    fetch(`/api/sessions/${encodeURIComponent(sessionId)}/clear_context`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
            if (data.status !== 'success') return;
            // Insert a visual divider in the chat
            const divider = document.createElement('div');
            divider.className = 'context-divider';
            divider.innerHTML = `<span>${t('context_cleared')}</span>`;
            messagesDiv.appendChild(divider);
            scrollChatToBottom();
        })
        .catch(() => {});
}

function generateSessionTitle(sid, userMsg, assistantReply) {
    fetch(`/api/sessions/${encodeURIComponent(sid)}/generate_title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: userMsg, assistant_reply: assistantReply }),
    })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success' && sessionPanelOpen) {
                loadSessionList();
            }
        })
        .catch(() => {});
}

// =====================================================================
// Utilities
// =====================================================================
function formatTime(date) {
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return time;
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (date.getFullYear() === now.getFullYear()) return `${m}-${d} ${time}`;
    return `${date.getFullYear()}-${m}-${d} ${time}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function formatToolArgs(args) {
    if (!args || Object.keys(args).length === 0) return '(none)';
    try {
        return escapeHtml(JSON.stringify(args, null, 2));
    } catch (_) {
        return escapeHtml(String(args));
    }
}

function scrollChatToBottom(force) {
    if (force || _autoScrollEnabled) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

function _updateScrollToBottomBtn() {
    const btn = document.getElementById('scroll-to-bottom-btn');
    if (!btn) return;
    const distFromBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight;
    btn.classList.toggle('hidden', distFromBottom <= _SCROLL_THRESHOLD);
}

function applyHighlighting(container) {
    const root = container || document;
    setTimeout(() => {
        const hljsLib = getHljs();
        root.querySelectorAll('pre code').forEach(block => {
            // Skip code blocks inside onyx-tool-card — they have their own rendering
            if (block.closest('.onyx-tool-card')) return;
            if (!block.classList.contains('hljs')) {
                hljsLib.highlightElement(block);
            }
        });
        // Add language labels and copy buttons to code blocks
        _addCodeBlockHeaders(root);
    }, 0);
}

// =====================================================================
// Config View
// =====================================================================
let configProviders = {};
let configApiBases = {};
let configApiKeys = {};
let configCurrentModel = '';
let cfgProviderValue = '';
let cfgModelValue = '';

// --- Custom dropdown helper ---
function initDropdown(el, options, selectedValue, onChange, opts) {
    // opts.placeholder: when set AND selectedValue is empty, render that text
    // in a dim style instead of auto-selecting options[0]. Useful for
    // "pick or empty" capabilities (asr / embedding) where we want the
    // user to make an explicit choice.
    opts = opts || {};
    const textEl = el.querySelector('.cfg-dropdown-text');
    const menuEl = el.querySelector('.cfg-dropdown-menu');
    const selEl = el.querySelector('.cfg-dropdown-selected');

    el._ddValue = selectedValue || '';
    el._ddOnChange = onChange;

    function render() {
        menuEl.innerHTML = '';
        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'cfg-dropdown-item' + (opt.value === el._ddValue ? ' active' : '');
            item.dataset.value = opt.value;
            // Hint is an optional dim secondary label rendered on the right
            // side of the row (e.g. friendly brand name next to a technical
            // model id). When absent the row degrades to the original
            // single-string layout.
            if (opt.hint) {
                const labelEl = document.createElement('span');
                labelEl.className = 'cfg-dropdown-label';
                labelEl.textContent = opt.label;
                const hintEl = document.createElement('span');
                hintEl.className = 'cfg-dropdown-hint';
                hintEl.textContent = opt.hint;
                item.appendChild(labelEl);
                item.appendChild(hintEl);
            } else {
                item.textContent = opt.label;
            }
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                el._ddValue = opt.value;
                textEl.textContent = opt.label;
                menuEl.querySelectorAll('.cfg-dropdown-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                el.classList.remove('open');
                if (el._ddOnChange) el._ddOnChange(opt.value);
            });
            menuEl.appendChild(item);
        });
        const sel = options.find(o => o.value === el._ddValue);
        if (sel) {
            textEl.textContent = sel.label;
            textEl.classList.remove('text-slate-400', 'dark:text-slate-500');
        } else if (opts.placeholder && !el._ddValue) {
            // No selection yet — show the placeholder in muted style.
            // Do NOT write a fallback value, so the dropdown stays
            // "unsaved" until the user explicitly picks.
            textEl.textContent = opts.placeholder;
            textEl.classList.add('text-slate-400', 'dark:text-slate-500');
        } else {
            textEl.textContent = options[0] ? options[0].label : '--';
            textEl.classList.remove('text-slate-400', 'dark:text-slate-500');
            if (options[0]) el._ddValue = options[0].value;
        }
    }

    render();

    if (!el._ddBound) {
        selEl.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.cfg-dropdown.open').forEach(d => { if (d !== el) d.classList.remove('open'); });
            el.classList.toggle('open');
        });
        el._ddBound = true;
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.cfg-dropdown.open').forEach(d => d.classList.remove('open'));
});

function getDropdownValue(el) { return el._ddValue || ''; }

// --- Config init ---
function initConfigView(data) {
    configProviders = data.providers || {};
    configApiBases = data.api_bases || {};
    configApiKeys = data.api_keys || {};
    configCurrentModel = data.model || '';

    const providerEl = document.getElementById('cfg-provider');
    const providerOpts = Object.entries(configProviders).map(([pid, p]) => ({ value: pid, label: localizedLabel(p.label) }));

    // if use_linkai is enabled, always select linkai as the provider
    // Otherwise prefer bot_type from config, fall back to model-based detection
    const detected = data.use_linkai ? 'linkai'
        : (data.bot_type && configProviders[data.bot_type] ? data.bot_type : detectProvider(configCurrentModel));
    cfgProviderValue = detected || (providerOpts[0] ? providerOpts[0].value : '');

    initDropdown(providerEl, providerOpts, cfgProviderValue, onProviderChange);

    onProviderChange(cfgProviderValue);
    syncModelSelection(configCurrentModel);

    document.getElementById('cfg-max-tokens').value = data.agent_max_context_tokens || 50000;
    document.getElementById('cfg-max-turns').value = data.agent_max_context_turns || 20;
    document.getElementById('cfg-max-steps').value = data.agent_max_steps || 20;
    document.getElementById('cfg-enable-thinking').checked = data.enable_thinking === true;
    document.getElementById('cfg-self-evolution').checked = data.self_evolution_enabled === true;

    // Reflect the current UI language (already resolved, may include the user's
    // local choice) on the selector so it stays in sync with the top-right toggle.
    const langSel = document.getElementById('cfg-lang-select');
    if (langSel) {
        initDropdown(
            langSel,
            [{ value: 'en', label: 'English' }],
            currentLang,
            (val) => setLanguage(val)
        );
    }

    const pwdInput = document.getElementById('cfg-password');
    const maskedPwd = data.web_password_masked || '';
    pwdInput.value = maskedPwd;
    pwdInput.dataset.masked = maskedPwd ? '1' : '';
    pwdInput.dataset.maskedVal = maskedPwd;
    pwdInput.classList.toggle('cfg-key-masked', !!maskedPwd);

    if (maskedPwd) {
        pwdInput.placeholder = '••••••••';
    } else {
        pwdInput.placeholder = '';
    }

    if (!pwdInput._cfgBound) {
        pwdInput.addEventListener('focus', function() {
            if (this.dataset.masked === '1') {
                this.value = '';
                this.dataset.masked = '';
                this.classList.remove('cfg-key-masked');
            }
        });
        pwdInput.addEventListener('input', function() {
            this.dataset.masked = '';
        });
        pwdInput._cfgBound = true;
    }
}

function detectProvider(model) {
    if (!model) return Object.keys(configProviders)[0] || '';
    for (const [pid, p] of Object.entries(configProviders)) {
        if (pid === 'linkai') continue;
        if (p.models && p.models.includes(model)) return pid;
    }
    return Object.keys(configProviders)[0] || '';
}

function onProviderChange(pid) {
    cfgProviderValue = pid || getDropdownValue(document.getElementById('cfg-provider'));
    const p = configProviders[cfgProviderValue];
    if (!p) return;

    const customTip = document.getElementById('cfg-custom-tip');
    if (customTip) customTip.classList.toggle('hidden', cfgProviderValue !== 'custom');

    const modelEl = document.getElementById('cfg-model-select');
    const modelOpts = (p.models || []).map(m => ({ value: m, label: m }));
    modelOpts.push({ value: '__custom__', label: t('config_custom_option') });

    initDropdown(modelEl, modelOpts, modelOpts[0] ? modelOpts[0].value : '', onModelSelectChange);

    // API Key
    const keyField = p.api_key_field;
    const keyWrap = document.getElementById('cfg-api-key-wrap');
    const keyInput = document.getElementById('cfg-api-key');
    if (keyField) {
        keyWrap.classList.remove('hidden');
        keyInput.classList.add('cfg-key-masked');
        const maskedVal = configApiKeys[keyField] || '';
        keyInput.value = maskedVal;
        keyInput.dataset.field = keyField;
        keyInput.dataset.masked = maskedVal ? '1' : '';
        keyInput.dataset.maskedVal = maskedVal;
        const toggleIcon = document.querySelector('#cfg-api-key-toggle i');
        if (toggleIcon) toggleIcon.className = 'fas fa-eye text-xs';

        if (!keyInput._cfgBound) {
            keyInput.addEventListener('focus', function() {
                if (this.dataset.masked === '1') {
                    this.value = '';
                    this.dataset.masked = '';
                    this.classList.remove('cfg-key-masked');
                }
            });
            keyInput.addEventListener('blur', function() {
                if (!this.value.trim() && this.dataset.maskedVal) {
                    this.value = this.dataset.maskedVal;
                    this.dataset.masked = '1';
                    this.classList.add('cfg-key-masked');
                }
            });
            keyInput.addEventListener('input', function() {
                this.dataset.masked = '';
            });
            keyInput._cfgBound = true;
        }
    } else {
        keyWrap.classList.add('hidden');
        keyInput.value = '';
        keyInput.dataset.field = '';
    }

    // API Base
    const apiBaseInput = document.getElementById('cfg-api-base');
    if (p.api_base_key) {
        document.getElementById('cfg-api-base-wrap').classList.remove('hidden');
        apiBaseInput.value = configApiBases[p.api_base_key] || p.api_base_default || '';
        // Hint the version-path tail (e.g. /v1) so users are reminded to
        // include it themselves. We don't auto-rewrite anything server-side.
        apiBaseInput.placeholder = p.api_base_placeholder || 'https://...';
    } else {
        document.getElementById('cfg-api-base-wrap').classList.add('hidden');
        apiBaseInput.value = '';
        apiBaseInput.placeholder = 'https://...';
    }

    onModelSelectChange(modelOpts[0] ? modelOpts[0].value : '');
}

function onModelSelectChange(val) {
    cfgModelValue = val || getDropdownValue(document.getElementById('cfg-model-select'));
    const customWrap = document.getElementById('cfg-model-custom-wrap');
    if (cfgModelValue === '__custom__') {
        customWrap.classList.remove('hidden');
        document.getElementById('cfg-model-custom').focus();
    } else {
        customWrap.classList.add('hidden');
        document.getElementById('cfg-model-custom').value = '';
    }
}

function syncModelSelection(model) {
    const p = configProviders[cfgProviderValue];
    if (!p) return;

    const modelEl = document.getElementById('cfg-model-select');
    if (p.models && p.models.includes(model)) {
        const modelOpts = (p.models || []).map(m => ({ value: m, label: m }));
        modelOpts.push({ value: '__custom__', label: t('config_custom_option') });
        initDropdown(modelEl, modelOpts, model, onModelSelectChange);
        cfgModelValue = model;
        document.getElementById('cfg-model-custom-wrap').classList.add('hidden');
    } else {
        cfgModelValue = '__custom__';
        const modelOpts = (p.models || []).map(m => ({ value: m, label: m }));
        modelOpts.push({ value: '__custom__', label: t('config_custom_option') });
        initDropdown(modelEl, modelOpts, '__custom__', onModelSelectChange);
        document.getElementById('cfg-model-custom-wrap').classList.remove('hidden');
        document.getElementById('cfg-model-custom').value = model;
    }
}

function getSelectedModel() {
    if (cfgModelValue === '__custom__') {
        return document.getElementById('cfg-model-custom').value.trim();
    }
    return cfgModelValue;
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('cfg-api-key');
    const icon = document.querySelector('#cfg-api-key-toggle i');
    if (input.classList.contains('cfg-key-masked')) {
        input.classList.remove('cfg-key-masked');
        icon.className = 'fas fa-eye-slash text-xs';
    } else {
        input.classList.add('cfg-key-masked');
        icon.className = 'fas fa-eye text-xs';
    }
}

function showStatus(elId, msgKey, isError) {
    const el = document.getElementById(elId);
    el.textContent = t(msgKey);
    el.classList.toggle('text-red-500', !!isError);
    el.classList.toggle('text-primary-500', !isError);
    el.classList.remove('opacity-0');
    setTimeout(() => el.classList.add('opacity-0'), 2500);
}

function saveModelConfig() {
    const model = getSelectedModel();
    if (!model) return;

    const updates = { model: model };
    const p = configProviders[cfgProviderValue];
    updates.use_linkai = (cfgProviderValue === 'linkai');
    if (cfgProviderValue === 'linkai') {
        updates.bot_type = '';
    } else {
        updates.bot_type = cfgProviderValue;
    }
    if (p && p.api_base_key) {
        const base = document.getElementById('cfg-api-base').value.trim();
        if (base) updates[p.api_base_key] = base;
    }
    if (p && p.api_key_field) {
        const keyInput = document.getElementById('cfg-api-key');
        const rawVal = keyInput.value.trim();
        if (rawVal && keyInput.dataset.masked !== '1') {
            updates[p.api_key_field] = rawVal;
        }
    }

    const btn = document.getElementById('cfg-model-save');
    btn.disabled = true;
    fetch('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            configCurrentModel = model;
            if (data.applied) {
                const keyInput = document.getElementById('cfg-api-key');
                Object.entries(data.applied).forEach(([k, v]) => {
                    if (k === 'model') return;
                    if (k.includes('api_key')) {
                        const masked = v.length > 8
                            ? v.substring(0, 4) + '*'.repeat(v.length - 8) + v.substring(v.length - 4)
                            : v;
                        configApiKeys[k] = masked;
                        if (keyInput.dataset.field === k) {
                            keyInput.value = masked;
                            keyInput.dataset.masked = '1';
                            keyInput.dataset.maskedVal = masked;
                            keyInput.classList.add('cfg-key-masked');
                            const toggleIcon = document.querySelector('#cfg-api-key-toggle i');
                            if (toggleIcon) toggleIcon.className = 'fas fa-eye text-xs';
                        }
                    } else {
                        configApiBases[k] = v;
                    }
                });
            }
            showStatus('cfg-model-status', 'config_saved', false);
        } else {
            showStatus('cfg-model-status', 'config_save_error', true);
        }
    })
    .catch(() => showStatus('cfg-model-status', 'config_save_error', true))
    .finally(() => { btn.disabled = false; });
}

function saveAgentConfig() {
    const updates = {
        agent_max_context_tokens: parseInt(document.getElementById('cfg-max-tokens').value) || 50000,
        agent_max_context_turns: parseInt(document.getElementById('cfg-max-turns').value) || 20,
        agent_max_steps: parseInt(document.getElementById('cfg-max-steps').value) || 20,
        enable_thinking: document.getElementById('cfg-enable-thinking').checked,
        self_evolution_enabled: document.getElementById('cfg-self-evolution').checked,
    };

    const btn = document.getElementById('cfg-agent-save');
    btn.disabled = true;
    fetch('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            showStatus('cfg-agent-status', 'config_saved', false);
        } else {
            showStatus('cfg-agent-status', 'config_save_error', true);
        }
    })
    .catch(() => showStatus('cfg-agent-status', 'config_save_error', true))
    .finally(() => { btn.disabled = false; });
}

function savePasswordConfig() {
    const input = document.getElementById('cfg-password');
    if (input.dataset.masked === '1') {
        showStatus('cfg-password-status', 'config_saved', false);
        return;
    }
    const newPwd = input.value.trim();
    const btn = document.getElementById('cfg-password-save');
    btn.disabled = true;
    fetch('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: { web_password: newPwd } })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            if (newPwd) {
                showStatus('cfg-password-status', 'config_password_changed', false);
                setTimeout(() => { window.location.reload(); }, 1500);
            } else {
                input.dataset.masked = '';
                input.dataset.maskedVal = '';
                input.classList.remove('cfg-key-masked');
                showStatus('cfg-password-status', 'config_password_cleared', false);
            }
        } else {
            showStatus('cfg-password-status', 'config_save_error', true);
        }
    })
    .catch(() => showStatus('cfg-password-status', 'config_save_error', true))
    .finally(() => { btn.disabled = false; });
}

function loadConfigView() {
    fetch('/config').then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        appConfig = data;
        initConfigView(data);
    }).catch(() => {});
}

// =====================================================================
// Skills View
// =====================================================================
let toolsLoaded = false;
let _pendingDeleteSkill = null;

const TOOL_ICONS = {
    bash: 'fa-terminal',
    edit: 'fa-pen-to-square',
    read: 'fa-file-lines',
    write: 'fa-file-pen',
    ls: 'fa-folder-open',
    send: 'fa-paper-plane',
    web_search: 'fa-magnifying-glass',
    browser: 'fa-globe',
    env_config: 'fa-key',
    scheduler: 'fa-clock',
    memory_get: 'fa-brain',
    memory_search: 'fa-brain',
};

function getToolIcon(name) {
    return TOOL_ICONS[name] || 'fa-wrench';
}

function loadSkillsView() {
    loadToolsSection();
    loadSkillsSection();
}

// =====================================================================
// Todos right-bar panel — shows all todo lists from /api/todos with
// colorful UI, auto-refresh, and a header badge with total pending count.
// =====================================================================

let _todosPanelState = {
    open: false,
    loaded: false,
    loading: false,
    refreshTimer: null,
    lastListCount: 0,
};

function toggleTodosPanel() {
    const panel = document.getElementById('todos-panel');
    const overlay = document.getElementById('todos-panel-overlay');
    if (!panel) return;
    _todosPanelState.open = !_todosPanelState.open;
    if (_todosPanelState.open) {
        panel.classList.remove('hidden');
        if (overlay) overlay.classList.remove('hidden');
        // Lazy-load on first open, then refresh every 10s while open.
        if (!_todosPanelState.loaded && !_todosPanelState.loading) {
            refreshTodosPanel();
        }
        if (_todosPanelState.refreshTimer) clearInterval(_todosPanelState.refreshTimer);
        _todosPanelState.refreshTimer = setInterval(refreshTodosPanel, 10000);
    } else {
        panel.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
        if (_todosPanelState.refreshTimer) {
            clearInterval(_todosPanelState.refreshTimer);
            _todosPanelState.refreshTimer = null;
        }
    }
}

function closeTodosPanel() {
    if (!_todosPanelState.open) return;
    toggleTodosPanel();
}

function refreshTodosPanel() {
    if (_todosPanelState.loading) return;
    _todosPanelState.loading = true;
    fetch('/api/todos')
        .then(r => r.json())
        .then(data => {
            _todosPanelState.loading = false;
            _todosPanelState.loaded = true;
            if (data.status !== 'success') {
                _renderTodosPanelError(data.message || 'Failed to load todos');
                return;
            }
            _renderTodosPanel(data.lists || []);
            _updateTodosBadge(data.lists || []);
        })
        .catch(err => {
            _todosPanelState.loading = false;
            _renderTodosPanelError(String(err));
        });
}

function _renderTodosPanelError(msg) {
    const list = document.getElementById('todos-panel-list');
    if (!list) return;
    list.innerHTML = `<div class="todos-panel-empty"><i class="fas fa-circle-exclamation mb-2 text-red-400"></i><br>${_onyxEscHtml(msg)}</div>`;
}

function _renderTodosPanel(lists) {
    const list = document.getElementById('todos-panel-list');
    if (!list) return;
    if (!lists.length) {
        list.innerHTML = `<div class="todos-panel-empty">
            <i class="fas fa-clipboard-list mb-2 text-slate-400 text-2xl"></i><br>
            <span class="text-sm">No todo lists yet.</span><br>
            <span class="text-xs opacity-60">Ask the agent: "create a todo list called Plan"</span>
        </div>`;
        return;
    }
    const palette = ['blue', 'purple', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'pink'];
    list.innerHTML = '';
    lists.forEach((l, i) => {
        const color = palette[i % palette.length];
        const stats = l.stats || { total: 0, done: 0, pending: 0 };
        const pct = stats.total ? Math.round(stats.done * 100 / stats.total) : 0;
        const card = document.createElement('div');
        card.className = `todos-panel-card todos-color-${color}`;
        card.innerHTML = `
            <div class="todos-panel-card-head">
                <span class="todos-panel-card-title">${_onyxEscHtml(l.title || l.id)}</span>
                <span class="todos-panel-card-stats">${stats.done}/${stats.total}</span>
            </div>
            ${l.description ? `<div class="todos-panel-card-desc">${_onyxEscHtml(l.description)}</div>` : ''}
            <div class="todos-panel-progress"><div class="todos-panel-progress-fill" style="width:${pct}%"></div></div>
            <div class="todos-panel-items">
                ${(l.items || []).slice(0, 50).map(item => {
                    const completed = !!item.completed;
                    const priority = item.priority || 'medium';
                    return `<div class="todos-panel-item ${completed ? 'done' : ''}">
                        <span class="todos-panel-check">${completed ? '✓' : '○'}</span>
                        <span class="todos-panel-item-text">${_onyxEscHtml(item.title || '')}</span>
                        ${!completed && priority ? `<span class="todos-panel-priority todos-priority-${priority}">${priority}</span>` : ''}
                    </div>`;
                }).join('')}
                ${(l.items || []).length > 50 ? `<div class="todos-panel-more">+${(l.items || []).length - 50} more…</div>` : ''}
            </div>
        `;
        list.appendChild(card);
    });
}

function _updateTodosBadge(lists) {
    const badge = document.getElementById('todos-badge');
    if (!badge) return;
    const totalPending = lists.reduce((s, l) => s + ((l.stats && l.stats.pending) || 0), 0);
    if (totalPending > 0) {
        badge.textContent = totalPending > 99 ? '99+' : String(totalPending);
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}


function switchSkillsTab(tab) {
    document.querySelectorAll('.skills-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('skills-tab-' + tab).classList.add('active');
    document.getElementById('skills-panel-my').classList.toggle('hidden', tab !== 'my');
    document.getElementById('skills-panel-add').classList.toggle('hidden', tab !== 'add');
    document.getElementById('skills-panel-marketplace').classList.toggle('hidden', tab !== 'marketplace');
    if (tab === 'my') {
        loadSkillsSection();
    } else if (tab === 'marketplace') {
        // Lazy-load on first visit; subsequent clicks just show the cached panel.
        if (!marketplaceState.loaded && !marketplaceState.loading) {
            marketplaceLoadPage(1);
        }
    }
}

// =====================================================================
// ClawHub Marketplace controller
// =====================================================================
// State machine for the marketplace panel. Tracks current page, search query,
// loading state, and the last fetched items so the UI can re-render without
// re-fetching when the user toggles between detail/list views.
const marketplaceState = {
    page: 1,
    hasPrev: false,
    hasNext: false,
    loading: false,
    loaded: false,
    query: '',
    items: [],         // current list of {slug, display_name, summary, installed}
    detailSlug: null,  // when set, panel renders detail view instead of grid
    searchTimer: null,
};

function _marketplaceShowStatus(html, isEmpty) {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;
    if (isEmpty) {
        grid.innerHTML = `<div class="marketplace-empty">${html}</div>`;
    } else {
        grid.innerHTML = html;
    }
}

function _marketplaceUpdateToolbar() {
    const countEl = document.getElementById('marketplace-count');
    const prevBtn = document.getElementById('marketplace-prev-btn');
    const nextBtn = document.getElementById('marketplace-next-btn');
    if (countEl) {
        if (marketplaceState.loading) {
            countEl.textContent = 'Loading…';
        } else if (marketplaceState.query) {
            countEl.textContent = `${marketplaceState.items.length} result${marketplaceState.items.length === 1 ? '' : 's'} for "${marketplaceState.query}"`;
        } else {
            countEl.textContent = `Page ${marketplaceState.page}`;
        }
    }
    if (prevBtn) prevBtn.disabled = marketplaceState.page <= 1 || marketplaceState.loading;
    if (nextBtn) nextBtn.disabled = !marketplaceState.hasNext || marketplaceState.loading;
}

function _marketplaceRenderGrid() {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;
    const items = marketplaceState.items;
    if (!items.length) {
        _marketplaceShowStatus('No skills found. Try a different search or refresh.', true);
        return;
    }
    grid.innerHTML = '';
    items.forEach(item => {
        const initial = (item.display_name || item.slug || '?').charAt(0).toUpperCase();
        const card = document.createElement('div');
        card.className = 'marketplace-card';
        card.innerHTML = `
            <div class="marketplace-card-head">
                <div class="marketplace-card-icon">${_onyxEscHtml(initial)}</div>
                <div style="min-width:0;flex:1">
                    <div class="marketplace-card-title">${_onyxEscHtml(item.display_name || item.slug)}</div>
                    <div class="marketplace-card-slug">${_onyxEscHtml(item.slug || '')}</div>
                </div>
            </div>
            <div class="marketplace-card-desc">${_onyxEscHtml(item.summary || 'No description available.')}</div>
            <div class="marketplace-card-actions">
                <button class="marketplace-install-btn ${item.installed ? 'installed' : ''}"
                        ${item.installed ? 'disabled' : ''}
                        onclick="marketplaceInstall(event, ${JSON.stringify(item.slug).replace(/"/g, '&quot;')})">
                    ${item.installed ? '✓ Installed' : 'Install'}
                </button>
                <span class="marketplace-card-status" onclick="marketplaceShowDetail(${JSON.stringify(item.slug).replace(/"/g, '&quot;')})"
                      style="cursor:pointer;text-decoration:underline">Details</span>
            </div>
        `;
        // Whole card click also opens detail view
        card.addEventListener('click', (e) => {
            // Don't trigger if user clicked the install button
            if (e.target.closest('.marketplace-install-btn')) return;
            marketplaceShowDetail(item.slug);
        });
        grid.appendChild(card);
    });
}

function marketplaceLoadPage(page) {
    if (marketplaceState.loading) return;
    marketplaceState.loading = true;
    marketplaceState.page = page;
    marketplaceState.detailSlug = null;
    _marketplaceUpdateToolbar();
    _marketplaceShowStatus('<i class="fas fa-spinner fa-spin mr-1"></i> Loading ClawHub skills…', true);

    const url = `/api/skills/marketplace?page=${encodeURIComponent(page)}`;
    fetch(url)
        .then(r => r.json())
        .then(data => {
            marketplaceState.loading = false;
            marketplaceState.loaded = true;
            if (data.status !== 'success') {
                _marketplaceShowStatus(`Failed to load: ${data.message || 'unknown error'}`, true);
                _marketplaceUpdateToolbar();
                return;
            }
            marketplaceState.items = data.items || [];
            marketplaceState.hasNext = !!data.has_next;
            marketplaceState.hasPrev = page > 1;
            _marketplaceRenderGrid();
            _marketplaceUpdateToolbar();
        })
        .catch(err => {
            marketplaceState.loading = false;
            _marketplaceShowStatus(`Network error: ${err}`, true);
            _marketplaceUpdateToolbar();
        });
}

function marketplaceNextPage() {
    if (!marketplaceState.hasNext || marketplaceState.loading) return;
    marketplaceLoadPage(marketplaceState.page + 1);
}

function marketplacePrevPage() {
    if (marketplaceState.page <= 1 || marketplaceState.loading) return;
    marketplaceLoadPage(marketplaceState.page - 1);
}

function marketplaceRefresh() {
    // Reset cursor cache by reloading from page 1.
    marketplaceState.loaded = false;
    marketplaceLoadPage(1);
}

function onMarketplaceSearchInput(value) {
    // Debounce: only search after 350ms of no typing.
    if (marketplaceState.searchTimer) clearTimeout(marketplaceState.searchTimer);
    const q = (value || '').trim();
    marketplaceState.searchTimer = setTimeout(() => marketplaceRunSearch(q), 350);
}

function marketplaceRunSearch(q) {
    if (marketplaceState.loading) return;
    if (!q) {
        // Empty search → back to browse mode
        marketplaceState.query = '';
        marketplaceLoadPage(1);
        return;
    }
    marketplaceState.loading = true;
    marketplaceState.query = q;
    marketplaceState.detailSlug = null;
    _marketplaceUpdateToolbar();
    _marketplaceShowStatus(`<i class="fas fa-spinner fa-spin mr-1"></i> Searching for "${_onyxEscHtml(q)}"…`, true);

    fetch(`/api/skills/marketplace/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
            marketplaceState.loading = false;
            if (data.status !== 'success') {
                _marketplaceShowStatus(`Search failed: ${data.message || 'unknown error'}`, true);
                _marketplaceUpdateToolbar();
                return;
            }
            marketplaceState.items = data.results || [];
            marketplaceState.hasNext = false;
            marketplaceState.hasPrev = false;
            _marketplaceRenderGrid();
            _marketplaceUpdateToolbar();
        })
        .catch(err => {
            marketplaceState.loading = false;
            _marketplaceShowStatus(`Network error: ${err}`, true);
            _marketplaceUpdateToolbar();
        });
}

function marketplaceShowDetail(slug) {
    if (!slug) return;
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;
    marketplaceState.detailSlug = slug;
    grid.innerHTML = `<div class="marketplace-empty"><i class="fas fa-spinner fa-spin mr-1"></i> Loading details for "${_onyxEscHtml(slug)}"…</div>`;

    fetch(`/api/skills/marketplace/detail?slug=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(data => {
            if (data.status !== 'success') {
                grid.innerHTML = `<div class="marketplace-empty">${_onyxEscHtml(data.message || 'Failed to load details')}</div>`;
                return;
            }
            const s = data.skill || {};
            const initial = (s.display_name || s.slug || '?').charAt(0).toUpperCase();
            const tags = s.tags && typeof s.tags === 'object'
                ? Object.entries(s.tags).map(([k, v]) => `<span class="onyx-chip onyx-bg-blue" style="color:#fff;font-size:10px;padding:2px 8px;border-radius:4px">${_onyxEscHtml(k)}: ${_onyxEscHtml(String(v))}</span>`).join(' ')
                : '';
            grid.innerHTML = `
                <div class="marketplace-detail">
                    <div class="marketplace-detail-head">
                        <div style="display:flex;align-items:center;gap:12px;min-width:0">
                            <div class="marketplace-card-icon" style="width:48px;height:48px;font-size:22px">${_onyxEscHtml(initial)}</div>
                            <div style="min-width:0">
                                <div class="marketplace-detail-title">${_onyxEscHtml(s.display_name || s.slug)}</div>
                                <div class="marketplace-detail-meta">
                                    <span style="font-family:ui-monospace,monospace">${_onyxEscHtml(s.slug || '')}</span>
                                    ${s.version ? ` · v${_onyxEscHtml(s.version)}` : ''}
                                    ${data.installed ? ' · <span style="color:#22c55e;font-weight:600">Installed</span>' : ''}
                                </div>
                            </div>
                        </div>
                        <button class="marketplace-detail-back" onclick="marketplaceBackToList()">← Back</button>
                    </div>
                    <div class="marketplace-detail-desc skill-md-render">${_renderSkillMarkdown(s.description || s.summary || 'No description available.')}</div>
                    ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${tags}</div>` : ''}
                    <div class="marketplace-detail-actions">
                        <button class="marketplace-install-btn ${data.installed ? 'installed' : ''}"
                                ${data.installed ? 'disabled' : ''}
                                onclick="marketplaceInstall(event, ${JSON.stringify(slug).replace(/"/g, '&quot;')})">
                            ${data.installed ? '✓ Already Installed' : 'Install to Workspace'}
                        </button>
                        <a href="https://clawhub.ai/skills/${encodeURIComponent(slug)}"
                           target="_blank" rel="noopener"
                           style="font-size:12px;color:inherit;opacity:0.7;text-decoration:underline">Open on ClawHub ↗</a>
                    </div>
                </div>
            `;
        })
        .catch(err => {
            grid.innerHTML = `<div class="marketplace-empty">Network error: ${_onyxEscHtml(String(err))}</div>`;
        });
}

/**
 * Render a SKILL.md markdown string as HTML.
 * Strips YAML frontmatter (--- ... ---) and renders the rest through the
 * existing markdown-it pipeline. Falls back to escaped plain text on error.
 */
function _renderSkillMarkdown(raw) {
    if (!raw) return '<p class="onyx-empty-hint">No description available.</p>';
    let text = raw;
    // Strip YAML frontmatter (---\n...\n---) at the start of the file
    text = text.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
    try {
        return renderMarkdown(text);
    } catch (e) {
        return _onyxEscHtml(text);
    }
}

function marketplaceBackToList() {
    marketplaceState.detailSlug = null;
    if (marketplaceState.query) {
        marketplaceRunSearch(marketplaceState.query);
    } else {
        _marketplaceRenderGrid();
        _marketplaceUpdateToolbar();
    }
}

function marketplaceInstall(ev, slug) {
    if (ev) ev.stopPropagation();
    if (!slug) return;
    const btn = ev && ev.target ? ev.target.closest('.marketplace-install-btn') : null;
    if (btn && btn.disabled) return; // already installed
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Installing…';
    }
    fetch('/api/skills/marketplace/install', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({slug}),
    })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                if (btn) {
                    btn.classList.add('installed');
                    btn.textContent = '✓ Installed';
                }
                // Mark this slug as installed in cached state so re-render persists
                const it = marketplaceState.items.find(x => x.slug === slug);
                if (it) it.installed = true;
                // Reload "My Skills" tab so the new skill shows up there too.
                toolsLoaded = false;
                // Best-effort refresh; ignore failures.
                fetch('/api/skills').then(r => r.json()).then(() => {}).catch(() => {});
            } else {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Install';
                }
                alert(`Install failed: ${data.message || 'unknown error'}`);
            }
        })
        .catch(err => {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Install';
            }
            alert(`Network error: ${err}`);
        });
}

// ---- Add Skill Method Switching ----
function switchAddSkillMethod(method) {
    const methods = ['create', 'upload', 'url'];
    methods.forEach(m => {
        const btn = document.getElementById('add-method-' + m);
        const panel = document.getElementById('add-skill-' + m);
        if (m === method) {
            btn.classList.remove('border-slate-200', 'dark:border-white/10', 'bg-white', 'dark:bg-[#1A1A1A]', 'text-slate-600', 'dark:text-slate-400');
            btn.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
            panel.classList.remove('hidden');
        } else {
            btn.classList.add('border-slate-200', 'dark:border-white/10', 'bg-white', 'dark:bg-[#1A1A1A]', 'text-slate-600', 'dark:text-slate-400');
            btn.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
            panel.classList.add('hidden');
        }
    });
}

// ---- Load Tools ----
function loadToolsSection() {
    if (toolsLoaded) return;
    const emptyEl = document.getElementById('tools-empty');
    const listEl = document.getElementById('tools-list');
    const badge = document.getElementById('tools-count-badge');

    fetch('/api/tools').then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        const tools = data.tools || [];
        emptyEl.classList.add('hidden');
        if (tools.length === 0) {
            emptyEl.classList.remove('hidden');
            emptyEl.innerHTML = `<span class="text-sm text-slate-400 dark:text-slate-500">${'No built-in tools'}</span>`;
            return;
        }
        badge.textContent = tools.length;
        badge.classList.remove('hidden');
        listEl.innerHTML = '';
        tools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10 p-4 flex items-start gap-3';
            card.innerHTML = `
                <div class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <i class="fas ${getToolIcon(tool.name)} text-blue-500 dark:text-blue-400 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-sm text-slate-700 dark:text-slate-200 font-mono">${escapeHtml(tool.name)}</span>
                    </div>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">${escapeHtml(tool.description || '--')}</p>
                </div>`;
            listEl.appendChild(card);
        });
        listEl.classList.remove('hidden');
        toolsLoaded = true;
    }).catch(() => {
        emptyEl.classList.remove('hidden');
        emptyEl.innerHTML = `<span class="text-sm text-slate-400 dark:text-slate-500">${'Failed to load'}</span>`;
    });
}

// ---- Load Skills ----
function loadSkillsSection() {
    const emptyEl = document.getElementById('skills-empty');
    const listEl = document.getElementById('skills-list');
    const badge = document.getElementById('skills-count-badge');

    fetch('/api/skills').then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        const skills = data.skills || [];
        if (skills.length === 0) {
            const p = emptyEl.querySelector('p');
            if (p) p.textContent = 'No skills found';
            return;
        }
        badge.textContent = skills.length;
        badge.classList.remove('hidden');
        emptyEl.classList.add('hidden');
        listEl.innerHTML = '';

        skills.forEach(sk => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10 p-4 flex items-start gap-3 transition-opacity';
            card.dataset.skillName = sk.name;
            card.dataset.skillDesc = sk.description || '';
            card.dataset.enabled = sk.enabled ? '1' : '0';
            renderSkillCard(card, sk);
            listEl.appendChild(card);
        });
    }).catch(() => {});
}

// ---- Render Skill Card (with delete button) ----
function renderSkillCard(card, sk) {
    const enabled = sk.enabled;
    const iconColor = enabled ? 'text-primary-400' : 'text-slate-300 dark:text-slate-600';
    const trackClass = enabled
        ? 'bg-primary-400'
        : 'bg-slate-200 dark:bg-slate-700';
    const thumbTranslate = enabled ? 'translate-x-3' : 'translate-x-0.5';
    card.innerHTML = `
        <div class="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-bolt ${iconColor} text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-sm text-slate-700 dark:text-slate-200 truncate flex-1">${escapeHtml(sk.display_name || sk.name)}</span>
                <button
                    role="switch"
                    aria-checked="${enabled}"
                    onclick="toggleSkill('${escapeHtml(sk.name)}', ${enabled})"
                    class="relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${trackClass}"
                    title="${enabled ? ('Click to disable') : ('Click to enable')}"
                >
                    <span class="inline-block h-3 w-3 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${thumbTranslate}"></span>
                </button>
                <button
                    onclick="showSkillDeleteDialog('${escapeHtml(sk.name)}')"
                    class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    title="${'Delete skill'}"
                >
                    <i class="fas fa-trash-can text-[10px]"></i>
                </button>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">${escapeHtml(sk.description || '--')}</p>
        </div>`;
}

// ---- Toggle Skill ----
function toggleSkill(name, currentlyEnabled) {
    const action = currentlyEnabled ? 'close' : 'open';
    const card = document.querySelector(`[data-skill-name="${CSS.escape(name)}"]`);
    if (card) card.style.opacity = '0.5';

    fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, name })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            if (card) {
                const desc = card.dataset.skillDesc || '';
                card.dataset.enabled = currentlyEnabled ? '0' : '1';
                card.style.opacity = '1';
                renderSkillCard(card, { name, description: desc, enabled: !currentlyEnabled });
            }
        } else {
            if (card) card.style.opacity = '1';
            alert(t('skill_toggle_error'));
        }
    })
    .catch(() => {
        if (card) card.style.opacity = '1';
        alert(t('skill_toggle_error'));
    });
}

// ---- Delete Skill ----
function showSkillDeleteDialog(name) {
    _pendingDeleteSkill = name;
    document.getElementById('skill-delete-dialog').classList.remove('hidden');
}

function closeSkillDeleteDialog() {
    _pendingDeleteSkill = null;
    document.getElementById('skill-delete-dialog').classList.add('hidden');
}

function confirmDeleteSkill() {
    if (!_pendingDeleteSkill) return;
    const name = _pendingDeleteSkill;
    closeSkillDeleteDialog();

    fetch('/api/skills/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            const card = document.querySelector(`[data-skill-name="${CSS.escape(name)}"]`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                card.style.transition = 'all 0.3s ease';
                setTimeout(() => card.remove(), 300);
            }
            // Update badge
            const badge = document.getElementById('skills-count-badge');
            if (badge && badge.textContent) {
                const count = parseInt(badge.textContent) - 1;
                badge.textContent = count;
                if (count <= 0) badge.classList.add('hidden');
            }
        } else {
            alert(t('skills_delete_error') + ': ' + (data.message || ''));
        }
    })
    .catch(() => {
        alert(t('skills_delete_error'));
    });
}

// ---- Create Skill from Content ----
function createSkillFromContent() {
    const name = document.getElementById('skill-create-name').value.trim();
    const desc = document.getElementById('skill-create-desc').value.trim();
    const content = document.getElementById('skill-create-content').value.trim();
    const statusEl = document.getElementById('skill-create-status');
    const btn = document.getElementById('skill-create-btn');

    if (!name) {
        statusEl.textContent = t('skills_create_name_required');
        statusEl.className = 'text-xs text-red-500';
        return;
    }
    if (!content) {
        statusEl.textContent = t('skills_create_content_required');
        statusEl.className = 'text-xs text-red-500';
        return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.5';
    statusEl.textContent = 'Creating...';
    statusEl.className = 'text-xs text-slate-400 dark:text-slate-500';

    fetch('/api/skills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, description: desc })
    })
    .then(r => r.json())
    .then(data => {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (data.status === 'success') {
            statusEl.textContent = t('skills_create_success');
            statusEl.className = 'text-xs text-emerald-500';
            document.getElementById('skill-create-name').value = '';
            document.getElementById('skill-create-desc').value = '';
            document.getElementById('skill-create-content').value = '';
            // Switch to My Skills tab after a brief delay
            setTimeout(() => switchSkillsTab('my'), 800);
        } else {
            statusEl.textContent = t('skills_create_error') + ': ' + (data.message || '');
            statusEl.className = 'text-xs text-red-500';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.style.opacity = '1';
        statusEl.textContent = t('skills_create_error');
        statusEl.className = 'text-xs text-red-500';
    });
}

// ---- Upload Skill Zip ----
let _selectedZipFile = null;

function handleSkillZipSelect(event) {
    const file = event.target.files[0];
    if (file) {
        _selectedZipFile = file;
        const filenameEl = document.getElementById('skill-upload-filename');
        filenameEl.textContent = file.name;
        filenameEl.classList.remove('hidden');
    }
}

function handleSkillZipDrop(event) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith('.zip')) {
            _selectedZipFile = file;
            const filenameEl = document.getElementById('skill-upload-filename');
            filenameEl.textContent = file.name;
            filenameEl.classList.remove('hidden');
        } else {
            alert(t('skills_upload_error') + ': Only .zip files are supported');
        }
    }
}

function uploadSkillZip() {
    const statusEl = document.getElementById('skill-upload-status');
    const btn = document.getElementById('skill-upload-btn');
    const customName = document.getElementById('skill-upload-name').value.trim();

    if (!_selectedZipFile) {
        statusEl.textContent = t('skills_upload_no_file');
        statusEl.className = 'text-xs text-red-500';
        return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.5';
    statusEl.textContent = 'Uploading...';
    statusEl.className = 'text-xs text-slate-400 dark:text-slate-500';

    const formData = new FormData();
    formData.append('file', _selectedZipFile);
    if (customName) formData.append('name', customName);

    fetch('/api/skills/upload', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (data.status === 'success') {
            statusEl.textContent = t('skills_upload_success');
            statusEl.className = 'text-xs text-emerald-500';
            _selectedZipFile = null;
            document.getElementById('skill-upload-file').value = '';
            document.getElementById('skill-upload-name').value = '';
            document.getElementById('skill-upload-filename').classList.add('hidden');
            setTimeout(() => switchSkillsTab('my'), 800);
        } else {
            statusEl.textContent = t('skills_upload_error') + ': ' + (data.message || '');
            statusEl.className = 'text-xs text-red-500';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.style.opacity = '1';
        statusEl.textContent = t('skills_upload_error');
        statusEl.className = 'text-xs text-red-500';
    });
}

// ---- Install Skill from URL ----
function installSkillFromUrl() {
    const url = document.getElementById('skill-url-input').value.trim();
    const name = document.getElementById('skill-url-name').value.trim();
    const statusEl = document.getElementById('skill-url-status');
    const btn = document.getElementById('skill-url-btn');

    if (!url) {
        statusEl.textContent = t('skills_url_required');
        statusEl.className = 'text-xs text-red-500';
        return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.5';
    statusEl.textContent = 'Installing...';
    statusEl.className = 'text-xs text-slate-400 dark:text-slate-500';

    fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, name: name || undefined })
    })
    .then(r => r.json())
    .then(data => {
        btn.disabled = false;
        btn.style.opacity = '1';
        if (data.status === 'success') {
            statusEl.textContent = t('skills_url_success');
            statusEl.className = 'text-xs text-emerald-500';
            document.getElementById('skill-url-input').value = '';
            document.getElementById('skill-url-name').value = '';
            setTimeout(() => switchSkillsTab('my'), 800);
        } else {
            statusEl.textContent = t('skills_url_error') + ': ' + (data.message || '');
            statusEl.className = 'text-xs text-red-500';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.style.opacity = '1';
        statusEl.textContent = t('skills_url_error');
        statusEl.className = 'text-xs text-red-500';
    });
}

// =====================================================================
// Memory View
// =====================================================================
let memoryPage = 1;
let memoryCategory = 'memory';   // 'memory' | 'evolution'
const memoryPageSize = 10;

function switchMemoryTab(tab) {
    document.querySelectorAll('.memory-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('memory-tab-' + tab).classList.add('active');
    // The "dreams" tab now surfaces self-evolution logs (merged with dream diaries).
    memoryCategory = tab === 'dreams' ? 'evolution' : 'memory';
    loadMemoryView(1);
}

function loadMemoryView(page) {
    page = page || 1;
    memoryPage = page;
    fetch(`/api/memory?page=${page}&page_size=${memoryPageSize}&category=${memoryCategory}`).then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        const emptyEl = document.getElementById('memory-empty');
        const listEl = document.getElementById('memory-list');
        const files = data.list || [];
        const total = data.total || 0;

        if (total === 0) {
            const emptyIcon = emptyEl.querySelector('i');
            const emptyTitle = emptyEl.querySelector('p');
            if (memoryCategory === 'evolution') {
                emptyIcon.className = 'fas fa-seedling text-rose-400 text-xl';
                emptyTitle.textContent = 'No evolution records yet';
            } else {
                emptyIcon.className = 'fas fa-brain text-purple-400 text-xl';
                emptyTitle.textContent = 'No memory files';
            }
            emptyEl.classList.remove('hidden');
            listEl.classList.add('hidden');
            return;
        }
        emptyEl.classList.add('hidden');
        listEl.classList.remove('hidden');

        const tbody = document.getElementById('memory-table-body');
        tbody.innerHTML = '';
        files.forEach(f => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors';
            // In the merged evolution tab, resolve each file by its own origin
            // (evolution logs vs dream diaries live in different dirs).
            const fileCategory = (f.type === 'dream' || f.type === 'evolution') ? f.type : memoryCategory;
            tr.onclick = () => openMemoryFile(f.filename, fileCategory);
            let typeLabel;
            if (f.type === 'global') {
                typeLabel = '<span class="px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">Global</span>';
            } else if (f.type === 'evolution') {
                typeLabel = '<span class="px-2 py-0.5 rounded-full text-xs bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">Evolution</span>';
            } else if (f.type === 'dream') {
                typeLabel = '<span class="px-2 py-0.5 rounded-full text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">Dream</span>';
            } else {
                typeLabel = '<span class="px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Daily</span>';
            }
            const sizeStr = f.size < 1024 ? f.size + ' B' : (f.size / 1024).toFixed(1) + ' KB';
            tr.innerHTML = `
                <td class="px-4 py-3 text-sm font-mono text-slate-700 dark:text-slate-200">${escapeHtml(f.filename)}</td>
                <td class="px-4 py-3 text-sm">${typeLabel}</td>
                <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">${sizeStr}</td>
                <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(f.updated_at)}</td>`;
            tbody.appendChild(tr);
        });

        // Pagination
        const totalPages = Math.ceil(total / memoryPageSize);
        const pagEl = document.getElementById('memory-pagination');
        if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
        let pagHtml = `<span>${page} / ${totalPages}</span><div class="flex gap-2">`;
        if (page > 1) pagHtml += `<button onclick="loadMemoryView(${page - 1})" class="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs">Prev</button>`;
        if (page < totalPages) pagHtml += `<button onclick="loadMemoryView(${page + 1})" class="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs">Next</button>`;
        pagHtml += '</div>';
        pagEl.innerHTML = pagHtml;
    }).catch(() => {});
}

function openMemoryFile(filename, category) {
    category = category || 'memory';
    fetch(`/api/memory/content?filename=${encodeURIComponent(filename)}&category=${category}`).then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        document.getElementById('memory-panel-list').classList.add('hidden');
        const panel = document.getElementById('memory-panel-viewer');
        document.getElementById('memory-viewer-title').textContent = filename;
        document.getElementById('memory-viewer-content').innerHTML = renderMarkdown(data.content || '');
        panel.classList.remove('hidden');
        applyHighlighting(panel);
    }).catch(() => {});
}

function closeMemoryViewer() {
    document.getElementById('memory-panel-viewer').classList.add('hidden');
    document.getElementById('memory-panel-list').classList.remove('hidden');
}

// =====================================================================
// Custom Confirm Dialog
// =====================================================================
function showConfirmDialog({ title, message, okText, cancelText, onConfirm, hideCancel }) {
    const overlay = document.getElementById('confirm-dialog-overlay');
    document.getElementById('confirm-dialog-title').textContent = title || '';
    document.getElementById('confirm-dialog-message').textContent = message || '';
    document.getElementById('confirm-dialog-ok').textContent = okText || 'OK';
    const cancelBtn = document.getElementById('confirm-dialog-cancel');
    cancelBtn.textContent = cancelText || 'Cancel';
    cancelBtn.classList.toggle('hidden', !!hideCancel);

    function cleanup() {
        overlay.classList.add('hidden');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('click', onOverlayClick);
    }
    function onOk() { cleanup(); if (onConfirm) onConfirm(); }
    function onCancel() { cleanup(); }
    function onOverlayClick(e) { if (e.target === overlay) cleanup(); }

    const okBtn = document.getElementById('confirm-dialog-ok');
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlayClick);
    overlay.classList.remove('hidden');
}

// =====================================================================
// Models View
// =====================================================================
// Capability cards rendered on the Models page. Order matters — main model
// comes first because it transitively decides defaults for vision and image.
// Icon palette is grouped by capability family:
//   - chat                       → primary (brand rose; the "main" capability)
//   - vision + image             → blue    (everything visual)
//   - asr + tts                  → amber   (everything audio)
//   - embedding                  → purple  (vectors)
//   - search                     → orange  (retrieval)
// Each card uses an explicit `iconClass` string so Tailwind's CDN JIT can
// see the literal class names — dynamic `bg-${color}-50` strings would not
// be picked up reliably.
const MODELS_CAPABILITY_DEFS = [
    { id: 'chat',      icon: 'fa-microchip',        editable: true,  needsModel: true,  titleKey: 'models_capability_chat',      descKey: 'models_capability_chat_desc',
      iconChip: 'bg-primary-50 dark:bg-primary-900/30',  iconGlyph: 'text-primary-500' },
    { id: 'vision',    icon: 'fa-eye',              editable: true,  needsModel: true,  titleKey: 'models_capability_vision',    descKey: 'models_capability_vision_desc',
      iconChip: 'bg-blue-50 dark:bg-blue-900/30',        iconGlyph: 'text-blue-500' },
    { id: 'image',     icon: 'fa-image',            editable: true,  needsModel: true,  titleKey: 'models_capability_image',     descKey: 'models_capability_image_desc',
      iconChip: 'bg-blue-50 dark:bg-blue-900/30',        iconGlyph: 'text-blue-500' },
    { id: 'asr',       icon: 'fa-microphone',       editable: true,  needsModel: true,  titleKey: 'models_capability_asr',       descKey: 'models_capability_asr_desc',
      iconChip: 'bg-amber-50 dark:bg-amber-900/30',      iconGlyph: 'text-amber-500' },
    { id: 'tts',       icon: 'fa-volume-high',      editable: true,  needsModel: true,  titleKey: 'models_capability_tts',       descKey: 'models_capability_tts_desc',
      iconChip: 'bg-amber-50 dark:bg-amber-900/30',      iconGlyph: 'text-amber-500' },
    { id: 'embedding', icon: 'fa-vector-square',    editable: true,  needsModel: false, titleKey: 'models_capability_embedding', descKey: 'models_capability_embedding_desc',
      iconChip: 'bg-purple-50 dark:bg-purple-900/30',    iconGlyph: 'text-purple-500' },
    { id: 'search',    icon: 'fa-magnifying-glass', editable: true,  needsModel: false, titleKey: 'models_capability_search',    descKey: 'models_capability_search_desc',
      iconChip: 'bg-orange-50 dark:bg-orange-900/30',    iconGlyph: 'text-orange-500' },
];

// Provider logos: when a real SVG exists under static/logos/<id>.svg we use
// it; otherwise we fall back to a neutral monogram chip. SVGs are fetched
// via <img> with a hidden onerror so layout stays stable when files are
// absent. Vendors whose mark is rendered in pure (or near-pure) black are
// listed in MODELS_PROVIDER_LOGO_DARK_INVERT — for those, we apply a CSS
// invert filter in dark mode so the glyph stays visible against #1A1A1A.
const MODELS_PROVIDER_LOGO_PATH = 'assets/logos';
const MODELS_PROVIDER_LOGO_DARK_INVERT = new Set([
    'openai',     // black wordmark
    'moonshot',   // dark monogram
    'zhipu',      // dark monogram
    'custom',     // single-color slider glyph
]);

let modelsState = { providers: [], capabilities: {} };

// One-shot: { capabilityId, providerId } stashed before a Models reload,
// consumed by renderCapabilityBody to preselect a just-configured vendor.
let pendingCapabilitySelection = null;

// `opts.preserveScroll` keeps the page's vertical scroll position across the
// refresh. We capture it before unhiding the loading skeleton (which collapses
// content height to zero) and restore it after the new content is mounted.
// This matters when the user configures a vendor from inside a capability
// card's dropdown — without preservation, the post-save reload bounces them
// back to the top of the page, away from the card they were configuring.
function loadModelsView(opts) {
    const loading = document.getElementById('models-loading');
    const content = document.getElementById('models-content');
    if (!loading || !content) return;
    const preserveScroll = !!(opts && opts.preserveScroll);
    // The Models pane has its own scrollable container; capture its position
    // (not window.scrollY) so we can put the user back exactly where they were.
    const scroller = document.querySelector('#view-models .overflow-y-auto');
    const savedTop = preserveScroll && scroller ? scroller.scrollTop : null;

    loading.classList.remove('hidden');
    content.classList.add('hidden');

    fetch('/api/models').then(r => r.json()).then(data => {
        if (data.status !== 'success') {
            loading.innerHTML = `<span class="text-sm text-red-400">${escapeHtml(data.message || 'Failed to load')}</span>`;
            return;
        }
        modelsState.providers = data.providers || [];
        modelsState.capabilities = data.capabilities || {};
        renderModelsView();
        loading.classList.add('hidden');
        content.classList.remove('hidden');
        if (savedTop !== null && scroller) {
            // Wait one frame for the new layout to settle, otherwise the
            // restored scrollTop snaps to the previous (smaller) max.
            requestAnimationFrame(() => { scroller.scrollTop = savedTop; });
        }
    }).catch(err => {
        loading.innerHTML = `<span class="text-sm text-red-400">${escapeHtml(String(err))}</span>`;
    });
}

function renderModelsView() {
    const container = document.getElementById('models-content');
    container.innerHTML = '';
    container.appendChild(renderVendorsSection());
    MODELS_CAPABILITY_DEFS.forEach(def => container.appendChild(renderCapabilityCard(def)));
}

// True when a provider card is one of the expanded custom (OpenAI-compatible)
// providers (id "custom:<id>") — shown in the vendor grid alongside built-in
// vendors, but edited via the dedicated custom-provider modal.
function isCustomProviderCard(p) {
    return !!(p && p.is_custom && p.custom_name);
}

// ---------- Vendor section (Layer 1) -----------------------------------

function renderVendorsSection() {
    const wrap = document.createElement('div');
    wrap.className = 'bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10 p-6';

    // Custom providers always show once created (even without an api key,
    // e.g. a local vLLM/Ollama endpoint); built-in vendors show when configured.
    const configured = modelsState.providers.filter(p => p.configured || isCustomProviderCard(p));

    const header = `
        <div class="flex items-start gap-3 mb-5">
            <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-key text-primary-500 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-800 dark:text-slate-100">${t('models_section_vendors')}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${t('models_section_vendors_desc')}</p>
            </div>
        </div>`;

    let body;
    if (configured.length === 0) {
        body = `
            <div class="flex flex-col items-center justify-center py-8 px-4 rounded-lg border border-dashed border-slate-200 dark:border-white/10">
                <p class="text-sm text-slate-500 dark:text-slate-400 text-center">${t('models_not_configured')}</p>
                <button onclick="openVendorModal('')"
                        class="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 cursor-pointer transition-colors">
                    <i class="fas fa-plus text-[10px] mr-1"></i>${t('models_add_vendor')}
                </button>
            </div>`;
    } else {
        body = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${configured.map(renderVendorChip).join('')}
        </div>`;
    }

    wrap.innerHTML = header + body;
    return wrap;
}

function renderVendorChip(p) {
    // The masked API key is intentionally not surfaced here; it is shown
    // inside the edit modal so the chip stays uncluttered and scannable.
    // Custom providers open their dedicated modal (name + base + key);
    // their ids are server-generated hex, safe to inline.
    const onclick = isCustomProviderCard(p)
        ? `openCustomProviderModal('${escapeHtml(p.custom_id)}')`
        : `openVendorModal('${escapeHtml(p.id)}')`;
    return `
        <button onclick="${onclick}"
                class="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10
                       bg-slate-50 dark:bg-white/5 hover:border-primary-300 dark:hover:border-primary-500/50
                       cursor-pointer transition-colors duration-150 text-left">
            ${renderProviderLogo(p, 28)}
            <span class="flex-1 min-w-0 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(localizedLabel(p.label))}</span>
            <i class="fas fa-pen-to-square text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-primary-500 transition-colors"></i>
        </button>`;
}

// Render a uniformly-styled logo for a provider. Tries an SVG asset first; if
// it 404s the <img> swaps itself for a monogram fallback via onerror.
function renderProviderLogo(p, sizePx) {
    const initial = (localizedLabel(p.label) || p.id || '?').slice(0, 1).toUpperCase();
    const sz = sizePx || 32;
    const url = `${MODELS_PROVIDER_LOGO_PATH}/${encodeURIComponent(p.id)}.svg`;
    const fallbackId = `pl-${p.id}-${Math.random().toString(36).slice(2, 8)}`;
    const imgClass = MODELS_PROVIDER_LOGO_DARK_INVERT.has(p.id)
        ? 'absolute inset-0 m-auto provider-logo-img provider-logo-invert-dark'
        : 'absolute inset-0 m-auto provider-logo-img';
    return `
        <span class="relative flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10
                     text-slate-600 dark:text-slate-300 flex-shrink-0 overflow-hidden"
              style="width:${sz}px;height:${sz}px;">
            <span id="${fallbackId}" class="text-xs font-bold">${escapeHtml(initial)}</span>
            <img src="${url}" alt="" aria-hidden="true"
                 class="${imgClass}"
                 style="width:${Math.round(sz * 0.65)}px;height:${Math.round(sz * 0.65)}px;"
                 onload="(function(el){var f=document.getElementById('${fallbackId}');if(f)f.style.display='none';})(this)"
                 onerror="this.remove();">
        </span>`;
}

function getCustomProviderCards() {
    return modelsState.providers.filter(isCustomProviderCard);
}

// ---------- Capability cards (Layer 2) ---------------------------------

function renderCapabilityCard(def) {
    const cap = modelsState.capabilities[def.id] || {};
    const wrap = document.createElement('div');
    wrap.className = 'bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10 p-6';
    wrap.id = `models-card-${def.id}`;

    const headerRight = renderCapabilityHeaderTag(def, cap);

    wrap.innerHTML = `
        <div class="flex items-start gap-3 mb-5">
            <div class="w-9 h-9 rounded-lg ${def.iconChip} flex items-center justify-center flex-shrink-0">
                <i class="fas ${def.icon} ${def.iconGlyph} text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-800 dark:text-slate-100">${t(def.titleKey)}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${t(def.descKey)}</p>
            </div>
            ${headerRight}
        </div>
        <div class="space-y-4" data-cap-body="${def.id}"></div>`;

    const body = wrap.querySelector(`[data-cap-body="${def.id}"]`);
    renderCapabilityBody(def, cap, body);
    return wrap;
}

function renderCapabilityHeaderTag(def, cap) {
    return '';
}

function _searchProviderLabel(cap, providerId) {
    const list = (cap && cap.providers) || [];
    const hit = list.find(p => p.id === providerId);
    return hit ? localizedLabel(hit.label) : providerId;
}

// Search card body: strategy picker + (when fixed) provider picker + a
// status row that surfaces which providers are ready and how to add the
// missing ones. Three of the four backends piggy-back on model-vendor
// credentials (zhipu / qianfan / linkai); bocha owns its own key under
// tools.web_search and gets its own minimal credential modal.
function renderSearchCapability(def, cap, body) {
    const providers = cap.providers || [];
    const configuredIds = cap.configured_providers || [];
    const hasAny = configuredIds.length > 0;
    const strategy = cap.strategy || 'auto';

    body.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">${t('models_search_strategy_label')}</label>
            <div id="cap-search-strategy" class="cfg-dropdown" tabindex="0">
                <div class="cfg-dropdown-selected">
                    <span class="cfg-dropdown-text">--</span>
                    <i class="fas fa-chevron-down cfg-dropdown-arrow"></i>
                </div>
                <div class="cfg-dropdown-menu"></div>
            </div>
        </div>
        <div id="cap-search-provider-wrap" class="hidden">
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">${t('models_provider')}</label>
            <div id="cap-search-provider" class="cfg-dropdown" tabindex="0">
                <div class="cfg-dropdown-selected">
                    <span class="cfg-dropdown-text">--</span>
                    <i class="fas fa-chevron-down cfg-dropdown-arrow"></i>
                </div>
                <div class="cfg-dropdown-menu"></div>
            </div>
        </div>
        <div id="cap-search-summary"></div>
        <div class="flex items-center justify-end gap-3 pt-1">
            <span id="cap-search-status" class="text-xs text-primary-500 opacity-0 transition-opacity duration-300"></span>
            <button onclick="saveSearchCapability()"
                    class="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium
                           cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                ${t('save')}
            </button>
        </div>
    `;

    // Strategy dropdown — when no provider is configured the strategy
    // value is meaningless, so we show a "Not configured" placeholder instead of
    // a default selection. Once any provider gets configured the saved
    // strategy (or "auto") becomes the active value.
    initDropdown(
        body.querySelector('#cap-search-strategy'),
        [
            { value: 'auto',  label: t('models_strategy_auto'),         hint: t('models_search_strategy_auto_hint') },
            { value: 'fixed', label: t('models_search_strategy_fixed'), hint: t('models_search_strategy_fixed_hint') },
        ],
        hasAny ? strategy : '',
        (value) => _onSearchStrategyChange(cap, value, body),
        hasAny ? null : { placeholder: t('models_pending_config') },
    );

    // Provider dropdown — populated with configured providers only;
    // unconfigured ones cannot be pinned (they'd silently fall back).
    const provOpts = configuredIds.map(id => ({
        value: id,
        label: _searchProviderLabel(cap, id),
    }));
    if (provOpts.length === 0) provOpts.push({ value: '', label: '--' });
    initDropdown(
        body.querySelector('#cap-search-provider'),
        provOpts,
        cap.fixed_provider || configuredIds[0] || '',
        () => {},
    );

    _renderSearchSummary(body, cap);
    _setSearchProviderPickerVisible(body, strategy === 'fixed' && hasAny);
}

function _onSearchStrategyChange(cap, value, body) {
    const configuredIds = cap.configured_providers || [];
    _setSearchProviderPickerVisible(body, value === 'fixed' && configuredIds.length > 0);
}

function _setSearchProviderPickerVisible(body, visible) {
    const wrap = body.querySelector('#cap-search-provider-wrap');
    if (!wrap) return;
    if (visible) wrap.classList.remove('hidden');
    else wrap.classList.add('hidden');
}

// Search summary line: just lists configured providers + a trailing "+
// add" button. Unconfigured backends are hidden — the user picks one from
// a small chooser when they click add. Empty state surfaces the same add
// button as a primary CTA.
function _renderSearchSummary(body, cap) {
    const host = body.querySelector('#cap-search-summary');
    if (!host) return;
    const providers = cap.providers || [];
    const configured = providers.filter(p => p.configured);
    const missing = providers.filter(p => !p.configured);

    const addBtn = missing.length
        ? `<button type="button" id="cap-search-add-btn"
                  class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md cursor-pointer
                         bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400
                         hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <i class="fas fa-plus text-[10px]"></i>${t('models_search_add_provider')}
           </button>`
        : '';

    if (configured.length === 0) {
        host.innerHTML = `
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <i class="fas fa-circle-info text-[10px] text-amber-500"></i>
                <span>${t('models_search_none_configured')}</span>
                ${addBtn}
            </div>
        `;
    } else {
        const chips = configured.map(p => `
            <button type="button" data-search-edit-provider="${p.id}"
                    title="${t('models_search_edit_hint')}"
                    class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md cursor-pointer
                           bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400
                           hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                <i class="fas fa-check text-[10px]"></i>${escapeHtml(localizedLabel(p.label))}
            </button>
        `).join('');
        host.innerHTML = `
            <div class="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>${t('models_search_available_label')}</span>
                ${chips}
                ${addBtn}
            </div>
        `;
    }

    const addBtnEl = host.querySelector('#cap-search-add-btn');
    if (addBtnEl) {
        addBtnEl.addEventListener('click', (ev) => {
            ev.preventDefault();
            openSearchAddProviderPicker(missing);
        });
    }
    host.querySelectorAll('[data-search-edit-provider]').forEach(el => {
        el.addEventListener('click', (ev) => {
            ev.preventDefault();
            const pid = el.getAttribute('data-search-edit-provider');
            const meta = (cap.providers || []).find(p => p.id === pid);
            _launchSearchProviderConfig(pid, meta);
        });
    });
}

// Two-step add flow: click "+ Add Vendor" -> chooser dialog -> per-provider
// credential editor. Bocha lands on the dedicated key modal; the others
// piggy-back on the existing vendor credential modal.
function openSearchAddProviderPicker(missingProviders) {
    if (!missingProviders || missingProviders.length === 0) return;
    if (missingProviders.length === 1) {
        _launchSearchProviderConfig(missingProviders[0].id);
        return;
    }

    const existing = document.getElementById('search-add-modal');
    if (existing) existing.remove();

    const rows = missingProviders.map(p => `
        <button type="button" data-pid="${p.id}"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer
                       bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10
                       text-sm text-slate-700 dark:text-slate-200 transition-colors">
            <span>${escapeHtml(localizedLabel(p.label))}</span>
            <i class="fas fa-chevron-right text-[10px] text-slate-400"></i>
        </button>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'search-add-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10
                    w-full max-w-md mx-4 p-6 shadow-xl">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">${t('models_search_add_provider')}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">${t('models_search_add_desc')}</p>
            <div class="space-y-2">${rows}</div>
            <div class="flex items-center justify-end mt-5">
                <button type="button" onclick="document.getElementById('search-add-modal').remove()"
                        class="px-3 py-1.5 rounded-md text-sm text-slate-600 dark:text-slate-300
                               hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    ${t('cancel')}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-pid]').forEach(el => {
        el.addEventListener('click', () => {
            const pid = el.getAttribute('data-pid');
            modal.remove();
            _launchSearchProviderConfig(pid);
        });
    });
}

function _launchSearchProviderConfig(providerId, providerMeta) {
    if (providerId === 'bocha') {
        openSearchBochaModal(providerMeta);
    } else {
        openVendorModal(providerId, () => loadModelsView({ preserveScroll: true }));
    }
}

function saveSearchCapability() {
    const strategyDd = document.getElementById('cap-search-strategy');
    const providerDd = document.getElementById('cap-search-provider');
    const strategy = strategyDd ? getDropdownValue(strategyDd) : 'auto';
    const provider = (strategy === 'fixed' && providerDd) ? getDropdownValue(providerDd) : '';

    fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'set_capability',
            capability: 'search',
            strategy,
            provider,
        }),
    }).then(r => r.json()).then(data => {
        if (data.status === 'success') {
            showStatus('cap-search-status', 'models_save_success', false);
            setTimeout(() => loadModelsView({ preserveScroll: true }), 400);
        } else {
            showStatus('cap-search-status', 'models_save_failed', true);
        }
    }).catch(() => showStatus('cap-search-status', 'models_save_failed', true));
}

// Minimal bocha API-key modal. Reuses the existing vendor-modal markup
// helpers would be nice, but bocha isn't in PROVIDER_MODELS (it's not a
// model vendor), so we render a tiny dedicated dialog.
function openSearchBochaModal(providerMeta) {
    const existing = document.getElementById('search-bocha-modal');
    if (existing) existing.remove();

    let masked = (providerMeta && providerMeta.api_key_masked) || '';
    if (!masked) {
        const searchCap = (modelsState && modelsState.capabilities && modelsState.capabilities.search) || {};
        const bocha = (searchCap.providers || []).find(p => p.id === 'bocha');
        if (bocha && bocha.api_key_masked) masked = bocha.api_key_masked;
    }
    const hasKey = !!masked;
    const clearBtnHtml = hasKey
        ? `<button type="button" id="search-bocha-clear"
                  class="px-3 py-1.5 rounded-md text-xs text-red-500 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors">
              ${t('models_clear_credential')}
           </button>`
        : '';

    const modal = document.createElement('div');
    modal.id = 'search-bocha-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm';
    modal.innerHTML = `
        <div id="search-bocha-modal-card"
             class="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10
                    w-full max-w-md mx-4 p-6 shadow-xl">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">${t('models_search_bocha_title')}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">${t('models_search_bocha_desc')}</p>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">API Key</label>
            <input id="search-bocha-key" type="text" autocomplete="off" data-1p-ignore data-lpignore="true"
                   class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                          bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-100
                          focus:outline-none focus:border-primary-500 font-mono ${hasKey ? 'cfg-key-masked' : ''}"
                   value="${escapeHtml(masked)}"
                   data-masked="${hasKey ? '1' : ''}"
                   placeholder="sk-..." />
            <div class="flex items-center justify-between gap-3 mt-5">
                <div>${clearBtnHtml}</div>
                <div class="flex items-center gap-3">
                    <button type="button" onclick="document.getElementById('search-bocha-modal').remove()"
                            class="px-3 py-1.5 rounded-md text-sm text-slate-600 dark:text-slate-300
                                   hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        ${t('cancel')}
                    </button>
                    <button type="button" onclick="_saveBochaKey()"
                            class="px-4 py-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium
                                   cursor-pointer transition-colors">
                        ${t('save')}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Reset masked sentinel as soon as the user starts editing so the save
    // handler can tell apart "kept the existing key" vs "typed a new one".
    const input = document.getElementById('search-bocha-key');
    if (input) {
        const unmask = () => {
            if (input.dataset.masked === '1') {
                input.value = '';
                input.dataset.masked = '';
                input.classList.remove('cfg-key-masked');
            }
        };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' || e.key === 'Escape') return;
            unmask();
        });
        input.addEventListener('paste', unmask);
        if (!hasKey) setTimeout(() => input.focus(), 50);
    }
    const clearBtn = document.getElementById('search-bocha-clear');
    if (clearBtn) clearBtn.addEventListener('click', _clearBochaKey);

    modal.addEventListener('mousedown', (e) => {
        if (e.target === modal) modal.remove();
    });
    const onKey = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', onKey);
        }
    };
    document.addEventListener('keydown', onKey);
}

function _saveBochaKey() {
    const input = document.getElementById('search-bocha-key');
    if (!input) return;
    // Untouched masked value => no change requested; close silently.
    if (input.dataset.masked === '1') {
        const modal = document.getElementById('search-bocha-modal');
        if (modal) modal.remove();
        return;
    }
    const apiKey = input.value.trim();
    if (!apiKey) {
        input.focus();
        return;
    }
    fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_search_credential', api_key: apiKey }),
    }).then(r => r.json()).then(data => {
        if (data.status === 'success') {
            const modal = document.getElementById('search-bocha-modal');
            if (modal) modal.remove();
            loadModelsView({ preserveScroll: true });
        }
    });
}

function _clearBochaKey() {
    fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_search_credential', api_key: '' }),
    }).then(r => r.json()).then(data => {
        if (data.status === 'success') {
            const modal = document.getElementById('search-bocha-modal');
            if (modal) modal.remove();
            loadModelsView({ preserveScroll: true });
        }
    });
}

function renderCapabilityBody(def, cap, body) {
    if (def.id === 'search') {
        renderSearchCapability(def, cap, body);
        return;
    }

    // Editable cards: provider dropdown + (optional) model dropdown + save row
    const providerOpts = buildCapabilityProviderOptions(def, cap);
    const providerHtml = `
        <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">${t('models_provider')}</label>
            <div id="cap-${def.id}-provider" class="cfg-dropdown" tabindex="0">
                <div class="cfg-dropdown-selected">
                    <span class="cfg-dropdown-text">--</span>
                    <i class="fas fa-chevron-down cfg-dropdown-arrow"></i>
                </div>
                <div class="cfg-dropdown-menu"></div>
            </div>
        </div>`;

    // The model-picker container is always emitted so the provider-change
    // handler can show/hide it; for `auto` capabilities it starts hidden and
    // gets toggled by setCapabilityModelPickerVisible.
    const modelHtml = def.needsModel ? `
        <div id="cap-${def.id}-model-wrap">
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">${t('models_model')}</label>
            <div id="cap-${def.id}-model" class="cfg-dropdown" tabindex="0">
                <div class="cfg-dropdown-selected">
                    <span class="cfg-dropdown-text">--</span>
                    <i class="fas fa-chevron-down cfg-dropdown-arrow"></i>
                </div>
                <div class="cfg-dropdown-menu"></div>
            </div>
            <div id="cap-${def.id}-model-custom-wrap" class="mt-2 hidden">
                <input id="cap-${def.id}-model-custom" type="text"
                       class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                              bg-slate-50 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-100
                              focus:outline-none focus:border-primary-500 font-mono transition-colors"
                       placeholder="custom model name">
            </div>
        </div>` : '';

    const dimHtml = (def.id === 'embedding' && cap.current_dim) ? `
        <p class="text-xs text-slate-400 dark:text-slate-500">
            <i class="fas fa-cube text-[10px] mr-1"></i>${t('models_dim_label')}: <span class="font-mono">${cap.current_dim}</span>
        </p>` : '';

    // Footer layout: a "hint slot" (filled later by renderCapabilityHints for
    // auto-mode cards) sits on the left while status + save stay anchored on
    // the right. Keeping them on the same row means the save button hugs the
    // inputs above instead of being pushed down by a separate hint line.
    const footer = `
        <div class="flex items-center justify-between gap-3 pt-1">
            <div data-cap-hint="${def.id}" class="flex-1 min-w-0"></div>
            <div class="flex items-center gap-3 flex-shrink-0">
                <span id="cap-${def.id}-status" class="text-xs text-primary-500 opacity-0 transition-opacity duration-300"></span>
                <button onclick="saveCapability('${def.id}')"
                        class="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium
                               cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                    ${t('save')}
                </button>
            </div>
        </div>`;

    body.innerHTML = providerHtml + modelHtml + dimHtml + footer;

    // TTS: mount reply-mode above provider; defer off-mode toggle to the end.
    if (def.id === 'tts') {
        renderVoiceReplyMode(body, cap.reply_mode || 'off', { skipVisibilityToggle: true });
        // Voice-timbre picker depends on provider+model; rebuilt by callbacks.
        const modelWrap = body.querySelector(`#cap-${def.id}-model-wrap`);
        if (modelWrap) {
            const voiceWrap = document.createElement('div');
            voiceWrap.id = `cap-${def.id}-voice-wrap`;
            voiceWrap.innerHTML = `
                <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">${t('models_voice')}</label>
                <div id="cap-${def.id}-voice" class="cfg-dropdown" tabindex="0">
                    <div class="cfg-dropdown-selected">
                        <span class="cfg-dropdown-text">--</span>
                        <i class="fas fa-chevron-down cfg-dropdown-arrow"></i>
                    </div>
                    <div class="cfg-dropdown-menu"></div>
                </div>
                <div id="cap-${def.id}-voice-custom-wrap" class="hidden mt-2">
                    <input id="cap-${def.id}-voice-custom" type="text"
                           class="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700
                                  bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                                  focus:outline-none focus:ring-2 focus:ring-primary-500"
                           placeholder="voice id" />
                </div>
            `;
            modelWrap.parentNode.insertBefore(voiceWrap, modelWrap.nextSibling);
        }
    }

    // `body` is still detached from `document`; scope lookups locally.
    const provDd = body.querySelector(`#cap-${def.id}-provider`);
    // Strip private fields before handing to the generic initDropdown helper.
    const ddOpts = providerOpts.map(o => ({ value: o.value, label: o.label }));

    let pendingProvider = null;
    if (pendingCapabilitySelection
            && pendingCapabilitySelection.capabilityId === def.id
            && providerOpts.some(o => o.value === pendingCapabilitySelection.providerId)) {
        pendingProvider = pendingCapabilitySelection.providerId;
        pendingCapabilitySelection = null;
    }

    // Auto strategy => leave empty sentinel selected. `suggested_provider`
    // is a UI-only preselect (not persisted until the user clicks Save).
    // No current + no suggestion => leave unselected with a placeholder.
    //
    // Pending-config takes priority over both "auto" and "pick provider":
    // when no real (non-sentinel) configured option exists, surfacing
    // "auto" or "pick" misleads the user — there's nothing to auto-route
    // to or pick from. Force a "Not configured" placeholder instead so all
    // capabilities behave consistently on a fresh environment.
    const hasConfiguredOpt = providerOpts.some(o => !o._isAuto && o._configured);
    const noSelectionAndNoHint = !cap.current_provider && !cap.suggested_provider;
    let initialProviderValue;
    let dropdownPlaceholder = null;
    if (!hasConfiguredOpt) {
        initialProviderValue = '';
        dropdownPlaceholder = { placeholder: t('models_pending_config') };
    } else {
        initialProviderValue = pendingProvider
            ? pendingProvider
            : ((cap.strategy === 'auto' && capabilitySupportsAuto(def.id))
                ? ''
                : (cap.current_provider
                    || cap.suggested_provider
                    || (noSelectionAndNoHint ? '' : (ddOpts[0] && ddOpts[0].value))
                    || ''));
        if (noSelectionAndNoHint) {
            dropdownPlaceholder = { placeholder: t('models_pick_provider') };
        }
    }
    initDropdown(
        provDd,
        ddOpts,
        initialProviderValue,
        (value) => onCapabilityProviderChange(def, value, body),
        dropdownPlaceholder,
    );
    decorateCapabilityProviderDropdown(def, provDd, providerOpts);

    if (def.needsModel) {
        rebuildCapabilityModelDropdown(def, initialProviderValue, cap.current_model || '', body);
        // Hide model picker in auto mode — fallback hint below covers it.
        setCapabilityModelPickerVisible(def, initialProviderValue !== '' || !capabilitySupportsAuto(def.id), body);
    }

    if (def.id === 'tts') {
        rebuildCapabilityVoiceDropdown(
            initialProviderValue,
            cap.current_voice || '',
            body,
            cap.current_model || ''
        );
    }

    // Inject auto/router-pending hint banners before the action footer.
    renderCapabilityHints(def, cap, body, initialProviderValue);

    if (def.id === 'tts') {
        _setTtsConfigVisible(body, (cap.reply_mode || 'off') !== 'off');
    }
}

// TTS reply-policy dropdown (off / voice_if_voice / always). Persists on
// change. When off, hides the rest of the TTS card.
function renderVoiceReplyMode(host, currentMode, options) {
    options = options || {};
    const opts = [
        { value: 'off',            label: t('voice_reply_off') },
        { value: 'voice_if_voice', label: t('voice_reply_if_voice') },
        { value: 'always',         label: t('voice_reply_always') },
    ];
    const wrap = document.createElement('div');
    wrap.id = 'voice-reply-mode-wrap';
    wrap.innerHTML = `
        <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">${t('voice_reply_mode_label')}</label>
        <div id="voice-reply-mode-dd" class="cfg-dropdown" tabindex="0">
            <div class="cfg-dropdown-selected">
                <span class="cfg-dropdown-text">--</span>
                <i class="fas fa-chevron-down cfg-dropdown-arrow"></i>
            </div>
            <div class="cfg-dropdown-menu"></div>
        </div>
    `;
    host.prepend(wrap);

    const dd = wrap.querySelector('#voice-reply-mode-dd');
    const valid = ['off', 'voice_if_voice', 'always'];
    const initial = valid.includes(currentMode) ? currentMode : 'off';
    if (!options.skipVisibilityToggle) _setTtsConfigVisible(host, initial !== 'off');
    initDropdown(dd, opts, initial, (mode) => {
        if (!valid.includes(mode)) return;
        _setTtsConfigVisible(host, mode !== 'off');
        fetch('/api/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set_voice_reply_mode', mode }),
        })
            .then(r => r.json())
            .then(data => {
                if (data && data.status === 'success') {
                    _ttsReadyPromise = null;  // force re-probe on next bubble
                }
            })
            .catch(() => {});
    });
}

// Show/hide everything in the TTS card below the reply-mode dropdown.
function _setTtsConfigVisible(host, visible) {
    if (!host) return;
    Array.from(host.children).forEach((child) => {
        if (child.id === 'voice-reply-mode-wrap') return;
        child.classList.toggle('hidden', !visible);
    });
}

// Toggle wrapper visibility instead of re-rendering so dropdown state survives.
function setCapabilityModelPickerVisible(def, visible, scope) {
    const root = scope || document;
    const wrap = root.querySelector(`#cap-${def.id}-model-wrap`);
    if (!wrap) return;
    wrap.classList.toggle('hidden', !visible);
}

function renderCapabilityHints(def, cap, body, currentProvider) {
    // Capabilities that can be in "auto" mode show a fallback hint right
    // under the inputs so users always know what'd actually be hit. The
    // image card additionally surfaces a "router pending" warning until the
    // standalone dispatcher lands.
    // The hint slot is co-located with the save button in the footer row
    // (see renderCapabilityBody) so the save button stays close to the
    // inputs above. We just rewrite the slot's innerHTML — emptying it
    // when the card leaves auto mode, or rendering a one-line hint when
    // it's in auto mode.
    const slot = body.querySelector(`[data-cap-hint="${def.id}"]`);
    if (!slot) return;
    slot.innerHTML = '';

    if (currentProvider !== '' || !capabilitySupportsAuto(def.id)) return;

    // The hint mirrors what the runtime would actually pick when in auto
    // mode. fallback_provider/model are pre-computed on the backend (see
    // _predict_vision_auto, _predict_image_auto) so we can trust them
    // here without re-implementing the provider chain.
    const fbProv = cap.fallback_provider || '';
    const fbModel = cap.fallback_model || '';
    if (!fbProv && !fbModel) return;
    // Show the vendor's display label (e.g. "LinkAI") instead of the raw
    // id ("linkai") when we know it. Falls back to the id when the
    // provider isn't in our vendor table (rare).
    const provMeta = modelsState.providers.find(p => p.id === fbProv);
    const fbProvLabel = (provMeta && localizedLabel(provMeta.label)) || fbProv;
    const fbText = fbModel ? `${fbProvLabel} / ${fbModel}` : fbProvLabel;
    slot.innerHTML = `
        <p class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 min-w-0">
            <i class="fas fa-circle-info text-[10px] flex-shrink-0"></i>
            <span class="flex-shrink-0">${t('models_auto_using')}</span>
            <span class="font-mono text-slate-500 dark:text-slate-400 truncate">${escapeHtml(fbText)}</span>
        </p>`;
}

function buildCapabilityProviderOptions(def, cap) {
    // Show ALL vendors in capability dropdowns so users can see at a glance
    // who's configured (green check) and who isn't (gray dot, click to set
    // up). The list order puts configured vendors first; clicking an
    // unconfigured row opens the vendor modal in-place. ASR/TTS engines that
    // aren't tracked by PROVIDER_MODELS (azure/baidu/google etc.) are treated
    // as "always available" — no credential gate.
    const knownProviderMap = {};
    modelsState.providers.forEach(p => { knownProviderMap[p.id] = p; });

    const explicitList = cap.providers && cap.providers.length ? cap.providers : null;
    let providerIds = explicitList ? explicitList.slice() : modelsState.providers.map(p => p.id);
    if (cap.current_provider && !providerIds.includes(cap.current_provider)) {
        providerIds = [cap.current_provider, ...providerIds];
    }

    const opts = providerIds.map(pid => {
        const meta = knownProviderMap[pid];
        const tracked = !!meta;
        const configured = !tracked || !!meta.configured;
        return {
            value: pid,
            label: (meta && localizedLabel(meta.label)) || pid,
            _tracked: tracked,
            _configured: configured,
        };
    });

    opts.sort((a, b) => {
        if (a._configured === b._configured) return 0;
        return a._configured ? -1 : 1;
    });

    // Capabilities with a fallback ("auto") strategy expose it as a sentinel
    // option pinned to the top of the list. We use empty-string as the auto
    // value so the existing save handler propagates it untouched to the
    // backend, which interprets "" as "fall back to the main model".
    // Skip the sentinel when no real vendor is configured — "auto" would
    // route to nothing useful and the renderer will show "Not configured" instead.
    const hasAnyConfigured = opts.some(o => o._configured);
    if ((cap.strategy === 'auto' || cap.strategy === 'specified') && hasAnyConfigured) {
        if (capabilitySupportsAuto(def.id)) {
            opts.unshift({
                value: '',
                label: t('models_strategy_auto'),
                _tracked: false,
                _configured: true,
                _isAuto: true,
            });
        }
    }
    return opts;
}

function capabilitySupportsAuto(capId) {
    // Embedding is intentionally NOT here: runtime only auto-falls back to
    // OpenAI/LinkAI, so dressing it up as "auto" hides reality from users.
    return capId === 'image' || capId === 'vision';
}

// After initDropdown renders the capability provider menu, decorate each
// row with the right-aligned configuration cue:
//   - configured rows: nothing extra — the .active marker (a brand-rose ✓)
//     already comes from initDropdown's selected-state CSS for the row the
//     user currently picked. Other configured rows show no chrome, mirroring
//     a plain "switch to this" selector.
//   - unconfigured rows: a subdued gear icon hints at "click to configure".
//     The row's whole click handler is swapped to launch the vendor modal
//     in place rather than selecting an unusable value.
function decorateCapabilityProviderDropdown(def, ddEl, opts) {
    if (!ddEl) return;
    const menu = ddEl.querySelector('.cfg-dropdown-menu');
    if (!menu) return;

    const optByValue = {};
    opts.forEach(o => { optByValue[o.value] = o; });

    menu.querySelectorAll('.cfg-dropdown-item').forEach(item => {
        const value = item.dataset.value;
        const opt = optByValue[value];
        if (!opt) return;
        item.classList.add('cap-provider-item');
        if (!opt._configured) item.classList.add('cap-provider-unconfigured');

        // Wrap the label so the trailing affordance lines up via flex:auto.
        const labelText = item.textContent;
        item.textContent = '';
        const labelEl = document.createElement('span');
        labelEl.className = 'cap-provider-label';
        labelEl.textContent = labelText;
        item.appendChild(labelEl);

        if (!opt._configured) {
            // Trailing gear icon as the "configure this vendor" affordance.
            const gear = document.createElement('i');
            gear.className = 'fas fa-gear cap-provider-gear';
            item.appendChild(gear);
        }

        if (!opt._configured && opt._tracked) {
            // Hijack the click: open the vendor modal instead of selecting
            // an unusable value, and remember which capability the user was
            // configuring so the post-save reload can preselect the vendor.
            const newItem = item.cloneNode(true);
            item.replaceWith(newItem);
            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                ddEl.classList.remove('open');
                openVendorModal(value, (savedProviderId) => {
                    pendingCapabilitySelection = {
                        capabilityId: def.id,
                        providerId: savedProviderId || value,
                    };
                    loadModelsView({ preserveScroll: true });
                });
            });
        }
    });
}

// Lightweight decorator for the "add vendor" modal's provider picker:
// every configured vendor row gets a trailing brand-rose ✓ so the user can
// see at a glance who's already set up, without having to read each row.
// Unlike decorateCapabilityProviderDropdown we don't hijack clicks here —
// picking an unconfigured vendor in this modal *is* the intended action.
function decorateVendorModalPicker(ddEl, opts) {
    if (!ddEl) return;
    const menu = ddEl.querySelector('.cfg-dropdown-menu');
    if (!menu) return;

    const optByValue = {};
    opts.forEach(o => { optByValue[o.value] = o; });

    menu.querySelectorAll('.cfg-dropdown-item').forEach(item => {
        const opt = optByValue[item.dataset.value];
        if (!opt) return;
        // Tag the row so the global active-row ✓ rule is suppressed in CSS
        // (otherwise configured AND selected rows would render two checks).
        item.classList.add('vendor-picker-item');
        if (opt._isAddNew) {
            // "Custom" is an add-new action (multiple entries allowed),
            // so show a trailing + instead of the configured ✓.
            const plus = document.createElement('i');
            plus.className = 'fas fa-plus vendor-picker-add-mark';
            item.appendChild(plus);
            return;
        }
        if (!opt._configured) return;
        const check = document.createElement('i');
        check.className = 'fas fa-check vendor-picker-configured-mark';
        item.appendChild(check);
    });
}

function rebuildCapabilityModelDropdown(def, providerId, selectedModel, scope) {
    // `scope` lets the caller (renderCapabilityBody) target a still-detached
    // subtree. After the card is mounted, callers may pass `document` instead.
    const root = scope || document;
    const el = root.querySelector(`#cap-${def.id}-model`);
    if (!el) return;

    // Prefer the capability-scoped model list when the backend provides one
    // (vision / image). It reflects the models the runtime can actually
    // dispatch to for this capability, instead of the vendor's full chat-
    // model catalog. Fall back to the generic provider.models for chat /
    // embedding / tts where any vendor model is fair game.
    //
    // Entries may be plain strings or {value, hint} objects (image catalog
    // uses the latter to surface brand aliases like "Nano Banana 2" next to
    // the technical Gemini model id). We normalize to {value, label, hint}
    // before handing off to initDropdown.
    const cap = modelsState.capabilities[def.id] || {};
    const capModelMap = cap.provider_models || {};
    let rawList;
    if (capModelMap[providerId]) {
        rawList = capModelMap[providerId].slice();
    } else {
        const provider = modelsState.providers.find(p => p.id === providerId);
        rawList = (provider && provider.models) ? provider.models.slice() : [];
    }
    const modelValues = [];
    const opts = rawList.map(entry => {
        if (typeof entry === 'string') {
            modelValues.push(entry);
            return { value: entry, label: entry };
        }
        modelValues.push(entry.value);
        return { value: entry.value, label: entry.label || entry.value, hint: entry.hint || '' };
    });
    opts.push({ value: '__custom__', label: 'Custom' });

    let initialValue = selectedModel || '';
    if (initialValue && !modelValues.includes(initialValue)) {
        initialValue = '__custom__';
    }
    if (!initialValue && opts.length) initialValue = opts[0].value;

    initDropdown(el, opts, initialValue, (value) => {
        const customWrap = document.getElementById(`cap-${def.id}-model-custom-wrap`);
        if (customWrap) {
            if (value === '__custom__') {
                customWrap.classList.remove('hidden');
                const input = document.getElementById(`cap-${def.id}-model-custom`);
                if (input && !input.value) input.value = selectedModel || '';
            } else {
                customWrap.classList.add('hidden');
            }
        }
        // TTS voice catalog may be scoped per engine model (aggregating
        // gateways). Rebuild the voice picker whenever the model changes.
        if (def.id === 'tts') {
            const provDd = document.getElementById('cap-tts-provider');
            const provId = provDd ? getDropdownValue(provDd) : '';
            rebuildCapabilityVoiceDropdown(provId, '', null, value);
        }
    });

    const customWrap = root.querySelector(`#cap-${def.id}-model-custom-wrap`);
    if (customWrap) {
        if (initialValue === '__custom__') {
            customWrap.classList.remove('hidden');
            const input = root.querySelector(`#cap-${def.id}-model-custom`);
            if (input) input.value = selectedModel || '';
        } else {
            customWrap.classList.add('hidden');
        }
    }
}

// TTS-only: rebuild the voice timbre picker against the provider's
// curated voice list. Hidden when no provider is picked.
//
// Each voice entry may be:
//   - a bare string  (code = label)
//   - {value, label, hint?}   so we can show a friendly Chinese name
//     while persisting the raw API code that the runtime sends.
function rebuildCapabilityVoiceDropdown(providerId, selectedVoice, scope, modelId) {
    const root = scope || document;
    const wrap = root.querySelector(`#cap-tts-voice-wrap`);
    const el = root.querySelector(`#cap-tts-voice`);
    if (!wrap || !el) return;
    const cap = modelsState.capabilities.tts || {};
    const voicesByProvider = cap.provider_voices || {};
    let raw = (providerId && voicesByProvider[providerId]) || [];
    // Some providers (gateways) scope voices by engine model id.
    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
        const activeModel = modelId
            || (root.querySelector(`#cap-tts-model`) ? getDropdownValue(root.querySelector(`#cap-tts-model`)) : '');
        raw = (activeModel && raw[activeModel]) || [];
    }
    if (!raw || raw.length === 0) {
        wrap.classList.add('hidden');
        return;
    }
    wrap.classList.remove('hidden');
    // Voice picker: friendly name on the left, raw API code as right-hand
    // hint. Persisted/sent value is always the raw code.
    const codes = [];
    const opts = raw.map(entry => {
        if (typeof entry === 'string') {
            codes.push(entry);
            return { value: entry, label: entry };
        }
        codes.push(entry.value);
        const code = entry.value;
        const desc = entry.hint || entry.label || code;
        return {
            value: code,
            label: desc,
            hint: desc === code ? '' : code,
        };
    });
    opts.push({ value: '__custom__', label: 'Custom' });

    // Off-catalog values route through the custom branch.
    let initial = selectedVoice || '';
    const isCustom = initial && !codes.includes(initial);
    if (isCustom) initial = '__custom__';
    if (!initial) initial = codes[0];

    initDropdown(el, opts, initial, (value) => {
        const customWrap = root.querySelector(`#cap-tts-voice-custom-wrap`);
        if (!customWrap) return;
        if (value === '__custom__') {
            customWrap.classList.remove('hidden');
            const input = root.querySelector(`#cap-tts-voice-custom`);
            if (input && !input.value) input.value = isCustom ? selectedVoice : '';
        } else {
            customWrap.classList.add('hidden');
        }
    });

    const customWrap = root.querySelector(`#cap-tts-voice-custom-wrap`);
    if (customWrap) {
        if (initial === '__custom__') {
            customWrap.classList.remove('hidden');
            const input = root.querySelector(`#cap-tts-voice-custom`);
            if (input) input.value = isCustom ? selectedVoice : '';
        } else {
            customWrap.classList.add('hidden');
        }
    }
}

function onCapabilityProviderChange(def, providerId, scope) {
    if (def.needsModel) {
        // Empty sentinel hides the model picker (capability is in auto mode).
        const isAuto = providerId === '' && capabilitySupportsAuto(def.id);
        if (!isAuto) {
            rebuildCapabilityModelDropdown(def, providerId, '', scope);
        }
        setCapabilityModelPickerVisible(def, !isAuto, scope);
    }
    if (def.id === 'tts') {
        rebuildCapabilityVoiceDropdown(providerId, '', scope);
    }
    const body = scope || document.querySelector(`[data-cap-body="${def.id}"]`);
    if (body) {
        const cap = modelsState.capabilities[def.id] || {};
        renderCapabilityHints(def, cap, body, providerId);
    }
}

function getCapabilityModelValue(def) {
    if (!def.needsModel) return '';
    const dd = document.getElementById(`cap-${def.id}-model`);
    if (!dd) return '';
    const v = getDropdownValue(dd);
    if (v === '__custom__') {
        const input = document.getElementById(`cap-${def.id}-model-custom`);
        return input ? input.value.trim() : '';
    }
    return v || '';
}

function saveCapability(capId) {
    const def = MODELS_CAPABILITY_DEFS.find(d => d.id === capId);
    if (!def || !def.editable) return;
    // Search has its own form (strategy + provider, no model picker).
    if (capId === 'search') { saveSearchCapability(); return; }
    const provDd = document.getElementById(`cap-${capId}-provider`);
    const provider = provDd ? getDropdownValue(provDd) : '';
    // When the user is in auto mode (provider == ""), the model picker is
    // hidden and any value left in it is stale; persist an empty model so
    // the backend treats this as "fall back to the runtime chain".
    const isAuto = provider === '' && capabilitySupportsAuto(capId);
    const model = isAuto ? '' : getCapabilityModelValue(def);
    // TTS carries an extra voice timbre (supports free-text custom ids).
    let voice = '';
    if (capId === 'tts' && !isAuto) {
        const voiceDd = document.getElementById(`cap-${capId}-voice`);
        voice = voiceDd ? getDropdownValue(voiceDd) : '';
        if (voice === '__custom__') {
            const input = document.getElementById(`cap-${capId}-voice-custom`);
            voice = input ? input.value.trim() : '';
        }
    }

    // Embedding changes invalidate any pre-existing vector index because
    // dimensions / vendor differ. Gate the save behind a confirm, and on
    // success surface a dedicated info dialog telling the user how to
    // rebuild — both via the in-app custom dialog, not the native alert.
    if (capId === 'embedding') {
        const cap = modelsState.capabilities[capId] || {};
        const before = (cap.current_provider || '').trim();
        const after = (provider || '').trim();
        if (before !== after) {
            showConfirmDialog({
                title: t('models_embedding_change_title'),
                message: t('models_embedding_change_msg'),
                okText: t('save'),
                cancelText: t('cancel'),
                onConfirm: () => _persistCapability(capId, provider, model, () => {
                    showConfirmDialog({
                        title: t('models_embedding_saved_title'),
                        message: t('models_embedding_saved_msg'),
                        okText: t('models_embedding_saved_ok'),
                        hideCancel: true,
                        onConfirm: () => {
                            navigateTo('chat');
                            // Defer focus + value set: navigateTo may
                            // re-render the chat panel; setting value before
                            // the input is mounted would be lost.
                            setTimeout(() => {
                                const input = document.getElementById('chat-input');
                                if (!input) return;
                                input.value = '/memory rebuild-index';
                                input.focus();
                                // Trigger any input listeners (autosize, send-button enable, etc.)
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }, 60);
                        },
                    });
                }),
            });
            return;
        }
    }
    _persistCapability(capId, provider, model, undefined, { voice });
}

function _persistCapability(capId, provider, model, onAfterSuccess, extras) {
    const payload = { action: 'set_capability', capability: capId, provider_id: provider, model: model };
    if (extras && extras.voice !== undefined) payload.voice = extras.voice;
    fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(data => {
        if (data.status === 'success') {
            // Flash "Saved" before reload so the status survives the rebuild.
            showStatus(`cap-${capId}-status`, 'models_save_success', false);
            setTimeout(() => {
                loadModelsView({ preserveScroll: true });
                if (onAfterSuccess) onAfterSuccess();
            }, 400);
        } else {
            showStatus(`cap-${capId}-status`, 'models_save_failed', true);
        }
    }).catch(() => showStatus(`cap-${capId}-status`, 'models_save_failed', true));
}

// ---------- Vendor credential modal ------------------------------------

let vendorModalState = { providerId: '', onSaved: null };

function openVendorModal(providerId, onSaved) {
    vendorModalState = { providerId: providerId || '', onSaved: onSaved || null };

    const overlay = document.getElementById('vendor-modal-overlay');
    const titleEl = document.getElementById('vendor-modal-title');
    const subEl = document.getElementById('vendor-modal-subtitle');
    const pickerWrap = document.getElementById('vendor-modal-picker-wrap');
    const baseWrap = document.getElementById('vendor-modal-base-wrap');
    const baseInput = document.getElementById('vendor-modal-base');
    const baseHint = document.getElementById('vendor-modal-base-hint');
    const keyInput = document.getElementById('vendor-modal-key');
    const clearBtn = document.getElementById('vendor-modal-clear');

    // Reset any leftover status (e.g. previous "Saved" message)
    const statusEl = document.getElementById('vendor-modal-status');
    if (statusEl) {
        statusEl.textContent = '';
        statusEl.classList.add('opacity-0');
    }

    if (!providerId) {
        // Add flow — show provider picker, default to the first unconfigured one.
        // We render every configured vendor with a trailing green ✓ via the
        // dropdown decorator, mirroring the visual language used by the
        // capability provider dropdowns. The .active row already shows the
        // currently selected vendor via its own background highlight, so we
        // intentionally suppress the global active-row ✓ for this picker
        // (see CSS) — otherwise configured + selected rows would show two.
        // Expanded custom provider cards ("custom:<id>") are edited via their
        // dedicated modal, so they are excluded from this picker. Picking the
        // "custom" entry creates a *new* custom provider via that modal —
        // this is how multiple OpenAI-compatible endpoints are added.
        const builtinProviders = modelsState.providers.filter(p => !isCustomProviderCard(p));
        const pickerOpts = builtinProviders.map(p => ({
            value: p.id,
            label: localizedLabel(p.label),
            _configured: !!p.configured,
        }));
        // In multi-provider mode the backend replaces the bare "custom" card
        // with the expanded ones; re-add it here so the entry stays available.
        if (!pickerOpts.some(o => o.value === 'custom')) {
            pickerOpts.push({ value: 'custom', label: t('models_custom_vendor_label'), _configured: false });
        }
        // "Custom" always behaves as an add-new action (multiple entries
        // allowed), so it shows a + mark instead of the configured ✓.
        pickerOpts.forEach(o => { if (o.value === 'custom') { o._isAddNew = true; o._configured = false; } });
        const unconfigured = builtinProviders.filter(p => !p.configured);
        const defaultId = (unconfigured[0] && unconfigured[0].id) || (builtinProviders[0] && builtinProviders[0].id) || 'custom';
        pickerWrap.classList.remove('hidden');
        const pickerEl = document.getElementById('vendor-modal-picker');
        const onPick = (val) => {
            if (val === 'custom') {
                // "Custom" in the add flow always creates a new
                // OpenAI-compatible provider entry via the dedicated modal
                // (name + base + key), supporting multiple custom endpoints.
                closeVendorModal();
                openCustomProviderModal('');
                return;
            }
            fillVendorModalForProvider(val);
        };
        initDropdown(pickerEl, pickerOpts, defaultId, onPick);
        decorateVendorModalPicker(pickerEl, pickerOpts);
        onPick(defaultId);
    } else {
        pickerWrap.classList.add('hidden');
        fillVendorModalForProvider(providerId);
    }

    overlay.classList.remove('hidden');

    document.getElementById('vendor-modal-cancel').onclick = closeVendorModal;
    document.getElementById('vendor-modal-save').onclick = saveVendorModal;
    clearBtn.onclick = clearVendorModal;

    // Once the user edits the masked value, drop the "masked sentinel" dataset
    // so the save handler treats their input as a real new key. We compare on
    // the next tick because keydown fires before the new char lands in .value.
    keyInput.oninput = function () {
        if (keyInput.dataset.masked === '1' && keyInput.value !== keyInput.dataset.maskedVal) {
            keyInput.dataset.masked = '';
        }
    };

    function onOverlayClick(e) {
        if (e.target === overlay) {
            closeVendorModal();
            overlay.removeEventListener('click', onOverlayClick);
        }
    }
    overlay.addEventListener('click', onOverlayClick);
    keyInput.focus();
}

function fillVendorModalForProvider(providerId) {
    const meta = modelsState.providers.find(p => p.id === providerId);
    if (!meta) return;
    document.getElementById('vendor-modal-title').textContent = localizedLabel(meta.label);
    document.getElementById('vendor-modal-subtitle').textContent = meta.id;

    // ----- API Base -----
    // Always reflect the *current effective* base as the input value so the
    // user can see (and edit) what's in use today. Placeholder is reserved
    // strictly for the "not yet typed anything" state and shows the official
    // default — never mixed with the actual value.
    const baseWrap = document.getElementById('vendor-modal-base-wrap');
    const baseInput = document.getElementById('vendor-modal-base');
    const baseHint = document.getElementById('vendor-modal-base-hint');
    if (meta.api_base_field) {
        baseWrap.classList.remove('hidden');
        baseInput.placeholder = meta.api_base_default || meta.api_base_placeholder || '';
        baseInput.value = meta.api_base || '';
        baseHint.classList.add('hidden');
    } else {
        baseWrap.classList.add('hidden');
        baseInput.value = '';
    }

    // ----- API Key -----
    // For configured vendors, surface the masked key as the input *value* so
    // it shows up in the same dark text as a real entry — making "configured"
    // visually unambiguous. The masked form (e.g. "sk-r***zRU") is also a
    // sentinel: the save handler treats untouched masked input as "no change".
    const keyInput = document.getElementById('vendor-modal-key');
    if (meta.configured && meta.api_key_masked) {
        keyInput.value = meta.api_key_masked;
        keyInput.dataset.masked = '1';
        keyInput.dataset.maskedVal = meta.api_key_masked;
        keyInput.placeholder = '';
    } else {
        keyInput.value = '';
        keyInput.dataset.masked = '';
        keyInput.dataset.maskedVal = '';
        keyInput.placeholder = 'sk-...';
    }

    const clearBtn = document.getElementById('vendor-modal-clear');
    clearBtn.classList.toggle('hidden', !meta.configured);

    vendorModalState.providerId = providerId;
}

function closeVendorModal() {
    document.getElementById('vendor-modal-overlay').classList.add('hidden');
}

function saveVendorModal() {
    const providerId = vendorModalState.providerId;
    if (!providerId) return;
    const keyInput = document.getElementById('vendor-modal-key');
    const apiBase = document.getElementById('vendor-modal-base').value.trim();

    // Treat "input still equals the masked value we surfaced on open" as "no
    // change" — the backend uses missing/empty api_key to skip the field.
    let apiKey = keyInput.value.trim();
    const masked = keyInput.dataset.masked === '1';
    const maskedVal = keyInput.dataset.maskedVal || '';
    if (masked && apiKey === maskedVal) {
        apiKey = '';
    }

    if (!apiKey && !masked) {
        // First-time setup with no key entered → nudge the user.
        keyInput.focus();
        return;
    }

    const btn = document.getElementById('vendor-modal-save');
    btn.disabled = true;
    const payload = { action: 'set_provider', provider_id: providerId, api_base: apiBase };
    if (apiKey) payload.api_key = apiKey;
    fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(data => {
        btn.disabled = false;
        if (data.status === 'success') {
            closeVendorModal();
            const onSaved = vendorModalState.onSaved;
            if (onSaved) {
                try { onSaved(providerId); } catch (e) { /* noop */ }
            } else {
                loadModelsView();
            }
        } else {
            showStatus('vendor-modal-status', 'models_save_failed', true);
        }
    }).catch(() => {
        btn.disabled = false;
        showStatus('vendor-modal-status', 'models_save_failed', true);
    });
}

function clearVendorModal() {
    const providerId = vendorModalState.providerId;
    if (!providerId) return;
    showConfirmDialog({
        title: t('models_clear_confirm_title'),
        message: t('models_clear_confirm_msg'),
        okText: t('models_clear_credential'),
        cancelText: t('cancel'),
        onConfirm: () => {
            fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_provider', provider_id: providerId }),
            }).then(r => r.json()).then(data => {
                if (data.status === 'success') {
                    closeVendorModal();
                    loadModelsView();
                } else {
                    showStatus('vendor-modal-status', 'models_clear_failed', true);
                }
            }).catch(() => showStatus('vendor-modal-status', 'models_clear_failed', true));
        }
    });
}

// =====================================================================
// Custom (OpenAI-compatible) provider modal — add / edit
// =====================================================================
// State for the dedicated custom-provider modal. `editId` is empty when
// adding and set to the provider id when editing.
let customProviderModalState = { editId: '' };

function openCustomProviderModal(providerId) {
    const editing = !!providerId;
    customProviderModalState = { editId: editing ? providerId : '' };

    const card = editing ? getCustomProviderCards().find(p => p.custom_id === providerId) : null;

    const overlay = document.getElementById('custom-provider-modal-overlay');
    if (!overlay) return;

    document.getElementById('custom-provider-modal-title').textContent =
        editing ? t('models_custom_edit_title') : t('models_custom_add_title');

    const nameInput = document.getElementById('custom-provider-name');
    const baseInput = document.getElementById('custom-provider-base');
    const keyInput = document.getElementById('custom-provider-key');

    nameInput.value = card ? (card.custom_name || '') : '';
    baseInput.value = card ? (card.api_base || '') : '';

    // Surface the masked key as the value for configured providers so the
    // "already set" state is unambiguous; an untouched masked value means
    // "keep the existing key" on save (mirrors the vendor modal contract).
    if (card && card.configured && card.api_key_masked) {
        keyInput.value = card.api_key_masked;
        keyInput.dataset.masked = '1';
        keyInput.dataset.maskedVal = card.api_key_masked;
    } else {
        keyInput.value = '';
        keyInput.dataset.masked = '';
        keyInput.dataset.maskedVal = '';
    }
    keyInput.oninput = function () {
        if (keyInput.dataset.masked === '1' && keyInput.value !== keyInput.dataset.maskedVal) {
            keyInput.dataset.masked = '';
        }
    };

    // Populate custom headers from the card data
    const headersList = document.getElementById('custom-provider-headers-list');
    headersList.innerHTML = '';
    const headersSection = document.getElementById('custom-provider-headers-section');
    const headersChevron = document.getElementById('custom-provider-headers-chevron');
    headersSection.classList.add('hidden');
    headersChevron.style.transform = '';

    const existingHeaders = (card && card.custom_headers) ? card.custom_headers : {};
    if (existingHeaders && typeof existingHeaders === 'object') {
        Object.entries(existingHeaders).forEach(([key, val]) => {
            _addCustomHeaderRow(key, val);
        });
        // Auto-expand if there are existing headers
        if (Object.keys(existingHeaders).length > 0) {
            headersSection.classList.remove('hidden');
            headersChevron.style.transform = 'rotate(90deg)';
        }
    }

    const statusEl = document.getElementById('custom-provider-modal-status');
    if (statusEl) { statusEl.textContent = ''; statusEl.classList.add('opacity-0'); }

    overlay.classList.remove('hidden');
    document.getElementById('custom-provider-modal-cancel').onclick = closeCustomProviderModal;
    document.getElementById('custom-provider-modal-save').onclick = saveCustomProviderModal;

    // Wire up the headers toggle button
    document.getElementById('custom-provider-headers-toggle').onclick = function() {
        const section = document.getElementById('custom-provider-headers-section');
        const chevron = document.getElementById('custom-provider-headers-chevron');
        const isHidden = section.classList.contains('hidden');
        section.classList.toggle('hidden');
        chevron.style.transform = isHidden ? 'rotate(90deg)' : '';
    };

    // Wire up the add header button
    document.getElementById('custom-provider-headers-add').onclick = function() {
        _addCustomHeaderRow('', '');
    };

    // Delete is only available when editing an existing provider.
    const deleteBtn = document.getElementById('custom-provider-modal-delete');
    if (deleteBtn) {
        deleteBtn.classList.toggle('hidden', !editing);
        deleteBtn.onclick = editing ? () => deleteCustomProvider(providerId) : null;
    }

    function onOverlayClick(e) {
        if (e.target === overlay) {
            closeCustomProviderModal();
            overlay.removeEventListener('click', onOverlayClick);
        }
    }
    overlay.addEventListener('click', onOverlayClick);
    nameInput.focus();
}

// Helper: add a single header key-value row to the custom headers list
function _addCustomHeaderRow(key, value) {
    const list = document.getElementById('custom-provider-headers-list');
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2';
    row.innerHTML = `
        <input type="text" placeholder="${t('models_custom_headers_key')}"
               value="${escapeHtml(key || '')}"
               class="custom-header-key flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600
                      bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-100 font-mono
                      focus:outline-none focus:border-primary-500 transition-colors">
        <input type="text" placeholder="${t('models_custom_headers_value')}"
               value="${escapeHtml(value || '')}"
               class="custom-header-value flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600
                      bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-100 font-mono
                      focus:outline-none focus:border-primary-500 transition-colors">
        <button type="button" class="custom-header-remove p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex-shrink-0">
            <i class="fas fa-times text-[10px]"></i>
        </button>
    `;
    row.querySelector('.custom-header-remove').onclick = function() {
        row.remove();
    };
    list.appendChild(row);
}

// Helper: collect custom headers from the modal into an object
function _collectCustomHeaders() {
    const headers = {};
    const keys = document.querySelectorAll('.custom-header-key');
    const values = document.querySelectorAll('.custom-header-value');
    keys.forEach((keyInput, i) => {
        const k = keyInput.value.trim();
        const v = (values[i] ? values[i].value : '').trim();
        if (k) {
            headers[k] = v;
        }
    });
    return headers;
}

function closeCustomProviderModal() {
    const overlay = document.getElementById('custom-provider-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function saveCustomProviderModal() {
    const name = document.getElementById('custom-provider-name').value.trim();
    const apiBase = document.getElementById('custom-provider-base').value.trim();
    const keyInput = document.getElementById('custom-provider-key');

    if (!name) {
        showStatus('custom-provider-modal-status', 'models_custom_name_required', true);
        document.getElementById('custom-provider-name').focus();
        return;
    }
    const editing = !!customProviderModalState.editId;
    if (!editing && !apiBase) {
        showStatus('custom-provider-modal-status', 'models_custom_base_required', true);
        document.getElementById('custom-provider-base').focus();
        return;
    }

    // Untouched masked key => no change (omit from payload).
    let apiKey = keyInput.value.trim();
    if (keyInput.dataset.masked === '1' && apiKey === (keyInput.dataset.maskedVal || '')) {
        apiKey = '';
    }

    const payload = {
        action: 'set_custom_provider',
        name: name,
        api_base: apiBase,
    };
    if (apiKey) payload.api_key = apiKey;
    if (editing) payload.id = customProviderModalState.editId;

    // Collect custom headers (always send, even if empty, so backend can clear them)
    const customHeaders = _collectCustomHeaders();
    payload.custom_headers = customHeaders;

    const btn = document.getElementById('custom-provider-modal-save');
    btn.disabled = true;
    fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(data => {
        btn.disabled = false;
        if (data.status === 'success') {
            closeCustomProviderModal();
            loadModelsView();
        } else {
            showStatus('custom-provider-modal-status', 'models_save_failed', true);
        }
    }).catch(() => {
        btn.disabled = false;
        showStatus('custom-provider-modal-status', 'models_save_failed', true);
    });
}

function deleteCustomProvider(providerId) {
    showConfirmDialog({
        title: t('models_custom_delete_confirm_title'),
        message: t('models_custom_delete_confirm_msg'),
        okText: t('models_custom_delete'),
        cancelText: t('cancel'),
        onConfirm: () => {
            fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_custom_provider', id: providerId }),
            }).then(r => r.json()).then(data => {
                if (data.status === 'success') {
                    closeCustomProviderModal();
                    loadModelsView();
                }
            }).catch(() => { /* noop */ });
        }
    });
}

// =====================================================================
// Scheduler View
// =====================================================================
let tasksLoaded = false;
function loadTasksView() {
    if (tasksLoaded) return;
    fetch('/api/scheduler').then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        const emptyEl = document.getElementById('tasks-empty');
        const listEl = document.getElementById('tasks-list');
        const allTasks = data.tasks || [];
        // Only show active (enabled) tasks
        const tasks = allTasks.filter(t => t.enabled !== false);
        if (tasks.length === 0) {
            emptyEl.querySelector('p').textContent = 'No scheduled tasks';
            return;
        }
        emptyEl.classList.add('hidden');
        listEl.classList.remove('hidden');
        listEl.innerHTML = '';

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10 p-4';
            const typeLabel = task.type === 'cron'
                ? `<span class="text-xs font-mono text-slate-400">${escapeHtml(task.cron || '')}</span>`
                : `<span class="text-xs text-slate-400">${escapeHtml(task.type || 'once')}</span>`;
            let nextRun = '--';
            if (task.next_run_at) {
                // next_run_at is an ISO string, not a Unix timestamp
                const d = new Date(task.next_run_at);
                if (!isNaN(d.getTime())) nextRun = d.toLocaleString();
            }
            card.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-primary-400"></span>
                    <span class="font-medium text-sm text-slate-700 dark:text-slate-200">${escapeHtml(task.name || task.id || '--')}</span>
                    <div class="flex-1"></div>
                    ${typeLabel}
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">${escapeHtml(task.prompt || task.description || '')}</p>
                <div class="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                    <span><i class="fas fa-clock mr-1"></i>${'Next run'}: ${nextRun}</span>
                </div>`;
            listEl.appendChild(card);
        });
        tasksLoaded = true;
    }).catch(() => {});
}

// =====================================================================
// Logs View
// =====================================================================
let logEventSource = null;

function logLevelClass(line) {
    if (/\[CRITICAL\]/.test(line)) return 'log-line-critical';
    if (/\[ERROR\]/.test(line))    return 'log-line-error';
    if (/\[WARNING\]/.test(line))  return 'log-line-warning';
    if (/\[INFO\]/.test(line))     return 'log-line-info';
    if (/\[DEBUG\]/.test(line))    return 'log-line-debug';
    return '';
}

function getHiddenLevels() {
    const hidden = new Set();
    document.querySelectorAll('.log-filter-cb').forEach(function(cb) {
        if (!cb.checked) hidden.add('log-line-' + cb.dataset.level);
    });
    return hidden;
}

function applyLogFilter() {
    const hidden = getHiddenLevels();
    document.querySelectorAll('#log-output .log-line').forEach(function(span) {
        const level = span.classList[1] || '';
        span.style.display = hidden.has(level) ? 'none' : '';
    });
}

function appendLogLines(output, text) {
    const hidden = getHiddenLevels();
    let lastLevelClass = '';
    const lines = text.split('\n');
    lines.forEach(function(line, i) {
        if (i === lines.length - 1 && line === '') return;
        const span = document.createElement('span');
        const levelClass = logLevelClass(line) || lastLevelClass;
        if (logLevelClass(line)) lastLevelClass = levelClass;
        span.className = 'log-line ' + levelClass;
        span.textContent = line + '\n';
        if (hidden.has(levelClass)) span.style.display = 'none';
        output.appendChild(span);
    });
}

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('log-filter-cb')) applyLogFilter();
});

function startLogStream() {
    if (logEventSource) return;
    const output = document.getElementById('log-output');
    output.innerHTML = '';

    logEventSource = new EventSource('/api/logs');
    logEventSource.onmessage = function(e) {
        let item;
        try { item = JSON.parse(e.data); } catch (_) { return; }

        if (item.type === 'init') {
            output.innerHTML = '';
            appendLogLines(output, item.content || '');
            output.scrollTop = output.scrollHeight;
        } else if (item.type === 'line') {
            appendLogLines(output, item.content);
            output.scrollTop = output.scrollHeight;
        } else if (item.type === 'error') {
            output.textContent = item.message || 'Error loading logs';
        }
    };
    logEventSource.onerror = function() {
        logEventSource.close();
        logEventSource = null;
    };
}

function stopLogStream() {
    if (logEventSource) {
        logEventSource.close();
        logEventSource = null;
    }
}

// =====================================================================
// View Navigation Hook
// =====================================================================
const _origNavigateTo = navigateTo;
navigateTo = function(viewId) {
    // Stop log stream when leaving logs view
    if (currentView === 'logs' && viewId !== 'logs') stopLogStream();

    _origNavigateTo(viewId);

    // Lazy-load view data
    if (viewId === 'config') loadConfigView();
    else if (viewId === 'models') loadModelsView();
    else if (viewId === 'skills') loadSkillsView();
    else if (viewId === 'memory') {
        document.getElementById('memory-panel-viewer').classList.add('hidden');
        document.getElementById('memory-panel-list').classList.remove('hidden');
        switchMemoryTab('files');
    }
    else if (viewId === 'knowledge') loadKnowledgeView();
    else if (viewId === 'tasks') loadTasksView();
    else if (viewId === 'logs') startLogStream();
};

// =====================================================================
// Knowledge View
// =====================================================================
let _knowledgeTreeData = [];
let _knowledgeRootFiles = [];
let _knowledgeCurrentFile = null;
let _knowledgeGraphLoaded = false;

function loadKnowledgeView() {
    // Reset to docs tab
    switchKnowledgeTab('docs');
    _knowledgeGraphLoaded = false;
    _knowledgeCurrentFile = null;

    fetch('/api/knowledge/list').then(r => r.json()).then(data => {
        if (data.status !== 'success') return;

        const emptyEl = document.getElementById('knowledge-empty');
        const docsPanel = document.getElementById('knowledge-panel-docs');
        const statsEl = document.getElementById('knowledge-stats');

        const tree = data.tree || [];
        const rootFiles = data.root_files || [];
        _knowledgeTreeData = tree;
        _knowledgeRootFiles = rootFiles;
        const stats = data.stats || {};
        const totalPages = stats.pages || 0;
        const sizeStr = stats.size < 1024 ? stats.size + ' B' : (stats.size / 1024).toFixed(1) + ' KB';

        statsEl.textContent = totalPages + ' pages · ' + sizeStr;

        if (totalPages === 0) {
            emptyEl.querySelector('p').textContent = t('knowledge_empty_hint');
            const guideEl = document.getElementById('knowledge-empty-guide');
            if (guideEl) guideEl.classList.remove('hidden');
            emptyEl.classList.remove('hidden');
            docsPanel.classList.add('hidden');
            return;
        }
        emptyEl.classList.add('hidden');
        docsPanel.classList.remove('hidden');

        renderKnowledgeTree(tree, rootFiles);

        // Auto-select the first file (desktop only)
        if (window.innerWidth >= 768) {
            const firstFile = rootFiles.length > 0 ? rootFiles[0] : null;
            const firstGroup = !firstFile ? tree.find(g => g.files && g.files.length > 0) : null;
            if (firstFile) {
                openKnowledgeFile(firstFile.name, firstFile.title);
            } else if (firstGroup) {
                const gf = firstGroup.files[0];
                openKnowledgeFile(firstGroup.dir + '/' + gf.name, gf.title);
            }
        } else {
            document.getElementById('knowledge-content-placeholder').classList.add('hidden');
            document.getElementById('knowledge-content-viewer').classList.add('hidden');
        }
    }).catch(() => {});
}

function renderKnowledgeTree(tree, rootFilesOrFilter, filter) {
    const container = document.getElementById('knowledge-tree');
    container.innerHTML = '';
    let rootFiles, lowerFilter;
    if (typeof rootFilesOrFilter === 'string') {
        rootFiles = _knowledgeRootFiles;
        lowerFilter = (rootFilesOrFilter || '').toLowerCase();
    } else {
        rootFiles = rootFilesOrFilter || _knowledgeRootFiles;
        lowerFilter = (filter || '').toLowerCase();
    }
    (rootFiles || []).forEach(f => {
        if (lowerFilter && !f.title.toLowerCase().includes(lowerFilter) && !f.name.toLowerCase().includes(lowerFilter)) return;
        const fbtn = document.createElement('button');
        fbtn.className = 'knowledge-tree-file' + (_knowledgeCurrentFile === f.name ? ' active' : '');
        fbtn.dataset.path = f.name;
        fbtn.innerHTML = `<i class="fas fa-file-lines text-[10px] text-slate-400"></i><span class="truncate">${escapeHtml(f.title)}</span>`;
        fbtn.onclick = () => openKnowledgeFile(f.name, f.title);
        container.appendChild(fbtn);
    });
    _renderKnowledgeGroups(container, tree, '', lowerFilter, 0);
}

function _renderKnowledgeGroups(container, groups, parentPath, lowerFilter, depth) {
    const indent = depth * 12;
    groups.forEach(group => {
        const groupPath = parentPath ? parentPath + '/' + group.dir : group.dir;
        const files = (group.files || []).filter(f =>
            !lowerFilter || f.title.toLowerCase().includes(lowerFilter) || f.name.toLowerCase().includes(lowerFilter)
        );
        const children = group.children || [];
        const hasMatchingChildren = lowerFilter ? _hasFilterMatch(children, lowerFilter) : children.length > 0;
        if (files.length === 0 && !hasMatchingChildren && lowerFilter) return;

        const div = document.createElement('div');
        div.className = 'knowledge-tree-group open';

        const fileCount = _countFiles(group);
        const btn = document.createElement('button');
        btn.className = 'knowledge-tree-group-btn';
        btn.style.paddingLeft = (8 + indent) + 'px';
        btn.innerHTML = `<i class="fas fa-chevron-right chevron"></i><i class="fas fa-folder text-amber-400 text-[11px]"></i><span>${escapeHtml(group.dir)}</span><span class="ml-auto text-[10px] text-slate-400">${fileCount}</span>`;
        btn.onclick = () => div.classList.toggle('open');
        div.appendChild(btn);

        const items = document.createElement('div');
        items.className = 'knowledge-tree-group-items';
        files.forEach(f => {
            const fbtn = document.createElement('button');
            const fpath = groupPath + '/' + f.name;
            fbtn.className = 'knowledge-tree-file' + (_knowledgeCurrentFile === fpath ? ' active' : '');
            fbtn.dataset.path = fpath;
            fbtn.style.paddingLeft = (24 + indent) + 'px';
            fbtn.innerHTML = `<i class="fas fa-file-lines text-[10px] text-slate-400"></i><span class="truncate">${escapeHtml(f.title)}</span>`;
            fbtn.onclick = () => openKnowledgeFile(fpath, f.title);
            items.appendChild(fbtn);
        });
        if (children.length > 0) {
            _renderKnowledgeGroups(items, children, groupPath, lowerFilter, depth + 1);
        }
        div.appendChild(items);
        container.appendChild(div);
    });
}

function _hasFilterMatch(groups, lowerFilter) {
    for (const g of groups) {
        for (const f of (g.files || [])) {
            if (f.title.toLowerCase().includes(lowerFilter) || f.name.toLowerCase().includes(lowerFilter)) return true;
        }
        if (_hasFilterMatch(g.children || [], lowerFilter)) return true;
    }
    return false;
}

function _countFiles(group) {
    let count = (group.files || []).length;
    for (const child of (group.children || [])) {
        count += _countFiles(child);
    }
    return count;
}

function filterKnowledgeTree(query) {
    renderKnowledgeTree(_knowledgeTreeData, _knowledgeRootFiles, query);
}

function resolveKnowledgePath(currentFilePath, relativeHref) {
    // currentFilePath: e.g. "concepts/mcp-protocol.md"
    // relativeHref: e.g. "../entities/openai.md"
    const parts = currentFilePath.split('/');
    parts.pop(); // remove filename, keep directory
    const segments = [...parts, ...relativeHref.split('/')];
    const resolved = [];
    for (const seg of segments) {
        if (seg === '..') resolved.pop();
        else if (seg !== '.' && seg !== '') resolved.push(seg);
    }
    return resolved.join('/');
}

function bindKnowledgeLinks(container, currentFilePath) {
    container.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || !href.endsWith('.md')) return;
        // Skip absolute URLs
        if (/^https?:\/\//.test(href)) return;

        a.addEventListener('click', (e) => {
            e.preventDefault();
            const resolved = resolveKnowledgePath(currentFilePath, href);
            const linkTitle = a.textContent.trim() || resolved.replace(/\.md$/, '').split('/').pop();
            openKnowledgeFile(resolved, linkTitle);
        });
        a.style.cursor = 'pointer';
        a.classList.add('text-primary-500', 'hover:underline');
    });
}

function bindChatKnowledgeLinks(container) {
    if (!container) return;
    container.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || !href.endsWith('.md')) return;
        if (/^https?:\/\//.test(href)) return;

        // Determine knowledge path
        let knowledgePath = null;
        if (href.startsWith('knowledge/')) {
            // Full path from workspace root: knowledge/concepts/moe.md
            knowledgePath = href.replace(/^knowledge\//, '');
        } else if (/^[a-z0-9_-]+\/[a-z0-9_.-]+\.md$/i.test(href)) {
            // Looks like category/file.md pattern without knowledge/ prefix
            knowledgePath = href;
        } else if (href.includes('/') && !href.startsWith('/')) {
            // Relative path like ../entities/deepseek.md — extract filename and search
            const filename = href.split('/').pop();
            knowledgePath = '__search__:' + filename;
        }
        if (!knowledgePath) return;

        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (knowledgePath.startsWith('__search__:')) {
                const filename = knowledgePath.replace('__search__:', '');
                // Find the file in cached tree data
                const found = _findKnowledgeFileByName(filename);
                if (found) {
                    navigateTo('knowledge');
                    setTimeout(() => openKnowledgeFile(found.path, found.title), 100);
                }
            } else {
                navigateTo('knowledge');
                const linkTitle = a.textContent.trim() || knowledgePath.replace(/\.md$/, '').split('/').pop();
                setTimeout(() => openKnowledgeFile(knowledgePath, linkTitle), 100);
            }
        });
        a.style.cursor = 'pointer';
        a.classList.add('text-primary-500', 'hover:underline');
    });
}

function _findKnowledgeFileByName(filename) {
    for (const f of _knowledgeRootFiles) {
        if (f.name === filename) return { path: f.name, title: f.title };
    }
    return _searchFileInGroups(_knowledgeTreeData, '', filename);
}

function _searchFileInGroups(groups, parentPath, filename) {
    for (const group of groups) {
        const groupPath = parentPath ? parentPath + '/' + group.dir : group.dir;
        for (const f of (group.files || [])) {
            if (f.name === filename) {
                return { path: groupPath + '/' + f.name, title: f.title };
            }
        }
        const found = _searchFileInGroups(group.children || [], groupPath, filename);
        if (found) return found;
    }
    return null;
}

function openKnowledgeFile(path, title) {
    _knowledgeCurrentFile = path;
    // Update active state in tree via data-path
    document.querySelectorAll('.knowledge-tree-file').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
    });

    // Immediately hide placeholder
    document.getElementById('knowledge-content-placeholder').classList.add('hidden');

    fetch(`/api/knowledge/read?path=${encodeURIComponent(path)}`).then(r => r.json()).then(data => {
        if (data.status !== 'success') return;
        const viewer = document.getElementById('knowledge-content-viewer');
        document.getElementById('knowledge-viewer-title').textContent = title;
        document.getElementById('knowledge-viewer-path').textContent = path;
        const bodyEl = document.getElementById('knowledge-viewer-body');
        bodyEl.innerHTML = renderMarkdown(data.content || '');
        viewer.classList.remove('hidden');
        applyHighlighting(viewer);
        bindKnowledgeLinks(bodyEl, path);

        // Mobile: hide sidebar, show content
        if (window.innerWidth < 768) {
            document.getElementById('knowledge-sidebar').classList.add('hidden');
        }
    }).catch(() => {});
}

function knowledgeMobileBack() {
    document.getElementById('knowledge-sidebar').classList.remove('hidden');
    document.getElementById('knowledge-content-viewer').classList.add('hidden');
}

function switchKnowledgeTab(tab) {
    document.querySelectorAll('.knowledge-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('knowledge-tab-' + tab).classList.add('active');

    const docsPanel = document.getElementById('knowledge-panel-docs');
    const graphPanel = document.getElementById('knowledge-panel-graph');

    if (tab === 'docs') {
        docsPanel.classList.remove('hidden');
        graphPanel.classList.add('hidden');
    } else {
        docsPanel.classList.add('hidden');
        graphPanel.classList.remove('hidden');
        if (!_knowledgeGraphLoaded) {
            loadKnowledgeGraph();
        }
    }
}

let _d3LoadPromise = null;

function ensureD3Loaded() {
    if (window.d3) return Promise.resolve(window.d3);
    if (_d3LoadPromise) return _d3LoadPromise;
    _d3LoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'assets/vendor/d3/d3.min.js';
        script.async = true;
        script.onload = () => resolve(window.d3);
        script.onerror = () => reject(new Error('Failed to load d3'));
        document.head.appendChild(script);
    });
    return _d3LoadPromise;
}

function loadKnowledgeGraph() {
    _knowledgeGraphLoaded = true;
    const container = document.getElementById('knowledge-graph-container');
    container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Loading graph...</div>';

    Promise.all([
        ensureD3Loaded(),
        fetch('/api/knowledge/graph').then(r => r.json()),
    ]).then(([, data]) => {
        const nodes = data.nodes || [];
        const links = data.links || [];
        if (nodes.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400"><i class="fas fa-diagram-project text-3xl mb-3 opacity-40"></i><p class="text-sm">${t('knowledge_empty_hint')}</p></div>`;
            return;
        }
        container.innerHTML = '';
        renderKnowledgeGraph(container, nodes, links);
    }).catch(() => {
        container.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 text-sm">Failed to load graph</div>';
    });
}

function renderKnowledgeGraph(container, nodes, links) {
    const width = container.clientWidth;
    const height = container.clientHeight || 600;

    const categories = [...new Set(nodes.map(n => n.category))];
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(categories);

    // Connection count for sizing
    const connCount = {};
    nodes.forEach(n => connCount[n.id] = 0);
    links.forEach(l => {
        connCount[l.source] = (connCount[l.source] || 0) + 1;
        connCount[l.target] = (connCount[l.target] || 0) + 1;
    });

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g');

    // Zoom with adaptive label visibility
    let currentZoomScale = 1;
    const zoom = d3.zoom()
        .scaleExtent([0.2, 5])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
            currentZoomScale = event.transform.k;
            updateLabelVisibility();
        });
    svg.call(zoom);

    function updateLabelVisibility() {
        if (!label) return;
        if (currentZoomScale < 0.8) {
            label.attr('opacity', 0);
        } else {
            const baseFontSize = Math.min(12, 10 / Math.max(currentZoomScale * 0.7, 0.5));
            label.attr('opacity', 1).attr('font-size', baseFontSize);
        }
    }

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(90))
        .force('charge', d3.forceManyBody().strength(-180))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX(width / 2).strength(0.06))
        .force('y', d3.forceY(height / 2).strength(0.06))
        .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 30));

    function getNodeRadius(d) {
        return Math.max(5, Math.min(16, 5 + (connCount[d.id] || 0) * 2));
    }

    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#94a3b8')
        .attr('stroke-opacity', 0.3)
        .attr('stroke-width', 1);

    const node = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', d => getNodeRadius(d))
        .attr('fill', d => colorScale(d.category))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .call(d3.drag()
            .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
        );

    const label = g.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .text(d => d.label.length > 15 ? d.label.slice(0, 14) + '…' : d.label)
        .attr('font-size', 9)
        .attr('dx', d => getNodeRadius(d) + 4)
        .attr('dy', 3)
        .attr('fill', '#64748b')
        .style('pointer-events', 'none');

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'knowledge-graph-tooltip';
    container.style.position = 'relative';
    container.appendChild(tooltip);

    node.on('mouseover', (event, d) => {
        tooltip.textContent = d.label + ' (' + d.category + ')';
        tooltip.style.opacity = '1';
        tooltip.style.left = (event.offsetX + 12) + 'px';
        tooltip.style.top = (event.offsetY - 8) + 'px';
        // Highlight connections
        link.attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1);
        node.attr('opacity', n => n.id === d.id || links.some(l => (l.source.id === d.id && l.target.id === n.id) || (l.target.id === d.id && l.source.id === n.id)) ? 1 : 0.2);
        label.attr('opacity', n => n.id === d.id || links.some(l => (l.source.id === d.id && l.target.id === n.id) || (l.target.id === d.id && l.source.id === n.id)) ? 1 : 0.1);
    }).on('mousemove', (event) => {
        tooltip.style.left = (event.offsetX + 12) + 'px';
        tooltip.style.top = (event.offsetY - 8) + 'px';
    }).on('mouseout', () => {
        tooltip.style.opacity = '0';
        link.attr('stroke-opacity', 0.3);
        node.attr('opacity', 1);
        label.attr('opacity', 1);
    }).on('click', (event, d) => {
        // Switch to docs tab and open the file
        switchKnowledgeTab('docs');
        openKnowledgeFile(d.id, d.label);
    });

    simulation.on('tick', () => {
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('cx', d => d.x).attr('cy', d => d.y);
        label.attr('x', d => d.x).attr('y', d => d.y);
    });

    // Auto fit-to-view when simulation settles
    simulation.on('end', () => {
        const pad = 16;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        nodes.forEach(n => {
            if (n.x < x0) x0 = n.x;
            if (n.y < y0) y0 = n.y;
            if (n.x > x1) x1 = n.x;
            if (n.y > y1) y1 = n.y;
        });
        const bw = x1 - x0 + pad * 2;
        const bh = y1 - y0 + pad * 2;
        if (bw > 0 && bh > 0) {
            const scale = Math.min(width / bw, height / bh, 4);
            const tx = width / 2 - (x0 + x1) / 2 * scale;
            const ty = height / 2 - (y0 + y1) / 2 * scale;
            svg.transition().duration(500).call(
                zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale)
            );
        }
    });

    // Legend
    const legendDiv = document.createElement('div');
    legendDiv.className = 'knowledge-graph-legend';
    categories.forEach(cat => {
        const item = document.createElement('span');
        item.className = 'knowledge-graph-legend-item';
        item.innerHTML = `<span class="knowledge-graph-legend-dot" style="background:${colorScale(cat)}"></span>${escapeHtml(cat)}`;
        legendDiv.appendChild(item);
    });
    container.appendChild(legendDiv);
}

// =====================================================================
// Authentication
// =====================================================================
function toggleLoginPassword() {
    const input = document.getElementById('login-password');
    const icon = document.querySelector('#login-toggle-pwd i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
window.toggleLoginPassword = toggleLoginPassword;

function showLoginScreen() {
    const overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');

    const subtitle = document.getElementById('login-subtitle');
    const loginBtn = document.getElementById('login-btn');
    if (currentLang === 'en') {
        subtitle.textContent = 'Enter password to access the console';
        loginBtn.textContent = 'Login';
    } else {
        subtitle.textContent = 'Enter password to access the console';
        loginBtn.textContent = 'Log In';
    }

    const form = document.getElementById('login-form');
    const pwdInput = document.getElementById('login-password');
    pwdInput.focus();

    form.onsubmit = function(e) {
        e.preventDefault();
        const pwd = pwdInput.value;
        if (!pwd) return;
        const btn = document.getElementById('login-btn');
        const errEl = document.getElementById('login-error');
        btn.disabled = true;
        errEl.classList.add('hidden');

        fetch('/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({password: pwd})
        }).then(r => r.json()).then(data => {
            if (data.status === 'success') {
                overlay.classList.add('hidden');
                document.getElementById('app').classList.remove('hidden');
                initApp();
            } else {
                errEl.textContent = 'Wrong password';
                errEl.classList.remove('hidden');
                pwdInput.value = '';
                pwdInput.focus();
            }
            btn.disabled = false;
        }).catch(() => {
            errEl.textContent = 'Network error, please retry';
            errEl.classList.remove('hidden');
            btn.disabled = false;
        });
        return false;
    };
}

// Intercept 401 responses globally to show login screen on session expiry
const _originalFetch = window.fetch;
window.fetch = function(...args) {
    return _originalFetch.apply(this, args).then(response => {
        if (response.status === 401) {
            const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
            if (!url.startsWith('/auth/')) {
                showLoginScreen();
            }
        }
        return response;
    });
};

function initApp() {
    applyI18n();
    _applyInputTooltips();
    _restoreSessionPanel();

    fetch('/api/knowledge/list').then(r => r.json()).then(data => {
        if (data.status === 'success') {
            _knowledgeTreeData = data.tree || [];
            _knowledgeRootFiles = data.root_files || [];
        }
    }).catch(() => {});

    fetch('/api/version').then(r => r.json()).then(data => {
        APP_VERSION = `v${data.version}`;
        document.getElementById('sidebar-version').textContent = `OnyxAgent ${APP_VERSION}`;
    }).catch(() => {
        document.getElementById('sidebar-version').textContent = 'OnyxAgent';
    });
    chatInput.focus();
}

// =====================================================================
// File Browser
// =====================================================================
let filesCurrentPath = '.';
let filesSelectedPath = null;
let filesSelectedIsDir = false;
let _editingFilePath = null;

function filesNavigateTo(path) {
    filesCurrentPath = path;
    filesLoadDirectory();
}

function filesLoadDirectory() {
    const container = document.getElementById('files-content');
    container.innerHTML = '<div class="flex items-center justify-center py-12 text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading...</div>';

    fetch('/api/files/list?path=' + encodeURIComponent(filesCurrentPath) + '&depth=1')
        .then(r => r.json())
        .then(data => {
            if (data.status === 'error') {
                container.innerHTML = '<div class="text-red-500 text-center py-8">' + escapeHtml(data.message) + '</div>';
                return;
            }
            filesRenderBreadcrumb(data.root);
            filesRenderEntries(data.entries);
        })
        .catch(err => {
            container.innerHTML = '<div class="text-red-500 text-center py-8">Failed to load files</div>';
        });
}

function filesRenderBreadcrumb(currentPath) {
    const bc = document.getElementById('files-breadcrumb');
    const parts = currentPath === '.' ? [] : currentPath.split('/');
    let html = '<span class="cursor-pointer text-primary-500 hover:text-primary-600 font-medium" onclick="filesNavigateTo(\'.\')">~</span>';
    let accumulated = '';
    parts.forEach((part, i) => {
        accumulated += (i === 0 ? '' : '/') + part;
        const path = accumulated;
        html += '<i class="fas fa-chevron-right text-[10px] text-slate-300 dark:text-slate-600 mx-1"></i>';
        if (i === parts.length - 1) {
            html += '<span class="text-slate-700 dark:text-slate-200 font-medium">' + escapeHtml(part) + '</span>';
        } else {
            html += '<span class="cursor-pointer text-primary-500 hover:text-primary-600" onclick="filesNavigateTo(\'' + escapeHtml(path) + '\')">' + escapeHtml(part) + '</span>';
        }
    });
    bc.innerHTML = html;
}

function filesRenderEntries(entries) {
    const container = document.getElementById('files-content');
    if (!entries || entries.length === 0) {
        container.innerHTML = '<div class="text-center py-12 text-slate-400 dark:text-slate-500"><i class="fas fa-folder-open text-3xl mb-3 block"></i><p>This folder is empty</p></div>';
        return;
    }

    // Sort: directories first, then files
    const dirs = entries.filter(e => e.is_dir).sort((a,b) => a.name.localeCompare(b.name));
    const files = entries.filter(e => !e.is_dir).sort((a,b) => a.name.localeCompare(b.name));
    const sorted = [...dirs, ...files];

    let html = '';
    // Header row
    html += '<div class="hidden sm:grid grid-cols-[1fr_100px_160px] gap-2 px-3 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">';
    html += '<span>Name</span><span>Size</span><span>Modified</span></div>';

    sorted.forEach(entry => {
        const icon = entry.is_dir ? 'fa-folder text-amber-400' : getFileIcon(entry.name);
        const size = entry.is_dir ? '--' : formatFileSize(entry.size);
        const modified = entry.modified ? new Date(entry.modified).toLocaleDateString() : '--';

        html += '<div class="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors duration-150" ';
        html += 'data-path="' + escapeHtml(entry.path) + '" data-is-dir="' + entry.is_dir + '" ';
        html += 'onclick="filesEntryClick(this)" oncontextmenu="filesContextMenu(event, this)">';
        html += '<i class="fas ' + icon + ' text-base w-5 text-center flex-shrink-0"></i>';
        html += '<div class="flex-1 min-w-0">';
        html += '<span class="text-sm text-slate-700 dark:text-slate-200 truncate block">' + escapeHtml(entry.name) + '</span>';
        html += '</div>';
        html += '<span class="hidden sm:block text-xs text-slate-400 dark:text-slate-500 w-[100px] text-right">' + size + '</span>';
        html += '<span class="hidden sm:block text-xs text-slate-400 dark:text-slate-500 w-[160px] text-right">' + modified + '</span>';
        html += '<button class="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-150" onclick="event.stopPropagation(); filesContextMenu(event, this.closest(\'[data-path]\'))">';
        html += '<i class="fas fa-ellipsis-vertical text-xs"></i></button>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function filesEntryClick(el) {
    const path = el.dataset.path;
    const isDir = el.dataset.isDir === 'true';
    if (isDir) {
        filesNavigateTo(path);
    } else {
        fileAction('edit');
    }
}

function filesContextMenu(event, el) {
    event.preventDefault();
    event.stopPropagation();
    filesSelectedPath = el.dataset.path;
    filesSelectedIsDir = el.dataset.isDir === 'true';

    const menu = document.getElementById('file-context-menu');
    // Hide edit for directories
    const editBtn = menu.querySelector('[onclick*="edit"]');
    if (editBtn) editBtn.style.display = filesSelectedIsDir ? 'none' : '';

    menu.style.left = Math.min(event.clientX, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(event.clientY, window.innerHeight - 200) + 'px';
    menu.classList.remove('hidden');
}

function fileAction(action) {
    hideFileContextMenu();
    if (!filesSelectedPath) return;

    switch(action) {
        case 'download':
            window.open('/api/files/download?path=' + encodeURIComponent(filesSelectedPath), '_blank');
            break;
        case 'edit':
            openFileEditor(filesSelectedPath);
            break;
        case 'rename':
            showRenameDialog(filesSelectedPath);
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete "' + filesSelectedPath.split('/').pop() + '"?')) {
                deleteFile(filesSelectedPath);
            }
            break;
    }
}

function hideFileContextMenu() {
    document.getElementById('file-context-menu').classList.add('hidden');
}

function openFileEditor(path) {
    _editingFilePath = path;
    fetch('/api/files/read?path=' + encodeURIComponent(path))
        .then(r => r.json())
        .then(data => {
            if (data.status === 'error') {
                alert(data.message);
                return;
            }
            document.getElementById('file-editor-title').textContent = path.split('/').pop();
            document.getElementById('file-editor-content').value = data.content || '';
            document.getElementById('file-editor-modal').classList.remove('hidden');
        })
        .catch(err => alert('Failed to read file'));
}

function saveFileContent() {
    if (!_editingFilePath) return;
    const content = document.getElementById('file-editor-content').value;
    fetch('/api/files/write', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({path: _editingFilePath, content: content})
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            closeFileEditor();
            filesLoadDirectory();
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Failed to save file'));
}

function closeFileEditor() {
    document.getElementById('file-editor-modal').classList.add('hidden');
    _editingFilePath = null;
}

function showRenameDialog(path) {
    filesSelectedPath = path;
    const input = document.getElementById('file-rename-input');
    input.value = path.split('/').pop();
    document.getElementById('file-rename-dialog').classList.remove('hidden');
    setTimeout(() => { input.focus(); input.select(); }, 100);
}

function closeRenameDialog() {
    document.getElementById('file-rename-dialog').classList.add('hidden');
}

function confirmRename() {
    const newName = document.getElementById('file-rename-input').value.trim();
    if (!newName) return;
    fetch('/api/files/rename', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({old_path: filesSelectedPath, new_name: newName})
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            closeRenameDialog();
            filesLoadDirectory();
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Failed to rename'));
}

function deleteFile(path) {
    fetch('/api/files/delete', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({path: path})
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            filesLoadDirectory();
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Failed to delete'));
}

function showMkdirDialog() {
    document.getElementById('file-mkdir-input').value = '';
    document.getElementById('file-mkdir-dialog').classList.remove('hidden');
    setTimeout(() => document.getElementById('file-mkdir-input').focus(), 100);
}

function closeMkdirDialog() {
    document.getElementById('file-mkdir-dialog').classList.add('hidden');
}

function confirmMkdir() {
    const name = document.getElementById('file-mkdir-input').value.trim();
    if (!name) return;
    const path = filesCurrentPath === '.' ? name : filesCurrentPath + '/' + name;
    fetch('/api/files/mkdir', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({path: path})
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            closeMkdirDialog();
            filesLoadDirectory();
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Failed to create folder'));
}

function showNewFileDialog() {
    document.getElementById('file-newfile-input').value = '';
    document.getElementById('file-newfile-dialog').classList.remove('hidden');
    setTimeout(() => document.getElementById('file-newfile-input').focus(), 100);
}

function closeNewFileDialog() {
    document.getElementById('file-newfile-dialog').classList.add('hidden');
}

function confirmNewFile() {
    const name = document.getElementById('file-newfile-input').value.trim();
    if (!name) return;
    const path = filesCurrentPath === '.' ? name : filesCurrentPath + '/' + name;
    fetch('/api/files/write', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({path: path, content: ''})
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            closeNewFileDialog();
            filesLoadDirectory();
            // Auto-open editor for new files
            filesSelectedPath = path;
            openFileEditor(path);
        } else {
            alert(data.message);
        }
    })
    .catch(err => alert('Failed to create file'));
}

function showFileUploadDialog() {
    document.getElementById('files-upload-input').click();
}

function handleFileUpload(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const path = filesCurrentPath === '.' ? file.name : filesCurrentPath + '/' + file.name;
            fetch('/api/files/write', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({path: path, content: e.target.result})
            })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'success') {
                    filesLoadDirectory();
                } else {
                    console.error('Upload failed:', data.message);
                }
            })
            .catch(err => console.error('Upload error:', err));
        };
        reader.readAsText(file);
    });
    input.value = '';
}

function getFileIcon(name) {
    const ext = (name.split('.').pop() || '').toLowerCase();
    const iconMap = {
        'py': 'fa-file-code text-blue-400',
        'js': 'fa-file-code text-yellow-400',
        'ts': 'fa-file-code text-blue-400',
        'jsx': 'fa-file-code text-yellow-400',
        'tsx': 'fa-file-code text-blue-400',
        'html': 'fa-file-code text-orange-400',
        'css': 'fa-file-code text-purple-400',
        'json': 'fa-file-code text-yellow-300',
        'md': 'fa-file-alt text-slate-400',
        'txt': 'fa-file-alt text-slate-400',
        'csv': 'fa-file-csv text-green-400',
        'pdf': 'fa-file-pdf text-red-400',
        'jpg': 'fa-file-image text-emerald-400',
        'jpeg': 'fa-file-image text-emerald-400',
        'png': 'fa-file-image text-emerald-400',
        'gif': 'fa-file-image text-emerald-400',
        'svg': 'fa-file-image text-emerald-400',
        'zip': 'fa-file-archive text-amber-400',
        'tar': 'fa-file-archive text-amber-400',
        'gz': 'fa-file-archive text-amber-400',
        'yml': 'fa-file-code text-pink-400',
        'yaml': 'fa-file-code text-pink-400',
        'toml': 'fa-file-code text-pink-400',
        'sh': 'fa-file-code text-green-400',
        'bash': 'fa-file-code text-green-400',
        'env': 'fa-file-code text-slate-400',
        'sql': 'fa-database text-blue-300',
    };
    return iconMap[ext] || 'fa-file text-slate-400';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

// Close context menu on click outside
document.addEventListener('click', function(e) {
    const menu = document.getElementById('file-context-menu');
    if (menu && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// =====================================================================
// Initialization
// =====================================================================
applyTheme();
applyI18n();

fetch('/auth/check').then(r => r.json()).then(data => {
    if (data.auth_required && !data.authenticated) {
        showLoginScreen();
    } else {
        initApp();
    }
}).catch(() => {
    initApp();
});

// =====================================================================
// Artifact Preview System - HTML/SVG/Chart Live Preview
// =====================================================================
let _currentArtifactCode = '';
let _currentArtifactType = '';

// Detect if a code block is previewable (HTML, SVG, Mermaid, Chart.js, D3, etc.)
function _detectArtifactType(lang, code) {
    if (!code) return null;
    const trimmed = code.trim();
    const langLower = (lang || '').toLowerCase();

    // HTML
    if (langLower === 'html' || trimmed.match(/^<!DOCTYPE\s+html/i) || trimmed.match(/^<html/i) ||
        (trimmed.includes('<html') && trimmed.includes('</html>'))) {
        return 'html';
    }
    // SVG
    if (langLower === 'svg' || trimmed.match(/^<svg[\s>]/i)) {
        return 'svg';
    }
    // Mermaid
    if (langLower === 'mermaid' || trimmed.match(/^(graph|sequenceDiagram|classDiagram|gantt|pie|flowchart|stateDiagram|erDiagram|journey|gitGraph|mindmap|timeline|quadrantChart|sankey|xychart|block)\b/i)) {
        return 'mermaid';
    }
    // Chart.js / canvas visualization
    if (langLower === 'javascript' || langLower === 'js') {
        if (trimmed.includes('new Chart') || trimmed.includes('Chart(') ||
            trimmed.includes('chartjs') || trimmed.includes('chart.js') ||
            trimmed.includes('d3.select') || trimmed.includes('d3.') ||
            trimmed.includes('echarts.init') || trimmed.includes('ECharts') ||
            trimmed.includes('Plotly.newPlot') || trimmed.includes('plotly')) {
            return 'chart';
        }
    }
    // Python visualization that outputs HTML (plotly, bokeh, altair)
    if (langLower === 'python') {
        if (trimmed.includes('plotly') || trimmed.includes('altair') ||
            trimmed.includes('bokeh') || trimmed.includes('pyecharts') ||
            trimmed.includes('matplotlib') && trimmed.includes('to_html')) {
            return 'pychart';
        }
    }
    return null;
}

// Wrap code into a full HTML document for iframe rendering
function _wrapArtifactHtml(code, type) {
    if (type === 'html') {
        // Already HTML - inject base target and sandbox escape prevention
        if (!code.includes('<base')) {
            code = code.replace(/<head([^>]*)>/i, '<head$1><base target="_blank">');
        }
        return code;
    }
    if (type === 'svg') {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}</style></head><body>${code}</body></html>`;
    }
    if (type === 'mermaid') {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;font-family:sans-serif}</style><script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script></head><body><div class="mermaid">${escapeHtml(code)}</div><script>mermaid.initialize({startOnLoad:true,theme:'default'});<\/script></body></html>`;
    }
    if (type === 'chart') {
        // JS code that creates charts - wrap in HTML with chart libraries
        const hasD3 = code.includes('d3');
        const hasECharts = code.includes('echarts');
        const hasPlotly = code.includes('Plotly');
        const hasChartJs = code.includes('Chart') || code.includes('chart');
        let libs = '';
        if (hasChartJs) libs += '<script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script>';
        if (hasD3) libs += '<script src="https://cdn.jsdelivr.net/npm/d3@7"><\/script>';
        if (hasECharts) libs += '<script src="https://cdn.jsdelivr.net/npm/echarts@5"><\/script>';
        if (hasPlotly) libs += '<script src="https://cdn.jsdelivr.net/npm/plotly.js-dist@2"><\/script>';
        // If no specific lib detected but it's JS chart code, include Chart.js
        if (!libs) libs = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script>';

        return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#fff;font-family:sans-serif}canvas,svg{max-width:100%}</style>${libs}</head><body><canvas id="chart"></canvas><div id="d3-container"></div><div id="echarts-container" style="width:100%;height:400px"></div><div id="plotly-container"></div><script>${code}<\/script></body></html>`;
    }
    return code;
}

// Add preview buttons to qualifying code blocks AND auto-open the first artifact
let _autoOpenPending = false; // Set to true after streaming ends to trigger auto-open

function _addArtifactButtons(container) {
    const root = container || document;
    let firstArtifact = null; // Track the first artifact for auto-open
    root.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
        if (wrapper.querySelector('.artifact-preview-btn')) return; // Already has button
        const codeEl = wrapper.querySelector('pre code');
        if (!codeEl) return;

        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : '';
        const code = codeEl.textContent || '';
        const artType = _detectArtifactType(lang, code);
        if (!artType) return;

        // Track first artifact for auto-open
        if (!firstArtifact) {
            firstArtifact = { code, type: artType };
        }

        const header = wrapper.querySelector('.code-block-header');
        if (!header) return;

        const btn = document.createElement('button');
        btn.className = 'artifact-preview-btn inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors cursor-pointer ml-2';
        const typeLabels = { html: 'HTML', svg: 'SVG', mermaid: 'Mermaid', chart: 'Chart', pychart: 'Chart' };
        const iconMap = { html: 'fa-eye', svg: 'fa-chart-area', mermaid: 'fa-diagram-project', chart: 'fa-chart-bar', pychart: 'fa-chart-bar' };
        btn.innerHTML = `<i class="fas ${iconMap[artType] || 'fa-eye'} text-[8px]"></i> ${t('artifact_preview_btn')}`;
        btn.dataset.artifactType = artType;
        btn.dataset.artifactCode = code;
        header.appendChild(btn);
    });

    // Auto-open first artifact after streaming completes (no tap needed!)
    if (_autoOpenPending && firstArtifact) {
        _autoOpenPending = false;
        setTimeout(() => {
            openArtifactPreview(firstArtifact.code, firstArtifact.type);
        }, 400);
    }
}

// Open the artifact preview overlay
function openArtifactPreview(code, type) {
    _currentArtifactCode = code;
    _currentArtifactType = type;

    const overlay = document.getElementById('artifact-overlay');
    const iframe = document.getElementById('artifact-iframe');
    const titleEl = document.getElementById('artifact-title');
    const badgeEl = document.getElementById('artifact-lang-badge');

    const typeLabels = {
        html: t('artifact_html'),
        svg: t('artifact_svg'),
        mermaid: t('artifact_mermaid'),
        chart: t('artifact_chart'),
        pychart: t('artifact_chart'),
    };
    titleEl.textContent = t('artifact_preview');
    badgeEl.textContent = typeLabels[type] || type.toUpperCase();

    const fullHtml = _wrapArtifactHtml(code, type);
    overlay.classList.remove('hidden');

    // Write to iframe using srcdoc
    iframe.srcdoc = fullHtml;

    // Animate card entrance
    const card = document.getElementById('artifact-card');
    card.style.transform = 'translate(-50%, -50%) scale(0.9) rotateX(5deg)';
    card.style.opacity = '0';
    requestAnimationFrame(() => {
        card.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
        card.style.transform = 'translate(-50%, -50%) scale(1) rotateX(0deg)';
        card.style.opacity = '1';
    });

    // Setup pull-to-dismiss
    _setupPullToDismiss();
}

// Dismiss overlay
function dismissArtifactOverlay() {
    const overlay = document.getElementById('artifact-overlay');
    const card = document.getElementById('artifact-card');
    const iframe = document.getElementById('artifact-iframe');

    card.style.transition = 'transform 0.25s ease, opacity 0.2s ease';
    card.style.transform = 'translate(-50%, -50%) scale(0.9) rotateX(5deg)';
    card.style.opacity = '0';

    setTimeout(() => {
        overlay.classList.add('hidden');
        iframe.srcdoc = '';
        card.style.transition = '';
        card.style.transform = 'translate(-50%, -50%) scale(1) rotateX(0deg)';
        card.style.opacity = '1';
        _currentArtifactCode = '';
        _currentArtifactType = '';
    }, 250);
}

// Pull-to-dismiss gesture on the pull bar
function _setupPullToDismiss() {
    const pullBar = document.getElementById('artifact-pull-bar');
    const card = document.getElementById('artifact-card');
    let startY = 0;
    let dragging = false;

    const onMove = (e) => {
        if (!dragging) return;
        const y = (e.touches ? e.touches[0].clientY : e.clientY);
        const dy = y - startY;
        if (dy > 0) {
            const progress = Math.min(dy / 200, 1);
            card.style.transition = 'none';
            card.style.transform = `translate(-50%, calc(-50% + ${dy}px)) scale(${1 - progress * 0.1}) rotateX(${progress * 5}deg)`;
            card.style.opacity = String(1 - progress * 0.5);
        }
    };
    const onEnd = (e) => {
        if (!dragging) return;
        dragging = false;
        const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
        const dy = y - startY;
        if (dy > 150) {
            dismissArtifactOverlay();
        } else {
            card.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';
            card.style.transform = 'translate(-50%, -50%) scale(1) rotateX(0deg)';
            card.style.opacity = '1';
        }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
    };
    const onStart = (e) => {
        dragging = true;
        startY = (e.touches ? e.touches[0].clientY : e.clientY);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('touchend', onEnd);
    };

    pullBar.onmousedown = onStart;
    pullBar.ontouchstart = onStart;
}

// Open artifact in new browser tab
function artifactOpenInNewTab() {
    if (!_currentArtifactCode) return;
    const fullHtml = _wrapArtifactHtml(_currentArtifactCode, _currentArtifactType);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Copy artifact code
function artifactCopyCode() {
    if (!_currentArtifactCode) return;
    navigator.clipboard.writeText(_currentArtifactCode).then(() => {
        const btn = document.querySelector('#artifact-card [onclick="artifactCopyCode()"] span');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = t('artifact_copied');
            setTimeout(() => { btn.textContent = orig; }, 1500);
        }
    });
}

// Click handler for artifact preview buttons (delegated)
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.artifact-preview-btn');
    if (btn) {
        const code = btn.dataset.artifactCode;
        const type = btn.dataset.artifactType;
        if (code && type) {
            openArtifactPreview(code, type);
        }
    }
});

// Hook into applyHighlighting to add artifact buttons after code blocks are processed
const _origApplyHighlighting = applyHighlighting;
applyHighlighting = function(container) {
    _origApplyHighlighting(container);
    setTimeout(() => {
        _addArtifactButtons(container);
        // _addCodeBlockHeaders already called by _origApplyHighlighting — skip duplicate
        _restoreCachedCards(container);
        _addCustomJsonCards(container);
    }, 30);
};

// =====================================================================
// Custom AI-Rendered Card System — Rich UI Components
// =====================================================================
// Detects JSON code blocks with a "component" field and renders them
// as beautiful interactive cards instead of raw code.

const ONYX_CARD_COLORS = ['blue','green','purple','orange','red','teal','pink','yellow','cyan','indigo','lime','amber','rose','emerald','violet','sky'];
const ONYX_CARD_ICONS = {
    code: '💻', laptop: '💻', robot: '🤖', brain: '🧠', rocket: '🚀',
    book: '📚', chart: '📊', target: '🎯', fire: '🔥', star: '⭐',
    lightbulb: '💡', money: '💰', video: '🎬', write: '✍️', design: '🎨',
    gear: '⚙️', search: '🔍', globe: '🌐', mail: '📧', heart: '❤️',
    music: '🎵', camera: '📷', data: '📈', calendar: '📅', clock: '⏰',
    check: '✅', lock: '🔒', shield: '🛡️', zap: '⚡', coffee: '☕',
    palette: '🎨', briefcase: '💼', graduation: '🎓', trophy: '🏆',
    pen: '🖊️', bulb: '💡', chat: '💬', phone: '📱', server: '🖥️',
    cloud: '☁️', doc: '📄', key: '🔑', link: '🔗', magic: '✨',
    warning: '⚠️', error: '❌', info: 'ℹ️', success: '✅', bug: '🐛',
    database: '🗄️', api: '🔌', terminal: '⬛', settings: '⚙️', user: '👤',
    users: '👥', file: '📁', folder: '📂', download: '📥', upload: '📤',
    home: '🏠', map: '🗺️', compass: '🧭', weather: '🌤️', sun: '☀️',
    moon: '🌙', snow: '❄️', rain: '🌧️', wind: '💨', tree: '🌳',
    car: '🚗', plane: '✈️', train: '🚂', bike: '🚲', boat: '⛵',
    gift: '🎁', tag: '🏷️', cart: '🛒', credit_card: '💳', store: '🏪',
    pencil: '✏️', scissors: '✂️', filter: '🔬', layers: '📑', crop: '✂️',
    flag: '🚩', bell: '🔔', thumbs_up: '👍', thumbs_down: '👎', share: '📤',
    eye: '👁️', eye_off: '🙈', unlock: '🔓', key_round: '🗝️', wifi: '📡',
    battery: '🔋', plug: '🔌', cpu: '🎛️', hard_drive: '💾', monitor: '🖥️',
    printer: '🖨️', speaker: '🔊', mic: '🎤', headphones: '🎧',
};

// Resolve an icon: emoji map → SVG registry → URL/HTML/emoji passthrough → styled initial fallback.
// NEVER returns the raw text name (so a missing icon doesn't leak "book"/"code"/etc. as text).
function _onyxResolveIcon(iconName) {
    if (!iconName || typeof iconName !== 'string') return '';
    const raw = iconName.trim();
    if (!raw) return '';

    // Already an HTML fragment (SVG / span / img) — pass through untouched.
    if (raw.startsWith('<')) return raw;

    // Already an image URL — render as a real <img> with graceful onerror fallback.
    if (/^(https?:\/\/|\/|data:image\/|blob:)/i.test(raw) ||
        /\.(?:png|jpe?g|gif|webp|bmp|svg|avif|ico)(\?.*)?$/i.test(raw)) {
        const safe = raw.replace(/"/g, '&quot;');
        return `<img src="${safe}" alt="" class="onyx-icon-img" ` +
               `onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'onyx-icon-letter',textContent:'?'}))">`;
    }

    // Check emoji map first (e.g. "book" → "📚").
    if (ONYX_CARD_ICONS[raw]) return ONYX_CARD_ICONS[raw];

    // Check SVG icons registry.
    if (window.ONYX_SVG_ICONS && window.ONYX_SVG_ICONS[raw]) {
        return `<span class="onyx-svg-icon">${window.ONYX_SVG_ICONS[raw]}</span>`;
    }

    // If the input is itself an emoji (broad Unicode coverage), pass through.
    // Covers Misc Symbols (☀⚡), Dingbats (✅), Transport (🚀), Pictographs (📚), etc.
    const emojiRe = /[\u{2190}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
    if (emojiRe.test(raw)) return raw;

    // Try kebab-case → underscore lookup (e.g. "brain-icon" → "brain").
    const underscoreKey = raw.replace(/-/g, '_');
    if (ONYX_CARD_ICONS[underscoreKey]) return ONYX_CARD_ICONS[underscoreKey];
    if (window.ONYX_SVG_ICONS && window.ONYX_SVG_ICONS[underscoreKey]) {
        return `<span class="onyx-svg-icon">${window.ONYX_SVG_ICONS[underscoreKey]}</span>`;
    }

    // Try lowercase lookup (case-insensitive fallback).
    const lowerKey = raw.toLowerCase();
    if (ONYX_CARD_ICONS[lowerKey]) return ONYX_CARD_ICONS[lowerKey];
    if (window.ONYX_SVG_ICONS && window.ONYX_SVG_ICONS[lowerKey]) {
        return `<span class="onyx-svg-icon">${window.ONYX_SVG_ICONS[lowerKey]}</span>`;
    }

    // Fallback: styled initial letter — uses Array.from to handle surrogate pairs correctly
    // (so "🚀" doesn't get split into a broken half-surrogate).
    const ch = Array.from(raw)[0] || '?';
    const initial = /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
    return `<span class="onyx-icon-letter">${_onyxEscHtml(initial)}</span>`;
}

function _onyxEscHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function _onyxColorClass(idx) {
    return ONYX_CARD_COLORS[idx % ONYX_CARD_COLORS.length];
}

function _onyxPriceClass(idx) {
    const classes = ['onyx-price-green','onyx-price-blue','onyx-price-purple','onyx-price-orange','onyx-price-teal','onyx-price-pink'];
    return classes[idx % classes.length];
}

function _onyxPhaseClass(idx) {
    const classes = ['onyx-phase-blue','onyx-phase-green','onyx-phase-yellow','onyx-phase-purple','onyx-phase-red','onyx-phase-teal'];
    return classes[idx % classes.length];
}

// ── Card cache: preserves rendered cards across innerHTML resets during streaming ──
// NOTE: We cache the cardData (not the DOM element) because cloneNode(true) does
// NOT copy event listeners — cloning a cached card would produce buttons that
// don't respond to taps/clicks. Rebuilding from cardData re-attaches listeners.
window._onyxCardCache = window._onyxCardCache || new Map();
// Limit cache to 50 entries to prevent memory leaks
function _cacheCard(key, cardData) {
    if (window._onyxCardCache.size > 50) {
        const firstKey = window._onyxCardCache.keys().next().value;
        window._onyxCardCache.delete(firstKey);
    }
    window._onyxCardCache.set(key, cardData);
}

// ── Fast brace-balance check: determines if JSON appears structurally complete ──
function _isJsonBalanced(str) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{' || ch === '[') depth++;
        if (ch === '}' || ch === ']') depth--;
        if (depth < 0) return false;
    }
    return depth === 0 && !inStr;
}

/**
 * Normalize a raw JSON string from an AI response so it has a fighting chance
 * of parsing. Handles the most common LLM-induced malformations:
 *   - Markdown code fences (``` ```json ... ``` ```) — stripped if present
 *   - Curly/smart quotes (" " ' ' „ " ‚ ') → straight (" ')
 *   - Markdown links [text](url) → text
 *   - Control characters (except \n \t)
 *   - "json" prefix word before the object (e.g. "json { ... }")
 *   - Trailing prose after the closing brace
 *   - Trailing commas
 */
function _normalizeCardJson(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let s = raw;

    // 1. Strip markdown code fences if present (``` ```json\n ... ``` ```)
    const fenceMatch = s.match(/```(?:json|JSON|Json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
        s = fenceMatch[1];
    }

    // 2. Trim leading "json" word (e.g. "json { ... }")
    s = s.replace(/^\s*json\s*:?\s*/i, '');

    // 3. Replace curly/smart quotes with straight quotes
    s = s
        .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')   // " " „ « »
        .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'");        // ' ' ‚ ‛ ′

    // 4. Strip markdown links: [text](url) → text
    s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 5. Remove control characters except newline, tab, carriage return
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // 6. Trim
    s = s.trim();

    return s;
}

/**
 * Try multiple strategies to extract a JSON object containing "component"
 * from a raw string. Returns the parsed object or null.
 */
function _detectCustomCardType(jsonStr) {
    if (!jsonStr || typeof jsonStr !== 'string') return null;

    // Normalize first — fixes curly quotes, markdown links, fences, etc.
    const normalized = _normalizeCardJson(jsonStr);

    // Quick filter: must contain "component" keyword (after normalization)
    if (!normalized.includes('"component"')) return null;

    // Try to extract just the JSON object (in case there's trailing prose)
    const braceStart = normalized.indexOf('{');
    if (braceStart === -1) return null;

    // Find balanced object starting at braceStart
    const extracted = _tryExtractJsonObject(normalized, braceStart);
    const candidate = extracted ? extracted.json : normalized.slice(braceStart);

    // Fast check: is the JSON structurally complete (balanced braces)?
    if (!_isJsonBalanced(candidate)) return null;

    // Attempt 1: parse as-is
    try {
        const obj = JSON.parse(candidate);
        if (obj && typeof obj === 'object' && obj.component && typeof obj.component === 'string') {
            return obj;
        }
    } catch (_) {}

    // Attempt 2: remove trailing commas
    try {
        const repaired = candidate.replace(/,\s*([}\]])/g, '$1');
        const obj = JSON.parse(repaired);
        if (obj && typeof obj === 'object' && obj.component && typeof obj.component === 'string') {
            return obj;
        }
    } catch (_) {}

    // Attempt 3: remove trailing commas + add missing closing braces
    try {
        let repaired = candidate.replace(/,\s*([}\]])/g, '$1');
        // Count unbalanced braces and append closes
        let depth = 0, inStr = false, esc = false;
        for (let i = 0; i < repaired.length; i++) {
            const ch = repaired[i];
            if (esc) { esc = false; continue; }
            if (ch === '\\' && inStr) { esc = true; continue; }
            if (ch === '"') { inStr = !inStr; continue; }
            if (inStr) continue;
            if (ch === '{') depth++;
            if (ch === '}') depth--;
        }
        while (depth > 0) { repaired += '}'; depth--; }
        const obj = JSON.parse(repaired);
        if (obj && typeof obj === 'object' && obj.component && typeof obj.component === 'string') {
            return obj;
        }
    } catch (_) {}

    // Attempt 4: aggressive — extract just the component field via regex
    try {
        const compMatch = candidate.match(/"component"\s*:\s*"([^"]+)"/);
        if (compMatch) {
            // Try to find the boundaries of the outermost object and parse it
            // after replacing all problematic characters in string values
            let repaired = candidate
                .replace(/,\s*([}\]])/g, '$1');            // trailing commas
            // Last-ditch: if still fails, return a minimal object
            const obj = JSON.parse(repaired);
            if (obj && typeof obj === 'object' && obj.component) {
                return obj;
            }
        }
    } catch (_) {}

    return null;
}

// ── Restore previously rendered cards from cache after innerHTML replacement ──
function _restoreCachedCards(container) {
    if (window._onyxCardCache.size === 0) return;
    const wrappers = container.querySelectorAll('.code-block-wrapper');
    wrappers.forEach(wrapper => {
        if (wrapper.dataset.onyxCardProcessed) return;
        // Skip wrappers inside onyx-tool-card
        if (wrapper.closest('.onyx-tool-card')) return;
        const codeEl = wrapper.querySelector('pre code');
        if (!codeEl) return;
        // Case-insensitive match for json/jsonc/javascript/js language classes,
        // OR no language class at all (the code itself might be a card JSON).
        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '').toLowerCase() : '';
        const isCardLang = !lang || ['json', 'jsonc', 'javascript', 'js'].includes(lang);
        if (!isCardLang) return;
        const code = codeEl.textContent || '';
        // Must look like a card (contain "component") to bother checking the cache
        if (!code.includes('"component"')) return;
        const cacheKey = code.trim();
        if (window._onyxCardCache.has(cacheKey)) {
            wrapper.dataset.onyxCardProcessed = 'true';
            const cardData = window._onyxCardCache.get(cacheKey);
            try {
                const card = _buildOnyxCard(cardData);
                card.classList.add('onyx-card-appear');
                wrapper.replaceWith(card);
            } catch (e) {
                console.warn('[OnyxCard] Failed to restore cached card:', e);
            }
        }
    });
}

function _buildOnyxCard(data) {
    const card = document.createElement('div');
    card.className = 'onyx-card';

    // Check if quiz/interactive-qa has no real questions — redirect to dynamic card
    const component = data.component || '';
    const isQAType = ['interactive-qa', 'qa-prompt', 'quiz'].includes(component);
    const questions = data.questions || [];
    if (isQAType && !questions.length) {
        // No questions → render as a dynamic card instead of empty QA card
        // This prevents empty/question cards from appearing
        data._originalComponent = component;
        data.component = '_dynamic_fallback';
    }

    // Auto-activate: if the card has a context or auto_activate field,
    // add the auto-active animation class
    const context = data.context || data.mode || '';
    const autoActivate = data.auto_activate;
    // Only auto-activate for interactive cards (QA types with questions), not for info/display cards
    const isInteractiveQA = isQAType && questions.length > 0;
    if (isInteractiveQA && (autoActivate === true || (autoActivate !== false && context))) {
        card.classList.add('onyx-card-auto-active');
    } else if (autoActivate === true) {
        card.classList.add('onyx-card-auto-active');
    }

    // Context badge — shows the mode/context (e.g. "💡 Brainstorming", "📚 Study Mode")
    // Only show on interactive QA cards; for other cards use header title instead
    if (context && isInteractiveQA) {
        const contextBadge = document.createElement('div');
        contextBadge.className = 'onyx-qa-badge';
        contextBadge.style.cssText = 'margin-bottom:10px;';
        const contextIcons = {
            'brainstorming': '💡', 'studying': '📚', 'planning': '📋',
            'debugging': '🔧', 'researching': '🔍', 'analyzing': '📊',
            'quiz': '❓', 'review': '📝', 'design': '🎨', 'learning': '📖',
            'coding': '💻', 'writing': '✍️', 'teaching': '👨‍🏫'
        };
        const ctxIcon = contextIcons[context.toLowerCase()] || '🎯';
        contextBadge.innerHTML = `${ctxIcon} ${_onyxEscHtml(context.charAt(0).toUpperCase() + context.slice(1))} Mode`;
        card.appendChild(contextBadge);
    }

    // Header
    if (data.title || data.subtitle) {
        const header = document.createElement('div');
        header.className = 'onyx-card-header';
        if (data.title) header.innerHTML += `<h3>${_onyxEscHtml(data.title)}</h3>`;
        if (data.subtitle) header.innerHTML += `<p>${_onyxEscHtml(data.subtitle)}</p>`;
        card.appendChild(header);
    }

    // Tabs (if present)
    const tabs = data.tabs;
    const tabContents = {};
    if (tabs && Array.isArray(tabs) && tabs.length > 0) {
        const tabBar = document.createElement('div');
        tabBar.className = 'onyx-tabs';
        tabs.forEach((tab, i) => {
            const btn = document.createElement('button');
            btn.className = 'onyx-tab' + (i === 0 ? ' active' : '');
            btn.textContent = tab.label || tab.name || `Tab ${i+1}`;
            btn.onclick = function() {
                tabBar.querySelectorAll('.onyx-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                card.querySelectorAll('.onyx-tab-content').forEach(c => c.classList.remove('active'));
                const target = card.querySelector(`[data-tab="${i}"]`);
                if (target) target.classList.add('active');
            };
            tabBar.appendChild(btn);
            tabContents[i] = tab.content || tab;
        });
        card.appendChild(tabBar);
    }

    // Tab content wrapper
    let tabWrapper = null;
    if (tabs) {
        tabWrapper = document.createElement('div');
        card.appendChild(tabWrapper);
    }

    // Render component body — could be inside tabs or direct
    function renderBody(container, bodyData, isActive) {
        const wrap = document.createElement('div');
        if (tabs) {
            wrap.className = 'onyx-tab-content' + (isActive ? ' active' : '');
            wrap.setAttribute('data-tab', Object.keys(tabContents).find(k => tabContents[k] === bodyData) || '0');
        }

        const component = bodyData.component || data.component;

        // Unlimited component rendering: check registry first, then fallback to generic
        const renderer = ONYX_CARD_RENDERERS[component];
        if (renderer) {
            renderer(wrap, bodyData);
        } else {
            // Dynamic rendering for ANY unknown component type
            _renderDynamicCard(wrap, bodyData, component);
        }

        container.appendChild(wrap);
    }

    if (tabs) {
        tabs.forEach((tab, i) => {
            const tabData = { ...tab, component: tab.component || data.component };
            renderBody(tabWrapper, tabData, i === 0);
        });
    } else {
        renderBody(card, data, true);
    }

    // CTA
    if (data.cta) {
        const ctaEl = document.createElement('button');
        ctaEl.className = 'onyx-cta';
        ctaEl.innerHTML = `${_onyxEscHtml(data.cta)} <span style="font-size:12px">→</span>`;
        card.appendChild(ctaEl);
    }

    return card;
}

// ── Service Grid ──
function _renderServiceGrid(container, data) {
    const items = data.items || data.services || [];
    if (!items.length) return;

    const grid = document.createElement('div');
    grid.className = 'onyx-service-grid';

    items.forEach((item, i) => {
        const color = _onyxColorClass(i);
        const icon = _onyxResolveIcon(item.icon || '');
        const priceClass = item.price_color ? `onyx-price-${item.price_color}` : _onyxPriceClass(i);

        const el = document.createElement('div');
        el.className = 'onyx-service-card';
        el.innerHTML = `
            <div class="onyx-svc-icon onyx-bg-${color}">${icon}</div>
            <div class="onyx-svc-title">${_onyxEscHtml(item.title || '')}</div>
            <div class="onyx-svc-desc">${_onyxEscHtml(item.description || item.desc || '')}</div>
            ${item.price ? `<span class="onyx-svc-price ${priceClass}">${_onyxEscHtml(item.price)}</span>` : ''}
        `;
        grid.appendChild(el);
    });

    container.appendChild(grid);
}

// ── Content Strategy ──
function _renderContentStrategy(container, data) {
    // Pillars
    const pillars = data.pillars || data.sections || [];
    if (pillars.length) {
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'onyx-section-title';
        sectionTitle.textContent = data.pillars_label || 'CONTENT PILLARS';
        container.appendChild(sectionTitle);

        const grid = document.createElement('div');
        grid.className = 'onyx-pillars-grid';
        pillars.forEach((p, i) => {
            const color = _onyxColorClass(i);
            const icon = _onyxResolveIcon(p.icon || '');
            const el = document.createElement('div');
            el.className = 'onyx-pillar-card';
            el.innerHTML = `
                <div class="onyx-pillar-icon onyx-bg-${color}">${icon}</div>
                <div class="onyx-pillar-title">${_onyxEscHtml(p.title || '')}</div>
                <div class="onyx-pillar-desc">${_onyxEscHtml(p.description || p.desc || '')}</div>
            `;
            grid.appendChild(el);
        });
        container.appendChild(grid);
    }

    // Post Formats / Chips
    const formats = data.formats || data.tags || data.chips || [];
    if (formats.length) {
        const fmtTitle = document.createElement('div');
        fmtTitle.className = 'onyx-section-title';
        fmtTitle.textContent = data.formats_label || 'POST FORMATS';
        container.appendChild(fmtTitle);

        const chipsEl = document.createElement('div');
        chipsEl.className = 'onyx-chips';
        formats.forEach((f, i) => {
            const color = _onyxColorClass(i);
            const chip = document.createElement('span');
            chip.className = `onyx-chip onyx-bg-${color}`;
            chip.style.color = '#fff';
            chip.textContent = typeof f === 'string' ? f : (f.label || f.title || '');
            chipsEl.appendChild(chip);
        });
        container.appendChild(chipsEl);
    }

    // Schedule
    const schedule = data.schedule || data.weekly_plan || [];
    if (schedule.length) {
        const schedTitle = document.createElement('div');
        schedTitle.className = 'onyx-section-title';
        schedTitle.textContent = data.schedule_label || 'SUGGESTED SCHEDULE';
        container.appendChild(schedTitle);

        const list = document.createElement('div');
        list.className = 'onyx-schedule-list';
        schedule.forEach((s, i) => {
            const color = _onyxColorClass(i);
            const item = document.createElement('div');
            item.className = 'onyx-schedule-item';
            item.innerHTML = `
                <div class="onyx-schedule-dot onyx-dot-${color}"></div>
                <div class="onyx-schedule-day">${_onyxEscHtml(s.day || s.label || '')}</div>
                <div class="onyx-schedule-task">${_onyxEscHtml(s.task || s.tasks || s.content || '')}</div>
            `;
            list.appendChild(item);
        });
        container.appendChild(list);
    }
}

// ── Exam Plan ──
function _renderExamPlan(container, data) {
    // Phases
    const phases = data.phases || [];
    if (phases.length) {
        const phasesEl = document.createElement('div');
        phasesEl.className = 'onyx-phases';
        phases.forEach((p, i) => {
            const phaseClass = p.color ? `onyx-phase-${p.color}` : _onyxPhaseClass(i);
            const el = document.createElement('div');
            el.className = `onyx-phase-card ${phaseClass}`;
            el.innerHTML = `
                <div>
                    <div class="onyx-phase-num">Phase ${i+1}</div>
                    <div class="onyx-phase-info">
                        <h4>${_onyxEscHtml(p.title || p.name || '')}</h4>
                        <p>${_onyxEscHtml(p.description || p.desc || '')}</p>
                    </div>
                </div>
            `;
            phasesEl.appendChild(el);
        });
        container.appendChild(phasesEl);
    }

    // Legend
    const subjects = data.subjects || data.legend || [];
    if (subjects.length) {
        const legend = document.createElement('div');
        legend.className = 'onyx-legend';
        subjects.forEach((s, i) => {
            const color = s.color || _onyxColorClass(i);
            const item = document.createElement('div');
            item.className = 'onyx-legend-item';
            item.innerHTML = `<div class="onyx-legend-dot onyx-dot-${color}"></div>${_onyxEscHtml(typeof s === 'string' ? s : (s.name || s.label || ''))}`;
            legend.appendChild(item);
        });
        container.appendChild(legend);
    }

    // Daily Grid
    const days = data.days || data.daily_plan || [];
    if (days.length) {
        const grid = document.createElement('div');
        grid.className = 'onyx-daily-grid';
        days.forEach((d, di) => {
            const el = document.createElement('div');
            el.className = 'onyx-daily-card';
            const dayLabel = d.day || d.label || `Day ${di+1}`;
            const tag = d.tag || d.type || '';
            let tasksHtml = '';
            const tasks = d.tasks || d.blocks || d.items || [];
            tasks.forEach((t, ti) => {
                const color = t.color || (data.subjects ? _onyxColorClass(ti) : 'gray');
                const taskName = typeof t === 'string' ? t : (t.task || t.subject || t.name || t.title || '');
                const time = typeof t === 'string' ? '' : (t.time || t.duration || '');
                tasksHtml += `
                    <div class="onyx-daily-task">
                        <div class="onyx-daily-task-dot onyx-dot-${color}"></div>
                        <span>${_onyxEscHtml(taskName)}</span>
                        ${time ? `<span class="onyx-daily-task-time">${_onyxEscHtml(time)}</span>` : ''}
                    </div>
                `;
            });
            el.innerHTML = `
                <div class="onyx-daily-header">
                    <span class="onyx-daily-day">${_onyxEscHtml(dayLabel)}</span>
                    ${tag ? `<span class="onyx-daily-tag">${_onyxEscHtml(tag)}</span>` : ''}
                </div>
                <div class="onyx-daily-tasks">${tasksHtml}</div>
            `;
            grid.appendChild(el);
        });
        container.appendChild(grid);
    }
}

// ── Study Plan ──
function _renderStudyPlan(container, data) {
    _renderExamPlan(container, data);
}

// ── Stat Cards ──
function _renderStatCards(container, data) {
    const stats = data.stats || data.items || [];
    if (!stats.length) return;

    const grid = document.createElement('div');
    grid.className = 'onyx-stat-grid';

    stats.forEach((s, i) => {
        const color = _onyxColorClass(i);
        const el = document.createElement('div');
        el.className = 'onyx-stat-card';
        const changeClass = s.change_direction === 'down' ? 'onyx-stat-down' : 'onyx-stat-up';
        const changeIcon = s.change_direction === 'down' ? '↓' : '↑';
        el.innerHTML = `
            <div class="onyx-stat-value" style="color: var(--onyx-accent, #fff)">${_onyxEscHtml(String(s.value || s.number || '—'))}</div>
            <div class="onyx-stat-label">${_onyxEscHtml(s.label || s.title || '')}</div>
            ${s.change ? `<div class="onyx-stat-change ${changeClass}">${changeIcon} ${_onyxEscHtml(s.change)}</div>` : ''}
        `;
        grid.appendChild(el);
    });

    container.appendChild(grid);

    // Progress bars
    const progress = data.progress || [];
    progress.forEach(p => {
        const wrap = document.createElement('div');
        wrap.className = 'onyx-progress';
        const pct = Math.min(100, Math.max(0, p.percent || p.value || 0));
        const color = p.color || 'blue';
        wrap.innerHTML = `
            <div class="onyx-progress-label">
                <span>${_onyxEscHtml(p.label || '')}</span>
                <span>${pct}%</span>
            </div>
            <div class="onyx-progress-bar">
                <div class="onyx-progress-fill onyx-bg-${color}" style="width:${pct}%"></div>
            </div>
        `;
        container.appendChild(wrap);
    });
}

// ── Data Table ──
function _renderDataTable(container, data) {
    const headers = data.headers || data.columns || [];
    const rows = data.rows || data.data || [];
    if (!headers.length || !rows.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'onyx-table';
    let html = '<table><thead><tr>';
    headers.forEach(h => { html += `<th>${_onyxEscHtml(typeof h === 'string' ? h : (h.label || h.key || ''))}</th>`; });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        html += '<tr>';
        headers.forEach(h => {
            const key = typeof h === 'string' ? h : (h.key || h.label || '');
            const val = row[key] !== undefined ? row[key] : '';
            html += `<td>${_onyxEscHtml(String(val))}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
    container.appendChild(wrap);
}

// ── Checklist ──
function _renderChecklist(container, data) {
    const items = data.items || data.tasks || [];
    if (!items.length) return;

    const list = document.createElement('div');
    list.className = 'onyx-checklist';

    items.forEach((item, i) => {
        const text = typeof item === 'string' ? item : (item.text || item.title || item.task || '');
        const done = typeof item === 'object' ? (item.done || item.checked || false) : false;
        const el = document.createElement('div');
        el.className = 'onyx-check-item';
        el.innerHTML = `
            <div class="onyx-checkbox ${done ? 'checked' : ''}"></div>
            <span class="onyx-check-text ${done ? 'done' : ''}">${_onyxEscHtml(text)}</span>
        `;
        el.onclick = function() {
            const cb = el.querySelector('.onyx-checkbox');
            const txt = el.querySelector('.onyx-check-text');
            cb.classList.toggle('checked');
            txt.classList.toggle('done');
        };
        list.appendChild(el);
    });

    container.appendChild(list);
}

// ── Timeline ──
function _renderTimeline(container, data) {
    const events = data.events || data.items || [];
    if (!events.length) return;

    const list = document.createElement('div');
    list.className = 'onyx-schedule-list';

    events.forEach((ev, i) => {
        const color = ev.color || _onyxColorClass(i);
        const el = document.createElement('div');
        el.className = 'onyx-schedule-item';
        el.innerHTML = `
            <div class="onyx-schedule-dot onyx-dot-${color}"></div>
            <div class="onyx-schedule-day">${_onyxEscHtml(ev.date || ev.time || ev.label || '')}</div>
            <div class="onyx-schedule-task">${_onyxEscHtml(ev.title || ev.event || ev.description || '')}</div>
        `;
        list.appendChild(el);
    });

    container.appendChild(list);
}

// ── Schedule ──
function _renderSchedule(container, data) {
    _renderTimeline(container, data);
}

// ── Generic Fallback Card ──
function _renderGenericCard(container, data) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';

    // Try to render any known fields
    const fields = ['description', 'summary', 'content', 'text', 'body'];
    for (const f of fields) {
        if (data[f]) {
            const p = document.createElement('p');
            p.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.6);line-height:1.5;margin:0';
            p.textContent = data[f];
            body.appendChild(p);
            break;
        }
    }

    // Items as a simple list
    const items = data.items || data.list || [];
    if (items.length) {
        const list = document.createElement('div');
        list.className = 'onyx-schedule-list';
        items.forEach((item, i) => {
            const color = _onyxColorClass(i);
            const el = document.createElement('div');
            el.className = 'onyx-schedule-item';
            const text = typeof item === 'string' ? item : (item.title || item.name || item.label || JSON.stringify(item));
            el.innerHTML = `
                <div class="onyx-schedule-dot onyx-dot-${color}"></div>
                <div class="onyx-schedule-task">${_onyxEscHtml(text)}</div>
            `;
            list.appendChild(el);
        });
        body.appendChild(list);
    }

    container.appendChild(body);
}

// ── Dynamic Card Renderer (UNLIMITED component types) ──
// This renderer introspects ANY JSON data and builds a beautiful card
// regardless of the component type. It supports nested objects, arrays,
// key-value pairs, and mixed data structures automatically.
function _renderDynamicCard(container, data, componentType) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';

    // Collect all renderable fields from the data
    const skipKeys = ['component', 'title', 'subtitle', 'tabs', 'cta', '_originalComponent'];
    const entries = Object.entries(data).filter(([k]) => !skipKeys.includes(k));

    // Helper: determine how to render a value based on its type
    function renderValue(val, key, depth) {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return _onyxEscHtml(val);
        if (typeof val === 'number') return `<span style="font-weight:700;font-size:16px">${val}</span>`;
        if (typeof val === 'boolean') return val ? '<span style="color:#22c55e;font-weight:600">✓ Yes</span>' : '<span style="color:#ef4444;font-weight:600">✗ No</span>';
        if (Array.isArray(val)) return renderArray(val, key, depth);
        if (typeof val === 'object') return renderObject(val, key, depth);
        return _onyxEscHtml(String(val));
    }

    // Render an array of items
    function renderArray(arr, key, depth) {
        if (!arr.length) return '';
        if (depth > 2) return `<span style="opacity:0.5">[${arr.length} items]</span>`;

        // Detect if array of primitives (strings/numbers)
        const isPrimitive = arr.every(v => typeof v === 'string' || typeof v === 'number');
        if (isPrimitive) {
            const chips = document.createElement('div');
            chips.className = 'onyx-chips';
            arr.forEach((v, i) => {
                const color = _onyxColorClass(i);
                const chip = document.createElement('span');
                chip.className = `onyx-chip onyx-bg-${color}`;
                chip.style.color = '#fff';
                chip.textContent = String(v);
                chips.appendChild(chip);
            });
            return chips.outerHTML;
        }

        // Array of objects — render as cards/grid
        const grid = document.createElement('div');
        grid.className = 'onyx-service-grid';
        arr.forEach((item, i) => {
            if (typeof item !== 'object' || item === null) return;
            const color = _onyxColorClass(i);
            // Resolve icon through the proper resolver so names like "book"/"code"/"brain"
            // map to emojis/SVGs instead of leaking as raw text. Falls back to emoji field.
            const icon = _onyxResolveIcon(item.icon || item.emoji || '');
            const title = item.title || item.name || item.label || item.key || '';
            const desc = item.description || item.desc || item.value || item.text || '';
            const el = document.createElement('div');
            el.className = 'onyx-service-card';
            el.innerHTML = `
                ${icon ? `<div class="onyx-svc-icon onyx-bg-${color}">${icon}</div>` : ''}
                ${title ? `<div class="onyx-svc-title">${_onyxEscHtml(String(title))}</div>` : ''}
                ${desc ? `<div class="onyx-svc-desc">${_onyxEscHtml(String(desc))}</div>` : ''}
            `;
            grid.appendChild(el);
        });
        return grid.outerHTML;
    }

    // Render a nested object
    function renderObject(obj, key, depth) {
        if (depth > 2) return `<span style="opacity:0.5">{...}</span>`;
        const rows = Object.entries(obj).map(([k, v]) => {
            const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                    <span style="font-size:12px;opacity:0.5">${_onyxEscHtml(label)}</span>
                    <span style="font-size:12px">${renderValue(v, k, depth + 1)}</span>
                </div>
            `;
        }).join('');
        return rows;
    }

    // Render each top-level field with appropriate styling
    entries.forEach(([key, val], idx) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Skip empty values
        if (val === null || val === undefined) return;
        if (Array.isArray(val) && val.length === 0) return;
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return;

        // Section header for non-trivial fields
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'onyx-section-title';
            sectionTitle.textContent = label.toUpperCase();
            body.appendChild(sectionTitle);
            body.innerHTML += renderValue(val, key, 0);
        } else {
            // Simple key-value
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)';
            row.innerHTML = `
                <span style="font-size:12px;opacity:0.5">${_onyxEscHtml(label)}</span>
                <span style="font-size:12px">${renderValue(val, key, 0)}</span>
            `;
            body.appendChild(row);
        }
    });

    // If body is still empty, fall back to generic
    if (!body.innerHTML.trim()) {
        _renderGenericCard(container, data);
        return;
    }

    container.appendChild(body);
}

// =====================================================================
// Todo List Card — interactive JSON-backed task lists (CRUD via chat)
// =====================================================================
function _renderTodoListCard(container, data) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';

    // Index view (list of all todo lists) — render a simple gallery and stop.
    if (data.component === 'todo-index') {
        const lists = Array.isArray(data.lists) ? data.lists : [];
        if (!lists.length) {
            body.innerHTML = `<div class="onyx-empty-hint">No todo lists yet. Ask the agent to "create a todo list" to get started.</div>`;
            container.appendChild(body);
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'onyx-service-grid';
        lists.forEach((l, i) => {
            const color = _onyxColorClass(i);
            const stats = l.stats || { total: 0, done: 0, pending: 0 };
            const el = document.createElement('div');
            el.className = 'onyx-service-card';
            el.innerHTML = `
                <div class="onyx-svc-icon onyx-bg-${color}">📋</div>
                <div class="onyx-svc-title">${_onyxEscHtml(l.title || l.id || '')}</div>
                <div class="onyx-svc-desc">${_onyxEscHtml(l.description || '')}</div>
                <div class="onyx-todo-stats">
                    <span class="onyx-todo-stat-done">✓ ${stats.done}</span>
                    <span class="onyx-todo-stat-pending">○ ${stats.pending}</span>
                    <span class="onyx-todo-stat-total">${stats.total} total</span>
                </div>
            `;
            grid.appendChild(el);
        });
        body.appendChild(grid);
        container.appendChild(body);
        return;
    }

    // Single list view
    const title = data.title || data.id || 'Todo List';
    const desc = data.description || '';
    const items = Array.isArray(data.items) ? data.items : [];
    const stats = data.stats || { total: items.length, done: 0, pending: items.length };

    // Header row with stats
    const header = document.createElement('div');
    header.className = 'onyx-todo-header';
    header.innerHTML = `
        <div class="onyx-todo-progress-bar">
            <div class="onyx-todo-progress-fill" style="width:${stats.total ? Math.round(stats.done * 100 / stats.total) : 0}%"></div>
        </div>
        <div class="onyx-todo-stats">
            <span class="onyx-todo-stat-done">${stats.done} done</span>
            <span class="onyx-todo-stat-pending">${stats.pending} pending</span>
            <span class="onyx-todo-stat-total">${stats.total} total</span>
        </div>
    `;
    body.appendChild(header);
    if (desc) {
        const descEl = document.createElement('div');
        descEl.className = 'onyx-todo-desc';
        descEl.textContent = desc;
        body.appendChild(descEl);
    }

    // Items list
    const list = document.createElement('div');
    list.className = 'onyx-todo-list';
    if (!items.length) {
        list.innerHTML = `<div class="onyx-empty-hint">No items yet. Ask the agent to add tasks.</div>`;
    } else {
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'onyx-todo-item' + (item.completed ? ' onyx-todo-item-done' : '');
            const priority = item.priority || 'medium';
            const due = item.due ? `<span class="onyx-todo-due">📅 ${_onyxEscHtml(item.due)}</span>` : '';
            const notes = item.notes ? `<div class="onyx-todo-notes">${_onyxEscHtml(item.notes)}</div>` : '';
            row.innerHTML = `
                <div class="onyx-todo-check">${item.completed ? '✓' : '○'}</div>
                <div class="onyx-todo-content">
                    <div class="onyx-todo-title">${_onyxEscHtml(item.title || '')}</div>
                    ${notes}
                    <div class="onyx-todo-meta">
                        <span class="onyx-todo-priority onyx-priority-${priority}">${priority}</span>
                        ${due}
                    </div>
                </div>
            `;
            list.appendChild(row);
        });
    }
    body.appendChild(list);

    container.appendChild(body);

    // Best-effort: refresh the todos right-bar panel so it stays in sync with
    // agent-driven mutations. Only fires if the panel has been opened at least
    // once (so we don't poll the endpoint on every page load).
    if (typeof _todosPanelState !== 'undefined' && _todosPanelState.loaded) {
        setTimeout(refreshTodosPanel, 200);
    }
}

// =====================================================================
// Counterfactual Card — "what if X had been different?" reasoning view
// =====================================================================
function _renderCounterfactualCard(container, data) {
    // Index view
    if (data.component === 'counterfactual-index') {
        const body = document.createElement('div');
        body.className = 'onyx-card-body';
        const analyses = Array.isArray(data.analyses) ? data.analyses : [];
        if (!analyses.length) {
            body.innerHTML = `<div class="onyx-empty-hint">No counterfactual analyses yet. Ask the agent to explore a "what if" scenario.</div>`;
            container.appendChild(body);
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'onyx-service-grid';
        analyses.forEach((a, i) => {
            const color = _onyxColorClass(i);
            const el = document.createElement('div');
            el.className = 'onyx-service-card';
            el.innerHTML = `
                <div class="onyx-svc-icon onyx-bg-${color}">🔮</div>
                <div class="onyx-svc-title">${_onyxEscHtml(a.title || a.id || '')}</div>
                <div class="onyx-svc-desc">${_onyxEscHtml(a.hypothetical || '')}</div>
                <div class="onyx-todo-stats">
                    <span class="onyx-todo-stat-total">${a.branch_count || 0} branches</span>
                </div>
            `;
            grid.appendChild(el);
        });
        body.appendChild(grid);
        container.appendChild(body);
        return;
    }

    // Single analysis view
    const body = document.createElement('div');
    body.className = 'onyx-card-body onyx-cf-body';

    // Observed vs Hypothetical split panel
    const split = document.createElement('div');
    split.className = 'onyx-cf-split';
    split.innerHTML = `
        <div class="onyx-cf-panel onyx-cf-observed">
            <div class="onyx-cf-panel-label">OBSERVED</div>
            <div class="onyx-cf-panel-text">${_onyxEscHtml(data.observed || '')}</div>
        </div>
        <div class="onyx-cf-arrow">→</div>
        <div class="onyx-cf-panel onyx-cf-hypothetical">
            <div class="onyx-cf-panel-label">HYPOTHETICAL</div>
            <div class="onyx-cf-panel-text">${_onyxEscHtml(data.hypothetical || '')}</div>
        </div>
    `;
    body.appendChild(split);

    // Branches
    const branches = Array.isArray(data.branches) ? data.branches : [];
    if (branches.length) {
        const title = document.createElement('div');
        title.className = 'onyx-section-title';
        title.textContent = `POSSIBLE OUTCOMES (${branches.length})`;
        body.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'onyx-cf-branches';
        branches.forEach((b, i) => {
            const color = _onyxColorClass(i);
            const plaus = b.plausibility || 'medium';
            const pros = Array.isArray(b.pros) ? b.pros : [];
            const cons = Array.isArray(b.cons) ? b.cons : [];
            const prosHtml = pros.length
                ? `<div class="onyx-cf-pros">${pros.map(p => `<div>✓ ${_onyxEscHtml(p)}</div>`).join('')}</div>`
                : '';
            const consHtml = cons.length
                ? `<div class="onyx-cf-cons">${cons.map(c => `<div>✗ ${_onyxEscHtml(c)}</div>`).join('')}</div>`
                : '';
            const el = document.createElement('div');
            el.className = `onyx-cf-branch onyx-bg-${color}`;
            el.innerHTML = `
                <div class="onyx-cf-branch-head">
                    <span class="onyx-cf-outcome">${_onyxEscHtml(b.outcome || '')}</span>
                    <span class="onyx-cf-plausibility onyx-plaus-${plaus}">${plaus}</span>
                </div>
                ${prosHtml}${consHtml}
            `;
            grid.appendChild(el);
        });
        body.appendChild(grid);
    }

    // Recommendation
    if (data.recommendation) {
        const rec = document.createElement('div');
        rec.className = 'onyx-cf-recommendation';
        rec.innerHTML = `
            <div class="onyx-cf-rec-label">RECOMMENDATION</div>
            <div class="onyx-cf-rec-text">${_onyxEscHtml(data.recommendation)}</div>
        `;
        body.appendChild(rec);
    }

    container.appendChild(body);
}

// =====================================================================
// Custom Card — AI creates its own arbitrary card layout.
// Supported `layout` values: "chart" | "bars" | "grid" | "planning" |
// "tracking" | "stats" | "table" | "custom". The renderer inspects the
// fields and picks the best sub-renderer, so the AI can ship any shape
// of card without us predefining every type.
// =====================================================================
function _renderCustomCard(container, data) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';

    // ── AUTO-DETECT Chart.js-style data shape and normalize ──
    // The AI often emits data in Chart.js format:
    //   { chartType: "bar", labels: [...], datasets: [{label, data: [...]}], options: {...} }
    // We normalize this to our internal schema so the bars/chart sub-renderer
    // can consume it directly. This prevents the ugly freeform key/value fallback.
    if (data.chartType || data.chart_type || (data.datasets && Array.isArray(data.datasets))) {
        const ct = (data.chartType || data.chart_type || 'bar').toLowerCase();
        const datasets = Array.isArray(data.datasets) ? data.datasets : [];
        const labels = Array.isArray(data.labels) ? data.labels : [];

        // Pie / donut: aggregate all datasets into a single items list.
        if (ct === 'pie' || ct === 'doughnut' || ct === 'donut') {
            const items = [];
            datasets.forEach(ds => {
                const dsData = Array.isArray(ds.data) ? ds.data : [];
                dsData.forEach((v, i) => {
                    items.push({
                        label: labels[i] || `${ds.label || ''} #${i+1}`,
                        value: Number(v) || 0,
                        color: Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor,
                    });
                });
            });
            data = Object.assign({}, data, {
                layout: 'chart',
                kind: 'donut',
                items: items,
            });
        }
        // Bar / line: use first dataset's data as the series.
        else if (datasets.length) {
            const ds0 = datasets[0] || {};
            const nums = Array.isArray(ds0.data) ? ds0.data : [];
            // For bar layout, build items: [{label, value}].
            // For line layout, build series + labels.
            if (ct === 'bar' || ct === 'column') {
                data = Object.assign({}, data, {
                    layout: 'bars',
                    title: data.title || (data.options && data.options.title && data.options.title.text) || '',
                    items: nums.map((v, i) => ({
                        label: labels[i] || `#${i+1}`,
                        value: Number(v) || 0,
                    })),
                });
            } else {
                // line / area / radar → use chart sub-renderer with line kind
                data = Object.assign({}, data, {
                    layout: 'chart',
                    kind: 'line',
                    series: nums,
                    labels: labels,
                    title: data.title || (data.options && data.options.title && data.options.title.text) || '',
                });
            }
        }
    }

    const layout = (data.layout || data.type || 'custom').toLowerCase();
    const title = data.title || data.heading || '';
    const subtitle = data.subtitle || data.description || '';

    if (title) {
        const h = document.createElement('div');
        h.className = 'onyx-section-title';
        h.textContent = title;
        body.appendChild(h);
    }
    if (subtitle) {
        const s = document.createElement('div');
        s.className = 'onyx-todo-desc';
        s.textContent = subtitle;
        body.appendChild(s);
    }

    // ── Chart layout: line/area/donut/pie via simple inline SVG ──
    if (layout === 'chart') {
        body.appendChild(_buildCustomChart(data));
    }
    // ── Bars layout: horizontal bar chart from `items: [{label, value, max?}]` ──
    else if (layout === 'bars') {
        body.appendChild(_buildCustomBars(data));
    }
    // ── Planning layout: phases with progress + items ──
    else if (layout === 'planning') {
        body.appendChild(_buildCustomPlanning(data));
    }
    // ── Tracking layout: metrics with trends ──
    else if (layout === 'tracking') {
        body.appendChild(_buildCustomTracking(data));
    }
    // ── Stats layout: KPI grid ──
    else if (layout === 'stats' || layout === 'stat-cards') {
        body.appendChild(_buildCustomStats(data));
    }
    // ── Table layout ──
    else if (layout === 'table') {
        body.appendChild(_buildCustomTable(data));
    }
    // ── Grid layout: generic card grid ──
    else if (layout === 'grid') {
        body.appendChild(_buildCustomGrid(data));
    }
    // ── Custom / unknown: render any provided fields dynamically ──
    else {
        body.appendChild(_buildCustomFreeform(data));
    }

    // Optional footer / CTA
    if (data.footer) {
        const f = document.createElement('div');
        f.className = 'onyx-todo-desc';
        f.style.marginTop = '10px';
        f.textContent = data.footer;
        body.appendChild(f);
    }

    container.appendChild(body);
}

// ── Custom chart sub-renderer (line/area/donut/pie) ──
function _buildCustomChart(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-custom-chart';
    const kind = (data.kind || data.chart_type || 'line').toLowerCase();
    const series = Array.isArray(data.series) ? data.series : (Array.isArray(data.values) ? data.values : []);
    const labels = Array.isArray(data.labels) ? data.labels : [];

    if (kind === 'donut' || kind === 'pie') {
        // Donut/pie from {label, value, color?} items
        const items = Array.isArray(data.items) ? data.items : series.map((v, i) => ({
            label: labels[i] || `#${i+1}`, value: typeof v === 'number' ? v : (v.value || 0),
        }));
        const total = items.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
        const radius = 50, circumference = 2 * Math.PI * radius;
        let offset = 0;
        const colors = ['#f43f5e', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#10b981'];
        const svgParts = items.map((it, i) => {
            const pct = (Number(it.value) || 0) / total;
            const dash = pct * circumference;
            const color = it.color || colors[i % colors.length];
            const seg = `<circle r="${radius}" cx="60" cy="60" fill="none" stroke="${color}" stroke-width="16" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"/>`;
            offset += dash;
            return seg;
        }).join('');
        wrap.innerHTML = `
            <div class="onyx-chart-row">
                <svg viewBox="0 0 120 120" width="140" height="140">${svgParts}<text x="60" y="60" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="currentColor">${total}</text></svg>
                <div class="onyx-chart-legend">
                    ${items.map((it, i) => `<div class="onyx-chart-legend-item"><span class="onyx-chart-dot" style="background:${it.color || colors[i % colors.length]}"></span>${_onyxEscHtml(it.label || '')} <span class="onyx-chart-val">${Number(it.value) || 0}</span></div>`).join('')}
                </div>
            </div>`;
        return wrap;
    }

    // Default: line/area chart from numeric series
    if (!series.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">No chart data provided.</div>`;
        return wrap;
    }
    const nums = series.map(v => typeof v === 'number' ? v : (v && v.value !== undefined ? Number(v.value) : 0));
    const max = Math.max(...nums, 1);
    const min = Math.min(...nums, 0);
    const range = max - min || 1;
    const w = 280, h = 100, pad = 8;
    const pts = nums.map((v, i) => {
        const x = pad + (i / Math.max(nums.length - 1, 1)) * (w - 2 * pad);
        const y = h - pad - ((v - min) / range) * (h - 2 * pad);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const stroke = data.color || '#f43f5e';
    const fill = data.fill || `${stroke}33`;
    const pathLine = `M ${pts.join(' L ')}`;
    const pathArea = `${pathLine} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;
    wrap.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
            <path d="${pathArea}" fill="${fill}" stroke="none"/>
            <path d="${pathLine}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
            ${pts.map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="2.5" fill="${stroke}"/>`).join('')}
        </svg>
        ${labels.length ? `<div class="onyx-chart-xlabels">${labels.map(l => `<span>${_onyxEscHtml(l)}</span>`).join('')}</div>` : ''}
    `;
    return wrap;
}

// ── Custom bars sub-renderer ──
function _buildCustomBars(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-custom-bars';
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">No bars provided.</div>`;
        return wrap;
    }
    const max = Math.max(...items.map(it => Number(it.value || it.count || 0)), 1);
    const colors = ['#f43f5e', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4'];
    wrap.innerHTML = items.map((it, i) => {
        const v = Number(it.value || it.count || 0);
        const pct = (v / max) * 100;
        const color = it.color || colors[i % colors.length];
        return `<div class="onyx-bar-row">
            <span class="onyx-bar-label">${_onyxEscHtml(it.label || it.name || '')}</span>
            <div class="onyx-bar-track"><div class="onyx-bar-fill" style="width:${pct}%;background:${color}"></div></div>
            <span class="onyx-bar-val">${v}</span>
        </div>`;
    }).join('');
    return wrap;
}

// ── Custom planning sub-renderer ──
function _buildCustomPlanning(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-custom-planning';
    const phases = Array.isArray(data.phases) ? data.phases : (Array.isArray(data.items) ? data.items : []);
    if (!phases.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">No phases provided.</div>`;
        return wrap;
    }
    wrap.innerHTML = phases.map((p, i) => {
        const progress = Math.min(100, Math.max(0, Number(p.progress || 0)));
        const status = p.status || (progress >= 100 ? 'done' : progress > 0 ? 'in-progress' : 'pending');
        const items = Array.isArray(p.items) ? p.items : [];
        return `<div class="onyx-plan-phase">
            <div class="onyx-plan-head">
                <span class="onyx-plan-num">${i + 1}</span>
                <span class="onyx-plan-title">${_onyxEscHtml(p.title || p.name || '')}</span>
                <span class="onyx-plan-status onyx-plan-status-${status}">${status}</span>
            </div>
            ${p.description ? `<div class="onyx-todo-desc">${_onyxEscHtml(p.description)}</div>` : ''}
            <div class="onyx-todo-progress-bar"><div class="onyx-todo-progress-fill" style="width:${progress}%"></div></div>
            ${items.length ? `<div class="onyx-plan-items">${items.map(it => `<div class="onyx-plan-item">${_onyxEscHtml(typeof it === 'string' ? it : (it.title || it.text || ''))}</div>`).join('')}</div>` : ''}
        </div>`;
    }).join('');
    return wrap;
}

// ── Custom tracking sub-renderer ──
function _buildCustomTracking(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-custom-tracking';
    const metrics = Array.isArray(data.metrics) ? data.metrics : (Array.isArray(data.items) ? data.items : []);
    if (!metrics.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">No metrics provided.</div>`;
        return wrap;
    }
    wrap.innerHTML = metrics.map(m => {
        const value = m.value !== undefined ? m.value : '—';
        const trend = m.trend || m.delta || '';
        const isUp = String(trend).startsWith('+') || String(trend).startsWith('↑');
        const isDown = String(trend).startsWith('-') || String(trend).startsWith('↓');
        const trendClass = isUp ? 'up' : (isDown ? 'down' : '');
        return `<div class="onyx-track-metric">
            <div class="onyx-track-value">${_onyxEscHtml(String(value))}</div>
            <div class="onyx-track-label">${_onyxEscHtml(m.label || m.name || '')}</div>
            ${trend ? `<div class="onyx-track-trend ${trendClass}">${_onyxEscHtml(String(trend))}</div>` : ''}
        </div>`;
    }).join('');
    return wrap;
}

// ── Custom stats sub-renderer ──
function _buildCustomStats(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-stat-grid';
    const stats = Array.isArray(data.stats) ? data.stats : (Array.isArray(data.items) ? data.items : []);
    if (!stats.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">No stats provided.</div>`;
        return wrap;
    }
    wrap.innerHTML = stats.map(s => `<div class="onyx-stat-card">
        <div class="onyx-stat-value">${_onyxEscHtml(String(s.value !== undefined ? s.value : '—'))}</div>
        <div class="onyx-stat-label">${_onyxEscHtml(s.label || s.name || '')}</div>
    </div>`).join('');
    return wrap;
}

// ── Custom table sub-renderer ──
function _buildCustomTable(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-custom-table-wrap';
    const columns = Array.isArray(data.columns) ? data.columns : [];
    const rows = Array.isArray(data.rows) ? data.rows : (Array.isArray(data.items) ? data.items : []);
    if (!columns.length || !rows.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">Table needs columns and rows.</div>`;
        return wrap;
    }
    wrap.innerHTML = `<table class="onyx-custom-table">
        <thead><tr>${columns.map(c => `<th>${_onyxEscHtml(typeof c === 'string' ? c : (c.label || c.key || ''))}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${columns.map(c => {
            const key = typeof c === 'string' ? c : (c.key || c.label || '');
            const val = (typeof r === 'object' && r) ? r[key] : '';
            return `<td>${_onyxEscHtml(String(val ?? ''))}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
    </table>`;
    return wrap;
}

// ── Custom grid sub-renderer ──
function _buildCustomGrid(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-service-grid';
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">No items provided.</div>`;
        return wrap;
    }
    wrap.innerHTML = items.map((it, i) => {
        const color = _onyxColorClass(i);
        const icon = _onyxResolveIcon(it.icon || it.emoji || '');
        const title = it.title || it.name || it.label || '';
        const desc = it.description || it.desc || it.value || '';
        return `<div class="onyx-service-card">
            ${icon ? `<div class="onyx-svc-icon onyx-bg-${color}">${icon}</div>` : ''}
            ${title ? `<div class="onyx-svc-title">${_onyxEscHtml(String(title))}</div>` : ''}
            ${desc ? `<div class="onyx-svc-desc">${_onyxEscHtml(String(desc))}</div>` : ''}
        </div>`;
    }).join('');
    return wrap;
}

// ── Custom freeform sub-renderer: render whatever fields the AI provided ──
function _buildCustomFreeform(data) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-custom-freeform';
    const skipKeys = new Set(['component', 'layout', 'type', 'title', 'heading', 'subtitle', 'description', 'footer']);
    const entries = Object.entries(data).filter(([k]) => !skipKeys.has(k));
    if (!entries.length) {
        wrap.innerHTML = `<div class="onyx-empty-hint">Empty custom card.</div>`;
        return wrap;
    }
    wrap.innerHTML = entries.map(([k, v]) => {
        let valHtml;
        if (v === null || v === undefined) valHtml = '<span class="onyx-empty-hint">—</span>';
        else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') valHtml = _onyxEscHtml(String(v));
        else if (Array.isArray(v)) {
            // If it's an array of primitives, render as chips. If objects, render as a mini table.
            const allPrimitive = v.every(x => typeof x !== 'object' || x === null);
            if (allPrimitive) {
                valHtml = `<div class="onyx-chips">${v.map((x, i) => `<span class="onyx-chip onyx-bg-${_onyxColorClass(i)}" style="color:#fff">${_onyxEscHtml(String(x))}</span>`).join('')}</div>`;
            } else {
                // Render array of objects as rows
                valHtml = `<div class="onyx-free-arr">${v.map(x => {
                    if (typeof x === 'object' && x !== null) {
                        const inner = Object.entries(x).map(([ik, iv]) => `<span class="onyx-free-sub"><b>${_onyxEscHtml(ik)}:</b> ${_onyxEscHtml(String(iv))}</span>`).join(' ');
                        return `<div class="onyx-free-arr-row">${inner}</div>`;
                    }
                    return `<div class="onyx-free-arr-row">${_onyxEscHtml(String(x))}</div>`;
                }).join('')}</div>`;
            }
        }
        else if (typeof v === 'object') {
            // Render nested object as inline key/value pairs instead of "{...}"
            const inner = Object.entries(v).map(([ik, iv]) => {
                const ivStr = (typeof iv === 'object' && iv !== null) ? JSON.stringify(iv) : String(iv);
                return `<span class="onyx-free-sub"><b>${_onyxEscHtml(ik)}:</b> ${_onyxEscHtml(ivStr)}</span>`;
            }).join(' ');
            valHtml = `<div class="onyx-free-obj">${inner}</div>`;
        }
        else valHtml = `<pre class="onyx-thinking-pre">${_onyxEscHtml(JSON.stringify(v, null, 2))}</pre>`;
        return `<div class="onyx-free-row"><span class="onyx-free-key">${_onyxEscHtml(k.replace(/_/g, ' '))}</span><span class="onyx-free-val">${valHtml}</span></div>`;
    }).join('');
    return wrap;
}

// ── Unlimited Component Registry ──
// Anyone can register new component types: ONYX_CARD_RENDERERS['my-type'] = fn(container, data)
window.ONYX_CARD_RENDERERS = {};

// Register built-in component renderers
ONYX_CARD_RENDERERS['service-grid'] = _renderServiceGrid;
ONYX_CARD_RENDERERS['content-strategy'] = _renderContentStrategy;
ONYX_CARD_RENDERERS['exam-plan'] = _renderExamPlan;
ONYX_CARD_RENDERERS['study-plan'] = _renderStudyPlan;
ONYX_CARD_RENDERERS['stat-cards'] = _renderStatCards;
ONYX_CARD_RENDERERS['data-table'] = _renderDataTable;
ONYX_CARD_RENDERERS['checklist'] = _renderChecklist;
ONYX_CARD_RENDERERS['timeline'] = _renderTimeline;
ONYX_CARD_RENDERERS['schedule'] = _renderSchedule;
ONYX_CARD_RENDERERS['command-output'] = _renderCommandOutput;
ONYX_CARD_RENDERERS['bash'] = _renderCommandOutput;
ONYX_CARD_RENDERERS['code-run'] = _renderCommandOutput;
ONYX_CARD_RENDERERS['terminal'] = _renderCommandOutput;
ONYX_CARD_RENDERERS['progress'] = _renderProgressCard;
ONYX_CARD_RENDERERS['comparison'] = _renderComparisonCard;
ONYX_CARD_RENDERERS['feature-list'] = _renderFeatureList;
// info-card removed — AI now uses feature-list or dynamic fallback instead
// This prevents empty info-cards from appearing in the chat
ONYX_CARD_RENDERERS['alert'] = _renderAlertCard;
ONYX_CARD_RENDERERS['weather'] = _renderWeatherCard;
ONYX_CARD_RENDERERS['profile'] = _renderProfileCard;
ONYX_CARD_RENDERERS['pricing'] = _renderPricingCard;
ONYX_CARD_RENDERERS['testimonial'] = _renderTestimonialCard;
ONYX_CARD_RENDERERS['faq'] = _renderFaqCard;
ONYX_CARD_RENDERERS['kanban'] = _renderKanbanCard;
ONYX_CARD_RENDERERS['metric'] = _renderMetricCard;
ONYX_CARD_RENDERERS['code-snippet'] = _renderCodeSnippetCard;
ONYX_CARD_RENDERERS['api-endpoint'] = _renderApiEndpointCard;

// New: Todo list + counterfactual reasoning cards (JSON-backed via tools)
ONYX_CARD_RENDERERS['todo-list'] = _renderTodoListCard;
ONYX_CARD_RENDERERS['todo-index'] = _renderTodoListCard;
ONYX_CARD_RENDERERS['counterfactual'] = _renderCounterfactualCard;
ONYX_CARD_RENDERERS['counterfactual-index'] = _renderCounterfactualCard;

// New: Custom card — AI creates any layout (chart/bars/planning/tracking/stats/table/grid/freeform)
ONYX_CARD_RENDERERS['custom-card'] = _renderCustomCard;
ONYX_CARD_RENDERERS['custom'] = _renderCustomCard;

// ── Interactive Q&A Card ──
// Renders a card with questions, 4 selectable options + custom answer
// After answering all questions, formats them into a prompt and auto-sends to AI
ONYX_CARD_RENDERERS['interactive-qa'] = _renderInteractiveQACard;
ONYX_CARD_RENDERERS['qa-prompt'] = _renderInteractiveQACard;
ONYX_CARD_RENDERERS['quiz'] = _renderInteractiveQACard;

function _renderInteractiveQACard(container, data) {
    const questions = data.questions || [];
    const context = data.context || data.mode || ''; // e.g. "brainstorming", "studying"
    const autoSubmit = data.auto_submit !== false; // default true
    const submitLabel = data.submit_label || 'Submit Answers & Continue';

    if (!questions.length) { _renderGenericCard(container, data); return; }

    const card = document.createElement('div');
    card.className = 'onyx-qa-card';

    // Badge
    if (data.title || context) {
        const badge = document.createElement('div');
        badge.className = 'onyx-qa-badge';
        const contextIcons = {
            'brainstorming': '💡', 'studying': '📚', 'planning': '📋',
            'debugging': '🔧', 'researching': '🔍', 'analyzing': '📊',
            'quiz': '❓', 'review': '📝', 'design': '🎨'
        };
        const ctxIcon = contextIcons[(context || '').toLowerCase()] || '💬';
        badge.innerHTML = `${ctxIcon} ${_onyxEscHtml(data.title || context || 'Interactive')}`;
        card.appendChild(badge);
    }

    // Track answers
    const answers = {};
    const totalQ = questions.length;
    let currentQ = 0;

    // Step indicator: "Question 1 of 5"
    const stepEl = document.createElement('div');
    stepEl.className = 'onyx-qa-step';
    card.appendChild(stepEl);

    // Question container (only one shown at a time)
    const qContainer = document.createElement('div');
    qContainer.className = 'onyx-qa-question-container';
    card.appendChild(qContainer);

    // Progress bar
    const progressWrap = document.createElement('div');
    progressWrap.className = 'onyx-qa-progress';
    progressWrap.innerHTML = `
        <span class="onyx-qa-progress-text">0 of ${totalQ} answered</span>
        <div class="onyx-qa-progress-bar"><div class="onyx-qa-progress-fill" style="width:0%"></div></div>
    `;
    card.appendChild(progressWrap);

    // Navigation row (Next / Submit)
    const navRow = document.createElement('div');
    navRow.className = 'onyx-qa-nav';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'onyx-qa-next';
    nextBtn.disabled = true;
    nextBtn.innerHTML = currentQ < totalQ - 1 ? 'Next <i class="fas fa-arrow-right" style="font-size:11px;margin-left:4px"></i>' : (submitLabel + ' <i class="fas fa-check" style="font-size:11px;margin-left:4px"></i>');
    nextBtn.addEventListener('click', () => {
        if (currentQ < totalQ - 1) {
            currentQ++;
            renderQuestion(currentQ);
        } else {
            _submitQAAnswers(card, answers, questions, data, autoSubmit);
        }
    });
    navRow.appendChild(nextBtn);
    card.appendChild(navRow);

    function renderQuestion(qi) {
        qContainer.innerHTML = '';
        const q = questions[qi];

        // Update step
        stepEl.textContent = `Question ${qi + 1} of ${totalQ}`;

        const qDiv = document.createElement('div');
        qDiv.className = 'onyx-qa-question onyx-qa-question-active';
        qDiv.dataset.qIndex = qi;

        const qText = document.createElement('div');
        qText.className = 'onyx-qa-q-text';
        qText.innerHTML = `${_onyxEscHtml(q.question || q.text || q.title || '')}`;
        qDiv.appendChild(qText);

        // Options
        const options = q.options || q.choices || [];
        if (options.length > 0) {
            const optDiv = document.createElement('div');
            optDiv.className = 'onyx-qa-options';
            options.forEach((opt, oi) => {
                const btn = document.createElement('button');
                btn.className = 'onyx-qa-option';
                if (answers[qi] && answers[qi].type === 'option' && answers[qi].index === oi) {
                    btn.classList.add('onyx-qa-selected');
                }
                const optText = typeof opt === 'string' ? opt : (opt.text || opt.label || opt.value || '');
                btn.textContent = optText;
                btn.dataset.qi = qi;
                btn.dataset.oi = oi;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Deselect siblings
                    optDiv.querySelectorAll('.onyx-qa-option').forEach(b => b.classList.remove('onyx-qa-selected'));
                    btn.classList.add('onyx-qa-selected');
                    answers[qi] = { type: 'option', value: optText, index: oi };
                    // Clear custom input
                    const customInput = qDiv.querySelector('.onyx-qa-custom-input');
                    if (customInput) customInput.value = '';
                    _updateQAProgress(card, answers, totalQ, nextBtn, progressWrap, currentQ, totalQ);
                });
                optDiv.appendChild(btn);
            });
            qDiv.appendChild(optDiv);
        }

        // Custom answer input
        const customWrap = document.createElement('div');
        customWrap.className = 'onyx-qa-custom-wrap';
        const customInput = document.createElement('input');
        customInput.className = 'onyx-qa-custom-input';
        customInput.type = 'text';
        customInput.placeholder = q.custom_placeholder || 'Or type your own answer...';
        if (answers[qi] && answers[qi].type === 'custom') {
            customInput.value = answers[qi].value;
        }
        customInput.addEventListener('input', () => {
            if (customInput.value.trim()) {
                qDiv.querySelectorAll('.onyx-qa-option').forEach(b => b.classList.remove('onyx-qa-selected'));
                answers[qi] = { type: 'custom', value: customInput.value.trim() };
                _updateQAProgress(card, answers, totalQ, nextBtn, progressWrap, currentQ, totalQ);
            } else if (answers[qi] && answers[qi].type === 'custom') {
                delete answers[qi];
                _updateQAProgress(card, answers, totalQ, nextBtn, progressWrap, currentQ, totalQ);
            }
        });
        customWrap.appendChild(customInput);
        qDiv.appendChild(customWrap);

        qContainer.appendChild(qDiv);

        // Update next button state
        _updateQAProgress(card, answers, totalQ, nextBtn, progressWrap, currentQ, totalQ);

        // Update next button label
        if (qi < totalQ - 1) {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right" style="font-size:11px;margin-left:4px"></i>';
        } else {
            nextBtn.innerHTML = submitLabel + ' <i class="fas fa-check" style="font-size:11px;margin-left:4px"></i>';
        }
    }

    // Render first question
    renderQuestion(0);

    container.appendChild(card);
}

function _updateQAProgress(card, answers, total, navBtn, progressWrap, currentQ, totalQ) {
    const answered = Object.keys(answers).length;
    const pct = Math.round((answered / total) * 100);
    const fill = progressWrap.querySelector('.onyx-qa-progress-fill');
    const text = progressWrap.querySelector('.onyx-qa-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = `${answered} of ${total} answered`;
    // Enable Next/Submit only if current question is answered
    const currentAnswered = answers[currentQ] !== undefined;
    if (navBtn) navBtn.disabled = !currentAnswered;
}

function _submitQAAnswers(card, answers, questions, data, autoSubmit) {
    // Build result display
    const totalQ = questions.length;
    let resultHtml = '<div class="onyx-qa-result">';

    // Format answers into a structured prompt
    let promptParts = [];
    for (let i = 0; i < totalQ; i++) {
        const q = questions[i];
        const qText = q.question || q.text || q.title || '';
        const a = answers[i];
        if (a) {
            resultHtml += `<div style="margin-bottom:6px"><span style="opacity:0.5">Q${i+1}:</span> ${_onyxEscHtml(qText)} <span style="opacity:0.5">→</span> <strong>${_onyxEscHtml(a.value)}</strong></div>`;
            promptParts.push(`Q: ${qText}\nA: ${a.value}`);
        }
    }
    resultHtml += '</div>';

    // Replace the card content with result
    const navRow = card.querySelector('.onyx-qa-nav');
    if (navRow) navRow.remove();
    const qContainer = card.querySelector('.onyx-qa-question-container');
    if (qContainer) qContainer.remove();
    const stepEl = card.querySelector('.onyx-qa-step');
    if (stepEl) stepEl.remove();
    const progressEl = card.querySelector('.onyx-qa-progress');
    if (progressEl) progressEl.remove();
    const submitBtn = card.querySelector('.onyx-qa-submit');
    if (submitBtn) submitBtn.remove();
    const questionsEl = card.querySelectorAll('.onyx-qa-question');
    questionsEl.forEach(q => q.remove());
    const customInputs = card.querySelectorAll('.onyx-qa-custom-input');
    customInputs.forEach(i => i.parentElement.remove());

    card.insertAdjacentHTML('beforeend', resultHtml);

    // Auto-submit as a prompt to the AI
    if (autoSubmit && promptParts.length > 0) {
        const context = data.context || data.mode || '';
        const promptHeader = context
            ? `[${context.charAt(0).toUpperCase() + context.slice(1)} Session — User's Answers]\n\n`
            : '';
        const fullPrompt = promptHeader + promptParts.join('\n\n') + '\n\nBased on these answers, continue with the task.';

        // Show "Sending to AI..." indicator
        const sendingDiv = document.createElement('div');
        sendingDiv.style.cssText = 'margin-top:8px;font-size:11px;opacity:0.5;display:flex;align-items:center;gap:6px;';
        sendingDiv.innerHTML = '<i class="fas fa-paper-plane"></i> Sending to AI...';
        card.appendChild(sendingDiv);

        // Auto-send after a short delay
        setTimeout(() => {
            try {
                _sendQAPrompt(fullPrompt);
                sendingDiv.innerHTML = '<i class="fas fa-check" style="color:#22c55e"></i> Sent to AI!';
            } catch(e) {
                sendingDiv.innerHTML = '<i class="fas fa-exclamation" style="color:#ef4444"></i> Failed to send';
                console.warn('[OnyxQA] Auto-submit failed:', e);
            }
        }, 600);
    }
}

// Send a prompt to the AI chat as if the user typed it
function _sendQAPrompt(text) {
    // Use the global chatInput and sendBtn references
    const input = typeof chatInput !== 'undefined' ? chatInput : document.getElementById('chat-input');
    const btn = typeof sendBtn !== 'undefined' ? sendBtn : document.getElementById('send-btn');
    if (input) {
        // Set value using native setter to trigger React/state updates
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        // Click send
        if (btn) {
            setTimeout(() => btn.click(), 100);
        } else {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
    }
}

// ── New Component Renderers ──

// Command/Terminal Output
function _renderCommandOutput(container, data) {
    const cmd = data.command || data.cmd || '';
    const output = data.output || data.result || '';
    const exitCode = data.exit_code !== undefined ? data.exit_code : data.exit;
    const cwd = data.cwd || data.directory || '';
    const duration = data.duration || data.time || '';

    const wrap = document.createElement('div');
    wrap.className = 'onyx-terminal';
    let html = '';
    if (cmd) {
        html += `<div class="onyx-terminal-prompt">
            <span class="onyx-terminal-dollar">$</span>
            <span class="onyx-terminal-cmd">${_onyxEscHtml(cmd)}</span>
        </div>`;
    }
    if (cwd) {
        html += `<div class="onyx-terminal-cwd">${_onyxEscHtml(cwd)}</div>`;
    }
    if (output) {
        html += `<pre class="onyx-terminal-output">${_onyxEscHtml(output)}</pre>`;
    }
    if (exitCode !== undefined) {
        const isSuccess = exitCode === 0 || exitCode === '0';
        html += `<div class="onyx-terminal-exit ${isSuccess ? 'onyx-exit-ok' : 'onyx-exit-err'}">
            Exit: ${_onyxEscHtml(String(exitCode))}${duration ? ' • ' + _onyxEscHtml(duration) : ''}
        </div>`;
    }
    wrap.innerHTML = html;
    container.appendChild(wrap);
}

// Progress Card
function _renderProgressCard(container, data) {
    const steps = data.steps || data.items || [];
    const pct = data.percent || data.progress || 0;
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    if (pct > 0) {
        const bar = document.createElement('div');
        bar.className = 'onyx-progress';
        bar.innerHTML = `
            <div class="onyx-progress-label"><span>${_onyxEscHtml(data.label || 'Progress')}</span><span>${Math.min(100,pct)}%</span></div>
            <div class="onyx-progress-bar"><div class="onyx-progress-fill onyx-bg-blue" style="width:${Math.min(100,pct)}%"></div></div>
        `;
        body.appendChild(bar);
    }
    if (steps.length) {
        const list = document.createElement('div');
        list.className = 'onyx-schedule-list';
        steps.forEach((s, i) => {
            const done = s.done || s.completed || false;
            const color = done ? 'green' : _onyxColorClass(i);
            const el = document.createElement('div');
            el.className = 'onyx-schedule-item';
            el.innerHTML = `
                <div class="onyx-schedule-dot onyx-dot-${color}"></div>
                <div class="onyx-schedule-task" style="${done ? 'text-decoration:line-through;opacity:0.5' : ''}">${_onyxEscHtml(typeof s === 'string' ? s : (s.title || s.task || s.label || ''))}</div>
            `;
            list.appendChild(el);
        });
        body.appendChild(list);
    }
    container.appendChild(body);
}

// Comparison Card
function _renderComparisonCard(container, data) {
    const cols = data.columns || data.options || data.items || [];
    if (!cols.length) { _renderGenericCard(container, data); return; }

    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;';
    cols.forEach((col, i) => {
        const color = _onyxColorClass(i);
        const el = document.createElement('div');
        el.className = 'onyx-service-card';
        const title = col.title || col.name || col.label || '';
        const features = col.features || col.items || [];
        let featHtml = features.map(f => `<div style="font-size:11px;color:rgba(255,255,255,0.5);padding:3px 0">${typeof f === 'string' ? _onyxEscHtml(f) : _onyxEscHtml(f.text || f.title || '')}</div>`).join('');
        el.innerHTML = `
            <div class="onyx-svc-icon onyx-bg-${color}" style="font-size:12px;font-weight:700">${_onyxEscHtml(title.charAt(0).toUpperCase())}</div>
            <div class="onyx-svc-title">${_onyxEscHtml(title)}</div>
            ${col.price ? `<span class="onyx-svc-price ${_onyxPriceClass(i)}">${_onyxEscHtml(col.price)}</span>` : ''}
            <div style="margin-top:8px">${featHtml}</div>
        `;
        grid.appendChild(el);
    });
    body.appendChild(grid);
    container.appendChild(body);
}

// Feature List
function _renderFeatureList(container, data) {
    const features = data.features || data.items || [];
    if (!features.length) { _renderGenericCard(container, data); return; }

    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const list = document.createElement('div');
    list.className = 'onyx-checklist';
    features.forEach((f, i) => {
        const text = typeof f === 'string' ? f : (f.title || f.text || f.name || '');
        // Resolve icon names ("book"/"code"/etc.) to emojis/SVGs; never leak raw text.
        const rawIcon = (typeof f === 'object' && f) ? (f.icon || f.emoji || '') : '';
        const icon = rawIcon ? _onyxResolveIcon(rawIcon) : '';
        const color = _onyxColorClass(i);
        const el = document.createElement('div');
        el.className = 'onyx-check-item';
        el.innerHTML = `
            <div class="onyx-svc-icon onyx-bg-${color}" style="width:22px;height:22px;border-radius:6px;font-size:11px">${icon || '✓'}</div>
            <span class="onyx-check-text">${_onyxEscHtml(text)}</span>
        `;
        list.appendChild(el);
    });
    body.appendChild(list);
    container.appendChild(body);
}

// Info Card
function _renderInfoCard(container, data) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const fields = data.fields || data.items || [];
    if (fields.length) {
        const grid = document.createElement('div');
        grid.className = 'onyx-stat-grid';
        fields.forEach((f, i) => {
            const el = document.createElement('div');
            el.className = 'onyx-stat-card';
            el.innerHTML = `
                <div class="onyx-stat-value">${_onyxEscHtml(String(f.value || f.number || '—'))}</div>
                <div class="onyx-stat-label">${_onyxEscHtml(f.label || f.title || '')}</div>
            `;
            grid.appendChild(el);
        });
        body.appendChild(grid);
    } else {
        _renderGenericCard(body, data);
    }
    container.appendChild(body);
}

// Alert Card
function _renderAlertCard(container, data) {
    const level = data.level || data.type || 'info';
    const levelColors = { info: 'blue', warning: 'yellow', error: 'red', success: 'green' };
    const color = levelColors[level] || 'blue';
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    body.innerHTML = `
        <div class="onyx-phase-card onyx-phase-${color}" style="margin:0">
            <div class="onyx-phase-info">
                <h4>${_onyxEscHtml(data.title || level.toUpperCase())}</h4>
                <p>${_onyxEscHtml(data.message || data.description || data.content || '')}</p>
            </div>
        </div>
    `;
    container.appendChild(body);
}

// Weather Card
function _renderWeatherCard(container, data) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const temp = data.temperature || data.temp || '';
    const condition = data.condition || data.status || '';
    const location = data.location || data.city || '';
    const icon = _onyxResolveIcon(data.icon || '') || '☁️';
    body.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;padding:8px 0">
            <div style="font-size:40px">${icon}</div>
            <div>
                <div style="font-size:28px;font-weight:700">${_onyxEscHtml(String(temp))}${temp ? '°' : ''}</div>
                <div style="font-size:13px;opacity:0.7">${_onyxEscHtml(condition)}</div>
                ${location ? `<div style="font-size:11px;opacity:0.5">${_onyxEscHtml(location)}</div>` : ''}
            </div>
        </div>
    `;
    const forecast = data.forecast || data.days || [];
    if (forecast.length) {
        const grid = document.createElement('div');
        grid.className = 'onyx-daily-grid';
        forecast.forEach((d, i) => {
            const dIcon = _onyxResolveIcon((typeof d === 'object' && d) ? (d.icon || d.emoji || '') : '') || '';
            const el = document.createElement('div');
            el.className = 'onyx-daily-card';
            el.innerHTML = `
                <div class="onyx-daily-day">${_onyxEscHtml(d.day || d.label || '')}</div>
                <div style="font-size:16px;margin:4px 0">${dIcon}</div>
                <div style="font-size:12px;opacity:0.7">${_onyxEscHtml(String(d.temp || d.high || ''))}${(d.temp || d.high) ? '°' : ''}</div>
            `;
            grid.appendChild(el);
        });
        body.appendChild(grid);
    }
    container.appendChild(body);
}

// Profile Card
function _renderProfileCard(container, data) {
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const name = data.name || data.title || '';
    const role = data.role || data.position || '';
    // Don't use data.title for role — that duplicates the name as the role.
    const avatar = data.avatar || data.image || '';
    const bio = data.bio || data.description || '';
    const stats = data.stats || [];
    const links = data.links || data.social || [];

    // Decide whether avatar is a usable image URL/path. If not, fall back to initial-letter.
    // Fixes "invalid image" errors when AI sends e.g. avatar: "robot" or a made-up filename.
    const isImgUrl = (v) =>
        typeof v === 'string' && v.length > 0 &&
        /^(https?:\/\/|\/|data:image\/|blob:)/i.test(v) ||
        /\.(?:png|jpe?g|gif|webp|bmp|svg|avif|ico)(\?.*)?$/i.test(v || '');
    const safeAvatar = isImgUrl(avatar) ? avatar.replace(/"/g, '&quot;') : '';
    const initial = (Array.from(name || '')[0] || '?').toUpperCase();

    body.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
            ${safeAvatar
                ? `<img src="${safeAvatar}" alt="${_onyxEscHtml(name)}" style="width:48px;height:48px;border-radius:50%;object-fit:cover" ` +
                  `onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'onyx-svc-icon onyx-bg-blue',style:'width:48px;height:48px;border-radius:50%;font-size:20px;display:flex;align-items:center;justify-content:center',textContent:'${initial}'}))">`
                : `<div class="onyx-svc-icon onyx-bg-blue" style="width:48px;height:48px;border-radius:50%;font-size:20px">${_onyxEscHtml(initial)}</div>`}
            <div>
                <div style="font-size:15px;font-weight:700">${_onyxEscHtml(name)}</div>
                ${role ? `<div style="font-size:12px;opacity:0.6">${_onyxEscHtml(role)}</div>` : ''}
            </div>
        </div>
        ${bio ? `<div style="font-size:12px;opacity:0.6;margin-top:8px;line-height:1.5">${_onyxEscHtml(bio)}</div>` : ''}
    `;
    if (stats.length) {
        const grid = document.createElement('div');
        grid.className = 'onyx-stat-grid';
        stats.forEach((s, i) => {
            const el = document.createElement('div');
            el.className = 'onyx-stat-card';
            el.innerHTML = `
                <div class="onyx-stat-value">${_onyxEscHtml(String(s.value || ''))}</div>
                <div class="onyx-stat-label">${_onyxEscHtml(s.label || '')}</div>
            `;
            grid.appendChild(el);
        });
        body.appendChild(grid);
    }
    container.appendChild(body);
}

// Pricing Card
function _renderPricingCard(container, data) {
    const plans = data.plans || data.items || [];
    if (!plans.length) { _renderGenericCard(container, data); return; }
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;';
    plans.forEach((p, i) => {
        const color = _onyxColorClass(i);
        const el = document.createElement('div');
        el.className = 'onyx-service-card';
        const features = p.features || [];
        const featHtml = features.map(f => `<div style="font-size:11px;opacity:0.6;padding:2px 0">• ${_onyxEscHtml(typeof f === 'string' ? f : (f.text || f.title || ''))}</div>`).join('');
        el.innerHTML = `
            ${p.popular ? '<div style="font-size:10px;font-weight:700;color:#22c55e;margin-bottom:4px">★ POPULAR</div>' : ''}
            <div class="onyx-svc-title">${_onyxEscHtml(p.title || p.name || '')}</div>
            <div style="font-size:20px;font-weight:700;margin:6px 0">${_onyxEscHtml(p.price || '')}<span style="font-size:11px;font-weight:400;opacity:0.5">${_onyxEscHtml(p.period || '')}</span></div>
            <div>${featHtml}</div>
        `;
        grid.appendChild(el);
    });
    body.appendChild(grid);
    container.appendChild(body);
}

// Testimonial Card
function _renderTestimonialCard(container, data) {
    const testimonials = data.testimonials || data.items || [];
    if (!testimonials.length) { _renderGenericCard(container, data); return; }
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    testimonials.forEach((t, i) => {
        const name = t.name || t.author || '';
        const text = t.text || t.content || t.quote || '';
        const rating = t.rating || t.stars || 0;
        const el = document.createElement('div');
        el.className = 'onyx-service-card';
        el.style.marginBottom = '8px';
        const stars = '★'.repeat(Math.min(5, rating)) + '☆'.repeat(Math.max(0, 5 - rating));
        el.innerHTML = `
            <div style="font-size:12px;color:#eab308;margin-bottom:6px">${stars}</div>
            <div style="font-size:12px;opacity:0.7;line-height:1.5;font-style:italic">"${_onyxEscHtml(text)}"</div>
            <div style="font-size:11px;font-weight:600;margin-top:8px">${_onyxEscHtml(name)}</div>
        `;
        body.appendChild(el);
    });
    container.appendChild(body);
}

// FAQ Card
function _renderFaqCard(container, data) {
    const faqs = data.faqs || data.items || data.questions || [];
    if (!faqs.length) { _renderGenericCard(container, data); return; }
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    faqs.forEach((faq, i) => {
        const q = faq.question || faq.q || faq.title || '';
        const a = faq.answer || faq.a || faq.content || '';
        const el = document.createElement('div');
        el.className = 'onyx-check-item';
        el.style.cssText = 'flex-direction:column;align-items:flex-start;cursor:pointer';
        el.innerHTML = `
            <div style="font-weight:600;font-size:13px;width:100%">${_onyxEscHtml(q)}</div>
            <div class="onyx-faq-answer" style="font-size:12px;opacity:0.6;margin-top:6px;display:none;line-height:1.5">${_onyxEscHtml(a)}</div>
        `;
        el.onclick = function() {
            const ans = el.querySelector('.onyx-faq-answer');
            ans.style.display = ans.style.display === 'none' ? 'block' : 'none';
        };
        body.appendChild(el);
    });
    container.appendChild(body);
}

// Kanban Card
function _renderKanbanCard(container, data) {
    const columns = data.columns || data.lanes || [];
    if (!columns.length) { _renderGenericCard(container, data); return; }
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;';
    columns.forEach((col, i) => {
        const color = _onyxColorClass(i);
        const el = document.createElement('div');
        el.className = 'onyx-service-card';
        const items = col.items || col.cards || [];
        const itemsHtml = items.map(item => `<div style="font-size:11px;opacity:0.6;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)">${_onyxEscHtml(typeof item === 'string' ? item : (item.title || item.text || ''))}</div>`).join('');
        el.innerHTML = `
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px" class="onyx-dot-${color}">${_onyxEscHtml(col.title || col.name || '')}</div>
            <div>${itemsHtml}</div>
        `;
        grid.appendChild(el);
    });
    body.appendChild(grid);
    container.appendChild(body);
}

// Metric Card
function _renderMetricCard(container, data) {
    _renderStatCards(container, data);
}

// Code Snippet Card
function _renderCodeSnippetCard(container, data) {
    const code = data.code || data.snippet || data.content || '';
    const language = data.language || data.lang || '';
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    body.innerHTML = `
        ${language ? `<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;opacity:0.4;margin-bottom:6px">${_onyxEscHtml(language)}</div>` : ''}
        <pre style="background:rgba(0,0,0,0.06);border-radius:8px;padding:12px;overflow-x:auto;font-size:12px;line-height:1.5;margin:0">${_onyxEscHtml(code)}</pre>
    `;
    container.appendChild(body);
}

// API Endpoint Card
function _renderApiEndpointCard(container, data) {
    const method = (data.method || 'GET').toUpperCase();
    const path = data.path || data.endpoint || data.url || '';
    const desc = data.description || data.desc || '';
    const methodColors = { GET: 'green', POST: 'blue', PUT: 'orange', PATCH: 'yellow', DELETE: 'red' };
    const color = methodColors[method] || 'blue';
    const body = document.createElement('div');
    body.className = 'onyx-card-body';
    const params = data.parameters || data.params || [];
    const response = data.response || data.example || '';
    body.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span class="onyx-chip onyx-bg-${color}" style="font-size:10px;font-weight:700;padding:3px 8px">${_onyxEscHtml(method)}</span>
            <code style="font-size:13px;font-weight:600">${_onyxEscHtml(path)}</code>
        </div>
        ${desc ? `<div style="font-size:12px;opacity:0.6;margin-bottom:8px">${_onyxEscHtml(desc)}</div>` : ''}
    `;
    if (params.length) {
        const table = document.createElement('div');
        table.className = 'onyx-table';
        let html = '<table><thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead><tbody>';
        params.forEach(p => {
            const name = typeof p === 'string' ? p : (p.name || p.key || '');
            const type = typeof p === 'object' ? (p.type || '') : '';
            const req = typeof p === 'object' ? (p.required ? 'Yes' : 'No') : '';
            html += `<tr><td>${_onyxEscHtml(name)}</td><td>${_onyxEscHtml(type)}</td><td>${_onyxEscHtml(req)}</td></tr>`;
        });
        html += '</tbody></table>';
        table.innerHTML = html;
        body.appendChild(table);
    }
    if (response) {
        body.innerHTML += `<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;opacity:0.4;margin-top:8px">Response</div>
        <pre style="background:rgba(0,0,0,0.06);border-radius:8px;padding:10px;overflow-x:auto;font-size:11px;margin-top:4px">${_onyxEscHtml(typeof response === 'string' ? response : JSON.stringify(response, null, 2))}</pre>`;
    }
    container.appendChild(body);
}

// ── Upgrade old-style .agent-tool-step elements to beautiful onyx-tool-cards ──
// Called after history replay renders the DOM, so refresh preserves the beautiful cards
function _upgradeToolStepsToCards(container) {
    const toolSteps = container.querySelectorAll('.agent-tool-step');
    if (toolSteps.length === 0) return;

    toolSteps.forEach(step => {
        try {
            const nameEl = step.querySelector('.tool-name');
            const toolName = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
            const isError = step.classList.contains('tool-failed');

            // ── Skip beautiful cards for command/bash tools ──
            const isCmd = ['bash','shell','terminal','cmd','command','exec','run'].includes(toolName);
            if (isCmd) return;  // Keep the old-style tool step as-is

            // Extract args from the Input section
            const inputPre = step.querySelector('.tool-detail-section:first-child .tool-detail-content');
            let args = {};
            if (inputPre) {
                try {
                    const inputText = inputPre.textContent.trim();
                    // Try parsing as JSON first
                    if (inputText.startsWith('{')) {
                        args = JSON.parse(inputText);
                    } else {
                        // Parse key: value format
                        inputText.split('\n').forEach(line => {
                            const colonIdx = line.indexOf(':');
                            if (colonIdx > 0) {
                                const key = line.slice(0, colonIdx).trim();
                                let val = line.slice(colonIdx + 1).trim();
                                // Try to parse value as JSON
                                try { val = JSON.parse(val); } catch(_) {}
                                args[key] = val;
                            }
                        });
                    }
                } catch(_) {}
            }

            // Extract output from the Output section
            const outputPre = step.querySelector('.tool-output-section .tool-detail-content');
            let output = outputPre ? outputPre.textContent : '';
            let result = output;

            // Try to parse structured result
            if (output) {
                try {
                    const parsed = JSON.parse(output);
                    if (typeof parsed === 'object') result = parsed;
                } catch(_) {}
            }

            // Build the beautiful tool card
            const item = {
                tool: nameEl ? nameEl.textContent.trim() : toolName,
                execution_time: undefined
            };

            const card = _buildToolCard(toolName, args, result, isError, item);
            card.classList.add('onyx-card-appear');
            step.replaceWith(card);
        } catch(e) {
            console.warn('[OnyxCard] Failed to upgrade tool step:', e);
            // Keep the old step as-is if upgrade fails
        }
    });
}

// ── Streaming card detection & rendering (legacy, kept for compatibility) ──
function _tryRenderStreamingCards(container) {
    // Now called directly — kept as alias for any remaining references
    _addCodeBlockHeaders(container);
    _restoreCachedCards(container);
    _addCustomJsonCards(container);
}

// ── Build a beautiful collapsible card for any tool ──
function _buildToolCard(toolName, args, result, isError, item) {
    const wrap = document.createElement('div');
    wrap.className = 'onyx-tool-card' + (isError ? ' onyx-tool-error' : '');
    wrap.dataset.onyxToolCard = 'true';  // Robust marker for skipping by other pipelines
    
    // Determine tool category and icon
    const toolMeta = _getToolMeta(toolName);
    
    // Try to detect if result is card JSON
    let resultStr = '';
    if (result && typeof result === 'object') {
        resultStr = result.output || result.stdout || result.content || '';
        // Check if result itself is a card
        if (result.component) {
            try { return _buildOnyxCard(result); } catch(_) {}
        }
    } else {
        resultStr = result ? String(result) : '';
    }
    // Also check if string result is card JSON
    try {
        const parsed = JSON.parse(resultStr);
        if (parsed && parsed.component) {
            try { return _buildOnyxCard(parsed); } catch(_) {}
        }
    } catch(_) {}

    // Parse result for structured data
    let output = resultStr;
    let exitCode = undefined;
    if (result && typeof result === 'object') {
        output = result.output || result.stdout || result.content || result.result || result.message || '';
        if (typeof output === 'object') output = JSON.stringify(output, null, 2);
        exitCode = result.exit_code !== undefined ? result.exit_code : result.exit;
        if (exitCode === undefined) exitCode = isError ? 1 : 0;
    }

    // ── Header (always visible, clickable to expand) ──
    const header = document.createElement('div');
    header.className = 'onyx-tool-card-header';
    header.innerHTML = `
        <div class="onyx-tool-card-left">
            <i class="${toolMeta.icon}" style="color:${toolMeta.color};font-size:12px;"></i>
            <span class="onyx-tool-card-name">${_onyxEscHtml(item.tool || toolName)}</span>
            <span class="onyx-tool-card-badge ${isError ? 'onyx-badge-error' : 'onyx-badge-ok'}">
                <i class="fas ${isError ? 'fa-times' : 'fa-check'}" style="font-size:8px;"></i>
                ${isError ? 'Error' : 'OK'}
            </span>
            ${item.execution_time !== undefined ? `<span class="onyx-tool-card-time">${item.execution_time}s</span>` : ''}
        </div>
        <div class="onyx-tool-card-right">
            <span class="onyx-tool-card-summary">${_onyxEscHtml(_getToolSummary(toolName, args, output))}</span>
            <i class="fas fa-chevron-right onyx-tool-card-chevron"></i>
        </div>
    `;

    // ── Body (collapsed by default) ──
    const body = document.createElement('div');
    body.className = 'onyx-tool-card-body';
    body.style.display = 'none';

    // Build body content based on tool type
    _renderToolBody(body, toolName, args, output, exitCode, isError, item, toolMeta);

    // Toggle collapse
    header.addEventListener('click', () => {
        const expanded = body.style.display !== 'none';
        body.style.display = expanded ? 'none' : 'block';
        header.classList.toggle('onyx-tool-expanded', !expanded);
    });

    wrap.appendChild(header);
    wrap.appendChild(body);
    return wrap;
}

// ── Tool metadata (icon, color) ──
function _getToolMeta(name) {
    const metas = {
        'bash': { icon: 'fas fa-terminal', color: '#22c55e' },
        'shell': { icon: 'fas fa-terminal', color: '#22c55e' },
        'terminal': { icon: 'fas fa-terminal', color: '#22c55e' },
        'cmd': { icon: 'fas fa-terminal', color: '#22c55e' },
        'command': { icon: 'fas fa-terminal', color: '#22c55e' },
        'read': { icon: 'fas fa-file-alt', color: '#3b82f6' },
        'file_read': { icon: 'fas fa-file-alt', color: '#3b82f6' },
        'write': { icon: 'fas fa-file-edit', color: '#8b5cf6' },
        'file_write': { icon: 'fas fa-file-edit', color: '#8b5cf6' },
        'edit': { icon: 'fas fa-pen', color: '#f59e0b' },
        'file_edit': { icon: 'fas fa-pen', color: '#f59e0b' },
        'ls': { icon: 'fas fa-folder-open', color: '#f97316' },
        'dir': { icon: 'fas fa-folder-open', color: '#f97316' },
        'list': { icon: 'fas fa-folder-open', color: '#f97316' },
        'browser': { icon: 'fas fa-globe', color: '#06b6d4' },
        'browser_action': { icon: 'fas fa-globe', color: '#06b6d4' },
        'web_fetch': { icon: 'fas fa-cloud-download-alt', color: '#0ea5e9' },
        'web_search': { icon: 'fas fa-search', color: '#6366f1' },
        'search': { icon: 'fas fa-search', color: '#6366f1' },
        'memory': { icon: 'fas fa-brain', color: '#ec4899' },
        'vision': { icon: 'fas fa-eye', color: '#14b8a6' },
        'env_config': { icon: 'fas fa-cog', color: '#64748b' },
        'scheduler': { icon: 'fas fa-clock', color: '#a855f7' },
        'schedule': { icon: 'fas fa-clock', color: '#a855f7' },
        'send': { icon: 'fas fa-paper-plane', color: '#22c55e' },
        'send_file': { icon: 'fas fa-paper-plane', color: '#22c55e' },
    };
    return metas[name] || { icon: 'fas fa-cube', color: '#64748b' };
}

// ── One-line summary shown in collapsed header ──
function _getToolSummary(toolName, args, output) {
    const n = toolName.toLowerCase();
    if (['bash','shell','terminal','cmd','command','exec','run'].includes(n)) {
        return args.command || args.cmd || '';
    }
    if (['read','file_read'].includes(n)) return args.file_path || args.path || args.filename || '';
    if (['write','file_write'].includes(n)) return args.file_path || args.path || args.filename || '';
    if (['edit','file_edit'].includes(n)) return args.file_path || args.path || args.filename || '';
    if (['ls','dir','list'].includes(n)) return args.path || args.directory || '';
    if (['browser','browser_action'].includes(n)) return args.url || args.action || '';
    if (['web_fetch','web_search','search'].includes(n)) return args.url || args.query || '';
    if (n === 'memory') return args.query || args.action || '';
    if (n === 'vision') return args.prompt || 'Image analysis';
    if (n === 'env_config') return args.key || '';
    if (['scheduler','schedule'].includes(n)) return args.task || args.action || '';
    if (['send','send_file'].includes(n)) return args.file || args.path || '';
    // Generic
    const firstKey = Object.keys(args)[0];
    return firstKey ? args[firstKey] : '';
}

// ── Render tool-specific body content ──
function _renderToolBody(body, toolName, args, output, exitCode, isError, item, meta) {
    const n = toolName.toLowerCase();
    
    if (['bash','shell','terminal','cmd','command','exec','run'].includes(n)) {
        // Command-output style
        const term = document.createElement('div');
        term.className = 'onyx-terminal';
        let html = '';
        const cmd = args.command || args.cmd || '';
        if (cmd) {
            html += `<div class="onyx-terminal-prompt">
                <span class="onyx-terminal-dollar">$</span>
                <span class="onyx-terminal-cmd">${_onyxEscHtml(cmd)}</span>
            </div>`;
        }
        if (args.cwd || args.directory) {
            html += `<div class="onyx-terminal-cwd">${_onyxEscHtml(args.cwd || args.directory)}</div>`;
        }
        if (output) {
            html += `<pre class="onyx-terminal-output">${_onyxEscHtml(output)}</pre>`;
        }
        if (exitCode !== undefined) {
            const ok = exitCode === 0 || exitCode === '0';
            html += `<div class="onyx-terminal-exit ${ok ? 'onyx-exit-ok' : 'onyx-exit-err'}">
                Exit: ${_onyxEscHtml(String(exitCode))}${item.execution_time !== undefined ? ' · ' + item.execution_time + 's' : ''}
            </div>`;
        }
        term.innerHTML = html;
        body.appendChild(term);
    } else if (['read','file_read'].includes(n)) {
        const fp = args.file_path || args.path || args.filename || '';
        body.innerHTML = `
            <div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">File</span><code class="onyx-tool-detail-value">${_onyxEscHtml(fp)}</code></div>
            ${output ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Content</span><pre class="onyx-terminal-output">${_onyxEscHtml(typeof output === 'string' ? output.slice(0, 5000) : JSON.stringify(output, null, 2).slice(0, 5000))}</pre></div>` : ''}
        `;
    } else if (['write','file_write'].includes(n)) {
        const fp = args.file_path || args.path || args.filename || '';
        const content = args.content || args.text || '';
        body.innerHTML = `
            <div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">File</span><code class="onyx-tool-detail-value">${_onyxEscHtml(fp)}</code></div>
            ${content ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Content Preview</span><pre class="onyx-terminal-output">${_onyxEscHtml(typeof content === 'string' ? content.slice(0, 2000) : JSON.stringify(content, null, 2).slice(0, 2000))}</pre></div>` : ''}
            ${output ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Result</span><span class="onyx-tool-detail-value">${_onyxEscHtml(output)}</span></div>` : ''}
        `;
    } else if (['edit','file_edit'].includes(n)) {
        const fp = args.file_path || args.path || args.filename || '';
        body.innerHTML = `
            <div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">File</span><code class="onyx-tool-detail-value">${_onyxEscHtml(fp)}</code></div>
            ${args.old_text || args.find ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Find</span><pre class="onyx-terminal-output">${_onyxEscHtml((args.old_text || args.find || '').slice(0, 1000))}</pre></div>` : ''}
            ${args.new_text || args.replace ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Replace</span><pre class="onyx-terminal-output">${_onyxEscHtml((args.new_text || args.replace || '').slice(0, 1000))}</pre></div>` : ''}
            ${output ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Result</span><span class="onyx-tool-detail-value">${_onyxEscHtml(output)}</span></div>` : ''}
        `;
    } else if (['ls','dir','list'].includes(n)) {
        const p = args.path || args.directory || '';
        body.innerHTML = `
            <div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Path</span><code class="onyx-tool-detail-value">${_onyxEscHtml(p)}</code></div>
            ${output ? `<pre class="onyx-terminal-output">${_onyxEscHtml(output)}</pre>` : ''}
        `;
    } else if (['browser','browser_action'].includes(n)) {
        const url = args.url || '';
        const action = args.action || '';
        body.innerHTML = `
            ${url ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">URL</span><code class="onyx-tool-detail-value">${_onyxEscHtml(url)}</code></div>` : ''}
            ${action ? `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Action</span><span class="onyx-tool-detail-value">${_onyxEscHtml(action)}</span></div>` : ''}
            ${output ? `<pre class="onyx-terminal-output">${_onyxEscHtml(output)}</pre>` : ''}
        `;
    } else if (['web_fetch','web_search','search'].includes(n)) {
        const url = args.url || args.query || '';
        body.innerHTML = `
            <div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">Query</span><code class="onyx-tool-detail-value">${_onyxEscHtml(url)}</code></div>
            ${output ? `<pre class="onyx-terminal-output">${_onyxEscHtml(output)}</pre>` : ''}
        `;
    } else {
        // Generic tool card
        const argKeys = Object.keys(args);
        let argsHtml = '';
        if (argKeys.length) {
            argsHtml = '<div class="onyx-tool-detail-label" style="margin-top:8px">Arguments</div>';
            argKeys.forEach(k => {
                const v = typeof args[k] === 'string' ? args[k] : JSON.stringify(args[k]);
                argsHtml += `<div class="onyx-tool-detail-row"><span class="onyx-tool-detail-label">${_onyxEscHtml(k)}</span><span class="onyx-tool-detail-value">${_onyxEscHtml(String(v).slice(0, 500))}</span></div>`;
            });
        }
        body.innerHTML = `
            ${argsHtml}
            ${output ? `<div class="onyx-tool-detail-label" style="margin-top:8px">Output</div><pre class="onyx-terminal-output">${_onyxEscHtml(typeof output === 'string' ? output.slice(0, 5000) : JSON.stringify(output, null, 2).slice(0, 5000))}</pre>` : ''}
        `;
    }
}

// ── Helper: update standard tool indicator (non-bash tools) ──
function _updateToolIndicator(toolEl, item, isError) {
    const icon = toolEl.querySelector('.tool-icon');
    if (icon) {
        icon.className = isError
            ? 'fas fa-times text-red-400 flex-shrink-0 tool-icon'
            : 'fas fa-check text-primary-400 flex-shrink-0 tool-icon';
    }
    // Show execution time
    const nameEl = toolEl.querySelector('.tool-name');
    if (nameEl && item.execution_time !== undefined) {
        nameEl.innerHTML += ` <span class="tool-time">${item.execution_time}s</span>`;
    }
    // Fill output section
    const outputLabel = toolEl.querySelector('.tool-output-label');
    const outputEl = toolEl.querySelector('.tool-live-output');
    if (outputLabel) outputLabel.textContent = isError ? 'Error' : 'Output';
    if (outputEl) {
        // For dict results, format them nicely
        let resultText = '';
        if (item.result && typeof item.result === 'object') {
            try { resultText = JSON.stringify(item.result, null, 2); } catch(_) { resultText = String(item.result); }
        } else {
            resultText = item.result ? String(item.result) : '';
        }
        outputEl.textContent = resultText;
        outputEl.classList.toggle('tool-error-text', isError);
    }
    toolEl.classList.remove('tool-streaming');
    toolEl.classList.remove('expanded');
    if (!item.result) {
        const outputSection = toolEl.querySelector('.tool-output-section');
        if (outputSection) outputSection.remove();
    }
    if (isError) toolEl.classList.add('tool-failed');
}

// ── Main entry: detect and replace JSON code blocks with cards ──
function _addCustomJsonCards(container) {
    const wrappers = container.querySelectorAll('.code-block-wrapper');
    wrappers.forEach(wrapper => {
        // Skip already-processed wrappers
        if (wrapper.dataset.onyxCardProcessed) return;
        // Skip wrappers inside onyx-tool-card — they belong to tool card bodies
        if (wrapper.closest('.onyx-tool-card')) return;
        const codeEl = wrapper.querySelector('pre code');
        if (!codeEl) return;
        // Case-insensitive match for json/jsonc/javascript/js language classes,
        // OR no language class at all (the code itself might be a card JSON).
        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '').toLowerCase() : '';
        const isCardLang = !lang || ['json', 'jsonc', 'javascript', 'js'].includes(lang);
        if (!isCardLang) return;

        const code = codeEl.textContent || '';
        // Fast pre-filter: must look like a card (contain "component" keyword)
        if (!code.includes('"component"')) return;

        const cacheKey = code.trim();

        // Check cache first — rebuild from cardData so event listeners are
        // properly re-attached (cloneNode would lose them).
        if (window._onyxCardCache.has(cacheKey)) {
            wrapper.dataset.onyxCardProcessed = 'true';
            const cardData = window._onyxCardCache.get(cacheKey);
            try {
                const card = _buildOnyxCard(cardData);
                card.classList.add('onyx-card-appear');
                wrapper.replaceWith(card);
            } catch (e) {
                console.warn('[OnyxCard] Failed to rebuild cached card:', e);
            }
            return;
        }

        const cardData = _detectCustomCardType(code);
        if (!cardData) {
            // Not a valid card JSON yet — hide the code block during streaming
            // so user doesn't see raw JSON being typed.
            // The pending re-check loop below will retry on each render pass
            // and reveal it as a card once the JSON is complete & parseable.
            wrapper.style.display = 'none';
            wrapper.dataset.onyxCardPending = 'true';
            return;
        }

        // Mark as processed so we don't re-render
        wrapper.dataset.onyxCardProcessed = 'true';

        try {
            const card = _buildOnyxCard(cardData);
            // Add fade-in animation class
            card.classList.add('onyx-card-appear');
            // Cache the cardData (not the DOM element) so it survives innerHTML
            // resets during streaming — rebuilding re-attaches event listeners.
            _cacheCard(cacheKey, cardData);
            wrapper.replaceWith(card);
        } catch (e) {
            console.warn('[OnyxCard] Failed to render card:', e);
            // Unhide the wrapper if card rendering failed
            wrapper.style.display = '';
            delete wrapper.dataset.onyxCardPending;
        }
    });

    // Also check for any pending (hidden) code blocks that might now be complete
    container.querySelectorAll('.code-block-wrapper[data-onyx-card-pending="true"]').forEach(wrapper => {
        if (wrapper.dataset.onyxCardProcessed) return;
        // Skip wrappers inside onyx-tool-card
        if (wrapper.closest('.onyx-tool-card')) return;
        const codeEl = wrapper.querySelector('pre code');
        if (!codeEl) return;
        const code = codeEl.textContent || '';
        const cacheKey = code.trim();

        // Check cache — rebuild from cardData so event listeners are attached
        if (window._onyxCardCache.has(cacheKey)) {
            wrapper.dataset.onyxCardProcessed = 'true';
            const cardData = window._onyxCardCache.get(cacheKey);
            try {
                const card = _buildOnyxCard(cardData);
                card.classList.add('onyx-card-appear');
                wrapper.replaceWith(card);
            } catch (e) {
                console.warn('[OnyxCard] Failed to rebuild pending cached card:', e);
            }
            return;
        }

        const cardData = _detectCustomCardType(code);
        if (cardData) {
            wrapper.dataset.onyxCardProcessed = 'true';
            try {
                const card = _buildOnyxCard(cardData);
                card.classList.add('onyx-card-appear');
                _cacheCard(cacheKey, cardData);
                wrapper.replaceWith(card);
            } catch (e) {
                console.warn('[OnyxCard] Failed to render pending card:', e);
                wrapper.style.display = '';
                delete wrapper.dataset.onyxCardPending;
            }
        }
    });
}

requestAnimationFrame(() => {
    document.body.classList.add('transition-colors', 'duration-200');
});

// =====================================================================
// Font Customization System
// =====================================================================

const FONT_DEFAULTS = {
    body: 'Inter',
    display: 'Space Grotesk',
    mono: 'JetBrains Mono',
    chatSize: 14,
    codeSize: 13
};

const SERVER_FONTS = [
    { name: 'Inter', category: 'Sans Serif', style: 'font-family:Inter,sans-serif' },
    { name: 'Space Grotesk', category: 'Sans Serif', style: 'font-family:"Space Grotesk",sans-serif' },
    { name: 'JetBrains Mono', category: 'Monospace', style: 'font-family:"JetBrains Mono",monospace' },
    { name: 'EB Garamond', category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap', style: 'font-family:"EB Garamond",serif' },
    { name: 'Playfair Display', category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap', style: 'font-family:"Playfair Display",serif' },
    { name: 'Lemon Tuesday', category: 'Display', url: 'https://fonts.googleapis.com/css2?family=Lemon+Tuesday&display=swap', style: 'font-family:"Lemon Tuesday",cursive' },
    { name: 'Pacifico', category: 'Cursive', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', style: 'font-family:Pacifico,cursive' },
    { name: 'Dancing Script', category: 'Cursive', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap', style: 'font-family:"Dancing Script",cursive' },
    { name: 'Caveat', category: 'Cursive', url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap', style: 'font-family:Caveat,cursive' },
    { name: 'Satisfy', category: 'Cursive', url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap', style: 'font-family:Satisfy,cursive' },
    { name: 'Fira Code', category: 'Monospace', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap', style: 'font-family:"Fira Code",monospace' },
    { name: 'Source Code Pro', category: 'Monospace', url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap', style: 'font-family:"Source Code Pro",monospace' },
    { name: 'Poppins', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', style: 'font-family:Poppins,sans-serif' },
    { name: 'Montserrat', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap', style: 'font-family:Montserrat,sans-serif' },
    { name: 'Lora', category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap', style: 'font-family:Lora,serif' },
    { name: 'Bitter', category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap', style: 'font-family:Bitter,serif' },
];

let availableFonts = []; // { name, source: 'server'|'url'|'upload', style }
let fontAssignments = {}; // { body, display, mono }
let uploadedFontCounter = 0;

function loadFontSettings() {
    try {
        const saved = localStorage.getItem('onyx-font-settings');
        if (saved) return { ...FONT_DEFAULTS, ...JSON.parse(saved) };
    } catch(_) {}
    return { ...FONT_DEFAULTS };
}

function saveFontSettings(settings) {
    try { localStorage.setItem('onyx-font-settings', JSON.stringify(settings)); } catch(_) {}
}

function loadImportedFonts() {
    try {
        const saved = localStorage.getItem('onyx-imported-fonts');
        if (saved) return JSON.parse(saved);
    } catch(_) {}
    return [];
}

function saveImportedFonts(fonts) {
    try { localStorage.setItem('onyx-imported-fonts', JSON.stringify(fonts)); } catch(_) {}
}

function loadUploadedFontsMeta() {
    try {
        const saved = localStorage.getItem('onyx-uploaded-fonts');
        if (saved) return JSON.parse(saved);
    } catch(_) {}
    return [];
}

function saveUploadedFontsMeta(fonts) {
    try { localStorage.setItem('onyx-uploaded-fonts', JSON.stringify(fonts)); } catch(_) {}
}

// Dynamically load a Google Fonts stylesheet
function loadFontStylesheet(fontName, url) {
    const id = 'font-css-' + fontName.replace(/\s+/g, '-').toLowerCase();
    if (document.getElementById(id)) return; // already loaded
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

// Load a font via @font-face from a data URL or blob URL
function loadFontFace(fontName, sourceUrl) {
    const fontFace = new FontFace(fontName, `url(${sourceUrl})`);
    fontFace.load().then(loaded => {
        document.fonts.add(loaded);
    }).catch(err => {
        console.warn('[FontSystem] Failed to load font:', fontName, err);
    });
}

// Build the server fonts grid
function renderServerFonts() {
    const grid = document.getElementById('server-fonts-grid');
    if (!grid) return;

    // Load server fonts that need URLs
    SERVER_FONTS.forEach(f => {
        if (f.url) loadFontStylesheet(f.name, f.url);
    });

    grid.innerHTML = SERVER_FONTS.map(f => `
        <button onclick="selectServerFont('${f.name.replace(/'/g, "\\'")}')" 
                class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:border-primary-400 dark:hover:border-primary-500 transition-colors text-left group">
            <span class="text-lg flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                ${f.name.charAt(0)}
            </span>
            <div class="min-w-0 flex-1">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-200 block truncate">${f.name}</span>
                <span class="text-xs text-slate-400">${f.category}</span>
            </div>
            <span class="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Use →</span>
        </button>
    `).join('');
}

// Select a server font for assignment
function selectServerFont(fontName) {
    // Show a quick assign menu
    const key = promptAssignKey(fontName);
    if (!key) return;
    applyFontAssignment(key, fontName);
    // Update the select dropdown
    const sel = document.getElementById('font-assign-' + key);
    if (sel) sel.value = fontName;
}

function promptAssignKey(fontName) {
    // Simple: cycle through body → display → mono based on what's currently selected
    // For now, show a small inline prompt
    const choice = window.confirm(
        `Assign "${fontName}" as Body font?\n\nOK = Body font\nCancel = Choose Display or Mono`
    );
    if (choice) return 'body';
    const choice2 = window.confirm(
        `Assign "${fontName}" as Display font?\n\nOK = Display font\nCancel = Mono font`
    );
    if (choice2) return 'display';
    return 'mono';
}

// Import font from URL
function importFontFromUrl() {
    const input = document.getElementById('font-url-input');
    const url = input.value.trim();
    if (!url) return;

    // Extract font name from Google Fonts URL or use URL hash
    let fontName = '';
    const gfontMatch = url.match(/family=([^&:]+)/);
    if (gfontMatch) {
        fontName = gfontMatch[1].replace(/\+/g, ' ');
    } else {
        fontName = 'Custom Font ' + (++uploadedFontCounter);
    }

    loadFontStylesheet(fontName, url);

    // Save to imported fonts
    const imported = loadImportedFonts();
    if (!imported.find(f => f.name === fontName)) {
        imported.push({ name: fontName, url: url });
        saveImportedFonts(imported);
    }

    // Add to available fonts and dropdowns
    addFontToAssignments(fontName);
    renderImportedFonts();
    input.value = '';
}

// Render imported fonts list
function renderImportedFonts() {
    const list = document.getElementById('imported-fonts-list');
    if (!list) return;
    const imported = loadImportedFonts();
    if (imported.length === 0) {
        list.innerHTML = '<p class="text-xs text-slate-400 italic">No fonts imported yet</p>';
        return;
    }
    list.innerHTML = imported.map((f, i) => `
        <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2">
                <i class="fas fa-link text-xs text-primary-400"></i>
                <span class="text-sm text-slate-700 dark:text-slate-200">${f.name}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="addFontToAssignments('${f.name.replace(/'/g, "\\'")}');selectServerFont('${f.name.replace(/'/g, "\\'")}')" class="text-xs text-primary-400 hover:text-primary-300 transition-colors">Assign</button>
                <button onclick="removeImportedFont(${i})" class="text-xs text-red-400 hover:text-red-300 transition-colors"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function removeImportedFont(index) {
    const imported = loadImportedFonts();
    imported.splice(index, 1);
    saveImportedFonts(imported);
    renderImportedFonts();
}

// Handle font file upload
function handleFontUpload(files) {
    Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['ttf', 'otf', 'woff2'].includes(ext)) {
            alert('Unsupported font format: .' + ext + '\nPlease use .ttf, .otf, or .woff2 files.');
            return;
        }

        const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            // Store in IndexedDB for persistence (localStorage too small for fonts)
            saveFontToIndexedDB(fontName, dataUrl).then(() => {
                loadFontFace(fontName, dataUrl);
                addFontToAssignments(fontName);
                renderUploadedFonts();
            });
        };
        reader.readAsDataURL(file);
    });
    // Reset file input
    document.getElementById('font-file-input').value = '';
}

// IndexedDB for font storage
function openFontDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('onyx-fonts', 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('fonts', { keyPath: 'name' });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function saveFontToIndexedDB(name, dataUrl) {
    try {
        const db = await openFontDB();
        const tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').put({ name, dataUrl });
    } catch(e) {
        console.warn('[FontSystem] IndexedDB save failed:', e);
    }
}

async function loadFontFromIndexedDB(name) {
    try {
        const db = await openFontDB();
        return new Promise((resolve) => {
            const tx = db.transaction('fonts', 'readonly');
            const req = tx.objectStore('fonts').get(name);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    } catch(e) {
        return null;
    }
}

async function deleteFontFromIndexedDB(name) {
    try {
        const db = await openFontDB();
        const tx = db.transaction('fonts', 'readwrite');
        tx.objectStore('fonts').delete(name);
    } catch(e) {
        console.warn('[FontSystem] IndexedDB delete failed:', e);
    }
}

// Render uploaded fonts
async function renderUploadedFonts() {
    const list = document.getElementById('uploaded-fonts-list');
    if (!list) return;
    const meta = loadUploadedFontsMeta();
    if (meta.length === 0) {
        list.innerHTML = '<p class="text-xs text-slate-400 italic">No fonts uploaded yet</p>';
        return;
    }
    list.innerHTML = meta.map((f, i) => `
        <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2">
                <i class="fas fa-file-lines text-xs text-amber-400"></i>
                <span class="text-sm text-slate-700 dark:text-slate-200">${f.name}</span>
                <span class="text-xs text-slate-400">.${f.ext}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="addFontToAssignments('${f.name.replace(/'/g, "\\'")}');selectServerFont('${f.name.replace(/'/g, "\\'")}')" class="text-xs text-primary-400 hover:text-primary-300 transition-colors">Assign</button>
                <button onclick="removeUploadedFont(${i})" class="text-xs text-red-400 hover:text-red-300 transition-colors"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function removeUploadedFont(index) {
    const meta = loadUploadedFontsMeta();
    const font = meta[index];
    if (font) deleteFontFromIndexedDB(font.name);
    meta.splice(index, 1);
    saveUploadedFontsMeta(meta);
    renderUploadedFonts();
}

// Add a font name to the assignment dropdowns
function addFontToAssignments(fontName) {
    ['body', 'display', 'mono'].forEach(role => {
        const sel = document.getElementById('font-assign-' + role);
        if (!sel) return;
        // Check if already exists
        if (Array.from(sel.options).find(o => o.value === fontName)) return;
        const opt = document.createElement('option');
        opt.value = fontName;
        opt.textContent = fontName;
        sel.appendChild(opt);
    });
}

// Apply font assignment
function applyFontAssignment(role, fontName) {
    const settings = loadFontSettings();
    settings[role] = fontName;
    saveFontSettings(settings);
    applyFontSettings(settings);
}

// Apply font size
function applyFontSize(value) {
    const settings = loadFontSettings();
    settings.chatSize = parseInt(value);
    saveFontSettings(settings);
    document.getElementById('font-size-value').textContent = value + 'px';
    applyFontSettings(settings);
}

function applyCodeFontSize(value) {
    const settings = loadFontSettings();
    settings.codeSize = parseInt(value);
    saveFontSettings(settings);
    document.getElementById('code-size-value').textContent = value + 'px';
    applyFontSettings(settings);
}

// Apply all font settings to the page
function applyFontSettings(settings) {
    const root = document.documentElement;

    // Build font-family stacks
    const bodyStack = `"${settings.body}", 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    const displayStack = `"${settings.display}", 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    const monoStack = `"${settings.mono}", 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace`;

    root.style.setProperty('--font-body', bodyStack);
    root.style.setProperty('--font-display', displayStack);
    root.style.setProperty('--font-mono', monoStack);

    // Apply body font
    document.body.style.fontFamily = bodyStack;

    // Apply chat message size
    root.style.setProperty('--chat-font-size', settings.chatSize + 'px');
    root.style.setProperty('--code-font-size', settings.codeSize + 'px');

    // Direct style for message content
    document.querySelectorAll('.msg-content').forEach(el => {
        el.style.fontFamily = bodyStack;
        el.style.fontSize = settings.chatSize + 'px';
    });
    document.querySelectorAll('pre code, .onyx-tool-card pre code').forEach(el => {
        el.style.fontFamily = monoStack;
        el.style.fontSize = settings.codeSize + 'px';
    });
    document.querySelectorAll('.onyx-tool-card-name, .onyx-card-header h3').forEach(el => {
        el.style.fontFamily = displayStack;
    });

    // Update previews
    document.querySelectorAll('.font-preview').forEach(el => {
        if (el.closest('#font-assign-body') || el.previousElementSibling?.id === 'font-assign-body') {
            el.style.fontFamily = bodyStack;
        } else if (el.closest('#font-assign-display') || el.previousElementSibling?.id === 'font-assign-display') {
            el.style.fontFamily = displayStack;
        } else if (el.closest('#font-assign-mono') || el.previousElementSibling?.id === 'font-assign-mono') {
            el.style.fontFamily = monoStack;
        }
    });
}

// Reset fonts to defaults
function resetFonts() {
    const settings = { ...FONT_DEFAULTS };
    saveFontSettings(settings);
    applyFontSettings(settings);

    // Update UI
    ['body', 'display', 'mono'].forEach(role => {
        const sel = document.getElementById('font-assign-' + role);
        if (sel) sel.value = settings[role];
    });
    const sizeSlider = document.getElementById('font-size-slider');
    if (sizeSlider) sizeSlider.value = settings.chatSize;
    const sizeValue = document.getElementById('font-size-value');
    if (sizeValue) sizeValue.textContent = settings.chatSize + 'px';
    const codeSlider = document.getElementById('code-size-slider');
    if (codeSlider) codeSlider.value = settings.codeSize;
    const codeValue = document.getElementById('code-size-value');
    if (codeValue) codeValue.textContent = settings.codeSize + 'px';
}

// Initialize font system on load
async function initFontSystem() {
    const settings = loadFontSettings();

    // Load server fonts that need CSS
    SERVER_FONTS.forEach(f => {
        if (f.url) loadFontStylesheet(f.name, f.url);
        addFontToAssignments(f.name);
    });

    // Load imported fonts from URL
    const imported = loadImportedFonts();
    imported.forEach(f => {
        loadFontStylesheet(f.name, f.url);
        addFontToAssignments(f.name);
    });

    // Load uploaded fonts from IndexedDB
    const uploadedMeta = loadUploadedFontsMeta();
    for (const f of uploadedMeta) {
        const stored = await loadFontFromIndexedDB(f.name);
        if (stored && stored.dataUrl) {
            loadFontFace(f.name, stored.dataUrl);
            addFontToAssignments(f.name);
        }
    }

    // Set dropdown values
    ['body', 'display', 'mono'].forEach(role => {
        const sel = document.getElementById('font-assign-' + role);
        if (sel) sel.value = settings[role];
    });

    // Set size sliders
    const sizeSlider = document.getElementById('font-size-slider');
    if (sizeSlider) sizeSlider.value = settings.chatSize;
    const sizeValue = document.getElementById('font-size-value');
    if (sizeValue) sizeValue.textContent = settings.chatSize + 'px';
    const codeSlider = document.getElementById('code-size-slider');
    if (codeSlider) codeSlider.value = settings.codeSize;
    const codeValue = document.getElementById('code-size-value');
    if (codeValue) codeValue.textContent = settings.codeSize + 'px';

    // Apply settings
    applyFontSettings(settings);

    // Render lists
    renderServerFonts();
    renderImportedFonts();
    renderUploadedFonts();

    // Setup drag & drop on upload zone
    const zone = document.getElementById('font-upload-zone');
    if (zone) {
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('border-primary-400', 'dark:border-primary-500'); });
        zone.addEventListener('dragleave', () => { zone.classList.remove('border-primary-400', 'dark:border-primary-500'); });
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('border-primary-400', 'dark:border-primary-500');
            if (e.dataTransfer.files.length) handleFontUpload(e.dataTransfer.files);
        });
    }
}

// Patch handleFontUpload to also save meta
const _origHandleFontUpload = handleFontUpload;
handleFontUpload = function(files) {
    Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['ttf', 'otf', 'woff2'].includes(ext)) {
            alert('Unsupported font format: .' + ext + '\nPlease use .ttf, .otf, or .woff2 files.');
            return;
        }
        const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            saveFontToIndexedDB(fontName, dataUrl).then(() => {
                loadFontFace(fontName, dataUrl);
                addFontToAssignments(fontName);
                // Save metadata
                const meta = loadUploadedFontsMeta();
                if (!meta.find(f => f.name === fontName)) {
                    meta.push({ name: fontName, ext: ext });
                    saveUploadedFontsMeta(meta);
                }
                renderUploadedFonts();
            });
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('font-file-input').value = '';
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initFontSystem();
    // Sync when fonts view becomes visible
    const origNavigate = window.navigateTo;
    if (origNavigate) {
        window.navigateTo = function(viewId) {
            origNavigate(viewId);
            if (viewId === 'fonts') {
                const settings = loadFontSettings();
                ['body', 'display', 'mono'].forEach(role => {
                    const sel = document.getElementById('font-assign-' + role);
                    if (sel) sel.value = settings[role];
                });
                renderImportedFonts();
                renderUploadedFonts();
            }
        };
    }
});
