/**
 * Mindfactor Features System — Supabase Edition
 * Handles: streak, bookmarks, badges, notifications, accent colour, reflections
 */
(function () {
    const sb = window._sb;

    const ALL_POSTS = [
        { title: 'Art of Mindful Breathing',                   url: 'art-of-mindful-breathing.html' },
        { title: 'The Art of Slow Living',                     url: 'art-of-slow-living.html'       },
        { title: 'A Guide to Cozy Productivity',               url: 'cozy-productivity.html'        },
        { title: 'Finding Warmth in the Minimalist Lifestyle', url: 'warmth-in-minimalism.html'     },
    ];

    const ACCENT_PRESETS = [
        { name: 'Terracotta', hex: '#CD9575' },
        { name: 'Sage Green',  hex: '#7a9e7e' },
        { name: 'Dusty Rose',  hex: '#c47e8c' },
        { name: 'Ocean Blue',  hex: '#6a8cad' },
        { name: 'Lavender',    hex: '#9b8cc4' },
        { name: 'Golden Hour', hex: '#c4a44d' },
    ];

    const getSession = () => window.MFAuth?.getSession();
    const isPost     = () => ALL_POSTS.some(p => location.pathname.endsWith(p.url));
    const postTitle  = () => document.querySelector('h1')?.textContent?.trim() || document.title;
    const darken     = hex => '#' + parseInt(hex.slice(1), 16).toString(16).padStart(6,'0')
        .match(/.{2}/g).map(c => Math.max(0, parseInt(c,16) - 28).toString(16).padStart(2,'0')).join('');

    // ── Accent colour ──────────────────────────────────────────────────────
    function applyAccent(hex) {
        if (!hex) return;
        document.documentElement.style.setProperty('--accent-color', hex);
        document.documentElement.style.setProperty('--accent-hover', darken(hex));
    }

    // Fast load from localStorage cache to prevent flash
    const cachedAccent = localStorage.getItem('mf_cached_accent');
    if (cachedAccent) applyAccent(cachedAccent);

    async function loadAndApplyAccent(userId) {
        const { data } = await sb.from('profiles').select('accent_color').eq('id', userId).single();
        const hex = data?.accent_color;
        if (hex) { applyAccent(hex); localStorage.setItem('mf_cached_accent', hex); }
    }

    // ── Streak ─────────────────────────────────────────────────────────────
    async function updateStreak(userId) {
        const today = new Date().toISOString().split('T')[0];
        const yest  = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const { data } = await sb.from('reading_streaks').select('streak_count, last_read_date').eq('user_id', userId).maybeSingle();

        let streak = data?.streak_count || 0;
        const last = data?.last_read_date;

        if (last === today) { /* no change */ }
        else if (last === yest) { streak++; }
        else { streak = 1; }

        await sb.from('reading_streaks').upsert({ user_id: userId, streak_count: streak, last_read_date: today }, { onConflict: 'user_id' });
        return streak;
    }

    async function getStreak(userId) {
        const { data } = await sb.from('reading_streaks').select('streak_count').eq('user_id', userId).maybeSingle();
        return data?.streak_count || 0;
    }

    // ── Posts read ─────────────────────────────────────────────────────────
    async function trackRead(userId) {
        if (!isPost()) return;
        const { data } = await sb.from('reading_streaks').select('posts_read').eq('user_id', userId).maybeSingle();
        const posts = data?.posts_read || [];
        if (!posts.includes(location.pathname)) {
            await sb.from('reading_streaks').upsert(
                { user_id: userId, posts_read: [...posts, location.pathname] },
                { onConflict: 'user_id' }
            );
        }
    }

    async function getPostsRead(userId) {
        const { data } = await sb.from('reading_streaks').select('posts_read').eq('user_id', userId).maybeSingle();
        return (data?.posts_read || []).length;
    }

    async function hasBadge(userId) {
        return (await getPostsRead(userId)) >= 3;
    }

    // ── Bookmarks ──────────────────────────────────────────────────────────
    async function getBookmarks(userId) {
        const { data } = await sb.from('bookmarks').select('id, post_url, post_title, created_at').eq('user_id', userId).order('created_at', { ascending: false });
        return data || [];
    }

    async function toggleBookmark(userId) {
        const url   = location.pathname;
        const title = postTitle();
        const { data: existing } = await sb.from('bookmarks').select('id').eq('user_id', userId).eq('post_url', url).maybeSingle();
        if (existing) {
            await sb.from('bookmarks').delete().eq('id', existing.id);
            return false;
        }
        await sb.from('bookmarks').insert({ user_id: userId, post_url: url, post_title: title });
        return true;
    }

    async function isBookmarked(userId) {
        const { data } = await sb.from('bookmarks').select('id').eq('user_id', userId).eq('post_url', location.pathname).maybeSingle();
        return !!data;
    }

    // ── New post notification (localStorage-only, not user-specific) ───────
    function hasNewPosts() {
        const known = JSON.parse(localStorage.getItem('mf_known_posts') || '[]');
        return ALL_POSTS.some(p => !known.includes(p.url));
    }
    function markPostsKnown() {
        localStorage.setItem('mf_known_posts', JSON.stringify(ALL_POSTS.map(p => p.url)));
    }
    if (location.pathname.endsWith('blog.html') || location.pathname === '/') markPostsKnown();

    // ── Reflection notes ───────────────────────────────────────────────────
    async function getReflection(userId) {
        const { data } = await sb.from('reflections').select('content').eq('user_id', userId).eq('post_path', location.pathname).maybeSingle();
        return data?.content || '';
    }

    async function saveReflection(userId, text) {
        await sb.from('reflections').upsert(
            { user_id: userId, post_path: location.pathname, content: text, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,post_path' }
        );
    }

    // ── Styles ─────────────────────────────────────────────────────────────
    function injectStyles() {
        const s = document.createElement('style');
        s.textContent = `
        .mf-stats-row { display:flex; padding:8px 10px 4px; gap:4px; }
        .mf-stat { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; }
        .mf-stat-val { font-size:.95rem; font-weight:700; color:var(--text-primary); }
        .mf-stat-lbl { font-size:.67rem; color:var(--text-secondary); text-align:center; }
        .mf-badge-row { text-align:center; font-size:.78rem; font-weight:700; color:#c0a06a; padding:4px 10px 8px; letter-spacing:.04em; }
        .mf-count-badge { background:var(--accent-color); color:#fff; font-size:.7rem; font-weight:700; padding:1px 6px; border-radius:999px; margin-left:4px; }
        .mf-divider { border:none; border-top:1px solid var(--border-color); margin:4px 0; }
        .mf-notif-dot { width:7px; height:7px; border-radius:50%; background:var(--accent-color); display:inline-block; margin-left:5px; vertical-align:middle; animation:mfPulse 2s ease infinite; }
        @keyframes mfPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.8)} }
        .mf-streak-banner { max-width:680px; margin:0 auto 0; padding:12px 24px; background:rgba(205,149,117,.09); border:1px solid rgba(205,149,117,.25); border-radius:12px; text-align:center; font-size:.9rem; font-weight:600; color:var(--accent-color); }
        .mf-bm-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border:1.5px solid var(--border-color); border-radius:6px; background:transparent; cursor:pointer; font-family:inherit; font-size:1rem; font-weight:500; color:var(--text-secondary); transition:all .2s; }
        .mf-bm-btn:hover { border-color:var(--accent-color); color:var(--accent-color); transform:translateY(-2px); }
        .mf-bm-btn.active { background:var(--accent-color); color:#fff; border-color:var(--accent-color); }
        .mf-reflect { max-width:680px; margin:40px auto 0; padding:22px 26px; background:var(--surface-color); border:1.5px dashed var(--border-color); border-radius:16px; }
        .mf-reflect-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .mf-reflect-title { font-family:'Lora',serif; font-size:1rem; font-style:italic; color:var(--text-primary); }
        .mf-reflect-lock { font-size:.75rem; color:var(--text-secondary); }
        .mf-reflect-ta { width:100%; min-height:88px; padding:11px 14px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--bg-color); color:var(--text-primary); font-family:inherit; font-size:.93rem; line-height:1.6; resize:none; outline:none; box-sizing:border-box; transition:border-color .25s; }
        .mf-reflect-ta:focus { border-color:var(--accent-color); }
        .mf-reflect-saved { font-size:.75rem; color:#7aad7a; margin-top:6px; opacity:0; transition:opacity .3s; }
        .mf-reflect-saved.on { opacity:1; }
        .mf-overlay { display:none; position:fixed; inset:0; z-index:9500; align-items:center; justify-content:center; }
        .mf-overlay.open { display:flex; }
        .mf-back { position:absolute; inset:0; background:rgba(30,28,26,.55); backdrop-filter:blur(6px); }
        .mf-box { position:relative; background:var(--surface-color); border:1px solid var(--border-color); border-radius:20px; padding:32px; width:100%; max-width:420px; box-shadow:0 24px 80px rgba(0,0,0,.18); animation:authBoxIn .28s cubic-bezier(.34,1.56,.64,1); z-index:1; max-height:80vh; overflow-y:auto; }
        .mf-box-close { position:absolute; top:14px; right:16px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-secondary); transition:transform .2s; }
        .mf-box-close:hover { transform:rotate(90deg); }
        .mf-box-title { font-family:'Lora',serif; font-size:1.35rem; margin-bottom:4px; }
        .mf-box-sub { font-size:.85rem; color:var(--text-secondary); margin-bottom:22px; }
        .mf-color-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
        .mf-swatch { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; padding:10px 6px; border-radius:12px; border:2px solid transparent; transition:border-color .2s,transform .15s; }
        .mf-swatch:hover { transform:translateY(-2px); }
        .mf-swatch.sel { border-color:var(--text-primary); }
        .mf-dot { width:36px; height:36px; border-radius:50%; }
        .mf-swatch-name { font-size:.72rem; color:var(--text-secondary); text-align:center; }
        .mf-save-btn { width:100%; padding:11px; background:var(--accent-color); color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:.97rem; font-weight:600; cursor:pointer; transition:background .2s,transform .15s; }
        .mf-save-btn:hover { background:var(--accent-hover); transform:translateY(-1px); }
        .mf-bm-list { display:flex; flex-direction:column; gap:10px; }
        .mf-bm-item { display:flex; align-items:center; gap:10px; padding:11px 14px; border:1px solid var(--border-color); border-radius:12px; transition:border-color .2s; }
        .mf-bm-item:hover { border-color:var(--accent-color); }
        .mf-bm-name { flex:1; font-size:.9rem; font-weight:500; color:var(--text-primary); }
        .mf-bm-read { font-size:.78rem; padding:5px 12px; background:var(--accent-color); color:#fff; border:none; border-radius:6px; cursor:pointer; font-family:inherit; text-decoration:none; }
        .mf-bm-rm { font-size:.78rem; padding:5px 10px; background:none; border:1px solid var(--border-color); border-radius:6px; cursor:pointer; color:var(--text-secondary); font-family:inherit; transition:border-color .2s,color .2s; }
        .mf-bm-rm:hover { border-color:#c05252; color:#c05252; }
        .mf-empty { text-align:center; padding:28px; color:var(--text-secondary); font-size:.9rem; }
        .mf-empty span { display:block; font-size:2rem; margin-bottom:8px; }
        `;
        document.head.appendChild(s);
    }

    // ── Notification dot ───────────────────────────────────────────────────
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

    // ── Streak banner ──────────────────────────────────────────────────────
    async function showStreakBanner(userId) {
        const streak = await getStreak(userId);
        if (streak < 2 || !isPost()) return;
        const banner = document.createElement('div');
        banner.className = 'mf-streak-banner';
        banner.textContent = `You've been reading for ${streak} day${streak !== 1 ? 's' : ''} in a row 🔥`;
        const art = document.querySelector('article.container');
        if (art) art.parentNode.insertBefore(banner, art);
    }

    // ── Bookmark button ────────────────────────────────────────────────────
    async function injectBookmarkBtn(session) {
        if (!isPost() || document.getElementById('mf-bm-btn')) return;
        const btnRow = document.querySelector('.article-footer > div');
        if (!btnRow) return;

        const active = await isBookmarked(session.id);
        const btn    = document.createElement('button');
        btn.id        = 'mf-bm-btn';
        btn.className = 'mf-bm-btn' + (active ? ' active' : '');
        btn.innerHTML = active ? '📌 Bookmarked' : '🔖 Bookmark';

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            const added = await toggleBookmark(session.id);
            btn.disabled  = false;
            btn.className = 'mf-bm-btn' + (added ? ' active' : '');
            btn.innerHTML = added ? '📌 Bookmarked' : '🔖 Bookmark';
            await refreshDropdown(session);
        });
        btnRow.appendChild(btn);
    }

    // ── Reflection ─────────────────────────────────────────────────────────
    async function injectReflection(session) {
        if (!isPost() || document.getElementById('mf-reflect')) return;
        const comments = document.getElementById('comments');
        if (!comments) return;

        const saved = await getReflection(session.id);
        const div   = document.createElement('div');
        div.id        = 'mf-reflect';
        div.className = 'mf-reflect';
        div.innerHTML = `
            <div class="mf-reflect-hd">
                <p class="mf-reflect-title">📓 My private reflection</p>
                <span class="mf-reflect-lock">🔒 Only visible to you</span>
            </div>
            <textarea class="mf-reflect-ta" id="mf-reflect-ta" maxlength="2000"
                placeholder="What did this post mean to you? Write a note for yourself...">${saved}</textarea>
            <p class="mf-reflect-saved" id="mf-reflect-saved">✓ Saved</p>`;
        comments.parentNode.insertBefore(div, comments);

        let timer;
        document.getElementById('mf-reflect-ta').addEventListener('input', e => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                await saveReflection(session.id, e.target.value);
                const sv = document.getElementById('mf-reflect-saved');
                if (sv) { sv.classList.add('on'); setTimeout(() => sv.classList.remove('on'), 2000); }
            }, 800);
        });
    }

    // ── Dropdown enhancement ───────────────────────────────────────────────
    async function refreshDropdown(session) {
        const dd = document.getElementById('user-dropdown');
        if (!dd) return;
        dd.querySelectorAll('.mf-dd').forEach(el => el.remove());

        const [streak, read, bms, badge] = await Promise.all([
            getStreak(session.id),
            getPostsRead(session.id),
            getBookmarks(session.id),
            hasBadge(session.id),
        ]);

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
        bmBtn.onclick = () => openBookmarks(session);

        const prBtn = document.createElement('button');
        prBtn.className  = 'user-dropdown-item mf-dd';
        prBtn.textContent = '🎨 Customize Profile';
        prBtn.onclick = () => openProfile(session);

        const divB   = Object.assign(document.createElement('hr'), { className: 'mf-divider mf-dd' });
        const anchor = dd.querySelector('.user-dropdown-divider');
        const logout = dd.querySelector('#logout-btn');

        if (anchor) { dd.insertBefore(stats, anchor); if (badgeEl) dd.insertBefore(badgeEl, anchor); dd.insertBefore(divA, anchor); }
        if (logout)  { dd.insertBefore(bmBtn, logout); dd.insertBefore(prBtn, logout); dd.insertBefore(divB, logout); }
    }

    // ── Profile modal ──────────────────────────────────────────────────────
    let _pickedColor = null;

    function openProfile(session) {
        document.getElementById('auth-btn-wrap')?.classList.remove('open');
        let modal = document.getElementById('mf-profile-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id        = 'mf-profile-modal';
            modal.className = 'mf-overlay';
            modal.innerHTML = `<div class="mf-back" id="mf-pm-back"></div>
                <div class="mf-box">
                    <button class="mf-box-close" id="mf-pm-x">&times;</button>
                    <h2 class="mf-box-title">Customize Profile</h2>
                    <p class="mf-box-sub">Pick your accent colour — your personal vibe on Mindfactor.</p>
                    <div class="mf-color-grid" id="mf-cgrid"></div>
                    <button class="mf-save-btn" id="mf-pm-save">Save Changes</button>
                </div>`;
            document.body.appendChild(modal);
            modal.querySelector('#mf-pm-back').onclick = closeProfile;
            modal.querySelector('#mf-pm-x').onclick    = closeProfile;
        }

        _pickedColor = localStorage.getItem('mf_cached_accent') || ACCENT_PRESETS[0].hex;
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
            applyAccent(_pickedColor);
        }));

        const saveBtn = modal.querySelector('#mf-pm-save');
        saveBtn.onclick = async () => {
            await sb.from('profiles').update({ accent_color: _pickedColor }).eq('id', session.id);
            localStorage.setItem('mf_cached_accent', _pickedColor);
            closeProfile();
        };
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeProfile() {
        const m = document.getElementById('mf-profile-modal');
        if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
    }

    // ── Bookmarks modal ────────────────────────────────────────────────────
    async function openBookmarks(session) {
        document.getElementById('auth-btn-wrap')?.classList.remove('open');
        let modal = document.getElementById('mf-bm-modal');
        if (modal) modal.remove();

        const bms = await getBookmarks(session.id);
        modal = document.createElement('div');
        modal.id        = 'mf-bm-modal';
        modal.className = 'mf-overlay';

        const listHtml = bms.length
            ? `<div class="mf-bm-list">${bms.map((b, i) => `
                <div class="mf-bm-item">
                    <span class="mf-bm-name">${b.post_title}</span>
                    <a href="${b.post_url}" class="mf-bm-read">Read →</a>
                    <button class="mf-bm-rm" data-id="${b.id}">Remove</button>
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
        modal.querySelectorAll('.mf-bm-rm').forEach(btn => btn.addEventListener('click', async () => {
            await sb.from('bookmarks').delete().eq('id', btn.dataset.id);
            await openBookmarks(session);
            await refreshDropdown(session);
        }));
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeBookmarks() {
        const m = document.getElementById('mf-bm-modal');
        if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
    }

    // ── Global refresh hook ────────────────────────────────────────────────
    async function refresh() {
        const session = getSession();
        if (!session) {
            document.getElementById('mf-bm-btn')?.remove();
            document.getElementById('mf-reflect')?.remove();
            localStorage.removeItem('mf_cached_accent');
            applyAccent('#CD9575'); // reset to default
            return;
        }
        await loadAndApplyAccent(session.id);
        await refreshDropdown(session);
        if (isPost()) {
            await injectBookmarkBtn(session);
            await injectReflection(session);
        }
    }

    window.MFFeaturesRefresh = refresh;

    // ── Init ───────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', async () => {
        injectStyles();
        addNotifDot();

        const session = getSession();
        if (session) {
            await updateStreak(session.id);
            await trackRead(session.id);
            await loadAndApplyAccent(session.id);
            await showStreakBanner(session.id);
            await refresh();
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') { closeProfile(); closeBookmarks(); }
        });
    });

})();
