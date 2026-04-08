/**
 * Mindfactor Comment System — Supabase Edition
 * - Comments stored in Supabase `comments` table, keyed by post_path
 * - Replies are top-level rows with parent_id set
 * - Admin can delete any comment; users can delete their own
 */
(function () {
    const sb      = window._sb;
    const path    = location.pathname;

    const esc     = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const dateStr = ts => new Date(ts).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    const initials = n => n.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0,2).join('');
    const color    = n => ['#c0a06a','#a07850','#8c6c5e','#7a8c70','#6c8c8a','#8c7a6c','#b08c6a','#9c8c70','#7c9c8c','#8c6c7a']
                           [(Array.from(n).reduce((h,c) => h + c.charCodeAt(0), 0)) % 10];

    const isAdmin    = () => window.MFAuth?.isAdmin();
    const isLoggedIn = () => window.MFAuth?.isLoggedIn();
    const getSession = () => window.MFAuth?.getSession();

    const verifiedBadge = '<span class="c-verified" title="Verified reader">✓ Verified</span>';

    // ── Render ─────────────────────────────────────────────────────────────
    async function renderComments() {
        const list    = document.getElementById('comments-list');
        const countEl = document.getElementById('comments-count');
        const empty   = document.getElementById('comments-empty');
        if (!list) return;

        // Fetch all comments for this page (top-level and replies)
        const { data: all, error } = await sb
            .from('comments')
            .select('id, user_id, author_name, content, parent_id, created_at')
            .eq('post_path', path)
            .order('created_at', { ascending: true });

        if (error) { console.error('Comments load error:', error); return; }

        const topLevel = (all || []).filter(c => !c.parent_id);
        const replies  = (all || []).filter(c =>  c.parent_id);
        const session  = getSession();
        const admin    = isAdmin();
        const loggedIn = isLoggedIn();

        countEl.textContent = topLevel.length;
        if (!topLevel.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        list.innerHTML = topLevel.map((c, ci) => {
            const myComment    = session && (c.user_id === session.id);
            const isVerified   = !!c.user_id;
            const postReplies  = replies.filter(r => r.parent_id === c.id);
            const repliesHtml  = renderReplies(postReplies, c.id, admin, session);

            return `
            <div class="comment-card" id="cc-${c.id}" style="animation-delay:${ci*60}ms">
                <div class="comment-avatar" style="background:${color(c.author_name)}">${initials(c.author_name)}</div>
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="comment-author">${esc(c.author_name)}</span>
                        ${isVerified ? verifiedBadge : ''}
                        <span class="comment-date">${dateStr(c.created_at)}</span>
                        ${(admin || myComment) ? `<button class="comment-delete-btn c-del-btn" data-id="${c.id}" title="Delete">🗑 Delete</button>` : ''}
                    </div>
                    <p class="comment-text">${esc(c.content).replace(/\n/g,'<br>')}</p>
                    ${repliesHtml}
                    ${loggedIn ? `<button class="c-reply-toggle" data-id="${c.id}">↩ Reply</button>` : ''}
                    <div class="c-reply-form" id="rf-${c.id}" style="display:none">
                        <textarea class="c-reply-ta" id="rta-${c.id}" placeholder="Write a reply…" maxlength="500"></textarea>
                        <div style="display:flex;gap:8px;margin-top:6px;">
                            <button class="c-reply-post" data-id="${c.id}">Post Reply</button>
                            <button class="c-reply-cancel" data-id="${c.id}">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        bindListeners();
    }

    function renderReplies(replies, parentId, admin, session) {
        if (!replies.length) return '';
        return `<div class="c-replies">${replies.map(r => {
            const myReply  = session && (r.user_id === session.id);
            const verified = !!r.user_id;
            return `
            <div class="c-reply-card">
                <div class="c-avatar sm" style="background:${color(r.author_name)}">${initials(r.author_name)}</div>
                <div class="c-body">
                    <div class="c-header">
                        <span class="c-author">${esc(r.author_name)}</span>
                        ${verified ? verifiedBadge : ''}
                        <span class="c-date">${dateStr(r.created_at)}</span>
                        ${(admin || myReply) ? `<button class="c-del-btn" data-id="${r.id}" title="Delete">🗑</button>` : ''}
                    </div>
                    <p class="c-text">${esc(r.content).replace(/\n/g,'<br>')}</p>
                </div>
            </div>`;
        }).join('')}</div>`;
    }

    function bindListeners() {
        const list = document.getElementById('comments-list');
        if (!list) return;

        // Delete
        list.querySelectorAll('.c-del-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this comment?')) return;
                await sb.from('comments').delete().eq('id', btn.dataset.id);
                renderComments();
            });
        });

        // Reply toggle
        list.querySelectorAll('.c-reply-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const rf   = document.getElementById('rf-' + btn.dataset.id);
                const open = rf.style.display === 'block';
                rf.style.display = open ? 'none' : 'block';
                btn.textContent  = open ? '↩ Reply' : '✕ Cancel';
                if (!open) document.getElementById('rta-' + btn.dataset.id)?.focus();
            });
        });

        // Post reply
        list.querySelectorAll('.c-reply-post').forEach(btn => {
            btn.addEventListener('click', async () => {
                const parentId = btn.dataset.id;
                const ta       = document.getElementById('rta-' + parentId);
                const text     = ta?.value.trim();
                if (!text) return;
                const session = getSession();
                await sb.from('comments').insert({
                    user_id:     session?.id || null,
                    post_path:   path,
                    author_name: session?.username || 'Anonymous',
                    content:     text,
                    parent_id:   parentId,
                });
                renderComments();
            });
        });

        // Cancel reply
        list.querySelectorAll('.c-reply-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                document.getElementById('rf-' + id).style.display = 'none';
                const toggle = list.querySelector(`.c-reply-toggle[data-id="${id}"]`);
                if (toggle) toggle.textContent = '↩ Reply';
            });
        });
    }

    window.MFCommentsRefresh = () => { renderComments(); syncForm(); };

    // ── Auto-fill name ─────────────────────────────────────────────────────
    function syncForm() {
        const nameInput = document.getElementById('comment-name');
        if (!nameInput) return;
        const session = getSession();
        if (session) {
            nameInput.value    = session.username;
            nameInput.readOnly = true;
            nameInput.style.opacity = '.75';
            const wrap = nameInput.closest('.comment-input-wrap');
            if (wrap && !wrap.querySelector('.c-session-hint')) {
                const hint = document.createElement('span');
                hint.className = 'c-session-hint';
                hint.innerHTML = `✓ Signed in as <strong>${session.username}</strong>`;
                wrap.appendChild(hint);
            }
        } else {
            nameInput.readOnly = false;
            nameInput.value    = '';
            nameInput.style.opacity = '';
            document.querySelectorAll('.c-session-hint').forEach(el => el.remove());
        }
    }

    // ── Submit ─────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        const nameInput  = document.getElementById('comment-name');
        const textInput  = document.getElementById('comment-text');
        const submitBtn  = document.getElementById('comment-submit');
        const successMsg = document.getElementById('comment-success');

        const session = getSession();
        const name    = nameInput.value.trim();
        const text    = textInput.value.trim();
        if (!name || !text) return;

        submitBtn.disabled = true;

        const { error } = await sb.from('comments').insert({
            user_id:     session?.id || null,
            post_path:   path,
            author_name: name,
            content:     text,
            parent_id:   null,
        });

        if (error) { console.error('Comment error:', error); submitBtn.disabled = false; return; }

        textInput.value = '';
        if (!session) nameInput.value = '';

        submitBtn.textContent = '✓ Posted!';
        submitBtn.classList.add('comment-btn--success');
        if (successMsg) successMsg.style.display = 'block';

        setTimeout(() => {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Post Comment';
            submitBtn.classList.remove('comment-btn--success');
            if (successMsg) successMsg.style.display = 'none';
        }, 2500);

        renderComments();
    }

    function charCount() {
        const ta = document.getElementById('comment-text');
        const ct = document.getElementById('char-count');
        if (!ta || !ct) return;
        ta.addEventListener('input', () => {
            const l = ta.value.length;
            ct.textContent = `${l} / 1000`;
            ct.style.color = l > 900 ? '#c0826a' : '';
        });
    }

    // ── Styles ─────────────────────────────────────────────────────────────
    function injectStyles() {
        const s = document.createElement('style');
        s.textContent = `
        .c-verified { font-size:.7rem; font-weight:700; color:#7aad7a; background:rgba(122,173,122,.12); padding:2px 7px; border-radius:999px; margin-left:4px; }
        .c-session-hint { font-size:.78rem; color:var(--text-secondary); margin-top:4px; }
        .c-session-hint strong { color:var(--accent-color); }
        .c-replies { margin-top:12px; padding-left:16px; border-left:2px solid var(--border-color); display:flex; flex-direction:column; gap:12px; }
        .c-reply-card { display:flex; gap:10px; }
        .c-avatar.sm { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:.72rem; font-weight:700; flex-shrink:0; }
        .c-body { flex:1; }
        .c-header { display:flex; align-items:baseline; flex-wrap:wrap; gap:6px; margin-bottom:4px; }
        .c-author { font-weight:600; font-size:.9rem; color:var(--text-primary); }
        .c-date   { font-size:.75rem; color:var(--text-secondary); }
        .c-text   { font-size:.9rem; line-height:1.65; color:var(--text-primary); margin:0; }
        .c-del-btn { background:none; border:none; font-size:.75rem; cursor:pointer; padding:2px 6px; color:var(--text-secondary); border-radius:5px; transition:background .15s,color .15s; margin-left:auto; }
        .c-del-btn:hover { background:rgba(192,82,82,.1); color:#c05252; }
        .c-reply-toggle { display:inline-block; margin-top:10px; background:none; border:none; font-size:.82rem; color:var(--text-secondary); cursor:pointer; padding:4px 0; font-family:inherit; transition:color .2s; }
        .c-reply-toggle:hover { color:var(--accent-color); }
        .c-reply-form  { margin-top:10px; }
        .c-reply-ta    { width:100%; min-height:70px; padding:10px 13px; border:1.5px solid var(--border-color); border-radius:9px; background:var(--bg-color); color:var(--text-primary); font-family:inherit; font-size:.9rem; line-height:1.55; resize:none; outline:none; box-sizing:border-box; transition:border-color .25s; }
        .c-reply-ta:focus { border-color:var(--accent-color); }
        .c-reply-post  { background:var(--accent-color); color:#fff; border:none; border-radius:7px; padding:7px 16px; font-family:inherit; font-size:.85rem; font-weight:600; cursor:pointer; transition:background .2s; }
        .c-reply-post:hover { background:var(--accent-hover); }
        .c-reply-cancel { background:none; border:1px solid var(--border-color); border-radius:7px; padding:7px 14px; font-family:inherit; font-size:.85rem; cursor:pointer; color:var(--text-secondary); transition:border-color .2s; }
        .c-reply-cancel:hover { border-color:var(--accent-color); }
        `;
        document.head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        renderComments();
        syncForm();
        const form = document.getElementById('comment-form');
        if (form) form.addEventListener('submit', handleSubmit);
        charCount();
    });

})();
