import { loadState, saveState } from './core/state.js';
import { startLoop } from './core/loop.js';
import { tick } from './systems/production.js';
import { startCustomers } from './systems/customers.js';
import { initTips } from './systems/tips.js';
import { buildScene, startWorkerAnimation } from './ui/scene.js';
import { initHud, updateHud } from './ui/hud.js';

loadState();
buildScene(document.getElementById('scene'));
startWorkerAnimation();
initHud();
initTips();
startCustomers();

startLoop((dt) => {
  tick(dt);
  updateHud();
});

setInterval(saveState, 5000);
window.addEventListener('beforeunload', saveState);
