/**
 * Mindfactor Journal System — Supabase Edition
 * - Journal entries stored in Supabase `journal_entries` table
 * - Images uploaded to Supabase Storage bucket `journal-images`
 * - Per-user: each user only sees and manages their own entries
 */
(function () {
    const sb = window._sb;

    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

    function formatDate(ts) {
        const d = new Date(ts);
        return d.toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })
            + ' · ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
    }

    // ── Image upload ───────────────────────────────────────────────────────
    async function uploadImages(files, userId) {
        const urls = [];
        for (const file of files) {
            const ext  = file.name.split('.').pop().toLowerCase();
            const name = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await sb.storage.from('journal-images').upload(name, file, { upsert: false });
            if (!error) {
                const { data } = sb.storage.from('journal-images').getPublicUrl(name);
                urls.push(data.publicUrl);
            }
        }
        return urls;
    }

    // ── Render ─────────────────────────────────────────────────────────────
    async function render() {
        const session = window.MFAuth?.getSession();
        const root    = document.getElementById('journal-root');
        if (!root) return;

        if (!session) {
            root.innerHTML = `
                <div class="journal-gate">
                    <div class="journal-gate-icon">📖</div>
                    <h2 class="journal-gate-title">Your personal journal awaits</h2>
                    <p class="journal-gate-subtitle">Sign in to start writing — your entries are saved securely in the cloud.</p>
                    <button class="btn journal-signin-btn" id="journal-signin-cta">Sign In to Continue</button>
                </div>`;
            document.getElementById('journal-signin-cta').addEventListener('click', () => {
                if (window.MFAuth?.openModal) window.MFAuth.openModal();
                else document.getElementById('auth-header-btn')?.click();
            });
            return;
        }

        // Fetch entries for this user
        const { data: entries, error } = await sb
            .from('journal_entries')
            .select('id, event_name, content, image_urls, created_at')
            .eq('user_id', session.id)
            .order('created_at', { ascending: false });

        if (error) { console.error('Journal load error:', error); return; }

        root.innerHTML = `
            <div class="journal-wrap">
                <div class="journal-form-card">
                    <h2 class="journal-form-title">New Entry</h2>
                    <div class="journal-field">
                        <label class="journal-label" for="journal-event">Event</label>
                        <input class="journal-input" id="journal-event" type="text"
                            placeholder="What is this entry about? (e.g. Morning walk, Work stress…)" maxlength="120" autocomplete="off" />
                    </div>
                    <div class="journal-field">
                        <label class="journal-label" for="journal-content">Journal Space</label>
                        <textarea class="journal-textarea" id="journal-content"
                            placeholder="Write freely — this is your space…" rows="8"></textarea>
                    </div>
                    <div class="journal-field">
                        <label class="journal-label" for="journal-images">Attach Images <span class="journal-optional">(optional)</span></label>
                        <label class="journal-file-label" for="journal-images">
                            <span class="journal-file-icon">📎</span>
                            <span id="journal-file-text">Choose images…</span>
                            <input type="file" id="journal-images" accept="image/*" multiple style="display:none">
                        </label>
                        <div id="journal-img-preview" class="journal-img-preview"></div>
                    </div>
                    <div class="journal-form-footer">
                        <span class="journal-user-hint">Saved to: <strong>${esc(session.username)}</strong></span>
                        <button class="btn journal-save-btn" id="journal-save-btn">Save Entry</button>
                    </div>
                    <div class="journal-save-msg" id="journal-save-msg"></div>
                </div>

                <div class="journal-past">
                    <h3 class="journal-past-title">${entries?.length ? 'Past Entries' : 'No entries yet'}</h3>
                    <div id="journal-entries-list">
                        ${(entries || []).map(e => renderEntry(e)).join('')}
                    </div>
                </div>
            </div>`;

        // Image preview
        const fileInput = document.getElementById('journal-images');
        fileInput.addEventListener('change', () => {
            const preview = document.getElementById('journal-img-preview');
            const label   = document.getElementById('journal-file-text');
            const files   = Array.from(fileInput.files);
            label.textContent = files.length ? `${files.length} image${files.length > 1 ? 's' : ''} selected` : 'Choose images…';
            preview.innerHTML = files.map(f => {
                const url = URL.createObjectURL(f);
                return `<img src="${url}" class="journal-preview-img" alt="preview">`;
            }).join('');
        });

        // Save
        document.getElementById('journal-save-btn').addEventListener('click', async () => {
            const eventVal   = document.getElementById('journal-event').value.trim();
            const contentVal = document.getElementById('journal-content').value.trim();
            const files      = Array.from(document.getElementById('journal-images').files);
            const msg        = document.getElementById('journal-save-msg');
            const saveBtn    = document.getElementById('journal-save-btn');

            if (!eventVal)   { showMsg(msg, 'Please enter an event name.', 'error');  return; }
            if (!contentVal) { showMsg(msg, 'Journal space cannot be empty.', 'error'); return; }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving…';

            let imageUrls = [];
            if (files.length) {
                showMsg(msg, 'Uploading images…', 'info');
                imageUrls = await uploadImages(files, session.id);
            }

            const { error } = await sb.from('journal_entries').insert({
                user_id:    session.id,
                event_name: eventVal,
                content:    contentVal,
                image_urls: imageUrls,
            });

            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Entry';

            if (error) { showMsg(msg, 'Failed to save. Please try again.', 'error'); return; }

            showMsg(msg, 'Entry saved!', 'success');
            render(); // full re-render to show new entry
        });

        bindDeleteButtons(session);
    }

    function renderEntry(e) {
        const imagesHtml = (e.image_urls || []).length
            ? `<div class="journal-entry-images">${e.image_urls.map(url =>
                `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" class="journal-entry-img" alt="journal image" loading="lazy"></a>`
              ).join('')}</div>`
            : '';
        return `
            <article class="journal-entry fade-up" data-id="${esc(e.id)}">
                <div class="journal-entry-header">
                    <div>
                        <h4 class="journal-entry-event">${esc(e.event_name)}</h4>
                        <span class="journal-entry-date">${formatDate(e.created_at)}</span>
                    </div>
                    <button class="journal-delete-btn" data-id="${esc(e.id)}" title="Delete entry">✕</button>
                </div>
                <p class="journal-entry-content">${esc(e.content).replace(/\n/g, '<br>')}</p>
                ${imagesHtml}
            </article>`;
    }

    function bindDeleteButtons(session) {
        document.querySelectorAll('.journal-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this journal entry? This cannot be undone.')) return;

                // Delete associated images from storage
                const entryId = btn.dataset.id;
                const { data: entry } = await sb.from('journal_entries').select('image_urls').eq('id', entryId).single();
                if (entry?.image_urls?.length) {
                    const paths = entry.image_urls.map(url => url.split('/journal-images/')[1]).filter(Boolean);
                    if (paths.length) await sb.storage.from('journal-images').remove(paths);
                }

                await sb.from('journal_entries').delete().eq('id', entryId);
                render();
            });
        });
    }

    function showMsg(el, text, type) {
        el.textContent = text;
        el.className   = 'journal-save-msg ' + type;
        clearTimeout(el._t);
        if (type !== 'info') el._t = setTimeout(() => { el.textContent = ''; el.className = 'journal-save-msg'; }, 3500);
    }

    // ── Styles ─────────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('mf-journal-styles')) return;
        const style = document.createElement('style');
        style.id = 'mf-journal-styles';
        style.textContent = `
        .journal-page-header { text-align:center; padding:60px 0 32px; }
        .journal-page-title { font-size:2.8rem; margin-bottom:12px; color:var(--text-primary); }
        .journal-page-subtitle { font-size:1.1rem; color:var(--text-secondary); }

        /* Gate */
        .journal-gate { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:80px 24px; text-align:center; }
        .journal-gate-icon { font-size:3.5rem; line-height:1; }
        .journal-gate-title { font-size:1.8rem; color:var(--text-primary); }
        .journal-gate-subtitle { color:var(--text-secondary); max-width:420px; font-size:1rem; }

        /* Layout */
        .journal-wrap { display:flex; flex-direction:column; gap:48px; padding-bottom:80px; }

        /* Form card */
        .journal-form-card { background:var(--surface-color); border:1px solid var(--border-color); border-radius:14px; padding:36px 40px; }
        .journal-form-title { font-size:1.5rem; margin-bottom:28px; color:var(--text-primary); }
        .journal-field { display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
        .journal-label { font-size:0.88rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.6px; }
        .journal-optional { font-size:0.75rem; text-transform:none; font-weight:400; color:var(--text-secondary); opacity:.7; }
        .journal-input, .journal-textarea {
            background:var(--bg-color); border:1px solid var(--border-color); border-radius:8px;
            padding:12px 16px; color:var(--text-primary); font-family:var(--font-sans); font-size:0.97rem;
            outline:none; transition:border-color .25s,box-shadow .25s; resize:vertical;
        }
        .journal-input:focus, .journal-textarea:focus { border-color:var(--accent-color); box-shadow:0 0 0 3px rgba(205,149,117,.15); }
        .journal-textarea { min-height:180px; line-height:1.7; }

        /* File input */
        .journal-file-label {
            display:inline-flex; align-items:center; gap:10px; cursor:pointer;
            padding:10px 18px; border:1.5px dashed var(--border-color); border-radius:8px;
            color:var(--text-secondary); font-size:0.9rem; transition:border-color .2s,color .2s;
            background:var(--bg-color);
        }
        .journal-file-label:hover { border-color:var(--accent-color); color:var(--accent-color); }
        .journal-file-icon { font-size:1.1rem; }

        /* Image preview */
        .journal-img-preview { display:flex; flex-wrap:wrap; gap:10px; margin-top:8px; }
        .journal-preview-img { width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid var(--border-color); }

        .journal-form-footer { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:8px; }
        .journal-user-hint { font-size:0.85rem; color:var(--text-secondary); }
        .journal-save-msg { min-height:20px; font-size:0.88rem; margin-top:10px; font-weight:500; }
        .journal-save-msg.success { color:#5a9e6f; }
        .journal-save-msg.error   { color:#c05252; }
        .journal-save-msg.info    { color:var(--text-secondary); }

        /* Past entries */
        .journal-past-title { font-size:1.5rem; color:var(--text-primary); margin-bottom:24px; padding-bottom:14px; border-bottom:1px solid var(--border-color); position:relative; }
        .journal-past-title::after { content:''; position:absolute; bottom:-1px; left:0; width:50px; height:2px; background:var(--accent-color); }
        .journal-entry { background:var(--surface-color); border:1px solid var(--border-color); border-radius:12px; padding:24px 28px; margin-bottom:20px; transition:var(--transition-smooth); }
        .journal-entry:hover { border-color:rgba(205,149,117,.4); box-shadow:0 6px 20px rgba(0,0,0,.05); transform:translateY(-2px); }
        :root.dark-mode .journal-entry:hover { box-shadow:0 6px 20px rgba(0,0,0,.3); }
        .journal-entry-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:14px; }
        .journal-entry-event { font-size:1.1rem; font-weight:600; color:var(--text-primary); margin-bottom:4px; }
        .journal-entry-date { font-size:0.8rem; color:var(--text-secondary); }
        .journal-delete-btn { background:none; border:none; cursor:pointer; color:var(--text-secondary); font-size:0.85rem; padding:4px 8px; border-radius:6px; transition:background .2s,color .2s; flex-shrink:0; }
        .journal-delete-btn:hover { background:rgba(192,82,82,.1); color:#c05252; }
        .journal-entry-content { color:var(--text-secondary); font-size:0.97rem; line-height:1.75; white-space:pre-wrap; margin-bottom:0; }

        /* Entry images */
        .journal-entry-images { display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
        .journal-entry-img { width:100px; height:100px; object-fit:cover; border-radius:8px; border:1px solid var(--border-color); transition:transform .2s,box-shadow .2s; }
        .journal-entry-img:hover { transform:scale(1.04); box-shadow:0 4px 12px rgba(0,0,0,.12); }

        @media (max-width:600px) {
            .journal-form-card { padding:24px 20px; }
            .journal-form-footer { flex-direction:column; align-items:flex-start; }
            .journal-page-title { font-size:2rem; }
        }
        `;
        document.head.appendChild(style);
    }

    // ── Soft refresh: re-renders only the entries list, leaves the form intact ──
    async function softRefresh() {
        const root    = document.getElementById('journal-root');
        if (!root) return;

        const session  = window.MFAuth?.getSession();
        const formExists = !!document.getElementById('journal-event');

        // If auth state changed (logged in/out) and form state doesn't match, do full render
        if (!session || !formExists) { return render(); }

        // User is still logged in and form exists — only refresh the entries list
        const { data: entries } = await sb
            .from('journal_entries')
            .select('id, event_name, content, image_urls, created_at')
            .eq('user_id', session.id)
            .order('created_at', { ascending: false });

        const list       = document.getElementById('journal-entries-list');
        const pastTitle  = document.querySelector('.journal-past-title');
        if (list)      list.innerHTML = (entries || []).map(e => renderEntry(e)).join('');
        if (pastTitle) pastTitle.textContent = entries?.length ? 'Past Entries' : 'No entries yet';
        bindDeleteButtons(session);
    }

    // ── Init ───────────────────────────────────────────────────────────────
    // Auth state changes (tab switch token refresh etc.) use soft refresh
    // so in-progress form content is never wiped.
    window.MFJournalRefresh = softRefresh;

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('journal-root')) return;
        injectStyles();
        render();
    });

})();
