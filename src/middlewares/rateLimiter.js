const rateLimit = require('express-rate-limit');

/**
 * Middleware de límite de peticiones (Rate Limiter) exclusivo para los endpoints de IA.
 * Protege la API de abusos, evita sobrecostos innecesarios en la API de DeepSeek
 * y garantiza que el CRUD de notas permanezca 100% operativo independientemente.
 */
const iaRateLimiter = rateLimit({
  windowMs: 60 * 1000, // Ventana de 1 minuto
  max: process.env.NODE_ENV === 'test' ? 100 : 10, // 10 solicitudes por minuto (ampliado en tests)
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Has superado el límite de peticiones de IA. Por favor, espera antes de realizar otra consulta.'
    });
  }
});

module.exports = {
  iaRateLimiter
};
