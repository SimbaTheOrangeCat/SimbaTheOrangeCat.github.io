/**
 * Mindfactor Features System
 * Handles: streak, bookmarks, badges, new-post notifications,
 *          profile accent color, reading streak banner, reflection notes.
 */
(function () {

    // ── Config ─────────────────────────────────────────────────────────────
    const ALL_POSTS = [
        { title: 'Art of Mindful Breathing',             url: 'art-of-mindful-breathing.html' },
        { title: 'The Art of Slow Living',               url: 'art-of-slow-living.html' },
        { title: 'A Guide to Cozy Productivity',         url: 'cozy-productivity.html' },
        { title: 'Finding Warmth in the Minimalist Lifestyle', url: 'warmth-in-minimalism.html' },
    ];

    const ACCENT_PRESETS = [
        { name: 'Terracotta', hex: '#CD9575' },
        { name: 'Sage Green',  hex: '#7a9e7e' },
        { name: 'Dusty Rose',  hex: '#c47e8c' },
        { name: 'Ocean Blue',  hex: '#6a8cad' },
        { name: 'Lavender',    hex: '#9b8cc4' },
        { name: 'Golden Hour', hex: '#c4a44d' },
    ];

    // ── Helpers ────────────────────────────────────────────────────────────
    const load = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
    const loadArr = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
    const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const getUser = () => window.MFAuth?.getSession()?.username || null;
    const isPost = () => ALL_POSTS.some(p => location.pathname.endsWith(p.url));
    const currentPostTitle = () => document.querySelector('h1')?.textContent?.trim() || document.title;
    const darken = hex => '#' + parseInt(hex.slice(1), 16).toString(16).padStart(6, '0')
        .match(/.{2}/g).map(c => Math.max(0, parseInt(c, 16) - 28).toString(16).padStart(2, '0')).join('');

    // ── Accent Color ───────────────────────────────────────────────────────
    function applyAccent(hex) {
        if (!hex) return;
        document.documentElement.style.setProperty('--accent-color', hex);
        document.documentElement.style.setProperty('--accent-hover', darken(hex));
    }

    function getUserAccent(username) {
        return (load('mf_profile')[username] || {}).accentColor || null;
    }

    // Apply early (before DOM ready) to prevent flash
    const _s = window.MFAuth?.getSession();
    if (_s) applyAccent(getUserAccent(_s.username));

    // ── Streak ─────────────────────────────────────────────────────────────
    function updateStreak(username) {
        const data = load('mf_streak');
        const u    = data[username] || { streak: 0, lastVisit: null };
        const today = new Date().toDateString();
        const yest  = new Date(Date.now() - 86400000).toDateString();
        if (u.lastVisit === today) { /* no change */ }
        else if (u.lastVisit === yest) { u.streak++; u.lastVisit = today; }
        else { u.streak = 1; u.lastVisit = today; }
        data[username] = u;
        save('mf_streak', data);
        return u.streak;
    }

    const getStreak = username => (load('mf_streak')[username] || {}).streak || 0;

    // ── Posts Read & Badge ─────────────────────────────────────────────────
    function trackRead(username) {
        if (!isPost()) return;
        const data = load('mf_posts_read');
        const read = data[username] || [];
        const path = location.pathname;
        if (!read.includes(path)) { read.push(path); data[username] = read; save('mf_posts_read', data); }
    }

    const getPostsRead  = u => (load('mf_posts_read')[u] || []).length;
    const hasBadge      = u => getPostsRead(u) >= 3;

    // ── Bookmarks ──────────────────────────────────────────────────────────
    const getBookmarks  = u => load('mf_bookmarks')[u] || [];
    function saveBookmarks(username, arr) {
        const all = load('mf_bookmarks'); all[username] = arr; save('mf_bookmarks', all);
    }

    function toggleBookmark(username) {
        const path = location.pathname;
        let bm = getBookmarks(username);
        const idx = bm.findIndex(b => b.url === path);
        if (idx >= 0) { bm.splice(idx, 1); saveBookmarks(username, bm); return false; }
        bm.unshift({ url: path, title: currentPostTitle(), addedAt: Date.now() });
        saveBookmarks(username, bm); return true;
    }

    const isBookmarked = u => getBookmarks(u).some(b => b.url === location.pathname);

    // ── New Post Notification ──────────────────────────────────────────────
    function hasNewPosts() {
        const known = loadArr('mf_known_posts');
        return ALL_POSTS.some(p => !known.includes(p.url));
    }

    function markPostsKnown() {
        save('mf_known_posts', ALL_POSTS.map(p => p.url));
    }

    // If on blog listing, mark all seen
    if (location.pathname.endsWith('blog.html') || location.pathname === '/') markPostsKnown();

    // ── Reflection Notes ───────────────────────────────────────────────────
    function getReflection(username) {
        const all = load('mf_reflections');
        return (all[location.pathname] || {})[username] || '';
    }

    function saveReflection(username, text) {
        const all = load('mf_reflections');
        if (!all[location.pathname]) all[location.pathname] = {};
        all[location.pathname][username] = text;
        save('mf_reflections', all);
    }

    // ── Styles ─────────────────────────────────────────────────────────────
    function injectStyles() {
        const s = document.createElement('style');
        s.textContent = `
        /* Dropdown stats */
        .mf-stats-row { display:flex; padding:8px 10px 4px; gap:4px; }
        .mf-stat { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; }
        .mf-stat-val { font-size:.95rem; font-weight:700; color:var(--text-primary); }
        .mf-stat-lbl { font-size:.67rem; color:var(--text-secondary); text-align:center; }
        .mf-badge-row { text-align:center; font-size:.78rem; font-weight:700; color:#c0a06a; padding:4px 10px 8px; letter-spacing:.04em; }
        .mf-count-badge { background:var(--accent-color); color:#fff; font-size:.7rem; font-weight:700; padding:1px 6px; border-radius:999px; margin-left:4px; }
        .mf-divider { border:none; border-top:1px solid var(--border-color); margin:4px 0; }

        /* Notif dot */
        .mf-notif-dot { width:7px; height:7px; border-radius:50%; background:var(--accent-color); display:inline-block; margin-left:5px; vertical-align:middle; animation:mfPulse 2s ease infinite; }
        @keyframes mfPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.8)} }

        /* Streak banner */
        .mf-streak-banner { max-width:680px; margin:0 auto 0; padding:12px 24px; background:rgba(205,149,117,.09); border:1px solid rgba(205,149,117,.25); border-radius:12px; text-align:center; font-size:.9rem; font-weight:600; color:var(--accent-color); }

        /* Bookmark btn */
        .mf-bm-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border:1.5px solid var(--border-color); border-radius:6px; background:transparent; cursor:pointer; font-family:inherit; font-size:1rem; font-weight:500; color:var(--text-secondary); transition:all .2s; }
        .mf-bm-btn:hover { border-color:var(--accent-color); color:var(--accent-color); transform:translateY(-2px); }
        .mf-bm-btn.active { background:var(--accent-color); color:#fff; border-color:var(--accent-color); }

        /* Reflection */
        .mf-reflect { max-width:680px; margin:40px auto 0; padding:22px 26px; background:var(--surface-color); border:1.5px dashed var(--border-color); border-radius:16px; }
        .mf-reflect-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .mf-reflect-title { font-family:'Lora',serif; font-size:1rem; font-style:italic; color:var(--text-primary); }
        .mf-reflect-lock { font-size:.75rem; color:var(--text-secondary); }
        .mf-reflect-ta { width:100%; min-height:88px; padding:11px 14px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--bg-color); color:var(--text-primary); font-family:inherit; font-size:.93rem; line-height:1.6; resize:none; outline:none; box-sizing:border-box; transition:border-color .25s; }
        .mf-reflect-ta:focus { border-color:var(--accent-color); }
        .mf-reflect-saved { font-size:.75rem; color:#7aad7a; margin-top:6px; opacity:0; transition:opacity .3s; }
        .mf-reflect-saved.on { opacity:1; }

        /* Modals */
        .mf-overlay { display:none; position:fixed; inset:0; z-index:9500; align-items:center; justify-content:center; }
        .mf-overlay.open { display:flex; }
        .mf-back { position:absolute; inset:0; background:rgba(30,28,26,.55); backdrop-filter:blur(6px); }
        .mf-box { position:relative; background:var(--surface-color); border:1px solid var(--border-color); border-radius:20px; padding:32px; width:100%; max-width:420px; box-shadow:0 24px 80px rgba(0,0,0,.18); animation:authBoxIn .28s cubic-bezier(.34,1.56,.64,1); z-index:1; max-height:80vh; overflow-y:auto; }
        .mf-box-close { position:absolute; top:14px; right:16px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-secondary); transition:transform .2s; }
        .mf-box-close:hover { transform:rotate(90deg); }
        .mf-box-title { font-family:'Lora',serif; font-size:1.35rem; margin-bottom:4px; }
        .mf-box-sub { font-size:.85rem; color:var(--text-secondary); margin-bottom:22px; }

        /* Color swatches */
        .mf-color-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
        .mf-swatch { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; padding:10px 6px; border-radius:12px; border:2px solid transparent; transition:border-color .2s, transform .15s; }
        .mf-swatch:hover { transform:translateY(-2px); }
        .mf-swatch.sel { border-color:var(--text-primary); }
        .mf-dot { width:36px; height:36px; border-radius:50%; }
        .mf-swatch-name { font-size:.72rem; color:var(--text-secondary); text-align:center; }
        .mf-save-btn { width:100%; padding:11px; background:var(--accent-color); color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:.97rem; font-weight:600; cursor:pointer; transition:background .2s, transform .15s; }
        .mf-save-btn:hover { background:var(--accent-hover); transform:translateY(-1px); }

        /* Bookmarks list */
        .mf-bm-list { display:flex; flex-direction:column; gap:10px; }
        .mf-bm-item { display:flex; align-items:center; gap:10px; padding:11px 14px; border:1px solid var(--border-color); border-radius:12px; transition:border-color .2s; }
        .mf-bm-item:hover { border-color:var(--accent-color); }
        .mf-bm-name { flex:1; font-size:.9rem; font-weight:500; color:var(--text-primary); }
        .mf-bm-read { font-size:.78rem; padding:5px 12px; background:var(--accent-color); color:#fff; border:none; border-radius:6px; cursor:pointer; font-family:inherit; text-decoration:none; }
        .mf-bm-rm   { font-size:.78rem; padding:5px 10px; background:none; border:1px solid var(--border-color); border-radius:6px; cursor:pointer; color:var(--text-secondary); font-family:inherit; transition:border-color .2s, color .2s; }
        .mf-bm-rm:hover { border-color:#c05252; color:#c05252; }
        .mf-empty { text-align:center; padding:28px; color:var(--text-secondary); font-size:.9rem; }
        .mf-empty span { display:block; font-size:2rem; margin-bottom:8px; }
        `;
        document.head.appendChild(s);
    }

    // ── Notif Dot ──────────────────────────────────────────────────────────
    function addNotifDot() {
        if (!hasNewPosts()) return;
        document.querySelectorAll('a[href="blog.html"]').forEach(a => {
            if (!a.querySelector('.mf-notif-dot')) {
                const dot = document.createElement('span');
                dot.className = 'mf-notif-dot';
                a.appendChild(dot);
            }
        });
    }

    // ── Streak Banner ──────────────────────────────────────────────────────
    function showStreakBanner(username) {
        const streak = getStreak(username);
        if (streak < 2 || !isPost()) return;
        const banner = document.createElement('div');
        banner.className = 'mf-streak-banner';
        banner.textContent = `You've been reading for ${streak} day${streak !== 1 ? 's' : ''} in a row 🔥`;
        const art = document.querySelector('article.container');
        if (art) art.parentNode.insertBefore(banner, art);
    }

    // ── Bookmark Button ────────────────────────────────────────────────────
    function injectBookmarkBtn(username) {
        if (!isPost() || document.getElementById('mf-bm-btn')) return;
        const btnRow = document.querySelector('.article-footer > div');
        if (!btnRow) return;
        const btn = document.createElement('button');
        btn.id = 'mf-bm-btn';
        const active = isBookmarked(username);
        btn.className = 'mf-bm-btn' + (active ? ' active' : '');
        btn.innerHTML  = active ? '📌 Bookmarked' : '🔖 Bookmark';
        btn.addEventListener('click', () => {
            const added = toggleBookmark(username);
            btn.className = 'mf-bm-btn' + (added ? ' active' : '');
            btn.innerHTML  = added ? '📌 Bookmarked' : '🔖 Bookmark';
            refreshDropdown(username);
        });
        btnRow.appendChild(btn);
    }

    // ── Reflection ─────────────────────────────────────────────────────────
    function injectReflection(username) {
        if (!isPost() || document.getElementById('mf-reflect')) return;
        const comments = document.getElementById('comments');
        if (!comments) return;
        const div = document.createElement('div');
        div.id = 'mf-reflect';
        div.className = 'mf-reflect';
        div.innerHTML = `
            <div class="mf-reflect-hd">
                <p class="mf-reflect-title">📓 My private reflection</p>
                <span class="mf-reflect-lock">🔒 Only visible to you</span>
            </div>
            <textarea class="mf-reflect-ta" id="mf-reflect-ta" maxlength="2000"
                placeholder="What did this post mean to you? Write a note for yourself...">${getReflection(username)}</textarea>
            <p class="mf-reflect-saved" id="mf-reflect-saved">✓ Saved</p>`;
        comments.parentNode.insertBefore(div, comments);
        let timer;
        document.getElementById('mf-reflect-ta').addEventListener('input', e => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                saveReflection(username, e.target.value);
                const sv = document.getElementById('mf-reflect-saved');
                sv.classList.add('on');
                setTimeout(() => sv.classList.remove('on'), 2000);
            }, 700);
        });
    }

    // ── Dropdown Enhancement ───────────────────────────────────────────────
    function refreshDropdown(username) {
        const dd = document.getElementById('user-dropdown');
        if (!dd) return;
        dd.querySelectorAll('.mf-dd').forEach(el => el.remove());

        const streak = getStreak(username), read = getPostsRead(username), bms = getBookmarks(username);
        const badge  = hasBadge(username);

        // Stats row
        const stats = document.createElement('div');
        stats.className = 'mf-stats-row mf-dd';
        stats.innerHTML = `
            <div class="mf-stat"><span class="mf-stat-val">${streak > 0 ? '🔥' : '📖'} ${streak}</span><span class="mf-stat-lbl">Day streak</span></div>
            <div class="mf-stat"><span class="mf-stat-val">${read}</span><span class="mf-stat-lbl">Posts read</span></div>
            <div class="mf-stat"><span class="mf-stat-val">${bms.length}</span><span class="mf-stat-lbl">Bookmarks</span></div>`;

        const badgeEl = badge ? Object.assign(document.createElement('div'), { className: 'mf-badge-row mf-dd', textContent: '🏅 Mindful Reader' }) : null;
        const divA    = Object.assign(document.createElement('hr'), { className: 'mf-divider mf-dd' });

        const bmBtn = document.createElement('button');
        bmBtn.className = 'user-dropdown-item mf-dd';
        bmBtn.innerHTML = `📌 My Bookmarks${bms.length ? `<span class="mf-count-badge">${bms.length}</span>` : ''}`;
        bmBtn.onclick = () => openBookmarks(username);

        const prBtn = document.createElement('button');
        prBtn.className = 'user-dropdown-item mf-dd';
        prBtn.textContent = '🎨 Customize Profile';
        prBtn.onclick = () => openProfile(username);

        const divB = Object.assign(document.createElement('hr'), { className: 'mf-divider mf-dd' });

        const anchor = dd.querySelector('.user-dropdown-divider');
        const logout = dd.querySelector('#logout-btn');
        if (anchor) { dd.insertBefore(stats, anchor); if (badgeEl) dd.insertBefore(badgeEl, anchor); dd.insertBefore(divA, anchor); }
        if (logout) { dd.insertBefore(bmBtn, logout); dd.insertBefore(prBtn, logout); dd.insertBefore(divB, logout); }
    }

    // ── Profile Modal ──────────────────────────────────────────────────────
    let _pickedColor = null;

    function openProfile(username) {
        document.getElementById('auth-btn-wrap')?.classList.remove('open');
        let modal = document.getElementById('mf-profile-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'mf-profile-modal';
            modal.className = 'mf-overlay';
            modal.innerHTML = `<div class="mf-back" id="mf-pm-back"></div>
                <div class="mf-box">
                    <button class="mf-box-close" id="mf-pm-x">&times;</button>
                    <h2 class="mf-box-title">Customize Profile</h2>
                    <p class="mf-box-sub">Pick your accent color — your personal vibe on Mindfactor.</p>
                    <div class="mf-color-grid" id="mf-cgrid"></div>
                    <button class="mf-save-btn" id="mf-pm-save">Save Changes</button>
                </div>`;
            document.body.appendChild(modal);
            modal.querySelector('#mf-pm-back').onclick = closeProfile;
            modal.querySelector('#mf-pm-x').onclick    = closeProfile;
        }

        const profile = load('mf_profile')[username] || {};
        _pickedColor  = profile.accentColor || ACCENT_PRESETS[0].hex;
        const grid = modal.querySelector('#mf-cgrid');
        grid.innerHTML = ACCENT_PRESETS.map(p => `
            <div class="mf-swatch${_pickedColor === p.hex ? ' sel' : ''}" data-hex="${p.hex}">
                <div class="mf-dot" style="background:${p.hex}"></div>
                <span class="mf-swatch-name">${p.name}</span>
            </div>`).join('');
        grid.querySelectorAll('.mf-swatch').forEach(sw => sw.addEventListener('click', () => {
            grid.querySelectorAll('.mf-swatch').forEach(s => s.classList.remove('sel'));
            sw.classList.add('sel');
            _pickedColor = sw.dataset.hex;
            applyAccent(_pickedColor); // live preview
        }));

        // re-attach save each open (username closure)
        const saveBtn = modal.querySelector('#mf-pm-save');
        saveBtn.onclick = () => {
            const all = load('mf_profile'); all[username] = { ...(all[username] || {}), accentColor: _pickedColor };
            save('mf_profile', all); closeProfile();
        };
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeProfile() {
        const m = document.getElementById('mf-profile-modal');
        if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
    }

    // ── Bookmarks Modal ────────────────────────────────────────────────────
    function openBookmarks(username) {
        document.getElementById('auth-btn-wrap')?.classList.remove('open');
        let modal = document.getElementById('mf-bm-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'mf-bm-modal';
        modal.className = 'mf-overlay';
        const bms = getBookmarks(username);
        const listHtml = bms.length
            ? `<div class="mf-bm-list">${bms.map((b, i) => `
                <div class="mf-bm-item">
                    <span class="mf-bm-name">${b.title}</span>
                    <a href="${b.url}" class="mf-bm-read">Read →</a>
                    <button class="mf-bm-rm" data-i="${i}">Remove</button>
                </div>`).join('')}</div>`
            : `<div class="mf-empty"><span>📭</span>No bookmarks yet — start reading!</div>`;
        modal.innerHTML = `<div class="mf-back" id="mf-bm-back"></div>
            <div class="mf-box">
                <button class="mf-box-close" id="mf-bm-x">&times;</button>
                <h2 class="mf-box-title">📌 My Bookmarks</h2>
                <p class="mf-box-sub">Your saved posts for later reading.</p>
                ${listHtml}
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#mf-bm-back').onclick = closeBookmarks;
        modal.querySelector('#mf-bm-x').onclick    = closeBookmarks;
        modal.querySelectorAll('.mf-bm-rm').forEach(btn => btn.addEventListener('click', () => {
            const bmsNow = getBookmarks(username);
            bmsNow.splice(parseInt(btn.dataset.i), 1);
            saveBookmarks(username, bmsNow);
            openBookmarks(username); // re-open re-renders
            refreshDropdown(username);
        }));
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeBookmarks() {
        const m = document.getElementById('mf-bm-modal');
        if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
    }

    // ── Global Refresh Hook (called by auth.js on login/logout) ───────────
    function refresh() {
        const username = getUser();
        if (!username) {
            document.getElementById('mf-bm-btn')?.remove();
            document.getElementById('mf-reflect')?.remove();
            return;
        }
        refreshDropdown(username);
        if (isPost()) {
            injectBookmarkBtn(username);
            injectReflection(username);
        }
    }

    window.MFFeaturesRefresh = refresh;

    // ── Init ───────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        addNotifDot();

        const username = getUser();
        if (username) {
            updateStreak(username);
            trackRead(username);
            applyAccent(getUserAccent(username));
            showStreakBanner(username);
            refresh();
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') { closeProfile(); closeBookmarks(); }
        });
    });

})();
