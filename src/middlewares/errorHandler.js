const Anthropic = require('@anthropic-ai/sdk');
const { AppError } = require('../utils/errors');

/**
 * Middleware centralizado de gestión de errores.
 * Captura y transforma errores del SDK de Anthropic, errores operacionales (AppError)
 * y excepciones no controladas, protegiendo credenciales y datos sensibles.
 */
const errorHandler = (err, req, res, next) => {
  // 1. Identificar si es un error proveniente del SDK de Anthropic o falta de credenciales
  const esErrorAnthropic =
    err instanceof Anthropic.APIError ||
    err.isMissingKey ||
    err.name === 'APIError' ||
    err.name === 'AuthenticationError' ||
    err.name === 'RateLimitError' ||
    err.name === 'APIConnectionError' ||
    err.name === 'InternalServerError';

  if (esErrorAnthropic) {
    const statusOriginal = err.status || 500;

    // Registro técnico seguro en consola del servidor (sin exponer llaves ni encabezados)
    console.error(
      `[Anthropic SDK Error] Código detectado: ${statusOriginal} | Nombre: ${err.name || 'APIError'}`
    );

    // Mapeo según la guía del laboratorio:
    // 429 -> 429
    if (statusOriginal === 429) {
      return res.status(429).json({
        error: 'IA_NO_DISPONIBLE'
      });
    }

    // 529 -> 503
    if (statusOriginal === 529) {
      return res.status(503).json({
        error: 'IA_NO_DISPONIBLE'
      });
    }

    // 401, 400 y otros -> 502 Bad Gateway
    return res.status(502).json({
      error: 'IA_NO_DISPONIBLE'
    });
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
