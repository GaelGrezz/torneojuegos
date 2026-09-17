import { apiFetch } from './api.js';
import { loadMovimientosStore, saveMovimientosStore } from './store.js';

export async function obtenerMovimientos() {
  const res = await apiFetch('/puntuaciones');
  if (res.success && Array.isArray(res.data)) {
    const mapeados = res.data.map((row) => ({
      id: row.ID ?? row.id,
      jugadorId: row.id_jugador ?? row.jugadorId,
      juegoId: row.id_videojuego ?? row.juegoId,
      jugador: row.JUGADOR ?? row.jugador,
      gamertag: row.GAMERTAG ?? row.alias ?? row.gamertag,
      videojuego: row.VIDEOJUEGO ?? row.videojuego,
      puntuacion: Number(row.PUNTUACION ?? row.puntuacion),
      delta: Number(row.PUNTUACION ?? row.puntuacion ?? row.delta),
      fecha: row.FECHA ?? row.fecha,
    }));
    saveMovimientosStore(mapeados);
    return mapeados;
  }
  return loadMovimientosStore();
}

export function calcularPuntuacionActual(listaMovimientos, jugadorId, juegoId) {
  return listaMovimientos
    .filter((m) => (m.jugadorId === jugadorId || m.id_jugador === jugadorId) && (m.juegoId === juegoId || m.id_videojuego === juegoId))
    .reduce((acc, m) => acc + (m.delta !== undefined ? m.delta : m.puntuacion), 0);
}

export function calcularMovimientosPorPar(listaMovimientos, jugadorId, juegoId) {
  return listaMovimientos
    .filter((m) => (m.jugadorId === jugadorId || m.id_jugador === jugadorId) && (m.juegoId === juegoId || m.id_videojuego === juegoId))
    .slice()
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

// RF06: clasificación (jugador + juego) ordenada de mayor a menor puntuación.
export function calcularClasificacion(listaMovimientos) {
  const pares = new Map();
  listaMovimientos.forEach((m) => {
    const jId = m.jugadorId ?? m.id_jugador;
    const gId = m.juegoId ?? m.id_videojuego;
    const valor = m.puntuacion !== undefined ? m.puntuacion : m.delta;
    const key = `${jId}-${gId}`;
    pares.set(key, (pares.get(key) || 0) + valor);
  });

  return Array.from(pares.entries())
    .map(([key, puntaje]) => {
      const [jugadorId, juegoId] = key.split('-').map(Number);
      return { jugadorId, juegoId, puntaje };
    })
    .sort((a, b) => b.puntaje - a.puntaje);
}

// Variante para la tabla de Jugadores: agrupa las filas por jugador.
export function calcularClasificacionAgrupada(listaMovimientos) {
  const pares = calcularClasificacion(listaMovimientos);

  const totalPorJugador = new Map();
  pares.forEach((p) => {
    totalPorJugador.set(p.jugadorId, (totalPorJugador.get(p.jugadorId) || 0) + p.puntaje);
  });

  const jugadoresOrdenados = Array.from(totalPorJugador.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([jugadorId]) => jugadorId);

  const resultado = [];
  jugadoresOrdenados.forEach((jugadorId) => {
    pares
      .filter((p) => p.jugadorId === jugadorId)
      .sort((a, b) => b.puntaje - a.puntaje)
      .forEach((p) => resultado.push(p));
  });

  return resultado;
}

// Top N jugadores por puntuación total acumulada.
export function calcularTopJugadores(listaMovimientos, cantidad = 5) {
  const totales = new Map();
  listaMovimientos.forEach((m) => {
    const jId = m.jugadorId ?? m.id_jugador;
    const valor = m.puntuacion !== undefined ? m.puntuacion : m.delta;
    totales.set(jId, (totales.get(jId) || 0) + valor);
  });

  return Array.from(totales.entries())
    .map(([jugadorId, total]) => ({ jugadorId, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, cantidad);
}

// Últimos N movimientos registrados.
export function obtenerMovimientosRecientes(listaMovimientos, cantidad = 6) {
  return listaMovimientos
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, cantidad);
}

// RF03 + RF05: registrar o aplicar puntuación con validación no negativa
export async function aplicarMovimiento({ jugadorId, juegoId, cantidad, tipo }) {
  const valor = Number(cantidad);

  if (!jugadorId || !juegoId) {
    return { success: false, error: 'Selecciona un jugador y un videojuego.' };
  }
  if (Number.isNaN(valor) || valor <= 0) {
    return { success: false, error: 'La cantidad debe ser un número mayor a 0.' };
  }

  const movimientos = await obtenerMovimientos();
  const actual = calcularPuntuacionActual(movimientos, jugadorId, juegoId);
  const delta = tipo === 'decremento' ? -valor : valor;
  const nuevoTotal = actual + delta;

  if (nuevoTotal < 0) {
    return {
      success: false,
      error: `Error: La puntuación no puede ser negativa. (El jugador tiene ${actual} puntos).`,
    };
  }

  // Llamada al backend API para registrar puntuación
  const res = await apiFetch('/puntuaciones', {
    method: 'POST',
    body: JSON.stringify({
      id_jugador: Number(jugadorId),
      id_videojuego: Number(juegoId),
      puntuacion: nuevoTotal,
    }),
  });

  const maxId = movimientos.reduce((max, m) => (m.id > max ? m.id : max), 0);
  const movimientoLocal = {
    id: res.data?.id_registrado || maxId + 1,
    jugadorId,
    id_jugador: jugadorId,
    juegoId,
    id_videojuego: juegoId,
    puntuacion: nuevoTotal,
    delta,
    tipo: tipo === 'decremento' ? 'decremento' : 'incremento',
    fecha: new Date().toISOString().split('T')[0],
  };

  const actualizados = [...movimientos, movimientoLocal];
  saveMovimientosStore(actualizados);

  return { success: true, data: movimientoLocal, nuevoTotal };
}

// Operaciones CRUD adicionales de puntuación directa (sp_modificar_puntuacion y sp_eliminar_puntuacion)
export async function modificarPuntuacion(id, nuevaPuntuacion) {
  const valor = Number(nuevaPuntuacion);
  if (Number.isNaN(valor) || valor < 0) {
    return { success: false, error: 'Error: La puntuación no puede ser negativa ni nula.' };
  }

  const res = await apiFetch(`/puntuaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ puntuacion: valor }),
  });

  if (res.success) {
    await obtenerMovimientos();
    return { success: true };
  }

  if (res.networkError) {
    const movimientos = loadMovimientosStore();
    const actualizados = movimientos.map((m) => (m.id === id ? { ...m, puntuacion: valor, delta: valor } : m));
    saveMovimientosStore(actualizados);
    return { success: true };
  }

  return { success: false, error: res.error };
}

export async function eliminarPuntuacion(id) {
  const res = await apiFetch(`/puntuaciones/${id}`, {
    method: 'DELETE',
  });

  if (res.success) {
    await obtenerMovimientos();
    return { success: true };
  }

  if (res.networkError) {
    const movimientos = loadMovimientosStore();
    const actualizados = movimientos.filter((m) => m.id !== id);
    saveMovimientosStore(actualizados);
    return { success: true };
  }

  return { success: false, error: res.error };
}
