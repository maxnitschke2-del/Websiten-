import { gsap } from 'gsap';
import { WORLDS } from './data/worlds.js';
import { STATIONS } from './data/stations.js';
import { createInitialState } from './core/gameState.js';
import { startLoop } from './core/gameLoop.js';
import { tickProduction } from './systems/production.js';
import { upgradeCost } from './systems/costScaling.js';
import { createScene } from './render3d/scene.js';
import { buildWorld1 } from './render3d/models/world1.js';
import { createUI } from './ui/render.js';

const state = createInitialState();
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

const ui = createUI(state, worldCfg, stationCfgs, { upgrade });

// Sofortiges visuelles Feedback bei jedem Kauf: Karte blitzt auf,
// die 3D-Station macht einen Pop.
function upgrade(stationId) {
  const cfg = stationCfgs.find((s) => s.id === stationId);
  const st = state.worlds[state.currentWorld].stations[stationId];
  if (!cfg || !st.unlocked || st.level >= cfg.levelCap) return;

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

startLoop(
  (dt) => tickProduction(state, stationCfgs, dt),
  () => {
    ui.update();
    scene3d.render();
  }
);
