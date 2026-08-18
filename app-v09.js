import './app-v08.js';
import { mountSession } from './src/session/player.js';
import { renderV09Home, renderV09Library, renderV09Progress } from './src/ui/dashboardV09.js';

const app = document.querySelector('#app');
const navigate = path => { location.hash = path.startsWith('#') ? path : `#${path}`; };
let disposeSession = null;

function routeV09() {
  const parts = location.hash.replace(/^#/, '').split('/').filter(Boolean);
  if (parts[0] === 'session') {
    disposeSession?.();
    disposeSession = mountSession({ app, navigate });
    return;
  }
  if (disposeSession) {
    disposeSession();
    disposeSession = null;
  }
  if (!parts.length) {
    renderV09Home({ app, navigate });
    return;
  }
  if (parts[0] === 'library') {
    renderV09Library({ app, navigate });
    return;
  }
  if (parts[0] === 'progress') {
    renderV09Progress({ app, navigate });
  }
}

window.addEventListener('hashchange', () => queueMicrotask(routeV09));
queueMicrotask(routeV09);
