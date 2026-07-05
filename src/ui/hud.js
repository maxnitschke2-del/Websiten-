import { state } from '../core/state.js';
import { STATIONS } from '../data/stations.js';
import { totalIncomePerSecond } from '../systems/production.js';
import { costFor, canUpgrade, tryUpgrade, isAtCap } from '../systems/upgrades.js';
import {
  currentLocation,
  stationIncome,
  stationsAtCap,
  levelCap,
  prestigeMultiplier,
  canMove,
  isFinalLocation,
  moveToNextLocation,
  BONUS_PER_CITY,
} from '../systems/progression.js';
import { LOCATIONS, getLocation } from '../data/locations.js';
import { formatMoney, formatRate } from '../utils/format.js';
import { unlockStandVisual, buildScene, startWorkerAnimations } from './scene.js';

let moneyEl;
let incomeEl;
let locNameEl;
let locProgressEl;
let locBonusEl;
let moveBtn;
const cards = new Map();

export function initHud() {
  moneyEl = document.getElementById('hud-money-value');
  incomeEl = document.getElementById('hud-income-value');
  locNameEl = document.getElementById('loc-name');
  locProgressEl = document.getElementById('loc-progress');
  locBonusEl = document.getElementById('loc-bonus');
  moveBtn = document.getElementById('move-btn');
  moveBtn.addEventListener('click', () => {
    if (!moveToNextLocation()) return;
    // Neue Stadt: Szene mit neuem Theme und zurückgesetzten Ständen aufbauen
    buildScene(document.getElementById('scene'));
    startWorkerAnimations();
    updateHud();
  });
  const panel = document.getElementById('panel');

  for (const def of STATIONS) {
    const card = document.createElement('div');
    card.className = 'station-card';
    card.innerHTML = `
      <div class="station-emoji">${def.emoji}</div>
      <div class="station-info">
        <div class="station-name">${def.name}</div>
        <div class="station-meta"></div>
      </div>
      <button class="upgrade-btn"></button>`;
    const btn = card.querySelector('.upgrade-btn');
    btn.addEventListener('click', () => {
      const wasLocked = state.stations[def.id].level === 0;
      if (tryUpgrade(def.id)) {
        if (wasLocked) unlockStandVisual(def.id);
        updateHud();
      }
    });
    panel.appendChild(card);
    cards.set(def.id, { def, meta: card.querySelector('.station-meta'), btn });
  }
  updateHud();
}

function updateLocationBar() {
  const loc = currentLocation();
  locNameEl.textContent = `📍 ${loc.name} (${state.locationIndex + 1}/${LOCATIONS.length})`;

  const bonus = Math.round((prestigeMultiplier() - 1) * 100);
  locBonusEl.hidden = bonus === 0;
  locBonusEl.textContent = `🏆 +${bonus}% Basis-Bonus`;

  if (canMove()) {
    const next = getLocation(state.locationIndex + 1);
    moveBtn.hidden = false;
    moveBtn.textContent = `🚚 Umzug: ${next.name} (+${Math.round(BONUS_PER_CITY * 100)}% Bonus)`;
    locProgressEl.textContent = 'Alle Stationen am Maximum!';
  } else {
    moveBtn.hidden = true;
    locProgressEl.textContent =
      isFinalLocation() && stationsAtCap() === cards.size
        ? 'Alle Städte gemeistert! 🎉'
        : `${stationsAtCap()}/${cards.size} Stationen am Max (Cap: Level ${levelCap()})`;
  }
}

export function updateHud() {
  moneyEl.textContent = `$${formatMoney(state.money)}`;
  incomeEl.textContent = `$${formatRate(totalIncomePerSecond())}`;
  updateLocationBar();
  for (const { def, meta, btn } of cards.values()) {
    const level = state.stations[def.id].level;
    if (level === 0) {
      meta.textContent = `Gesperrt · bringt $${formatRate(stationIncome(def, 1))}/s`;
      btn.textContent = `Freischalten $${formatMoney(costFor(def.id))}`;
    } else {
      meta.textContent = `Level ${level}/${levelCap()} · $${formatRate(stationIncome(def, level))}/s`;
      btn.textContent = isAtCap(def.id)
        ? 'MAX'
        : `Upgrade $${formatMoney(costFor(def.id))}`;
    }
    btn.disabled = !canUpgrade(def.id);
  }
}
