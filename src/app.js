const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const notasRoutes = require('./routes/notas.routes');
const iaRoutes = require('./routes/ia.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware para procesar cuerpos JSON
app.use(express.json());

/**
 * @openapi
 * /api-docs:
 *   get:
 *     summary: Documentación interactiva Swagger UI
 *     description: Portal web interactivo generado a partir de la especificación OpenAPI 3.0.0.
 *     tags:
 *       - Documentación
 *     responses:
 *       200:
 *         description: Interfaz visual de Swagger UI servida correctamente.
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Documentación API REST - Lab 5'
  })
);

// Exponer la especificación OpenAPI en formato JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rutas principales de la API
app.use('/api/notas', notasRoutes);
app.use('/api/ia', iaRoutes);

// Ruta base para comprobación de estado
app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'Lab 5: Notas + IA API',
    version: '1.0.0',
    documentacion: '/api-docs'
  });
});

// Middleware centralizado de manejo de errores
app.use(errorHandler);

module.exports = app;
