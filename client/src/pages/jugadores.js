import { initModalCloseListeners } from '../ui/modalsUI.js';
import { initJugadoresUI } from '../ui/jugadoresUI.js';

document.addEventListener('DOMContentLoaded', () => {
  initModalCloseListeners();
  initJugadoresUI();
});
