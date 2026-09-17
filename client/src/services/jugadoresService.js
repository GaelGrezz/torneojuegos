import { apiFetch } from './api.js';
import { loadJugadoresStore, saveJugadoresStore } from './store.js';

export async function obtenerJugadores() {
  const res = await apiFetch('/jugadores');
  if (res.success && Array.isArray(res.data)) {
    const mapeados = res.data.map((row) => ({
      id: row.ID ?? row.id,
      nombre: row.NOMBRE ?? row.nombre,
      gamertag: row.GAMERTAG ?? row.alias ?? row.gamertag,
      correo: row.CORREO ?? row.correo,
      fechaRegistro: row.FECHA_REGISTRO ?? row['FECHA DE REGISTRO'] ?? row.fechaRegistro,
    }));
    saveJugadoresStore(mapeados);
    return mapeados;
  }
  return loadJugadoresStore();
}

export async function buscarJugadores(criterio) {
  const criterioLimpio = criterio?.trim();
  if (!criterioLimpio) return obtenerJugadores();

  const res = await apiFetch(`/jugadores/buscar?criterio=${encodeURIComponent(criterioLimpio)}`);
  if (res.success && Array.isArray(res.data)) {
    return res.data.map((row) => ({
      id: row.ID ?? row.id,
      nombre: row.NOMBRE ?? row.nombre,
      gamertag: row.GAMERTAG ?? row.alias ?? row.gamertag,
      correo: row.CORREO ?? row.correo,
      fechaRegistro: row.FECHA_REGISTRO ?? row['FECHA DE REGISTRO'] ?? row.fechaRegistro,
    }));
  }

  const jugadores = loadJugadoresStore();
  const q = criterioLimpio.toLowerCase();
  return jugadores.filter(
    (j) => j.nombre.toLowerCase().includes(q) || j.gamertag.toLowerCase().includes(q)
  );
}

export async function crearJugador({ nombre, gamertag, correo }) {
  const nombreLimpio = nombre?.trim();
  const gamertagLimpio = gamertag?.trim();
  const correoLimpio = correo?.trim();

  if (!nombreLimpio || !gamertagLimpio || !correoLimpio) {
    return { success: false, error: 'Nombre, Gamertag (Alias) y Correo son obligatorios.' };
  }

  const res = await apiFetch('/jugadores', {
    method: 'POST',
    body: JSON.stringify({ nombre: nombreLimpio, alias: gamertagLimpio, correo: correoLimpio }),
  });

  if (res.success) {
    const jugadores = await obtenerJugadores();
    return { success: true, data: res.data, jugadores };
  }

  if (res.networkError) {
    const jugadores = loadJugadoresStore();
    if (jugadores.some((j) => j.gamertag.toLowerCase() === gamertagLimpio.toLowerCase())) {
      return { success: false, error: 'El Gamertag (Alias) ya pertenece a otro jugador.' };
    }
    if (jugadores.some((j) => j.correo.toLowerCase() === correoLimpio.toLowerCase())) {
      return { success: false, error: 'El Correo electrónico ya pertenece a otro jugador.' };
    }

    const maxId = jugadores.reduce((max, j) => (j.id > max ? j.id : max), 0);
    const nuevo = {
      id: maxId + 1,
      nombre: nombreLimpio,
      gamertag: gamertagLimpio,
      correo: correoLimpio,
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    const actualizados = [...jugadores, nuevo];
    saveJugadoresStore(actualizados);
    return { success: true, data: nuevo, jugadores: actualizados };
  }

  return { success: false, error: res.error };
}

export async function modificarJugador(id, { nombre, gamertag, correo }) {
  const nombreLimpio = nombre?.trim();
  const gamertagLimpio = gamertag?.trim();
  const correoLimpio = correo?.trim();

  if (!nombreLimpio || !gamertagLimpio || !correoLimpio) {
    return { success: false, error: 'El Nombre, Gamertag (Alias) y Correo son obligatorios.' };
  }

  const res = await apiFetch(`/jugadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre: nombreLimpio, alias: gamertagLimpio, correo: correoLimpio }),
  });

  if (res.success) {
    const jugadores = await obtenerJugadores();
    return { success: true, data: res.data, jugadores };
  }

  if (res.networkError) {
    const jugadores = loadJugadoresStore();
    if (jugadores.some((j) => j.id !== id && j.gamertag.toLowerCase() === gamertagLimpio.toLowerCase())) {
      return { success: false, error: 'El Gamertag (Alias) ya pertenece a otro jugador.' };
    }
    if (jugadores.some((j) => j.id !== id && j.correo.toLowerCase() === correoLimpio.toLowerCase())) {
      return { success: false, error: 'El Correo electrónico ya pertenece a otro jugador.' };
    }

    const actualizados = jugadores.map((j) => {
      if (j.id === id) {
        return { ...j, nombre: nombreLimpio, gamertag: gamertagLimpio, correo: correoLimpio };
      }
      return j;
    });
    saveJugadoresStore(actualizados);
    return { success: true, jugadores: actualizados };
  }

  return { success: false, error: res.error };
}

export async function eliminarJugador(id) {
  const res = await apiFetch(`/jugadores/${id}`, {
    method: 'DELETE',
  });

  if (res.success) {
    const jugadores = await obtenerJugadores();
    return { success: true, data: res.data, jugadores };
  }

  if (res.networkError) {
    const jugadores = loadJugadoresStore();
    const actualizados = jugadores.filter((j) => j.id !== id);
    saveJugadoresStore(actualizados);
    return { success: true, jugadores: actualizados };
  }

  return { success: false, error: res.error };
}
