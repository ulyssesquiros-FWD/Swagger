const { describe, it, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const notasService = require('../src/services/notas.service');
const claudeService = require('../src/services/claude.service');

// Guardar referencia original del método preguntar para restaurarla al finalizar
const originalPreguntar = claudeService.preguntar;

describe('Suite de Pruebas Automatizadas - Lab 5 (API REST + IA)', () => {
  let llamadasClaude = [];

  beforeEach(() => {
    // Reiniciar almacenamiento de notas para garantizar aislamiento de pruebas
    notasService.reiniciar();

    // Reiniciar registro de llamadas a Claude
    llamadasClaude = [];

    // Mock por defecto de Claude Service para evitar consumo de créditos reales
    claudeService.preguntar = async (texto, system) => {
      llamadasClaude.push({ texto, system });
      return {
        respuesta:
          '- Primera idea sintetizada.\n- Segunda idea sintetizada.\n- Tercera idea sintetizada.',
        uso: {
          input_tokens: 22,
          output_tokens: 65
        }
      };
    };
  });

  after(() => {
    // Restaurar implementación original
    claudeService.preguntar = originalPreguntar;
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
      assert.equal(llamadasClaude.length, 1);
      assert.equal(llamadasClaude[0].texto, '¿Qué es Express.js?');
    });

    it('Debe rechazar una pregunta de 1 solo carácter (HTTP 400) y NO llamar a Claude', async () => {
      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: 'a' });

      assert.equal(res.status, 400);
      assert.ok(Array.isArray(res.body.errores));
      assert.ok(res.body.errores.some((e) => e.path.includes('pregunta')));
      // Verificación crítica: Claude no fue invocado
      assert.equal(llamadasClaude.length, 0);
    });

    it('Debe rechazar una petición sin campo "pregunta" y NO llamar a Claude', async () => {
      const res = await request(app).post('/api/ia/preguntar').send({});

      assert.equal(res.status, 400);
      assert.equal(llamadasClaude.length, 0);
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
      assert.equal(llamadasClaude.length, 1);
      assert.equal(llamadasClaude[0].texto, notaCreada.body.contenido);
      assert.ok(llamadasClaude[0].system.includes('3 viñetas'));
    });

    it('Debe responder 404 al intentar resumir una nota inexistente y NO llamar a Claude', async () => {
      const res = await request(app).post('/api/notas/9999/resumen');

      assert.equal(res.status, 404);
      assert.ok(res.body.error);
      // Verificación crítica: Claude NO fue invocado si la nota no existe
      assert.equal(llamadasClaude.length, 0);
    });
  });

  describe('5. Manejo de Errores del SDK de Anthropic', () => {
    it('Debe mapear un error 401 de Anthropic (clave inválida o ausente) a HTTP 502 genérico', async () => {
      // Simular fallo de autenticación de Anthropic
      claudeService.preguntar = async () => {
        const err = new Error('Invalid API Key');
        err.status = 401;
        err.name = 'AuthenticationError';
        throw err;
      };

      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: '¿Hola mundo?' });

      assert.equal(res.status, 502);
      assert.deepEqual(res.body, { error: 'IA_NO_DISPONIBLE' });
    });

    it('Debe mapear un error 529 de Anthropic (servicio sobrecargado) a HTTP 503', async () => {
      claudeService.preguntar = async () => {
        const err = new Error('Anthropic Overloaded');
        err.status = 529;
        err.name = 'APIError';
        throw err;
      };

      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: 'Consulta con sobrecarga' });

      assert.equal(res.status, 503);
      assert.deepEqual(res.body, { error: 'IA_NO_DISPONIBLE' });
    });
  });

  describe('6. Documentación OpenAPI / Swagger', () => {
    it('Debe exponer la especificación Swagger JSON en /api-docs.json con título correcto', async () => {
      const res = await request(app).get('/api-docs.json');

      assert.equal(res.status, 200);
      assert.equal(res.body.info.title, 'Lab 5: Notas + IA');
      assert.equal(res.body.info.version, '1.0.0');
      assert.ok(res.body.paths['/api/notas']);
      assert.ok(res.body.paths['/api/ia/preguntar']);
      assert.ok(res.body.paths['/api/notas/{id}/resumen']);
    });
  });

  describe('7. Reto Adicional: Rate Limiting en Endpoints de IA', () => {
    it('Debe incluir cabeceras estándar de RateLimit en solicitudes a endpoints de IA', async () => {
      const res = await request(app)
        .post('/api/ia/preguntar')
        .send({ pregunta: '¿Cómo funciona el rate limiting?' });

      assert.equal(res.status, 200);
      // Las cabeceras standardHeaders devuelven ratelimit-limit y ratelimit-remaining
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
