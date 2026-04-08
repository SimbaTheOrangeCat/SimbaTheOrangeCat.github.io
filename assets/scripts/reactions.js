/**
 * Mindfactor Reactions System — Supabase Edition
 * - Reactions stored in Supabase `reactions` table
 * - One reaction per user per post (unique constraint on user_id + post_path)
 * - Counts aggregated in JS from fetched rows
 */
(function () {
    const sb   = window._sb;
    const path = window.location.pathname;

    const REACTIONS = [
        { emoji: '❤️',  label: 'Loved it'      },
        { emoji: '🙏',  label: 'Helpful'        },
        { emoji: '🤔',  label: 'Made me think'  },
        { emoji: '✨',  label: 'Beautiful'      },
        { emoji: '💪',  label: 'Empowering'     },
    ];

    let _allReactions = []; // cached rows from DB: { id, user_id, emoji }

    // ── Fetch reactions ────────────────────────────────────────────────────
    async function loadReactions() {
        const { data, error } = await sb.from('reactions').select('id, user_id, emoji').eq('post_path', path);
        if (!error) _allReactions = data || [];
    }

    function getMyReaction() {
        const session = window.MFAuth?.getSession();
        if (!session) return null;
        return _allReactions.find(r => r.user_id === session.id)?.emoji || null;
    }

    function countFor(emoji) {
        return _allReactions.filter(r => r.emoji === emoji).length;
    }

    // ── Toggle reaction ────────────────────────────────────────────────────
    async function toggleReaction(emoji) {
        const session = window.MFAuth?.getSession();
        if (!session) return false;

        const current = getMyReaction();

        if (current === emoji) {
            // Remove reaction
            await sb.from('reactions').delete().eq('user_id', session.id).eq('post_path', path);
        } else {
            // Upsert (remove old + add new via unique constraint upsert)
            await sb.from('reactions').upsert(
                { user_id: session.id, post_path: path, emoji },
                { onConflict: 'user_id,post_path' }
            );
        }
        await loadReactions();
        return true;
    }

    // ── Render ─────────────────────────────────────────────────────────────
    async function renderReactions() {
        const bar  = document.getElementById('reactions-bar');
        const hint = document.getElementById('reactions-login-hint');
        if (!bar) return;

        await loadReactions();

        const myReact    = getMyReaction();
        const isLoggedIn = window.MFAuth?.isLoggedIn();

        bar.innerHTML = REACTIONS.map(r => {
            const count      = countFor(r.emoji);
            const isSelected = myReact === r.emoji;
            return `
            <button class="reaction-btn${isSelected ? ' reaction-btn--active' : ''}"
                    data-emoji="${r.emoji}" title="${r.label}"
                    aria-label="${r.label}${count ? ': ' + count : ''}"
                    aria-pressed="${isSelected}">
                <span class="reaction-emoji">${r.emoji}</span>
                <span class="reaction-label">${r.label}</span>
                ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
            </button>`;
        }).join('');

        if (hint) {
            hint.innerHTML = isLoggedIn
                ? (myReact ? `<span class="reactions-hint--chosen">You reacted with ${myReact} — click again to remove</span>`
                           : `<span>Click a reaction to let me know how this post made you feel.</span>`)
                : `<span class="reactions-hint--login">Sign in to leave a reaction ↑</span>`;
        }

        bar.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!isLoggedIn) {
                    if (hint) {
                        hint.classList.add('reactions-hint--pulse');
                        setTimeout(() => hint.classList.remove('reactions-hint--pulse'), 700);
                    }
                    return;
                }
                btn.classList.add('reaction-btn--pop');
                await toggleReaction(btn.dataset.emoji);
                renderReactions();
            });
        });
    }

    // ── Styles ─────────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('mf-reactions-styles')) return;
        const style = document.createElement('style');
        style.id = 'mf-reactions-styles';
        style.textContent = `
        .reactions-section { max-width:680px; margin:48px auto 0; padding:28px 32px; background:var(--surface-color,#fff); border:1px solid var(--border-color); border-radius:18px; text-align:center; }
        .reactions-label { font-family:'Lora',serif; font-size:1.05rem; font-style:italic; color:var(--text-primary); margin-bottom:20px; }
        .reactions-bar { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-bottom:14px; }
        .reaction-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 18px; border:1.5px solid var(--border-color); border-radius:999px; background:transparent; cursor:pointer; font-family:'Inter',sans-serif; font-size:0.88rem; font-weight:500; color:var(--text-secondary); transition:border-color .2s,background .2s,color .2s,transform .18s,box-shadow .2s; user-select:none; position:relative; }
        .reaction-btn:hover { border-color:var(--accent-color,#CD9575); color:var(--text-primary); transform:translateY(-2px); background:rgba(205,149,117,.06); box-shadow:0 4px 12px rgba(205,149,117,.12); }
        .reaction-btn--active { background:var(--accent-color,#CD9575); border-color:var(--accent-color,#CD9575); color:#fff; box-shadow:0 4px 16px rgba(205,149,117,.35); }
        .reaction-btn--active:hover { background:var(--accent-hover,#b58062); border-color:var(--accent-hover,#b58062); color:#fff; }
        .reaction-emoji { font-size:1.15rem; line-height:1; }
        .reaction-count { background:rgba(255,255,255,.28); color:inherit; font-size:.78rem; font-weight:700; padding:1px 8px; border-radius:999px; min-width:22px; text-align:center; }
        .reaction-btn:not(.reaction-btn--active) .reaction-count { background:rgba(0,0,0,.07); }
        :root.dark-mode .reaction-btn:not(.reaction-btn--active) .reaction-count { background:rgba(255,255,255,.1); }
        @keyframes reactionPop { 0%{transform:scale(1)} 35%{transform:scale(1.18) translateY(-3px)} 65%{transform:scale(.95)} 100%{transform:scale(1)} }
        .reaction-btn--pop { animation:reactionPop .35s cubic-bezier(.34,1.56,.64,1) both; }
        .reactions-login-hint { font-size:.83rem; color:var(--text-secondary); min-height:22px; margin-bottom:0; transition:color .2s; }
        .reactions-hint--login { cursor:pointer; color:var(--accent-color,#CD9575); font-weight:500; }
        .reactions-hint--chosen { color:var(--accent-color,#CD9575); font-weight:500; }
        @keyframes hintPulse { 0%{opacity:1;transform:scale(1)} 40%{opacity:1;transform:scale(1.04);color:var(--accent-color)} 100%{opacity:1;transform:scale(1)} }
        .reactions-hint--pulse { animation:hintPulse .7s ease both; color:var(--accent-color,#CD9575)!important; font-weight:600!important; }
        @media (max-width:520px) { .reaction-label{display:none} .reaction-btn{padding:10px 14px;gap:5px} .reactions-section{padding:22px 16px} }
        `;
        document.head.appendChild(style);
    }

    window.MFReactionsRefresh = renderReactions;

    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        renderReactions();
        const hint = document.getElementById('reactions-login-hint');
        if (hint) {
            hint.addEventListener('click', () => {
                if (!window.MFAuth?.isLoggedIn()) {
                    document.getElementById('auth-header-btn')?.click();
                }
            });
        }
    });
})();
