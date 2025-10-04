class SteamCommunities {
    constructor() {
        this.comunidades = [];
        this.comunidadesUnidas = new Set();
        this.init();
    }

    init() {
        this.cargarComunidadesEspecificas();
        this.renderComunidades();
        this.actualizarEstadisticas();
    }

    cargarComunidadesEspecificas() {
        this.comunidades = [
            {
                id: 1,
                nombre: "HELLDIVERS 2",
                subtitulo: "For Democracy!",
                descripcion: "Únete a la lucha por la libertad managed. Estrategias, coordinación y pura acción cooperativa.",
                icono: "🪖",
                banner: "",
                miembros: 15420,
                online: 2847,
                discusiones: 42,
                actividad: "muy alta",
                tags: ["Coop", "Shooter", "Satire", "PS5/PC"],
                juego: "Helldivers 2"
            },
            {
                id: 2,
                nombre: "SILENT HILL",
                subtitulo: "Survival Horror Legends",
                descripcion: "Analizamos cada rincón de la niebla. Teorías, guías y la mejor comunidad de horror psicológico.",
                icono: "🏚️",
                banner: "",
                miembros: 8920,
                online: 1560,
                discusiones: 38,
                actividad: "alta",
                tags: ["Horror", "Psicológico", "Konami", "Misterio"],
                juego: "Silent Hill"
            },
            {
                id: 3,
                nombre: "HOLLOW KNIGHT",
                subtitulo: "Hallownest Awaits",
                descripcion: "Exploramos cada rincón de Hallownest. Guías de bosses, rutas y esperando Silksong como locos.",
                icono: "🐛",
                banner: "",
                miembros: 23450,
                online: 3890,
                discusiones: 67,
                actividad: "muy alta",
                tags: ["Metroidvania", "Indie", "Team Cherry", "Exploración"],
                juego: "Hollow Knight"
            },
            {
                id: 4,
                nombre: "BALDUR'S GATE 3",
                subtitulo: "D&D Adventure",
                descripcion: "Cada decisión importa. Comparte tus builds, historias y descubre secretos ocultos.",
                icono: "⚔️",
                banner:"" ,
                miembros: 18760,
                online: 3120,
                discusiones: 89,
                actividad: "muy alta",
                tags: ["RPG", "D&D", "Larian", "Cooperativo"],
                juego: "Baldur's Gate 3"
            },
            {
                id: 5,
                nombre: "ELDEN RING",
                subtitulo: "Tierras Intermedias",
                descripcion: "Juntos sufriremos y venceremos. Builds, cooperación y el lore más profundo.",
                icono: "👑",
                banner: "",
                miembros: 32450,
                online: 5670,
                discusiones: 124,
                actividad: "muy alta",
                tags: ["Souls", "FromSoftware", "Open World", "Difícil"],
                juego: "Elden Ring"
            },
            {
                id: 6,
                nombre: "CYBERPUNK 2077",
                subtitulo: "Night City Dreams",
                descripcion: "Desde el lanzamiento hasta Phantom Liberty. Mods, builds y las mejores historias de Night City.",
                icono: "🔮",
                banner: "",
                miembros: 14320,
                online: 2450,
                discusiones: 56,
                actividad: "alta",
                tags: ["RPG", "Futurista", "CD Projekt", "Open World"],
                juego: "Cyberpunk 2077"
            }
        ];
    }

    renderComunidades() {
        const grid = document.getElementById('comunidadesGrid');
        let html = '';

        this.comunidades.forEach(comunidad => {
            const estaUnida = this.comunidadesUnidas.has(comunidad.id);
            
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="steam-community-card h-100">
                        <div class="steam-card-header">
                            <img src="${comunidad.banner}" alt="${comunidad.nombre}" class="steam-card-banner">
                            <div class="steam-card-logo">
                                ${comunidad.icono}
                            </div>
                        </div>
                        
                        <div class="steam-card-body">
                            <h4 class="steam-card-title">${comunidad.nombre}</h4>
                            <div class="steam-card-subtitle">${comunidad.subtitulo}</div>
                            <p class="steam-card-description">${comunidad.descripcion}</p>
                            
                            <div class="steam-card-stats">
                                <div class="steam-stat">
                                    <div class="steam-stat-number">${this.formatearNumero(comunidad.miembros)}</div>
                                    <div class="steam-stat-label">Miembros</div>
                                </div>
                                <div class="steam-stat">
                                    <div class="steam-stat-number">${this.formatearNumero(comunidad.online)}</div>
                                    <div class="steam-stat-label">En línea</div>
                                </div>
                                <div class="steam-stat">
                                    <div class="steam-stat-number">${comunidad.discusiones}</div>
                                    <div class="steam-stat-label">Discusiones</div>
                                </div>
                            </div>
                            
                            <div class="steam-card-tags">
                                ${comunidad.tags.map(tag => `<span class="steam-tag">${tag}</span>`).join('')}
                            </div>
                            
                            <div class="steam-card-footer">
                                <button class="btn-steam-join ${estaUnida ? 'joined' : ''}" 
                                        onclick="steamCommunities.toggleUnion(${comunidad.id})"
                                        data-comunidad="${comunidad.id}">
                                    ${estaUnida ? '✅ UNIDO' : '🎮 UNIRSE'}
                                </button>
                                <div class="steam-activity">
                                    <span class="steam-online-dot"></span>
                                    <span>${this.getNivelActividad(comunidad.actividad)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    toggleUnion(comunidadId) {
        const boton = document.querySelector(`[data-comunidad="${comunidadId}"]`);
        
        if (this.comunidadesUnidas.has(comunidadId)) {
            this.comunidadesUnidas.delete(comunidadId);
            boton.textContent = '🎮 UNIRSE';
            boton.classList.remove('joined');
            this.mostrarNotificacion(`Has abandonado la comunidad`, 'info');
        } else {
            this.comunidadesUnidas.add(comunidadId);
            boton.textContent = '✅ UNIDO';
            boton.classList.add('joined');
            this.mostrarNotificacion(`¡Te has unido a la comunidad!`, 'success');
        }
        
        this.actualizarEstadisticas();
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
        
        document.getElementById('comunidadesActivas').textContent = activas;
        document.getElementById('miembrosOnline').textContent = this.formatearNumero(online);
        document.getElementById('discusionesActivas').textContent = discusiones;
    }

    mostrarNotificacion(mensaje, tipo) {
        // Sistema de notificaciones (se implementara despues)
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }
}

// Inicializar
const steamCommunities = new SteamCommunities();