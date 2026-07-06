import { gsap } from 'gsap';
import { WORLDS } from './data/worlds.js';
import { STATIONS } from './data/stations.js';
import { createInitialState } from './core/gameState.js';
import { startLoop } from './core/gameLoop.js';
import { saveGame, loadGame } from './core/save.js';
import { tickProduction, worldIncomePerSec } from './systems/production.js';
import { upgradeCost } from './systems/costScaling.js';
import { worldCfgById } from './systems/worldUnlock.js';
import { createScene } from './render3d/scene.js';
import {
  buildWorld,
  swapToUnlockedStation,
  disposeObject
} from './render3d/models/worldBuilder.js';
import { WORLD_MODELS } from './render3d/models/registry.js';
import { createEntitySystem } from './render3d/entities.js';
import { createUI } from './ui/render.js';
import { showOfflineModal } from './ui/overlay.js';

// Gespeicherten Stand laden (inkl. Offline-Progress) oder frisch starten.
const loaded = loadGame();
const state = loaded ? loaded.state : createInitialState();

const container = document.getElementById('scene-container');
const scene3d = createScene(container, worldCfgById(state.currentWorld).palette);

const ui = createUI(state, { buy, switchWorld, unlockWorld });

// Die aktive Welt: 3D-Aufbau + belebte Szene. Beim Wechsel komplett neu gebaut.
let active = null;

function activateWorld(worldId) {
  if (active) {
    active.entities.dispose();
    scene3d.scene.remove(active.world3d.group);
    disposeObject(active.world3d.group);
  }

  state.currentWorld = worldId;
  const worldCfg = worldCfgById(worldId);
  const stationCfgs = STATIONS[worldId];

  const world3d = buildWorld(
    scene3d.scene,
    worldCfg,
    stationCfgs,
    state.worlds[worldId].stations,
    WORLD_MODELS[worldId]
  );
  scene3d.setBackground(worldCfg.palette);
  scene3d.setFrameBox(world3d.frameBounds);

  const entities = createEntitySystem(
    scene3d.scene,
    scene3d.camera,
    scene3d.renderer.domElement,
    worldCfg.palette,
    world3d.stationLayout,
    {
      worldGroup: world3d.group,
      isUnlocked: (id) => state.worlds[worldId].stations[id].unlocked,
      getIncomePerSec: () =>
        worldIncomePerSec(stationCfgs, state.worlds[worldId]),
      onTip: collectTip
    }
  );
  for (const cfg of stationCfgs) {
    if (state.worlds[worldId].stations[cfg.id].unlocked) entities.addWorker(cfg.id);
  }

  active = { worldCfg, stationCfgs, world3d, entities };
  ui.setWorld(worldId);
}

function collectTip(amount) {
  state.money += amount;
  ui.pulseMoney();
}

// Station kaufen/freischalten in der AKTIVEN Welt.
function buy(stationId) {
  const cfg = active.stationCfgs.find((s) => s.id === stationId);
  const st = state.worlds[state.currentWorld].stations[stationId];
  if (!cfg) return;

  if (!st.unlocked) {
    if (state.money < cfg.unlockCost) return;
    state.money -= cfg.unlockCost;
    st.unlocked = true;
    st.level = 1;
    const mesh = swapToUnlockedStation(
      active.world3d.group,
      active.world3d.stationMeshes,
      stationId,
      active.worldCfg.palette,
      WORLD_MODELS[state.currentWorld]
    );
    active.entities.addWorker(stationId);
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
  popStationMesh(active.world3d.stationMeshes[stationId]);
}

// Zwischen bereits freigeschalteten Welten wechseln (kostenlos).
function switchWorld(worldId) {
  if (worldId === state.currentWorld) return;
  if (!state.worlds[worldId]?.unlocked) return;
  activateWorld(worldId);
}

// Nächste Welt freischalten (kostet Geld) und direkt hinwechseln.
function unlockWorld(worldCfg) {
  if (state.money < worldCfg.unlockCost) return;
  state.money -= worldCfg.unlockCost;
  state.worlds[worldCfg.id].unlocked = true;
  saveGame(state); // Freischaltung sofort sichern
  activateWorld(worldCfg.id);
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

// Startwelt aufbauen.
activateWorld(state.currentWorld);

// Offline-Ertrag gutschreiben und "Willkommen zurück" zeigen.
if (loaded && loaded.offline) {
  state.money += loaded.offline.earned;
  showOfflineModal(loaded.offline);
}

// Auto-Save: regelmäßig sowie beim Verlassen/Tab-Wechsel.
const AUTOSAVE_INTERVAL = 10;
let saveAcc = 0;

function persist() {
  saveGame(state);
}
window.addEventListener('pagehide', persist);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persist();
});

if (import.meta.env.DEV) {
  window.__ftGame = { state, save: persist, load: loadGame, activateWorld };
}

startLoop(
  (dt) => {
    tickProduction(state, active.stationCfgs, dt);
    active.entities.update(dt);
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
