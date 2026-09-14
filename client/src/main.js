import { initModalCloseListeners } from './ui/modalsUI.js';
import { updateDashboardUI } from './ui/dashboardUI.js';
import { initJuegosUI, updateJuegosUI } from './ui/juegosUI.js';
import { initJugadoresUI, updateJugadoresUI } from './ui/jugadoresUI.js';

let activeTab = 'dashboard';

function initApp() {
  // Inicializar manejadores globales de modales HTML
  initModalCloseListeners();

  // Función para refrescar todas las vistas cuando cambien los datos
  function handleDataChanged() {
    updateDashboardUI();
    updateJuegosUI();
    updateJugadoresUI();
  }

  // Inicializar UI de secciones
  initJuegosUI(handleDataChanged);
  initJugadoresUI(handleDataChanged);

  // Tab switching por visibilidad nativa de secciones HTML
  const sidebarTabs = document.querySelectorAll('.sidebar-tab');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewJuegos = document.getElementById('view-juegos');
  const viewJugadores = document.getElementById('view-jugadores');

  function renderActiveTab() {
    sidebarTabs.forEach((tab) => {
      if (tab.getAttribute('data-tab') === activeTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Ocultar / Mostrar secciones nativas HTML
    if (viewDashboard) viewDashboard.classList.toggle('hidden', activeTab !== 'dashboard');
    if (viewJuegos) viewJuegos.classList.toggle('hidden', activeTab !== 'juegos');
    if (viewJugadores) viewJugadores.classList.toggle('hidden', activeTab !== 'jugadores');

    // Refrescar datos de la vista activa
    if (activeTab === 'dashboard') updateDashboardUI();
    if (activeTab === 'juegos') updateJuegosUI();
    if (activeTab === 'jugadores') updateJugadoresUI();
  }

  sidebarTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      if (tabId && tabId !== activeTab) {
        activeTab = tabId;
        renderActiveTab();
      }
    });
  });

  renderActiveTab();
}

document.addEventListener('DOMContentLoaded', initApp);
