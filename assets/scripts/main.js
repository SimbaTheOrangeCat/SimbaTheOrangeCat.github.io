// main.js

// Disable browser scroll restoration so it doesn't conflict with page animations
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

document.addEventListener('DOMContentLoaded', () => {
    // === 0. Dreamy Sky Background ===
    (function buildSkyCanvas() {
        const canvas = document.createElement('div');
        canvas.id = 'sky-canvas';

        // Cloud configurations: each drifts slowly across the viewport
        const clouds = [
            { w: 520, h: 280, top: '4%',  dur: 52, delay:   0, opacity: 0.52, sway: '-22px' },
            { w: 360, h: 200, top: '18%', dur: 44, delay: -12, opacity: 0.46, sway:  '18px' },
            { w: 640, h: 260, top: '32%', dur: 62, delay: -28, opacity: 0.38, sway: '-14px' },
            { w: 420, h: 230, top: '50%', dur: 57, delay:  -8, opacity: 0.42, sway:  '24px' },
            { w: 300, h: 170, top: '14%', dur: 39, delay: -34, opacity: 0.48, sway: '-10px' },
            { w: 560, h: 220, top: '65%', dur: 68, delay: -18, opacity: 0.32, sway:  '16px' },
            { w: 390, h: 210, top: '78%', dur: 48, delay: -42, opacity: 0.35, sway: '-20px' },
        ];

        clouds.forEach(cfg => {
            const el = document.createElement('div');
            el.className = 'sky-cloud';
            el.style.cssText = `
                width:${cfg.w}px; height:${cfg.h}px;
                top:${cfg.top};
                animation-duration:${cfg.dur}s;
                animation-delay:${cfg.delay}s;
                --cloud-max-opacity:${cfg.opacity};
                --cloud-sway:${cfg.sway};
            `;
            canvas.appendChild(el);
        });

        // Subtle sparkle dots scattered across the sky
        for (let i = 0; i < 18; i++) {
            const sp = document.createElement('div');
            sp.className = 'sky-sparkle';
            const size = Math.random() * 3 + 2;
            sp.style.cssText = `
                width:${size}px; height:${size}px;
                top:${Math.random() * 70}%;
                left:${Math.random() * 100}%;
                animation-duration:${(Math.random() * 3 + 2).toFixed(1)}s;
                animation-delay:${(Math.random() * 4).toFixed(1)}s;
            `;
            canvas.appendChild(sp);
        }

        document.body.prepend(canvas);
    })();

    // === 1. Smooth Fade-in Scrolling Animations ===
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.style.filter = 'blur(0px)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.98)';
        el.style.filter = 'blur(2px)';
        // Stagger transitions slightly based on index
        el.style.transition = `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.05}s, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.05}s, filter 0.7s ease ${i * 0.05}s`;
        animateOnScroll.observe(el);
    });

    // === 3. Header Scrolled State (Glassmorphism shadow) ===
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // === 4. Reading Progress Bar ===
    const progressBar = document.getElementById('reading-progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }, { passive: true });
    }
});
