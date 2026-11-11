const Anthropic = require('@anthropic-ai/sdk');
const { AppError } = require('../utils/errors');

/**
 * Instancia en memoria del cliente de Anthropic para reutilización.
 */
let clienteAnthropic = null;

/**
 * Obtiene o inicializa el cliente de Anthropic.
 * No genera errores al arrancar el servidor si la API key aún no está presente;
 * la verificación ocurre únicamente cuando se intenta invocar una funcionalidad de Claude.
 *
 * @returns {Anthropic} Instancia del cliente SDK
 */
const obtenerCliente = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    const errorAuth = new Error('Clave de API ANTHROPIC_API_KEY no configurada o vacía.');
    errorAuth.status = 401;
    errorAuth.isMissingKey = true;
    throw errorAuth;
  }

  if (!clienteAnthropic || clienteAnthropic.apiKey !== apiKey) {
    clienteAnthropic = new Anthropic({
      apiKey: apiKey.trim()
    });
  }

  return clienteAnthropic;
};

/**
 * Envía un mensaje a Claude utilizando el SDK oficial de Anthropic.
 *
 * @param {string} texto - Contenido del mensaje del usuario
 * @param {string} [system] - Instrucción de sistema (personalizada o predeterminada)
 * @returns {Promise<{respuesta: string, uso: {input_tokens: number, output_tokens: number}}>}
 */
const preguntar = async (
  texto,
  system = 'Eres un asistente útil. Responde en español.'
) => {
  const cliente = obtenerCliente();
  const modelo = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

  const respuesta = await cliente.messages.create({
    model: modelo,
    max_tokens: 1024,
    system,
    messages: [
      {
        role: 'user',
        content: texto
      }
    ]
  });

  // Extraer el texto generado de los bloques de contenido
  const contenidoTexto = respuesta.content
    .filter((bloque) => bloque.type === 'text')
    .map((bloque) => bloque.text)
    .join('\n');

  return {
    respuesta: contenidoTexto,
    uso: {
      input_tokens: respuesta.usage?.input_tokens ?? 0,
      output_tokens: respuesta.usage?.output_tokens ?? 0
    }
  };
};

module.exports = {
  preguntar,
  obtenerCliente
};
