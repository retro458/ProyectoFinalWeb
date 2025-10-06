// Clase para gestionar noticias en LocalStorage
class GestorNoticias {
    constructor() {
        console.log('Inicializando GestorNoticias...');
        this.claveStorage = 'noticiasGamer';
        this.noticias = this.obtenerNoticias();
        this.noticiaEditando = null;
        this.inicializarEventos();
        this.cargarNoticias();
        console.log('GestorNoticias inicializado. Noticias encontradas:', this.noticias.length);
    }

    // Obtener noticias del LocalStorage
    obtenerNoticias() {
        const noticiasGuardadas = localStorage.getItem(this.claveStorage);
        console.log('Obteniendo noticias de LocalStorage:', noticiasGuardadas);
        return noticiasGuardadas ? JSON.parse(noticiasGuardadas) : [];
    }

    // Guardar noticias en LocalStorage
    guardarNoticias() {
        console.log('Guardando noticias en LocalStorage:', this.noticias);
        localStorage.setItem(this.claveStorage, JSON.stringify(this.noticias));
    }

    // Inicializar eventos del formulario
    inicializarEventos() {
        console.log('Inicializando eventos...');
        const form = document.getElementById('formNoticia');
        const btnLimpiar = document.getElementById('btnLimpiar');
        
        if (!form) {
            console.error('No se encontró el formulario con id formNoticia');
            return;
        }
        
        if (!btnLimpiar) {
            console.error('No se encontró el botón con id btnLimpiar');
            return;
        }
        
        form.addEventListener('submit', (e) => this.guardarNoticia(e));
        btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
        
        // Establecer fecha actual por defecto
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.valueAsDate = new Date();
        }
        
        console.log('Eventos inicializados correctamente');
    }

    // Guardar o actualizar noticia
    guardarNoticia(e) {
        e.preventDefault();
        console.log('Guardando noticia...');
        
        // Validar que todos los campos requeridos existan
        const campos = ['titulo', 'descripcionCorta', 'contenido', 'categoria', 'imagen', 'fecha', 'autor'];
        for (let campo of campos) {
            const elemento = document.getElementById(campo);
            if (!elemento) {
                console.error(`Campo ${campo} no encontrado`);
                this.mostrarMensaje(`Error: Campo ${campo} no encontrado`, 'danger');
                return;
            }
            if (!elemento.value.trim()) {
                console.error(`Campo ${campo} está vacío`);
                this.mostrarMensaje(`Error: El campo ${campo} es requerido`, 'danger');
                elemento.focus();
                return;
            }
        }
        
        const noticia = {
            id: this.noticiaEditando ? this.noticiaEditando.id : Date.now().toString(),
            titulo: document.getElementById('titulo').value,
            descripcionCorta: document.getElementById('descripcionCorta').value,
            contenido: document.getElementById('contenido').value,
            categoria: document.getElementById('categoria').value,
            imagen: document.getElementById('imagen').value,
            fecha: document.getElementById('fecha').value,
            autor: document.getElementById('autor').value,
            fechaCreacion: this.noticiaEditando ? this.noticiaEditando.fechaCreacion : new Date().toISOString()
        };

        console.log('Noticia a guardar:', noticia);

        if (this.noticiaEditando) {
            // Actualizar noticia existente
            const index = this.noticias.findIndex(n => n.id === this.noticiaEditando.id);
            if (index !== -1) {
                this.noticias[index] = noticia;
                console.log('Noticia actualizada en índice:', index);
            }
        } else {
            // Agregar nueva noticia
            this.noticias.unshift(noticia);
            console.log('Nueva noticia agregada. Total:', this.noticias.length);
        }

        this.guardarNoticias();
        this.cargarNoticias();
        this.limpiarFormulario();
        
        this.mostrarMensaje(
            this.noticiaEditando ? 'Noticia actualizada correctamente' : 'Noticia guardada correctamente',
            'success'
        );
        
        this.noticiaEditando = null;
        document.getElementById('btnGuardar').textContent = 'Guardar Noticia';
        
        console.log('Noticia guardada exitosamente');
    }

    // ... el resto del código se mantiene igual ...
    // Limpiar formulario
    limpiarFormulario() {
        document.getElementById('formNoticia').reset();
        document.getElementById('fecha').valueAsDate = new Date();
        document.getElementById('noticiaId').value = '';
        this.noticiaEditando = null;
        document.getElementById('btnGuardar').textContent = 'Guardar Noticia';
    }

    // Cargar noticias en la lista
    cargarNoticias() {
        const lista = document.getElementById('listaNoticias');
        
        if (!lista) {
            console.error('No se encontró el elemento listaNoticias');
            return;
        }
        
        if (this.noticias.length === 0) {
            lista.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No hay noticias guardadas</p>
                </div>
            `;
            return;
        }

        lista.innerHTML = this.noticias.map(noticia => `
            <div class="col-12 mb-3">
                <div class="card noticia-item">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <span class="badge-categoria">${noticia.categoria}</span>
                                <h6 class="card-title mt-2 mb-1">${noticia.titulo}</h6>
                                <p class="card-text text-muted small mb-1">${noticia.descripcionCorta}</p>
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>${this.formatearFecha(noticia.fecha)} | 
                                    <i class="fas fa-user me-1 ms-2"></i>${noticia.autor}
                                </small>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="btn-group">
                                    <a href="../html/detalle-noticia.html?id=${noticia.id}" class="btn btn-sm btn-outline-success">
                                        <i class="fas fa-eye"></i> Leer
                                    </a>
                                    <button class="btn btn-sm btn-outline-primary" onclick="gestorNoticias.editarNoticia('${noticia.id}')">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="gestorNoticias.eliminarNoticia('${noticia.id}')">
                                        <i class="fas fa-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('Noticias cargadas en la lista:', this.noticias.length);
    }

    // Editar noticia
    editarNoticia(id) {
        const noticia = this.noticias.find(n => n.id === id);
        if (!noticia) return;

        this.noticiaEditando = noticia;
        
        document.getElementById('noticiaId').value = noticia.id;
        document.getElementById('titulo').value = noticia.titulo;
        document.getElementById('descripcionCorta').value = noticia.descripcionCorta;
        document.getElementById('contenido').value = noticia.contenido;
        document.getElementById('categoria').value = noticia.categoria;
        document.getElementById('imagen').value = noticia.imagen;
        document.getElementById('fecha').value = noticia.fecha;
        document.getElementById('autor').value = noticia.autor;
        
        document.getElementById('btnGuardar').textContent = 'Actualizar Noticia';
        document.getElementById('titulo').focus();
    }

    // Eliminar noticia
    eliminarNoticia(id) {
        const noticia = this.noticias.find(n => n.id === id);
        if (!noticia) return;

        this.mostrarModalConfirmacion(
            `¿Estás seguro de que quieres eliminar la noticia "${noticia.titulo}"?`,
            () => {
                this.noticias = this.noticias.filter(n => n.id !== id);
                this.guardarNoticias();
                this.cargarNoticias();
                this.mostrarMensaje('Noticia eliminada correctamente', 'success');
            }
        );
    }

    // Formatear fecha
    formatearFecha(fechaString) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaString).toLocaleDateString('es-ES', opciones);
    }

    // Mostrar mensaje
    mostrarMensaje(mensaje, tipo) {
        // Crear alerta de Bootstrap
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alerta.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            const firstCard = document.querySelector('.card');
            container.insertBefore(alerta, firstCard);
        }
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 5000);
    }

    // Mostrar modal de confirmación
    mostrarModalConfirmacion(mensaje, callback) {
        document.getElementById('modalMessage').textContent = mensaje;
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        
        // Remover event listeners previos
        document.getElementById('btnConfirmar').replaceWith(document.getElementById('btnConfirmar').cloneNode(true));
        
        // Agregar nuevo event listener
        document.getElementById('btnConfirmar').addEventListener('click', () => {
            callback();
            modal.hide();
        });
        
        modal.show();
    }
}

// Inicializar el gestor cuando se carga la página
let gestorNoticias;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando GestorNoticias...');
    gestorNoticias = new GestorNoticias();
});