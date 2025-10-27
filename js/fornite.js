// script.js - Animaciones Adicionales para Fortnite Feel

document.addEventListener('DOMContentLoaded', function() {
    // Animación de conteo para stats
    const counters = document.querySelectorAll('.animate-count');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });

    // Parallax para estrellas en header (simple)
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const stars = document.querySelector('.stars-bg');
        stars.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    // Hover effects en threads
    const threads = document.querySelectorAll('.thread-item a');
    threads.forEach(thread => {
        thread.addEventListener('mouseenter', () => {
            thread.style.transform = 'scale(1.02)';
        });
        thread.addEventListener('mouseleave', () => {
            thread.style.transform = 'scale(1)';
        });
    });
});