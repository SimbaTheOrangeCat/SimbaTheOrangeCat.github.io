/**
 * Supabase client — initialised once, shared across all scripts via window._sb
 */
(function () {
    const { createClient } = window.supabase;
    window._sb = createClient(
        'https://fzlywtsfdumdoxaijhxj.supabase.co',
        'sb_publishable_Ix5OyvGLKZRlSSlDC39oHQ_jdN8L-rs'
    );
})();
