class KonamiCode {
    constructor() {
        this.sequence = [
            'ArrowUp', 'ArrowUp',
            'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight',
            'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        this.input = [];
        this.isActive = false;
        this.debug = true;

        this.init();
    }

    init() {
        // En vez de un callback anónimo, usamos una función de instancia.
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        console.log('🎮 Konami Code inicializado. Usa: ↑↑↓↓←→←→BA');
    }

    handleKeyDown(e) {
        if (this.isActive) return;

        const key = e.code;
        const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

        if (!validKeys.includes(key)) {
            // Si la tecla no es parte de la secuencia, reseteamos la entrada.
            this.input = [];
            return;
        }
        
        if (this.debug) {
            console.log('🔑 Tecla presionada:', { key: e.key, code: e.code });
        }

        this.input.push(key);

        // Mantenemos solo los últimos inputs necesarios.
        const requiredLength = this.sequence.length;
        if (this.input.length > requiredLength) {
            this.input.shift();
        }
        
        if (this.debug) {
            console.log('📋 Secuencia actual:', this.input);
        }

        // Ahora comparamos los arrays de manera segura.
        // `every` comprueba si todos los elementos del array `input`
        // coinciden con los de `sequence` en la misma posición.
        const isMatch = this.input.length === requiredLength &&
                        this.input.every((value, index) => value === this.sequence[index]);

        if (isMatch) {
            console.log('🎉 ¡SECUENCIA CORRECTA! Activando Easter Egg...');
            this.activateEasterEgg();
        }
    }

    activateEasterEgg() {
        if (this.isActive) return;
        this.isActive = true;

        console.log('🚀 Easter Egg activado!');

        this.showRedirectionEffect();

        setTimeout(() => {
            console.log('📍 Redirigiendo a juego.html...');
            window.location.href = '../html/juego.html';
        }, 2000);
    }

    showRedirectionEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 2rem;
            text-align: center;
        `;

        effect.innerHTML = `
            <div>
                <h1 style="color: gold; margin-bottom: 20px;">🎮 EASTER EGG DESBLOQUEADO!</h1>
                <p>Redirigiendo a <strong>A Song of Kings and Knights</strong>...</p>
                <div style="margin-top: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 5px solid rgba(255,255,255,0.3);
                        border-top: 5px solid gold;
                        border-radius: 50%;
                        margin: 0 auto;
                        animation: spin 1s linear infinite;
                    "></div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        document.body.appendChild(effect);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new KonamiCode();
});
