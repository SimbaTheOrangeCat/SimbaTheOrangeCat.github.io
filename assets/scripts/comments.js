/**
 * Mindfactor Comment System
 * - Stores comments in localStorage, keyed by the current page URL path.
 * - No login required to comment (name + message).
 * - Admin (via MFAuth) can delete any comment.
 */

(function () {
    const storageKey = 'mf_comments_' + window.location.pathname;

    function getComments() {
        try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
        catch { return []; }
    }

    function saveComments(comments) {
        localStorage.setItem(storageKey, JSON.stringify(comments));
    }

    function formatDate(ts) {
        return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function getInitials(name) {
        return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
    }

    function avatarColor(name) {
        const colors = ['#c0a06a','#a07850','#8c6c5e','#7a8c70','#6c8c8a','#8c7a6c','#b08c6a','#9c8c70','#7c9c8c','#8c6c7a'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % colors.length;
        return colors[hash];
    }

    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function isAdmin() {
        return window.MFAuth && window.MFAuth.isAdmin();
    }

    function deleteComment(index) {
        const comments = getComments();
        comments.splice(index, 1);
        saveComments(comments);
        renderComments();
    }

    function renderComments() {
        const list    = document.getElementById('comments-list');
        const countEl = document.getElementById('comments-count');
        const empty   = document.getElementById('comments-empty');
        if (!list) return;

        const comments = getComments();
        countEl.textContent = comments.length;

        if (comments.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        const adminMode = isAdmin();

        list.innerHTML = comments.map((c, i) => `
            <div class="comment-card" style="animation-delay: ${i * 60}ms">
                <div class="comment-avatar" style="background: ${avatarColor(c.name)}">${getInitials(c.name)}</div>
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(c.name)}</span>
                        <span class="comment-date">${formatDate(c.timestamp)}</span>
                        ${adminMode ? `<button class="comment-delete-btn" data-index="${i}" title="Delete comment">🗑 Delete</button>` : ''}
                    </div>
                    <p class="comment-text">${escapeHtml(c.text).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');

        // Attach delete handlers
        if (adminMode) {
            list.querySelectorAll('.comment-delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index, 10);
                    if (confirm('Delete this comment?')) deleteComment(idx);
                });
            });
        }
    }

    // Expose refresh hook for auth.js (re-render after login/logout)
    window.MFCommentsRefresh = renderComments;

    function handleSubmit(e) {
        e.preventDefault();
        const nameInput  = document.getElementById('comment-name');
        const textInput  = document.getElementById('comment-text');
        const submitBtn  = document.getElementById('comment-submit');
        const successMsg = document.getElementById('comment-success');

        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        if (!name || !text) return;

        const comments = getComments();
        comments.push({ name, text, timestamp: Date.now() });
        saveComments(comments);

        nameInput.value = '';
        textInput.value = '';

        submitBtn.disabled = true;
        submitBtn.textContent = '✓ Posted!';
        submitBtn.classList.add('comment-btn--success');
        successMsg.style.display = 'block';

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post Comment';
            submitBtn.classList.remove('comment-btn--success');
            successMsg.style.display = 'none';
        }, 2500);

        renderComments();

        setTimeout(() => {
            const last = document.querySelector('#comments-list .comment-card:last-child');
            if (last) last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    function charCount() {
        const textInput = document.getElementById('comment-text');
        const counter   = document.getElementById('char-count');
        if (!textInput || !counter) return;
        textInput.addEventListener('input', () => {
            const len = textInput.value.length;
            counter.textContent = `${len} / 1000`;
            counter.style.color = len > 900 ? '#c0826a' : '';
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderComments();
        const form = document.getElementById('comment-form');
        if (form) form.addEventListener('submit', handleSubmit);
        charCount();
    });
})();
