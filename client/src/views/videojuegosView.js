import { obtenerJuegos, crearJuego } from '../services/videojuegosService.js';
import { obtenerJugadores } from '../services/jugadoresService.js';
import { obtenerMovimientos, calcularClasificacion } from '../services/puntuacionesService.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderVideojuegosView(container) {
  function updateView() {
    const juegos = obtenerJuegos();

    let gridHtml = '';
    if (juegos.length === 0) {
      gridHtml = `<p class="empty-msg">Aún no hay juegos. Crea el primero con "+ Crear juego".</p>`;
    } else {
      gridHtml = `
        <div class="game-grid">
          ${juegos
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
            .join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <section class="page">
        <div class="page-header">
          <h1>Videojuegos</h1>
          <button class="btn btn-primary" id="btn-crear-juego">+ Crear juego</button>
        </div>

        ${gridHtml}
      </section>
    `;

    // Listeners
    container.querySelector('#btn-crear-juego')?.addEventListener('click', () => {
      showGameFormModal(() => updateView());
    });

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

  updateView();
}

function showGameFormModal(onSaved) {
  openModal({
    title: 'Crear juego',
    width: '420px',
    contentHtml: `
      <form class="form" id="form-crear-juego">
        <div id="form-error-msg" style="display:none;" class="form-error"></div>

        <label>Nombre del juego</label>
        <input type="text" id="juego-nombre" placeholder="Ej. Tekken" required />

        <label>Género</label>
        <input type="text" id="juego-genero" placeholder="Ej. Lucha" required />

        <label>URL de imagen (opcional)</label>
        <input type="text" id="juego-imagen" placeholder="https://..." />

        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar juego</button>
        </div>
      </form>
    `,
    onMount: (modalContainer, close) => {
      const form = modalContainer.querySelector('#form-crear-juego');
      const errorDiv = modalContainer.querySelector('#form-error-msg');
      const cancelBtn = modalContainer.querySelector('#modal-cancel-btn');

      cancelBtn?.addEventListener('click', close);

      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';

        const nombre = modalContainer.querySelector('#juego-nombre').value;
        const genero = modalContainer.querySelector('#juego-genero').value;
        const imagen = modalContainer.querySelector('#juego-imagen').value;

        const resultado = crearJuego({ nombre, genero, imagen });
        if (!resultado.success) {
          errorDiv.textContent = resultado.error;
          errorDiv.style.display = 'block';
          return;
        }

        close();
        if (onSaved) onSaved();
      });
    },
  });
}

function showGameRankingModal(juego) {
  const movimientos = obtenerMovimientos();
  const jugadores = obtenerJugadores();
  const clasificacion = calcularClasificacion(movimientos).filter((f) => f.juegoId === juego.id);

  let bodyHtml = '';
  if (clasificacion.length === 0) {
    bodyHtml = `<p class="empty-msg">Todavía no hay puntuaciones registradas para este juego.</p>`;
  } else {
    bodyHtml = `
      <table class="ranking-table">
        <thead>
          <tr><th>Posición</th><th>Jugador</th><th>Videojuego</th><th>Puntuación</th></tr>
        </thead>
        <tbody>
          ${clasificacion
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
            .join('')}
        </tbody>
      </table>
    `;
  }

  openModal({
    title: `Clasificación · ${juego.nombre}`,
    width: '520px',
    contentHtml: bodyHtml,
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
