import { gsap } from 'gsap';
import { WORLDS } from './data/worlds.js';
import { STATIONS } from './data/stations.js';
import { createInitialState } from './core/gameState.js';
import { startLoop } from './core/gameLoop.js';
import { saveGame, loadGame } from './core/save.js';
import { tickProduction, worldIncomePerSec } from './systems/production.js';
import { upgradeCost } from './systems/costScaling.js';
import { createScene } from './render3d/scene.js';
import { buildWorld1, swapToUnlockedStation } from './render3d/models/world1.js';
import { createEntitySystem } from './render3d/entities.js';
import { createUI } from './ui/render.js';
import { showOfflineModal } from './ui/overlay.js';

// Gespeicherten Stand laden (inkl. Offline-Progress) oder frisch starten.
// Vor dem Szenen-Aufbau, damit freigeschaltete Stationen direkt erscheinen.
const loaded = loadGame();
const state = loaded ? loaded.state : createInitialState();
const worldCfg = WORLDS[0];
const stationCfgs = STATIONS[worldCfg.id];

const container = document.getElementById('scene-container');
const scene3d = createScene(container, worldCfg.palette);
const world3d = buildWorld1(
  scene3d.scene,
  worldCfg.palette,
  stationCfgs,
  state.worlds[worldCfg.id].stations
);
scene3d.setFrameBox(world3d.frameBounds);

const worldState = () => state.worlds[state.currentWorld];
const currentIncome = () =>
  worldIncomePerSec(stationCfgs, worldState());

// Belebte Szene: Personal, Kunden, Tap-to-Collect-Trinkgeld.
const entities = createEntitySystem(
  scene3d.scene,
  scene3d.camera,
  scene3d.renderer.domElement,
  worldCfg.palette,
  world3d.stationLayout,
  {
    worldGroup: world3d.group,
    isUnlocked: (id) => worldState().stations[id].unlocked,
    getIncomePerSec: currentIncome,
    onTip: collectTip
  }
);
// Personal an bereits freigeschalteten Stationen aufstellen.
for (const cfg of stationCfgs) {
  if (worldState().stations[cfg.id].unlocked) entities.addWorker(cfg.id);
}

function collectTip(amount) {
  state.money += amount;
  ui.pulseMoney();
}

const ui = createUI(state, worldCfg, stationCfgs, { buy });

// Offline-Ertrag gutschreiben und "Willkommen zurück" zeigen.
if (loaded && loaded.offline) {
  state.money += loaded.offline.earned;
  showOfflineModal(loaded.offline);
}

// Sofortiges visuelles Feedback bei jedem Kauf: Karte blitzt auf,
// die 3D-Station macht einen Pop. Gesperrte Stationen werden beim
// Freischalten in der Szene gegen die ausgebaute Variante getauscht.
function buy(stationId) {
  const cfg = stationCfgs.find((s) => s.id === stationId);
  const st = state.worlds[state.currentWorld].stations[stationId];
  if (!cfg) return;

  if (!st.unlocked) {
    if (state.money < cfg.unlockCost) return;
    state.money -= cfg.unlockCost;
    st.unlocked = true;
    st.level = 1;
    const mesh = swapToUnlockedStation(
      world3d.group,
      world3d.stationMeshes,
      stationId,
      worldCfg.palette
    );
    entities.addWorker(stationId);
    ui.flashCard(stationId);
    popStationMesh(mesh);
    return;
  }

  if (st.level >= cfg.levelCap) return;
  const cost = upgradeCost(cfg, st.level);
  if (state.money < cost) return;

  state.money -= cost;
  st.level += 1;

  ui.flashCard(stationId);
  popStationMesh(world3d.stationMeshes[stationId]);
}

function popStationMesh(mesh) {
  if (!mesh) return;
  gsap.killTweensOf(mesh.scale);
  gsap.fromTo(
    mesh.scale,
    { x: 1.18, y: 1.28, z: 1.18 },
    { x: 1, y: 1, z: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' }
  );
}

// Auto-Save: regelmäßig sowie beim Verlassen/Tab-Wechsel, damit der
// letzte Stand und der Offline-Zeitstempel zuverlässig festgehalten sind.
const AUTOSAVE_INTERVAL = 10; // Sekunden
let saveAcc = 0;

function persist() {
  saveGame(state);
}
// pagehide deckt mobiles App-Wechseln/Schließen ab; visibilitychange den
// Wechsel in den Hintergrund. Beide feuern zuverlässiger als beforeunload.
window.addEventListener('pagehide', persist);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persist();
});

// Debug-Zugriff nur im Dev-Modus (npm run dev), nie im Produktions-Build.
if (import.meta.env.DEV) {
  window.__ftGame = { state, save: persist, load: loadGame };
}

startLoop(
  (dt) => {
    tickProduction(state, stationCfgs, dt);
    entities.update(dt);
    saveAcc += dt;
    if (saveAcc >= AUTOSAVE_INTERVAL) {
      saveAcc = 0;
      persist();
    }
  },
  () => {
    ui.update();
    scene3d.render();
  }
);
