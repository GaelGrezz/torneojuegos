let jugadores = [
  { id: 1, nombre: 'Juan Pérez', gamertag: 'JuanP', correo: 'juan.perez@mail.com', fechaRegistro: '2024-01-10' },
  { id: 2, nombre: 'Ana Gómez', gamertag: 'AnaG', correo: 'ana.gomez@mail.com', fechaRegistro: '2024-02-15' },
  { id: 3, nombre: 'Luis Torres', gamertag: 'LuisT', correo: 'luis.torres@mail.com', fechaRegistro: '2024-03-01' },
];

let nextId = 4;

export function obtenerJugadores() {
  return jugadores;
}

// RF01: nombre, gamertag y correo obligatorios; gamertag único
export function crearJugador({ nombre, gamertag, correo }) {
  if (!nombre?.trim() || !gamertag?.trim() || !correo?.trim()) {
    return { success: false, error: 'Nombre, gamertag y correo son obligatorios.' };
  }

  const gamertagLimpio = gamertag.trim();
  const yaExiste = jugadores.some((j) => j.gamertag.toLowerCase() === gamertagLimpio.toLowerCase());
  if (yaExiste) {
    return { success: false, error: `El gamertag "${gamertagLimpio}" ya está en uso.` };
  }

  const nuevo = {
    id: nextId++,
    nombre: nombre.trim(),
    gamertag: gamertagLimpio,
    correo: correo.trim(),
    fechaRegistro: new Date().toISOString().split('T')[0],
  };
  jugadores = [...jugadores, nuevo];
  return { success: true, data: nuevo };
}
