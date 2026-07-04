// DOM-Rendering & Input – strikt getrennt von der Spiellogik.
// Liest State, ruft System-Funktionen für Aktionen auf.

import { state } from '../core/gameState.js';
import { GENERATORS } from '../data/generators.js';
import {
  getTotalIncome,
  getGeneratorIncome,
  getClickValue,
  earn,
} from '../systems/production.js';
import { getCost, buyGenerator } from '../systems/costScaling.js';
import { formatMoney, formatRate, formatNumber } from '../utils/formatNumber.js';
import { initJuice, spawnFloaty, pulse, burstEmojis, playSound } from './juice.js';

const els = {};

// Geldanzeige zählt weich hoch statt zu springen.
let displayedMoney = 0;

// Listen-Updates auf ~10 fps drosseln, Geldanzeige läuft jeden Frame.
const LIST_INTERVAL = 0.1;
let listTimer = 0;

export function initUI() {
  document.getElementById('app').innerHTML = `
    <header class="hud">
      <h1 class="hud-title">🚚 Food Truck Empire</h1>
      <div class="hud-money" id="money">0 €</div>
      <div class="hud-rate" id="rate">0 €/s</div>
    </header>
    <main class="main">
      <section class="click-area">
        <button id="click-truck" class="click-truck" aria-label="Verkaufen!">🚚</button>
        <p class="click-hint">Tippe den Truck und verkaufe Snacks!</p>
      </section>
      <section id="generators" class="generators"></section>
    </main>
    <div id="fx-layer"></div>
  `;

  els.money = document.getElementById('money');
  els.rate = document.getElementById('rate');
  els.truck = document.getElementById('click-truck');
  els.generators = document.getElementById('generators');

  initJuice();
  buildGeneratorList();
  bindEvents();
  displayedMoney = state.money;
  updateGeneratorList();
}

function buildGeneratorList() {
  els.generators.innerHTML = GENERATORS.map(
    (gen) => `
    <article class="gen-card" data-id="${gen.id}">
      <div class="gen-emoji">${gen.emoji}</div>
      <div class="gen-info">
        <div class="gen-name">${gen.name} <span class="gen-owned" data-owned>×0</span></div>
        <div class="gen-income" data-income>${formatRate(gen.baseIncome)} pro Stück</div>
      </div>
      <button class="buy-btn" data-buy="${gen.id}">
        <span class="buy-label">Kaufen</span>
        <span class="buy-cost" data-cost>${formatMoney(gen.baseCost)}</span>
      </button>
    </article>`
  ).join('');
}

function bindEvents() {
  // Klick-Truck: sofortiges Feedback bei jedem Tap.
  els.truck.addEventListener('pointerdown', (e) => {
    const value = getClickValue(state);
    earn(state, value);
    state.stats.clicks++;
    pulse(els.truck, 0.15);
    spawnFloaty(e.clientX, e.clientY - 10, '+' + formatMoney(value));
    playSound('click');
  });

  // Kauf-Buttons (Event-Delegation).
  els.generators.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-buy]');
    if (!btn) return;
    const gen = GENERATORS.find((g) => g.id === btn.dataset.buy);
    if (buyGenerator(state, gen.id, 1)) {
      const rect = btn.getBoundingClientRect();
      pulse(btn);
      burstEmojis(rect.left + rect.width / 2, rect.top + rect.height / 2, gen.emoji);
      playSound('buy');
      updateGeneratorList();
    }
  });
}

export function render(dt) {
  // Weiches Hochzählen: nähert sich dem echten Wert exponentiell an.
  const diff = state.money - displayedMoney;
  displayedMoney =
    Math.abs(diff) < 0.01 ? state.money : displayedMoney + diff * Math.min(1, dt * 8);
  els.money.textContent = formatMoney(displayedMoney);

  listTimer += dt;
  if (listTimer >= LIST_INTERVAL) {
    listTimer = 0;
    els.rate.textContent = formatRate(getTotalIncome(state));
    updateGeneratorList();
  }
}

function updateGeneratorList() {
  for (const card of els.generators.children) {
    const gen = GENERATORS.find((g) => g.id === card.dataset.id);
    const owned = state.generators[gen.id].owned;
    const cost = getCost(gen.id, owned, 1);
    card.querySelector('[data-owned]').textContent = '×' + formatNumber(owned);
    card.querySelector('[data-income]').textContent =
      owned > 0
        ? formatRate(getGeneratorIncome(state, gen.id)) + ' gesamt'
        : formatRate(gen.baseIncome) + ' pro Stück';
    card.querySelector('[data-cost]').textContent = formatMoney(cost);
    card.querySelector('[data-buy]').disabled = state.money < cost;
  }
}
