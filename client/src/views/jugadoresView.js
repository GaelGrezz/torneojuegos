import { obtenerJugadores, crearJugador } from '../services/jugadoresService.js';
import { obtenerJuegos } from '../services/videojuegosService.js';
import {
  obtenerMovimientos,
  aplicarMovimiento,
  calcularClasificacionAgrupada,
  calcularPuntuacionActual,
  calcularMovimientosPorPar,
} from '../services/puntuacionesService.js';
import { openModal, closeModal } from '../components/modal.js';

let busquedaFiltro = '';

export function renderJugadoresView(container) {
  function updateView() {
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

    // Build Table HTML
    let tableHtml = '';
    if (clasificacionFiltrada.length === 0) {
      tableHtml = `<p class="empty-msg">Aún no hay puntuaciones registradas.</p>`;
    } else {
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

      tableHtml = `
        <table class="ranking-table full-width">
          <thead>
            <tr><th>Jugador</th><th>Posición</th><th>Videojuego</th><th>Puntuación</th></tr>
          </thead>
          <tbody>
            ${rowsMarkup}
          </tbody>
        </table>
      `;
    }

    container.innerHTML = `
      <section class="page">
        <div class="page-header">
          <h1>Jugadores</h1>
          <div class="header-actions">
            <button class="btn btn-ghost" id="btn-registrar-puntuacion">Registrar puntuación</button>
            <button class="btn btn-primary" id="btn-crear-jugador">+ Crear jugador</button>
          </div>
        </div>

        <input
          type="text"
          class="search-bar"
          id="search-input"
          placeholder="Buscar por nombre o gamertag..."
          value="${escapeHtml(busquedaFiltro)}"
        />

        ${tableHtml}
      </section>
    `;

    // Event listeners
    const searchInput = container.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        busquedaFiltro = e.target.value;
        updateView();
        const newSearchInput = container.querySelector('#search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(busquedaFiltro.length, busquedaFiltro.length);
        }
      });
    }

    container.querySelector('#btn-crear-jugador')?.addEventListener('click', () => {
      showPlayerFormModal(() => updateView());
    });

    container.querySelector('#btn-registrar-puntuacion')?.addEventListener('click', () => {
      showScoreFormModal(() => updateView());
    });

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

  updateView();
}

function showPlayerFormModal(onSaved) {
  const juegos = obtenerJuegos();
  const sinJuegosDisponibles = juegos.length === 0;

  let checklistHtml = '';
  if (sinJuegosDisponibles) {
    checklistHtml = `
      <p class="form-error" style="padding: 8px 0;">
        No hay videojuegos creados. Debes crear al menos un videojuego antes de poder registrar un jugador.
      </p>
    `;
  } else {
    checklistHtml = `
      <div class="juegos-checklist">
        ${juegos
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
          .join('')}
      </div>
    `;
  }

  openModal({
    title: 'Crear jugador',
    width: '460px',
    contentHtml: `
      <form class="form" id="form-crear-jugador">
        <div id="player-form-error" style="display:none;" class="form-error"></div>

        <label>Nombre</label>
        <input type="text" id="player-nombre" placeholder="Ej. Juan Pérez" required />

        <label>Gamertag / Alias</label>
        <input type="text" id="player-gamertag" placeholder="Ej. JuanP" required />

        <label>Correo</label>
        <input type="email" id="player-correo" placeholder="correo@mail.com" required />

        <label style="margin-top: 14px;">Registrar en juegos *</label>
        ${checklistHtml}

        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="modal-cancel-btn">Cancelar</button>
          <button type="submit" class="btn btn-primary" ${sinJuegosDisponibles ? 'disabled' : ''}>Guardar jugador</button>
        </div>
      </form>
    `,
    onMount: (modalContainer, close) => {
      const form = modalContainer.querySelector('#form-crear-jugador');
      const errorDiv = modalContainer.querySelector('#player-form-error');
      const cancelBtn = modalContainer.querySelector('#modal-cancel-btn');

      cancelBtn?.addEventListener('click', close);

      modalContainer.querySelectorAll('.chk-juego').forEach((chk) => {
        chk.addEventListener('change', (e) => {
          const id = e.target.getAttribute('data-id');
          const inputPuntaje = modalContainer.querySelector(`.input-puntaje[data-id="${id}"]`);
          if (inputPuntaje) {
            inputPuntaje.disabled = !e.target.checked;
            inputPuntaje.required = e.target.checked;
            if (!e.target.checked) inputPuntaje.value = '';
          }
        });
      });

      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';

        const nombre = modalContainer.querySelector('#player-nombre').value;
        const gamertag = modalContainer.querySelector('#player-gamertag').value;
        const correo = modalContainer.querySelector('#player-correo').value;

        const puntajesIniciales = [];
        let conPuntajeFaltante = false;

        modalContainer.querySelectorAll('.chk-juego').forEach((chk) => {
          if (chk.checked) {
            const jId = Number(chk.getAttribute('data-id'));
            const inputP = modalContainer.querySelector(`.input-puntaje[data-id="${jId}"]`);
            const pVal = inputP ? inputP.value : '';
            if (pVal === '') {
              conPuntajeFaltante = true;
            } else {
              puntajesIniciales.push({ juegoId: jId, puntaje: Number(pVal) });
            }
          }
        });

        if (puntajesIniciales.length === 0 && !conPuntajeFaltante) {
          errorDiv.textContent = 'Debes seleccionar al menos un videojuego y asignarle un puntaje.';
          errorDiv.style.display = 'block';
          return;
        }

        if (conPuntajeFaltante) {
          errorDiv.textContent = 'Todos los videojuegos seleccionados deben tener un puntaje.';
          errorDiv.style.display = 'block';
          return;
        }

        const resJugador = crearJugador({ nombre, gamertag, correo });
        if (!resJugador.success) {
          errorDiv.textContent = resJugador.error;
          errorDiv.style.display = 'block';
          return;
        }

        const nuevoId = resJugador.data.id;
        puntajesIniciales.forEach(({ juegoId, puntaje }) => {
          aplicarMovimiento({ jugadorId: nuevoId, juegoId, cantidad: puntaje, tipo: 'incremento' });
        });

        close();
        if (onSaved) onSaved();
      });
    },
  });
}

function showScoreFormModal(onSaved) {
  const jugadores = obtenerJugadores();
  const juegos = obtenerJuegos();

  if (jugadores.length === 0 || juegos.length === 0) {
    openModal({
      title: 'Registrar puntuación',
      width: '420px',
      contentHtml: `<p class="empty-msg">Necesitas al menos un jugador y un videojuego registrados.</p>`,
    });
    return;
  }

  let selJugadorId = jugadores[0].id;
  let selJuegoId = juegos[0].id;
  let tipoOperacion = 'incremento';

  function renderModalBody(modalContainer) {
    const movimientos = obtenerMovimientos();
    const puntajeActual = calcularPuntuacionActual(movimientos, Number(selJugadorId), Number(selJuegoId));
    const historial = calcularMovimientosPorPar(movimientos, Number(selJugadorId), Number(selJuegoId));

    const optionsJugadores = jugadores
      .map(
        (j) =>
          `<option value="${j.id}" ${j.id === Number(selJugadorId) ? 'selected' : ''}>${escapeHtml(j.nombre)} (${escapeHtml(j.gamertag)})</option>`
      )
      .join('');

    const optionsJuegos = juegos
      .map(
        (j) =>
          `<option value="${j.id}" ${j.id === Number(selJuegoId) ? 'selected' : ''}>${escapeHtml(j.nombre)}</option>`
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

    return `
      <form class="form" id="form-score">
        <label>Jugador</label>
        <select id="select-jugador">${optionsJugadores}</select>

        <label>Videojuego</label>
        <select id="select-juego">${optionsJuegos}</select>

        <p class="current-score">Puntuación actual: <strong>${puntajeActual}</strong></p>

        <label>Operación</label>
        <div class="tipo-toggle">
          <button
            type="button"
            class="toggle-btn ${tipoOperacion === 'incremento' ? 'active' : ''}"
            id="btn-op-incremento"
          >
            + Incrementar
          </button>
        </div>

        <label>Cantidad</label>
        <input type="number" min="1" id="score-cantidad" placeholder="Ej. 100" required />

        <div id="score-form-msg" style="display:none;"></div>

        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="modal-cancel-btn">Cerrar</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-score">
            ${tipoOperacion === 'incremento' ? 'Sumar puntos' : 'Restar puntos'}
          </button>
        </div>

        <div id="historial-container">${historialHtml}</div>
      </form>
    `;
  }

  openModal({
    title: 'Registrar puntuación',
    width: '480px',
    contentHtml: renderModalBody(),
    onMount: (modalContainer, close) => {
      function attachEvents() {
        const form = modalContainer.querySelector('#form-score');
        const selJ = modalContainer.querySelector('#select-jugador');
        const selG = modalContainer.querySelector('#select-juego');
        const btnInc = modalContainer.querySelector('#btn-op-incremento');
        const msgDiv = modalContainer.querySelector('#score-form-msg');
        const cancelBtn = modalContainer.querySelector('#modal-cancel-btn');

        cancelBtn?.addEventListener('click', close);

        selJ?.addEventListener('change', (e) => {
          selJugadorId = Number(e.target.value);
          modalContainer.querySelector('.modal-body').innerHTML = renderModalBody(modalContainer);
          attachEvents();
        });

        selG?.addEventListener('change', (e) => {
          selJuegoId = Number(e.target.value);
          modalContainer.querySelector('.modal-body').innerHTML = renderModalBody(modalContainer);
          attachEvents();
        });

        btnInc?.addEventListener('click', () => {
          tipoOperacion = 'incremento';
          btnInc.classList.add('active');
        });

        form?.addEventListener('submit', (e) => {
          e.preventDefault();
          msgDiv.style.display = 'none';

          const cantidadInput = modalContainer.querySelector('#score-cantidad');
          const cantidad = cantidadInput.value;

          const res = aplicarMovimiento({
            jugadorId: Number(selJugadorId),
            juegoId: Number(selJuegoId),
            cantidad: Number(cantidad),
            tipo: tipoOperacion,
          });

          if (!res.success) {
            msgDiv.className = 'form-msg error';
            msgDiv.textContent = res.error;
            msgDiv.style.display = 'block';
            return;
          }

          msgDiv.className = 'form-msg ok';
          msgDiv.textContent = `${tipoOperacion === 'incremento' ? 'Se sumaron' : 'Se restaron'} ${cantidad} puntos. Nuevo total: ${res.nuevoTotal}.`;
          msgDiv.style.display = 'block';

          cantidadInput.value = '';

          if (onSaved) onSaved();

          modalContainer.querySelector('.modal-body').innerHTML = renderModalBody(modalContainer);
          attachEvents();
        });
      }

      attachEvents();
    },
  });
}

function showPlayerDetailModal(jugador) {
  openModal({
    title: jugador.nombre,
    width: '420px',
    contentHtml: `
      <table class="mini-table rf04-table">
        <thead>
          <tr><th>Gamertag</th><th>Correo</th><th>Fecha de registro</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>${escapeHtml(jugador.gamertag)}</td>
            <td>${escapeHtml(jugador.correo)}</td>
            <td>${escapeHtml(jugador.fechaRegistro)}</td>
          </tr>
        </tbody>
      </table>
    `,
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
