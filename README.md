# Máquina de Estados - Ejercicio de Transición de Estados

Servicio mínimo (Node + Express, sin base de datos) para que los estudiantes
practiquen la técnica de caja negra de **transición de estados**.

Ejercicio incluido: **Encendido / Apagado** (2 estados, 2 eventos, 4 transiciones,
2 de ellas inválidas por diseño para que el estudiante las descubra).

## Cómo funciona
- `maquina.json` define estados, eventos y transiciones (válidas e inválidas).
- `server.js` es el único archivo de lógica: sirve el frontend y expone:
  - `GET /estado` — estado actual + historial
  - `POST /evento` — recibe `{ "evento": "encender" }` y aplica la transición
  - `POST /reiniciar` — vuelve al estado inicial
- `public/index.html` es la interfaz: botones para disparar eventos y una
  tabla de historial que el estudiante puede comparar contra su propia
  tabla de casos de prueba (cobertura de transiciones).

El estado vive en memoria (una sola variable global), así que es
intencionalmente simple: no hay usuarios, sesiones ni base de datos.
Si el servicio se reinicia o "duerme" (normal en planes gratuitos), el
estado vuelve al inicial — no afecta el ejercicio.

## Desplegar en Replit (más rápido)
1. Crea un Repl nuevo → "Import from GitHub" (si subiste esto a un repo) o
   "Node.js" en blanco y pega los archivos.
2. Sube/pega `server.js`, `package.json`, `maquina.json` y la carpeta `public/`.
3. Dale a **Run**. Replit detecta `npm start` automáticamente y te da una URL pública.

## Desplegar en Render (gratis, más estable)
1. Sube esta carpeta a un repositorio de GitHub.
2. En Render: **New → Web Service** → conecta el repo.
3. Build Command: `npm install`
   Start Command: `npm start`
4. Plan **Free**. Render te da una URL pública tipo `https://tu-app.onrender.com`.
   (En el plan gratis el servicio "duerme" tras 15 min sin uso; tarda ~30s en
   despertar en la primera visita — no afecta el ejercicio.)

## Cómo reutilizarlo para tus otros ejercicios
No necesitas tocar `server.js` ni el HTML. Para un ejercicio nuevo (ej. cajero
automático, semáforo, login con intentos):
1. Copia `maquina.json` a algo como `maquina-cajero.json` con sus propios
   estados/eventos/transiciones.
2. Cambia la línea `require("./maquina.json")` en `server.js` por el nuevo
   archivo (o crea una carpeta/deploy separado por ejercicio si prefieres
   mantenerlos independientes).

Eso es todo — mismo servidor, mismo frontend, solo cambia el JSON.
