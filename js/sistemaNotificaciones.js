class SteamCommunities {
    constructor() {
        this.comunidades = [];
        this.comunidadesUnidas = new Set(JSON.parse(localStorage.getItem('comunidadesUnidas')) || []);
        this.filtros = {
            plataforma: '',
            genero: '',
            actividad: '',
            busqueda: '',
            orden: 'actividad'
        };
        this.init();
    }

    init() {
        this.cargarComunidadesEspecificas();
        this.renderComunidades();
        this.actualizarEstadisticas();
        this.cargarFiltrosGuardados();
        this.generarEventosAleatorios();
        this.generarRecomendaciones();
        this.renderSeccionRecomendaciones();

        setTimeout(() => {
            if (window.sistemaNotificaciones) {
                window.sistemaNotificaciones.solicitarPermisosNotificaciones();
                window.sistemaNotificaciones.actualizarContadorNotificaciones();
            }
        }, 3000);
    }

    cargarFiltrosGuardados() {
        const filtrosGuardados = JSON.parse(localStorage.getItem('filtrosComunidades'));
        if (filtrosGuardados) {
            this.filtros = { ...this.filtros, ...filtrosGuardados };
            document.getElementById('filtroPlataforma').value = this.filtros.plataforma;
            document.getElementById('filtroGenero').value = this.filtros.genero;
            document.getElementById('filtroActividad').value = this.filtros.actividad;
            document.getElementById('sortSelect').value = this.filtros.orden;
        }
    }

    cargarComunidadesEspecificas() {
        const comunidadesPredefinidas = [
            {
                id: 1,
                nombre: "HELLDIVERS 2",
                subtitulo: "For Democracy!",
                descripcion: "Únete a la lucha por la libertad managed. Estrategias, coordinación y pura acción cooperativa.",
                icono: "🪖",
                banner: "../img_comunidades/Helldivers-2_Launch_16x9_FULL_CLEAN.mov.00_00_39_02.Still004-034fc68378946dfa24d6.jpg",
                miembros: 15420,
                online: 2847,
                discusiones: 42,
                actividad: "muy alta",
                tags: ["Coop", "Shooter", "Satire", "PS5/PC"],
                juego: "Helldivers 2",
                fechaCreacion: "2024-02-08"
            },
            {
                id: 2,
                nombre: "SILENT HILL",
                subtitulo: "Survival Horror Legends",
                descripcion: "Analizamos cada rincón de la niebla. Teorías, guías y la mejor comunidad de horror psicológico.",
                icono: "🏚️",
                banner: "../img/silent-hill-3-hd-wallpapers-1920x1080.jpg",
                miembros: 8920,
                online: 1560,
                discusiones: 38,
                actividad: "alta",
                tags: ["Horror", "Psicológico", "Konami", "Misterio"],
                juego: "Silent Hill",
                fechaCreacion: "2023-10-26"
            },
            {
                id: 3,
                nombre: "HOLLOW KNIGHT",
                subtitulo: "Hallownest Awaits",
                descripcion: "Exploramos cada rincón de Hallownest. Guías de bosses, rutas y esperando Silksong como locos.",
                icono: "🐛",
                banner: "../img_comunidades/500px-SilksongPromo5.png",
                miembros: 23450,
                online: 3890,
                discusiones: 67,
                actividad: "muy alta",
                tags: ["Metroidvania", "Indie", "Team Cherry", "Exploración"],
                juego: "Hollow Knight",
                fechaCreacion: "2023-08-15"
            },
            {
                id: 4,
                nombre: "BALDUR'S GATE 3",
                subtitulo: "D&D Adventure",
                descripcion: "Cada decisión importa. Comparte tus builds, historias y descubre secretos ocultos.",
                icono: "⚔️",
                banner: "../img_comunidades/baldur-s-gate-3-ya-es-todo-un-exito-en-steam-y-twitch-cover64ccaaf6ec032.jpg", 
                miembros: 18760,
                online: 3120,
                discusiones: 89,
                actividad: "muy alta",
                tags: ["RPG", "D&D", "Larian", "Cooperativo"],
                juego: "Baldur's Gate 3",
                fechaCreacion: "2023-08-03"
            },
            {
                id: 5,
                nombre: "ELDEN RING",
                subtitulo: "Tierras Intermedias",
                descripcion: "Juntos sufriremos y venceremos. Builds, cooperación y el lore más profundo.",
                icono: "👑",
                banner: "../img_comunidades/elden-ring-shadow-of-the-erdtree-collector-edition_653515_4.jpg",
                miembros: 32450,
                online: 5670,
                discusiones: 124,
                actividad: "muy alta",
                tags: ["Souls", "FromSoftware", "Open World", "Difícil"],
                juego: "Elden Ring",
                fechaCreacion: "2022-02-25"
            },
            {
                id: 6,
                nombre: "CYBERPUNK 2077",
                subtitulo: "Night City Dreams",
                descripcion: "Desde el lanzamiento hasta Phantom Liberty. Mods, builds y las mejores historias de Night City.",
                icono: "🔮",
                banner: "../img_comunidades/c75e674590b8947542c809924df30bbef2190341163dd08668e243c266be70c5_product_card_v2_mobile_slider_639.jpg",
                miembros: 14320,
                online: 2450,
                discusiones: 56,
                actividad: "alta",
                tags: ["RPG", "Futurista", "CD Projekt", "Open World"],
                juego: "Cyberpunk 2077",
                fechaCreacion: "2023-09-26"
            }
        ];
        
        const comunidadesUsuario = JSON.parse(localStorage.getItem('comunidadesCreadas')) || [];
        this.comunidades = [...comunidadesPredefinidas, ...comunidadesUsuario];
    }

    aplicarFiltros() {
        this.filtros.plataforma = document.getElementById('filtroPlataforma').value;
        this.filtros.genero = document.getElementById('filtroGenero').value;
        this.filtros.actividad = document.getElementById('filtroActividad').value;
        this.filtros.orden = document.getElementById('sortSelect').value;
        
        localStorage.setItem('filtrosComunidades', JSON.stringify(this.filtros));
        this.renderComunidadesFiltradas();
    }

    buscarComunidades() {
        this.filtros.busqueda = document.getElementById('searchInput').value.toLowerCase();
        this.renderComunidadesFiltradas();
    }

    renderComunidadesFiltradas() {
        let comunidadesFiltradas = this.comunidades.filter(comunidad => {
            // Filtro por búsqueda
            const coincideBusqueda = !this.filtros.busqueda || 
                comunidad.nombre.toLowerCase().includes(this.filtros.busqueda) ||
                comunidad.descripcion.toLowerCase().includes(this.filtros.busqueda) ||
                comunidad.tags.some(tag => tag.toLowerCase().includes(this.filtros.busqueda));
            
            // Filtro por plataforma
            const coincidePlataforma = !this.filtros.plataforma || 
                comunidad.tags.some(tag => tag.toLowerCase().includes(this.filtros.plataforma.toLowerCase()));
            
            // Filtro por género
            const coincideGenero = !this.filtros.genero || 
                comunidad.tags.some(tag => tag.toLowerCase().includes(this.filtros.genero.toLowerCase()));
            
            // Filtro por actividad
            const coincideActividad = !this.filtros.actividad || 
                comunidad.actividad === this.filtros.actividad;

            return coincideBusqueda && coincidePlataforma && coincideGenero && coincideActividad;
        });

        // Ordenar resultados
        comunidadesFiltradas = this.ordenarComunidades(comunidadesFiltradas);

        this.renderComunidadesEnGrid(comunidadesFiltradas);
    }

    ordenarComunidades(comunidades) {
        switch(this.filtros.orden) {
            case 'miembros':
                return comunidades.sort((a, b) => b.miembros - a.miembros);
            case 'alfabetico':
                return comunidades.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'recientes':
                return comunidades.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
            case 'actividad':
            default:
                return comunidades.sort((a, b) => {
                    const ordenActividad = { 'muy alta': 3, 'alta': 2, 'media': 1, 'baja': 0 };
                    return ordenActividad[b.actividad] - ordenActividad[a.actividad];
                });
        }
    }

    renderComunidadesEnGrid(comunidades) {
        const grid = document.getElementById('comunidadesGrid');
        const estadoFiltros = document.getElementById('estadoFiltros');
        
        if (comunidades.length === 0) {
            grid.style.display = 'none';
            estadoFiltros.style.display = 'block';
            return;
        }

        grid.style.display = 'flex';
        estadoFiltros.style.display = 'none';

        let html = '';

        comunidades.forEach(comunidad => {
            const estaUnida = this.comunidadesUnidas.has(comunidad.id);
            const esPopular = comunidad.miembros > 20000;
            const esMuyActiva = comunidad.actividad === 'muy alta';
            const esRecomendada = comunidad.puntajeRecomendacion > 20;
            
            html += `
                <div class="col-md-6 col-lg-4" data-comunidad-id="${comunidad.id}">
                    <div class="steam-community-card h-100 ${estaUnida ? 'joined-community' : ''} ${esRecomendada ? 'recommended' : ''}">
                        ${esRecomendada ? '<div class="recommended-badge">Recomendada</div>' : ''}
                        <div class="steam-card-header">
                            <img src="${comunidad.banner}" alt="${comunidad.nombre}" 
                                 class="steam-card-banner" 
                                 onerror="this.src='https://via.placeholder.com/400x200/333/666?text=Banner+No+Disponible'">
                            <div class="steam-card-logo">
                                ${comunidad.icono}
                            </div>
                            <div class="steam-card-badges">
                                ${esPopular ? '<span class="steam-badge popular" title="Comunidad Popular">🔥</span>' : ''}
                                ${esMuyActiva ? '<span class="steam-badge active" title="Muy Activa">⚡</span>' : ''}
                                ${estaUnida ? '<span class="steam-badge joined" title="Estás unido">✓</span>' : ''}
                            </div>
                        </div>
                        
                        <div class="steam-card-body">
                            <h4 class="steam-card-title">${comunidad.nombre}</h4>
                            <div class="steam-card-subtitle">${comunidad.subtitulo}</div>
                            <p class="steam-card-description">${comunidad.descripcion}</p>
                            
                            ${comunidad.eventos ? this.renderEventos(comunidad) : ''}
                            
                            <div class="steam-card-stats">
                                <div class="steam-stat" title="Miembros totales">
                                    <i class="fas fa-users text-muted"></i>
                                    <div class="steam-stat-number">${this.formatearNumero(comunidad.miembros)}</div>
                                </div>
                                <div class="steam-stat" title="Miembros en línea">
                                    <i class="fas fa-circle text-success"></i>
                                    <div class="steam-stat-number">${this.formatearNumero(comunidad.online)}</div>
                                </div>
                                <div class="steam-stat" title="Discusiones activas">
                                    <i class="fas fa-comments text-warning"></i>
                                    <div class="steam-stat-number">${comunidad.discusiones}</div>
                                </div>
                            </div>
                            
                            <div class="steam-card-tags">
                                ${comunidad.tags.map(tag => 
                                    `<span class="steam-tag" onclick="steamCommunities.filtrarPorTag('${tag}')">${tag}</span>`
                                ).join('')}
                            </div>
                            
                            <div class="steam-card-footer">
                                <button class="btn-steam-join ${estaUnida ? 'joined' : ''}" 
                                        onclick="steamCommunities.toggleUnion(${comunidad.id})"
                                        data-comunidad="${comunidad.id}">
                                    ${estaUnida ? 
                                        '<i class="fas fa-check me-1"></i>UNIDO' : 
                                        '<i class="fas fa-plus me-1"></i>UNIRSE'
                                    }
                                </button>
                                <button class="btn-steam-view" onclick="steamCommunities.verComunidad(${comunidad.id})">
                                    <i class="fas fa-eye me-1"></i>Ver
                                </button>
                                <div class="steam-activity ${comunidad.actividad}">
                                    <span class="steam-online-dot ${comunidad.actividad}"></span>
                                    <small>${this.getNivelActividad(comunidad.actividad)}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    renderEventos(comunidad) {
        if (!comunidad.eventos || comunidad.eventos.length === 0) return '';
        
        const evento = comunidad.eventos[0];
        const diasRestantes = Math.ceil((new Date(evento.fecha) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="comunidad-evento mt-2 p-2 bg-dark rounded">
                <small class="text-warning d-block">
                    <i class="fas fa-calendar me-1"></i>
                    ${evento.titulo}
                </small>
                <small class="text-muted">
                    ${diasRestantes > 0 ? `En ${diasRestantes} días` : '¡Hoy!'} • 
                    ${evento.participantes} participantes
                </small>
            </div>
        `;
    }

    generarEventosAleatorios() {
        const eventos = [
            {
                tipo: "torneo",
                titulo: "Torneo Semanal",
                descripcion: "Competencia entre miembros por premios exclusivos",
                fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                participantes: Math.floor(Math.random() * 50) + 10
            },
            {
                tipo: "sorteo",
                titulo: "Sorteo de DLC",
                descripcion: "Gana contenido descargable gratuito",
                fecha: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                participantes: Math.floor(Math.random() * 100) + 20
            }
        ];
        
        this.comunidades.forEach(comunidad => {
            if (Math.random() > 0.3) {
                comunidad.eventos = [eventos[Math.floor(Math.random() * eventos.length)]];
            }
        });
    }

    generarRecomendaciones() {
        const userComunidades = JSON.parse(localStorage.getItem('comunidadesUnidas')) || [];
        const userTags = this.obtenerTagsPreferidos();
        
        this.comunidades.forEach(comunidad => {
            comunidad.puntajeRecomendacion = this.calcularPuntajeRecomendacion(comunidad, userTags);
        });
    }

    obtenerTagsPreferidos() {
        const comunidadesUnidas = JSON.parse(localStorage.getItem('comunidadesUnidas')) || [];
        const tagsCount = {};
        
        comunidadesUnidas.forEach(comId => {
            const comunidad = this.comunidades.find(c => c.id === comId);
            if (comunidad) {
                comunidad.tags.forEach(tag => {
                    tagsCount[tag] = (tagsCount[tag] || 0) + 1;
                });
            }
        });
        
        return Object.keys(tagsCount).sort((a, b) => tagsCount[b] - tagsCount[a]).slice(0, 3);
    }

    calcularPuntajeRecomendacion(comunidad, userTags) {
        if (this.comunidadesUnidas.has(comunidad.id)) return 0;
        
        let puntaje = 0;
        
        // Puntaje por tags en común
        userTags.forEach(tag => {
            if (comunidad.tags.includes(tag)) {
                puntaje += 10;
            }
        });
        
        // Puntaje por actividad
        const puntajeActividad = { 'muy alta': 15, 'alta': 10, 'media': 5, 'baja': 0 };
        puntaje += puntajeActividad[comunidad.actividad] || 0;
        
        // Puntaje por popularidad (miembros)
        if (comunidad.miembros > 20000) puntaje += 5;
        
        return puntaje;
    }

    renderSeccionRecomendaciones() {
        this.generarRecomendaciones();
        const comunidadesRecomendadas = this.comunidades
            .filter(c => !this.comunidadesUnidas.has(c.id) && c.puntajeRecomendacion > 15)
            .sort((a, b) => b.puntajeRecomendacion - a.puntajeRecomendacion)
            .slice(0, 3);
        
        const seccion = document.getElementById('seccionRecomendaciones');
        if (!seccion) return;
        
        if (comunidadesRecomendadas.length === 0) {
            seccion.style.display = 'none';
            return;
        }

        seccion.style.display = 'block';
        seccion.innerHTML = `
            <div class="row mb-5">
                <div class="col-12">
                    <h3 class="text-light mb-4">
                        <i class="fas fa-star me-2"></i>Recomendadas para ti
                    </h3>
                    <div class="row g-4">
                        ${comunidadesRecomendadas.map(comunidad => `
                            <div class="col-md-4">
                                <div class="steam-community-card h-100 recommended">
                                    <div class="recommended-badge">Recomendada</div>
                                    <div class="steam-card-header">
                                        <img src="${comunidad.banner}" alt="${comunidad.nombre}" 
                                             class="steam-card-banner" 
                                             onerror="this.src='https://via.placeholder.com/400x200/333/666?text=Banner+No+Disponible'">
                                        <div class="steam-card-logo">
                                            ${comunidad.icono}
                                        </div>
                                    </div>
                                    <div class="steam-card-body">
                                        <h4 class="steam-card-title">${comunidad.nombre}</h4>
                                        <div class="steam-card-subtitle">${comunidad.subtitulo}</div>
                                        <p class="steam-card-description">${comunidad.descripcion}</p>
                                        <div class="steam-card-footer">
                                            <button class="btn-steam-join" onclick="steamCommunities.toggleUnion(${comunidad.id})">
                                                <i class="fas fa-plus me-1"></i>UNIRSE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderComunidades() {
        this.renderComunidadesFiltradas();
    }

    filtrarPorTag(tag) {
        document.getElementById('filtroGenero').value = tag;
        this.aplicarFiltros();
    }

    limpiarFiltros() {
        document.getElementById('filtroPlataforma').value = '';
        document.getElementById('filtroGenero').value = '';
        document.getElementById('filtroActividad').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('sortSelect').value = 'actividad';
        
        this.filtros = { 
            plataforma: '', 
            genero: '', 
            actividad: '', 
            busqueda: '',
            orden: 'actividad'
        };
        
        localStorage.removeItem('filtrosComunidades');
        this.renderComunidades();
    }

    toggleUnion(comunidadId) {
        const boton = document.querySelector(`[data-comunidad="${comunidadId}"]`);
        const card = document.querySelector(`[data-comunidad-id="${comunidadId}"]`);
        
        if (this.comunidadesUnidas.has(comunidadId)) {
            this.comunidadesUnidas.delete(comunidadId);
            boton.innerHTML = '<i class="fas fa-plus me-1"></i>UNIRSE';
            boton.classList.remove('joined');
            card.classList.remove('joined-community');
            this.mostrarNotificacion(`Has abandonado la comunidad`, 'info');
        } else {
            this.comunidadesUnidas.add(comunidadId);
            boton.innerHTML = '<i class="fas fa-check me-1"></i>UNIDO';
            boton.classList.add('joined');
            card.classList.add('joined-community');
            this.mostrarNotificacion(`¡Te has unido a la comunidad!`, 'success');
            
            // Registrar visita para estadísticas
            if (window.estadisticasUsuario) {
                estadisticasUsuario.registrarVisitaComunidad(comunidadId);
            }
        }
        
        localStorage.setItem('comunidadesUnidas', JSON.stringify([...this.comunidadesUnidas]));
        this.actualizarEstadisticas();
        this.renderSeccionRecomendaciones();
    }

    verComunidad(id) {
        const comunidad = this.comunidades.find(c => c.id === id);
        localStorage.setItem('comunidadActual', JSON.stringify(comunidad));
        
        // Registrar visita para estadísticas
        if (window.estadisticasUsuario) {
            estadisticasUsuario.registrarVisitaComunidad(id);
        }
        
        window.location.href = `comunidad.html?id=${id}`;
    }

    getNivelActividad(nivel) {
        const niveles = {
            'muy alta': '🔥 Muy Activa',
            'alta': '⚡ Activa', 
            'media': '💚 Moderada',
            'baja': '💤 Poca'
        };
        return niveles[nivel] || '💚 Moderada';
    }

    formatearNumero(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    actualizarEstadisticas() {
        const activas = this.comunidades.length;
        const online = this.comunidades.reduce((sum, c) => sum + c.online, 0);
        const discusiones = this.comunidades.reduce((sum, c) => sum + c.discusiones, 0);
        const misComunidades = this.comunidadesUnidas.size;
        
        document.getElementById('comunidadesActivas').textContent = activas;
        document.getElementById('miembrosOnline').textContent = this.formatearNumero(online);
        document.getElementById('discusionesActivas').textContent = discusiones;
        document.getElementById('misComunidades').textContent = misComunidades;
    }

    mostrarNotificacion(mensaje, tipo) {
        const container = document.getElementById('notificacionesContainer');
        const noti = document.createElement('div');
        noti.className = `notificacion ${tipo}`;
        noti.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getNotificacionIcono(tipo)} me-2"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        container.appendChild(noti);
        
        setTimeout(() => {
            noti.classList.add('fade-out');
            setTimeout(() => noti.remove(), 300);
        }, 3000);
    }

    getNotificacionIcono(tipo) {
        const iconos = {
            'success': 'check-circle',
            'info': 'info-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return iconos[tipo] || 'bell';
    }
    
}