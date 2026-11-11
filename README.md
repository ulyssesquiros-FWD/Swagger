# Lab 5: API REST con Express 5, Swagger e Integración con DeepSeek AI

> **Modalidad de Desarrollo:** Individual  
> **Estudiante:** `[Nombre y Apellidos del Estudiante]`  
> **Curso / Asignatura:** Desarrollo Backend / Arquitectura Web  
> **Repositorio:** `lab5-api`  

---

## 1. Nombre del Proyecto
**`lab5-api` — Sistema Modular de Gestión de Notas e Inteligencia Artificial con DeepSeek AI**

---

## 2. Descripción
`lab5-api` es una API REST construida con **Express 5** sobre **Node.js** que combina la gestión en memoria de notas con las capacidades avanzadas del modelo **DeepSeek-V4.1-Flash** (identificador `deepseek-flash`) mediante la API oficial de **DeepSeek** utilizando el SDK compatible `openai`. El sistema implementa validación perimetral estricta con **Zod**, documentación interactiva con **Swagger / OpenAPI 3**, manejo centralizado y seguro de errores, control de tasa de peticiones (**Rate Limiting**) y una suite de pruebas automatizadas con **Supertest** y el ejecutor nativo de Node.js.

Todo el proyecto fue planificado, desarrollado, documentado y probado como una solución integral por un único estudiante.

---

## 3. Objetivos
1. Construir una API REST completa y modular utilizando **Express 5** y **CommonJS**.
2. Implementar un CRUD en memoria para la administración de notas con generación automática de identificadores.
3. Integrar **DeepSeek AI** (modelo `deepseek-flash`) utilizando el SDK `openai` con endpoint base `https://api.deepseek.com` para responder consultas técnicas y resumir notas existentes.
4. Optimizar el consumo de tokens y costos configurando el modo de razonamiento `thinking` desactivado (`{ type: "disabled" }`) y un límite de salida por defecto de `max_tokens: 256`.
5. Validar el cuerpo de todas las solicitudes entrantes utilizando **Zod**, descartando de inmediato entradas inválidas antes de procesar lógica de negocio o llamar a la IA.
6. Diseñar un middleware centralizado de manejo de errores capaz de interceptar excepciones del SDK de DeepSeek/OpenAI, errores operacionales y excepciones internas, garantizando la estabilidad del servidor y la privacidad de las credenciales.
7. Proteger credenciales mediante variables de entorno (`dotenv`), evitando la exposición de claves privadas tanto en código como en respuestas al cliente.
8. Documentar todos los endpoints, esquemas y códigos de respuesta mediante **OpenAPI 3 / Swagger**.
9. Implementar retos adicionales: protección contra abusos mediante **Rate Limiting** y suite de **21 pruebas automatizadas con mocks**.

---

## 4. Modalidad Individual
Este proyecto ha sido desarrollado bajo modalidad estrictamente **individual**. No contiene partes delegadas, coevaluaciones ni división de tareas entre compañeros. Cada capa del sistema (rutas, controladores, servicios, middlewares, documentación y pruebas) fue concebida e integrada como parte de una arquitectura unificada y coherente.

---

## 5. Datos del Estudiante
- **Nombre del Estudiante:** `[Nombre y Apellidos del Estudiante]`
- **Código / Matrícula:** `[Código o Matrícula]`
- **Institución:** `[Universidad / Institución Educativa]`
- **Fecha de Entrega:** Noviembre 2026

---

## 6. Tecnologías Utilizadas
- **Node.js:** Versión 20 o superior (verificado en Node v22).
- **Express.js:** Versión 5 (`express@^5.3.0`).
- **JavaScript & CommonJS:** Módulos organizados con `require` y `module.exports`.
- **SDK DeepSeek / OpenAI:** `openai` compatible con la API de DeepSeek (`https://api.deepseek.com`).
- **Zod:** Validación declarativa de esquemas y tipos de datos.
- **dotenv:** Carga y gestión segura de variables de entorno.
- **swagger-jsdoc & swagger-ui-express:** Generación de especificación OpenAPI 3 y UI interactiva.
- **express-rate-limit:** Protección contra abusos y ataques DoS en endpoints de IA.
- **Nodemon:** Servidor de desarrollo con recarga automática.
- **Supertest & Node.js Test Runner:** Suite de 21 pruebas automatizadas (`node --test`).
- **Git & GitHub:** Control de versiones con ramas `main` y `feature/lab5`.

---

## 7. Estructura del Proyecto
```text
lab5-api/
│
├── src/
│   ├── config/
│   │   └── swagger.js          # Configuración de OpenAPI 3 y Swagger UI (DeepSeek)
│   │
│   ├── routes/
│   │   ├── notas.routes.js     # Endpoints CRUD de notas y generación de resumen
│   │   └── ia.routes.js        # Endpoint de preguntas dirigidas a DeepSeek AI
│   │
│   ├── services/
│   │   ├── notas.service.js    # Lógica de almacenamiento y operaciones en memoria
│   │   └── deepseek.service.js # Cliente reutilizable y llamadas a DeepSeek API
│   │
│   ├── middlewares/
│   │   ├── validar.js          # Middleware de validación con esquemas Zod
│   │   ├── rateLimiter.js      # Control de tasa de peticiones para endpoints de IA
│   │   └── errorHandler.js    # Manejador centralizado de errores y mapeo DeepSeek
│   │
│   ├── utils/
│   │   └── errors.js           # Clase AppError para errores operacionales HTTP
│   │
│   ├── app.js                  # Configuración de la aplicación Express y middlewares
│   └── index.js                # Punto de entrada y arranque del servidor HTTP
│
├── scripts/
│   └── demo.js                 # Script interactivo de verificación (npm run demo)
│
├── tests/
│   └── api.test.js             # Suite de 21 pruebas automatizadas con Supertest y mocks
│
├── docs/
│   ├── evidencias/
│   │   └── README.md           # Guía y plantilla de capturas de pantalla para la entrega
│   └── reflexiones.md          # Respuestas detalladas a las 7 preguntas técnicas
│
├── .env                        # Variables de entorno locales (ignorado por Git)
├── .env.example                # Plantilla de variables de entorno para despliegue
├── .gitignore                  # Exclusión de archivos sensibles y node_modules
├── package.json                # Metadatos, scripts y dependencias del proyecto
└── README.md                   # Documentación principal del sistema
```

---

## 8. Arquitectura del Sistema
El proyecto sigue una arquitectura modular desacoplada por capas:

```
[ Cliente HTTP: Swagger UI / Postman / Tests ]
                      │
                      ▼
            [ Capa de Entrada / Express App ]
                      │
      ┌───────────────┴───────────────┐
      ▼                               ▼
[ Middlewares: JSON ]        [ Documentación Swagger /api-docs ]
      │
      ▼
[ Capa de Rutas (/api/notas, /api/ia) ]
      │
      ├──> [ Middleware Rate Limiting ] (IA)
      │
      └──> [ Middleware de Validación Zod ] (safeParse)
                │ (Si es válido)
                ▼
      [ Capa de Servicios ]
         ├── notas.service.js    ──> [ Memoria RAM (Array) ]
         └── deepseek.service.js ──> [ DeepSeek API / https://api.deepseek.com ]
                │ (En caso de error)
                ▼
      [ Middleware Centralizado errorHandler ]
         ├── Mapeo seguro de OpenAI/DeepSeek APIError:
         │     ├── 401, 403, 400 ──> 502 Bad Gateway
         │     ├── 429           ──> 429 Too Many Requests
         │     └── 500, 502..504 ──> 503 Service Unavailable
         ├── Respuesta genérica: { error: "IA_NO_DISPONIBLE", mensaje: "..." }
         ├── AppError (400, 404)
         └── Ocultación estricta de detalles sensibles
```

---

## 9. Requisitos Previos
- **Node.js** v20.0.0 o superior instalado en el equipo.
- **npm** v10.0.0 o superior.
- Una cuenta activa en **DeepSeek Platform** con créditos disponibles (opcional para pruebas automatizadas gracias a los mocks).

---

## 10. Instalación
1. Clonar el repositorio o ingresar al directorio del proyecto:
   ```bash
   cd lab5-api
   ```
2. Instalar las dependencias de producción y desarrollo:
   ```bash
   npm install
   ```

---

## 11. Variables de Entorno
Crea un archivo `.env` en la raíz de `lab5-api` copiando la plantilla proporcionada:

```bash
cp .env.example .env
```

Contenido del archivo `.env`:
```ini
DEEPSEEK_API_KEY=sk-tu-clave-privada-aqui
DEEPSEEK_MODEL=deepseek-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=3000
```

> **Regla de Seguridad Fundamental:** El archivo `.env` está expresamente incluido en `.gitignore`. Nunca debe ser versionado en Git ni compartido con terceros.

---

## 12. Obtención de la API Key de DeepSeek
1. Ingresa a la consola de desarrollador: [https://platform.deepseek.com/](https://platform.deepseek.com/).
2. Inicia sesión o regístrate en la plataforma.
3. Ve a la sección **API Keys** y presiona **Create new secret key**.
4. Asigna un nombre descriptivo y copia el token generado (inicia con `sk-`).
5. Pégalo en tu archivo local `.env` en la variable `DEEPSEEK_API_KEY`.
6. Documentación técnica oficial: [https://api-docs.deepseek.com/](https://api-docs.deepseek.com/).

---

## 13. Optimización del Modelo DeepSeek y Reducción de Costos
Para maximizar el rendimiento y minimizar el costo operativo, se aplicaron las siguientes directivas:

1. **Modelo Económico `deepseek-flash`:** Corresponde a **DeepSeek-V4.1-Flash**, la alternativa más económica entre los modelos principales de DeepSeek.
2. **Modo Thinking Desactivado:** DeepSeek tiene el modo de razonamiento (`thinking`) activado por defecto en algunos entornos. Se desactiva explícitamente en la petición:
   ```javascript
   thinking: {
     type: 'disabled'
   }
   ```
   Esto evita que el modelo genere y facture miles de tokens de razonamiento interno innecesarios para respuestas directas o resúmenes.
3. **Límite de Salida (`max_tokens: 256`):** Impone un tope rígido a la cantidad de tokens generados en la respuesta.
4. **Prompts Concisos:** Instrucciones de sistema estrictas que exigen respuestas directas y resúmenes de exactamente tres viñetas breves.

---

## 14. Ejecución del Servidor
### Modo Desarrollo (con recarga automática mediante Nodemon):
```bash
npm run dev
```

### Modo Producción:
```bash
npm start
```

### Script de Demostración y Verificación Rápida:
```bash
npm run demo
```

Salida esperada en consola:
```text
========================================================
🚀 Servidor ejecutándose en: http://localhost:3000
📚 Documentación Swagger en: http://localhost:3000/api-docs
🤖 Modelo DeepSeek configurado: deepseek-flash
🔑 API Key DeepSeek: Configurada (Protegida)
========================================================
```

---

## 15. Acceso a Swagger UI
Una vez iniciado el servidor, abre tu navegador e ingresa a:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Para obtener la especificación OpenAPI en formato JSON:
👉 **[http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)**

---

## 16. Descripción de los Endpoints

| Método | Endpoint | Tag | Descripción | Códigos HTTP |
|---|---|---|---|---|
| `GET` | `/api/notas` | Notas | Lista todas las notas almacenadas en memoria | `200` |
| `GET` | `/api/notas/:id` | Notas | Busca una nota por su identificador | `200`, `404` |
| `POST` | `/api/notas` | Notas | Crea una nueva nota validada con Zod | `201`, `400` |
| `DELETE` | `/api/notas/:id` | Notas | Elimina una nota (sin cuerpo de respuesta) | `204`, `404` |
| `POST` | `/api/ia/preguntar` | IA | Envía una consulta técnica a DeepSeek AI | `200`, `400`, `429`, `502`, `503` |
| `POST` | `/api/notas/:id/resumen` | Notas / IA | Genera un resumen en 3 viñetas con DeepSeek | `200`, `404`, `429`, `502`, `503` |

---

## 17. Ejemplos de Peticiones y Respuestas

### 1. Crear una nota (`POST /api/notas`)
**Petición:**
```http
POST /api/notas HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "titulo": "Arquitectura REST",
  "contenido": "REST es un estilo de arquitectura de software para sistemas hipermedia distribuidos fundamentado en recursos identificados por URIs y métodos HTTP estándar."
}
```
**Respuesta exitosa (`201 Created`):**
```json
{
  "id": 1,
  "titulo": "Arquitectura REST",
  "contenido": "REST es un estilo de arquitectura de software para sistemas hipermedia distribuidos fundamentado en recursos identificados por URIs y métodos HTTP estándar."
}
```

### 2. Preguntar a DeepSeek AI (`POST /api/ia/preguntar`)
**Petición:**
```http
POST /api/ia/preguntar HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "pregunta": "¿Qué es REST?"
}
```
**Respuesta exitosa (`200 OK`):**
```json
{
  "respuesta": "REST (Representational State Transfer) es un estilo de arquitectura para sistemas hipermedia distribuidos que utiliza métodos HTTP estándar para manipular recursos identificados por URIs de manera stateless.",
  "uso": {
    "input_tokens": 35,
    "output_tokens": 58,
    "total_tokens": 93
  }
}
```

### 3. Resumir una nota con DeepSeek (`POST /api/notas/1/resumen`)
**Respuesta exitosa (`200 OK`):**
```json
{
  "notaId": 1,
  "resumen": "- Estilo de arquitectura para sistemas distribuidos hipermedia.\n- Fundamentado en recursos identificables mediante URIs únicas.\n- Utiliza métodos HTTP estándar para manipular información sin estado."
}
```

---

## 18. Códigos de Estado HTTP Utilizados

- **`200 OK`:** Solicitud procesada exitosamente con datos en la respuesta.
- **`201 Created`:** Recurso creado exitosamente (nueva nota).
- **`204 No Content`:** Eliminación exitosa sin cuerpo en la respuesta.
- **`400 Bad Request`:** Error de validación Zod en el cuerpo de la petición.
- **`404 Not Found`:** Nota solicitada inexistente.
- **`429 Too Many Requests`:** Límite de peticiones de IA excedido (Rate Limiter de la API o del proveedor).
- **`502 Bad Gateway`:** Error de autenticación (401), acceso denegado (403), parámetros inválidos (400) o fallo en la comunicación con el servicio externo de DeepSeek.
- **`503 Service Unavailable`:** Servicio de DeepSeek sobrecargado (500, 502, 503, 504) o error de conexión/timeout.
- **`500 Internal Server Error`:** Error interno inesperado en el servidor.

---

## 19. Manejo Centralizado de Errores
El middleware `src/middlewares/errorHandler.js` intercepta cualquier fallo ocurrido durante el ciclo de vida de la petición:

1. **Errores de DeepSeek / OpenAI SDK:**  
   Se detectan mediante `instanceof OpenAI.APIError`. Mapeo:
   - 401, 403, 400 y otros del proveedor → **`HTTP 502 Bad Gateway`**
   - 429 del proveedor → **`HTTP 429 Too Many Requests`**
   - 500, 502, 503, 504 o fallos de conexión/timeout → **`HTTP 503 Service Unavailable`**
   - Respuesta segura hacia el cliente:
     ```json
     {
       "error": "IA_NO_DISPONIBLE",
       "mensaje": "El servicio de inteligencia artificial no está disponible actualmente."
     }
     ```
   - Registro técnico seguro en consola sin exponer claves ni encabezados `Authorization`.
2. **Errores Operacionales (`AppError`):** Controlan códigos HTTP como el 404 de notas inexistentes.
3. **JSON Malformado:** Captura excepciones de sintaxis devolviendo HTTP 400.

---

## 20. Seguridad y Buenas Prácticas
- **Aislamiento de Credenciales:** La API key sólo existe en `.env` y es leída vía `process.env.DEEPSEEK_API_KEY`.
- **Sin Fugas de Información:** Las respuestas de error hacia el cliente ocultan detalles internos del proveedor de IA.
- **Arranque Seguro:** El servidor inicia correctamente aun cuando la clave no esté configurada; la ausencia se detecta únicamente al invocar funciones de IA.
- **Validación Perimetral con Zod:** Las peticiones maliciosas o vacías se detienen antes de consumir créditos o memoria.
- **Control de Versiones Seguro:** `.gitignore` excluye `.env` y `node_modules/`.

---

## 21. Pruebas Automatizadas (Reto Adicional)
El proyecto incluye una suite automatizada exhaustiva implementada con **Supertest** y el ejecutor nativo de Node.js (`node --test`), utilizando mocks para el servicio de DeepSeek para evitar consumo de créditos.

Para ejecutar todas las pruebas:
```bash
npm test
```

### Cobertura de las 21 pruebas:
1. **CRUD de notas en memoria:** Creación, auto-incremento de ID, listado, búsqueda por ID, eliminación con 204 y validación de 404.
2. **Validaciones Zod (400):** Cuerpos vacíos `{}`, títulos vacíos, títulos mayores a 100 caracteres, contenidos mayores a 5000 caracteres.
3. **Endpoint de Preguntas a DeepSeek:** Petición válida, rechazo de preguntas de 1 carácter, comprobación de que DeepSeek **NO** es invocado ante fallos de validación.
4. **Endpoint de Resúmenes:** Resumen de nota existente en exactamente 3 viñetas con `max_tokens: 256`, rechazo 404 ante nota inexistente y comprobación de que DeepSeek **NO** es invocado si la nota no existe.
5. **Mapeo de Errores de DeepSeek:** Simulación de 401 mapeado a 502, y simulación de 503 mapeado a 503.
6. **Especificación OpenAPI / Swagger:** Verificación de la exposición del esquema JSON con títulos y rutas completas.
7. **Rate Limiting:** Comprobación de cabeceras estándar de tasa y persistencia del CRUD de notas.

---

## 22. Reto Adicional: Rate Limiting
Se incorporó `express-rate-limit` en `src/middlewares/rateLimiter.js` para proteger exclusivamente los endpoints de IA (`/api/ia/preguntar` y `/api/notas/:id/resumen`), configurando una cuota de 10 peticiones por minuto. Cuando un usuario supera el límite:
- Devuelve **HTTP 429 Too Many Requests**.
- Muestra un mensaje amigable: `"Has superado el límite de peticiones de IA. Por favor, espera antes de realizar otra consulta."`.
- Detiene la ejecución evitando llamadas innecesarias a DeepSeek.
- El CRUD de notas permanece 100% disponible.

---

## 23. Evidencias para la Entrega
Consulta el documento [`docs/evidencias/README.md`](./docs/evidencias/README.md) para revisar el listado completo y la plantilla de las 15 capturas de pantalla requeridas para la sustentación académica.

---

## 24. Preguntas de Reflexión
Las respuestas técnicas completas a las siete preguntas de reflexión adaptadas a DeepSeek se encuentran detalladas en [`docs/reflexiones.md`](./docs/reflexiones.md).
