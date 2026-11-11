/**
 * Script de prueba directa con DeepSeek API utilizando las credenciales configuradas en .env.
 * Muestra el resultado de la llamada y el desglose de tokens consumidos.
 *
 * Ejecución:
 *   npm run probar:ia
 */

require('dotenv').config();
const deepseekService = require('../src/services/deepseek.service');

async function testDeepSeek() {
  console.log('====================================================');
  console.log('  PROBANDO CONEXIÓN DIRECTA CON DEEPSEEK API');
  console.log('====================================================');
  console.log('Modelo:', process.env.DEEPSEEK_MODEL || 'deepseek-flash');
  console.log('Base URL:', process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com');
  console.log('API Key:', process.env.DEEPSEEK_API_KEY ? 'Configurada (Oculta)' : 'NO configurada');

  try {
    console.log('\n1. Enviando pregunta técnica...');
    const res1 = await deepseekService.preguntar(
      '¿Qué es un middleware en Express en 2 oraciones?',
      'Eres un asistente útil y conciso. Responde en español.'
    );
    console.log('\n✔ Respuesta recibida:');
    console.log(res1.respuesta);
    console.log('\n📊 Métricas de tokens:');
    console.log(JSON.stringify(res1.uso, null, 2));

    console.log('\n2. Generando resumen en 3 viñetas...');
    const res2 = await deepseekService.preguntar(
      'REST (Representational State Transfer) es un estilo de arquitectura de software para sistemas distribuidos hipermedia. Utiliza métodos HTTP estándar como GET, POST, PUT y DELETE para manipular recursos identificados por URIs de manera stateless.',
      'Resume el texto en exactamente 3 viñetas breves y concretas, en español. No inventes información. Utiliza únicamente los datos proporcionados y evita explicaciones adicionales.',
      { max_tokens: 256 }
    );
    console.log('\n✔ Resumen recibido:');
    console.log(res2.respuesta);
    console.log('\n📊 Métricas de tokens:');
    console.log(JSON.stringify(res2.uso, null, 2));

    console.log('\n====================================================');
    console.log('✔ PRUEBA CON DEEPSEEK EXITOSA Y VERIFICADA');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Error al conectar con DeepSeek:', err.message || err);
  }
}

testDeepSeek();
