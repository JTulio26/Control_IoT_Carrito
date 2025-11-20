let movimientosSeleccionados = [];

function agregarMovimiento() {
  const select = document.getElementById("selectMovimiento");
  const id = parseInt(select.value);
  movimientosSeleccionados.push(id);
  renderMovimientos();
}

function moverMovimiento(index, direccion) {
  const nuevaPos = index + direccion;
  if (nuevaPos < 0 || nuevaPos >= movimientosSeleccionados.length) return;
  [movimientosSeleccionados[index], movimientosSeleccionados[nuevaPos]] =
    [movimientosSeleccionados[nuevaPos], movimientosSeleccionados[index]];
  renderMovimientos();
}

function eliminarMovimiento(index) {
  movimientosSeleccionados.splice(index, 1);
  renderMovimientos();
}

function renderMovimientos() {
  const lista = document.getElementById("listaMovimientos");
  lista.innerHTML = "";
  movimientosSeleccionados.forEach((mov, index) => {
    lista.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Movimiento ${mov}</span>
        <div>
          <button class="btn btn-sm btn-warning" onclick="moverMovimiento(${index}, -1)">↑</button>
          <button class="btn btn-sm btn-warning" onclick="moverMovimiento(${index}, 1)">↓</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarMovimiento(${index})">X</button>
        </div>
      </li>
    `;
  });
}

async function guardarSecuencia() {
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!nombre || !descripcion || movimientosSeleccionados.length === 0) {
    alert("Completa todos los campos y agrega movimientos.");
    return;
  }

  const payload = { nombre, descripcion, movimientos: movimientosSeleccionados };

  try {
    const res = await fetch("http://18.204.20.70:5000/api/secuencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Secuencia creada correctamente.");
      movimientosSeleccionados = [];
      renderMovimientos();
      document.getElementById("nombre").value = "";
      document.getElementById("descripcion").value = "";
      loadSequences();
    } else {
      alert("Error al crear secuencia.");
    }
  } catch (err) {
    console.error(err);
    alert("Error al conectar con el servidor.");
  }
}

async function ejecutarSecuencia(idSecuencia) {
  try {
    const payload = { id_secuencia: idSecuencia, id_dispositivo: 1 };
    const res = await fetch("http://18.204.20.70:5000/api/secuencias/repetir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert(`Secuencia ${idSecuencia} ejecutada correctamente.`);
    } else {
      alert("Error al ejecutar secuencia.");
    }
  } catch (err) {
    console.error(err);
    alert("Error al conectar con el servidor.");
  }
}

async function loadSequences() {
  const table = document.getElementById("sequences-table");
  try {
    const res = await fetch("http://18.204.20.70:5000/api/secuencias/completas");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      table.innerHTML = `<tr><td colspan="4">Sin datos</td></tr>`;
      return;
    }
    table.innerHTML = data.map(seq => `
      <tr>
        <td>${seq.id_secuencia}</td>
        <td>${seq.nombre_secuencia}</td>
        <td>${seq.movimientos}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="ejecutarSecuencia(${seq.id_secuencia})">Ejecutar</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
    table.innerHTML = `<tr><td colspan="4">Error al cargar datos</td></tr>`;
  }
}

loadSequences();

// ===== Monitoreo de obstáculos vía WebSocket =====
const ws = new WebSocket("ws://18.204.20.70:5500");

ws.onopen = () => console.log("Conectado al WebSocket de obstáculos");
ws.onclose = () => console.log("Desconectado del WebSocket");
ws.onerror = err => console.error("Error WebSocket:", err);

ws.onmessage = (msg) => {
  try {
    const data = JSON.parse(msg.data);
    if (data.event === "nuevo_obstaculo") {
      document.getElementById("obst-fecha").textContent = data.fecha_evento || "--";
      document.getElementById("obst-tipo").textContent = data.obstaculo_detectado || "--";
      document.getElementById("obst-movimiento").textContent = data.movimiento_realizado || "--";
    }
  } catch (err) {
    console.error("Error al procesar mensaje WS:", err);
  }
};
