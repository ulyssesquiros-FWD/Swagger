// Cargar variables de entorno antes de cualquier otro módulo
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

const server = app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`📚 Documentación Swagger en: http://localhost:${PORT}/api-docs`);
  console.log(`🤖 Modelo Claude configurado: ${CLAUDE_MODEL}`);
  console.log(
    `🔑 API Key Anthropic: ${
      process.env.ANTHROPIC_API_KEY
        ? 'Configurada (Protegida)'
        : 'No configurada (Pendiente en .env)'
    }`
  );
  console.log('========================================================');
});

module.exports = server;
