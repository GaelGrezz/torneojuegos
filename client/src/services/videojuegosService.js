import {
  loadVideojuegos,
  loadGeneros,
  crearGenero as crearGeneroApi,
  crearVideojuego as crearVideojuegoApi,
} from './store.js';

export async function obtenerJuegos() {
  return loadVideojuegos();
}

export async function obtenerGeneros() {
  return loadGeneros();
}

// RF02: nombre obligatorio y único; género opcional (id_genero).
export async function crearJuego({ nombre, idGenero, imagen }) {
  if (!nombre?.trim()) {
    return { success: false, error: 'El nombre del videojuego es obligatorio.' };
  }

  try {
    const data = await crearVideojuegoApi({ nombre: nombre.trim(), idGenero });
    return {
      success: true,
      data: {
        id: data.id_registrado,
        nombre: nombre.trim(),
        idGenero: idGenero || null,
        imagen: imagen?.trim() || `https://placehold.co/300x400/333/fff?text=${encodeURIComponent(nombre.trim())}`,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Crea un género y devuelve su id (para poder usarlo al crear videojuegos).
export async function crearGenero({ nombre }) {
  if (!nombre?.trim()) {
    return { success: false, error: 'El nombre del género es obligatorio.' };
  }

  try {
    const data = await crearGeneroApi({ nombre: nombre.trim() });
    return { success: true, data: { id: data.id_registrado, nombre: nombre.trim() } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}