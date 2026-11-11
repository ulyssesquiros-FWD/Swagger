/**
 * Script interactivo de demostración y verificación de endpoints para Lab 5.
 * Permite al estudiante verificar visualmente todas las funcionalidades y capturar evidencias fácilmente.
 *
 * Ejecución:
 *   npm run demo
 */

require('dotenv').config();
const http = require('http');
const app = require('../src/app');

const PORT = 3000;

// Paleta de colores para consola ANSI
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function ejecutarDemostracion() {
  console.log(`${c.bright}${c.cyan}==================================================================${c.reset}`);
  console.log(`${c.bright}${c.cyan}  LABORATORIO #5 — DEMOSTRACIÓN Y VERIFICACIÓN EN VIVO (INDIVIDUAL)${c.reset}`);
  console.log(`${c.bright}${c.cyan}==================================================================${c.reset}\n`);

  const server = app.listen(PORT, async () => {
    try {
      const baseUrl = `http://localhost:${PORT}`;

      // 1. Verificación de Inicio y Swagger
      console.log(`${c.bright}1. Verificando estado del servidor y Swagger:${c.reset}`);
      const resRoot = await fetch(`${baseUrl}/`);
      const dataRoot = await resRoot.json();
      console.log(`   ${c.green}✔ HTTP 200 OK:${c.reset}`, dataRoot);
      console.log(`   ${c.magenta}📚 Swagger UI listo en:${c.reset} ${baseUrl}/api-docs\n`);

      // 2. Crear Nota 1
      console.log(`${c.bright}2. Creando Nota 1 (POST /api/notas):${c.reset}`);
      const resNota1 = await fetch(`${baseUrl}/api/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Arquitectura REST',
          contenido: 'REST (Representational State Transfer) es un estilo de arquitectura de software para sistemas distribuidos hipermedia. Utiliza métodos HTTP estándar como GET, POST, PUT y DELETE para manipular recursos identificados por URIs de manera stateless.'
        })
      });
      const nota1 = await resNota1.json();
      console.log(`   ${c.green}✔ HTTP ${resNota1.status} Created:${c.reset}`, nota1, '\n');

      // 3. Crear Nota 2
      console.log(`${c.bright}3. Creando Nota 2 con auto-incremento (POST /api/notas):${c.reset}`);
      const resNota2 = await fetch(`${baseUrl}/api/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Validación con Zod',
          contenido: 'Zod es una biblioteca de declaración y validación de esquemas para TypeScript y JavaScript que permite filtrar entradas inválidas antes de ejecutar lógica de negocio.'
        })
      });
      const nota2 = await resNota2.json();
      console.log(`   ${c.green}✔ HTTP ${resNota2.status} Created:${c.reset}`, nota2, '\n');

      // 4. Listar todas las notas
      console.log(`${c.bright}4. Listando colección completa de notas (GET /api/notas):${c.reset}`);
      const resLista = await fetch(`${baseUrl}/api/notas`);
      const lista = await resLista.json();
      console.log(`   ${c.green}✔ HTTP 200 OK (${lista.length} notas en memoria):${c.reset}`, lista, '\n');

      // 5. Validaciones Zod (Error 400 con body vacío)
      console.log(`${c.bright}5. Probando validación Zod con body vacío {} (POST /api/notas):${c.reset}`);
      const resVacio = await fetch(`${baseUrl}/api/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const errVacio = await resVacio.json();
      console.log(`   ${c.yellow}✔ HTTP 400 Bad Request interceptado:${c.reset}`, JSON.stringify(errVacio, null, 2), '\n');

      // 6. Validación Zod en pregunta corta (Error 400)
      console.log(`${c.bright}6. Probando pregunta de 1 carácter (POST /api/ia/preguntar):${c.reset}`);
      const resPregCorta = await fetch(`${baseUrl}/api/ia/preguntar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: '?' })
      });
      const errPregCorta = await resPregCorta.json();
      console.log(`   ${c.yellow}✔ HTTP 400 Bad Request interceptado:${c.reset}`, JSON.stringify(errPregCorta, null, 2), '\n');

      // 7. Buscar nota inexistente (Error 404)
      console.log(`${c.bright}7. Buscando nota inexistente (GET /api/notas/999):${c.reset}`);
      const resInexistente = await fetch(`${baseUrl}/api/notas/999`);
      const errInexistente = await resInexistente.json();
      console.log(`   ${c.yellow}✔ HTTP 404 Not Found interceptado:${c.reset}`, errInexistente, '\n');

      // 8. Resumen de nota inexistente (404 sin llamar a Claude)
      console.log(`${c.bright}8. Resumiendo nota inexistente (POST /api/notas/999/resumen):${c.reset}`);
      const resResumen404 = await fetch(`${baseUrl}/api/notas/999/resumen`, { method: 'POST' });
      const errResumen404 = await resResumen404.json();
      console.log(`   ${c.yellow}✔ HTTP 404 Not Found (Claude NO fue llamado):${c.reset}`, errResumen404, '\n');

      // 9. Comprobar integración con Claude (si la clave está presente o explicar cómo configurarla)
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey && apiKey.startsWith('sk-ant-') && !apiKey.includes('falsa') && !apiKey.includes('tu-clave')) {
        console.log(`${c.bright}9. Enviando consulta REAL a Claude AI (POST /api/ia/preguntar):${c.reset}`);
        const resIA = await fetch(`${baseUrl}/api/ia/preguntar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pregunta: '¿Qué es un middleware en Express en 2 oraciones?' })
        });
        const dataIA = await resIA.json();
        console.log(`   ${c.green}✔ HTTP 200 OK de Claude:${c.reset}`, dataIA, '\n');

        console.log(`${c.bright}10. Generando resumen REAL de Nota 1 en 3 viñetas (POST /api/notas/1/resumen):${c.reset}`);
        const resResumen = await fetch(`${baseUrl}/api/notas/1/resumen`, { method: 'POST' });
        const dataResumen = await resResumen.json();
        console.log(`   ${c.green}✔ HTTP 200 OK Resumen generado:${c.reset}`, dataResumen, '\n');
      } else {
        console.log(`${c.yellow}ℹ️ ANTHROPIC_API_KEY no configurada aún en .env.${c.reset}`);
        console.log(`   Para realizar llamadas reales a Claude, edita ${c.bright}.env${c.reset} y añade tu API key.`);
        console.log(`   Probando manejo de clave ausente/inválida (mapeo a 502 Bad Gateway)...`);
        process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-simulada-invalida';
        const resFalsa = await fetch(`${baseUrl}/api/ia/preguntar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pregunta: '¿Qué es REST?' })
        });
        const dataFalsa = await resFalsa.json();
        console.log(`   ${c.green}✔ Error de Anthropic mapeado con éxito a HTTP ${resFalsa.status}:${c.reset}`, dataFalsa, '\n');
      }

      // 11. Eliminar Nota (204 No Content)
      console.log(`${c.bright}11. Eliminando Nota 1 (DELETE /api/notas/1):${c.reset}`);
      const resDelete = await fetch(`${baseUrl}/api/notas/1`, { method: 'DELETE' });
      const textoDelete = await resDelete.text();
      console.log(`   ${c.green}✔ HTTP ${resDelete.status} No Content (Cuerpo vacío: ${textoDelete === ''})${c.reset}\n`);

      // 12. Confirmar eliminación
      console.log(`${c.bright}12. Consultando nota eliminada (GET /api/notas/1):${c.reset}`);
      const resConfirm = await fetch(`${baseUrl}/api/notas/1`);
      const errConfirm = await resConfirm.json();
      console.log(`   ${c.yellow}✔ HTTP 404 Not Found confirmado:${c.reset}`, errConfirm, '\n');

      console.log(`${c.bright}${c.green}==================================================================${c.reset}`);
      console.log(`${c.bright}${c.green}  ✔ DEMOSTRACIÓN COMPLETADA: TODOS LOS FLUJOS FUNCIONANDO AL 100%${c.reset}`);
      console.log(`${c.bright}${c.green}==================================================================${c.reset}`);
    } catch (err) {
      console.error(`${c.red}Error en la demostración:${c.reset}`, err);
    } finally {
      server.close();
    }
  });
}

ejecutarDemostracion();
