# Evidencias de Ejecución y Pruebas — Laboratorio #5 (DeepSeek AI)

**Modalidad:** Individual  
**Estudiante:** `[Nombre y Apellidos del Estudiante]`  
**Asignatura / Curso:** Desarrollo Backend  
**Proyecto:** API REST con Express 5, Swagger e integración con DeepSeek AI (`lab5-api`)

---

## Instrucciones para la Recolección de Evidencias

Este documento contiene la plantilla y el listado ordenado de capturas de pantalla requeridas para la sustentación y entrega del laboratorio.

> **Nota de Seguridad y Honestidad Académica:**  
> - En ninguna captura de pantalla debe visualizarse la API key de DeepSeek.
> - Si tomas capturas del archivo `.env`, asegúrate de que el valor de `DEEPSEEK_API_KEY` esté censurado o toma la captura de `.env.example`.
> - Las capturas marcadas como *requiere credenciales reales de DeepSeek* se completan cuando ingreses tu clave en `.env`.

---

## Lista de Capturas de Pantalla

### 1. Estructura del Proyecto
*Captura del explorador de archivos en el editor de código mostrando la estructura completa de carpetas y archivos de `lab5-api` con `deepseek.service.js`.*

```markdown
![Estructura del Proyecto](./capturas/01_estructura_proyecto.png)
```
*(Coloca tu captura en la ruta anterior o inserta la imagen aquí)*

---

### 2. Servidor Funcionando en Consola
*Captura de la terminal ejecutando `npm run dev` o `npm start`, mostrando el banner de inicialización, puerto 3000, modelo `deepseek-flash` y URL de Swagger.*

```markdown
![Servidor Funcionando](./capturas/02_servidor_funcionando.png)
```

---

### 3. Swagger UI Mostrando los Endpoints
*Captura del navegador web en `http://localhost:3000/api-docs` mostrando el título "Laboratorio 5: API REST con Express, Swagger y DeepSeek AI", los tags **Notas**, **IA** y **Documentación**, y todos los endpoints documentados.*

```markdown
![Swagger UI General](./capturas/03_swagger_ui_endpoints.png)
```

---

### 4. Creación de una Nota (HTTP 201 Created)
*Captura en Swagger UI o Postman enviando un `POST /api/notas` con `titulo` y `contenido`, recibiendo HTTP 201 con el ID generado.*

```markdown
![Creación de Nota](./capturas/04_crear_nota_201.png)
```

---

### 5. Listado de Notas (HTTP 200 OK)
*Captura en Swagger UI o Postman ejecutando `GET /api/notas`, mostrando el arreglo JSON con las notas almacenadas en memoria.*

```markdown
![Listar Notas](./capturas/05_listar_notas_200.png)
```

---

### 6. Consulta de Nota Inexistente (HTTP 404 Not Found)
*Captura ejecutando `GET /api/notas/999` demostrando que el middleware de errores responde con código 404 y mensaje claro.*

```markdown
![Error 404 Nota Inexistente](./capturas/06_error_404_no_encontrada.png)
```

---

### 7. Error de Validación Zod (HTTP 400 Bad Request)
*Captura enviando un `POST /api/notas` con cuerpo vacío `{}` o título vacío, mostrando la respuesta 400 y el arreglo `errores` con los campos afectados.*

```markdown
![Error Validación 400](./capturas/07_error_validacion_400.png)
```

---

### 8. Pregunta Real a DeepSeek AI (POST /api/ia/preguntar)
*Captura de la petición enviando una pregunta técnica válida (ej. "¿Qué es REST?") a DeepSeek.*

```markdown
![Petición a DeepSeek](./capturas/08_pregunta_deepseek_request.png)
```

---

### 9. Respuesta de DeepSeek con Tokens (HTTP 200 OK)
*Captura de la respuesta HTTP 200 recibida, mostrando la propiedad `respuesta` generada y el desglose de tokens en `uso.input_tokens`, `uso.output_tokens` y `uso.total_tokens`.*

```markdown
![Respuesta DeepSeek Tokens](./capturas/09_respuesta_deepseek_tokens_200.png)
```

---

### 10. Resumen Real de Nota Generado con DeepSeek (POST /api/notas/:id/resumen)
*Captura ejecutando la generación de resumen en 3 viñetas para una nota existente, mostrando el `notaId` y el campo `resumen`.*

```markdown
![Resumen Nota DeepSeek](./capturas/10_resumen_nota_ia_200.png)
```

---

### 11. Error 502 Bad Gateway con API Key Inválida
*Captura configurando temporalmente `DEEPSEEK_API_KEY=sk-invalida-prueba` en `.env` y enviando una pregunta a DeepSeek, demostrando que la API responde con HTTP 502 y cuerpo `{ "error": "IA_NO_DISPONIBLE", "mensaje": "..." }`, mientras el backend registra el 401 de forma segura sin detenerse.*

```markdown
![Error 502 API Key Inválida](./capturas/11_error_502_api_key_falsa.png)
```

---

### 12. Eliminación con Código HTTP 204 No Content
*Captura ejecutando `DELETE /api/notas/:id`, demostrando que responde con 204 y sin ningún cuerpo de respuesta.*

```markdown
![Eliminar Nota 204](./capturas/12_eliminar_nota_204.png)
```

---

### 13. Pruebas Automatizadas Exitosas
*Captura de la terminal ejecutando `npm test`, mostrando las 21 pruebas pasando (100% pass) con el ejecutor nativo de Node.js y Supertest sobre DeepSeek.*

```markdown
![Pruebas Automatizadas](./capturas/13_pruebas_npm_test.png)
```

---

### 14. Archivo .gitignore y Comprobación de Seguridad
*Captura mostrando el contenido de `.gitignore` (excluyendo `.env` y `node_modules/`) y la salida de `git status` confirmando que `.env` no es rastreado.*

```markdown
![Seguridad Gitignore](./capturas/14_gitignore_seguridad.png)
```

---

### 15. Historial de Commits del Proyecto
*Captura de la terminal ejecutando `git log --oneline --graph` mostrando el flujo de desarrollo individual progresivo y el commit de migración a DeepSeek.*

```markdown
![Historial Git Commits](./capturas/15_git_log_commits.png)
```
