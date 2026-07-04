// Bootstrap: Save laden → UI initialisieren → Loop starten.

import './style.css';
import { state } from './core/gameState.js';
import { startLoop, onTick, onRender } from './core/gameLoop.js';
import { getTotalIncome, earn } from './systems/production.js';
import { autoBuyTick, autoClickTick } from './systems/automation.js';
import { checkAchievements } from './systems/unlocks.js';
import {
  load,
  save,
  initAutosave,
  applyOfflineProgress,
} from './core/save.js';
import {
  initUI,
  render,
  showWelcomeBack,
  celebrateAchievements,
  autoClickFeedback,
} from './ui/render.js';

const offline = load();

let autoTimer = 0;
let achievementTimer = 0;

onTick((dt) => {
  earn(state, getTotalIncome(state) * dt);
  state.stats.playtimeMs += dt * 1000;

  autoTimer += dt;
  if (autoTimer >= 1) {
    autoTimer = 0;
    autoBuyTick(state);
    const clicked = autoClickTick(state);
    if (clicked > 0) autoClickFeedback(clicked);
  }

  achievementTimer += dt;
  if (achievementTimer >= 0.5) {
    achievementTimer = 0;
    const newly = checkAchievements(state);
    if (newly.length > 0) celebrateAchievements(newly);
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
