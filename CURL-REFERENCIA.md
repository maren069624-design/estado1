# Referencia de API - curl para todos los ejercicios

Reemplaza `BASE_URL` por tu URL real de Render (ej. `https://tu-app.onrender.com`)
o usa `http://localhost:3000` si lo corres en local.

```bash
export BASE_URL="http://localhost:3000"
```

---

## TRANSICIÓN DE ESTADOS

Rutas comunes para cualquier ejercicio (cambia `:slug`):
```bash
curl $BASE_URL/api/ejercicios                      # lista todos los ejercicios
curl $BASE_URL/api/:slug/estado                     # estado actual + historial
curl -X POST $BASE_URL/api/:slug/reiniciar          # reinicia el ejercicio
```

### 1. encendido-apagado
```bash
curl $BASE_URL/api/encendido-apagado/estado

curl -X POST $BASE_URL/api/encendido-apagado/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "encender"}'

curl -X POST $BASE_URL/api/encendido-apagado/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "apagar"}'
```

### 2. torniquete
```bash
curl $BASE_URL/api/torniquete/estado

# Validar Tarjeta - saldo positivo (válida)
curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Validar Tarjeta", "guardia": true}'

# Validar Tarjeta - saldo insuficiente (inválida)
curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Validar Tarjeta", "guardia": false}'

curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Empujar"}'

curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Completar Giro"}'

# Alarma - falla de energía (válida)
curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Alarma", "guardia": true}'

# Alarma - sin falla (inválida)
curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Alarma", "guardia": false}'

curl -X POST $BASE_URL/api/torniquete/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Reparar"}'
```

### 3. barista-bot
```bash
curl $BASE_URL/api/barista-bot/estado

curl -X POST $BASE_URL/api/barista-bot/evento \
  -H "Content-Type: application/json" -d '{"evento": "Iniciar Pedido"}'

curl -X POST $BASE_URL/api/barista-bot/evento \
  -H "Content-Type: application/json" -d '{"evento": "Terminar Molienda"}'

curl -X POST $BASE_URL/api/barista-bot/evento \
  -H "Content-Type: application/json" -d '{"evento": "Alcanzar Temperatura"}'

curl -X POST $BASE_URL/api/barista-bot/evento \
  -H "Content-Type: application/json" -d '{"evento": "Terminar Llenado"}'

curl -X POST $BASE_URL/api/barista-bot/evento \
  -H "Content-Type: application/json" -d '{"evento": "Sin Ingredientes"}'

curl -X POST $BASE_URL/api/barista-bot/evento \
  -H "Content-Type: application/json" -d '{"evento": "Recargar y Reiniciar"}'
```

### 4. iluminacion-teatro
```bash
curl $BASE_URL/api/iluminacion-teatro/estado

curl -X POST $BASE_URL/api/iluminacion-teatro/evento \
  -H "Content-Type: application/json" -d '{"evento": "Encender"}'

curl -X POST $BASE_URL/api/iluminacion-teatro/evento \
  -H "Content-Type: application/json" -d '{"evento": "Iniciar Show"}'

curl -X POST $BASE_URL/api/iluminacion-teatro/evento \
  -H "Content-Type: application/json" -d '{"evento": "Alarma de Humo"}'

curl -X POST $BASE_URL/api/iluminacion-teatro/evento \
  -H "Content-Type: application/json" -d '{"evento": "Fin Emergencia / Reset"}'
```

### 5. lavanderia
```bash
curl $BASE_URL/api/lavanderia/estado

curl -X POST $BASE_URL/api/lavanderia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Cerrar Tapa"}'

curl -X POST $BASE_URL/api/lavanderia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Nivel OK"}'

curl -X POST $BASE_URL/api/lavanderia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Fin Lavado"}'

curl -X POST $BASE_URL/api/lavanderia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Apertura Forzosa"}'

curl -X POST $BASE_URL/api/lavanderia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Reset Operador"}'
```

### 6. reclamos-garantia
```bash
curl $BASE_URL/api/reclamos-garantia/estado

curl -X POST $BASE_URL/api/reclamos-garantia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Asignar Técnico"}'

# Diagnóstico - defecto de fábrica (válida -> Aprobado)
curl -X POST $BASE_URL/api/reclamos-garantia/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Diagnóstico Concluido", "guardia": true}'

# Diagnóstico - daño por mal uso (válida -> Rechazado)
curl -X POST $BASE_URL/api/reclamos-garantia/evento \
  -H "Content-Type: application/json" \
  -d '{"evento": "Diagnóstico Concluido", "guardia": false}'

curl -X POST $BASE_URL/api/reclamos-garantia/evento \
  -H "Content-Type: application/json" -d '{"evento": "Reparar"}'
```

---

## TABLAS DE DECISIÓN

Rutas comunes (cambia `:slug`):
```bash
curl $BASE_URL/api/decisiones                             # lista todos los ejercicios
curl $BASE_URL/api/decision/:slug/definicion               # condiciones + historial
curl -X POST $BASE_URL/api/decision/:slug/reiniciar         # reinicia el historial
```

El body de `/evaluar` siempre es `{"valores": [bool, bool, bool]}`, en el
mismo orden en que aparecen las condiciones (usa `/definicion` para
confirmar el orden de cada ejercicio).

### 1. dron-agricola
Condiciones: `[Viento > 40km/h, Batería < 15%, Obstáculo < 2m]`
```bash
curl $BASE_URL/api/decision/dron-agricola/definicion

# Solo obstáculo -> Esquive de emergencia
curl -X POST $BASE_URL/api/decision/dron-agricola/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, true]}'

# Solo viento -> Abortar/RTL
curl -X POST $BASE_URL/api/decision/dron-agricola/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, false, false]}'

# Solo batería baja -> Abortar/RTL
curl -X POST $BASE_URL/api/decision/dron-agricola/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, true, false]}'

# Nada -> Continuar ruta
curl -X POST $BASE_URL/api/decision/dron-agricola/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, false]}'
```

### 2. climatizacion
Condiciones: `[Temp > 26°C, Presencia activa, Ventanas abiertas > 3 min]`
```bash
curl $BASE_URL/api/decision/climatizacion/definicion

# Ventanas abiertas (domina todo) -> Apagar + alerta
curl -X POST $BASE_URL/api/decision/climatizacion/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, true, true]}'

# Temp alta + presencia, ventanas cerradas -> Encender A/C
curl -X POST $BASE_URL/api/decision/climatizacion/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, true, false]}'

# Temp alta, sin presencia -> Bajo consumo
curl -X POST $BASE_URL/api/decision/climatizacion/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, false, false]}'

# Temp normal/fría -> Sistema apagado
curl -X POST $BASE_URL/api/decision/climatizacion/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, false]}'
```

### 3. invernadero
Condiciones: `[Sustrato seco, pH ácido, Riesgo de heladas]`
```bash
curl $BASE_URL/api/decision/invernadero/definicion

# Riesgo de heladas (domina todo) -> Calefactores + suspender riego
curl -X POST $BASE_URL/api/decision/invernadero/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, true, true]}'

# Seco + pH correcto -> Riego automático
curl -X POST $BASE_URL/api/decision/invernadero/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, false, false]}'

# Seco + pH alterado -> Bloquear riego + neutralizar pH
curl -X POST $BASE_URL/api/decision/invernadero/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, true, false]}'

# Humedad óptima -> En espera
curl -X POST $BASE_URL/api/decision/invernadero/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, false]}'
```

### 4. moderacion-foro
Condiciones: `[Insultos graves, 3+ advertencias, Enlaces sospechosos]`
```bash
curl $BASE_URL/api/decision/moderacion-foro/definicion

# 3+ advertencias (domina todo, incluso insultos) -> Baneo permanente
curl -X POST $BASE_URL/api/decision/moderacion-foro/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, true, false]}'

# Solo insultos graves -> Eliminar + suspensión 24h
curl -X POST $BASE_URL/api/decision/moderacion-foro/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, false, false]}'

# Solo enlaces sospechosos -> Ocultar + advertencia
curl -X POST $BASE_URL/api/decision/moderacion-foro/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, true]}'

# Mensaje limpio -> Publicar normal
curl -X POST $BASE_URL/api/decision/moderacion-foro/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, false]}'
```

### 5. equipaje
Condiciones: `[Excede peso 23kg, Excede dimensiones, Tarifa Preferencial Plus]`
```bash
curl $BASE_URL/api/decision/equipaje/definicion

# Excede dimensiones (domina todo, incluso tarifa) -> Bloquear + bodega
curl -X POST $BASE_URL/api/decision/equipaje/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, true, true]}'

# Excede peso + tarifa Preferencial Plus -> Aprobar con sobrepeso autorizado
curl -X POST $BASE_URL/api/decision/equipaje/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, false, true]}'

# Excede peso + tarifa estándar -> Bloquear + cobro
curl -X POST $BASE_URL/api/decision/equipaje/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [true, false, false]}'

# Cumple peso y dimensiones -> Paso directo
curl -X POST $BASE_URL/api/decision/equipaje/evaluar \
  -H "Content-Type: application/json" -d '{"valores": [false, false, false]}'
```
