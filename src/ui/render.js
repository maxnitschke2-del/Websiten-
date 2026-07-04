// DOM-Rendering & Input – strikt getrennt von der Spiellogik.
// Liest State, ruft System-Funktionen für Aktionen auf.

import { state } from '../core/gameState.js';
import { GENERATOR_MAP } from '../data/generators.js';
import {
  getTotalIncome,
  getGeneratorIncome,
  getClickValue,
  earn,
} from '../systems/production.js';
import {
  getCost,
  getMaxBuyCount,
  buyGenerator,
} from '../systems/costScaling.js';
import { getVisibleGenerators } from '../systems/unlocks.js';
import { formatMoney, formatRate, formatNumber } from '../utils/formatNumber.js';
import { initJuice, spawnFloaty, pulse, burstEmojis, playSound } from './juice.js';

const els = {};

// Geldanzeige zählt weich hoch statt zu springen.
let displayedMoney = 0;

// Kaufmodus: 1 | 10 | 'max' – reiner UI-Zustand, wird nicht gespeichert.
let buyMode = 1;

// Merkt sich, welche Karten gerade gerendert sind; bei Unlock-Änderung
// wird die Liste neu aufgebaut statt jede Karte einzeln zu patchen.
let listKey = '';

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
      <div class="buy-mode" id="buy-mode">
        <span class="buy-mode-label">Kaufen:</span>
        <button data-mode="1" class="active">×1</button>
        <button data-mode="10">×10</button>
        <button data-mode="max">Max</button>
      </div>
      <section id="generators" class="generators"></section>
    </main>
    <div id="fx-layer"></div>
  `;

  els.money = document.getElementById('money');
  els.rate = document.getElementById('rate');
  els.truck = document.getElementById('click-truck');
  els.generators = document.getElementById('generators');
  els.buyMode = document.getElementById('buy-mode');

  initJuice();
  bindEvents();
  displayedMoney = state.money;
  syncGeneratorList(true);
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

  // Kaufmodus-Umschalter.
  els.buyMode.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    buyMode = btn.dataset.mode === 'max' ? 'max' : Number(btn.dataset.mode);
    for (const b of els.buyMode.querySelectorAll('[data-mode]')) {
      b.classList.toggle('active', b === btn);
    }
    updateGeneratorList();
  });

  // Kauf-Buttons (Event-Delegation).
  els.generators.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-buy]');
    if (!btn || btn.disabled) return;
    const gen = GENERATOR_MAP[btn.dataset.buy];
    const owned = state.generators[gen.id].owned;
    const count =
      buyMode === 'max' ? getMaxBuyCount(gen.id, owned, state.money) : buyMode;
    if (buyGenerator(state, gen.id, count)) {
      const rect = btn.getBoundingClientRect();
      pulse(btn);
      burstEmojis(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        gen.emoji,
        Math.min(4 + count, 14)
      );
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
    syncGeneratorList();
  }
}

/** Baut die Liste neu auf, wenn sich Unlocks geändert haben, sonst nur Update. */
function syncGeneratorList(force = false) {
  const visible = getVisibleGenerators(state);
  const key = visible.map((v) => v.gen.id + (v.unlocked ? '+' : '?')).join(',');
  if (force || key !== listKey) {
    listKey = key;
    buildGeneratorList(visible);
  }
  updateGeneratorList();
}

function buildGeneratorList(visible) {
  els.generators.innerHTML = visible
    .map(({ gen, unlocked }) =>
      unlocked
        ? `
    <article class="gen-card" data-id="${gen.id}">
      <div class="gen-emoji">${gen.emoji}</div>
      <div class="gen-info">
        <div class="gen-name">${gen.name} <span class="gen-owned" data-owned>×0</span></div>
        <div class="gen-income" data-income></div>
      </div>
      <button class="buy-btn" data-buy="${gen.id}">
        <span class="buy-label" data-buy-label>Kaufen</span>
        <span class="buy-cost" data-cost></span>
      </button>
    </article>`
        : `
    <article class="gen-card gen-card--teaser" data-id="${gen.id}">
      <div class="gen-emoji">❓</div>
      <div class="gen-info">
        <div class="gen-name">???</div>
        <div class="gen-income">Verdiene ${formatMoney(gen.unlockAt)}, um freizuschalten</div>
      </div>
    </article>`
    )
    .join('');
}

function updateGeneratorList() {
  for (const card of els.generators.children) {
    if (card.classList.contains('gen-card--teaser')) continue;
    const gen = GENERATOR_MAP[card.dataset.id];
    const owned = state.generators[gen.id].owned;

    let count = buyMode === 'max' ? getMaxBuyCount(gen.id, owned, state.money) : buyMode;
    const affordable = count > 0 || buyMode !== 'max';
    if (count < 1) count = 1; // Max ohne Budget: Kosten für 1 anzeigen
    const cost = getCost(gen.id, owned, count);

    card.querySelector('[data-owned]').textContent = '×' + formatNumber(owned);
    card.querySelector('[data-income]').textContent =
      owned > 0
        ? formatRate(getGeneratorIncome(state, gen.id)) + ' gesamt'
        : formatRate(gen.baseIncome) + ' pro Stück';
    card.querySelector('[data-buy-label]').textContent =
      count > 1 ? `Kaufen ×${formatNumber(count)}` : 'Kaufen';
    card.querySelector('[data-cost]').textContent = formatMoney(cost);
    card.querySelector('[data-buy]').disabled =
      !affordable || state.money < cost;
  }
}
