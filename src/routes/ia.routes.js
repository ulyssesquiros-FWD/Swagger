const express = require('express');
const { z } = require('zod');
const claudeService = require('../services/claude.service');
const { validar } = require('../middlewares/validar');
const { iaRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Esquema de validación para las consultas dirigidas a Claude.
 */
const preguntaSchema = z.object({
  pregunta: z
    .string({
      error: 'La pregunta es obligatoria'
    })
    .trim()
    .min(3, 'La pregunta debe contener al menos 3 caracteres')
    .max(2000, 'La pregunta no puede exceder los 2000 caracteres')
});

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Enviar una consulta a Claude AI
 *     description: Valida el texto de la pregunta con Zod y la envía al modelo configurado de Claude mediante el SDK oficial de Anthropic.
 *     tags:
 *       - IA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Consulta respondida exitosamente por Claude AI.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaIA'
 *             example:
 *               respuesta: "REST es un estilo de arquitectura para sistemas hipermedia distribuidos..."
 *               uso:
 *                 input_tokens: 18
 *                 output_tokens: 142
 *       400:
 *         description: Error de validación en la pregunta. No se realiza ninguna llamada a Claude.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 *       429:
 *         description: Límite de peticiones excedido (Rate Limiter de la API o del proveedor).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorIA'
 *       502:
 *         description: Error de autenticación o comunicación con la API de Claude.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorIA'
 *       503:
 *         description: Servicio de Claude sobrecargado temporalmente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorIA'
 */
router.post(
  '/preguntar',
  iaRateLimiter,
  validar(preguntaSchema),
  async (req, res, next) => {
    try {
      const { pregunta } = req.body;
      const resultado = await claudeService.preguntar(pregunta);

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
