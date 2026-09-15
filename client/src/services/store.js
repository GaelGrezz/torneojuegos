// Antes este módulo guardaba todo en localStorage con datos de ejemplo.
// Ahora es un cliente delgado sobre tu API Express (app.js + routes/*.js
// que me pasaste). Todas las funciones son async porque ahora hacen fetch —
// en tus componentes vas a necesitar await / useEffect en vez de leer el
// valor directo como antes.

// Muévelo a una variable de entorno de tu bundler cuando puedas
// (import.meta.env.VITE_API_URL en Vite, process.env.REACT_APP_API_URL en CRA).
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

// El backend probablemente devuelve columnas al estilo de la BD
// (id_jugador, alias, fecha_registro). Esta función las traduce a la forma
// que ya usa tu UI (id, gamertag, fechaRegistro). Ajusta las llaves de la
// izquierda si el nombre real de columna que devuelve el SP es distinto.
function mapJugador(row) {
  return {
    id: row.id ?? row.id_jugador,
    nombre: row.nombre,
    gamertag: row.alias ?? row.gamertag,
    correo: row.correo,
    fechaRegistro: row.fecha_registro ?? row.fechaRegistro,
  };
}

function mapVideojuego(row) {
  return {
    id: row.id ?? row.id_videojuego,
    nombre: row.nombre,
    genero: row.genero,
    // El validator de videojuegos solo pide nombre y genero — el backend que
    // compartiste no maneja "imagen" todavía. Se deja null hasta que exista
    // esa columna/endpoint.
    imagen: row.imagen ?? null,
  };
}

// ---- Jugadores ----

export async function loadJugadoresStore() {
  const rows = await request('/jugadores');
  return rows.map(mapJugador);
}

export async function buscarJugadores(criterio) {
  const rows = await request(`/jugadores/buscar?criterio=${encodeURIComponent(criterio)}`);
  return rows.map(mapJugador);
}

export async function crearJugador({ nombre, gamertag, correo, fechaRegistro }) {
  const row = await request('/jugadores', {
    method: 'POST',
    // el backend espera "alias", no "gamertag" — se traduce aquí para que
    // el resto de tu app pueda seguir usando el nombre de campo que ya tenía.
    body: JSON.stringify({ nombre, alias: gamertag, correo, fecha_registro: fechaRegistro || null }),
  });
  return mapJugador(row);
}

// ---- Videojuegos ----
// El router que compartiste solo tiene POST /api/videojuegos (crear).
// loadJuegosStore asume que existe (o vas a agregar) un GET /api/videojuegos
// con la misma convención que /api/jugadores. Si tu backend aún no lo tiene,
// esta llamada va a fallar hasta que lo agreguen.

export async function loadJuegosStore() {
  const rows = await request('/videojuegos');
  return rows.map(mapVideojuego);
}

export async function crearVideojuego({ nombre, genero }) {
  const row = await request('/videojuegos', {
    method: 'POST',
    body: JSON.stringify({ nombre, genero }),
  });
  return mapVideojuego(row);
}

// ---- Puntuaciones / clasificación ----
// GET /api/puntuaciones ejecuta sp_mostrar_clasificacion, que por el nombre
// suena a un ranking ya agregado (totales por jugador/juego), no al listado
// de movimientos individuales que tenía DEFAULT_MOVIMIENTOS (con delta y
// tipo incremento/decremento). No vi un endpoint de historial crudo en lo
// que compartiste — si la vista de "actividad reciente" del dashboard
// necesita esos movimientos individuales, van a necesitar agregar esa ruta
// en el server. Por ahora dejo loadClasificacion tal cual mapea al backend
// real que sí existe.

export function loadClasificacion(videojuego) {
  const query = videojuego ? `?videojuego=${encodeURIComponent(videojuego)}` : '';
  return request(`/puntuaciones${query}`);
}

export function registrarPuntuacion({ idJugador, idVideojuego, puntuacion, fecha }) {
  return request('/puntuaciones', {
    method: 'POST',
    body: JSON.stringify({
      id_jugador: idJugador,
      id_videojuego: idVideojuego,
      puntuacion,
      fecha: fecha || null,
    }),
  }).then((rows) => rows[0]);
}

// ---- Reportes ----

export function loadEstadisticas() {
  return request('/estadisticas');
}