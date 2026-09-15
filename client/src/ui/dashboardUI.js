import { obtenerJugadores } from '../services/jugadoresService.js';
import { obtenerJuegos } from '../services/videojuegosService.js';
import {
  obtenerMovimientos,
  calcularClasificacion,
  calcularTopJugadores,
  obtenerMovimientosRecientes,
} from '../services/puntuacionesService.js';

export function updateDashboardUI() {
  const jugadores = obtenerJugadores();
  const juegos = obtenerJuegos();
  const movimientos = obtenerMovimientos();

  const clasificacion = calcularClasificacion(movimientos);
  const topJugadores = calcularTopJugadores(movimientos, 5);
  const actividadReciente = obtenerMovimientosRecientes(movimientos, 6);

  const totalJugadores = jugadores.length;
  const totalJuegos = juegos.length;
  const totalPuntuaciones = clasificacion.length;
  const promedioGeneral = totalPuntuaciones
    ? (clasificacion.reduce((acc, c) => acc + c.puntaje, 0) / totalPuntuaciones).toFixed(1)
    : '0.0';

  const elJugadores = document.getElementById('stat-total-jugadores');
  const elJuegos = document.getElementById('stat-total-juegos');
  const elPuntuaciones = document.getElementById('stat-total-puntuaciones');
  const elPromedio = document.getElementById('stat-promedio-general');

  if (elJugadores) elJugadores.textContent = totalJugadores;
  if (elJuegos) elJuegos.textContent = totalJuegos;
  if (elPuntuaciones) elPuntuaciones.textContent = totalPuntuaciones;
  if (elPromedio) elPromedio.textContent = promedioGeneral;

  const topContainer = document.getElementById('dashboard-top-players-container');
  if (topContainer) {
    if (topJugadores.length === 0) {
      topContainer.innerHTML = '<p class="empty-msg">Aún no hay puntuaciones registradas.</p>';
    } else {
      const itemsHtml = topJugadores
        .map((fila, index) => {
          const jugador = jugadores.find((j) => j.id === fila.jugadorId);
          const isFirst = index === 0 ? 'top-player-first' : '';
          return `
            <li class="${isFirst}">
              <span class="top-player-pos">${index + 1}</span>
              <div class="top-player-info">
                <span class="top-player-nombre">${escapeHtml(jugador?.nombre ?? '—')}</span>
                <span class="top-player-gamertag">${escapeHtml(jugador?.gamertag ?? '')}</span>
              </div>
              <span class="top-player-total">${fila.total}</span>
            </li>
          `;
        })
        .join('');
      topContainer.innerHTML = `<ol class="top-players-list">${itemsHtml}</ol>`;
    }
  }

  const recentContainer = document.getElementById('dashboard-recent-activity-container');
  if (recentContainer) {
    if (actividadReciente.length === 0) {
      recentContainer.innerHTML = '<p class="empty-msg">Aún no hay movimientos registrados.</p>';
    } else {
      const itemsHtml = actividadReciente
        .map((m) => {
          const jugador = jugadores.find((j) => j.id === m.jugadorId);
          const juego = juegos.find((j) => j.id === m.juegoId);
          const deltaClass = m.delta >= 0 ? 'delta-pos' : 'delta-neg';
          const deltaSign = m.delta >= 0 ? '+' : '';
          return `
            <li class="activity-item">
              <div class="activity-info">
                <span class="activity-jugador">${escapeHtml(jugador?.nombre ?? '—')}</span>
                <span class="activity-juego">${escapeHtml(juego?.nombre ?? '—')}</span>
              </div>
              <div class="activity-meta">
                <span class="${deltaClass}">${deltaSign}${m.delta}</span>
                <span class="activity-fecha">${escapeHtml(m.fecha)}</span>
              </div>
            </li>
          `;
        })
        .join('');
      recentContainer.innerHTML = `<ul class="activity-list">${itemsHtml}</ul>`;
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
