const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Carga automática de todos los ejercicios definidos en /maquinas
// Cada archivo .json = un ejercicio. El nombre del archivo (sin extensión) es el "slug" de la URL.
const maquinasDir = path.join(__dirname, "maquinas");
const maquinas = {};          // slug -> definición leída del JSON
const estadoPorMaquina = {};  // slug -> { estadoActual, historial }

fs.readdirSync(maquinasDir)
  .filter((f) => f.endsWith(".json"))
  .forEach((archivo) => {
    const slug = archivo.replace(".json", "");
    const definicion = JSON.parse(fs.readFileSync(path.join(maquinasDir, archivo), "utf-8"));
    maquinas[slug] = definicion;
    estadoPorMaquina[slug] = { estadoActual: definicion.estadoInicial, historial: [] };
  });

function requireMaquina(req, res, next) {
  if (!maquinas[req.params.slug]) {
    return res.status(404).json({ error: `Ejercicio no encontrado: ${req.params.slug}` });
  }
  next();
}

// Carga automática de ejercicios de TABLAS DE DECISIÓN desde /decisiones
// Cada archivo .json = un ejercicio: condiciones, acciones y reglas (con null = "no importa")
const decisionesDir = path.join(__dirname, "decisiones");
const decisiones = {};           // slug -> definición leída del JSON
const historialPorDecision = {}; // slug -> historial de casos evaluados

if (fs.existsSync(decisionesDir)) {
  fs.readdirSync(decisionesDir)
    .filter((f) => f.endsWith(".json"))
    .forEach((archivo) => {
      const slug = archivo.replace(".json", "");
      const definicion = JSON.parse(fs.readFileSync(path.join(decisionesDir, archivo), "utf-8"));
      decisiones[slug] = definicion;
      historialPorDecision[slug] = [];
    });
}

function requireDecision(req, res, next) {
  if (!decisiones[req.params.slug]) {
    return res.status(404).json({ error: `Ejercicio no encontrado: ${req.params.slug}` });
  }
  next();
}

// GET /api/ejercicios -> lista de ejercicios disponibles (para la página de inicio)
app.get("/api/ejercicios", (req, res) => {
  const lista = Object.entries(maquinas).map(([slug, m]) => ({ slug, nombre: m.nombre }));
  res.json(lista);
});

// GET /api/:slug/estado -> estado actual + historial + definición de la máquina
app.get("/api/:slug/estado", requireMaquina, (req, res) => {
  const maquina = maquinas[req.params.slug];
  const estado = estadoPorMaquina[req.params.slug];
  res.json({
    estadoActual: estado.estadoActual,
    historial: estado.historial,
    maquina: {
      nombre: maquina.nombre,
      estados: maquina.estados,
      eventos: maquina.eventos,
      guardias: maquina.guardias || {},
    },
  });
});

// POST /api/:slug/evento  body: { evento, guardia? } -> aplica la transición
app.post("/api/:slug/evento", requireMaquina, (req, res) => {
  const { slug } = req.params;
  const { evento, guardia } = req.body;
  const maquina = maquinas[slug];
  const estado = estadoPorMaquina[slug];

  if (!maquina.eventos.includes(evento)) {
    return res.status(400).json({ error: `Evento desconocido: ${evento}` });
  }

  const guardiaNormalizada = guardia === undefined ? null : guardia;

  const transicion = maquina.transiciones.find((t) => {
    if (t.desde !== estado.estadoActual || t.evento !== evento) return false;
    if (t.guardia === null || t.guardia === undefined) return true;
    return t.guardia === guardiaNormalizada;
  });

  const estadoAnterior = estado.estadoActual;
  let resultado;

  if (transicion) {
    estado.estadoActual = transicion.hasta;
    resultado = {
      estadoAnterior,
      evento,
      guardia: guardiaNormalizada,
      estadoNuevo: estado.estadoActual,
      valida: transicion.valida,
      accion: transicion.accion || null,
    };
  } else {
    // Par (estado, evento[, guardia]) sin transición definida en el ejercicio
    resultado = {
      estadoAnterior,
      evento,
      guardia: guardiaNormalizada,
      estadoNuevo: estado.estadoActual,
      valida: false,
      noDefinida: true,
    };
  }

  estado.historial.push(resultado);
  res.json(resultado);
});

// POST /api/:slug/reiniciar -> vuelve al estado inicial y limpia el historial
app.post("/api/:slug/reiniciar", requireMaquina, (req, res) => {
  const { slug } = req.params;
  estadoPorMaquina[slug] = { estadoActual: maquinas[slug].estadoInicial, historial: [] };
  res.json({ estadoActual: estadoPorMaquina[slug].estadoActual });
});

// GET /api/decisiones -> lista de ejercicios de tablas de decisión disponibles
app.get("/api/decisiones", (req, res) => {
  const lista = Object.entries(decisiones).map(([slug, d]) => ({ slug, nombre: d.nombre }));
  res.json(lista);
});

// GET /api/decision/:slug/definicion -> condiciones, acciones e historial (no se expone la tabla de reglas: el estudiante debe deducirla probando)
app.get("/api/decision/:slug/definicion", requireDecision, (req, res) => {
  const def = decisiones[req.params.slug];
  res.json({
    nombre: def.nombre,
    condiciones: def.condiciones,
    historial: historialPorDecision[req.params.slug],
    totalReglas: def.reglas.length,
  });
});

// POST /api/decision/:slug/evaluar  body: { valores: [true, false, true, ...] } en el mismo orden que "condiciones"
app.post("/api/decision/:slug/evaluar", requireDecision, (req, res) => {
  const { slug } = req.params;
  const def = decisiones[slug];
  const { valores } = req.body;

  if (!Array.isArray(valores) || valores.length !== def.condiciones.length) {
    return res.status(400).json({ error: `Se esperaban ${def.condiciones.length} valores booleanos` });
  }

  const indiceRegla = def.reglas.findIndex((regla) =>
    regla.valores.every((v, i) => v === null || v === valores[i])
  );

  const resultado = {
    valores,
    accion: indiceRegla >= 0 ? def.reglas[indiceRegla].accion : null,
    reglaIndex: indiceRegla >= 0 ? indiceRegla : null,
    noDefinida: indiceRegla < 0,
  };

  historialPorDecision[slug].push(resultado);
  res.json(resultado);
});

// POST /api/decision/:slug/reiniciar -> limpia el historial de casos probados
app.post("/api/decision/:slug/reiniciar", requireDecision, (req, res) => {
  historialPorDecision[req.params.slug] = [];
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  console.log(`Ejercicios de transición de estados: ${Object.keys(maquinas).join(", ")}`);
  console.log(`Ejercicios de tablas de decisión: ${Object.keys(decisiones).join(", ")}`);
});
