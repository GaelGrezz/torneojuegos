import { updateDashboardUI } from '../ui/dashboardUI.js';
import { initModalCloseListeners } from '../ui/modalsUI.js';
import { initGenerosUI } from '../ui/generosUI.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    initModalCloseListeners();
    await Promise.all([updateDashboardUI(), initGenerosUI()]);
  } catch (err) {
    console.error('Error al cargar el dashboard:', err);
  }
});