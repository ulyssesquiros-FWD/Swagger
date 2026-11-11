# Preguntas de Reflexión — Laboratorio #5 (DeepSeek AI)

**Estudiante:** `[Nombre y Apellidos del Estudiante]`  
**Modalidad:** Desarrollo Individual  
**Materia:** Programación Backend / Arquitectura de Software  
**Fecha:** Noviembre 2026  

---

### 1. ¿Por qué la API key no puede estar en el frontend? Explica cómo podría obtenerla un usuario cualquiera.

Una clave de API (`API key`) representa la identidad y la autorización de facturación de nuestra cuenta frente al proveedor de nube (DeepSeek). El frontend (código que corre en el navegador web del usuario, una aplicación móvil o una SPA) es un entorno completamente público sobre el cual el desarrollador no tiene ningún control de ejecución.

**Cómo la obtendría cualquier usuario:**
1. **Herramientas de Desarrollador del Navegador (DevTools - F12):** En la pestaña *Network* (Red), cualquier usuario puede inspeccionar las cabeceras HTTP de las peticiones salientes (`Authorization: Bearer sk-...`). Si el frontend llamara directamente a DeepSeek, la clave viajaría en texto plano visible para el usuario.
2. **Pestaña Sources / Scripts empaquetados:** Aunque el código fuente de JavaScript esté minificado o empaquetado con Webpack/Vite, las variables estáticas incrustadas se pueden leer con un simple `Ctrl+F` buscando patrones de claves privadas como `sk-`.
3. **Pérdida de control y consecuencias:** Una vez extraída la clave, cualquier tercero podría utilizarla en sus propios proyectos, agotando nuestros créditos monetarios en minutos, provocando cobros no autorizados y bloqueos por infracción de cuotas (`Rate Limits`). 

Por esta razón fundamental de arquitectura, el backend actúa como un **Proxy Seguro**: la variable `DEEPSEEK_API_KEY` se almacena exclusivamente en variables de entorno del servidor (`.env`), nunca viaja al cliente, y el backend aplica sus propias reglas de autenticación, validación estricta (Zod) y limitación de tasa (`rate limiting`).

---

### 2. ¿Qué responde tu API cuando DeepSeek devuelve 401? ¿Por qué no se reenvía ese mismo 401 al cliente?

**Respuesta de nuestra API:**
Nuestra API responde con el código de estado **HTTP 502 Bad Gateway** y el siguiente cuerpo JSON:
```json
{
  "error": "IA_NO_DISPONIBLE",
  "mensaje": "El servicio de inteligencia artificial no está disponible actualmente."
}
```

**Por qué NO se reenvía el 401 Unauthorized al cliente:**
1. **Semántica de Códigos HTTP:** El código `401 Unauthorized` indica que el *cliente que realiza la petición a nuestra API* no se ha autenticado correctamente o no envió credenciales válidas para acceder a nuestro sistema. Si le devolvemos un 401 al cliente, le estaríamos diciendo erróneamente que *él* debe enviar una clave o iniciar sesión en nuestro servicio.
2. **Naturaleza del Error:** La falta de autenticación entre nuestro backend y DeepSeek es un problema interno de comunicación con un servicio ascendente (*upstream service*). La semántica formal de REST establece que cuando un servidor intermedio recibe una respuesta inválida de un servicio externo dependiente, el código apropiado es **502 Bad Gateway**.
3. **Seguridad por Ocultación de Detalles Internos:** Reenviar el 401 o los mensajes de error de DeepSeek expondría que nuestro backend tiene problemas de configuración o una API key vencida/revocada, brindando información técnica que un atacante podría explotar para mapear la infraestructura y proveedores internos.

---

### 3. ¿Qué diferencia existe entre `system` y `messages`? Incluye un ejemplo de tus pruebas.

En la API de DeepSeek (utilizando el SDK compatible OpenAI):

- **`system` (Rol de Sistema):** Define el rol, comportamiento global, restricciones éticas, idioma, tono y formato de salida que el modelo debe mantener en todo momento. Opera como una directiva estructural invariable que condiciona cómo se interpretará cualquier mensaje posterior.
- **`messages` (Historial de Mensajes / Contenido del Usuario):** Es un arreglo de objetos con roles (`system`, `user`, `assistant`) que contiene las directivas y las peticiones concretas que el usuario envía para que el modelo procese en esa interacción particular.

**Ejemplo real implementado en el endpoint de resumen (`POST /api/notas/:id/resumen`):**

- **Mensaje con rol `system`:**
  ```text
  "Resume el texto en exactamente 3 viñetas breves y concretas, en español. No inventes información. Utiliza únicamente los datos proporcionados y evita explicaciones adicionales."
  ```
- **Mensaje con rol `user`:**
  ```text
  "MVC separa una aplicación en tres componentes: Modelo, Vista y Controlador. El modelo gestiona la lógica de datos, la vista la presentación visual y el controlador las interacciones del usuario."
  ```

El rol `system` le ordena a DeepSeek estructurar la salida estrictamente en 3 viñetas breves sin agregar saludos ni explicaciones accesorias, mientras que el rol `user` contiene el texto exacto de la nota a ser resumida.

---

### 4. Registro de `input_tokens` y `output_tokens` de dos llamadas reales

> **Instrucción para la entrega final:** Configura tu clave real en `.env`, realiza dos llamadas reales a través de Swagger UI o `npm run demo`, y copia aquí los valores exactos reportados en la propiedad `uso`.

#### Llamada 1: Pregunta directa a DeepSeek (`POST /api/ia/preguntar`)
- **Pregunta enviada:** `[Completar: ej. "¿Qué es un middleware en Express?"]`
- **Modelo utilizado:** `deepseek-flash`
- **Tokens de entrada (`input_tokens`):** `[Completar: ej. 32]`
- **Tokens de salida (`output_tokens`):** `[Completar: ej. 68]`
- **Total de tokens (`total_tokens`):** `[Completar: ej. 100]`

#### Llamada 2: Resumen de nota con DeepSeek (`POST /api/notas/:id/resumen`)
- **Título de la nota resumida:** `[Completar: ej. "Arquitectura REST"]`
- **Modelo utilizado:** `deepseek-flash`
- **Tokens de entrada (`input_tokens`):** `[Completar: ej. 65]`
- **Tokens de salida (`output_tokens`):** `[Completar: ej. 48]`
- **Total de tokens (`total_tokens`):** `[Completar: ej. 113]`

#### Parámetros que permiten limitar el costo:
1. **`max_tokens: 256`:** Impone un límite rígido a la cantidad máxima de tokens que DeepSeek puede generar en la respuesta (`output_tokens`), evitando respuestas innecesariamente largas que consuman créditos de forma descontrolada.
2. **Desactivación de `thinking` (`thinking: { type: "disabled" }`):** DeepSeek tiene habilitado por defecto el modo de razonamiento interno, el cual genera tokens adicionales antes de responder. Desactivarlo reduce drásticamente el consumo de tokens.
3. **Selección del modelo `deepseek-flash` (DeepSeek-V4.1-Flash):** Es la alternativa de menor costo por millón de tokens en la tabla oficial de precios de DeepSeek.

---

### 5. ¿Qué pasaría si no validaras el body antes de llamar a DeepSeek? Explica al menos dos consecuencias.

Si no utilizáramos el middleware de validación con Zod (`src/middlewares/validar.js`) antes de invocar el servicio de DeepSeek, se generarían graves problemas técnicos y financieros:

1. **Consecuencia 1: Desperdicio de Créditos y Sobrecostos Monetarios Innecesarios:**  
   Si un usuario envía un cuerpo vacío `{}`, un espacio en blanco `" "` o un texto sin sentido, la API de DeepSeek procesaría la solicitud de todas formas, facturando tokens inútiles. En un entorno con miles de peticiones o ataques automatizados, la falta de validación local generaría facturación elevada por peticiones basura que debieron ser descartadas en el primer milisegundo por nuestro backend.

2. **Consecuencia 2: Errores 500 no controlados o excepciones en el SDK de OpenAI/DeepSeek:**  
   Si el campo `pregunta` llega como `undefined`, `null`, un número o un arreglo, el SDK (`client.chat.completions.create`) fallará al esperar una cadena de texto en `content`. Esto provocaría un error HTTP 400 por parte de DeepSeek o un error de tipo en JavaScript (`TypeError: Cannot read properties of undefined`), degradando la experiencia del usuario y saturando los logs del servidor con excepciones no operacionales.

3. **Consecuencia 3: Vulnerabilidad ante Abusos y Sobrecarga de Buffer (Ataques DoS):**  
   Al limitar con Zod el tamaño máximo (`max(2000)` en preguntas y `max(5000)` en contenido de notas), protegemos el servidor y el cliente de consumir gigabytes de memoria o enviar cargas útiles descomunales que saturen la red.

---

### 6. ¿Cómo organizaste el desarrollo y la integración del proyecto? (Perspectiva Individual)

Como único desarrollador a cargo de la arquitectura, implementación, migración, documentación y pruebas de la API, organicé el trabajo mediante un enfoque incremental guiado por capas de responsabilidad:

1. **Planificación y Modularización:**  
   Mantuve una estructura desacoplada separando rutas (`routes/`), servicios de negocio (`services/`), middlewares (`middlewares/`), configuración (`config/`) y utilidades (`utils/`), evitando concentrar código en `index.js`.
2. **Fundamentos y Modelo de Datos:**  
   El CRUD de notas en memoria (`src/services/notas.service.js`) y la clase `AppError` permanecieron intactos, garantizando estabilidad funcional.
3. **Validación Temprana:**  
   Diseñé el middleware reutilizable `validar.js` integrando Zod para filtrar peticiones inválidas antes de tocar cualquier servicio externo.
4. **Migración Limpia a DeepSeek:**  
   Reemplacé el SDK anterior por `openai` apuntando a `https://api.deepseek.com`. Creé `src/services/deepseek.service.js` con el modelo `deepseek-flash`, `thinking: { type: "disabled" }` y `max_tokens: 256`.
5. **Manejo Centralizado de Errores y Seguridad:**  
   En `src/middlewares/errorHandler.js`, implementé el mapeo seguro de errores de OpenAI/DeepSeek (401/403/400 -> 502, 500/503 -> 503, 429 -> 429) garantizando que no se filtren cabeceras de autorización ni tokens y que el servidor nunca se caiga.
6. **Retos Adicionales y Robustez:**  
   Añadí protección de tasa con `express-rate-limit` y una suite completa de 21 pruebas automatizadas con `node:test` y `supertest` usando mocks controlados para validar todos los flujos sin consumir saldo.
7. **Documentación OpenAPI 3 y Git:**  
   Documenté cada endpoint con anotaciones `@openapi`, actualicé Swagger UI con el nombre y parámetros de DeepSeek y gestioné el control de versiones con ramas `feature/lab5` y `main`.

---

### 7. ¿Qué aprendiste durante la implementación de Express, Swagger y DeepSeek API?

Durante el desarrollo y migración integral de este laboratorio adquirí aprendizajes técnicos clave:

1. **Interoperabilidad de la API de DeepSeek mediante el SDK de OpenAI:** Comprobé la ventaja de que DeepSeek utilice la especificación estándar de chat completions de OpenAI (`baseURL: https://api.deepseek.com`), lo que permite usar un SDK robusto y ampliamente probado (`openai`) cambiando únicamente la URL base y el modelo.
2. **Optimización de Costos y Control del Modo Thinking:** Aprendí que modelos como DeepSeek pueden tener activado por defecto el razonamiento interno y que desactivarlo explícitamente (`thinking: { type: "disabled" }`) junto con acotar `max_tokens` a 256 es vital para evitar costos imprevistos.
3. **Resiliencia y Mapeo de Errores de Proveedores:** Comprendí que los errores de servicios externos nunca deben reenviarse ingenuamente al cliente (como reenviar un 401 de DeepSeek). Mapear adecuadamente a 502 o 503 y registrar detalles seguros en el backend es fundamental para la seguridad y la arquitectura REST.
4. **Validación Declarativa con Zod:** Experimenté cómo la validación perimetral ahorra recursos de cómputo y dinero en APIs que integran inteligencia artificial por consumo.
5. **Documentación Viva con OpenAPI/Swagger:** La capacidad de documentar los endpoints directamente con anotaciones JSDoc y generar una interfaz interactiva en tiempo real (`/api-docs`) mejora enormemente la calidad y mantenibilidad del software.
6. **Pruebas Automatizadas con Mocks:** Aprendí a diseñar suites de pruebas automatizadas con Supertest que garanticen cobertura total sin depender de conexión a internet ni incurrir en gastos de API.
