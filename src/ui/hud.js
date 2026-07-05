import { state } from '../core/state.js';
import { STATIONS, incomePerSecond } from '../data/stations.js';
import { totalIncomePerSecond } from '../systems/production.js';
import { costFor, canUpgrade, tryUpgrade } from '../systems/upgrades.js';
import { formatMoney, formatRate } from '../utils/format.js';
import { unlockStandVisual } from './scene.js';

let moneyEl;
let incomeEl;
const cards = new Map();

export function initHud() {
  moneyEl = document.getElementById('hud-money-value');
  incomeEl = document.getElementById('hud-income-value');
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

export function updateHud() {
  moneyEl.textContent = `$${formatMoney(state.money)}`;
  incomeEl.textContent = `$${formatRate(totalIncomePerSecond())}`;
  for (const { def, meta, btn } of cards.values()) {
    const level = state.stations[def.id].level;
    if (level === 0) {
      meta.textContent = `Gesperrt · bringt $${formatRate(incomePerSecond(def, 1))}/s`;
      btn.textContent = `Freischalten $${formatMoney(costFor(def.id))}`;
    } else {
      meta.textContent = `Level ${level} · $${formatRate(incomePerSecond(def, level))}/s`;
      btn.textContent = `Upgrade $${formatMoney(costFor(def.id))}`;
    }
    btn.disabled = !canUpgrade(def.id);
  }
}
