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
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideModal(overlay);
      }
    });

    overlay.querySelectorAll('.btn-close-modal').forEach((btn) => {
      btn.addEventListener('click', () => {
        hideModal(overlay);
      });
    });
  });
}
