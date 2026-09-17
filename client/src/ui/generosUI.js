import { obtenerGeneros, crearGenero, modificarGenero, eliminarGenero } from '../services/generosService.js';
import { showModal, hideModal } from './modalsUI.js';

let editandoGeneroId = null;

export async function initGenerosUI(onDataChanged) {
  const btnCreate = document.getElementById('btn-open-create-genero');
  const modalForm = document.getElementById('modal-genero-form');
  const formGenero = document.getElementById('form-genero');
  const formError = document.getElementById('genero-form-error');

  btnCreate?.addEventListener('click', () => {
    editandoGeneroId = null;
    formGenero.reset();
    formError.classList.add('hidden');
    formError.textContent = '';
    const modalTitle = document.getElementById('modal-genero-title');
    if (modalTitle) modalTitle.textContent = 'Crear género';
    showModal(modalForm);
  });

  formGenero?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');

    const nombreInput = document.getElementById('genero-nombre');
    const nombre = nombreInput?.value?.trim() || '';

    let res;
    if (editandoGeneroId) {
      res = await modificarGenero(editandoGeneroId, { nombre });
    } else {
      res = await crearGenero({ nombre });
    }

    if (!res.success) {
      formError.textContent = res.error;
      formError.classList.remove('hidden');
      return;
    }

    hideModal(modalForm);
    formGenero.reset();
    editandoGeneroId = null;
    await updateGenerosUI(onDataChanged);
    if (onDataChanged) onDataChanged();
  });

  await updateGenerosUI(onDataChanged);
}

export async function updateGenerosUI(onDataChanged) {
  const container = document.getElementById('generos-table-container');
  if (!container) return;

  const generos = await obtenerGeneros();

  if (!generos || generos.length === 0) {
    container.innerHTML = '<p class="empty-msg">Aún no hay géneros registrados. Crea el primero con "+ Crear género".</p>';
    return;
  }

  const rowsHtml = generos
    .map(
      (g) => `
      <tr>
        <td><strong>#${g.id}</strong></td>
        <td><span class="genero-badge">${escapeHtml(g.nombre)}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-ghost btn-sm btn-edit-genero" data-id="${g.id}" data-nombre="${escapeHtml(g.nombre)}">Editar</button>
          <button class="btn btn-danger-ghost btn-sm btn-delete-genero" data-id="${g.id}" data-nombre="${escapeHtml(g.nombre)}">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join('');

  container.innerHTML = `
    <table class="ranking-table full-width">
      <thead>
        <tr>
          <th style="width: 80px;">ID</th>
          <th>Nombre del género</th>
          <th style="text-align: right; width: 160px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  // Attach event listeners for edit and delete
  container.querySelectorAll('.btn-edit-genero').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const nombre = btn.getAttribute('data-nombre');
      openEditGeneroModal(id, nombre);
    });
  });

  container.querySelectorAll('.btn-delete-genero').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.getAttribute('data-id'));
      const nombre = btn.getAttribute('data-nombre');
      if (confirm(`¿Seguro que deseas eliminar el género "${nombre}"? Los videojuegos asociados mantendrán su registro.`)) {
        const res = await eliminarGenero(id);
        if (!res.success) {
          alert(res.error);
        } else {
          await updateGenerosUI(onDataChanged);
          if (onDataChanged) onDataChanged();
        }
      }
    });
  });
}

function openEditGeneroModal(id, nombre) {
  editandoGeneroId = id;
  const modalForm = document.getElementById('modal-genero-form');
  const modalTitle = document.getElementById('modal-genero-title');
  const formGenero = document.getElementById('form-genero');
  const formError = document.getElementById('genero-form-error');
  const nombreInput = document.getElementById('genero-nombre');

  if (modalTitle) modalTitle.textContent = 'Editar género';
  formError?.classList.add('hidden');
  if (nombreInput) nombreInput.value = nombre;

  showModal(modalForm);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
