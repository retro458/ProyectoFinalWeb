// Clase para gestionar noticias en LocalStorage - OPTIMIZADA
class GestorNoticias {
    constructor() {
        this.claveStorage = 'noticiasGamer';
        this.noticias = this.obtenerNoticias();
        this.noticiaEditando = null;
        this.editor = null;
        this.inicializarEditor();
        this.inicializarEventos();
        this.cargarNoticias();
    }

    // Editor de texto enriquecido
    inicializarEditor() {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['embed']
        ];

        this.editor = new Quill('#editor', {
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: { 'embed': () => this.mostrarModalEmbed() }
                }
            },
            theme: 'snow'
        });

        // Registrar embed personalizado
        const Embed = Quill.import('blots/block/embed');
        
        class CustomEmbed extends Embed {
            static create(value) {
                const node = super.create();
                node.innerHTML = value.html;
                node.setAttribute('data-embed-id', value.id);
                node.classList.add('embed-container');
                return node;
            }
            
            static value(node) {
                return {
                    id: node.getAttribute('data-embed-id'),
                    html: node.innerHTML
                };
            }
        }
        
        CustomEmbed.blotName = 'embed';
        CustomEmbed.className = 'embed-container';
        CustomEmbed.tagName = 'div';
        
        Quill.register(CustomEmbed, true);

        // Actualizar campo oculto al cambiar
        this.editor.on('text-change', () => {
            document.getElementById('contenido').value = this.editor.root.innerHTML;
        });
    }

    mostrarModalEmbed() {
        const modalHTML = `
            <div class="modal fade" id="embedModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Insertar Contenido Embebido</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <textarea class="form-control" id="codigoEmbed" rows="6" 
                                placeholder="Pega el código de embed (Twitter, YouTube, Instagram, etc.)"></textarea>
                            <div class="form-text mt-2">
                                <strong>Ejemplos:</strong><br>
                                • Twitter: código completo del tweet<br>
                                • YouTube: iframe de embed<br>
                                • Instagram: código de publicación
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="btnInsertarEmbed">Insertar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('embedModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modal = new bootstrap.Modal(document.getElementById('embedModal'));
        document.getElementById('codigoEmbed').value = '';
        
        const btnInsertar = document.getElementById('btnInsertarEmbed');
        const newBtn = btnInsertar.cloneNode(true);
        btnInsertar.parentNode.replaceChild(newBtn, btnInsertar);
        
        newBtn.onclick = () => {
            this.insertarEmbed();
            modal.hide();
        };
        
        modal.show();
    }

    insertarEmbed() {
        const codigo = document.getElementById('codigoEmbed').value.trim();
        if (!codigo) return;

        const embedId = 'embed-' + Date.now();
        const embedHTML = this.procesarCodigoEmbed(codigo, embedId);
        
        // Insertar directamente en el editor como HTML
        const range = this.editor.getSelection();
        const position = range ? range.index : this.editor.getLength();
        
        // Usar la API de formatText para insertar HTML
        this.editor.insertText(position, '\n');
        this.editor.insertEmbed(position + 1, 'embed', { 
            id: embedId, 
            html: embedHTML 
        });
        this.editor.insertText(position + 2, '\n');
        this.editor.setSelection(position + 3);
        
        // Actualizar el campo oculto
        document.getElementById('contenido').value = this.editor.root.innerHTML;
    }

    procesarCodigoEmbed(codigo, embedId) {
    // Si ya es un iframe de YouTube, procesarlo directamente
        if (codigo.includes('youtube.com/embed') || codigo.includes('youtu.be') || codigo.includes('youtube.com/watch')) {
            return this.procesarYouTubeEmbed(codigo, embedId);
        }
        // Si es código de Twitter
        if (codigo.includes('twitter-tweet') || codigo.includes('platform.twitter.com')) {
            return this.procesarTwitterEmbed(codigo, embedId);
        }
        // Si es código de Instagram
        if (codigo.includes('instagram-media') || codigo.includes('instagram.com')) {
            return this.procesarInstagramEmbed(codigo, embedId);
        }
        // Para otros embeds
        return this.procesarEmbedGenerico(codigo, embedId);
    }

    procesarTwitterEmbed(codigo, embedId) {
        if (!codigo.includes('platform.twitter.com/widgets.js')) {
            codigo += '\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
        }
        return `<div class="twitter-embed" id="${embedId}">${codigo}</div>`;
    }

    procesarYouTubeEmbed(codigo, embedId) {
    // Si ya es un iframe, usarlo directamente
        if (codigo.includes('<iframe')) {
            return `<div class="youtube-embed" id="${embedId}">${codigo}</div>`;
        }
        
        // Si es una URL de YouTube, convertirla a embed
        const videoId = this.extraerVideoIdYouTube(codigo);
        if (videoId) {
            const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>`;
            return `<div class="youtube-embed" id="${embedId}">${embedCode}</div>`;
        }
        
        // Si no se puede procesar, devolver el código original
        return `<div class="generic-embed" id="${embedId}">${codigo}</div>`;
    }

    extraerVideoIdYouTube(url) {
    // Para URLs de embed
        const embedMatch = url.match(/youtube\.com\/embed\/([^"&?\/\s]{11})/);
        if (embedMatch) return embedMatch[1];
        
        // Para URLs de watch
        const watchMatch = url.match(/youtube\.com\/watch\?v=([^"&?\/\s]{11})/);
        if (watchMatch) return watchMatch[1];
        
        // Para URLs cortas youtu.be
        const shortMatch = url.match(/youtu\.be\/([^"&?\/\s]{11})/);
        if (shortMatch) return shortMatch[1];
        
        return null;
    }

    procesarInstagramEmbed(codigo, embedId) {
        if (!codigo.includes('instagram.com/embed.js')) {
            codigo += '\n<script async src="//www.instagram.com/embed.js"></script>';
        }
        return `<div class="instagram-embed" id="${embedId}">${codigo}</div>`;
    }

    procesarEmbedGenerico(codigo, embedId) {
        const sanitized = codigo
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/javascript:/gi, '');
        return `<div class="generic-embed" id="${embedId}">${sanitized}</div>`;
    }

    obtenerNoticias() {
        const noticiasGuardadas = localStorage.getItem(this.claveStorage);
        return noticiasGuardadas ? JSON.parse(noticiasGuardadas) : [];
    }

    guardarNoticias() {
        localStorage.setItem(this.claveStorage, JSON.stringify(this.noticias));
    }

    inicializarEventos() {
        const form = document.getElementById('formNoticia');
        if (!form) return;

        form.addEventListener('submit', (e) => this.guardarNoticia(e));
        document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiarFormulario());
        
        // Imagen
        const btnSeleccionar = document.getElementById('btnSeleccionarImagen');
        const imagenInput = document.getElementById('imagenPrincipal');
        const areaCarga = document.getElementById('areaCargaImagen');
        
        btnSeleccionar.addEventListener('click', () => imagenInput.click());
        imagenInput.addEventListener('change', (e) => this.cargarImagen(e));
        document.getElementById('btnEliminarImagen').addEventListener('click', () => this.eliminarImagen());
        
        // Drag & drop
        ['dragover', 'dragleave', 'drop'].forEach(evento => {
            areaCarga.addEventListener(evento, (e) => {
                e.preventDefault();
                if (evento === 'dragover') areaCarga.classList.add('bg-light');
                if (evento === 'dragleave') areaCarga.classList.remove('bg-light');
                if (evento === 'drop') {
                    areaCarga.classList.remove('bg-light');
                    if (e.dataTransfer.files.length) {
                        imagenInput.files = e.dataTransfer.files;
                        this.cargarImagen(e);
                    }
                }
            });
        });
        
        // Fecha actual por defecto
        document.getElementById('fecha').valueAsDate = new Date();
    }

    cargarImagen(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            this.mostrarMensaje('Solo se permiten imágenes', 'danger');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.mostrarMensaje('La imagen no puede superar 5MB', 'danger');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagenBase64').value = e.target.result;
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('vistaPreviaImagen').style.display = 'block';
            document.getElementById('areaCargaImagen').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    eliminarImagen() {
        document.getElementById('imagenBase64').value = '';
        document.getElementById('imagenPrincipal').value = '';
        document.getElementById('vistaPreviaImagen').style.display = 'none';
        document.getElementById('areaCargaImagen').style.display = 'block';
    }

    guardarNoticia(e) {
        e.preventDefault();
        
        // Validar campos
        const campos = ['titulo', 'descripcionCorta', 'contenido', 'categoria', 'fecha', 'autor'];
        for (let campo of campos) {
            const elemento = document.getElementById(campo);
            if (!elemento || !elemento.value.trim()) {
                this.mostrarMensaje(`El campo ${campo} es requerido`, 'danger');
                elemento?.focus();
                return;
            }
        }
        
        if (!document.getElementById('imagenBase64').value) {
            this.mostrarMensaje('Debes seleccionar una imagen', 'danger');
            return;
        }
        
        const noticia = {
            id: this.noticiaEditando?.id || Date.now().toString(),
            titulo: document.getElementById('titulo').value,
            descripcionCorta: document.getElementById('descripcionCorta').value,
            contenido: document.getElementById('contenido').value,
            categoria: document.getElementById('categoria').value,
            imagen: document.getElementById('imagenBase64').value,
            fecha: document.getElementById('fecha').value,
            autor: document.getElementById('autor').value,
            fechaCreacion: this.noticiaEditando?.fechaCreacion || new Date().toISOString()
        };

        if (this.noticiaEditando) {
            const index = this.noticias.findIndex(n => n.id === this.noticiaEditando.id);
            if (index !== -1) this.noticias[index] = noticia;
        } else {
            this.noticias.unshift(noticia);
        }

        this.guardarNoticias();
        this.cargarNoticias();
        this.limpiarFormulario();
        this.mostrarMensaje(
            this.noticiaEditando ? 'Noticia actualizada' : 'Noticia guardada',
            'success'
        );
        this.noticiaEditando = null;
    }

    limpiarFormulario() {
        document.getElementById('formNoticia').reset();
        document.getElementById('fecha').valueAsDate = new Date();
        this.editor.root.innerHTML = '';
        document.getElementById('contenido').value = '';
        this.eliminarImagen();
        this.noticiaEditando = null;
        document.getElementById('btnGuardar').textContent = 'Guardar Noticia';
    }

    cargarNoticias() {
        const lista = document.getElementById('listaNoticias');
        if (!lista) return;
        
        if (this.noticias.length === 0) {
            lista.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No hay noticias guardadas</p>
                </div>`;
            return;
        }

        lista.innerHTML = this.noticias.map(noticia => `
            <div class="col-12 mb-3">
                <div class="card noticia-item">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2">
                                <img src="${noticia.imagen}" class="img-fluid rounded" alt="${noticia.titulo}">
                            </div>
                            <div class="col-md-6">
                                <span class="badge-categoria">${noticia.categoria}</span>
                                <h6 class="mt-2 mb-1">${noticia.titulo}</h6>
                                <p class="text-muted small mb-1">${noticia.descripcionCorta}</p>
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>${this.formatearFecha(noticia.fecha)} | 
                                    <i class="fas fa-user me-1 ms-2"></i>${noticia.autor}
                                </small>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="btn-group">
                                    <a href="../html/detalle-noticia.html?id=${noticia.id}" class="btn btn-sm btn-outline-success">
                                        <i class="fas fa-eye"></i> Ver
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
    }

    editarNoticia(id) {
        const noticia = this.noticias.find(n => n.id === id);
        if (!noticia) return;

        this.noticiaEditando = noticia;
        
        document.getElementById('titulo').value = noticia.titulo;
        document.getElementById('descripcionCorta').value = noticia.descripcionCorta;
        this.editor.root.innerHTML = noticia.contenido;
        document.getElementById('contenido').value = noticia.contenido;
        document.getElementById('categoria').value = noticia.categoria;
        document.getElementById('fecha').value = noticia.fecha;
        document.getElementById('autor').value = noticia.autor;
        
        if (noticia.imagen) {
            document.getElementById('previewImg').src = noticia.imagen;
            document.getElementById('imagenBase64').value = noticia.imagen;
            document.getElementById('vistaPreviaImagen').style.display = 'block';
            document.getElementById('areaCargaImagen').style.display = 'none';
        }
        
        document.getElementById('btnGuardar').textContent = 'Actualizar Noticia';
        document.getElementById('titulo').focus();
    }

    eliminarNoticia(id) {
        const noticia = this.noticias.find(n => n.id === id);
        if (!noticia) return;

        this.mostrarModalConfirmacion(
            `¿Eliminar "${noticia.titulo}"?`,
            () => {
                this.noticias = this.noticias.filter(n => n.id !== id);
                this.guardarNoticias();
                this.cargarNoticias();
                this.mostrarMensaje('Noticia eliminada', 'success');
            }
        );
    }

    formatearFecha(fechaString) {
        return new Date(fechaString).toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    mostrarMensaje(mensaje, tipo) {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
        alerta.innerHTML = `${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        
        const container = document.querySelector('.container');
        const firstCard = document.querySelector('.card');
        if (container && firstCard) {
            container.insertBefore(alerta, firstCard);
            setTimeout(() => alerta.remove(), 5000);
        }
    }

    mostrarModalConfirmacion(mensaje, callback) {
        document.getElementById('modalMessage').textContent = mensaje;
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        
        const btnConfirmar = document.getElementById('btnConfirmar');
        const newBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(newBtn, btnConfirmar);
        
        newBtn.addEventListener('click', () => {
            callback();
            modal.hide();
        });
        
        modal.show();
    }
}

// Inicializar
let gestorNoticias;
document.addEventListener('DOMContentLoaded', () => {
    gestorNoticias = new GestorNoticias();
});