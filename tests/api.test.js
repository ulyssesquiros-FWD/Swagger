const { describe, it, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const notasService = require('../src/services/notas.service');
const deepseekService = require('../src/services/deepseek.service');

// Guardar referencia original del método preguntar para restaurarla al finalizar
const originalPreguntar = deepseekService.preguntar;

describe('Suite de Pruebas Automatizadas - Lab 5 (API REST + DeepSeek AI)', () => {
  let llamadasDeepSeek = [];

  beforeEach(() => {
    // Reiniciar almacenamiento de notas para garantizar aislamiento de pruebas
    notasService.reiniciar();

    // Reiniciar registro de llamadas a DeepSeek
    llamadasDeepSeek = [];

    // Mock por defecto de DeepSeek Service para evitar consumo de créditos reales
    deepseekService.preguntar = async (texto, system, opciones) => {
      llamadasDeepSeek.push({ texto, system, opciones });
      return {
        respuesta:
          '- Primera idea sintetizada.\n- Segunda idea sintetizada.\n- Tercera idea sintetizada.',
        uso: {
          input_tokens: 35,
          output_tokens: 90,
          total_tokens: 125
        }
      };
    };
  });

  after(() => {
    // Restaurar implementación original
    deepseekService.preguntar = originalPreguntar;
  });

  describe('1. CRUD de Notas en memoria', () => {
    it('Debe crear una nota satisfactoriamente (HTTP 201)', async () => {
      const res = await request(app)
        .post('/api/notas')
        .send({
          titulo: 'Introducción a REST',
          contenido: 'REST es un estilo de arquitectura de software para sistemas hipermedia.'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.id, 1);
      assert.equal(res.body.titulo, 'Introducción a REST');
      assert.ok(res.body.contenido.includes('hipermedia'));
    });

    it('Debe crear una segunda nota incrementando el ID automáticamente (HTTP 201)', async () => {
      await request(app)
        .post('/api/notas')
        .send({ titulo: 'Nota 1', contenido: 'Contenido 1' });

      const res2 = await request(app)
        .post('/api/notas')
        .send({ titulo: 'Nota 2', contenido: 'Contenido 2' });

      assert.equal(res2.status, 201);
      assert.equal(res2.body.id, 2);
    });

    it('Debe listar todas las notas existentes (HTTP 200)', async () => {
      await request(app)
        .post('/api/notas')
        .send({ titulo: 'Nota A', contenido: 'Texto A' });
      await request(app)
        .post('/api/notas')
        .send({ titulo: 'Nota B', contenido: 'Texto B' });

      const res = await request(app).get('/api/notas');

      assert.equal(res.status, 200);
      assert.equal(Array.isArray(res.body), true);
      assert.equal(res.body.length, 2);
    });

    it('Debe obtener una nota específica por ID (HTTP 200)', async () => {
      const creada = await request(app)
        .post('/api/notas')
        .send({ titulo: 'Nota Específica', contenido: 'Texto Detallado' });

      const res = await request(app).get(`/api/notas/${creada.body.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.id, creada.body.id);
      assert.equal(res.body.titulo, 'Nota Específica');
    });

    it('Debe responder 404 al buscar una nota que no existe', async () => {
      const res = await request(app).get('/api/notas/999');

      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });

    it('Debe eliminar una nota existente sin contenido en el body (HTTP 204)', async () => {
      const creada = await request(app)
        .post('/api/notas')
        .send({ titulo: 'Nota a borrar', contenido: 'Texto efímero' });

      const resDelete = await request(app).delete(`/api/notas/${creada.body.id}`);

      assert.equal(resDelete.status, 204);
      assert.deepEqual(resDelete.body, {});

      // Confirmar que ya no existe (404)
      const resBusqueda = await request(app).get(`/api/notas/${creada.body.id}`);
      assert.equal(resBusqueda.status, 404);
    });

    it('Debe responder 404 al intentar eliminar una nota inexistente', async () => {
      const res = await request(app).delete('/api/notas/888');

      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });
  });

  describe('2. Validaciones con Zod (HTTP 400)', () => {
    it('Debe rechazar la creación con cuerpo vacío {} (HTTP 400)', async () => {
      const res = await request(app).post('/api/notas').send({});

      assert.equal(res.status, 400);
      assert.ok(Array.isArray(res.body.errores));
      assert.ok(res.body.errores.some((e) => e.path.includes('titulo')));
      assert.ok(res.body.errores.some((e) => e.path.includes('contenido')));
    });

    it('Debe rechazar un título vacío (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/notas')
        .send({ titulo: '', contenido: 'Contenido válido' });

      assert.equal(res.status, 400);
      assert.ok(res.body.errores.some((e) => e.path.includes('titulo')));
    });

    it('Debe rechazar un título que exceda 100 caracteres (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/notas')
        .send({
          titulo: 'A'.repeat(101),
          contenido: 'Contenido válido'
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.errores.some((e) => e.path.includes('titulo')));
    });

    it('Debe rechazar un contenido que exceda 5000 caracteres (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/notas')
        .send({
          titulo: 'Título válido',
          contenido: 'B'.repeat(5001)
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.errores.some((e) => e.path.includes('contenido')));
    });
  });

  describe('3. Endpoint POST /api/ia/preguntar', () => {
    it('Debe procesar una pregunta válida y devolver la respuesta con uso de tokens (HTTP 200)', async () => {
      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: '¿Qué es Express.js?' });

      assert.equal(res.status, 200);
      assert.ok(res.body.respuesta);
      assert.equal(typeof res.body.uso.input_tokens, 'number');
      assert.equal(typeof res.body.uso.output_tokens, 'number');
      assert.equal(typeof res.body.uso.total_tokens, 'number');
      assert.equal(llamadasDeepSeek.length, 1);
      assert.equal(llamadasDeepSeek[0].texto, '¿Qué es Express.js?');
    });

    it('Debe rechazar una pregunta de 1 solo carácter (HTTP 400) y NO llamar a DeepSeek', async () => {
      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: 'a' });

      assert.equal(res.status, 400);
      assert.ok(Array.isArray(res.body.errores));
      assert.ok(res.body.errores.some((e) => e.path.includes('pregunta')));
      // Verificación crítica: DeepSeek no fue invocado
      assert.equal(llamadasDeepSeek.length, 0);
    });

    it('Debe rechazar una petición sin campo "pregunta" y NO llamar a DeepSeek', async () => {
      const res = await request(app).post('/api/ia/preguntar').send({});

      assert.equal(res.status, 400);
      assert.equal(llamadasDeepSeek.length, 0);
    });
  });

  describe('4. Endpoint POST /api/notas/:id/resumen', () => {
    it('Debe generar un resumen en 3 viñetas para una nota existente (HTTP 200)', async () => {
      const notaCreada = await request(app)
        .post('/api/notas')
        .send({
          titulo: 'Arquitectura MVC',
          contenido:
            'MVC separa una aplicación en tres componentes: Modelo, Vista y Controlador.'
        });

      const res = await request(app).post(`/api/notas/${notaCreada.body.id}/resumen`);

      assert.equal(res.status, 200);
      assert.equal(res.body.notaId, notaCreada.body.id);
      assert.ok(res.body.resumen);
      assert.equal(llamadasDeepSeek.length, 1);
      assert.equal(llamadasDeepSeek[0].texto, notaCreada.body.contenido);
      assert.ok(llamadasDeepSeek[0].system.includes('3 viñetas'));
      assert.equal(llamadasDeepSeek[0].opciones?.max_tokens, 256);
    });

    it('Debe responder 404 al intentar resumir una nota inexistente y NO llamar a DeepSeek', async () => {
      const res = await request(app).post('/api/notas/9999/resumen');

      assert.equal(res.status, 404);
      assert.ok(res.body.error);
      // Verificación crítica: DeepSeek NO fue invocado si la nota no existe
      assert.equal(llamadasDeepSeek.length, 0);
    });
  });

  describe('5. Manejo de Errores de DeepSeek API (OpenAI SDK)', () => {
    it('Debe mapear un error 401 de DeepSeek (clave inválida o ausente) a HTTP 502 genérico', async () => {
      // Simular fallo de autenticación de DeepSeek
      deepseekService.preguntar = async () => {
        const err = new Error('Incorrect API key provided');
        err.status = 401;
        err.name = 'AuthenticationError';
        throw err;
      };

      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: '¿Hola DeepSeek?' });

      assert.equal(res.status, 502);
      assert.deepEqual(res.body, {
        error: 'IA_NO_DISPONIBLE',
        mensaje: 'El servicio de inteligencia artificial no está disponible actualmente.'
      });
    });

    it('Debe mapear un error 503 de DeepSeek (servicio sobrecargado/indisponible) a HTTP 503', async () => {
      deepseekService.preguntar = async () => {
        const err = new Error('DeepSeek Service Unavailable');
        err.status = 503;
        err.name = 'InternalServerError';
        throw err;
      };

      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: 'Consulta con sobrecarga' });

      assert.equal(res.status, 503);
      assert.deepEqual(res.body, {
        error: 'IA_NO_DISPONIBLE',
        mensaje: 'El servicio de inteligencia artificial no está disponible actualmente.'
      });
    });
  });

  describe('6. Documentación OpenAPI / Swagger', () => {
    it('Debe exponer la especificación Swagger JSON en /api-docs.json con título y rutas de DeepSeek', async () => {
      const res = await request(app).get('/api-docs.json');

      assert.equal(res.status, 200);
      assert.equal(
        res.body.info.title,
        'Laboratorio 5: API REST con Express, Swagger y DeepSeek AI'
      );
      assert.equal(res.body.info.version, '1.0.0');
      assert.ok(res.body.paths['/api/notas']);
      assert.ok(res.body.paths['/api/ia/preguntar']);
      assert.ok(res.body.paths['/api/notas/{id}/resumen']);
      assert.ok(res.body.paths['/api-docs']);
    });
  });

  describe('7. Reto Adicional: Rate Limiting en Endpoints de IA', () => {
    it('Debe incluir cabeceras estándar de RateLimit en solicitudes a endpoints de IA', async () => {
      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: '¿Cómo funciona el rate limiting?' });

      assert.equal(res.status, 200);
      assert.ok(
        res.headers['ratelimit-limit'] !== undefined ||
        res.headers['ratelimit-remaining'] !== undefined
      );
    });

    it('Debe mantener el CRUD de notas accesible independientemente de los endpoints de IA', async () => {
      const resNotas = await request(app).get('/api/notas');
      assert.equal(resNotas.status, 200);
    });
  });
});
