// main.js

document.addEventListener('DOMContentLoaded', () => {
    // === 1. Dark Mode Toggle ===
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // Define icons for the button
    const moonIcon = '🌙';
    const sunIcon = '☀️';

    // Get current theme from local storage or fallback to system preference
    const currentTheme = localStorage.getItem("theme");
    
    // On load, apply the right theme
    if (currentTheme == "dark") {
        document.documentElement.classList.add("dark-mode");
        if (themeToggle) themeToggle.textContent = sunIcon;
    } else if (currentTheme == "light") {
        document.documentElement.classList.remove("dark-mode");
        if (themeToggle) themeToggle.textContent = moonIcon;
    } else if (prefersDarkScheme.matches) {
        document.documentElement.classList.add("dark-mode");
        if (themeToggle) themeToggle.textContent = sunIcon;
    } else {
        if (themeToggle) themeToggle.textContent = moonIcon;
    }

    // Toggle button event listener
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark-mode");
            let theme = "light";
            
            if (document.documentElement.classList.contains("dark-mode")) {
                theme = "dark";
                themeToggle.textContent = sunIcon;
            } else {
                themeToggle.textContent = moonIcon;
            }
            // Save the choice in local storage
            localStorage.setItem("theme", theme);
        });
    }

    // === 2. Smooth Fade-in Scrolling Animations ===
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
