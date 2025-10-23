class CreadorComunidades {
    constructor() {
        this.pasoActual = 1;
        this.totalPasos = 4;
        this.comunidadData = {
            nombre: '',
            subtitulo: '',
            descripcion: '',
            juego: '',
            icono: '🎮',
            banner: '',
            color: '#66c0f4',
            categoria: '',
            tags: [],
            idioma: 'es',
            tipo: 'publica',
            nsfw: false,
            reglas: ''
        };
        this.tagsSugeridos = [
            'Competitivo', 'Casual', 'Coop', 'PvP', 'PvE', 'Ranked', 
            'Mods', 'Speedrun', 'Lore', 'Guías', 'Help', 'Fan Art',
            'Memes', 'Tech Support', 'Events', 'Tournaments', 'Clans',
            'Roleplay', 'Hardcore', 'Survival', 'Creative', 'Building'
        ];
        this.init();
    }

    init() {
        this.cargarBorrador();
        this.configurarEventos();
        this.configurarEventosImagenes();
        this.actualizarInterfaz();
        this.actualizarEstadisticasUsuario();
    }

    configurarEventos() {
        // Navegación entre pasos
        document.getElementById('btnSiguiente').addEventListener('click', () => this.siguientePaso());
        document.getElementById('btnAnterior').addEventListener('click', () => this.anteriorPaso());
        
        // Formulario
        document.getElementById('comunidadForm').addEventListener('submit', (e) => this.crearComunidad(e));
        
        // Contador de caracteres
        const descripcionTextarea = document.getElementById('comunidadDescripcion');
        if (descripcionTextarea) {
            descripcionTextarea.addEventListener('input', (e) => {
                const contador = document.getElementById('descripcionContador');
                if (contador) {
                    contador.textContent = e.target.value.length;
                }
            });
        }
        
        // Input de tags
        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.agregarTag(e.target.value.trim());
                    e.target.value = '';
                    this.ocultarSugerencias();
                }
            });
            
            tagInput.addEventListener('input', (e) => {
                this.mostrarSugerencias(e.target.value);
            });
        }
        
        // Cambios en tiempo real para vista previa
        const elementosRealtime = [
            'comunidadNombre', 'comunidadSubtitulo', 'comunidadDescripcion', 
            'comunidadColor', 'comunidadCategoria', 'comunidadIdioma',
            'comunidadJuego', 'comunidadTipo', 'comunidadNSFW', 'comunidadReglas'
        ];
        
        elementosRealtime.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => {
                    this.actualizarVistaPrevia();
                });
                elemento.addEventListener('change', () => {
                    this.actualizarVistaPrevia();
                });
            }
        });
    }

    configurarEventosImagenes() {
        // Evento para cambiar el color
        const colorInput = document.getElementById('comunidadColor');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                this.comunidadData.color = e.target.value;
                const colorHex = document.getElementById('colorHex');
                if (colorHex) {
                    colorHex.textContent = e.target.value.toUpperCase();
                }
                const colorPreview = document.querySelector('.color-preview');
                if (colorPreview) {
                    colorPreview.style.backgroundColor = e.target.value;
                }
                this.actualizarVistaPrevia();
            });
        }
        
        // Validar imágenes al cambiar
        const iconoUpload = document.getElementById('iconoUpload');
        if (iconoUpload) {
            iconoUpload.addEventListener('change', (e) => {
                this.validarImagen(e.target, 'icono');
            });
        }
        
        const bannerUpload = document.getElementById('bannerUpload');
        if (bannerUpload) {
            bannerUpload.addEventListener('change', (e) => {
                this.validarImagen(e.target, 'banner');
            });
        }
    }

    validarImagen(input, tipo) {
        const file = input.files[0];
        if (!file) return;
        
        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
        if (!tiposPermitidos.includes(file.type)) {
            this.mostrarError('Solo se permiten imágenes JPG, PNG o GIF');
            input.value = '';
            return;
        }
        
        // Validar tamaño máximo (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            this.mostrarError('La imagen no puede ser mayor a 5MB');
            input.value = '';
            return;
        }
        
        // Obtener dimensiones de la imagen
        const img = new Image();
        img.onload = () => {
            const area = tipo === 'icono' ? 'iconoUploadArea' : 'bannerUploadArea';
            const miniPreview = tipo === 'icono' ? 'iconoMiniPreview' : 'bannerMiniPreview';
            const miniImg = tipo === 'icono' ? 'iconoMini' : 'bannerMini';
            const sizeSpan = tipo === 'icono' ? 'iconoSize' : 'bannerSize';
            
            // Mostrar dimensiones
            const sizeElement = document.getElementById(sizeSpan);
            if (sizeElement) {
                sizeElement.textContent = `${img.width}x${img.height}`;
            }
            
            const miniPreviewElement = document.getElementById(miniPreview);
            if (miniPreviewElement) {
                miniPreviewElement.style.display = 'block';
            }
            
            // Validar dimensiones recomendadas
            if (tipo === 'icono' && (img.width < 32 || img.height < 32)) {
                this.mostrarAdvertencia('El icono es muy pequeño. Se recomienda 64x64 px para mejor calidad.');
            }
            
            if (tipo === 'banner' && (img.width < 200 || img.height < 100)) {
                this.mostrarAdvertencia('El banner es muy pequeño. Se recomienda 400x200 px para mejor calidad.');
            }
            
            // Actualizar vista previa mini
            const reader = new FileReader();
            reader.onload = (e) => {
                const miniImgElement = document.getElementById(miniImg);
                if (miniImgElement) {
                    miniImgElement.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        };
        
        img.src = URL.createObjectURL(file);
    }

    mostrarAdvertencia(mensaje) {
        Swal.fire({
            title: 'Advertencia',
            text: mensaje,
            icon: 'warning',
            confirmButtonText: 'Entendido',
            timer: 4000
        });
    }

    seleccionarIconoPredefinido(icono) {
        this.comunidadData.icono = icono;
        
        // Remover selección anterior
        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Marcar como seleccionado
        event.target.classList.add('selected');
        
        // Actualizar vista previa
        this.actualizarVistaPrevia();
        
        this.mostrarNotificacion(`Icono seleccionado: ${icono}`, 'success');
    }

    siguientePaso() {
        if (!this.validarPasoActual()) return;
        
        this.pasoActual++;
        this.actualizarInterfaz();
    }

    anteriorPaso() {
        this.pasoActual--;
        this.actualizarInterfaz();
    }

    validarPasoActual() {
        switch(this.pasoActual) {
            case 1:
                const nombre = document.getElementById('comunidadNombre').value.trim();
                const descripcion = document.getElementById('comunidadDescripcion').value.trim();
                
                if (!nombre) {
                    this.mostrarError('El nombre de la comunidad es obligatorio');
                    return false;
                }
                if (!descripcion) {
                    this.mostrarError('La descripción de la comunidad es obligatoria');
                    return false;
                }
                
                this.comunidadData.nombre = nombre;
                this.comunidadData.subtitulo = document.getElementById('comunidadSubtitulo').value.trim();
                this.comunidadData.descripcion = descripcion;
                this.comunidadData.juego = document.getElementById('comunidadJuego').value.trim();
                break;
                
            case 2:
                const iconoPreview = document.getElementById('iconoPreview');
                const bannerPreview = document.getElementById('bannerPreview');
                const tieneIcono = (iconoPreview && iconoPreview.style.display !== 'none') || 
                                  (this.comunidadData.icono && !this.comunidadData.icono.startsWith('data:'));
                const tieneBanner = bannerPreview && bannerPreview.style.display !== 'none';
                
                if (!tieneIcono) {
                    this.mostrarError('Debes subir un icono o seleccionar uno predefinido');
                    return false;
                }
                if (!tieneBanner) {
                    this.mostrarError('Debes subir un banner para la comunidad');
                    return false;
                }
                break;
                
            case 3:
                const categoria = document.getElementById('comunidadCategoria').value;
                if (!categoria) {
                    this.mostrarError('Debes seleccionar una categoría principal');
                    return false;
                }
                this.comunidadData.categoria = categoria;
                this.comunidadData.idioma = document.getElementById('comunidadIdioma').value;
                break;
        }
        
        return true;
    }

    actualizarInterfaz() {
        console.log('Actualizando interfaz, paso actual:', this.pasoActual);
        
        // Ocultar todos los pasos
        document.querySelectorAll('.form-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar paso actual
        const pasoActualElement = document.querySelector(`[data-step="${this.pasoActual}"]`);
        if (pasoActualElement) {
            pasoActualElement.style.display = 'block';
            console.log('Mostrando paso:', this.pasoActual);
        }
        
        // Actualizar indicador de pasos
        document.querySelectorAll('.step').forEach((step) => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.pasoActual) {
                step.classList.add('active');
            } else if (stepNum < this.pasoActual) {
                step.classList.add('completed');
            }
        });
        
        // Actualizar botones
        const btnAnterior = document.getElementById('btnAnterior');
        const btnSiguiente = document.getElementById('btnSiguiente');
        const btnCrear = document.getElementById('btnCrear');
        
        if (btnAnterior) {
            btnAnterior.style.display = this.pasoActual > 1 ? 'block' : 'none';
        }
        if (btnSiguiente) {
            btnSiguiente.style.display = this.pasoActual < this.totalPasos ? 'block' : 'none';
        }
        if (btnCrear) {
            btnCrear.style.display = this.pasoActual === this.totalPasos ? 'block' : 'none';
        }
        
        this.actualizarProgreso();
        this.actualizarVistaPrevia();
    }

    actualizarProgreso() {
        const porcentaje = (this.pasoActual / this.totalPasos) * 100;
        const porcentajeElement = document.getElementById('porcentajeCompletado');
        const barraProgreso = document.getElementById('barraProgreso');
        
        if (porcentajeElement) {
            porcentajeElement.textContent = `${Math.round(porcentaje)}%`;
        }
        if (barraProgreso) {
            barraProgreso.style.width = `${porcentaje}%`;
        }
    }

    actualizarVistaPrevia() {
        const preview = document.getElementById('vistaPreviaComunidad');
        if (!preview) return;

        const iconoPreview = document.getElementById('iconoPreview');
        const bannerPreview = document.getElementById('bannerPreview');
        
        const iconoBase64 = (iconoPreview && iconoPreview.style.display !== 'none') ? iconoPreview.src : this.comunidadData.icono;
        const bannerBase64 = (bannerPreview && bannerPreview.style.display !== 'none') ? bannerPreview.src : '';
        
        preview.innerHTML = `
            <div class="steam-community-card">
                <div class="steam-card-header" style="border-color: ${this.comunidadData.color}">
                    ${bannerBase64 && bannerBase64.startsWith('data:') ? 
                        `<img src="${bannerBase64}" class="steam-card-banner" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        '<div class="steam-card-banner-placeholder"></div>'
                    }
                    <div class="steam-card-logo">
                        ${iconoBase64.startsWith('data:') ? 
                            `<img src="${iconoBase64}" style="width: 40px; height: 40px; border-radius: 8px; border: 2px solid ${this.comunidadData.color}; object-fit: cover;">` : 
                            `<span style="font-size: 2rem;">${iconoBase64}</span>`
                        }
                    </div>
                </div>
                
                <div class="steam-card-body">
                    <h4 class="steam-card-title" style="color: ${this.comunidadData.color}">
                        ${this.comunidadData.nombre || 'Nombre de la Comunidad'}
                    </h4>
                    <div class="steam-card-subtitle">
                        ${this.comunidadData.subtitulo || 'Subtítulo de la comunidad'}
                    </div>
                    <p class="steam-card-description">
                        ${this.comunidadData.descripcion || 'Descripción de la comunidad aparecerá aquí...'}
                    </p>
                    
                    ${this.comunidadData.juego ? `
                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="fas fa-gamepad me-1"></i>
                                Juego: ${this.comunidadData.juego}
                            </small>
                        </div>
                    ` : ''}
                    
                    <div class="steam-card-stats">
                        <div class="steam-stat" title="Miembros totales">
                            <i class="fas fa-users text-muted"></i>
                            <div class="steam-stat-number">1</div>
                        </div>
                        <div class="steam-stat" title="Miembros en línea">
                            <i class="fas fa-circle text-success"></i>
                            <div class="steam-stat-number">1</div>
                        </div>
                        <div class="steam-stat" title="Discusiones activas">
                            <i class="fas fa-comments text-warning"></i>
                            <div class="steam-stat-number">0</div>
                        </div>
                    </div>
                    
                    <div class="steam-card-tags">
                        ${this.comunidadData.tags.map(tag => 
                            `<span class="steam-tag">${tag}</span>`
                        ).join('')}
                        ${this.comunidadData.categoria ? `<span class="steam-tag">${this.comunidadData.categoria}</span>` : ''}
                        ${this.comunidadData.tags.length === 0 && !this.comunidadData.categoria ? 
                            '<span class="text-muted">Etiquetas aparecerán aquí</span>' : ''}
                    </div>
                    
                    <div class="steam-card-footer">
                        <button class="btn-steam-join">
                            <i class="fas fa-plus me-1"></i>UNIRSE
                        </button>
                        <div class="steam-activity">
                            <span class="steam-online-dot media"></span>
                            <span>Nueva</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    agregarTag(tagTexto) {
        if (!tagTexto) return;
        
        if (this.comunidadData.tags.length >= 5) {
            this.mostrarError('Máximo 5 etiquetas permitidas');
            return;
        }
        
        if (this.comunidadData.tags.includes(tagTexto)) {
            this.mostrarError('Esta etiqueta ya existe');
            return;
        }
        
        this.comunidadData.tags.push(tagTexto);
        this.actualizarTagsUI();
        this.actualizarVistaPrevia();
    }

    eliminarTag(tagTexto) {
        this.comunidadData.tags = this.comunidadData.tags.filter(tag => tag !== tagTexto);
        this.actualizarTagsUI();
        this.actualizarVistaPrevia();
    }

    actualizarTagsUI() {
        const container = document.getElementById('tagsContainer');
        if (!container) return;
        
        container.innerHTML = this.comunidadData.tags.map(tag => `
            <span class="tag-badge">
                ${tag}
                <span class="remove-tag" onclick="creador.eliminarTag('${tag}')">×</span>
            </span>
        `).join('');
    }

    mostrarSugerencias(texto) {
        const suggestions = document.getElementById('tagSuggestions');
        if (!suggestions) return;
        
        const filtered = this.tagsSugeridos.filter(tag => 
            tag.toLowerCase().includes(texto.toLowerCase()) && 
            !this.comunidadData.tags.includes(tag)
        );
        
        if (texto && filtered.length > 0) {
            suggestions.innerHTML = filtered.map(tag => `
                <div class="tag-suggestion" onclick="creador.agregarTag('${tag}')">
                    ${tag}
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            this.ocultarSugerencias();
        }
    }

    ocultarSugerencias() {
        const suggestions = document.getElementById('tagSuggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    async crearComunidad(e) {
        e.preventDefault();
        
        if (!this.validarPasoActual()) return;
        
        // Recopilar datos finales
        this.comunidadData.tipo = document.getElementById('comunidadTipo').value;
        this.comunidadData.nsfw = document.getElementById('comunidadNSFW').checked;
        this.comunidadData.reglas = document.getElementById('comunidadReglas').value.trim();
        
        // Validación final
        if (!this.validarComunidadCompleta()) return;
        
        try {
            // Mostrar loading
            Swal.fire({
                title: 'Creando comunidad...',
                text: 'Estamos configurando tu nueva comunidad',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Guardar comunidad
            await this.guardarComunidad();
            
            Swal.fire({
                title: '¡Comunidad Creada!',
                text: 'Tu comunidad ha sido creada exitosamente',
                icon: 'success',
                confirmButtonText: 'Ver Comunidad'
            }).then(() => {
                window.location.href = 'comunidades.html';
            });
            
        } catch (error) {
            this.mostrarError('Error al crear la comunidad: ' + error.message);
        }
    }

    validarComunidadCompleta() {
        const requiredFields = [
            this.comunidadData.nombre,
            this.comunidadData.descripcion,
            this.comunidadData.categoria
        ];
        
        if (requiredFields.some(field => !field)) {
            this.mostrarError('Por favor completa todos los campos obligatorios');
            return false;
        }
        
        // Validar que tenga icono (ya sea subido o predefinido)
        const iconoPreview = document.getElementById('iconoPreview');
        const tieneIcono = (iconoPreview && iconoPreview.style.display !== 'none') || 
                          (this.comunidadData.icono && !this.comunidadData.icono.startsWith('data:'));
        
        if (!tieneIcono) {
            this.mostrarError('Debes seleccionar o subir un icono para la comunidad');
            return false;
        }
        
        // Validar que tenga banner
        const bannerPreview = document.getElementById('bannerPreview');
        const tieneBanner = bannerPreview && bannerPreview.style.display !== 'none';
        
        if (!tieneBanner) {
            this.mostrarError('Debes subir un banner para la comunidad');
            return false;
        }
        
        return true;
    }

    async guardarComunidad() {
        const iconoPreview = document.getElementById('iconoPreview');
        const bannerPreview = document.getElementById('bannerPreview');
        
        const iconoBase64 = (iconoPreview && iconoPreview.style.display !== 'none') ? iconoPreview.src : this.comunidadData.icono;
        const bannerBase64 = (bannerPreview && bannerPreview.style.display !== 'none') ? bannerPreview.src : '';
        
        const nuevaComunidad = {
            id: Date.now(),
            nombre: this.comunidadData.nombre,
            subtitulo: this.comunidadData.subtitulo,
            descripcion: this.comunidadData.descripcion,
            juego: this.comunidadData.juego,
            icono: iconoBase64,
            banner: bannerBase64,
            miembros: 1,
            online: 1,
            discusiones: 0,
            actividad: 'media',
            tags: [...this.comunidadData.tags, this.comunidadData.categoria],
            tipo: this.comunidadData.tipo,
            nsfw: this.comunidadData.nsfw,
            reglas: this.comunidadData.reglas,
            idioma: this.comunidadData.idioma,
            color: this.comunidadData.color,
            fechaCreacion: new Date().toISOString(),
            creador: JSON.parse(localStorage.getItem('currentUser'))?.email || 'Anónimo',
            miembrosIds: [JSON.parse(localStorage.getItem('currentUser'))?.email || 'anon']
        };
        
        const comunidades = JSON.parse(localStorage.getItem('comunidadesCreadas')) || [];
        comunidades.push(nuevaComunidad);
        localStorage.setItem('comunidadesCreadas', JSON.stringify(comunidades));
        
        this.actualizarEstadisticasUsuario();
        localStorage.removeItem('borradorComunidad');
        
        // Registrar logro
        if (window.sistemaLogros) {
            sistemaLogros.otorgarLogro('creador');
        }
    }

    guardarBorrador() {
        this.comunidadData.pasoActual = this.pasoActual;
        localStorage.setItem('borradorComunidad', JSON.stringify(this.comunidadData));
        
        Swal.fire({
            title: 'Borrador Guardado',
            text: 'Tu progreso ha sido guardado',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    }

    cargarBorrador() {
        const borrador = JSON.parse(localStorage.getItem('borradorComunidad'));
        if (borrador) {
            this.comunidadData = { ...this.comunidadData, ...borrador };
            this.pasoActual = borrador.pasoActual || 1;
            
            // Restaurar valores de los campos
            const campos = {
                'comunidadNombre': 'nombre',
                'comunidadSubtitulo': 'subtitulo',
                'comunidadDescripcion': 'descripcion',
                'comunidadJuego': 'juego',
                'comunidadColor': 'color',
                'comunidadCategoria': 'categoria',
                'comunidadIdioma': 'idioma',
                'comunidadTipo': 'tipo',
                'comunidadReglas': 'reglas'
            };
            
            Object.entries(campos).forEach(([id, key]) => {
                const elemento = document.getElementById(id);
                if (elemento && this.comunidadData[key] !== undefined) {
                    elemento.value = this.comunidadData[key];
                }
            });
            
            // Checkbox NSFW
            const nsfwCheckbox = document.getElementById('comunidadNSFW');
            if (nsfwCheckbox) {
                nsfwCheckbox.checked = this.comunidadData.nsfw;
            }
            
            // Actualizar color preview
            const colorHex = document.getElementById('colorHex');
            if (colorHex) {
                colorHex.textContent = this.comunidadData.color.toUpperCase();
            }
            const colorPreview = document.querySelector('.color-preview');
            if (colorPreview) {
                colorPreview.style.backgroundColor = this.comunidadData.color;
            }
            
            this.actualizarTagsUI();
            this.actualizarInterfaz();
        }
    }

    actualizarEstadisticasUsuario() {
        const comunidadesCreadas = JSON.parse(localStorage.getItem('comunidadesCreadas')) || [];
        const totalMiembros = comunidadesCreadas.reduce((sum, com) => sum + com.miembros, 0);
        
        const totalComunidades = document.getElementById('totalComunidadesCreadas');
        const totalMiembrosElement = document.getElementById('totalMiembros');
        
        if (totalComunidades) {
            totalComunidades.textContent = comunidadesCreadas.length;
        }
        if (totalMiembrosElement) {
            totalMiembrosElement.textContent = totalMiembros;
        }
    }

    mostrarError(mensaje) {
        Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }

    mostrarNotificacion(mensaje, tipo) {
        // Usar SweetAlert para notificaciones simples
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
        
        Toast.fire({
            icon: tipo,
            title: mensaje
        });
    }

    previsualizarComunidad() {
        // Validar que tenemos datos mínimos
        if (!this.comunidadData.nombre || !this.comunidadData.descripcion) {
            this.mostrarError('Completa al menos el nombre y descripción para ver la vista previa');
            return;
        }
        
        const iconoPreview = document.getElementById('iconoPreview');
        const bannerPreview = document.getElementById('bannerPreview');
        
        const iconoBase64 = (iconoPreview && iconoPreview.style.display !== 'none') ? iconoPreview.src : this.comunidadData.icono;
        const bannerBase64 = (bannerPreview && bannerPreview.style.display !== 'none') ? bannerPreview.src : '';
        
        const previewData = {
            ...this.comunidadData,
            icono: iconoBase64,
            banner: bannerBase64,
            miembros: 1,
            online: 1,
            discusiones: 0,
            actividad: 'media'
        };
        
        // Mostrar vista previa en un modal
        this.mostrarModalVistaPrevia(previewData);
    }

    mostrarModalVistaPrevia(previewData) {
        const modalHTML = `
            <div class="modal fade" id="modalVistaPrevia" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-dark text-light">
                        <div class="modal-header">
                            <h5 class="modal-title">Vista Previa de la Comunidad</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="steam-community-card">
                                <div class="steam-card-header" style="border-color: ${previewData.color}">
                                    ${previewData.banner && previewData.banner.startsWith('data:') ? 
                                        `<img src="${previewData.banner}" class="steam-card-banner" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                        '<div class="steam-card-banner-placeholder"></div>'
                                    }
                                    <div class="steam-card-logo">
                                        ${previewData.icono.startsWith('data:') ? 
                                            `<img src="${previewData.icono}" style="width: 40px; height: 40px; border-radius: 8px; border: 2px solid ${previewData.color}; object-fit: cover;">` : 
                                            `<span style="font-size: 2rem;">${previewData.icono}</span>`
                                        }
                                    </div>
                                </div>
                                
                                <div class="steam-card-body">
                                    <h4 class="steam-card-title" style="color: ${previewData.color}">
                                        ${previewData.nombre}
                                    </h4>
                                    <div class="steam-card-subtitle">
                                        ${previewData.subtitulo || 'Subtítulo de la comunidad'}
                                    </div>
                                    <p class="steam-card-description">
                                        ${previewData.descripcion}
                                    </p>
                                    
                                    ${previewData.juego ? `
                                        <div class="mb-2">
                                            <small class="text-muted">
                                                <i class="fas fa-gamepad me-1"></i>
                                                Juego: ${previewData.juego}
                                            </small>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="steam-card-stats">
                                        <div class="steam-stat">
                                            <div class="steam-stat-number">1</div>
                                            <div class="steam-stat-label">Miembros</div>
                                        </div>
                                        <div class="steam-stat">
                                            <div class="steam-stat-number">1</div>
                                            <div class="steam-stat-label">En línea</div>
                                        </div>
                                        <div class="steam-stat">
                                            <div class="steam-stat-number">0</div>
                                            <div class="steam-stat-label">Discusiones</div>
                                        </div>
                                    </div>
                                    
                                    <div class="steam-card-tags">
                                        ${previewData.tags.map(tag => 
                                            `<span class="steam-tag">${tag}</span>`
                                        ).join('')}
                                        ${previewData.tags.length === 0 ? 
                                            '<span class="text-muted">Sin etiquetas</span>' : ''}
                                    </div>
                                    
                                    <div class="steam-card-footer">
                                        <button class="btn-steam-join">
                                            <i class="fas fa-plus me-1"></i>UNIRSE
                                        </button>
                                        <div class="steam-activity">
                                            <span class="steam-online-dot media"></span>
                                            <span>Nueva</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-4 p-3 bg-secondary rounded">
                                <h6>Información adicional:</h6>
                                <ul class="mb-0">
                                    <li><strong>Categoría:</strong> ${previewData.categoria || 'No especificada'}</li>
                                    <li><strong>Idioma:</strong> ${this.obtenerNombreIdioma(previewData.idioma)}</li>
                                    <li><strong>Tipo:</strong> ${this.obtenerNombreTipo(previewData.tipo)}</li>
                                    <li><strong>NSFW:</strong> ${previewData.nsfw ? 'Sí' : 'No'}</li>
                                    <li><strong>Color:</strong> <span style="color: ${previewData.color}">${previewData.color}</span></li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente si hay
        const modalExistente = document.getElementById('modalVistaPrevia');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalVistaPrevia'));
        modal.show();
    }

    obtenerNombreIdioma(codigo) {
        const idiomas = {
            'es': 'Español',
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'pt': 'Português'
        };
        return idiomas[codigo] || codigo;
    }

    obtenerNombreTipo(tipo) {
        const tipos = {
            'publica': 'Pública',
            'restringida': 'Restringida',
            'privada': 'Privada'
        };
        return tipos[tipo] || tipo;
    }
}

// Funciones globales para HTML
function previewImage(input, previewId, areaId, placeholderId) {
    const preview = document.getElementById(previewId);
    const area = document.getElementById(areaId);
    const placeholder = document.getElementById(placeholderId);
    const file = input.files[0];
    
    if (file && preview && area) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            
            // Ocultar placeholder y mostrar que tiene imagen
            if (placeholder) placeholder.style.display = 'none';
            area.classList.add('has-image');
            
            // Actualizar vista previa
            if (window.creador) {
                creador.actualizarVistaPrevia();
            }
        };
        reader.readAsDataURL(file);
    }
}

function guardarBorrador() {
    if (window.creador) {
        creador.guardarBorrador();
    }
}

function previsualizarComunidad() {
    if (window.creador) {
        creador.previsualizarComunidad();
    }
}

function seleccionarIconoPredefinido(icono) {
    if (window.creador) {
        creador.seleccionarIconoPredefinido(icono);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.creador = new CreadorComunidades();
});