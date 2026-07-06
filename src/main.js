import * as THREE from 'three';
import { gsap } from 'gsap';
import { STATIONS } from './data/stations.js';
import { createInitialState } from './core/gameState.js';
import { startLoop } from './core/gameLoop.js';
import { saveGame, loadGame } from './core/save.js';
import { tickProduction, worldIncomePerSec } from './systems/production.js';
import { upgradeCost } from './systems/costScaling.js';
import { worldCfgById } from './systems/worldUnlock.js';
import { collectNewlyUnlocked, evaluateAchievements } from './systems/achievements.js';
import { createSound } from './systems/sound.js';
import { createMonetizationService } from './systems/monetization.js';
import { createScene } from './render3d/scene.js';
import {
  buildWorld,
  swapToUnlockedStation,
  disposeObject
} from './render3d/models/worldBuilder.js';
import { WORLD_MODELS } from './render3d/models/registry.js';
import { createEntitySystem } from './render3d/entities.js';
import { createParticleSystem } from './render3d/particles.js';
import { createUI } from './ui/render.js';
import {
  showOfflineModal,
  showAchievementToast,
  showAchievementsModal
} from './ui/overlay.js';

// Gespeicherten Stand laden (inkl. Offline-Progress) oder frisch starten.
const loaded = loadGame();
const state = loaded ? loaded.state : createInitialState();

const container = document.getElementById('scene-container');
const scene3d = createScene(container, worldCfgById(state.currentWorld).palette);
const particles = createParticleSystem(scene3d.scene);
const sound = createSound(() => state.muted);
const monetization = createMonetizationService();

const ui = createUI(state, { buy, switchWorld, unlockWorld, hireManager });

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
      tableLayout: world3d.tableLayout,
      isUnlocked: (id) => state.worlds[worldId].stations[id].unlocked,
      isManaged: () => state.worlds[worldId].managerHired,
      getIncomePerSec: () => worldIncomePerSec(stationCfgs, state.worlds[worldId]),
      onTip: collectTip
    }
  );
  for (const cfg of stationCfgs) {
    if (state.worlds[worldId].stations[cfg.id].unlocked) entities.addWorker(cfg.id);
  }

  active = { worldCfg, stationCfgs, world3d, entities };
  ui.setWorld(worldId);
}

function collectTip(amount, worldPos) {
  state.money += amount;
  state.stats.totalEarned += amount;
  state.stats.tipsCollected += 1;
  ui.pulseMoney();
  sound.play('tip');
  if (worldPos) particles.burst(worldPos, { color: 0xffd23f, count: 8, size: 0.7 });
}

// Weltposition (oben) einer Station für Partikel-Bursts.
function stationTop(stationId) {
  const mesh = active.world3d.stationMeshes[stationId];
  const p = mesh.getWorldPosition(new THREE.Vector3());
  p.y += 1.4;
  return p;
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
    sound.play('unlock');
    particles.burst(stationTop(stationId), { color: active.worldCfg.palette.accent, count: 16, power: 1.8 });
    checkAchievements();
    return;
  }

  if (st.level >= cfg.levelCap) return;
  const cost = upgradeCost(cfg, st.level);
  if (state.money < cost) return;

  state.money -= cost;
  st.level += 1;
  ui.flashCard(stationId);
  popStationMesh(active.world3d.stationMeshes[stationId]);
  sound.play('buy');
  particles.burst(stationTop(stationId), { color: 0x9be09e, count: 6, size: 0.7 });
  checkAchievements();
}

// Manager für die aktive Welt einstellen: permanenter ×1.5-Produktionsbonus
// + Auto-Trinkgeld für diesen Truck.
function hireManager(worldCfg) {
  const ws = state.worlds[state.currentWorld];
  if (ws.managerHired || state.money < worldCfg.managerCost) return;
  state.money -= worldCfg.managerCost;
  ws.managerHired = true;
  saveGame(state);
  sound.play('unlock');
  particles.burst(new THREE.Vector3(0, 3, 0), {
    color: worldCfg.palette.accent,
    count: 22,
    power: 2.0,
    size: 1.0
  });
  checkAchievements();
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
  saveGame(state);
  activateWorld(worldCfg.id);
  sound.play('world');
  particles.burst(new THREE.Vector3(0, 3, 0), { color: worldCfg.palette.accent, count: 30, power: 2.4, size: 1.2 });
  checkAchievements();
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

// Neu erreichte Achievements: Toast + Sound.
function checkAchievements() {
  const newly = collectNewlyUnlocked(state);
  for (const ach of newly) {
    showAchievementToast(ach);
    sound.play('achievement');
  }
}

// ---------- Topbar-Buttons ----------
const btnAch = document.getElementById('btn-achievements');
const btnMute = document.getElementById('btn-mute');

btnAch.addEventListener('click', () => {
  sound.unlock();
  showAchievementsModal(evaluateAchievements(state));
});

function refreshMuteIcon() {
  btnMute.textContent = state.muted ? '🔈' : '🔊';
  btnMute.classList.toggle('muted', state.muted);
}
btnMute.addEventListener('click', () => {
  state.muted = !state.muted;
  refreshMuteIcon();
  if (!state.muted) sound.play('buy');
  persist();
});
refreshMuteIcon();

// Startwelt aufbauen.
activateWorld(state.currentWorld);

// Offline-Ertrag gutschreiben, "Willkommen zurück" zeigen – inkl. Verdopplung
// per (gestubbter) Rewarded Ad über den MonetizationService.
if (loaded && loaded.offline) {
  state.money += loaded.offline.earned;
  state.stats.totalEarned += loaded.offline.earned;
  showOfflineModal(loaded.offline, {
    onDouble: (earned, confirm) => {
      monetization.showRewardedAd(() => {
        state.money += earned; // Belohnung: nochmal denselben Betrag = verdoppelt
        state.stats.totalEarned += earned;
        confirm();
      });
    }
  });
}

// Auto-Save: regelmäßig sowie beim Verlassen/Tab-Wechsel.
const AUTOSAVE_INTERVAL = 10;
let saveAcc = 0;
let achAcc = 0;

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

    // Meilenstein-/Verdienst-Achievements periodisch prüfen (nicht jeden Frame).
    achAcc += dt;
    if (achAcc >= 1) {
      achAcc = 0;
      checkAchievements();
    }

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
