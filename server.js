const express = require("express");
const path = require("path");
const maquina = require("./maquina.json");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Estado actual en memoria (reinicia si el servicio se reinicia/duerme)
let estadoActual = maquina.estadoInicial;
let historial = [];

// GET /estado -> estado actual + info de la máquina (para pintar el diagrama)
app.get("/estado", (req, res) => {
  res.json({
    estadoActual,
    historial,
    maquina: {
      nombre: maquina.nombre,
      estados: maquina.estados,
      eventos: maquina.eventos,
    },
  });
});

// POST /evento { evento: "encender" } -> aplica la transición
app.post("/evento", (req, res) => {
  const { evento } = req.body;

  if (!maquina.eventos.includes(evento)) {
    return res.status(400).json({ error: `Evento desconocido: ${evento}` });
  }

  const transicion = maquina.transiciones.find(
    (t) => t.desde === estadoActual && t.evento === evento
  );

  const estadoAnterior = estadoActual;

  if (transicion) {
    estadoActual = transicion.hasta;
    historial.push({
      estadoAnterior,
      evento,
      estadoNuevo: estadoActual,
      valida: transicion.valida,
    });
    return res.json({
      estadoAnterior,
      evento,
      estadoNuevo: estadoActual,
      valida: transicion.valida,
    });
  }

  // No hay transición definida para ese par (estado, evento)
  historial.push({
    estadoAnterior,
    evento,
    estadoNuevo: estadoActual,
    valida: false,
    noDefinida: true,
  });
  res.json({
    estadoAnterior,
    evento,
    estadoNuevo: estadoActual,
    valida: false,
    noDefinida: true,
  });
});

// POST /reiniciar -> vuelve al estado inicial y limpia el historial
app.post("/reiniciar", (req, res) => {
  estadoActual = maquina.estadoInicial;
  historial = [];
  res.json({ estadoActual });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
