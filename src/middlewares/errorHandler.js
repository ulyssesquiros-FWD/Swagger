const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

/**
 * Middleware centralizado de gestión de errores.
 * Captura y transforma errores del SDK compatible con DeepSeek, errores operacionales (AppError)
 * y excepciones no controladas, protegiendo credenciales y datos sensibles.
 */
const errorHandler = (err, req, res, next) => {
  // 1. Identificar si es un error proveniente de la API de DeepSeek o falta de credenciales
  const esErrorIA =
    err instanceof OpenAI.APIError ||
    err.isMissingKey ||
    err.name === 'APIError' ||
    err.name === 'AuthenticationError' ||
    err.name === 'PermissionDeniedError' ||
    err.name === 'BadRequestError' ||
    err.name === 'RateLimitError' ||
    err.name === 'InternalServerError' ||
    err.name === 'APIConnectionError' ||
    err.name === 'APIConnectionTimeoutError';

  if (esErrorIA) {
    const statusOriginal =
      err.status ||
      (err.name === 'APIConnectionError' || err.name === 'APIConnectionTimeoutError'
        ? 503
        : 500);

    // Registro técnico seguro en consola del servidor (sin exponer llaves, tokens ni encabezados)
    console.error(
      `[DeepSeek API Error] Código detectado: ${statusOriginal} | Nombre: ${err.name || 'APIError'}`
    );

    const cuerpoRespuesta = {
      error: 'IA_NO_DISPONIBLE',
      mensaje: 'El servicio de inteligencia artificial no está disponible actualmente.'
    };

    // Mapeo según especificación:
    // 429 del proveedor -> nuestra API devuelve 429
    if (statusOriginal === 429 || err.name === 'RateLimitError') {
      return res.status(429).json(cuerpoRespuesta);
    }

    // 500, 502, 503, 504 o errores de conexión/timeout -> devolver 503
    if (
      statusOriginal === 500 ||
      statusOriginal === 502 ||
      statusOriginal === 503 ||
      statusOriginal === 504 ||
      err.name === 'APIConnectionError' ||
      err.name === 'APIConnectionTimeoutError'
    ) {
      return res.status(503).json(cuerpoRespuesta);
    }

    // 401, 403, 400 y otros errores del proveedor -> devolver 502 Bad Gateway
    return res.status(502).json(cuerpoRespuesta);
  }

  // 2. Errores operacionales controlados mediante AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // 3. Error de parseo JSON (cuerpo malformado en la petición)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Formato JSON inválido en el cuerpo de la petición.'
    });
  }

  // 4. Errores internos no controlados
  console.error('[Error Inesperado Servidor]:', err.message || err);
  return res.status(500).json({
    error: 'ERROR_INTERNO_SERVIDOR'
  });
};

module.exports = {
  errorHandler
};
