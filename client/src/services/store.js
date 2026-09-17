const DEFAULT_JUGADORES = [
  { id: 1, nombre: 'Juan Pérez', gamertag: 'JuanP', correo: 'juan.perez@mail.com', fechaRegistro: '2024-01-10' },
  { id: 2, nombre: 'Ana Gómez', gamertag: 'AnaG', correo: 'ana.gomez@mail.com', fechaRegistro: '2024-02-15' },
  { id: 3, nombre: 'Luis Torres', gamertag: 'LuisT', correo: 'luis.torres@mail.com', fechaRegistro: '2024-03-01' },
];

const DEFAULT_JUEGOS = [
  {
    id: 1,
    nombre: 'Fortnite',
    genero: 'Battle Royale',
    imagen: 'https://placehold.co/300x400/1a1a2e/ffffff?text=Fortnite',
  },
  {
    id: 2,
    nombre: 'Valorant',
    genero: 'Shooter táctico',
    imagen: 'https://placehold.co/300x400/ff4655/ffffff?text=Valorant',
  },
];

const DEFAULT_MOVIMIENTOS = [
  { id: 1, jugadorId: 1, juegoId: 1, delta: 1500, tipo: 'incremento', fecha: '2024-03-01' },
  { id: 2, jugadorId: 1, juegoId: 2, delta: 800, tipo: 'incremento', fecha: '2024-03-05' },
  { id: 3, jugadorId: 2, juegoId: 1, delta: 2200, tipo: 'incremento', fecha: '2024-03-02' },
  { id: 4, jugadorId: 2, juegoId: 2, delta: 950, tipo: 'incremento', fecha: '2024-03-06' },
  { id: 5, jugadorId: 3, juegoId: 1, delta: 1100, tipo: 'incremento', fecha: '2024-03-03' },
];

function getItem(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error al guardar ${key} en localStorage:`, err);
  }
}

export function loadJugadoresStore() {
  return getItem('torneojuegos_jugadores', DEFAULT_JUGADORES);
}

export function saveJugadoresStore(data) {
  setItem('torneojuegos_jugadores', data);
}

export function loadJuegosStore() {
  return getItem('torneojuegos_juegos', DEFAULT_JUEGOS);
}

export function saveJuegosStore(data) {
  setItem('torneojuegos_juegos', data);
}

export function loadMovimientosStore() {
  return getItem('torneojuegos_movimientos', DEFAULT_MOVIMIENTOS);
}

export function saveMovimientosStore(data) {
  setItem('torneojuegos_movimientos', data);
}
