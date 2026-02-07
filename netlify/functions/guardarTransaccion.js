// netlify/functions/guardarTransaccion.js
import { neon } from "@netlify/neon";

export const handler = async (event) => {
  const sql = neon(); // usa la variable NETLIFY_DATABASE_URL automáticamente

  try {
    // Recibe los datos enviados desde el frontend
    const datos = JSON.parse(event.body || "{}");

    // Inserta la transacción en Neon
    await sql`
      INSERT INTO transactions (nom, quantitat, pais_origen, pais_desti, tipus)
      VALUES (${datos.nom}, ${datos.quantitat}, ${datos.paisOrigen}, ${datos.paisDesti}, ${datos.tipus})
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({
        mensaje: "Transacción guardada en Neon correctamente",
        datosRecibidos: datos
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error guardando la transacción en Neon" })
    };
  }
};
