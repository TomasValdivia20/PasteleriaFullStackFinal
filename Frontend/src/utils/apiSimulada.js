// src/utils/apiSimulada.js

const API_URL = "http://localhost:4000/usuarios";

export const registrarUsuario = async (nuevoUsuario) => {
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });

    if (!respuesta.ok) {
      throw new Error("Error al registrar usuario");
    }

    return await respuesta.json();
  } catch (error) {
    console.error("Error en registrarUsuario:", error);
    throw error;
  }
};

export const obtenerUsuarios = async () => {
  try {
    const respuesta = await fetch(API_URL);
    return await respuesta.json();
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};
