const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

/**
 * Instancia en memoria del cliente compatible con DeepSeek para reutilización.
 */
let clienteDeepSeek = null;

/**
 * Obtiene o inicializa el cliente compatible con DeepSeek (utilizando el SDK oficial openai).
 * Permite que el servidor arranque sin problemas aunque la API key aún no esté configurada.
 * La comprobación de credenciales ocurre exclusivamente al invocar una operación de IA.
 *
 * @returns {OpenAI} Instancia del cliente
 */
const obtenerCliente = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    const errorAuth = new Error('Clave de API DEEPSEEK_API_KEY no configurada o vacía.');
    errorAuth.status = 401;
    errorAuth.isMissingKey = true;
    throw errorAuth;
  }

  const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!clienteDeepSeek || clienteDeepSeek.apiKey !== apiKey || clienteDeepSeek.baseURL !== baseURL) {
    clienteDeepSeek = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL
    });
  }

  return clienteDeepSeek;
};

/**
 * Envía una consulta a DeepSeek utilizando el SDK OpenAI compatible.
 *
 * @param {string} texto - Contenido o pregunta del usuario
 * @param {string} [system] - Instrucción de sistema (personalizada o predeterminada)
 * @param {Object} [opciones] - Opciones adicionales (ej. max_tokens)
 * @returns {Promise<{respuesta: string, uso: {input_tokens: number, output_tokens: number, total_tokens: number}}>}
 */
const preguntar = async (
  texto,
  system = 'Eres un asistente útil. Responde en español.',
  opciones = {}
) => {
  const cliente = obtenerCliente();
  const modelo = process.env.DEEPSEEK_MODEL || 'deepseek-flash';
  const maxTokens = opciones.max_tokens || 256;

  const completion = await cliente.chat.completions.create({
    model: modelo,
    messages: [
      {
        role: 'system',
        content: system
      },
      {
        role: 'user',
        content: texto
      }
    ],
    max_tokens: maxTokens,
    thinking: {
      type: 'disabled'
    },
    stream: false
  });

  const textoRespuesta = completion.choices?.[0]?.message?.content ?? '';

  const uso = {
    input_tokens: completion.usage?.prompt_tokens ?? 0,
    output_tokens: completion.usage?.completion_tokens ?? 0,
    total_tokens: completion.usage?.total_tokens ?? 0
  };

  // Registrar tokens de razonamiento y caché si DeepSeek los proporciona
  if (completion.usage?.completion_tokens_details?.reasoning_tokens !== undefined) {
    uso.reasoning_tokens = completion.usage.completion_tokens_details.reasoning_tokens;
  }
  if (completion.usage?.prompt_tokens_details?.cached_tokens !== undefined) {
    uso.cached_tokens = completion.usage.prompt_tokens_details.cached_tokens;
  }

  return {
    respuesta: textoRespuesta,
    uso
  };
};

module.exports = {
  preguntar,
  obtenerCliente
};

