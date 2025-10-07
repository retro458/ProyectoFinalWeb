class LoginManager {

    //Credenciales de ejemplo (Si queres Erick añadis mas vos)
    constructor() {
        this.claveSesion = 'adminSesion';
        this.credenciales = {
            usuario: 'admin',
            contraseña: 'admin123'
        };
        this.inicializarEventos();
        this.verificarSesionActiva();
    }

    inicializarEventos() {
        const form = document.getElementById('loginForm');
        const togglePassword = document.getElementById('togglePassword');
        
        form.addEventListener('submit', (e) => this.iniciarSesion(e));
        
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = togglePassword.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    iniciarSesion(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('username').value;
        const contraseña = document.getElementById('password').value;
        const recordar = document.getElementById('rememberMe').checked;
        
        // Validar credenciales
        if (usuario === this.credenciales.usuario && contraseña === this.credenciales.contraseña) {
            this.crearSesion(recordar);
            this.mostrarMensaje('Login exitoso! Redirigiendo...', 'success');
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                window.location.href = '../html/formulario-noticias.html';
            }, 1000);
        } else {
            this.mostrarMensaje('Usuario o contraseña incorrectos', 'error');
        }
    }

    crearSesion(recordar) {
        const sesion = {
            usuario: this.credenciales.usuario,
            timestamp: new Date().getTime(),
            expira: recordar ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000 // 7 días o 2 horas
        };
        
        localStorage.setItem(this.claveSesion, JSON.stringify(sesion));
    }

    verificarSesionActiva() {
        const sesionGuardada = localStorage.getItem(this.claveSesion);
        
        if (sesionGuardada) {
            const sesion = JSON.parse(sesionGuardada);
            const ahora = new Date().getTime();
            
            if (ahora - sesion.timestamp < sesion.expira) {
                // Sesión aún válida, redirigir al formulario
                window.location.href = '../html/formulario-noticias.html';
            } else {
                // Sesión expirada, limpiar
                localStorage.removeItem(this.claveSesion);
            }
        }
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.getElementById('loginMessage');
        mensajeDiv.textContent = mensaje;
        mensajeDiv.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} mt-3`;
        mensajeDiv.classList.remove('d-none');
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            mensajeDiv.classList.add('d-none');
        }, 5000);
    }

    // Método estático para verificar sesión en otras páginas
    static verificarPermisos() {
        const claveSesion = 'adminSesion';
        const sesionGuardada = localStorage.getItem(claveSesion);
        
        if (!sesionGuardada) {
            return false;
        }
        
        const sesion = JSON.parse(sesionGuardada);
        const ahora = new Date().getTime();
        
        if (ahora - sesion.timestamp > sesion.expira) {
            localStorage.removeItem(claveSesion);
            return false;
        }
        
        return true;
    }

    // Método para cerrar sesión
    static cerrarSesion() {
        localStorage.removeItem('adminSesion');
        window.location.href = '../html/LoginAdmin.html';
    }
}

// Inicializar el login manager
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});