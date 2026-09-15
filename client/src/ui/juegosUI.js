import { obtenerJuegos, crearJuego } from '../services/videojuegosService.js';
import { obtenerJugadores } from '../services/jugadoresService.js';
import { obtenerMovimientos, calcularClasificacion } from '../services/puntuacionesService.js';
import { showModal, hideModal } from './modalsUI.js';

export function initJuegosUI(onDataChanged) {
  const btnCreate = document.getElementById('btn-open-create-game');
  const modalForm = document.getElementById('modal-game-form');
  const formGame = document.getElementById('form-game');
  const formError = document.getElementById('game-form-error');

  btnCreate?.addEventListener('click', () => {
    formGame.reset();
    formError.classList.add('hidden');
    formError.textContent = '';
    showModal(modalForm);
  });

  formGame?.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.classList.add('hidden');

    const nombre = document.getElementById('game-nombre').value;
    const genero = document.getElementById('game-genero').value;
    const imagen = document.getElementById('game-imagen').value;

    const res = crearJuego({ nombre, genero, imagen });
    if (!res.success) {
      formError.textContent = res.error;
      formError.classList.remove('hidden');
      return;
    }

    hideModal(modalForm);
    formGame.reset();
    updateJuegosUI();
    if (onDataChanged) onDataChanged();
  });

  updateJuegosUI();
}

export function updateJuegosUI() {
  const container = document.getElementById('games-grid-container');
  if (!container) return;

  const juegos = obtenerJuegos();

  if (juegos.length === 0) {
    container.innerHTML = '<p class="empty-msg">Aún no hay juegos. Crea el primero con "+ Crear juego".</p>';
    return;
  }

  const gridHtml = juegos
    .map(
      (juego) => `
      <div class="game-card" data-game-id="${juego.id}">
        <img class="game-card-img" src="${escapeHtml(juego.imagen)}" alt="${escapeHtml(juego.nombre)}" />
        <div class="game-card-info">
          <h3>${escapeHtml(juego.nombre)}</h3>
          <p>${escapeHtml(juego.genero)}</p>
          <span class="game-card-link">Ver ranking ▸</span>
        </div>
      </div>
    `
    )
    .join('');

  container.innerHTML = `<div class="game-grid">${gridHtml}</div>`;

  container.querySelectorAll('.game-card').forEach((card) => {
    card.addEventListener('click', () => {
      const gameId = Number(card.getAttribute('data-game-id'));
      const juego = juegos.find((j) => j.id === gameId);
      if (juego) {
        showGameRankingModal(juego);
      }
    });
  });
}

function showGameRankingModal(juego) {
  const modalRanking = document.getElementById('modal-game-ranking');
  const modalTitle = document.getElementById('ranking-modal-title');
  const rankingContainer = document.getElementById('game-ranking-body-container');

  if (modalTitle) modalTitle.textContent = `Clasificación · ${juego.nombre}`;

  const movimientos = obtenerMovimientos();
  const jugadores = obtenerJugadores();
  const clasificacion = calcularClasificacion(movimientos).filter((f) => f.juegoId === juego.id);

  if (clasificacion.length === 0) {
    rankingContainer.innerHTML = '<p class="empty-msg">Todavía no hay puntuaciones registradas para este juego.</p>';
  } else {
    const rowsHtml = clasificacion
      .map((fila, index) => {
        const jugador = jugadores.find((j) => j.id === fila.jugadorId);
        const isFirst = index === 0 ? 'ranking-first' : '';
        return `
          <tr class="${isFirst}">
            <td>${index + 1}</td>
            <td>${escapeHtml(jugador?.nombre ?? '—')}</td>
            <td>${escapeHtml(juego.nombre)}</td>
            <td>${fila.puntaje}</td>
          </tr>
        `;
      })
      .join('');

    rankingContainer.innerHTML = `
      <table class="ranking-table">
        <thead>
          <tr><th>Posición</th><th>Jugador</th><th>Videojuego</th><th>Puntuación</th></tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  showModal(modalRanking);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
