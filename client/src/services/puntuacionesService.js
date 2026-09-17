import {
  loadJugadores,
  loadVideojuegos,
  loadPuntuaciones,
  crearPuntuacion,
  actualizarPuntuacion,
} from './store.js';

// Registros de puntuación enriquecidos con los ids de jugador/videojuego.
// El backend devuelve nombres (JUGADOR/GAMERTAG y VIDEOJUEGO), así que se
// cruzan con las listas locales (gamertag y nombre de juego son únicos).
export async function obtenerRegistros() {
  const [jugadores, juegos, puntuaciones] = await Promise.all([
    loadJugadores(),
    loadVideojuegos(),
    loadPuntuaciones(),
  ]);

  const jugadorPorGamertag = new Map(jugadores.map((j) => [j.gamertag.toLowerCase(), j]));
  const juegoPorNombre = new Map(juegos.map((g) => [g.nombre.toLowerCase(), g]));

  return puntuaciones.map((p) => {
    const jugador = jugadorPorGamertag.get(String(p.gamertag || '').toLowerCase());
    const juego = juegoPorNombre.get(String(p.videojuegoNombre || '').toLowerCase());
    return {
      id: p.id,
      jugadorId: jugador?.id ?? null,
      juegoId: juego?.id ?? null,
      jugadorNombre: p.jugadorNombre,
      gamertag: p.gamertag,
      juegoNombre: p.videojuegoNombre,
      puntaje: p.puntaje,
      fecha: p.fecha,
    };
  });
}

export async function obtenerPuntuaciones() {
  return loadPuntuaciones();
}

// Puntuación vigente por par (jugador, videojuego): el registro más reciente.
export function puntuacionPorPar(registros) {
  const par = new Map(); // key `${jugadorId}-${juegoId}` -> registro
  registros.forEach((r) => {
    if (r.jugadorId == null || r.juegoId == null) return;
    const key = `${r.jugadorId}-${r.juegoId}`;
    const actual = par.get(key);
    if (!actual || r.id > actual.id) par.set(key, r);
  });
  return par;
}

// RF03 + RF05: guarda una puntuación absoluta. Si ya existe un registro para
// el par (jugador, videojuego) se actualiza (PUT); si no, se crea (POST).
export async function guardarPuntuacion({ jugadorId, juegoId, puntaje }) {
  const valor = Number(puntaje);

  if (!jugadorId || !juegoId) {
    return { success: false, error: 'Selecciona un jugador y un videojuego.' };
  }
  if (Number.isNaN(valor) || valor < 0) {
    return { success: false, error: 'La puntuación debe ser un número mayor o igual a 0.' };
  }

  try {
    const registros = await obtenerRegistros();
    const par = puntuacionPorPar(registros.filter((r) => r.jugadorId === jugadorId && r.juegoId === juegoId));

    let resultado;
    const parKey = `${jugadorId}-${juegoId}`;
    if (par.has(parKey)) {
      resultado = await actualizarPuntuacion({ id: par.get(parKey).id, puntuacion: valor });
    } else {
      resultado = await crearPuntuacion({ idJugador: jugadorId, idVideojuego: juegoId, puntuacion: valor });
    }

    return { success: true, data: resultado, nuevoTotal: valor };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Clasificación (jugador + juego) ordenada de mayor a menor puntuación.
export function calcularClasificacion(registros) {
  const par = puntuacionPorPar(registros);
  return Array.from(par.values())
    .map((r) => ({
      id: r.id,
      jugadorId: r.jugadorId,
      juegoId: r.juegoId,
      jugadorNombre: r.jugadorNombre,
      gamertag: r.gamertag,
      juegoNombre: r.juegoNombre,
      puntaje: r.puntaje,
      fecha: r.fecha,
    }))
    .sort((a, b) => b.puntaje - a.puntaje);
}

// Variante para la tabla de Jugadores: agrupa las filas por jugador.
export function calcularClasificacionAgrupada(registros) {
  const pares = calcularClasificacion(registros);

  const totalPorJugador = new Map();
  pares.forEach((p) => {
    totalPorJugador.set(p.jugadorId, (totalPorJugador.get(p.jugadorId) || 0) + p.puntaje);
  });

  const jugadoresOrdenados = Array.from(totalPorJugador.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([jugadorId]) => jugadorId);

  const resultado = [];
  jugadoresOrdenados.forEach((jugadorId) => {
    pares
      .filter((p) => p.jugadorId === jugadorId)
      .sort((a, b) => b.puntaje - a.puntaje)
      .forEach((p) => resultado.push(p));
  });

  return resultado;
}

// Top N jugadores por puntuación total acumulada.
export function calcularTopJugadores(registros, cantidad = 5) {
  const totales = new Map();
  registros.forEach((r) => {
    totales.set(r.jugadorId, (totales.get(r.jugadorId) || 0) + r.puntaje);
  });

  return Array.from(totales.entries())
    .map(([jugadorId, total]) => ({ jugadorId, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, cantidad);
}

// Últimos N registros (más recientes por id de registro).
export function obtenerRegistrosRecientes(registros, cantidad = 6) {
  return registros
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, cantidad);
}