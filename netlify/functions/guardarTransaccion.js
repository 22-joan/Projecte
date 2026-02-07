import { neon } from '@netlify/neon';

export const handler = async (event) => {
  try {
    const datos = JSON.parse(event.body || "{}");

    const sql = neon(); // usa automáticamente NETLIFY_DATABASE_URL

    // Crear tabla si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS transacciones(
        id SERIAL PRIMARY KEY,
        nom TEXT NOT NULL,
        quantitat NUMERIC NOT NULL,
        pais_origen TEXT,
        pais_desti TEXT,
        tipus TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insertar los datos recibidos
    await sql`
      INSERT INTO transacciones(nom, quantitat, pais_origen, pais_desti, tipus)
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error guardando en Neon", detalle: error.message })
    };
  }
};
