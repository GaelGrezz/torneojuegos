import { obtenerJugadores, crearJugador } from '../services/jugadoresService.js';
import { obtenerJuegos } from '../services/videojuegosService.js';
import {
  obtenerMovimientos,
  aplicarMovimiento,
  calcularClasificacionAgrupada,
  calcularPuntuacionActual,
  calcularMovimientosPorPar,
} from '../services/puntuacionesService.js';
import { showModal, hideModal } from './modalsUI.js';

let busquedaFiltro = '';
let selScoreJugadorId = null;
let selScoreJuegoId = null;
let tipoOperacionScore = 'incremento';

export function initJugadoresUI(onDataChanged) {
  const searchInput = document.getElementById('search-input');
  const btnCreatePlayer = document.getElementById('btn-open-create-player');
  const btnScoreForm = document.getElementById('btn-open-score-form');

  // Search input live filtering
  searchInput?.addEventListener('input', (e) => {
    busquedaFiltro = e.target.value;
    updateJugadoresUI();
  });

  // Modal 3: Crear Jugador
  btnCreatePlayer?.addEventListener('click', () => {
    openPlayerFormModal();
  });

  const formPlayer = document.getElementById('form-player');
  formPlayer?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCreatePlayerSubmit(onDataChanged);
  });

  // Modal 4: Registrar Puntuación
  btnScoreForm?.addEventListener('click', () => {
    openScoreFormModal(onDataChanged);
  });

  updateJugadoresUI();
}

export function updateJugadoresUI() {
  const container = document.getElementById('players-table-container');
  if (!container) return;

  const jugadores = obtenerJugadores();
  const juegos = obtenerJuegos();
  const movimientos = obtenerMovimientos();

  const clasificacionGlobal = calcularClasificacionAgrupada(movimientos);

  // Calc posiciones por juego
  const filasPorJuego = {};
  clasificacionGlobal.forEach((fila) => {
    if (!filasPorJuego[fila.juegoId]) filasPorJuego[fila.juegoId] = [];
    filasPorJuego[fila.juegoId].push(fila);
  });

  const posicionesPorJuego = {};
  Object.values(filasPorJuego).forEach((filas) => {
    const ordenadas = [...filas].sort((a, b) => b.puntaje - a.puntaje);
    ordenadas.forEach((fila, idx) => {
      posicionesPorJuego[`${fila.jugadorId}-${fila.juegoId}`] = idx + 1;
    });
  });

  // Filtrar clasificacion por búsqueda
  const termino = busquedaFiltro.toLowerCase().trim();
  const clasificacionFiltrada = termino
    ? clasificacionGlobal.filter((fila) => {
        const jugador = jugadores.find((j) => j.id === fila.jugadorId);
        return (
          jugador &&
          (jugador.nombre.toLowerCase().includes(termino) ||
            jugador.gamertag.toLowerCase().includes(termino))
        );
      })
    : clasificacionGlobal;

  if (clasificacionFiltrada.length === 0) {
    container.innerHTML = '<p class="empty-msg">Aún no hay puntuaciones registradas.</p>';
    return;
  }

  let grupoIndex = -1;
  let jugadorAnteriorId = null;
  const conteoPorGrupo = {};

  const filasConGrupo = clasificacionFiltrada.map((fila) => {
    const esInicioGrupo = fila.jugadorId !== jugadorAnteriorId;
    if (esInicioGrupo) {
      grupoIndex += 1;
      jugadorAnteriorId = fila.jugadorId;
    }
    conteoPorGrupo[grupoIndex] = (conteoPorGrupo[grupoIndex] || 0) + 1;
    return { ...fila, grupoIndex, esInicioGrupo };
  });

  const rowsMarkup = filasConGrupo
    .map((fila, index) => {
      const juego = juegos.find((j) => j.id === fila.juegoId);
      const jugador = jugadores.find((j) => j.id === fila.jugadorId);
      const colorGrupo = fila.grupoIndex % 2 === 0 ? 'grupo-par' : 'grupo-impar';
      const posicionReal = posicionesPorJuego[`${fila.jugadorId}-${fila.juegoId}`] ?? index + 1;

      const clasesFila = [
        colorGrupo,
        fila.esInicioGrupo && fila.grupoIndex > 0 ? 'separador-grupo' : '',
        posicionReal === 1 ? 'ranking-first' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const celdaJugadorHtml = fila.esInicioGrupo
        ? `<td class="celda-jugador" rowSpan="${conteoPorGrupo[fila.grupoIndex]}" data-jugador-id="${fila.jugadorId}">${escapeHtml(jugador?.nombre ?? '—')}</td>`
        : '';

      return `
        <tr class="${clasesFila}">
          ${celdaJugadorHtml}
          <td>${posicionReal}</td>
          <td>${escapeHtml(juego?.nombre ?? '—')}</td>
          <td>${fila.puntaje}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <table class="ranking-table full-width">
      <thead>
        <tr><th>Jugador</th><th>Posición</th><th>Videojuego</th><th>Puntuación</th></tr>
      </thead>
      <tbody>
        ${rowsMarkup}
      </tbody>
    </table>
  `;

  // Listener para clic en celda de jugador -> abre modal detalle
  container.querySelectorAll('.celda-jugador').forEach((td) => {
    td.addEventListener('click', () => {
      const jId = Number(td.getAttribute('data-jugador-id'));
      const jugador = jugadores.find((j) => j.id === jId);
      if (jugador) {
        showPlayerDetailModal(jugador);
      }
    });
  });
}

function openPlayerFormModal() {
  const modalPlayer = document.getElementById('modal-player-form');
  const formPlayer = document.getElementById('form-player');
  const formError = document.getElementById('player-form-error');
  const checklistContainer = document.getElementById('player-games-checklist-container');
  const btnSave = document.getElementById('btn-save-player');

  formPlayer.reset();
  formError.classList.add('hidden');
  formError.textContent = '';

  const juegos = obtenerJuegos();
  const sinJuegos = juegos.length === 0;

  if (btnSave) btnSave.disabled = sinJuegos;

  if (sinJuegos) {
    checklistContainer.innerHTML = `
      <p class="form-error" style="padding: 8px 0;">
        No hay videojuegos creados. Debes crear al menos un videojuego antes de poder registrar un jugador.
      </p>
    `;
  } else {
    const checklistHtml = juegos
      .map(
        (juego) => `
        <div class="juego-checklist-item" data-juego-id="${juego.id}">
          <label class="checklist-label">
            <input type="checkbox" class="chk-juego" data-id="${juego.id}" />
            ${escapeHtml(juego.nombre)}
          </label>
          <input
            type="number"
            min="0"
            class="checklist-puntaje input-puntaje"
            data-id="${juego.id}"
            placeholder="Puntaje"
            disabled
          />
        </div>
      `
      )
      .join('');

    checklistContainer.innerHTML = `<div class="juegos-checklist">${checklistHtml}</div>`;

    // Listeners para checkboxes
    checklistContainer.querySelectorAll('.chk-juego').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const inputP = checklistContainer.querySelector(`.input-puntaje[data-id="${id}"]`);
        if (inputP) {
          inputP.disabled = !e.target.checked;
          inputP.required = e.target.checked;
          if (!e.target.checked) inputP.value = '';
        }
      });
    });
  }

  showModal(modalPlayer);
}

function handleCreatePlayerSubmit(onDataChanged) {
  const modalPlayer = document.getElementById('modal-player-form');
  const formError = document.getElementById('player-form-error');

  const nombre = document.getElementById('player-nombre').value;
  const gamertag = document.getElementById('player-gamertag').value;
  const correo = document.getElementById('player-correo').value;

  const puntajesIniciales = [];
  let conPuntajeFaltante = false;

  document.querySelectorAll('#player-games-checklist-container .chk-juego').forEach((chk) => {
    if (chk.checked) {
      const jId = Number(chk.getAttribute('data-id'));
      const inputP = document.querySelector(`#player-games-checklist-container .input-puntaje[data-id="${jId}"]`);
      const pVal = inputP ? inputP.value : '';
      if (pVal === '') {
        conPuntajeFaltante = true;
      } else {
        puntajesIniciales.push({ juegoId: jId, puntaje: Number(pVal) });
      }
    }
  });

  if (puntajesIniciales.length === 0 && !conPuntajeFaltante) {
    formError.textContent = 'Debes seleccionar al menos un videojuego y asignarle un puntaje.';
    formError.classList.remove('hidden');
    return;
  }

  if (conPuntajeFaltante) {
    formError.textContent = 'Todos los videojuegos seleccionados deben tener un puntaje.';
    formError.classList.remove('hidden');
    return;
  }

  const resJugador = crearJugador({ nombre, gamertag, correo });
  if (!resJugador.success) {
    formError.textContent = resJugador.error;
    formError.classList.remove('hidden');
    return;
  }

  const nuevoId = resJugador.data.id;
  puntajesIniciales.forEach(({ juegoId, puntaje }) => {
    aplicarMovimiento({ jugadorId: nuevoId, juegoId, cantidad: puntaje, tipo: 'incremento' });
  });

  hideModal(modalPlayer);
  updateJugadoresUI();
  if (onDataChanged) onDataChanged();
}

function openScoreFormModal(onDataChanged) {
  const modalScore = document.getElementById('modal-score-form');
  const container = document.getElementById('score-form-body-container');

  const jugadores = obtenerJugadores();
  const juegos = obtenerJuegos();

  if (jugadores.length === 0 || juegos.length === 0) {
    container.innerHTML = '<p class="empty-msg">Necesitas al menos un jugador y un videojuego registrados.</p>';
    showModal(modalScore);
    return;
  }

  selScoreJugadorId = selScoreJugadorId || jugadores[0].id;
  selScoreJuegoId = selScoreJuegoId || juegos[0].id;
  tipoOperacionScore = 'incremento';

  function renderBody() {
    const movimientos = obtenerMovimientos();
    const puntajeActual = calcularPuntuacionActual(movimientos, Number(selScoreJugadorId), Number(selScoreJuegoId));
    const historial = calcularMovimientosPorPar(movimientos, Number(selScoreJugadorId), Number(selScoreJuegoId));

    const optionsJugadores = jugadores
      .map(
        (j) =>
          `<option value="${j.id}" ${j.id === Number(selScoreJugadorId) ? 'selected' : ''}>${escapeHtml(j.nombre)} (${escapeHtml(j.gamertag)})</option>`
      )
      .join('');

    const optionsJuegos = juegos
      .map(
        (j) =>
          `<option value="${j.id}" ${j.id === Number(selScoreJuegoId) ? 'selected' : ''}>${escapeHtml(j.nombre)}</option>`
      )
      .join('');

    let historialHtml = '';
    if (historial.length > 0) {
      historialHtml = `
        <h4 style="margin-top: 16px;">Historial de movimientos</h4>
        <table class="mini-table">
          <thead><tr><th>Fecha</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${historial
              .map(
                (m) => `
                <tr>
                  <td>${escapeHtml(m.fecha)}</td>
                  <td class="${m.delta >= 0 ? 'delta-pos' : 'delta-neg'}">
                    ${m.delta >= 0 ? '+' : ''}${m.delta}
                  </td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    container.innerHTML = `
      <form class="form" id="form-score">
        <label for="select-score-jugador">Jugador</label>
        <select id="select-score-jugador">${optionsJugadores}</select>

        <label for="select-score-juego">Videojuego</label>
        <select id="select-score-juego">${optionsJuegos}</select>

        <p class="current-score">Puntuación actual: <strong>${puntajeActual}</strong></p>

        <label>Operación</label>
        <div class="tipo-toggle">
          <button
            type="button"
            class="toggle-btn ${tipoOperacionScore === 'incremento' ? 'active' : ''}"
            id="btn-op-incremento"
          >
            + Incrementar
          </button>
        </div>

        <label for="score-cantidad">Cantidad</label>
        <input type="number" min="1" id="score-cantidad" placeholder="Ej. 100" required />

        <div id="score-form-msg" class="hidden"></div>

        <div class="form-actions">
          <button type="button" class="btn btn-ghost btn-close-modal">Cerrar</button>
          <button type="submit" class="btn btn-primary">
            ${tipoOperacionScore === 'incremento' ? 'Sumar puntos' : 'Restar puntos'}
          </button>
        </div>

        <div>${historialHtml}</div>
      </form>
    `;

    // Attach listeners for selects
    const selJ = container.querySelector('#select-score-jugador');
    const selG = container.querySelector('#select-score-juego');
    const btnInc = container.querySelector('#btn-op-incremento');
    const formS = container.querySelector('#form-score');
    const msgDiv = container.querySelector('#score-form-msg');
    const closeBtn = container.querySelector('.btn-close-modal');

    closeBtn?.addEventListener('click', () => hideModal(modalScore));

    selJ?.addEventListener('change', (e) => {
      selScoreJugadorId = Number(e.target.value);
      renderBody();
    });

    selG?.addEventListener('change', (e) => {
      selScoreJuegoId = Number(e.target.value);
      renderBody();
    });

    btnInc?.addEventListener('click', () => {
      tipoOperacionScore = 'incremento';
      btnInc.classList.add('active');
    });

    formS?.addEventListener('submit', (e) => {
      e.preventDefault();
      msgDiv.classList.add('hidden');

      const cantInput = container.querySelector('#score-cantidad');
      const cantidad = cantInput.value;

      const res = aplicarMovimiento({
        jugadorId: Number(selScoreJugadorId),
        juegoId: Number(selScoreJuegoId),
        cantidad: Number(cantidad),
        tipo: tipoOperacionScore,
      });

      if (!res.success) {
        msgDiv.className = 'form-msg error';
        msgDiv.textContent = res.error;
        msgDiv.classList.remove('hidden');
        return;
      }

      msgDiv.className = 'form-msg ok';
      msgDiv.textContent = `${tipoOperacionScore === 'incremento' ? 'Se sumaron' : 'Se restaron'} ${cantidad} puntos. Nuevo total: ${res.nuevoTotal}.`;
      msgDiv.classList.remove('hidden');

      cantInput.value = '';

      updateJugadoresUI();
      if (onDataChanged) onDataChanged();

      renderBody();
    });
  }

  renderBody();
  showModal(modalScore);
}

function showPlayerDetailModal(jugador) {
  const modalDetail = document.getElementById('modal-player-detail');
  const titleEl = document.getElementById('detail-player-title');
  const tagEl = document.getElementById('detail-player-gamertag');
  const mailEl = document.getElementById('detail-player-correo');
  const dateEl = document.getElementById('detail-player-fecha');

  if (titleEl) titleEl.textContent = jugador.nombre;
  if (tagEl) tagEl.textContent = jugador.gamertag;
  if (mailEl) mailEl.textContent = jugador.correo;
  if (dateEl) dateEl.textContent = jugador.fechaRegistro;

  showModal(modalDetail);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
