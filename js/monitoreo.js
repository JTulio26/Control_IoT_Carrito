const movimientosMap = {
  1: "Adelante", 2: "Atrás", 3: "Detener",
  4: "Vuelta adelante derecha", 5: "Vuelta adelante izquierda",
  6: "Vuelta atrás derecha", 7: "Vuelta atrás izquierda",
  8: "Giro 90° derecha", 9: "Giro 90° izquierda",
  10: "Giro 360° derecha", 11: "Giro 360° izquierda"
};

const ws = new WebSocket("ws://18.204.20.70:5500");

ws.onopen = () => console.log("WebSocket conectado");
ws.onclose = () => console.log("WebSocket desconectado");
ws.onerror = err => console.error("Error WS:", err);

ws.onmessage = (msg) => {
  try {
    const data = JSON.parse(msg.data);
    if(data.event === "nuevo_movimiento") {
      document.getElementById("mov-fecha").textContent = data.fecha_evento;
      document.getElementById("mov-nombre").textContent = movimientosMap[data.id_movimiento] || data.id_movimiento;
      loadUltimosMovimientos();
    }
    if(data.event === "nuevo_obstaculo") {
      document.getElementById("obst-fecha").textContent = data.fecha_evento;
      document.getElementById("obst-tipo").textContent = data.obstaculo_detectado;
      document.getElementById("obst-movimiento").textContent = data.movimiento_realizado;
      loadUltimosObstaculos();
    }
  } catch(e) {
    console.error("Error WS:", e);
  }
};

async function loadUltimosMovimientos() {
  try {
    const res = await fetch("http://18.204.20.70:5000/api/movimientos/ultimos");
    const data = await res.json();
    document.getElementById("table-movimientos").innerHTML = data.slice(0,10).map(mov => `
      <tr>
        <td>${mov.fecha_evento}</td>
        <td>${movimientosMap[mov.id_movimiento] || mov.id_movimiento}</td>
      </tr>
    `).join("");
  } catch(e) { console.error(e); }
}

async function loadUltimosObstaculos() {
  try {
    const res = await fetch("http://18.204.20.70:5000/api/obstaculos/ultimos");
    const data = await res.json();
    document.getElementById("table-obstaculos").innerHTML = data.slice(0,10).map(ob => `
      <tr>
        <td>${ob.fecha_evento}</td>
        <td>${ob.obstaculo_detectado}</td>
        <td>${ob.movimiento_realizado}</td>
      </tr>
    `).join("");
  } catch(e) { console.error(e); }
}

// Inicializar tablas
loadUltimosMovimientos();
loadUltimosObstaculos();
