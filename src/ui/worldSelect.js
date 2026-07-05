// Welt-Auswahl-Screen: zeigt alle Welten als Karten — aktiv, wechselbar,
// als Nächstes freischaltbar (hohe Kostenkurve, bezahlt aus der aktiven
// Welt) oder noch verborgen. Wechsel/Freischalten baut Szene + Panel neu.
import { state } from '../core/state.js';
import { WORLDS, TOTAL_WORLDS } from '../data/worlds.js';
import { LOCATIONS, getLocation } from '../data/locations.js';
import {
  isWorldUnlocked,
  nextWorldIndex,
  canUnlockNextWorld,
  unlockNextWorld,
  switchWorld,
  worldSnapshot,
} from '../systems/worlds.js';
import { playSound } from '../systems/sound.js';
import { formatMoney } from '../utils/format.js';
import { buildScene, startWorkerAnimations } from './scene.js';
import { rebuildStationCards, updateHud } from './hud.js';
import { showToast } from './toast.js';

export function initWorldSelect() {
  document
    .getElementById('worlds-btn')
    .addEventListener('click', openWorldSelect);
}

function applyWorldChange() {
  buildScene(document.getElementById('scene'));
  startWorkerAnimations();
  rebuildStationCards();
  updateHud();
}

function cardHtml(index) {
  const world = WORLDS[index];
  const unlocked = isWorldUnlocked(index);
  const isActive = index === state.worldIndex;
  const isNext = index === nextWorldIndex();

  if (unlocked) {
    const snap = worldSnapshot(index);
    const loc = getLocation(snap.locationIndex);
    return `
      <div class="world-card${isActive ? ' active' : ''}" data-world="${index}">
        <div class="world-emoji">${world.signature.emoji}</div>
        <div class="world-info">
          <div class="world-name">${world.name}</div>
          <div class="world-meta">${world.tagline}</div>
          <div class="world-meta">📍 ${loc.name} (${snap.locationIndex + 1}/${LOCATIONS.length}) · 💰 $${formatMoney(snap.money)}</div>
        </div>
        ${
          isActive
            ? '<span class="world-active-tag">Aktiv</span>'
            : '<button class="world-btn world-switch-btn" type="button">Wechseln</button>'
        }
      </div>`;
  }

  if (isNext) {
    const affordable = canUnlockNextWorld();
    return `
      <div class="world-card locked" data-world="${index}">
        <div class="world-emoji">${world.signature.emoji}</div>
        <div class="world-info">
          <div class="world-name">${world.name}</div>
          <div class="world-meta">${world.tagline} · Signature: ${world.signature.dish}</div>
          <div class="world-meta">Bezahlt mit Geld der aktiven Welt</div>
        </div>
        <button class="world-btn world-unlock-btn" type="button" ${affordable ? '' : 'disabled'}>
          🔓 $${formatMoney(world.unlockCost)}
        </button>
      </div>`;
  }

  return `
    <div class="world-card hidden-world">
      <div class="world-emoji">❔</div>
      <div class="world-info">
        <div class="world-name">???</div>
        <div class="world-meta">Schalte erst die vorherige Welt frei</div>
      </div>
    </div>`;
}

export function openWorldSelect() {
  const root = document.getElementById('modal-root');
  const cardsHtml = Array.from({ length: TOTAL_WORLDS }, (_, i) =>
    i < WORLDS.length
      ? cardHtml(i)
      : `
      <div class="world-card hidden-world">
        <div class="world-emoji">🚧</div>
        <div class="world-info">
          <div class="world-name">???</div>
          <div class="world-meta">Bald verfügbar</div>
        </div>
      </div>`
  ).join('');

  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card world-modal">
        <button class="world-close" type="button" aria-label="Schließen">✕</button>
        <h2>🌍 Welten</h2>
        <div class="world-grid">${cardsHtml}</div>
      </div>
    </div>`;

  const overlay = root.querySelector('.modal-overlay');
  const card = root.querySelector('.modal-card');
  gsap.from(card, { scale: 0.85, opacity: 0, duration: 0.3, ease: 'back.out(1.6)' });

  function close() {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        root.innerHTML = '';
      },
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  root.querySelector('.world-close').addEventListener('click', close);

  for (const btn of root.querySelectorAll('.world-switch-btn')) {
    btn.addEventListener('click', () => {
      const index = Number(btn.closest('.world-card').dataset.world);
      if (!switchWorld(index)) return;
      playSound('move');
      applyWorldChange();
      close();
    });
  }

  const unlockBtn = root.querySelector('.world-unlock-btn');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      const index = nextWorldIndex();
      if (!unlockNextWorld()) return;
      playSound('unlock');
      showToast(
        `${WORLDS[index].signature.emoji} <b>${WORLDS[index].name}</b><br>Neue Welt freigeschaltet!`
      );
      applyWorldChange();
      close();
    });
  }
}
