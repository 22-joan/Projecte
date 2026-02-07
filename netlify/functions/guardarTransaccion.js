import { neon } from '@netlify/neon';

const sql = neon(); // usa automáticamente NETLIFY_DATABASE_URL

export const handler = async (event) => {
  try {
    const datos = JSON.parse(event.body);

    await sql`
      INSERT INTO transactions (nom, quantitat, pais_origen, pais_desti, tipus)
      VALUES (${datos.nom}, ${datos.quantitat}, ${datos.paisOrigen}, ${datos.paisDesti}, ${datos.tipus})
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ mensaje: "Transacción guardada en BD", datosRecibidos: datos })
    };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error guardando en BD" }) };
  }
};
