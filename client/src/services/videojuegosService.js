let juegos = [
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

let nextId = 3;

export function obtenerJuegos() {
  return juegos;
}

// RF02: nombre y género obligatorios; nombre único
export function crearJuego({ nombre, genero, imagen }) {
  if (!nombre?.trim() || !genero?.trim()) {
    return { success: false, error: 'Nombre y género son obligatorios.' };
  }

  const nombreLimpio = nombre.trim();
  const yaExiste = juegos.some((j) => j.nombre.toLowerCase() === nombreLimpio.toLowerCase());
  if (yaExiste) {
    return { success: false, error: `Ya existe un videojuego llamado "${nombreLimpio}".` };
  }

  const nuevo = {
    id: nextId++,
    nombre: nombreLimpio,
    genero: genero.trim(),
    imagen: imagen?.trim() || `https://placehold.co/300x400/333/fff?text=${encodeURIComponent(nombreLimpio)}`,
  };
  juegos = [...juegos, nuevo];
  return { success: true, data: nuevo };
}
