// URL de hoja de Google Sheets
const url = "https://opensheet.elk.sh/1mEB2nrolceJJD8Bu6HrvMNh19CTzYLlSXxbH8ckIjP4/Respuestas%20de%20formulario%201";

async function cargarDatos() {
  const estado = document.getElementById("estado");
  const tablaBody = document.querySelector("#tabla-datos tbody");
  estado.textContent = "⏳ Cargando datos...";

  try {
    const res = await fetch(url);
    const datos = await res.json();

    tablaBody.innerHTML = "";

    datos.forEach(fila => {
      const tr = document.createElement("tr");
      const marcaTemporal = fila["Marca temporal"] || "—";
      const nom = fila.Nom || "—";
      const quantitat = fila.Quantitat || "—";
      const tipus = fila["Tipus de Transacció"] || "—";

      tr.innerHTML = `
        <td>${marcaTemporal}</td>
        <td>${nom}</td>
        <td>${quantitat}</td>
        <td>${tipus}</td>
      `;
      tablaBody.appendChild(tr);
    });

    estado.textContent = "✅ Datos actualizados: " + new Date().toLocaleTimeString();
  } catch (err) {
    console.error("Error al cargar datos:", err);
    estado.textContent = "❌ Error al cargar datos.";
  }
}

// Cargar al inicio y actualizar cada 30 segundos
cargarDatos();
setInterval(cargarDatos, 30000);

// Botón de cierre de sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
});
