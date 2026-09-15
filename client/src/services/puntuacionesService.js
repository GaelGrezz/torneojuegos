import { loadMovimientosStore, saveMovimientosStore } from './store.js';

export function obtenerMovimientos() {
  return loadMovimientosStore();
}

export function calcularPuntuacionActual(listaMovimientos, jugadorId, juegoId) {
  return listaMovimientos
    .filter((m) => m.jugadorId === jugadorId && m.juegoId === juegoId)
    .reduce((acc, m) => acc + m.delta, 0);
}

export function calcularMovimientosPorPar(listaMovimientos, jugadorId, juegoId) {
  return listaMovimientos
    .filter((m) => m.jugadorId === jugadorId && m.juegoId === juegoId)
    .slice()
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function calcularClasificacion(listaMovimientos) {
  const pares = new Map();
  listaMovimientos.forEach((m) => {
    const key = `${m.jugadorId}-${m.juegoId}`;
    pares.set(key, (pares.get(key) || 0) + m.delta);
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
    totales.set(m.jugadorId, (totales.get(m.jugadorId) || 0) + m.delta);
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

// RF03 + RF05: aplica un movimiento (incremento o decremento)
export function aplicarMovimiento({ jugadorId, juegoId, cantidad, tipo }) {
  const valor = Number(cantidad);

  if (!jugadorId || !juegoId) {
    return { success: false, error: 'Selecciona un jugador y un videojuego.' };
  }
  if (Number.isNaN(valor) || valor <= 0) {
    return { success: false, error: 'La cantidad debe ser un número mayor a 0.' };
  }

  const movimientos = obtenerMovimientos();
  const actual = calcularPuntuacionActual(movimientos, jugadorId, juegoId);
  const delta = tipo === 'decremento' ? -valor : valor;
  const nuevoTotal = actual + delta;

  if (nuevoTotal < 0) {
    return {
      success: false,
      error: `No se puede restar ${valor}: el jugador solo tiene ${actual} puntos en este juego.`,
    };
  }

  const maxId = movimientos.reduce((max, m) => (m.id > max ? m.id : max), 0);
  const movimiento = {
    id: maxId + 1,
    jugadorId,
    juegoId,
    delta,
    tipo: tipo === 'decremento' ? 'decremento' : 'incremento',
    fecha: new Date().toISOString().split('T')[0],
  };

  const actualizados = [...movimientos, movimiento];
  saveMovimientosStore(actualizados);

  return { success: true, data: movimiento, nuevoTotal };
}
