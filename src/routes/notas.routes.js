const express = require('express');
const { z } = require('zod');
const notasService = require('../services/notas.service');
const deepseekService = require('../services/deepseek.service');
const { validar } = require('../middlewares/validar');
const { iaRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * Esquema de validación para la creación de una nota.
 */
const crearNotaSchema = z.object({
  titulo: z
    .string({
      error: 'El título es obligatorio'
    })
    .trim()
    .min(1, 'El título no puede estar vacío')
    .max(100, 'El título no puede superar los 100 caracteres'),
  contenido: z
    .string({
      error: 'El contenido es obligatorio'
    })
    .trim()
    .min(1, 'El contenido no puede estar vacío')
    .max(5000, 'El contenido no puede superar los 5000 caracteres')
});

/**
 * @openapi
 * /api/notas:
 *   get:
 *     summary: Listar todas las notas
 *     description: Obtiene la colección completa de notas almacenadas en memoria.
 *     tags:
 *       - Notas
 *     responses:
 *       200:
 *         description: Lista de notas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nota'
 *             example:
 *               - id: 1
 *                 titulo: "Introducción a REST"
 *                 contenido: "REST es un estilo de arquitectura..."
 */
router.get('/', (req, res) => {
  const notas = notasService.listar();
  res.status(200).json(notas);
});

/**
 * @openapi
 * /api/notas/{id}:
 *   get:
 *     summary: Obtener una nota por su ID
 *     description: Busca y devuelve la nota correspondiente al identificador numérico proporcionado.
 *     tags:
 *       - Notas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador numérico de la nota.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Nota encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       404:
 *         description: La nota solicitada no existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *             example:
 *               error: "Nota con ID 999 no encontrada"
 */
router.get('/:id', (req, res) => {
  const nota = notasService.buscar(req.params.id);
  res.status(200).json(nota);
});

/**
 * @openapi
 * /api/notas:
 *   post:
 *     summary: Crear una nueva nota
 *     description: Valida el cuerpo de la solicitud con Zod y guarda la nueva nota en memoria con un ID auto-generado.
 *     tags:
 *       - Notas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearNota'
 *     responses:
 *       201:
 *         description: Nota creada satisfactoriamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *       400:
 *         description: Error de validación en los datos de entrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 */
router.post('/', validar(crearNotaSchema), (req, res) => {
  const nuevaNota = notasService.crear(req.body);
  res.status(201).json(nuevaNota);
});

/**
 * @openapi
 * /api/notas/{id}:
 *   delete:
 *     summary: Eliminar una nota por su ID
 *     description: Remueve la nota especificada del almacenamiento en memoria. No devuelve contenido en el cuerpo si la eliminación es exitosa.
 *     tags:
 *       - Notas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador numérico de la nota a eliminar.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       204:
 *         description: Nota eliminada exitosamente. Sin contenido en el cuerpo de la respuesta.
 *       404:
 *         description: La nota a eliminar no existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *             example:
 *               error: "Nota con ID 999 no encontrada"
 */
router.delete('/:id', (req, res) => {
  notasService.eliminar(req.params.id);
  res.status(204).end();
});

/**
 * @openapi
 * /api/notas/{id}/resumen:
 *   post:
 *     summary: Generar resumen de una nota con DeepSeek AI
 *     description: Recupera el contenido de una nota existente y utiliza la API de DeepSeek (modelo deepseek-flash) para generar un resumen estructurado en exactamente 3 viñetas breves.
 *     tags:
 *       - Notas
 *       - IA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador numérico de la nota a resumir.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Resumen generado exitosamente por DeepSeek AI.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumenNota'
 *             example:
 *               notaId: 1
 *               resumen: "- Primera idea importante.\n- Segunda idea importante.\n- Tercera idea importante."
 *       404:
 *         description: La nota no existe. No se realiza ninguna llamada a la API de DeepSeek.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRespuesta'
 *       429:
 *         description: Límite de solicitudes de IA excedido (Rate limit de la API o del proveedor).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorIA'
 *       502:
 *         description: Error de comunicación o credenciales con la API de DeepSeek.
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
router.post('/:id/resumen', iaRateLimiter, async (req, res, next) => {
  try {
    // 1 & 2 & 3. Buscar la nota y verificar que exista (lanza 404 si no existe)
    const nota = notasService.buscar(req.params.id);

    // 4 & 5 & 6. Enviar contenido a DeepSeek con el system prompt especificado
    const systemPrompt =
      'Resume el texto en exactamente 3 viñetas breves y concretas, en español. No inventes información. Utiliza únicamente los datos proporcionados y evita explicaciones adicionales.';

    const resultadoIA = await deepseekService.preguntar(nota.contenido, systemPrompt, {
      max_tokens: 256
    });

    // 7. Devolver el resultado con el formato exacto requerido
    return res.status(200).json({
      notaId: nota.id,
      resumen: resultadoIA.respuesta
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
