const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Lab 5: Notas + IA',
    version: '1.0.0',
    description:
      'API REST modular con Express 5 para la gestión de notas e integración directa con inteligencia artificial utilizando el SDK oficial de Anthropic (Claude API). Proyecto desarrollado en modalidad individual.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo local'
    }
  ],
  tags: [
    {
      name: 'Notas',
      description: 'Operaciones CRUD y análisis de notas en memoria'
    },
    {
      name: 'IA',
      description: 'Interacciones con Claude AI vía Anthropic SDK'
    },
    {
      name: 'Documentación',
      description: 'Recursos interactivos y especificaciones de la API'
    }
  ],
  components: {
    schemas: {
      Nota: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
            description: 'Identificador único de la nota'
          },
          titulo: {
            type: 'string',
            example: 'Introducción a REST',
            description: 'Título descriptivo de la nota'
          },
          contenido: {
            type: 'string',
            example: 'REST es un estilo de arquitectura...',
            description: 'Contenido textual de la nota'
          }
        },
        required: ['id', 'titulo', 'contenido']
      },
      CrearNota: {
        type: 'object',
        properties: {
          titulo: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            example: 'Aprendiendo Express',
            description: 'Título obligatorio (1 a 100 caracteres)'
          },
          contenido: {
            type: 'string',
            minLength: 1,
            maxLength: 5000,
            example: 'Express permite crear APIs REST con Node.js.',
            description: 'Contenido obligatorio (1 a 5000 caracteres)'
          }
        },
        required: ['titulo', 'contenido']
      },
      Pregunta: {
        type: 'object',
        properties: {
          pregunta: {
            type: 'string',
            minLength: 3,
            maxLength: 2000,
            example: '¿Qué es REST?',
            description: 'Texto de la consulta dirigida a Claude (3 a 2000 caracteres)'
          }
        },
        required: ['pregunta']
      },
      RespuestaIA: {
        type: 'object',
        properties: {
          respuesta: {
            type: 'string',
            example: 'REST es un estilo de arquitectura...',
            description: 'Texto de respuesta generado por Claude'
          },
          uso: {
            type: 'object',
            properties: {
              input_tokens: {
                type: 'integer',
                example: 18,
                description: 'Tokens consumidos por el prompt'
              },
              output_tokens: {
                type: 'integer',
                example: 142,
                description: 'Tokens generados en la respuesta'
              }
            }
          }
        }
      },
      ResumenNota: {
        type: 'object',
        properties: {
          notaId: {
            type: 'integer',
            example: 1,
            description: 'Identificador de la nota analizada'
          },
          resumen: {
            type: 'string',
            example: '- Primera idea importante.\n- Segunda idea importante.\n- Tercera idea importante.',
            description: 'Resumen estructurado en 3 viñetas concretas'
          }
        }
      },
      ErrorValidacion: {
        type: 'object',
        properties: {
          errores: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['titulo']
                },
                message: {
                  type: 'string',
                  example: 'El título es obligatorio'
                }
              }
            }
          }
        }
      },
      ErrorIA: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'IA_NO_DISPONIBLE',
            description: 'Mensaje genérico seguro que no expone detalles de proveedor'
          }
        }
      },
      ErrorRespuesta: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Nota con ID 999 no encontrada'
          }
        }
      }
    }
  }
};

// Normalizar rutas a forward slashes para compatibilidad con el motor glob en Windows
const routesGlob = path.resolve(__dirname, '../routes/*.js').replace(/\\/g, '/');
const appFile = path.resolve(__dirname, '../app.js').replace(/\\/g, '/');

const options = {
  swaggerDefinition,
  apis: [routesGlob, appFile]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec
};
