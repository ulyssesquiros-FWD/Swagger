/**
 * Clase personalizada para manejo de errores operacionales de la aplicación.
 * Permite definir códigos de estado HTTP y mensajes claros.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  AppError
};
