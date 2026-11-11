// Cargar variables de entorno antes de cualquier otro módulo
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-flash';

const server = app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`📚 Documentación Swagger en: http://localhost:${PORT}/api-docs`);
  console.log(`🤖 Modelo DeepSeek configurado: ${DEEPSEEK_MODEL}`);
  console.log(
    `🔑 API Key DeepSeek: ${
      process.env.DEEPSEEK_API_KEY
        ? 'Configurada (Protegida)'
        : 'No configurada (Pendiente en .env)'
    }`
  );
  console.log('========================================================');
});

module.exports = server;
