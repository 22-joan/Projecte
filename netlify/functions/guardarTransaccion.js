exports.handler = async (event) => {
  try {
    const datos = JSON.parse(event.body || "{}");

    return {
      statusCode: 200,
      body: JSON.stringify({
        mensaje: "Backend funcionando correctamente",
        datosRecibidos: datos
      })
    };

  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Error en la función backend"
      })
    };
  }
};

