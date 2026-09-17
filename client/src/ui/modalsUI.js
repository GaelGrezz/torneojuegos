/**
 * Control simple para mostrar y ocultar modales nativos HTML
 */

export function showModal(modalElement) {
  if (modalElement) {
    modalElement.classList.remove('hidden');
  }
}

export function hideModal(modalElement) {
  if (modalElement) {
    modalElement.classList.add('hidden');
  }
}

export function initModalCloseListeners() {
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    // Cerrar al hacer clic en el fondo overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideModal(overlay);
      }
    });

    // Cerrar al hacer clic en botones de cancelar/cerrar
    overlay.querySelectorAll('.btn-close-modal').forEach((btn) => {
      btn.addEventListener('click', () => {
        hideModal(overlay);
      });
    });
  });
}
