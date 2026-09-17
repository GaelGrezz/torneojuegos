const DEFAULT_JUGADORES = [
  { id: 1, nombre: 'Juan Pérez', gamertag: 'JuanP', correo: 'juan.perez@mail.com', fechaRegistro: '2024-01-10' },
  { id: 2, nombre: 'Ana Gómez', gamertag: 'AnaG', correo: 'ana.gomez@mail.com', fechaRegistro: '2024-02-15' },
  { id: 3, nombre: 'Luis Torres', gamertag: 'LuisT', correo: 'luis.torres@mail.com', fechaRegistro: '2024-03-01' },
];

const DEFAULT_GENEROS = [
  { id: 1, nombre: 'battle royale' },
  { id: 2, nombre: 'shooter táctico' },
  { id: 3, nombre: 'lucha' },
  { id: 4, nombre: 'carreras' },
];

const DEFAULT_JUEGOS = [
  {
    id: 1,
    nombre: 'Fortnite',
    id_genero: 1,
    genero: 'battle royale',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnvxdy0mx-LfrpOS5BFe-7Zfwz8G7Ayfxgrgu8kHcHKLQSkOuzXNnIpqM&s=10',
  },
  {
    id: 2,
    nombre: 'Valorant',
    id_genero: 2,
    genero: 'shooter táctico',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMpxuEW2vEHL7NS9t5I4jT5OuWUW0p4M4UgTUSyq6wmjxuY7M5u9kUPwFQ&s=10',
  },
];

const DEFAULT_MOVIMIENTOS = [
  { id: 1, id_jugador: 1, id_videojuego: 1, puntuacion: 1500, fecha: '2024-03-01' },
  { id: 2, id_jugador: 1, id_videojuego: 2, puntuacion: 800, fecha: '2024-03-05' },
  { id: 3, id_jugador: 2, id_videojuego: 1, puntuacion: 2200, fecha: '2024-03-02' },
  { id: 4, id_jugador: 2, id_videojuego: 2, puntuacion: 950, fecha: '2024-03-06' },
  { id: 5, id_jugador: 3, id_videojuego: 1, puntuacion: 1100, fecha: '2024-03-03' },
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
    console.error('Error al guardar en localStorage:', err);
  }
}

export function loadGenerosStore() {
  return getItem('torneojuegos_generos', DEFAULT_GENEROS);
}

export function saveGenerosStore(data) {
  setItem('torneojuegos_generos', data);
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
