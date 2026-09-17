import { loadJugadoresStore, saveJugadoresStore } from './store.js';

export function obtenerJugadores() {
  return loadJugadoresStore();
}

// RF01: nombre, gamertag y correo obligatorios; gamertag único
export function crearJugador({ nombre, gamertag, correo }) {
  if (!nombre?.trim() || !gamertag?.trim() || !correo?.trim()) {
    return { success: false, error: 'Nombre, gamertag y correo son obligatorios.' };
  }

  const jugadores = obtenerJugadores();
  const gamertagLimpio = gamertag.trim();
  const yaExiste = jugadores.some((j) => j.gamertag.toLowerCase() === gamertagLimpio.toLowerCase());
  if (yaExiste) {
    return { success: false, error: `El gamertag "${gamertagLimpio}" ya está en uso.` };
  }

  const maxId = jugadores.reduce((max, j) => (j.id > max ? j.id : max), 0);
  const nuevo = {
    id: maxId + 1,
    nombre: nombre.trim(),
    gamertag: gamertagLimpio,
    correo: correo.trim(),
    fechaRegistro: new Date().toISOString().split('T')[0],
  };

  const actualizados = [...jugadores, nuevo];
  saveJugadoresStore(actualizados);

  return { success: true, data: nuevo };
}
