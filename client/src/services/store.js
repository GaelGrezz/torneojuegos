// Cliente delgado sobre la API Express (server). Ya no se usa localStorage
// ni datos simulados: todo se lee/escribe en MySQL vía los endpoints /api.
//
// Contrato consumido (validado por QA):
//   GET  /api/jugadores        -> [{ID, NOMBRE, GAMERTAG, CORREO, FECHA_REGISTRO}]
//   POST /api/jugadores        -> {id_registrado, mensaje}
//   GET  /api/generos          -> [{ID, GENERO}]
//   POST /api/generos          -> {id_registrado, mensaje}
//   GET  /api/videojuegos      -> [{ID, VIDEOJUEGO, GENERO}]
//   POST /api/videojuegos      -> {id_registrado, mensaje}
//   GET  /api/puntuaciones     -> [{ID, JUGADOR, GAMERTAG, VIDEOJUEGO, PUNTUACION, FECHA}]
//   POST /api/puntuaciones     -> {id_registrado, mensaje}
//   PUT  /api/puntuaciones/:id -> {mensaje}
//   GET  /api/clasificacion    -> [{POSICION, JUGADOR, VIDEOJUEGO, PUNTUACION, FECHA}]
//   GET  /api/estadisticas     -> {total_jugadores, total_generos, total_videojuegos,
//                                   total_puntuaciones, puntuacion_promedio}

const API_BASE_URL = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(body?.error || `Error ${res.status} al llamar ${path}`);
  }

  return body;
}

// ---- Jugadores ----

export async function loadJugadores() {
  const rows = await request('/jugadores');
  return rows.map((r) => ({
    id: r.ID,
    nombre: r.NOMBRE,
    gamertag: r.GAMERTAG,
    correo: r.CORREO,
    fechaRegistro: r.FECHA_REGISTRO,
  }));
}

export async function crearJugador({ nombre, gamertag, correo }) {
  return request('/jugadores', {
    method: 'POST',
    body: JSON.stringify({ nombre, alias: gamertag, correo }),
  });
}

// ---- Géneros ----

export async function loadGeneros() {
  const rows = await request('/generos');
  return rows.map((r) => ({ id: r.ID, nombre: r.GENERO }));
}

export async function crearGenero({ nombre }) {
  return request('/generos', {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  });
}

// ---- Videojuegos ----

export async function loadVideojuegos() {
  const rows = await request('/videojuegos');
  return rows.map((r) => ({
    id: r.ID,
    nombre: r.VIDEOJUEGO,
    genero: r.GENERO,
    imagen: null,
  }));
}

export async function crearVideojuego({ nombre, idGenero }) {
  return request('/videojuegos', {
    method: 'POST',
    body: JSON.stringify({ nombre, id_genero: idGenero || null }),
  });
}

// ---- Puntuaciones ----

export async function loadPuntuaciones() {
  const rows = await request('/puntuaciones');
  return rows.map((r) => ({
    id: r.ID,
    gamertag: r.GAMERTAG,
    jugadorNombre: r.JUGADOR,
    videojuegoNombre: r.VIDEOJUEGO,
    puntaje: r.PUNTUACION,
    fecha: r.FECHA,
  }));
}

export async function crearPuntuacion({ idJugador, idVideojuego, puntuacion }) {
  return request('/puntuaciones', {
    method: 'POST',
    body: JSON.stringify({
      id_jugador: idJugador,
      id_videojuego: idVideojuego,
      puntuacion,
    }),
  });
}

export async function actualizarPuntuacion({ id, puntuacion }) {
  return request(`/puntuaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ puntuacion }),
  });
}

// ---- Reportes ----

export function loadClasificacion(idVideojuego) {
  const query = idVideojuego ? `?id_videojuego=${idVideojuego}` : '';
  return request(`/clasificacion${query}`);
}

export function loadEstadisticas() {
  return request('/estadisticas');
}