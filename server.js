import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*",  
  methods: ["POST", "GET"],
  credentials: false
}));

app.use(express.json());

// Almacenar el último mensaje del usuario por sesión
const ultimosMensajes = new Map();

app.post("/api/bot", async (req, res) => {
  const { nombreBot, contexto, mensajeUsuario, sessionId } = req.body;

  try {
    // Guardar el último mensaje del usuario para contexto
    if (mensajeUsuario && sessionId) {
      ultimosMensajes.set(sessionId, mensajeUsuario);
    }

    const ultimoMensaje = ultimosMensajes.get(sessionId) || "";

    const prompt = ultimoMensaje 
      ? `
Eres ${nombreBot}, un usuario en un foro sobre ${contexto}. 
Un usuario acaba de decir: "${ultimoMensaje}"

Responde de forma natural y conversacional, manteniendo el hilo de la conversación.
Responde brevemente (1-2 líneas máximo) como si fueras un amigo en el chat.
      `
      : `
Eres ${nombreBot}, un usuario en un foro sobre ${contexto}.
Inicia una conversación natural y breve (1-2 líneas) sobre el tema.
No saludes de forma genérica, sé específico con el tema.
      `;

    console.log('📝 Prompt enviado a Ollama:', prompt);

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "mistral", 
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Error de Ollama: ${response.status}`);
    }

    const data = await response.json();
    
    let mensajeLimpio = data.response.trim();
    mensajeLimpio = mensajeLimpio.replace(/^"|"$/g, '');
    
    // Limitar a 2 líneas máximo
    const lineas = mensajeLimpio.split('\n').slice(0, 2);
    mensajeLimpio = lineas.join(' ').trim();

    console.log('🤖 Respuesta generada:', mensajeLimpio);
    
    res.json({ 
      success: true,
      mensaje: mensajeLimpio,
      respondeA: ultimoMensaje || null
    });

  } catch (error) {
    console.error('❌ Error en /api/bot:', error);
    
    const mensajesFallback = ultimoMensaje 
      ? [
          `¡Interesante lo que dices sobre ${ultimoMensaje}!`,
          `No había pensado eso sobre ${contexto}, buena observación.`,
          `Completamente de acuerdo con tu punto.`,
          `¿Alguien más quiere opinar sobre esto?`
        ]
      : [
          `¡Hola! ¿Alguien quiere hablar sobre ${contexto}?`,
          `Me encanta este tema de ${contexto}, ¿tienen novedades?`,
          `¿Qué opinan sobre los últimos avances en ${contexto}?`
        ];
    
    const mensajeFallback = mensajesFallback[Math.floor(Math.random() * mensajesFallback.length)];
    
    res.json({
      success: false,
      mensaje: mensajeFallback,
      error: error.message
    });
  }
});

// Endpoint para conversación directa
app.post("/api/chat/directo", async (req, res) => {
  const { mensaje, contexto, historial = [] } = req.body;

  try {
    const prompt = `
Contexto: Estás en un chat sobre ${contexto}
Historial reciente: ${historial.slice(-3).join(' | ')}
Usuario dice: "${mensaje}"

Responde como un miembro más de la comunidad, de forma natural y conversacional.
Mantén tu respuesta breve (1-2 líneas) y relevante al mensaje del usuario.
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "mistral", 
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) throw new Error(`Error de Ollama: ${response.status}`);

    const data = await response.json();
    let respuesta = data.response.trim().replace(/^"|"$/g, '');
    
    const lineas = respuesta.split('\n').slice(0, 2);
    respuesta = lineas.join(' ').trim();

    res.json({ 
      success: true,
      respuesta: respuesta
    });

  } catch (error) {
    console.error('❌ Error en chat directo:', error);
    
    const respuestasFallback = [
      "¡Interesante punto! ¿Alguien más quiere opinar?",
      "No había pensado en eso, buena observación.",
      "Completamente de acuerdo contigo.",
      "¿Podrías desarrollar más esa idea?"
    ];
    
    res.json({
      success: true,
      respuesta: respuestasFallback[Math.floor(Math.random() * respuestasFallback.length)]
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🤖 Servidor conversacional listo en http://localhost:3000");
});