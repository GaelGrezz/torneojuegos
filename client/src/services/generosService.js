import { apiFetch } from './api.js';
import { loadGenerosStore, saveGenerosStore } from './store.js';

export async function obtenerGeneros() {
  const res = await apiFetch('/generos');
  if (res.success && Array.isArray(res.data)) {
    const mapeados = res.data.map((row) => ({
      id: row.ID ?? row.id,
      nombre: row.GENERO ?? row.nombre,
    }));
    saveGenerosStore(mapeados);
    return mapeados;
  }
  return loadGenerosStore();
}

export async function crearGenero({ nombre }) {
  const nombreLimpio = nombre?.trim();
  if (!nombreLimpio) {
    return { success: false, error: 'El nombre del género es obligatorio.' };
  }

  const res = await apiFetch('/generos', {
    method: 'POST',
    body: JSON.stringify({ nombre: nombreLimpio.toLowerCase() }),
  });

  if (res.success) {
    const generos = await obtenerGeneros();
    return { success: true, data: res.data, generos };
  }

  // Fallback local si backend no está disponible
  if (res.networkError) {
    const generos = loadGenerosStore();
    const existe = generos.some((g) => g.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (existe) {
      return { success: false, error: 'El género especificado ya existe.' };
    }
    const maxId = generos.reduce((max, g) => (g.id > max ? g.id : max), 0);
    const nuevo = { id: maxId + 1, nombre: nombreLimpio.toLowerCase() };
    const actualizados = [...generos, nuevo];
    saveGenerosStore(actualizados);
    return { success: true, data: nuevo, generos: actualizados };
  }

  return { success: false, error: res.error };
}

export async function modificarGenero(id, { nombre }) {
  const nombreLimpio = nombre?.trim();
  if (!nombreLimpio) {
    return { success: false, error: 'El nuevo nombre del género no puede estar vacío.' };
  }

  const res = await apiFetch(`/generos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre: nombreLimpio.toLowerCase() }),
  });

  if (res.success) {
    const generos = await obtenerGeneros();
    return { success: true, data: res.data, generos };
  }

  if (res.networkError) {
    const generos = loadGenerosStore();
    const existe = generos.some((g) => g.id !== id && g.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (existe) {
      return { success: false, error: 'Ya existe otro género con ese nombre.' };
    }
    const actualizados = generos.map((g) => (g.id === id ? { ...g, nombre: nombreLimpio.toLowerCase() } : g));
    saveGenerosStore(actualizados);
    return { success: true, generos: actualizados };
  }

  return { success: false, error: res.error };
}

export async function eliminarGenero(id) {
  const res = await apiFetch(`/generos/${id}`, {
    method: 'DELETE',
  });

  if (res.success) {
    const generos = await obtenerGeneros();
    return { success: true, data: res.data, generos };
  }

  if (res.networkError) {
    const generos = loadGenerosStore();
    const actualizados = generos.filter((g) => g.id !== id);
    saveGenerosStore(actualizados);
    return { success: true, generos: actualizados };
  }

  return { success: false, error: res.error };
}