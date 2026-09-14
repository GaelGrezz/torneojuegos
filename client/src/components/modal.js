/**
 * Componente modal reutilizable en Vanilla JS
 */

export function openModal({ title, width = '480px', contentHtml, onMount }) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-overlay" id="modal-overlay-bg">
      <div class="modal-box" style="max-width: ${width};" id="modal-box-inner">
        <div class="modal-header">
          <h2>${escapeHtml(title)}</h2>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          ${contentHtml}
        </div>
      </div>
    </div>
  `;

  // Cerrar al hacer clic en el botón de cerrar o en el overlay
  const overlay = container.querySelector('#modal-overlay-bg');
  const closeBtn = container.querySelector('#modal-close-btn');
  const box = container.querySelector('#modal-box-inner');

  function close() {
    closeModal();
  }

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  if (onMount) {
    onMount(container, close);
  }
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  if (container) {
    container.innerHTML = '';
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
