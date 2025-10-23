const data = JSON.parse(localStorage.getItem('comunidadActual'));
const API_URL = 'http://localhost:3000/api';

// Generar un ID único para esta sesión de chat
const sessionId = 'user-' + Math.random().toString(36).substr(2, 9);

// Usuarios simulados
const usuariosSimulados = [
    { nombre: "AlexGamer", icono: "🎮", personalidad: "jugador entusiasta" },
    { nombre: "MartaPro", icono: "🌟", personalidad: "experta colaborativa" },
    { nombre: "CarlosZ", icono: "⚡", personalidad: "fanático rápido" },
    { nombre: "LunaStream", icono: "🌙", personalidad: "streamer amigable" }
];

// Historial de conversación
const historialConversacion = [];
let chatActivo = true;
let mensajesEnviados = 0;

if (data) {
    document.title = `${data.nombre} - Comunidad`;
    document.getElementById("comunidadContainer").innerHTML = `
        <div class="card bg-secondary p-4 mb-4">
            <div class="d-flex align-items-center mb-3">
                <span class="fs-2 me-3">${data.icono}</span>
                <div>
                    <h1 class="h3 mb-1">${data.nombre}</h1>
                    <h5 class="text-muted mb-0">${data.subtitulo}</h5>
                </div>
            </div>
            <p class="mb-3">${data.descripcion}</p>
            <div class="row text-center">
                <div class="col-md-3">
                    <strong>Miembros</strong>
                    <div class="fs-5 text-warning">${data.miembros}</div>
                </div>
                <div class="col-md-3">
                    <strong>Online</strong>
                    <div class="fs-5 text-success">${data.online}</div>
                </div>
                <div class="col-md-3">
                    <strong>Actividad</strong>
                    <div class="fs-5 text-info">${data.actividad}</div>
                </div>
                <div class="col-md-3">
                    <strong>Discusiones</strong>
                    <div class="fs-5 text-primary">${data.discusiones}</div>
                </div>
            </div>
            <div class="mt-3">
                ${data.tags.map(t => `<span class='badge bg-info me-1'>${t}</span>`).join("")}
            </div>
        </div>
    `;

    inicializarChatDinamico();
}

async function inicializarChatDinamico() {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;

    // Sistema de bienvenida contextual
    mostrarBienvenidaContextual(chatContainer);
    
    // Cargar mensajes iniciales
    await cargarMensajesIniciales(chatContainer);
    
    // Iniciar sistemas
    iniciarSimulacionActividad(chatContainer);
    iniciarSistemaReacciones();
    iniciarContadorActividad();
}

function mostrarBienvenidaContextual(container) {
    const hora = new Date().getHours();
    let saludo = "¡Bienvenido!";
    
    if (hora < 12) saludo = "¡Buenos días!";
    else if (hora < 18) saludo = "¡Buenas tardes!";
    else saludo = "¡Buenas noches!";

    agregarMensajeAlChat(container, "Sistema", "🤖", 
        `${saludo} Has entrado a ${data.nombre}. ${generarFraseContextual()}`, "", false);
}

function generarFraseContextual() {
    const frases = [
        "¡Es genial verte por aquí!",
        "La comunidad está muy activa hoy.",
        "¿Has probado las últimas novedades?",
        "No dudes en preguntar lo que necesites.",
        "¡Hay eventos interesantes esta semana!"
    ];
    return frases[Math.floor(Math.random() * frases.length)];
}

async function cargarMensajesIniciales(container) {
    const cantidadInicial = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < cantidadInicial; i++) {
        await generarMensajeContextual(container, false);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

async function generarMensajeContextual(container, esNuevo = true, mensajeUsuario = null) {
    try {
        const usuario = usuariosSimulados[Math.floor(Math.random() * usuariosSimulados.length)];
        const contexto = `${data.tags.join(', ')} | ${usuario.personalidad} | ${obtenerTemaConversacion()}`;
        
        console.log(`🤖 Generando respuesta contextual para: ${usuario.nombre}`);
        
        const response = await fetch(`${API_URL}/bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombreBot: usuario.nombre,
                contexto: contexto,
                mensajeUsuario: mensajeUsuario,
                historial: historialConversacion.slice(-3),
                sessionId: sessionId
            })
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const result = await response.json();
        
        let mensajeFinal = result.mensaje || generarMensajeFallback(contexto, mensajeUsuario);
        mensajeFinal = agregarEmojisAleatorios(mensajeFinal);
        
        // Agregar al historial
        historialConversacion.push({
            usuario: usuario.nombre,
            mensaje: mensajeFinal,
            timestamp: new Date(),
            respondeA: mensajeUsuario
        });
        
        console.log(`💬 ${usuario.nombre} responde a "${mensajeUsuario}": ${mensajeFinal}`);
        
        agregarMensajeAlChat(container, usuario.nombre, usuario.icono, mensajeFinal, 
                           esNuevo ? "Ahora" : generarTiempoAleatorio(), esNuevo);
        
    } catch (error) {
        console.error('❌ Error generando mensaje contextual:', error);
        
        const usuario = usuariosSimulados[Math.floor(Math.random() * usuariosSimulados.length)];
        const mensajeFallback = generarMensajeFallback(data.tags.join(', '), mensajeUsuario);
        
        agregarMensajeAlChat(container, usuario.nombre, usuario.icono, mensajeFallback, 
                           esNuevo ? "Ahora" : generarTiempoAleatorio(), esNuevo);
    }
}

function obtenerTemaConversacion() {
    const temas = [
        "última actualización", "estrategias avanzadas", "eventos comunitarios",
        "secretos del juego", "consejos para principiantes", "mods interesantes"
    ];
    return temas[Math.floor(Math.random() * temas.length)];
}

function agregarEmojisAleatorios(mensaje) {
    const emojis = ['🎮', '🔥', '⚡', '💎', '🌟', '🎯', '🏆'];
    if (Math.random() > 0.7) {
        return mensaje + ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }
    return mensaje;
}

function generarMensajeFallback(contexto, mensajeUsuario = null) {
    if (mensajeUsuario) {
        const respuestas = [
            `¡Interesante lo que dices sobre ${mensajeUsuario.substring(0, 20)}...!`,
            `No había pensado en eso, buena observación.`,
            `Completamente de acuerdo con tu punto.`,
            `¿Alguien más quiere opinar sobre esto?`
        ];
        return respuestas[Math.floor(Math.random() * respuestas.length)];
    } else {
        const mensajes = [
            `¡Hola! ¿Alguien quiere hablar sobre ${contexto}?`,
            `Me encanta este tema de ${contexto}, ¿tienen novedades?`,
            `¿Qué opinan sobre los últimos avances en ${contexto}?`
        ];
        return mensajes[Math.floor(Math.random() * mensajes.length)];
    }
}

function iniciarSimulacionActividad(container) {
    setInterval(async () => {
        if (chatActivo && (historialConversacion.length < 10 || Math.random() > 0.7)) {
            await generarMensajeContextual(container, true);
        }
    }, 30000);
}

// Sistema de reacciones
function iniciarSistemaReacciones() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('message-content')) {
            const mensaje = e.target.closest('.message');
            if (!mensaje.querySelector('.reacciones')) {
                agregarReacciones(mensaje);
            }
        }
    });
}

function agregarReacciones(elementoMensaje) {
    const reacciones = document.createElement('div');
    reacciones.className = 'reacciones mt-2';
    reacciones.innerHTML = `
        <button class="btn-reaccion" onclick="agregarReaccion(this, '👍')">👍</button>
        <button class="btn-reaccion" onclick="agregarReaccion(this, '❤️')">❤️</button>
        <button class="btn-reaccion" onclick="agregarReaccion(this, '😂')">😂</button>
        <button class="btn-reaccion" onclick="agregarReaccion(this, '🎮')">🎮</button>
    `;
    elementoMensaje.appendChild(reacciones);
}

function agregarReaccion(boton, reaccion) {
    const mensaje = boton.closest('.message');
    let contador = mensaje.querySelector('.contador-reacciones');
    
    if (!contador) {
        contador = document.createElement('span');
        contador.className = 'contador-reacciones ms-2 text-primary';
        boton.parentNode.appendChild(contador);
    }
    
    let count = parseInt(contador.textContent) || 0;
    count++;
    contador.textContent = count;
    
    boton.style.transform = 'scale(1.2)';
    setTimeout(() => {
        boton.style.transform = 'scale(1)';
    }, 200);
}

// Contador de actividad
function iniciarContadorActividad() {
    const actividadElement = document.createElement('div');
    actividadElement.className = 'actividad-chat';
    document.querySelector('.card-body').appendChild(actividadElement);

    setInterval(() => {
        const miembros = Math.floor(Math.random() * 10) + data.online;
        actividadElement.innerHTML = `<i class="fas fa-users me-1"></i>${miembros} miembros activos en el chat`;
    }, 30000);
}

// FUNCIÓN PRINCIPAL MEJORADA
async function enviarMensaje() {
    const input = document.getElementById('messageInput');
    const mensaje = input.value.trim();
    const chatContainer = document.getElementById('chatMessages');
    
    if (mensaje && chatContainer) {
        console.log(`👤 Usuario escribe: ${mensaje}`);
        mensajesEnviados++;
        
        // Agregar mensaje del usuario inmediatamente
        agregarMensajeAlChat(chatContainer, "Tú", "👤", mensaje, "Ahora", true);
        
        // Agregar al historial
        historialConversacion.push({
            usuario: "Tú",
            mensaje: mensaje,
            timestamp: new Date()
        });
        
        input.value = '';
        
        // Registrar en estadísticas
        if (window.estadisticasUsuario) {
            estadisticasUsuario.registrarMensajeEnviado();
        }
        
        // Verificar logros
        if (window.sistemaLogros) {
            sistemaLogros.verificarLogros();
        }
        
        // RESPUESTA CONTEXTUAL MEJORADA
        setTimeout(async () => {
            await generarMensajeContextual(chatContainer, true, mensaje);
            
            // Posible segunda respuesta de otro bot (50% de probabilidad)
            if (Math.random() > 0.5) {
                setTimeout(async () => {
                    await generarMensajeContextual(chatContainer, true, mensaje);
                }, 2000);
            }
        }, 1000);
    }
}

// Funciones auxiliares
function generarTiempoAleatorio() {
    const minutos = Math.floor(Math.random() * 60);
    const horas = Math.floor(Math.random() * 24);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

function agregarMensajeAlChat(container, usuario, icono, mensaje, tiempo, esNuevo = false) {
    const mensajeHTML = `
        <div class="message ${esNuevo ? 'new-message' : ''} mb-3">
            <div class="d-flex align-items-start">
                <span class="me-2 fs-5">${icono}</span>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <strong class="${usuario === 'Tú' ? 'text-primary' : 'text-warning'}">${usuario}</strong>
                        <small class="text-muted">${tiempo}</small>
                    </div>
                    <div class="message-content">
                        <p class="mb-0 text-light">${mensaje}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML += mensajeHTML;
    
    if (esNuevo) {
        container.scrollTop = container.scrollHeight;
        
        // Efecto visual para nuevos mensajes
        const nuevosMensajes = container.querySelectorAll('.new-message');
        nuevosMensajes.forEach(msg => {
            msg.style.animation = 'highlight 2s ease';
            setTimeout(() => {
                msg.classList.remove('new-message');
                msg.style.animation = '';
            }, 2000);
        });
    }
}

// Event listeners mejorados
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('messageInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                enviarMensaje();
            }
        });
        
        // Placeholder dinámico
        const placeholders = [
            "Escribe un mensaje...",
            `Pregunta sobre ${data?.tags[0] || 'el juego'}...`,
            "Comparte tu experiencia...",
            "¿Alguna estrategia que recomiendes?"
        ];
        let placeholderIndex = 0;
        
        setInterval(() => {
            input.placeholder = placeholders[placeholderIndex];
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }, 3000);
        
        input.focus();
    }
});

window.enviarMensaje = enviarMensaje;