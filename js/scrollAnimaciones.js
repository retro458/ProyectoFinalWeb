class AdvancedScrollAnimator {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        // Configurar el observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateIn(entry.target);
                } else {
                    // Opcional: animar al salir
                    // this.animateOut(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });
        
        // Agregar la clase inicial a todos los elementos
        document.querySelectorAll('.card-scroll').forEach(card => {
            card.classList.add('card-scroll');
            this.observer.observe(card);
        });
    }
    
    animateIn(element) {
        element.classList.add('visible');
        
        // Efecto adicional para elementos específicos
        if (element.classList.contains('featured')) {
            element.style.transform = 'scale(1.02)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

// Inicializar
new AdvancedScrollAnimator();