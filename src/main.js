// Bootstrap: State laden (ab Phase 4) → UI initialisieren → Loop starten.

import './style.css';
import { state } from './core/gameState.js';
import { startLoop, onTick, onRender } from './core/gameLoop.js';
import { getTotalIncome, earn } from './systems/production.js';
import { initUI, render } from './ui/render.js';

onTick((dt) => {
  earn(state, getTotalIncome(state) * dt);
  state.stats.playtimeMs += dt * 1000;
});

onRender((dt) => render(dt));

initUI();
startLoop();

// Debug-Zugriff für Tests & Balancing – nur im Dev-Build.
if (import.meta.env.DEV) {
  window.__game = { state };
}
