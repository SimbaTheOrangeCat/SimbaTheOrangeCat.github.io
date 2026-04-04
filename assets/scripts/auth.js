/**
 * Mindfactor Auth System
 * - localStorage-based: no backend needed
 * - Two roles: 'admin' and 'reader'
 * - Admin account is pre-seeded with fixed credentials
 * - Injects a login button + modal into every page automatically
 */

(function () {
    const USERS_KEY   = 'mf_users';
    const SESSION_KEY = 'mf_session';

    // ── Pre-seed admin account ─────────────────────────────────────────────
    const ADMIN_USERNAME = 'ayan';
    const ADMIN_PASSWORD = 'mindfactor@admin';

    function getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
        catch { return []; }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function seedAdmin() {
        const users = getUsers();
        if (!users.find(u => u.username === ADMIN_USERNAME)) {
            users.push({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: 'admin', createdAt: Date.now() });
            saveUsers(users);
        }
    }

    // ── Session helpers ────────────────────────────────────────────────────
    function getSession() {
        try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
        catch { return null; }
    }

    function setSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    // Expose globally so other scripts (comments.js) can check auth
    window.MFAuth = {
        getSession,
        isAdmin: () => { const s = getSession(); return s && s.role === 'admin'; },
        isLoggedIn: () => !!getSession(),
    };

    // ── Modal HTML ────────────────────────────────────────────────────────
    function buildModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'auth-modal-title');
        modal.innerHTML = `
        <div class="auth-backdrop" id="auth-backdrop"></div>
        <div class="auth-box">
            <button class="auth-close" id="auth-close" aria-label="Close">&times;</button>

            <!-- Tab switcher -->
            <div class="auth-tabs">
                <button class="auth-tab active" id="tab-login" data-tab="login">Sign In</button>
                <button class="auth-tab" id="tab-signup" data-tab="signup">Sign Up</button>
            </div>

            <!-- Login form -->
            <div class="auth-panel" id="panel-login">
                <p class="auth-subtitle">Welcome back ✦</p>
                <div class="auth-field">
                    <label class="auth-label" for="login-username">Username</label>
                    <input class="auth-input" id="login-username" type="text" placeholder="your username" autocomplete="username">
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="login-password">Password</label>
                    <input class="auth-input" id="login-password" type="password" placeholder="••••••••" autocomplete="current-password">
                </div>
                <p class="auth-error" id="login-error"></p>
                <button class="auth-submit" id="login-submit">Sign In</button>
            </div>

            <!-- Signup form -->
            <div class="auth-panel hidden" id="panel-signup">
                <p class="auth-subtitle">Join the community 🌿</p>
                <div class="auth-field">
                    <label class="auth-label" for="signup-username">Choose a Username</label>
                    <input class="auth-input" id="signup-username" type="text" placeholder="e.g. moonreader" autocomplete="username">
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="signup-password">Password</label>
                    <input class="auth-input" id="signup-password" type="password" placeholder="Min. 6 characters" autocomplete="new-password">
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="signup-confirm">Confirm Password</label>
                    <input class="auth-input" id="signup-confirm" type="password" placeholder="Repeat password" autocomplete="new-password">
                </div>
                <p class="auth-error" id="signup-error"></p>
                <button class="auth-submit" id="signup-submit">Create Account</button>
            </div>
        </div>`;
        return modal;
    }

    // ── Auth button in header ─────────────────────────────────────────────
    function buildAuthButton() {
        const wrap = document.createElement('div');
        wrap.id = 'auth-btn-wrap';
        wrap.innerHTML = `<button class="auth-header-btn" id="auth-header-btn" aria-label="Sign in">Sign In</button>`;
        return wrap;
    }

    function buildUserChip(session) {
        const wrap = document.createElement('div');
        wrap.id = 'auth-btn-wrap';
        wrap.className = 'user-chip-wrap';
        const isAdmin = session.role === 'admin';
        wrap.innerHTML = `
        <div class="user-chip" id="user-chip">
            <span class="user-chip-avatar">${session.username[0].toUpperCase()}</span>
            <span class="user-chip-name">${session.username}</span>
            ${isAdmin ? '<span class="user-chip-badge">Admin</span>' : ''}
            <span class="user-chip-caret">▾</span>
        </div>
        <div class="user-dropdown" id="user-dropdown">
            <div class="user-dropdown-info">
                <strong>${session.username}</strong>
                <span>${isAdmin ? '⭐ Admin' : 'Reader'}</span>
            </div>
            <hr class="user-dropdown-divider">
            <button class="user-dropdown-item logout-btn" id="logout-btn">Sign Out</button>
        </div>`;
        return wrap;
    }

    // ── Inject styles ─────────────────────────────────────────────────────
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
        /* ── Auth Header Button ─────────────────────────── */
        .auth-header-btn {
            background: var(--accent-color);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 18px;
            font-family: var(--font-sans, 'Inter', sans-serif);
            font-size: 0.88rem;
            font-weight: 600;
            cursor: pointer;
            letter-spacing: 0.02em;
            transition: background 0.22s, transform 0.15s, box-shadow 0.22s;
            white-space: nowrap;
        }
        .auth-header-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(205,149,117,0.35);
        }

        /* ── User Chip ──────────────────────────────────── */
        .user-chip-wrap { position: relative; }
        .user-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 6px 12px 6px 6px;
            border-radius: 999px;
            border: 1.5px solid var(--border-color);
            transition: border-color 0.2s, background 0.2s;
            user-select: none;
        }
        .user-chip:hover { border-color: var(--accent-color); background: rgba(205,149,117,0.06); }
        .user-chip-avatar {
            width: 28px; height: 28px; border-radius: 50%;
            background: var(--accent-color);
            color: #fff;
            font-size: 0.8rem; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
        }
        .user-chip-name { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
        .user-chip-badge {
            background: linear-gradient(135deg, #c0a06a, #e6a782);
            color: #fff; font-size: 0.68rem; font-weight: 700;
            padding: 2px 8px; border-radius: 999px; letter-spacing: 0.05em;
        }
        .user-chip-caret { font-size: 0.7rem; color: var(--text-secondary); transition: transform 0.2s; }
        .user-chip-wrap.open .user-chip-caret { transform: rotate(180deg); }

        /* ── User Dropdown ──────────────────────────────── */
        .user-dropdown {
            display: none;
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            background: var(--surface-color, #fff);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            min-width: 180px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.12);
            padding: 8px;
            z-index: 500;
            animation: dropdownIn 0.18s ease;
        }
        @keyframes dropdownIn {
            from { opacity:0; transform: translateY(-6px); }
            to   { opacity:1; transform: translateY(0); }
        }
        .user-chip-wrap.open .user-dropdown { display: block; }
        .user-dropdown-info {
            padding: 10px 12px 8px;
            display: flex; flex-direction: column; gap: 2px;
        }
        .user-dropdown-info strong { font-size: 0.92rem; color: var(--text-primary); }
        .user-dropdown-info span { font-size: 0.8rem; color: var(--text-secondary); }
        .user-dropdown-divider { border: none; border-top: 1px solid var(--border-color); margin: 4px 0; }
        .user-dropdown-item {
            width: 100%; text-align: left; background: none; border: none;
            padding: 9px 12px; border-radius: 8px; cursor: pointer;
            font-family: var(--font-sans, 'Inter', sans-serif);
            font-size: 0.88rem; color: var(--text-primary);
            transition: background 0.15s;
        }
        .user-dropdown-item:hover { background: rgba(205,149,117,0.1); color: var(--accent-color); }
        .logout-btn { color: #c0826a !important; }

        /* ── Modal Backdrop & Box ───────────────────────── */
        #auth-modal {
            display: none;
            position: fixed; inset: 0;
            z-index: 9000;
            align-items: center; justify-content: center;
        }
        #auth-modal.open { display: flex; }
        .auth-backdrop {
            position: absolute; inset: 0;
            background: rgba(30,28,26,0.55);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }
        .auth-box {
            position: relative;
            background: var(--surface-color, #fff);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 36px 32px 32px;
            width: 100%; max-width: 400px;
            box-shadow: 0 24px 80px rgba(0,0,0,0.18);
            animation: authBoxIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 1;
        }
        @keyframes authBoxIn {
            from { opacity:0; transform: scale(0.9) translateY(20px); }
            to   { opacity:1; transform: scale(1) translateY(0); }
        }
        .auth-close {
            position: absolute; top: 14px; right: 16px;
            background: none; border: none;
            font-size: 1.5rem; cursor: pointer;
            color: var(--text-secondary); line-height: 1;
            transition: color 0.2s, transform 0.2s;
        }
        .auth-close:hover { color: var(--text-primary); transform: rotate(90deg); }

        /* ── Tabs ───────────────────────────────────────── */
        .auth-tabs {
            display: flex; gap: 4px;
            background: var(--bg-color, #FDFBF7);
            border: 1px solid var(--border-color);
            border-radius: 10px; padding: 4px;
            margin-bottom: 28px;
        }
        .auth-tab {
            flex: 1; padding: 9px;
            background: none; border: none; border-radius: 7px;
            font-family: var(--font-sans, 'Inter', sans-serif);
            font-size: 0.9rem; font-weight: 600;
            cursor: pointer; color: var(--text-secondary);
            transition: background 0.2s, color 0.2s;
        }
        .auth-tab.active {
            background: var(--surface-color, #fff);
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* ── Panel & Fields ─────────────────────────────── */
        .auth-panel.hidden { display: none; }
        .auth-subtitle {
            font-size: 0.95rem; color: var(--text-secondary);
            margin-bottom: 22px; text-align: center;
        }
        .auth-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .auth-label {
            font-size: 0.8rem; font-weight: 600;
            color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .auth-input {
            padding: 11px 14px; border-radius: 9px;
            border: 1.5px solid var(--border-color);
            background: var(--bg-color, #FDFBF7);
            color: var(--text-primary);
            font-family: var(--font-sans, 'Inter', sans-serif);
            font-size: 0.97rem; outline: none;
            transition: border-color 0.25s, box-shadow 0.25s;
        }
        .auth-input:focus {
            border-color: var(--accent-color, #CD9575);
            box-shadow: 0 0 0 3px rgba(205,149,117,0.15);
        }
        .auth-error {
            font-size: 0.83rem; color: #c0826a;
            min-height: 18px; margin-bottom: 6px;
            font-weight: 500;
        }
        .auth-submit {
            width: 100%; padding: 12px;
            background: var(--accent-color, #CD9575); color: #fff; border: none;
            border-radius: 10px;
            font-family: var(--font-sans, 'Inter', sans-serif);
            font-size: 1rem; font-weight: 600; cursor: pointer;
            transition: background 0.22s, transform 0.15s;
            margin-top: 4px;
        }
        .auth-submit:hover { background: var(--accent-hover, #b58062); transform: translateY(-1px); }

        /* ── Comment Delete Button ──────────────────────── */
        .comment-delete-btn {
            background: none; border: none;
            color: var(--text-secondary); font-size: 0.8rem;
            cursor: pointer; margin-left: auto;
            padding: 3px 8px; border-radius: 6px;
            transition: background 0.15s, color 0.15s;
            font-family: var(--font-sans, 'Inter', sans-serif);
        }
        .comment-delete-btn:hover { background: rgba(192,82,82,0.1); color: #c05252; }
        `;
        document.head.appendChild(style);
    }

    // ── Render header auth zone ───────────────────────────────────────────
    function renderHeaderAuth() {
        const existing = document.getElementById('auth-btn-wrap');
        if (existing) existing.remove();

        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const session = getSession();
        const el = session ? buildUserChip(session) : buildAuthButton();
        themeToggle.parentNode.insertBefore(el, themeToggle);

        if (!session) {
            document.getElementById('auth-header-btn').addEventListener('click', openModal);
        } else {
            const chip = document.getElementById('user-chip');
            const wrap = document.getElementById('auth-btn-wrap');
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                wrap.classList.toggle('open');
            });
            document.addEventListener('click', () => wrap.classList.remove('open'));
            document.getElementById('logout-btn').addEventListener('click', () => {
                clearSession();
                renderHeaderAuth();
                // Refresh comments if on a post page
                if (typeof window.MFCommentsRefresh  === 'function') window.MFCommentsRefresh();
                if (typeof window.MFReactionsRefresh === 'function') window.MFReactionsRefresh();
                if (typeof window.MFFeaturesRefresh  === 'function') window.MFFeaturesRefresh();
            });
        }
    }

    // ── Modal open/close ──────────────────────────────────────────────────
    function openModal(defaultTab) {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (defaultTab === 'signup') switchTab('signup');
        else switchTab('login');
        document.getElementById('login-username').focus();
    }

    function closeModal() {
        const modal = document.getElementById('auth-modal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        clearErrors();
    }

    function clearErrors() {
        ['login-error', 'signup-error'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
    }

    function switchTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        document.getElementById('panel-login').classList.toggle('hidden', tab !== 'login');
        document.getElementById('panel-signup').classList.toggle('hidden', tab !== 'signup');
        clearErrors();
    }

    // ── Login logic ───────────────────────────────────────────────────────
    function handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errEl    = document.getElementById('login-error');

        if (!username || !password) { errEl.textContent = 'Please fill in all fields.'; return; }

        const users = getUsers();
        const user  = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

        if (!user) { errEl.textContent = 'Invalid username or password.'; return; }

        setSession(user);
        closeModal();
        renderHeaderAuth();
        if (typeof window.MFCommentsRefresh  === 'function') window.MFCommentsRefresh();
        if (typeof window.MFReactionsRefresh === 'function') window.MFReactionsRefresh();
        if (typeof window.MFFeaturesRefresh  === 'function') window.MFFeaturesRefresh();
    }

    // ── Signup logic ──────────────────────────────────────────────────────
    function handleSignup() {
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm  = document.getElementById('signup-confirm').value;
        const errEl    = document.getElementById('signup-error');

        if (!username || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; return; }
        if (username.length < 3)  { errEl.textContent = 'Username must be at least 3 characters.'; return; }
        if (password.length < 6)  { errEl.textContent = 'Password must be at least 6 characters.'; return; }
        if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

        const users = getUsers();
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            errEl.textContent = 'That username is already taken.'; return;
        }

        const newUser = { username, password, role: 'reader', createdAt: Date.now() };
        users.push(newUser);
        saveUsers(users);
        setSession(newUser);
        closeModal();
        renderHeaderAuth();
        if (typeof window.MFCommentsRefresh  === 'function') window.MFCommentsRefresh();
        if (typeof window.MFReactionsRefresh === 'function') window.MFReactionsRefresh();
        if (typeof window.MFFeaturesRefresh  === 'function') window.MFFeaturesRefresh();
    }

    // ── Init ──────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        seedAdmin();
        injectStyles();

        // Inject modal
        const modal = buildModal();
        document.body.appendChild(modal);

        // Wire modal events
        document.getElementById('auth-backdrop').addEventListener('click', closeModal);
        document.getElementById('auth-close').addEventListener('click', closeModal);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        document.getElementById('login-submit').addEventListener('click', handleLogin);
        document.getElementById('signup-submit').addEventListener('click', handleSignup);

        // Enter key submits
        ['login-username', 'login-password'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
        });
        ['signup-username', 'signup-password', 'signup-confirm'].forEach(id => {
            document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleSignup(); });
        });

        renderHeaderAuth();
    });

})();
