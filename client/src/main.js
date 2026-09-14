import { renderDashboardView } from './views/dashboardView.js';
import { renderVideojuegosView } from './views/videojuegosView.js';
import { renderJugadoresView } from './views/jugadoresView.js';

let activeTab = 'dashboard';

function initApp() {
  const appContent = document.getElementById('app-content');
  const sidebarTabs = document.querySelectorAll('.sidebar-tab');

  function renderActiveTab() {
    sidebarTabs.forEach((tab) => {
      if (tab.getAttribute('data-tab') === activeTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    if (!appContent) return;

    if (activeTab === 'dashboard') {
      renderDashboardView(appContent);
    } else if (activeTab === 'juegos') {
      renderVideojuegosView(appContent);
    } else if (activeTab === 'jugadores') {
      renderJugadoresView(appContent);
    }
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
