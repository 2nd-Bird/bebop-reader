import './app-v08.js';
import { mountSession } from './src/session/player.js';

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
}

window.addEventListener('hashchange', () => queueMicrotask(routeV09));
queueMicrotask(routeV09);
