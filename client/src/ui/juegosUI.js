import {
  obtenerJuegos,
  obtenerGeneros,
  crearGenero,
  crearJuego,
} from '../services/videojuegosService.js';
import { loadClasificacion } from '../services/store.js';
import { showModal, hideModal } from './modalsUI.js';

let nuevoGeneroId = null;

export function initJuegosUI(onDataChanged) {
  const btnCreate = document.getElementById('btn-open-create-game');
  const modalForm = document.getElementById('modal-game-form');
  const formGame = document.getElementById('form-game');
  const formError = document.getElementById('game-form-error');
  const selectGenero = document.getElementById('game-genero');
  const nuevoGeneroWrap = document.getElementById('game-nuevo-genero-wrap');

  // Abrir modal de crear juego
  btnCreate?.addEventListener('click', async () => {
    formGame.reset();
    formError.classList.add('hidden');
    formError.textContent = '';
    nuevoGeneroId = null;
    renderGeneroOptions(selectGenero);
    nuevoGeneroWrap?.classList.add('hidden');
    showModal(modalForm);
    if (formGame?.['game-nombre']) formGame['game-nombre'].focus();
  });

  // Mostrar/ocultar el campo "nuevo género" según la selección
  selectGenero?.addEventListener('change', () => {
    if (nuevoGeneroWrap) {
      nuevoGeneroWrap.classList.toggle('hidden', selectGenero.value !== '__nuevo__');
    }
  });

  // Form submit para crear juego
  formGame?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');

    const nombre = document.getElementById('game-nombre').value;
    const generoSel = selectGenero.value;
    const generoNuevo = document.getElementById('game-nuevo-genero')?.value || '';
    const imagen = document.getElementById('game-imagen').value;

    // Si se eligió crear un género nuevo, se registra primero en el catálogo.
    if (generoSel === '__nuevo__') {
      const resGen = await crearGenero({ nombre: generoNuevo });
      if (!resGen.success) {
        formError.textContent = resGen.error;
        formError.classList.remove('hidden');
        return;
      }
      nuevoGeneroId = resGen.data.id;
    }

    const res = await crearJuego({
      nombre,
      idGenero: generoSel === '__nuevo__' ? nuevoGeneroId : generoSel ? Number(generoSel) : null,
      imagen,
    });

    if (!res.success) {
      formError.textContent = res.error;
      formError.classList.remove('hidden');
      return;
    }

    hideModal(modalForm);
    formGame.reset();
    await updateJuegosUI();
    if (onDataChanged) onDataChanged();
  });

  updateJuegosUI();
}

async function renderGeneroOptions(selectGenero) {
  if (!selectGenero) return;
  let generos = [];
  try {
    generos = await obtenerGeneros();
  } catch {
    generos = [];
  }

  const current = selectGenero.value;
  selectGenero.innerHTML =
    '<option value="">— Sin género —</option>' +
    generos.map((g) => `<option value="${g.id}">${escapeHtml(g.nombre)}</option>`).join('') +
    '<option value="__nuevo__">+ Crear nuevo género...</option>';

  if (current && [...selectGenero.options].some((o) => o.value === String(current))) {
    selectGenero.value = current;
  }
}

export async function updateJuegosUI() {
  const container = document.getElementById('games-grid-container');
  if (!container) return;

  let juegos;
  try {
    juegos = await obtenerJuegos();
  } catch (err) {
    container.innerHTML = `<p class="empty-msg">No se pudo cargar la lista de videojuegos.<br/><small>${escapeHtml(err.message)}</small></p>`;
    return;
  }

  if (juegos.length === 0) {
    container.innerHTML = '<p class="empty-msg">Aún no hay juegos. Crea el primero con "+ Crear juego".</p>';
    return;
  }

  const placeholder = (nombre) =>
    `https://placehold.co/300x400/333/fff?text=${encodeURIComponent(nombre)}`;

  const gridHtml = juegos
    .map(
      (juego) => `
      <div class="game-card" data-game-id="${juego.id}">
        <img
          class="game-card-img"
          src="${escapeHtml(juego.imagen || placeholder(juego.nombre))}"
          onerror="this.onerror=null;this.src='${placeholder(juego.nombre)}'"
          alt="${escapeHtml(juego.nombre)}"
        />
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

async function showGameRankingModal(juego) {
  const modalRanking = document.getElementById('modal-game-ranking');
  const modalTitle = document.getElementById('ranking-modal-title');
  const rankingContainer = document.getElementById('game-ranking-body-container');

  if (modalTitle) modalTitle.textContent = `Clasificación · ${juego.nombre}`;

  rankingContainer.innerHTML = '<p class="empty-msg">Cargando…</p>';
  showModal(modalRanking);

  let filas;
  try {
    filas = await loadClasificacion(juego.id);
  } catch (err) {
    rankingContainer.innerHTML = `<p class="empty-msg">Error al cargar la clasificación.<br/><small>${escapeHtml(err.message)}</small></p>`;
    return;
  }

  if (filas.length === 0) {
    rankingContainer.innerHTML = '<p class="empty-msg">Todavía no hay puntuaciones registradas para este juego.</p>';
    return;
  }

  const rowsHtml = filas
    .map((fila, index) => {
      const isFirst = index === 0 ? 'ranking-first' : '';
      return `
        <tr class="${isFirst}">
          <td>${fila.POSICION}</td>
          <td>${escapeHtml(fila.JUGADOR)}</td>
          <td>${escapeHtml(fila.VIDEOJUEGO)}</td>
          <td>${fila.PUNTUACION}</td>
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}