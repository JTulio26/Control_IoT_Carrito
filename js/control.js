/* ===== MAPEOS ===== */
const movimientosTexto = {
  1: "Adelante",
  2: "Atrás",
  3: "Detener",
  4: "Vuelta adelante derecha",
  5: "Vuelta adelante izquierda",
  6: "Vuelta atrás derecha",
  7: "Vuelta atrás izquierda",
  8: "Giro 90° derecha",
  9: "Giro 90° izquierda",
  10: "Giro 360° derecha",
  11: "Giro 360° izquierda"
};

/* ===== ENVIAR MOVIMIENTO ===== */
function enviarMovimiento(id) {
  fetch("http://18.204.20.70:5000/api/movimientos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_dispositivo: 1, id_movimiento: id, estatus: "Ejecutado" })
  })
  .then(r => r.json())
  .then(data => console.log("Movimiento enviado:", data))
  .catch(err => console.error("Error enviando movimiento:", err));
}

/* ===== DETENER MOVIMIENTO ===== */
function detenerMovimiento() {
  enviarMovimiento(3);
}

/* ===== ENVIAR VELOCIDAD ===== */
function enviarVelocidad(idVel) {
  fetch("http://18.204.20.70:5000/api/velocidad/actual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_velocidad: idVel })
  })
  .then(r => r.json())
  .then(data => console.log("Velocidad enviada:", data))
  .catch(err => console.error("Error enviando velocidad:", err));
}

/* ========= WEBSOCKET ========= */
const ws = new WebSocket("ws://18.204.20.70:5500");

ws.onmessage = (msg) => {
  let data;
  try { data = JSON.parse(msg.data); } catch { return; }

  if (data.event === "nuevo_movimiento") {
    document.getElementById("monitorMovimiento").innerHTML = `
      <div><span class="tag">Movimiento:</span> ${movimientosTexto[data.id_movimiento] || "Desconocido"}</div>
      <div><span class="tag">Fecha:</span> ${data.fecha_evento}</div>
    `;
  }

  if (data.event === "nuevo_obstaculo") {
    document.getElementById("monitorObstaculo").innerHTML = `
      <div><span class="tag">Obstáculo:</span> ${data.obstaculo_detectado}</div>
      <div><span class="tag">Movimiento:</span> ${data.movimiento_realizado}</div>
      <div><span class="tag">Fecha:</span> ${data.fecha_evento}</div>
    `;
  }
};
