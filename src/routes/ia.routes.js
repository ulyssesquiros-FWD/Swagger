const express = require('express');
const { z } = require('zod');
const deepseekService = require('../services/deepseek.service');
const { validar } = require('../middlewares/validar');
const { iaRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Esquema de validación para las consultas dirigidas a DeepSeek.
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
 *     summary: Enviar una consulta a DeepSeek AI
 *     description: Valida el texto de la pregunta con Zod y la envía al modelo deepseek-flash utilizando el SDK OpenAI compatible con DeepSeek.
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
 *         description: Consulta respondida exitosamente por DeepSeek AI.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaIA'
 *             example:
 *               respuesta: "REST es un estilo de arquitectura para sistemas hipermedia distribuidos..."
 *               uso:
 *                 input_tokens: 35
 *                 output_tokens: 90
 *                 total_tokens: 125
 *       400:
 *         description: Error de validación en la pregunta. No se realiza ninguna llamada a DeepSeek.
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
 *         description: Error de autenticación o comunicación con la API de DeepSeek.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorIA'
 *       503:
 *         description: Servicio de DeepSeek sobrecargado o error de conexión.
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
      const resultado = await deepseekService.preguntar(pregunta);

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
