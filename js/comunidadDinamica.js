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
                <div class="col-md-4">
                    <strong>Miembros</strong>
                    <div class="fs-5 text-warning">${data.miembros}</div>
                </div>
                <div class="col-md-4">
                    <strong>Online</strong>
                    <div class="fs-5 text-success">${data.online}</div>
                </div>
                <div class="col-md-4">
                    <strong>Actividad</strong>
                    <div class="fs-5 text-info">${data.actividad}</div>
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

    // Mostrar mensaje de bienvenida inmediato
    agregarMensajeAlChat(chatContainer, "Sistema", "🤖", 
        `¡Bienvenido a ${data.nombre}! .`, "", false);

    // Cargar mensajes iniciales
    await cargarMensajesIniciales(chatContainer);
    
    // Iniciar simulación de actividad
    iniciarSimulacionActividad(chatContainer);
}

async function cargarMensajesIniciales(container) {
    // Solo 1-2 mensajes iniciales para no saturar
    const cantidadInicial = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < cantidadInicial; i++) {
        await generarMensajeContextual(container, false);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

async function generarMensajeContextual(container, esNuevo = true, mensajeUsuario = null) {
    try {
        const usuario = usuariosSimulados[Math.floor(Math.random() * usuariosSimulados.length)];
        const contexto = `${data.tags.join(', ')} - como ${usuario.personalidad}`;
        
        console.log(`🤖 Generando respuesta contextual para: ${usuario.nombre}`);
        
        const response = await fetch(`${API_URL}/bot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombreBot: usuario.nombre,
                contexto: contexto,
                mensajeUsuario: mensajeUsuario,
                sessionId: sessionId
            })
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const result = await response.json();
        
        let mensajeFinal = result.mensaje || generarMensajeFallback(contexto, mensajeUsuario);
        
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
    // Mensajes automáticos menos frecuentes para no interferir con conversaciones
    setInterval(async () => {
        // Solo generar mensaje automático si no hay mucha actividad reciente
        if (historialConversacion.length < 10 || Math.random() > 0.7) {
            await generarMensajeContextual(container, true);
        }
    }, 30000); // Cada 30 segundos
}

// **FUNCIÓN PRINCIPAL MEJORADA - Ahora sí responde contextualmente**
async function enviarMensaje() {
    const input = document.getElementById('messageInput');
    const mensaje = input.value.trim();
    const chatContainer = document.getElementById('chatMessages');
    
    if (mensaje && chatContainer) {
        console.log(`👤 Usuario escribe: ${mensaje}`);
        
        // Agregar mensaje del usuario inmediatamente
        agregarMensajeAlChat(chatContainer, "Tú", "👤", mensaje, "Ahora", true);
        
        // Agregar al historial
        historialConversacion.push({
            usuario: "Tú",
            mensaje: mensaje,
            timestamp: new Date()
        });
        
        input.value = '';
        
        // **RESPUESTA CONTEXTUAL - El bot responde AL MENSAJE DEL USUARIO**
        setTimeout(async () => {
            // Elegir un bot aleatorio para responder
            await generarMensajeContextual(chatContainer, true, mensaje);
            
            // Posible segunda respuesta de otro bot (50% de probabilidad)
            if (Math.random() > 0.5) {
                setTimeout(async () => {
                    await generarMensajeContextual(chatContainer, true, mensaje);
                }, 2000);
            }
        }, 1000); // Respuesta en 1 segundo
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
                <span class="me-2">${icono}</span>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <strong class="${usuario === 'Tú' ? 'text-primary' : 'text-warning'}">${usuario}</strong>
                        <small class="text-muted">${tiempo}</small>
                    </div>
                    <p class="mb-0 text-light">${mensaje}</p>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML += mensajeHTML;
    
    if (esNuevo) {
        container.scrollTop = container.scrollHeight;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('messageInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                enviarMensaje();
            }
        });
        input.focus();
    }
});

window.enviarMensaje = enviarMensaje;