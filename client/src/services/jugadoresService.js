import { loadJugadores, crearJugador as crearJugadorApi, buscarJugadores as buscarJugadoresApi } from './store.js';

export async function obtenerJugadores() {
  return loadJugadores();
}

export async function buscarJugadores(criterio) {
  return buscarJugadoresApi(criterio);
}

// RF01: nombre, gamertag y correo obligatorios; gamertag y correo únicos.
export async function crearJugador({ nombre, gamertag, correo }) {
  if (!nombre?.trim() || !gamertag?.trim() || !correo?.trim()) {
    return { success: false, error: 'Nombre, gamertag y correo son obligatorios.' };
  }

  try {
    const data = await crearJugadorApi({
      nombre: nombre.trim(),
      gamertag: gamertag.trim(),
      correo: correo.trim(),
    });
    // El backend responde {id_registrado, mensaje}. Reconstruimos el jugador
    // para que la UI pueda usarlo inmediatamente.
    return {
      success: true,
      data: {
        id: data.id_registrado,
        nombre: nombre.trim(),
        gamertag: gamertag.trim(),
        correo: correo.trim(),
        fechaRegistro: new Date().toISOString().split('T')[0],
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}