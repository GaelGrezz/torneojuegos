import { apiFetch } from './api.js';
import { loadJuegosStore, saveJuegosStore, loadGenerosStore } from './store.js';

export async function obtenerJuegos() {
  const res = await apiFetch('/videojuegos');
  if (res.success && Array.isArray(res.data)) {
    const generos = loadGenerosStore();
    const mapeados = res.data.map((row) => {
      const gMatch = generos.find((g) => (row.GENERO && g.nombre.toLowerCase() === row.GENERO.toLowerCase()) || g.id === row.id_genero);
      return {
        id: row.ID ?? row.id,
        nombre: row.VIDEOJUEGO ?? row.nombre,
        id_genero: row.id_genero ?? (gMatch ? gMatch.id : null),
        genero: row.GENERO ?? (gMatch ? gMatch.nombre : 'sin género'),
        imagen: row.imagen || `https://placehold.co/300x400/1a1a2e/ffffff?text=${encodeURIComponent(row.VIDEOJUEGO ?? row.nombre)}`,
      };
    });
    saveJuegosStore(mapeados);
    return mapeados;
  }
  return loadJuegosStore();
}

export async function crearJuego({ nombre, id_genero, imagen }) {
  const nombreLimpio = nombre?.trim();
  if (!nombreLimpio) {
    return { success: false, error: 'El nombre del videojuego es obligatorio.' };
  }

  const generoIdNum = id_genero ? Number(id_genero) : null;

  const res = await apiFetch('/videojuegos', {
    method: 'POST',
    body: JSON.stringify({ nombre: nombreLimpio, id_genero: generoIdNum }),
  });

  if (res.success) {
    const juegos = await obtenerJuegos();
    return { success: true, data: res.data, juegos };
  }

  if (res.networkError) {
    const juegos = loadJuegosStore();
    const yaExiste = juegos.some((j) => j.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (yaExiste) {
      return { success: false, error: `Ya existe un videojuego registrado con el nombre "${nombreLimpio}".` };
    }
    const generos = loadGenerosStore();
    const gObj = generos.find((g) => g.id === generoIdNum);
    const maxId = juegos.reduce((max, j) => (j.id > max ? j.id : max), 0);
    const nuevo = {
      id: maxId + 1,
      nombre: nombreLimpio,
      id_genero: generoIdNum,
      genero: gObj ? gObj.nombre : 'sin género',
      imagen: imagen?.trim() || `https://placehold.co/300x400/1a1a2e/ffffff?text=${encodeURIComponent(nombreLimpio)}`,
    };
    const actualizados = [...juegos, nuevo];
    saveJuegosStore(actualizados);
    return { success: true, data: nuevo, juegos: actualizados };
  }

  return { success: false, error: res.error };
}

export async function modificarJuego(id, { nombre, id_genero, imagen }) {
  const nombreLimpio = nombre?.trim();
  if (!nombreLimpio) {
    return { success: false, error: 'El nombre del videojuego es obligatorio.' };
  }

  const generoIdNum = id_genero ? Number(id_genero) : null;

  const res = await apiFetch(`/videojuegos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre: nombreLimpio, id_genero: generoIdNum }),
  });

  if (res.success) {
    const juegos = await obtenerJuegos();
    return { success: true, data: res.data, juegos };
  }

  if (res.networkError) {
    const juegos = loadJuegosStore();
    const yaExiste = juegos.some((j) => j.id !== id && j.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (yaExiste) {
      return { success: false, error: 'Ya existe otro videojuego con ese nombre.' };
    }
    const generos = loadGenerosStore();
    const gObj = generos.find((g) => g.id === generoIdNum);
    const actualizados = juegos.map((j) => {
      if (j.id === id) {
        return {
          ...j,
          nombre: nombreLimpio,
          id_genero: generoIdNum,
          genero: gObj ? gObj.nombre : 'sin género',
          imagen: imagen?.trim() || j.imagen,
        };
      }
      return j;
    });
    saveJuegosStore(actualizados);
    return { success: true, juegos: actualizados };
  }

  return { success: false, error: res.error };
}

export async function eliminarJuego(id) {
  const res = await apiFetch(`/videojuegos/${id}`, {
    method: 'DELETE',
  });

  if (res.success) {
    const juegos = await obtenerJuegos();
    return { success: true, data: res.data, juegos };
  }

  if (res.networkError) {
    const juegos = loadJuegosStore();
    const actualizados = juegos.filter((j) => j.id !== id);
    saveJuegosStore(actualizados);
    return { success: true, juegos: actualizados };
  }

  return { success: false, error: res.error };
}
