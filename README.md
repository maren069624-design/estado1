# Ejercicios de Transición de Estados

Un solo servicio (Node + Express, sin base de datos) que puede alojar
**varios ejercicios** de transición de estados. Cada ejercicio es un
archivo JSON dentro de `/maquinas` — no hay que tocar el servidor ni el
frontend para agregar uno nuevo.

Incluye:
- `encendido-apagado` — 2 estados, ejercicio introductorio.
- `torniquete` — 4 estados, con eventos guardados (`Validar Tarjeta [Saldo Positivo]`,
  `Alarma [Falla de Energía]`), ideal para que el estudiante distinga
  casos de prueba positivos vs. negativos sobre la misma transición.

## Cómo funciona
- `maquinas/*.json` — cada archivo define un ejercicio: estados, eventos,
  guardas (opcional) y transiciones (con `valida: true/false`).
- `server.js` — carga automáticamente todos los JSON de `/maquinas` al
  arrancar y expone, por cada uno (usando el nombre del archivo como slug):
  - `GET /api/ejercicios` — lista de ejercicios (para la página de inicio)
  - `GET /api/:slug/estado` — estado actual + historial
  - `POST /api/:slug/evento` — body `{ "evento": "...", "guardia": true|false|null }`
  - `POST /api/:slug/reiniciar`
- `public/index.html` — página de inicio con enlaces a cada ejercicio.
- `public/ejercicio.html` — interfaz genérica: dibuja un botón por evento
  (o dos botones, "sí"/"no", si el evento tiene guarda) y la tabla de
  historial. Sirve para **cualquier** ejercicio sin cambios de código.

El estado de cada ejercicio vive en memoria (uno por slug), así que sigue
siendo intencionalmente simple: sin usuarios, sesiones ni base de datos.

## Agregar el ejercicio 3 (o el que sigue)
1. Copia `maquinas/torniquete.json` a `maquinas/nombre-del-ejercicio.json`.
2. Cambia `nombre`, `estados`, `eventos`, `guardias` (si aplica) y
   `transiciones` según el enunciado.
3. Reinicia el servidor (o vuelve a desplegar). Aparecerá solo en la
   página de inicio — no hay que tocar nada más.

## Desplegar en Replit
1. Crea un Repl "Node.js" en blanco (o "Import from GitHub" si ya subiste el repo).
2. Sube `server.js`, `package.json`, la carpeta `maquinas/` y la carpeta `public/`.
3. Dale a **Run** — Replit corre `npm start` automáticamente y te da una URL pública.

## Desplegar en Render (gratis)
1. Sube esta carpeta a un repositorio de GitHub.
2. En Render: **New → Web Service** → conecta el repo.
3. Build Command: `npm install` · Start Command: `npm start` · Plan **Free**.
4. Te da una URL tipo `https://tu-app.onrender.com`. En el plan gratis el
   servicio duerme tras 15 min sin uso y tarda ~30s en despertar en la
   primera visita — no afecta el ejercicio.
