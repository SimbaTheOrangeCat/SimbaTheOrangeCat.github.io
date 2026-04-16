// main.js

// Disable browser scroll restoration so it doesn't conflict with page animations
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

document.addEventListener('DOMContentLoaded', () => {

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

    // === 5. Dreamy Sky Cloud Generator ===
    const sky = document.createElement('div');
    sky.id = 'sky-canvas';
    document.body.appendChild(sky);
    
    // Create subtle moving clouds
    for(let i=0; i<3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'sky-cloud';
        // Randomize size between 300px and 800px
        cloud.style.width = Math.random() * 500 + 300 + 'px';
        cloud.style.height = Math.random() * 120 + 80 + 'px';
        // Placed across the top and middle horizon randomly
        cloud.style.top = Math.random() * 60 + '%';
        // Drift across screen slowly: between 50s and 100s
        cloud.style.animationDuration = Math.random() * 50 + 50 + 's';
        // Start them at different times so it looks natural
        cloud.style.animationDelay = Math.random() * -60 + 's';
        
        // Use the CSS vars defined in our stylesheet
        cloud.style.setProperty('--cloud-max-opacity', Math.random() * 0.15 + 0.08);
        cloud.style.setProperty('--cloud-sway', Math.random() * 60 - 30 + 'px');
        
        sky.appendChild(cloud);
    }

});
