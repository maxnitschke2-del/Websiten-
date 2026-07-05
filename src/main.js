import { state, loadState, saveState } from './core/state.js';
import { startLoop } from './core/loop.js';
import { tick } from './systems/production.js';
import { startCustomers } from './systems/customers.js';
import { initTips } from './systems/tips.js';
import { computeOfflineEarnings } from './systems/offline.js';
import { buildScene, startWorkerAnimations } from './ui/scene.js';
import { initHud, updateHud } from './ui/hud.js';
import { showOfflineModal } from './ui/modal.js';

loadState();

// Offline-Verdienst sofort gutschreiben (bevor der erste Autosave
// lastSeen überschreibt), das Modal zeigt ihn danach nur noch an.
const offline = computeOfflineEarnings();
if (offline) state.money += offline.amount;

buildScene(document.getElementById('scene'));
startWorkerAnimations();
initHud();
initTips();
startCustomers();
if (offline) showOfflineModal(offline);

startLoop((dt) => {
  tick(dt);
  updateHud();
});

setInterval(saveState, 5000);
window.addEventListener('beforeunload', saveState);
