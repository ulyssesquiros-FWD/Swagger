/**
 * Middleware para validar el cuerpo de las peticiones (req.body) usando esquemas Zod.
 * En caso de error, responde inmediatamente con HTTP 400 y el listado de fallos,
 * evitando llamadas innecesarias a la lógica de negocio o servicios externos (como Claude).
 *
 * @param {import('zod').ZodSchema} schema - Esquema de validación Zod
 */
const validar = (schema) => {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const issues = resultado.error.issues || resultado.error.errors || [];
      return res.status(400).json({
        errores: issues.map((err) => ({
          path: err.path,
          message: err.message
        }))
      });
    }

    req.body = resultado.data;
    next();
  };
};

module.exports = {
  validar
};
