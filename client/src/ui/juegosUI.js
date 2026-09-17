import { obtenerJuegos, crearJuego, modificarJuego, eliminarJuego } from '../services/videojuegosService.js';
import { obtenerGeneros } from '../services/generosService.js';
import { obtenerJugadores } from '../services/jugadoresService.js';
import { obtenerMovimientos, calcularClasificacion } from '../services/puntuacionesService.js';
import { showModal, hideModal } from './modalsUI.js';

let editandoJuegoId = null;

export async function initJuegosUI(onDataChanged) {
  const btnCreate = document.getElementById('btn-open-create-game');
  const modalForm = document.getElementById('modal-game-form');
  const formGame = document.getElementById('form-game');
  const formError = document.getElementById('game-form-error');

  // Abrir modal de crear juego
  btnCreate?.addEventListener('click', async () => {
    editandoJuegoId = null;
    formGame.reset();
    formError.classList.add('hidden');
    formError.textContent = '';
    const titleEl = document.getElementById('modal-game-title');
    if (titleEl) titleEl.textContent = 'Crear juego';
    await poblarSelectorGeneros();
    showModal(modalForm);
  });

  // Form submit para crear/editar juego
  formGame?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');

    const nombre = document.getElementById('game-nombre').value;
    const id_genero = document.getElementById('game-genero-select').value;
    const imagen = document.getElementById('game-imagen').value;

    let res;
    if (editandoJuegoId) {
      res = await modificarJuego(editandoJuegoId, { nombre, id_genero, imagen });
    } else {
      res = await crearJuego({ nombre, id_genero, imagen });
    }

    if (!res.success) {
      formError.textContent = res.error;
      formError.classList.remove('hidden');
      return;
    }

    hideModal(modalForm);
    formGame.reset();
    editandoJuegoId = null;
    await updateJuegosUI();
    if (onDataChanged) onDataChanged();
  });

  await updateJuegosUI();
}

async function poblarSelectorGeneros(selectedId = null) {
  const select = document.getElementById('game-genero-select');
  if (!select) return;

  const generos = await obtenerGeneros();
  const options = generos
    .map(
      (g) =>
        `<option value="${g.id}" ${selectedId && Number(selectedId) === g.id ? 'selected' : ''}>${escapeHtml(g.nombre)}</option>`
    )
    .join('');

  select.innerHTML = `<option value="">-- Seleccionar género (opcional) --</option>${options}`;
}

export async function updateJuegosUI() {
  const container = document.getElementById('games-grid-container');
  if (!container) return;

  const juegos = await obtenerJuegos();

  if (!juegos || juegos.length === 0) {
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
          <p>${escapeHtml(juego.genero || 'sin género')}</p>
          <div class="game-card-actions">
            <span class="game-card-link btn-view-ranking" data-id="${juego.id}">Ver ranking ▸</span>
            <div class="game-card-btn-group">
              <button class="btn btn-ghost btn-sm btn-edit-game" data-id="${juego.id}">Editar</button>
              <button class="btn btn-danger-ghost btn-sm btn-delete-game" data-id="${juego.id}" data-nombre="${escapeHtml(juego.nombre)}">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  container.innerHTML = `<div class="game-grid">${gridHtml}</div>`;

  // Listener para ver ranking
  container.querySelectorAll('.btn-view-ranking').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const gameId = Number(btn.getAttribute('data-id'));
      const juego = juegos.find((j) => j.id === gameId);
      if (juego) showGameRankingModal(juego);
    });
  });

  // Listener para editar
  container.querySelectorAll('.btn-edit-game').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const gameId = Number(btn.getAttribute('data-id'));
      const juego = juegos.find((j) => j.id === gameId);
      if (juego) openEditGameModal(juego);
    });
  });

  // Listener para eliminar
  container.querySelectorAll('.btn-delete-game').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const gameId = Number(btn.getAttribute('data-id'));
      const nombre = btn.getAttribute('data-nombre');
      if (confirm(`¿Seguro que deseas eliminar el videojuego "${nombre}" y todas sus puntuaciones asociadas?`)) {
        const res = await eliminarJuego(gameId);
        if (!res.success) {
          alert(res.error);
        } else {
          await updateJuegosUI();
        }
      }
    });
  });
}

async function openEditGameModal(juego) {
  editandoJuegoId = juego.id;
  const modalForm = document.getElementById('modal-game-form');
  const titleEl = document.getElementById('modal-game-title');
  const formError = document.getElementById('game-form-error');
  const nombreInput = document.getElementById('game-nombre');
  const imagenInput = document.getElementById('game-imagen');

  if (titleEl) titleEl.textContent = 'Editar juego';
  formError?.classList.add('hidden');
  if (nombreInput) nombreInput.value = juego.nombre;
  if (imagenInput) imagenInput.value = juego.imagen || '';

  await poblarSelectorGeneros(juego.id_genero);
  showModal(modalForm);
}

async function showGameRankingModal(juego) {
  const modalRanking = document.getElementById('modal-game-ranking');
  const modalTitle = document.getElementById('ranking-modal-title');
  const rankingContainer = document.getElementById('game-ranking-body-container');

  if (modalTitle) modalTitle.textContent = `Clasificación · ${juego.nombre}`;

  const movimientos = await obtenerMovimientos();
  const jugadores = await obtenerJugadores();
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
