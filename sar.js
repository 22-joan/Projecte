// -------------------------
// Variables y URLs
// -------------------------
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSejXPG6m6vhW8RbLys5jFlI3rA25JX-0UF3rcCcrqh81v4s3zHQtIKDBb9fEsoEOl1i8-sDcCOOzcN/pub?output=xlsx";
const BACKEND_URL = "https://cheery-donut-456e7d.netlify.app/.netlify/functions/guardarTransaccion";

let dadesSAR = [];

// -------------------------
// Funciones auxiliares
// -------------------------
function generarSAR(index) {
  const any = new Date().getFullYear();
  return `SAR-${any}-${String(index + 1).padStart(4, "0")}`;
}

function calcularRisc(importEuro) {
  if (importEuro > 50000) return "Alt risc";
  if (importEuro > 10000) return "Mitjà risc";
  return "Baix risc";
}

// -------------------------
// Enviar una transacción al backend
// -------------------------
async function enviarTransaccion(datos) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const data = await res.json();
    console.log("Backend dice:", data);
  } catch (err) {
    console.error("Error enviando datos:", err);
  }
}

// -------------------------
// Cargar datos de Google Sheets y mostrar en tabla
// -------------------------
async function cargarSARdeExcel() {
  const estat = document.getElementById("estat");
  const tbody = document.querySelector("#taula-sar tbody");

  estat.textContent = "⏳ Cargando datos de Sheets...";

  try {
    const res = await fetch(SHEET_URL);
    const blob = await res.blob();
    const data = await blob.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(sheet);

    tbody.innerHTML = "";
    dadesSAR = [];

    const comptador = {};
    datos.forEach(f => {
      const nom = f.Nom || "Desconegut";
      comptador[nom] = (comptador[nom] || 0) + 1;
    });

    datos.forEach((fila, index) => {
      const nom = fila.Nom || "—";
      const importEuro = parseFloat(fila.Quantitat) || 0;
      const sar = generarSAR(index);
      const risc = calcularRisc(importEuro);
      const pep = comptador[nom] > 3 ? "Sí" : "No";

      const registro = {
        sar,
        nom,
        importEuro,
        risc,
        pep,
        dni: fila["Numero identitat DNI / Passaport"] || "—",
        adreca: fila["Adreça client"] || "—",
        contacte: fila["Contacte client"] || "—",
        moneda: fila["Divisa"] || "—",
        paisOrigen: fila["Pais Origen"] || "—",
        paisDesti: fila["Pais Desti"] || "—",
        tipusTransaccio: fila["Tipus de Transacció"] || "—"
      };

      dadesSAR.push(registro);

      // Tabla HTML
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sar}</td>
        <td>${nom}</td>
        <td>${importEuro.toLocaleString()} €</td>
        <td>${risc}</td>
        <td>${pep}</td>
      `;
      tbody.appendChild(tr);
    });

    estat.textContent = "✅ Datos de Sheets cargados correctamente";

  } catch (error) {
    console.error(error);
    estat.textContent = "❌ Error cargando Sheets";
  }
}

// -------------------------
// Formulario para nuevas transacciones
// -------------------------
document.getElementById("form-transaccion").addEventListener("submit", (e) => {
  e.preventDefault();

  const datos = {
    nom: document.getElementById("nombre").value,
    quantitat: parseFloat(document.getElementById("cantidad").value),
    paisOrigen: document.getElementById("paisOrigen").value,
    paisDesti: document.getElementById("paisDesti").value,
    tipus: document.getElementById("tipo").value
  };

  // Agregar localmente
  const sar = generarSAR(dadesSAR.length);
  const risc = calcularRisc(datos.quantitat);
  const registro = {
    sar,
    nom: datos.nom,
    importEuro: datos.quantitat,
    risc,
    pep: "No",
    dni: "—",
    adreca: "—",
    contacte: "—",
    moneda: "EUR",
    paisOrigen: datos.paisOrigen,
    paisDesti: datos.paisDesti,
    tipusTransaccio: datos.tipus
  };
  dadesSAR.push(registro);

  // Actualizar tabla en HTML
  const tbody = document.querySelector("#taula-sar tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${registro.sar}</td>
    <td>${registro.nom}</td>
    <td>${registro.importEuro.toLocaleString()} €</td>
    <td>${registro.risc}</td>
    <td>${registro.pep}</td>
  `;
  tbody.appendChild(tr);

  // Enviar al backend
  enviarTransaccion(datos);

  // Reset formulario
  e.target.reset();
});

// -------------------------
// Descargar PDF
// -------------------------
document.getElementById("descarregarPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  dadesSAR.forEach((dada, i) => {
    doc.setFontSize(11);
    doc.text(`0. Nº SAR: ${dada.sar}`, 14, y); y += 8;

    doc.text("1. Dades de l'entitat informant:", 14, y); y += 6;
    doc.text("Nom de l'entitat: ____________________", 18, y); y += 6;
    doc.text(`Persona contacte / MLRO: ${dada.contacte}`, 18, y); y += 8;

    doc.text("2. Dades del client:", 14, y); y += 6;
    doc.text(`Nom: ${dada.nom}`, 18, y); y += 6;
    doc.text(`DNI/NIE/Passaport: ${dada.dni}`, 18, y); y += 6;
    doc.text(`Adreça: ${dada.adreca}`, 18, y); y += 6;
    doc.text(`Categoria de risc: ${dada.risc}`, 18, y); y += 6;
    doc.text(`PEP: ${dada.pep}`, 18, y) ; y += 8;

    doc.text("3. Detalls de la transacció:", 14, y); y += 6;
    doc.text(`Tipus operació: ${dada.tipusTransaccio}`, 18, y); y += 6;
    doc.text(`Import: ${dada.importEuro} ${dada.moneda}`, 18, y); y += 6;
    doc.text(`País origen: ${dada.paisOrigen}`, 18, y) ; y += 6;
    doc.text(`País destí: ${dada.paisDesti}`, 18, y) += 8;

    doc.text("4. Motiu de la sospita:", 14, y); y += 6;
    doc.text("Operació superior als llindars AML definits.", 18, y); y += 10;

    if (i < dadesSAR.length - 1) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("Informe_SAR_SEPBLAC.pdf");
});

// -------------------------
// Inicialización
// -------------------------
cargarSARdeExcel();
