const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSejXPG6m6vhW8RbLys5jFlI3rA25JX-0UF3rcCcrqh81v4s3zHQtIKDBb9fEsoEOl1i8-sDcCOOzcN/pub?output=xlsx";

let dadesSAR = [];

function generarSAR(index) {
  const any = new Date().getFullYear();
  return `SAR-${any}-${String(index + 1).padStart(4, "0")}`;
}

function calcularRisc(importEuro) {
  if (importEuro > 50000) return "Alt risc";
  if (importEuro > 10000) return "Mitjà risc";
  return "Baix risc";
}

async function carregarSAR() {
  const estat = document.getElementById("estat");
  const tbody = document.querySelector("#taula-sar tbody");

  estat.textContent = "⏳ Carregant dades...";

  try {
    const res = await fetch(SHEET_URL);
    const blob = await res.blob();
    const data = await blob.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dades = XLSX.utils.sheet_to_json(sheet);

    tbody.innerHTML = "";
    dadesSAR = [];

    const comptador = {};
    dades.forEach(f => {
      const nom = f.Nom || "Desconegut";
      comptador[nom] = (comptador[nom] || 0) + 1;
    });

    dades.forEach((fila, index) => {
      const nom = fila.Nom || "—";
      const importEuro = parseFloat(fila.Quantitat) || 0;
      const sar = generarSAR(index);
      const risc = calcularRisc(importEuro);
      const pep = comptador[nom] > 3 ? "Sí" : "No";

      dadesSAR.push({
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
      });

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

    estat.textContent = "✅ Informe SAR generat correctament";

  } catch (error) {
    console.error(error);
    estat.textContent = "❌ Error carregant Formulari 2";
  }
}

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
    doc.text(`PEP: ${dada.pep}`, 18, y); y += 8;

    doc.text("3. Detalls de la transacció:", 14, y); y += 6;
    doc.text(`Tipus operació: ${dada.tipusTransaccio}`, 18, y); y += 6;
    doc.text(`Import: ${dada.importEuro} ${dada.moneda}`, 18, y); y += 6;
    doc.text(`País origen: ${dada.paisOrigen}`, 18, y); y += 6;
    doc.text(`País destí: ${dada.paisDesti}`, 18, y); y += 8;

    doc.text("4. Motiu de la sospita:", 14, y); y += 6;
    doc.text("Operació superior als llindars AML definits.", 18, y); y += 10;

    if (i < dadesSAR.length - 1) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("Informe_SAR_SEPBLAC.pdf");
});

carregarSAR();
