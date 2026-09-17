import { initModalCloseListeners } from '../ui/modalsUI.js';
import { initJuegosUI } from '../ui/juegosUI.js';

document.addEventListener('DOMContentLoaded', () => {
  initModalCloseListeners();
  initJuegosUI();
});
