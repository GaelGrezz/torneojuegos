import { obtenerJugadores } from '../services/jugadoresService.js';
import { obtenerJuegos } from '../services/videojuegosService.js';
import {
  obtenerMovimientos,
  calcularClasificacion,
  calcularTopJugadores,
  obtenerMovimientosRecientes,
} from '../services/puntuacionesService.js';

export function renderDashboardView(container) {
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

  // Render Top Jugadores list
  let topJugadoresHtml = '';
  if (topJugadores.length === 0) {
    topJugadoresHtml = `<p class="empty-msg">Aún no hay puntuaciones registradas.</p>`;
  } else {
    topJugadoresHtml = `
      <ol class="top-players-list">
        ${topJugadores
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
          .join('')}
      </ol>
    `;
  }

  // Render Actividad Reciente list
  let actividadHtml = '';
  if (actividadReciente.length === 0) {
    actividadHtml = `<p class="empty-msg">Aún no hay movimientos registrados.</p>`;
  } else {
    actividadHtml = `
      <ul class="activity-list">
        ${actividadReciente
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
          .join('')}
      </ul>
    `;
  }

  container.innerHTML = `
    <section class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
      </div>

      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-value">${totalJugadores}</span>
          <span class="stat-label">Jugadores</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${totalJuegos}</span>
          <span class="stat-label">Videojuegos</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${totalPuntuaciones}</span>
          <span class="stat-label">Puntuaciones registradas</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${promedioGeneral}</span>
          <span class="stat-label">Puntuación promedio</span>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">Top jugadores</h3>
          ${topJugadoresHtml}
        </div>
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">Actividad reciente</h3>
          ${actividadHtml}
        </div>
      </div>
    </section>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
