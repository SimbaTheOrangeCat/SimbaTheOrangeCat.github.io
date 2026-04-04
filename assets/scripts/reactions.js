/**
 * Mindfactor Reactions System
 * - 5 emoji reactions per blog post
 * - Requires login to react (MFAuth integration)
 * - Counts stored in localStorage per post
 * - Per-user reaction tracked so users can toggle/change
 */

(function () {
    const REACTIONS = [
        { emoji: '❤️',  label: 'Loved it' },
        { emoji: '🙏',  label: 'Helpful' },
        { emoji: '🤔',  label: 'Made me think' },
        { emoji: '✨',  label: 'Beautiful' },
        { emoji: '💪',  label: 'Empowering' },
    ];

    const path       = window.location.pathname;
    const COUNTS_KEY = 'mf_reactions_' + path;
    const USERS_KEY  = 'mf_user_reactions_' + path;

    // ── Storage helpers ────────────────────────────────────────────────────
    function getCounts() {
        try { return JSON.parse(localStorage.getItem(COUNTS_KEY)) || {}; }
        catch { return {}; }
    }
    function getUserReactions() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
        catch { return {}; }
    }
    function getMyReaction() {
        const session = window.MFAuth && window.MFAuth.getSession();
        if (!session) return null;
        return getUserReactions()[session.username] || null;
    }

    // ── React / un-react / change ─────────────────────────────────────────
    function toggleReaction(emoji) {
        const session = window.MFAuth && window.MFAuth.getSession();
        if (!session) return false;

        const counts       = getCounts();
        const userReacts   = getUserReactions();
        const current      = userReacts[session.username];

        if (current === emoji) {
            // Toggle off — remove reaction
            counts[current] = Math.max(0, (counts[current] || 1) - 1);
            delete userReacts[session.username];
        } else {
            if (current) {
                // Remove old reaction
                counts[current] = Math.max(0, (counts[current] || 1) - 1);
            }
            // Add new reaction
            counts[emoji] = (counts[emoji] || 0) + 1;
            userReacts[session.username] = emoji;
        }

        localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
        localStorage.setItem(USERS_KEY,  JSON.stringify(userReacts));
        return true;
    }

    // ── Render ────────────────────────────────────────────────────────────
    function renderReactions() {
        const bar  = document.getElementById('reactions-bar');
        const hint = document.getElementById('reactions-login-hint');
        if (!bar) return;

        const counts    = getCounts();
        const myReact   = getMyReaction();
        const isLoggedIn = window.MFAuth && window.MFAuth.isLoggedIn();

        bar.innerHTML = REACTIONS.map(r => {
            const count      = counts[r.emoji] || 0;
            const isSelected = myReact === r.emoji;
            return `
                <button class="reaction-btn${isSelected ? ' reaction-btn--active' : ''}"
                        data-emoji="${r.emoji}"
                        title="${r.label}"
                        aria-label="${r.label}${count ? ': ' + count : ''}"
                        aria-pressed="${isSelected}">
                    <span class="reaction-emoji">${r.emoji}</span>
                    <span class="reaction-label">${r.label}</span>
                    ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
                </button>
            `;
        }).join('');

        if (hint) {
            if (isLoggedIn) {
                const myReactObj = REACTIONS.find(r => r.emoji === myReact);
                hint.innerHTML   = myReact
                    ? `<span class="reactions-hint--chosen">You reacted with ${myReact} — click again to remove</span>`
                    : `<span>Click a reaction to let me know how this post made you feel.</span>`;
            } else {
                hint.innerHTML = `<span class="reactions-hint--login">Sign in to leave a reaction ↑</span>`;
            }
        }

        // Attach click handlers
        bar.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!isLoggedIn) {
                    // Pulse the hint to prompt login
                    if (hint) {
                        hint.classList.add('reactions-hint--pulse');
                        setTimeout(() => hint.classList.remove('reactions-hint--pulse'), 700);
                    }
                    return;
                }
                const emoji   = btn.dataset.emoji;
                const changed = toggleReaction(emoji);
                if (changed) {
                    btn.classList.add('reaction-btn--pop');
                    setTimeout(() => renderReactions(), 50);
                }
            });
        });
    }

    // ── Inject Styles ─────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('mf-reactions-styles')) return;
        const style = document.createElement('style');
        style.id = 'mf-reactions-styles';
        style.textContent = `
        /* ── Reactions Section ─────────────────────────────── */
        .reactions-section {
            max-width: 680px;
            margin: 48px auto 0;
            padding: 28px 32px;
            background: var(--surface-color, #fff);
            border: 1px solid var(--border-color);
            border-radius: 18px;
            text-align: center;
        }

        .reactions-label {
            font-family: 'Lora', serif;
            font-size: 1.05rem;
            font-style: italic;
            color: var(--text-primary);
            margin-bottom: 20px;
            letter-spacing: 0.01em;
        }

        .reactions-bar {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 14px;
        }

        /* ── Reaction Buttons ──────────────────────────────── */
        .reaction-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 10px 18px;
            border: 1.5px solid var(--border-color);
            border-radius: 999px;
            background: transparent;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-size: 0.88rem;
            font-weight: 500;
            color: var(--text-secondary);
            transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.18s, box-shadow 0.2s;
            user-select: none;
            position: relative;
        }

        .reaction-btn:hover {
            border-color: var(--accent-color, #CD9575);
            color: var(--text-primary);
            transform: translateY(-2px);
            background: rgba(205, 149, 117, 0.06);
            box-shadow: 0 4px 12px rgba(205, 149, 117, 0.12);
        }

        .reaction-btn--active {
            background: var(--accent-color, #CD9575);
            border-color: var(--accent-color, #CD9575);
            color: #fff;
            box-shadow: 0 4px 16px rgba(205, 149, 117, 0.35);
        }

        .reaction-btn--active:hover {
            background: var(--accent-hover, #b58062);
            border-color: var(--accent-hover, #b58062);
            color: #fff;
        }

        .reaction-emoji {
            font-size: 1.15rem;
            line-height: 1;
        }

        .reaction-label {
            font-weight: 500;
        }

        .reaction-count {
            background: rgba(255, 255, 255, 0.28);
            color: inherit;
            font-size: 0.78rem;
            font-weight: 700;
            padding: 1px 8px;
            border-radius: 999px;
            min-width: 22px;
            text-align: center;
        }

        .reaction-btn:not(.reaction-btn--active) .reaction-count {
            background: rgba(0, 0, 0, 0.07);
        }

        :root.dark-mode .reaction-btn:not(.reaction-btn--active) .reaction-count {
            background: rgba(255, 255, 255, 0.1);
        }

        /* ── Pop animation ─────────────────────────────────── */
        @keyframes reactionPop {
            0%   { transform: scale(1); }
            35%  { transform: scale(1.18) translateY(-3px); }
            65%  { transform: scale(0.95); }
            100% { transform: scale(1); }
        }

        .reaction-btn--pop {
            animation: reactionPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* ── Hint text ─────────────────────────────────────── */
        .reactions-login-hint {
            font-size: 0.83rem;
            color: var(--text-secondary);
            min-height: 22px;
            margin-bottom: 0;
            transition: color 0.2s;
        }

        .reactions-hint--login {
            cursor: pointer;
            color: var(--accent-color, #CD9575);
            font-weight: 500;
        }

        .reactions-hint--chosen {
            color: var(--accent-color, #CD9575);
            font-weight: 500;
        }

        @keyframes hintPulse {
            0%   { opacity: 1; transform: scale(1); }
            40%  { opacity: 1; transform: scale(1.04); color: var(--accent-color); }
            100% { opacity: 1; transform: scale(1); }
        }

        .reactions-hint--pulse {
            animation: hintPulse 0.7s ease both;
            color: var(--accent-color, #CD9575) !important;
            font-weight: 600 !important;
        }

        /* ── Mobile: hide labels, show only emoji ──────────── */
        @media (max-width: 520px) {
            .reaction-label { display: none; }
            .reaction-btn { padding: 10px 14px; gap: 5px; }
            .reactions-section { padding: 22px 16px; }
        }
        `;
        document.head.appendChild(style);
    }

    // ── Expose refresh hook (called by auth.js on login/logout) ────────────
    window.MFReactionsRefresh = renderReactions;

    // ── Init ──────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        renderReactions();

        // Make the login hint clickable to open the auth modal
        const hint = document.getElementById('reactions-login-hint');
        if (hint) {
            hint.addEventListener('click', () => {
                if (window.MFAuth && !window.MFAuth.isLoggedIn()) {
                    // Trigger the header login button
                    const loginBtn = document.getElementById('auth-header-btn');
                    if (loginBtn) loginBtn.click();
                }
            });
        }
    });
})();
