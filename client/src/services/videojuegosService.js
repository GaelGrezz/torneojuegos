import { loadJuegosStore, saveJuegosStore } from './store.js';

export function obtenerJuegos() {
  return loadJuegosStore();
}

// RF02: nombre y género obligatorios; nombre único
export function crearJuego({ nombre, genero, imagen }) {
  if (!nombre?.trim() || !genero?.trim()) {
    return { success: false, error: 'Nombre y género son obligatorios.' };
  }

  const juegos = obtenerJuegos();
  const nombreLimpio = nombre.trim();
  const yaExiste = juegos.some((j) => j.nombre.toLowerCase() === nombreLimpio.toLowerCase());
  if (yaExiste) {
    return { success: false, error: `Ya existe un videojuego llamado "${nombreLimpio}".` };
  }

  const maxId = juegos.reduce((max, j) => (j.id > max ? j.id : max), 0);
  const nuevo = {
    id: maxId + 1,
    nombre: nombreLimpio,
    genero: genero.trim(),
    imagen: imagen?.trim() || `https://placehold.co/300x400/333/fff?text=${encodeURIComponent(nombreLimpio)}`,
  };

  const actualizados = [...juegos, nuevo];
  saveJuegosStore(actualizados);

  return { success: true, data: nuevo };
}
