import { state, loadState, saveState } from './core/state.js';
import { startLoop } from './core/loop.js';
import { tick } from './systems/production.js';
import { startCustomers } from './systems/customers.js';
import { initTips } from './systems/tips.js';
import { computeOfflineEarnings } from './systems/offline.js';
import { checkAchievements, onAchievementUnlocked } from './systems/achievements.js';
import { initSound, playSound } from './systems/sound.js';
import { buildScene, startWorkerAnimations } from './ui/scene.js';
import { initHud, updateHud, renderAchievements } from './ui/hud.js';
import { showOfflineModal } from './ui/modal.js';
import { showToast } from './ui/toast.js';

loadState();

// Offline-Verdienst sofort gutschreiben (bevor der erste Autosave
// lastSeen überschreibt), das Modal zeigt ihn danach nur noch an.
const offline = computeOfflineEarnings();
if (offline) state.money += offline.amount;

buildScene(document.getElementById('scene'));
startWorkerAnimations();
initSound();
initHud();
initTips();
startCustomers();
if (offline) showOfflineModal(offline);

onAchievementUnlocked((def) => {
  playSound('achievement');
  showToast(`${def.emoji} <b>${def.name}</b><br>${def.desc}`);
  renderAchievements();
});

startLoop((dt) => {
  tick(dt);
  checkAchievements();
  updateHud();
});

setInterval(saveState, 5000);
window.addEventListener('beforeunload', saveState);
