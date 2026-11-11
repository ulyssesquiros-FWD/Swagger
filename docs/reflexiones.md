# Preguntas de Reflexión — Laboratorio #5

**Estudiante:** `[Nombre y Apellidos del Estudiante]`  
**Modalidad:** Desarrollo Individual  
**Materia:** Programación Backend / Arquitectura de Software  
**Fecha:** Noviembre 2026  

---

### 1. ¿Por qué la API key no puede estar en el frontend? Explica cómo podría obtenerla un usuario cualquiera.

Una clave de API (`API key`) representa la identidad y la autorización de facturación de nuestra cuenta frente al proveedor de nube (Anthropic). El frontend (código que corre en el navegador web del usuario, una aplicación móvil o una SPA) es un entorno completamente inseguro y de ejecución pública sobre el cual el desarrollador no tiene control.

**Cómo la obtendría cualquier usuario:**
1. **Herramientas de Desarrollador del Navegador (DevTools - F12):** En la pestaña *Network* (Red), cualquier usuario puede inspeccionar las cabeceras HTTP de las peticiones salientes (`x-api-key` o `Authorization`). Si el frontend llamara directamente a Claude, la clave viajaría en texto plano visible para el usuario.
2. **Pestaña Sources / Scripts empaquetados:** Aunque el código fuente de JavaScript esté minificado o empaquetado con Webpack/Vite, las variables estáticas incrustadas se pueden leer con un simple `Ctrl+F` buscando patrones como `sk-ant-`.
3. **Pérdida de control y consecuencias:** Una vez extraída la API key, cualquier tercero podría utilizarla en sus propios proyectos, agotando nuestros créditos monetarios en minutos, provocando cobros no autorizados y bloqueos por infracción de cuotas (`Rate Limits`). 

Por esta razón fundamental de arquitectura, el backend actúa como un **Proxy Seguro**: la API key se almacena exclusivamente en variables de entorno del servidor (`.env`), nunca viaja al cliente, y el backend aplica sus propias reglas de autenticación, validación (Zod) y limitación de tasa (`rate limiting`).

---

### 2. ¿Qué responde tu API cuando Claude devuelve 401? ¿Por qué no se reenvía ese mismo 401 al cliente?

**Respuesta de nuestra API:**
Nuestra API responde con el código de estado **HTTP 502 Bad Gateway** y el siguiente cuerpo JSON:
```json
{
  "error": "IA_NO_DISPONIBLE"
}
```

**Por qué NO se reenvía el 401 Unauthorized al cliente:**
1. **Semántica de Códigos HTTP:** El código `401 Unauthorized` indica que el *cliente que realiza la petición a nuestra API* no se ha autenticado correctamente o no envió credenciales válidas para acceder a nuestro sistema. Si le devolvemos un 401 al cliente, le estaríamos diciendo erróneamente que *él* debe enviar una clave o iniciar sesión en nuestro servicio.
2. **Naturaleza del Error:** La falta de autenticación entre nuestro backend y Anthropic es un problema interno de comunicación con un servicio ascendente (*upstream service*). La semántica formal de REST establece que cuando un servidor intermedio recibe una respuesta inválida de un servicio externo dependiente, el código apropiado es **502 Bad Gateway**.
3. **Seguridad por Ocultación de Detalles Internos:** Reenviar el 401 o los mensajes de error de Anthropic expondría que nuestro backend tiene problemas de configuración o una API key vencida/revocada, brindando información técnica que un atacante podría explotar para mapear la infraestructura y proveedores internos.

---

### 3. ¿Qué diferencia existe entre `system` y `messages`? Incluye un ejemplo de tus pruebas.

En la API de Anthropic Claude:

- **`system` (Instrucción de Sistema):** Define el rol, comportamiento global, restricciones éticas, idioma, tono y formato de salida que el modelo debe mantener en todo momento. Opera como una directiva estructural invariable que condiciona cómo se interpretará cualquier mensaje posterior.
- **`messages` (Historial de Conversación / Contenido del Usuario):** Es un arreglo de objetos con roles (`user`, `assistant`) que contiene las peticiones, preguntas o datos concretos que el usuario envía para que el modelo procese en esa interacción particular.

**Ejemplo real implementado en el endpoint de resumen (`POST /api/notas/:id/resumen`):**

- **Parámetro `system`:**
  ```text
  "Resume el texto en 3 viñetas breves, claras y concretas, en español. No inventes información que no aparezca en el contenido original."
  ```
- **Parámetro `messages`:**
  ```json
  [
    {
      "role": "user",
      "content": "MVC separa una aplicación en tres componentes: Modelo, Vista y Controlador. El modelo gestiona la lógica de datos, la vista la presentación visual y el controlador las interacciones del usuario."
    }
  ]
  ```

El parámetro `system` le ordena a Claude cómo estructurar la salida (3 viñetas breves y concretas sin alucinaciones), mientras que `messages` contiene el texto exacto de la nota a ser resumida.

---

### 4. Registro de `input_tokens` y `output_tokens` de dos llamadas reales

> **Instrucción para la entrega final:** Configura tu clave real en `.env`, realiza dos llamadas reales a través de Swagger UI o curl, y copia aquí los valores exactos reportados en la propiedad `uso`.

#### Llamada 1: Pregunta directa a Claude (`POST /api/ia/preguntar`)
- **Pregunta enviada:** `[Completar: ej. "¿Qué es un middleware en Express?"]`
- **Modelo utilizado:** `claude-haiku-4-5-20251001`
- **Tokens de entrada (`input_tokens`):** `[Completar: ej. 18]`
- **Tokens de salida (`output_tokens`):** `[Completar: ej. 125]`
- **Total de tokens:** `[Completar: ej. 143]`

#### Llamada 2: Resumen de nota con IA (`POST /api/notas/:id/resumen`)
- **Título de la nota resumida:** `[Completar: ej. "Arquitectura REST"]`
- **Modelo utilizado:** `claude-haiku-4-5-20251001`
- **Tokens de entrada (`input_tokens`):** `[Completar: ej. 54]`
- **Tokens de salida (`output_tokens`):** `[Completar: ej. 62]`
- **Total de tokens:** `[Completar: ej. 116]`

#### Parámetro que permite limitar el costo:
El parámetro principal para acotar el costo por petición es **`max_tokens`** (en nuestro servicio configurado en `1024`). Este parámetro impone un límite estricto a la cantidad máxima de tokens que Claude tiene permitido generar en la respuesta (`output_tokens`), evitando respuestas innecesariamente largas que consuman crédito de forma imprevista. Adicionalmente, seleccionar modelos económicos como **Claude 3.5 Haiku** en `CLAUDE_MODEL` optimiza radicalmente el costo por millón de tokens en comparación con Claude 3.5 Sonnet u Opus.

---

### 5. ¿Qué pasaría si no validaras el body antes de llamar a Claude? Explica al menos dos consecuencias.

Si no utilizáramos el middleware de validación con Zod (`src/middlewares/validar.js`) antes de invocar el servicio de Claude, se generarían graves problemas técnicos y financieros:

1. **Consecuencia 1: Desperdicio de Créditos y Sobrecostos Monetarios Innecesarios:**  
   Si un usuario envía un cuerpo vacío `{}`, un espacio en blanco `" "` o un texto sin sentido, la API de Anthropic procesaría la solicitud de todas formas, facturando tokens de entrada y salida inútiles. En un entorno con miles de peticiones o ataques automatizados, la falta de validación local generaría facturación elevada por peticiones basura que debieron ser descartadas en el primer milisegundo por nuestro backend.

2. **Consecuencia 2: Errores 500 no controlados o excepciones en el SDK de Anthropic:**  
   Si el campo `pregunta` llega como `undefined`, `null`, un número o un arreglo, el SDK de Anthropic (`client.messages.create`) fallará al esperar un string en `content`. Esto provocaría un error HTTP 400 por parte de Anthropic o un error de tipo en JavaScript (`TypeError: Cannot read properties of undefined`), degradando la experiencia del usuario y saturando los logs del servidor con excepciones no operacionales.

3. **Consecuencia 3: Vulnerabilidad ante Abusos y Sobrecarga de Buffer (Ataques DoS):**  
   Al limitar con Zod el tamaño máximo (`max(2000)` en preguntas y `max(5000)` en contenido de notas), protegemos el servidor y el cliente de consumir gigabytes de memoria o enviar cargas útiles descomunales que saturen la red.

---

### 6. ¿Cómo organizaste el desarrollo y la integración del proyecto? (Perspectiva Individual)

Como único desarrollador a cargo de la arquitectura, implementación, documentación y pruebas de la API, organicé el trabajo mediante un enfoque incremental guiado por capas de responsabilidad:

1. **Planificación y Modularización:**  
   Definí una estructura desacoplada separando rutas (`routes/`), lógica de negocio (`services/`), middlewares (`middlewares/`), configuración (`config/`) y utilidades (`utils/`), evitando concentrar código en `index.js`.
2. **Fundamentos y Modelo de Datos:**  
   Inicié implementando `src/utils/errors.js` con la clase `AppError` y `src/services/notas.service.js` con almacenamiento en memoria y métodos puros (`listar`, `buscar`, `crear`, `eliminar`, `reiniciar`).
3. **Validación Temprana:**  
   Diseñé el middleware reutilizable `validar.js` integrando Zod para filtrar peticiones inválidas antes de tocar cualquier servicio.
4. **Integración Segura con Claude API:**  
   Encapsulé el SDK de Anthropic en `src/services/claude.service.js`, configurando cliente reutilizable, variables de entorno desacopladas (`.env`) y control de inicio sin credenciales.
5. **Manejo Centralizado de Errores y Seguridad:**  
   En `src/middlewares/errorHandler.js`, implementé el mapeo seguro de errores del SDK de Anthropic (401/400 -> 502, 429 -> 429, 529 -> 503) garantizando que no se filtren cabeceras ni tokens y que el servidor nunca se caiga.
6. **Retos Adicionales y Robustez:**  
   Añadí protección de tasa con `express-rate-limit` y una suite completa de 21 pruebas automatizadas con `node:test` y `supertest` usando mocks controlados para validar todos los flujos sin consumir saldo.
7. **Documentación OpenAPI 3 y Git:**  
   Documenté cada endpoint con anotaciones `@openapi`, verifiqué la visualización en Swagger UI y gestioné el control de versiones con ramas `feature/lab5` y `main`.

---

### 7. ¿Qué aprendiste durante la implementación de Express, Swagger y Claude API?

Durante el desarrollo integral de este laboratorio adquirí aprendizajes técnicos clave:

1. **Arquitectura Limpia en Express 5:** Comprobé las ventajas de Express 5 para el manejo nativo de promesas y la importancia de desacoplar la capa de transporte (rutas/controladores) de la capa de servicios y utilidades.
2. **Validación Declarativa con Zod:** Aprendí a utilizar esquemas estrictos de validación con mensajes personalizados y `safeParse`, entendiendo que la validación perimetral ahorra recursos de cómputo y dinero en APIs de IA.
3. **Integración Profesional de LLMs mediante SDKs:** Comprendí el funcionamiento del SDK de Anthropic, la diferencia crucial entre directivas `system` y mensajes de usuario, el cálculo y monitoreo de tokens, y la necesidad innegociable de proteger credenciales en el backend.
4. **Resiliencia y Mapeo de Errores de Terceros:** Aprendí que los errores de servicios externos nunca deben reenviarse ingenuamente al cliente (como reenviar un 401 de Anthropic). Mapear adecuadamente a 502 o 503 y registrar detalles seguros en el backend es fundamental para la seguridad y la arquitectura REST.
5. **Documentación como Código con OpenAPI/Swagger:** La capacidad de documentar los endpoints directamente con anotaciones JSDoc y generar una interfaz interactiva en tiempo real (`/api-docs`) mejora enormemente la calidad y mantenibilidad del software.
6. **Protección con Rate Limiting y Pruebas con Mocks:** Experimenté cómo proteger endpoints costosos de IA contra abusos y cómo diseñar suites de pruebas automatizadas que garanticen cobertura total sin depender de conexión a internet ni incurrir en gastos de API.
