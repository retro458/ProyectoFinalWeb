class SistemaNotificaciones {
    constructor() {
        this.notificaciones = [];
        this.eventosActivos = [];
        this.tiposEventos = {
            'torneo': {
                titulo: '🏆 Nuevo Torneo',
                descripcion: 'Se ha iniciado un torneo en la comunidad',
                icono: '🏆',
                duracion: 7
            },
            'sorteo': {
                titulo: '🎁 Sorteo Activo',
                descripcion: 'Participa en nuestro sorteo exclusivo',
                icono: '🎁',
                duracion: 3
            },
            'evento_comunitario': {
                titulo: '👥 Evento Comunitario',
                descripcion: 'Únete a nuestro evento especial',
                icono: '👥',
                duracion: 5
            },
            'nuevo_contenido': {
                titulo: '📰 Nuevo Contenido',
                descripcion: 'Contenido exclusivo disponible',
                icono: '📰',
                duracion: 2
            },
            'logro_desbloqueado': {
                titulo: '⭐ Logro Desbloqueado',
                descripcion: 'Has desbloqueado un nuevo logro',
                icono: '⭐',
                duracion: 4
            },
            'miembro_nuevo': {
                titulo: '👋 Nuevo Miembro',
                descripcion: 'Alguien se ha unido a la comunidad',
                icono: '👋',
                duracion: 1
            },
            'discusion_popular': {
                titulo: '💬 Discusión Popular',
                descripcion: 'Una discusión está generando interés',
                icono: '💬',
                duracion: 2
            }
        };
        this.init();
    }

    init() {
        this.cargarNotificaciones();
        this.iniciarGeneradorEventos();
        this.configurarEventListeners();
        console.log('✅ Sistema de notificaciones inicializado');
    }

    cargarNotificaciones() {
        const notificacionesGuardadas = localStorage.getItem('notificacionesComunidades');
        if (notificacionesGuardadas) {
            this.notificaciones = JSON.parse(notificacionesGuardadas);
        }
        
        const eventosGuardados = localStorage.getItem('eventosActivos');
        if (eventosGuardados) {
            this.eventosActivos = JSON.parse(eventosGuardados);
        }
    }

    guardarNotificaciones() {
        localStorage.setItem('notificacionesComunidades', JSON.stringify(this.notificaciones));
        localStorage.setItem('eventosActivos', JSON.stringify(this.eventosActivos));
    }

    iniciarGeneradorEventos() {
        setInterval(() => {
            this.generarEventoAleatorio();
        }, Math.random() * 180000 + 120000);

        setInterval(() => {
            this.limpiarEventosExpirados();
        }, 60000);
    }

    configurarEventListeners() {
        document.addEventListener('comunidadUnida', (e) => {
            this.mostrarNotificacionPersonalizada(
                'success',
                `¡Te has unido a ${e.detail.comunidadNombre}!`,
                'Ahora recibirás notificaciones exclusivas de esta comunidad.'
            );
        });

        document.addEventListener('comunidadAbandonada', (e) => {
            this.mostrarNotificacionPersonalizada(
                'info',
                `Has abandonado ${e.detail.comunidadNombre}`,
                'Ya no recibirás notificaciones de esta comunidad.'
            );
        });

        document.addEventListener('nuevoMensajeChat', (e) => {
            if (!document.hasFocus()) {
                this.mostrarNotificacionMensaje(e.detail);
            }
        });
    }

    generarEventoAleatorio() {
        const comunidadesUnidas = JSON.parse(localStorage.getItem('comunidadesUnidas')) || [];
        const tieneComunidades = comunidadesUnidas.length > 0;
        
        let tiposDisponibles = Object.keys(this.tiposEventos);
        
        if (!tieneComunidades) {
            tiposDisponibles = tiposDisponibles.filter(tipo => 
                !['miembro_nuevo', 'discusion_popular'].includes(tipo)
            );
        }

        const tipoAleatorio = tiposDisponibles[Math.floor(Math.random() * tiposDisponibles.length)];
        const eventoConfig = this.tiposEventos[tipoAleatorio];
        
        const nuevoEvento = {
            id: 'evento-' + Date.now(),
            tipo: tipoAleatorio,
            titulo: eventoConfig.titulo,
            descripcion: eventoConfig.descripcion,
            icono: eventoConfig.icono,
            comunidad: this.obtenerComunidadAleatoria(),
            timestamp: new Date(),
            expiracion: new Date(Date.now() + eventoConfig.duracion * 24 * 60 * 60 * 1000),
            leido: false,
            paraMiembros: tieneComunidades
        };

        this.eventosActivos.push(nuevoEvento);
        this.mostrarNotificacionEvento(nuevoEvento);
        this.guardarNotificaciones();
        
        console.log(`🎯 Evento generado: ${nuevoEvento.titulo}`);
    }

    obtenerComunidadAleatoria() {
        const comunidades = JSON.parse(localStorage.getItem('comunidadesCreadas')) || [];
        const comunidadesPredefinidas = [
            { nombre: "HELLDIVERS 2", icono: "🪖" },
            { nombre: "SILENT HILL", icono: "🏚️" },
            { nombre: "HOLLOW KNIGHT", icono: "🐛" },
            { nombre: "BALDUR'S GATE 3", icono: "⚔️" },
            { nombre: "ELDEN RING", icono: "👑" },
            { nombre: "CYBERPUNK 2077", icono: "🔮" }
        ];
        
        const todasComunidades = [...comunidades, ...comunidadesPredefinidas];
        return todasComunidades[Math.floor(Math.random() * todasComunidades.length)];
    }

    mostrarNotificacionEvento(evento) {
        const container = document.getElementById('notificacionesContainer');
        if (!container) return;

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion-evento ${evento.paraMiembros ? 'miembro' : 'publico'}`;
        notificacion.setAttribute('data-evento-id', evento.id);
        
        notificacion.innerHTML = `
            <div class="evento-header">
                <span class="evento-icono">${evento.icono}</span>
                <span class="evento-titulo">${evento.titulo}</span>
                <button class="btn-cerrar-evento" onclick="sistemaNotificaciones.cerrarEvento('${evento.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="evento-body">
                <p class="evento-descripcion">${evento.descripcion}</p>
                <div class="evento-comunidad">
                    <span class="comunidad-icono">${evento.comunidad.icono}</span>
                    <span class="comunidad-nombre">${evento.comunidad.nombre}</span>
                </div>
                ${evento.paraMiembros ? 
                    '<div class="evento-badge-miembro"><i class="fas fa-star"></i> Exclusivo para miembros</div>' : 
                    '<div class="evento-badge-publico"><i class="fas fa-globe"></i> Público</div>'
                }
            </div>
            <div class="evento-footer">
                <small class="evento-tiempo">${this.formatearTiempo(evento.timestamp)}</small>
                <div class="evento-acciones">
                    ${!evento.paraMiembros ? 
                        `<button class="btn-evento-accion" onclick="sistemaNotificaciones.unirseDesdeEvento('${evento.comunidad.nombre}')">
                            <i class="fas fa-plus"></i> Unirse
                        </button>` : 
                        `<button class="btn-evento-accion" onclick="sistemaNotificaciones.verComunidadDesdeEvento('${evento.comunidad.nombre}')">
                            <i class="fas fa-eye"></i> Ver
                        </button>`
                    }
                </div>
            </div>
            <div class="evento-progreso"></div>
        `;

        container.appendChild(notificacion);

        setTimeout(() => {
            notificacion.classList.add('mostrar');
        }, 100);

        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.classList.remove('mostrar');
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        notificacion.remove();
                    }
                }, 300);
            }
        }, 10000);

        const progreso = notificacion.querySelector('.evento-progreso');
        let width = 100;
        const intervalo = setInterval(() => {
            if (width <= 0) {
                clearInterval(intervalo);
                return;
            }
            width -= 0.1;
            progreso.style.width = width + '%';
        }, 10);
    }

    mostrarNotificacionPersonalizada(tipo, titulo, mensaje) {
        const container = document.getElementById('notificacionesContainer');
        if (!container) return;

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        
        const iconos = {
            'success': 'fas fa-check-circle',
            'info': 'fas fa-info-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle'
        };

        notificacion.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="${iconos[tipo]} me-2"></i>
                <div>
                    <strong>${titulo}</strong>
                    <div class="small">${mensaje}</div>
                </div>
            </div>
        `;
        
        container.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('fade-out');
            setTimeout(() => notificacion.remove(), 300);
        }, 4000);
    }

    mostrarNotificacionMensaje(datosMensaje) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(`${datosMensaje.usuario} en ${datosMensaje.comunidad}`, {
                body: datosMensaje.mensaje,
                icon: '/icono/1032996.png',
                tag: 'mensaje-chat'
            });
        }
    }

    cerrarEvento(eventoId) {
        const eventoElement = document.querySelector(`[data-evento-id="${eventoId}"]`);
        if (eventoElement) {
            eventoElement.classList.remove('mostrar');
            setTimeout(() => {
                eventoElement.remove();
            }, 300);
        }

        this.eventosActivos = this.eventosActivos.filter(evento => evento.id !== eventoId);
        this.guardarNotificaciones();
    }

    unirseDesdeEvento(nombreComunidad) {
        const steamCommunities = window.steamCommunities;
        if (steamCommunities) {
            const comunidad = steamCommunities.comunidades.find(c => c.nombre === nombreComunidad);
            if (comunidad) {
                steamCommunities.toggleUnion(comunidad.id);
            }
        }
    }

    verComunidadDesdeEvento(nombreComunidad) {
        const steamCommunities = window.steamCommunities;
        if (steamCommunities) {
            const comunidad = steamCommunities.comunidades.find(c => c.nombre === nombreComunidad);
            if (comunidad) {
                steamCommunities.verComunidad(comunidad.id);
            }
        }
    }

    limpiarEventosExpirados() {
        const ahora = new Date();
        this.eventosActivos = this.eventosActivos.filter(evento => evento.expiracion > ahora);
        this.guardarNotificaciones();
    }

    formatearTiempo(timestamp) {
        const ahora = new Date();
        const fecha = new Date(timestamp);
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        return `Hace ${Math.floor(diffHours / 24)} d`;
    }

    obtenerEstadisticas() {
        const totalEventos = this.eventosActivos.length;
        const eventosMiembros = this.eventosActivos.filter(e => e.paraMiembros).length;
        const eventosPublicos = totalEventos - eventosMiembros;

        return {
            totalEventos,
            eventosMiembros,
            eventosPublicos,
            eventosPorTipo: this.contarEventosPorTipo()
        };
    }

    contarEventosPorTipo() {
        const conteo = {};
        this.eventosActivos.forEach(evento => {
            conteo[evento.tipo] = (conteo[evento.tipo] || 0) + 1;
        });
        return conteo;
    }

    mostrarPanelNotificaciones() {
        const panel = document.getElementById('panelNotificaciones');
        const contenido = document.getElementById('contenidoPanelNotificaciones');
        
        if (panel && contenido) {
            panel.classList.add('abierto');
            this.renderizarPanelNotificaciones(contenido);
        }
    }

    cerrarPanelNotificaciones() {
        const panel = document.getElementById('panelNotificaciones');
        if (panel) {
            panel.classList.remove('abierto');
        }
    }

    renderizarPanelNotificaciones(contenido) {
        const eventosAgrupados = this.agruparEventosPorComunidad();
        
        let html = '';
        
        if (this.eventosActivos.length === 0) {
            html = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-bell-slash fa-3x mb-3"></i>
                    <p>No hay notificaciones activas</p>
                </div>
            `;
        } else {
            Object.keys(eventosAgrupados).forEach(comunidadNombre => {
                html += `
                    <div class="comunidad-notificaciones mb-4">
                        <h6 class="text-primary mb-3">
                            <i class="fas fa-users me-2"></i>${comunidadNombre}
                        </h6>
                        ${eventosAgrupados[comunidadNombre].map(evento => `
                            <div class="notificacion-panel-item mb-3 p-3 bg-dark rounded">
                                <div class="d-flex align-items-start mb-2">
                                    <span class="evento-icono-panel">${evento.icono}</span>
                                    <div class="flex-grow-1 ms-2">
                                        <strong class="d-block">${evento.titulo}</strong>
                                        <small class="text-muted">${this.formatearTiempo(evento.timestamp)}</small>
                                    </div>
                                </div>
                                <p class="mb-2 small">${evento.descripcion}</p>
                                ${evento.paraMiembros ? 
                                    '<span class="badge bg-warning text-dark"><i class="fas fa-star me-1"></i>Exclusivo</span>' : 
                                    '<span class="badge bg-info"><i class="fas fa-globe me-1"></i>Público</span>'
                                }
                            </div>
                        `).join('')}
                    </div>
                `;
            });
        }
        
        contenido.innerHTML = html;
    }

    agruparEventosPorComunidad() {
        const agrupados = {};
        
        this.eventosActivos.forEach(evento => {
            if (!agrupados[evento.comunidad.nombre]) {
                agrupados[evento.comunidad.nombre] = [];
            }
            agrupados[evento.comunidad.nombre].push(evento);
        });
        
        return agrupados;
    }

    actualizarContadorNotificaciones() {
        const contador = document.getElementById('contadorNotificaciones');
        if (contador) {
            const total = this.eventosActivos.length;
            contador.textContent = total > 99 ? '99+' : total;
            contador.style.display = total > 0 ? 'inline' : 'none';
        }
    }

    solicitarPermisosNotificaciones() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.mostrarNotificacionPersonalizada(
                        'success',
                        'Notificaciones activadas',
                        'Ahora recibirás notificaciones de eventos importantes.'
                    );
                }
            });
        }
    }
}

// Inicializar sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaNotificaciones = new SistemaNotificaciones();
});