# Ejercicios de Pruebas de Caja Negra

Un solo servicio (Node + Express, sin base de datos) que aloja ejercicios
de dos técnicas de caja negra: **transición de estados** y **tablas de
decisión**. Cada ejercicio es un archivo JSON — no hay que tocar el
servidor ni el frontend para agregar uno nuevo, sea del tipo que sea.

## Transición de Estados (`/maquinas/*.json`)
- `encendido-apagado` — 2 estados, ejercicio introductorio.
- `torniquete` — 4 estados, con eventos guardados (`Validar Tarjeta [Saldo Positivo]`,
  `Alarma [Falla de Energía]`), ideal para que el estudiante distinga
  casos de prueba positivos vs. negativos sobre la misma transición.
- `barista-bot`, `iluminacion-teatro`, `lavanderia`, `reclamos-garantia` — más ejercicios,
  cada uno con sus propias particularidades (eventos reutilizados, overrides de prioridad, etc).

## Tablas de Decisión (`/decisiones/*.json`)
- `dron-agricola` — 3 condiciones booleanas, tabla reducida con comodines (`null` = "no importa").

Cada archivo define `condiciones` (lista de textos), `acciones` (lista de
textos) y `reglas` (combinaciones de condiciones → acción; usa `null` en
`valores` para "no importa esa condición", útil para tablas reducidas).
El motor evalúa las reglas en orden y aplica la primera que coincida.

## Cómo funciona
**Transición de estados:**
- `maquinas/*.json` — cada archivo define un ejercicio: estados, eventos,
  guardas (opcional) y transiciones (con `valida: true/false`).
- `server.js` carga todos los JSON de `/maquinas` al arrancar y expone,
  por cada uno (usando el nombre del archivo como slug):
  - `GET /api/ejercicios` — lista de ejercicios (para la página de inicio)
  - `GET /api/:slug/estado` — estado actual + historial
  - `POST /api/:slug/evento` — body `{ "evento": "...", "guardia": true|false|null }`
  - `POST /api/:slug/reiniciar`
- `public/ejercicio.html` — interfaz genérica: un botón por evento (o dos,
  "sí"/"no", si tiene guarda) y la tabla de historial.

**Tablas de decisión:**
- `decisiones/*.json` — cada archivo define `condiciones`, `acciones` y
  `reglas` (arreglo `valores` de `true/false/null` + `accion`; `null` = "no importa").
- Rutas: `GET /api/decisiones`, `GET /api/decision/:slug/definicion`,
  `POST /api/decision/:slug/evaluar` (body `{ "valores": [true, false, ...] }`),
  `POST /api/decision/:slug/reiniciar`.
- `public/decision.html` — un checkbox por condición, botón "Evaluar", y
  tabla de historial con cobertura de reglas (cuántas de las reglas
  definidas ya se probaron).

`public/index.html` lista ambos tipos de ejercicio en dos secciones.
Todo el estado vive en memoria (uno por slug), así que sigue siendo
intencionalmente simple: sin usuarios, sesiones ni base de datos.

## Agregar un ejercicio nuevo
**De transición de estados:** copia cualquier archivo de `/maquinas` a
`maquinas/nombre-del-ejercicio.json` y ajusta `estados`, `eventos`,
`guardias` y `transiciones`.

**De tabla de decisión:** copia `decisiones/dron-agricola.json` a
`decisiones/nombre-del-ejercicio.json` y ajusta `condiciones`, `acciones`
y `reglas`.

En ambos casos: reinicia el servidor (o vuelve a desplegar) y el
ejercicio aparece solo en la página de inicio — no hay que tocar nada más.

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
