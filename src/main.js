// Bootstrap: Save laden → UI initialisieren → Loop starten.

import './style.css';
import { state } from './core/gameState.js';
import { startLoop, onTick, onRender } from './core/gameLoop.js';
import { getTotalIncome, earn } from './systems/production.js';
import { autoBuyTick } from './systems/automation.js';
import {
  load,
  save,
  initAutosave,
  applyOfflineProgress,
} from './core/save.js';
import { initUI, render, showWelcomeBack } from './ui/render.js';

const offline = load();

let autoBuyTimer = 0;

onTick((dt) => {
  earn(state, getTotalIncome(state) * dt);
  state.stats.playtimeMs += dt * 1000;

  autoBuyTimer += dt;
  if (autoBuyTimer >= 1) {
    autoBuyTimer = 0;
    autoBuyTick(state);
  }
});

onRender((dt) => render(dt));

initUI();
startLoop();
initAutosave();

if (offline) showWelcomeBack(offline);

// Tab war im Hintergrund (rAF pausiert): Zeit als Offline-Progress verrechnen.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    const result = applyOfflineProgress();
    save();
    if (result) showWelcomeBack(result);
  }
});

// Debug-Zugriff für Tests & Balancing – nur im Dev-Build.
if (import.meta.env.DEV) {
  window.__game = { state };
}
