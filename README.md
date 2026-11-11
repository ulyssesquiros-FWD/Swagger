# Lab 5: API REST con Express, Swagger e Integración con Claude API

> **Modalidad de Desarrollo:** Individual  
> **Estudiante:** `[Nombre y Apellidos del Estudiante]`  
> **Curso / Asignatura:** Desarrollo Backend / Arquitectura Web  
> **Repositorio:** `lab5-api`  

---

## 1. Nombre del Proyecto
**`lab5-api` — Sistema Modular de Gestión de Notas e Inteligencia Artificial con Claude (Anthropic)**

---

## 2. Descripción
`lab5-api` es una API REST construida con **Express 5** sobre **Node.js** que combina la gestión en memoria de notas con las capacidades avanzadas de procesamiento de lenguaje natural de **Claude AI (Anthropic)**. El sistema implementa validación perimetral estricta con **Zod**, documentación interactiva con **Swagger / OpenAPI 3**, manejo centralizado y seguro de errores, control de tasa de peticiones (**Rate Limiting**) y una suite de pruebas automatizadas con **Supertest** y el ejecutor nativo de Node.js.

Todo el proyecto fue planificado, desarrollado, documentado y probado como una solución integral por un único estudiante.

---

## 3. Objetivos
1. Construir una API REST completa y modular utilizando **Express 5** y **CommonJS**.
2. Implementar un CRUD en memoria para la administración de notas con generación automática de identificadores.
3. Integrar **Claude AI** utilizando el SDK oficial de Anthropic (`@anthropic-ai/sdk`) para responder consultas técnicas y resumir notas existentes.
4. Validar el cuerpo de todas las solicitudes entrantes utilizando **Zod**, descartando de inmediato entradas inválidas antes de procesar lógica de negocio o llamar a la IA.
5. Diseñar un middleware centralizado de manejo de errores capaz de interceptar errores de Anthropic, errores operacionales y excepciones internas, garantizando la estabilidad del servidor.
6. Proteger credenciales mediante variables de entorno (`dotenv`), evitando la exposición de claves privadas tanto en código como en respuestas al cliente.
7. Documentar todos los endpoints, esquemas y códigos de respuesta mediante **OpenAPI 3 / Swagger**.
8. Implementar retos adicionales: protección contra abusos mediante **Rate Limiting** y suite de **pruebas automatizadas con mocks**.

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
- **SDK Anthropic:** `@anthropic-ai/sdk` oficial para conexión con Claude.
- **Zod:** Validación declarativa de esquemas y tipos de datos.
- **dotenv:** Carga y gestión segura de variables de entorno.
- **swagger-jsdoc & swagger-ui-express:** Generación de especificación OpenAPI 3 y UI interactiva.
- **express-rate-limit:** Protección contra abusos y ataques DoS en endpoints de IA.
- **Nodemon:** Servidor de desarrollo con recarga automática.
- **Supertest & Node.js Test Runner:** Suite de pruebas automatizadas (`node --test`).
- **Git & GitHub:** Control de versiones con ramas `main` y `feature/lab5`.

---

## 7. Estructura del Proyecto
```text
lab5-api/
│
├── src/
│   ├── config/
│   │   └── swagger.js          # Configuración de OpenAPI 3 y Swagger UI
│   │
│   ├── routes/
│   │   ├── notas.routes.js     # Endpoints CRUD de notas y generación de resumen
│   │   └── ia.routes.js        # Endpoint de preguntas libres a Claude AI
│   │
│   ├── services/
│   │   ├── notas.service.js    # Lógica de almacenamiento y operaciones en memoria
│   │   └── claude.service.js   # Comunicación con Anthropic SDK y cliente reusable
│   │
│   ├── middlewares/
│   │   ├── validar.js          # Middleware de validación con esquemas Zod
│   │   ├── rateLimiter.js      # Control de tasa de peticiones para endpoints de IA
│   │   └── errorHandler.js    # Manejador centralizado de errores y mapeo Anthropic
│   │
│   ├── utils/
│   │   └── errors.js           # Clase AppError para errores operacionales HTTP
│   │
│   ├── app.js                  # Configuración de la aplicación Express y middlewares
│   └── index.js                # Punto de entrada y arranque del servidor HTTP
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
[ Middlewares: CORS/JSON ]   [ Documentación Swagger /api-docs ]
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
         ├── notas.service.js   ──> [ Memoria RAM (Array) ]
         └── claude.service.js  ──> [ Anthropic SDK / Claude API ]
                │ (En caso de error)
                ▼
      [ Middleware Centralizado errorHandler ]
         ├── Mapeo seguro de Anthropic APIError (401->502, 529->503, 429->429)
         ├── AppError (400, 404)
         └── Ocultación de detalles sensibles
```

---

## 9. Requisitos Previos
- **Node.js** v20.0.0 o superior instalado en el equipo.
- **npm** v10.0.0 o superior.
- Una cuenta activa en **Anthropic Console** con créditos disponibles (opcional para pruebas automatizadas gracias a los mocks).

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
ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-aqui
CLAUDE_MODEL=claude-haiku-4-5-20251001
PORT=3000
```

> **Regla de Seguridad Fundamental:** El archivo `.env` está expresamente incluido en `.gitignore`. Nunca debe ser versionado en Git ni compartido con terceros.

---

## 12. Obtención de la API Key de Anthropic
1. Ingresa a [https://console.anthropic.com/](https://console.anthropic.com/).
2. Inicia sesión o regístrate en la plataforma.
3. Ve a la sección **API Keys** y presiona **Create Key**.
4. Asigna un nombre (ej. `Lab5-Backend`) y copia el token generado (inicia con `sk-ant-`).
5. Pégalo en tu archivo local `.env` en la variable `ANTHROPIC_API_KEY`.

---

## 13. Ejecución del Servidor
### Modo Desarrollo (con recarga automática mediante Nodemon):
```bash
npm run dev
```

### Modo Producción:
```bash
npm start
```

Salida esperada en consola:
```text
========================================================
🚀 Servidor ejecutándose en: http://localhost:3000
📚 Documentación Swagger en: http://localhost:3000/api-docs
🤖 Modelo Claude configurado: claude-haiku-4-5-20251001
🔑 API Key Anthropic: Configurada (Protegida)
========================================================
```

---

## 14. Acceso a Swagger UI
Una vez iniciado el servidor, abre tu navegador e ingresa a:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Desde allí podrás probar interactivamente todos los endpoints, inspeccionar los esquemas JSON de entrada/salida y revisar los códigos de estado HTTP documentados.

---

## 15. Descripción de los Endpoints

| Método | Endpoint | Tag | Descripción | Códigos HTTP |
|---|---|---|---|---|
| `GET` | `/api/notas` | Notas | Lista todas las notas almacenadas en memoria | `200` |
| `GET` | `/api/notas/:id` | Notas | Busca una nota por su identificador | `200`, `404` |
| `POST` | `/api/notas` | Notas | Crea una nueva nota validada con Zod | `201`, `400` |
| `DELETE` | `/api/notas/:id` | Notas | Elimina una nota (sin cuerpo de respuesta) | `204`, `404` |
| `POST` | `/api/ia/preguntar` | IA | Envía una consulta técnica a Claude | `200`, `400`, `429`, `502`, `503` |
| `POST` | `/api/notas/:id/resumen` | Notas / IA | Genera un resumen en 3 viñetas con Claude | `200`, `404`, `429`, `502`, `503` |

---

## 16. Ejemplos de Peticiones y Respuestas

### 1. Crear una nota (`POST /api/notas`)
**Petición:**
```http
POST /api/notas HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "titulo": "Introducción a REST",
  "contenido": "REST es un estilo de arquitectura para sistemas hipermedia distribuidos fundamentado en recursos y operaciones HTTP."
}
```
**Respuesta exitosa (`201 Created`):**
```json
{
  "id": 1,
  "titulo": "Introducción a REST",
  "contenido": "REST es un estilo de arquitectura para sistemas hipermedia distribuidos fundamentado en recursos y operaciones HTTP."
}
```

### 2. Listar notas (`GET /api/notas`)
**Respuesta exitosa (`200 OK`):**
```json
[
  {
    "id": 1,
    "titulo": "Introducción a REST",
    "contenido": "REST es un estilo de arquitectura..."
  }
]
```

### 3. Eliminar una nota (`DELETE /api/notas/1`)
**Respuesta exitosa (`204 No Content`):**
*(Cuerpo vacío, estado 204).*

### 4. Preguntar a Claude AI (`POST /api/ia/preguntar`)
**Petición:**
```http
POST /api/ia/preguntar HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "pregunta": "¿Qué ventajas ofrece Express 5?"
}
```
**Respuesta exitosa (`200 OK`):**
```json
{
  "respuesta": "Express 5 introduce mejoras clave como el manejo automático de promesas y errores asíncronos sin requerir bloques try/catch en cada ruta, eliminación de métodos obsoletos y mayor compatibilidad con Node.js moderno.",
  "uso": {
    "input_tokens": 20,
    "output_tokens": 48
  }
}
```

### 5. Resumir una nota con Claude (`POST /api/notas/1/resumen`)
**Respuesta exitosa (`200 OK`):**
```json
{
  "notaId": 1,
  "resumen": "- Arquitectura para sistemas distribuidos hipermedia.\n- Organiza la información en recursos identificables mediante URIs.\n- Utiliza métodos HTTP estándar para manipular dichos recursos."
}
```

---

## 17. Códigos de Estado HTTP Utilizados

- **`200 OK`:** Solicitud procesada exitosamente con datos en la respuesta.
- **`201 Created`:** Recurso creado exitosamente (nueva nota).
- **`204 No Content`:** Eliminación exitosa sin cuerpo en la respuesta.
- **`400 Bad Request`:** Error de validación Zod en el cuerpo de la petición.
- **`404 Not Found`:** Nota solicitada inexistente.
- **`429 Too Many Requests`:** Límite de peticiones de IA excedido (Rate Limiter).
- **`502 Bad Gateway`:** Error de autenticación (401), parámetros inválidos o fallo de comunicación con el servicio externo de Anthropic Claude.
- **`503 Service Unavailable`:** Servicio de Claude sobrecargado (529).
- **`500 Internal Server Error`:** Error interno inesperado en el servidor.

---

## 18. Manejo Centralizado de Errores
El middleware `src/middlewares/errorHandler.js` intercepta cualquier fallo ocurrido durante el ciclo de vida de la petición:

1. **Errores de Anthropic SDK:**  
   Se detectan mediante `instanceof Anthropic.APIError`. Los códigos 401 y 400 del proveedor se mapean a **502 Bad Gateway**; el 429 se mapea a **429**, y el 529 (sobrecarga) a **503 Service Unavailable**. La respuesta enviada al cliente es siempre genérica:
   ```json
   {
     "error": "IA_NO_DISPONIBLE"
   }
   ```
   Se realiza un registro técnico seguro en el servidor sin exponer claves ni encabezados.
2. **Errores Operacionales (`AppError`):**  
   Controlan códigos como el 404 de notas inexistentes, devolviendo `{ "error": "Nota con ID ... no encontrada" }`.
3. **JSON Malformado:**  
   Captura excepciones de sintaxis devolviendo HTTP 400.
4. **Resiliencia:** Un fallo de Claude o de validación nunca derriba el servidor.

---

## 19. Seguridad y Buenas Prácticas
- **Aislamiento de Credenciales:** La API key sólo existe en `.env` y es leída vía `process.env`.
- **Sin Fugas de Información:** Las respuestas de error hacia el cliente ocultan detalles internos del proveedor de IA.
- **Arranque Seguro:** El servidor inicia correctamente aun cuando la clave no esté configurada; la ausencia se detecta únicamente al invocar funciones de IA.
- **Validación Perimetral con Zod:** Las peticiones maliciosas o vacías se detienen antes de consumir créditos o memoria.
- **Control de Versiones Seguro:** `.gitignore` excluye `.env` y `node_modules/`.

---

## 20. Pruebas Automatizadas (Reto Adicional)
El proyecto incluye una suite automatizada exhaustiva implementada con **Supertest** y el ejecutor nativo de Node.js (`node --test`), utilizando mocks para el servicio de Claude para evitar consumo de créditos.

Para ejecutar todas las pruebas:
```bash
npm test
```

### Cobertura de las 21 pruebas:
1. **CRUD de notas en memoria:** Creación, auto-incremento de ID, listado, búsqueda por ID, eliminación con 204 y validación de 404.
2. **Validaciones Zod (400):** Cuerpos vacíos `{}`, títulos vacíos, títulos mayores a 100 caracteres, contenidos mayores a 5000 caracteres.
3. **Endpoint de Preguntas:** Petición válida, rechazo de preguntas de 1 carácter, comprobación de que Claude **NO** es invocado ante fallos de validación.
4. **Endpoint de Resúmenes:** Resumen de nota existente en 3 viñetas, rechazo 404 ante nota inexistente y comprobación de que Claude **NO** es invocado si la nota no existe.
5. **Mapeo de Errores de Anthropic:** Simulación de 401 mapeado a 502, y simulación de 529 mapeado a 503.
6. **Especificación OpenAPI / Swagger:** Verificación de la exposición del esquema JSON con títulos y rutas completas.
7. **Rate Limiting:** Comprobación de cabeceras estándar de tasa y persistencia del CRUD de notas.

---

## 21. Reto Adicional: Rate Limiting
Se incorporó `express-rate-limit` en `src/middlewares/rateLimiter.js` para proteger exclusivamente los endpoints de IA (`/api/ia/preguntar` y `/api/notas/:id/resumen`), configurando una cuota de 10 peticiones por minuto. Cuando un usuario supera el límite:
- Devuelve **HTTP 429 Too Many Requests**.
- Muestra un mensaje amigable: `"Has superado el límite de peticiones de IA. Por favor, espera antes de realizar otra consulta."`.
- Detiene la ejecución evitando llamadas innecesarias a Claude.
- El CRUD de notas permanece 100% disponible.

---

## 22. Evidencias para la Entrega
Consulta el documento [`docs/evidencias/README.md`](./docs/evidencias/README.md) para revisar el listado completo y la plantilla de las 15 capturas de pantalla requeridas para la sustentación académica.

---

## 23. Preguntas de Reflexión
Las respuestas técnicas completas a las siete preguntas de reflexión se encuentran detalladas en [`docs/reflexiones.md`](./docs/reflexiones.md).

---

## 24. Conclusiones
1. La adopción de una arquitectura modular desacoplada en Express 5 garantiza un código limpio, mantenible y fácilmente testeable.
2. La validación temprana con Zod es un mecanismo indispensable para el ahorro de costos y la seguridad en sistemas que integran modelos de inteligencia artificial por consumo.
3. El diseño defensivo en el middleware de errores previene fugas de información sensible y garantiza la resiliencia del sistema ante indisponibilidades de proveedores externos.
4. Documentar los servicios con OpenAPI/Swagger enriquece la experiencia del desarrollador y agiliza el consumo de la API por parte de clientes frontend y evaluadores.
