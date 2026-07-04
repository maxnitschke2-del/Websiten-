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
  buyUpgrade,
} from '../systems/costScaling.js';
import { getVisibleGenerators, getVisibleUpgrades } from '../systems/unlocks.js';
import { formatMoney, formatRate, formatNumber } from '../utils/formatNumber.js';
import { initJuice, spawnFloaty, pulse, burstEmojis, playSound } from './juice.js';

const els = {};

// Geldanzeige zählt weich hoch statt zu springen.
let displayedMoney = 0;

// Kaufmodus: 1 | 10 | 'max' – reiner UI-Zustand, wird nicht gespeichert.
let buyMode = 1;

// Merkt sich gerenderte Listen; bei Änderung wird neu aufgebaut
// statt jede Karte einzeln zu patchen.
let genListKey = '';
let upgradeListKey = '';

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
      <section class="tab active" id="tab-trucks">
        <div class="click-area">
          <button id="click-truck" class="click-truck" aria-label="Verkaufen!">🚚</button>
          <p class="click-hint">Tippe den Truck und verkaufe Snacks!</p>
        </div>
        <div class="buy-mode" id="buy-mode">
          <span class="buy-mode-label">Kaufen:</span>
          <button data-mode="1" class="active">×1</button>
          <button data-mode="10">×10</button>
          <button data-mode="max">Max</button>
        </div>
        <div id="generators" class="generators"></div>
      </section>
      <section class="tab" id="tab-upgrades">
        <div id="upgrades" class="upgrades"></div>
      </section>
    </main>
    <nav class="tab-bar">
      <button data-tab="trucks" class="active">🚚<span>Trucks</span></button>
      <button data-tab="upgrades">💼<span>Upgrades</span><em class="badge" id="upgrade-badge" hidden></em></button>
    </nav>
    <div id="fx-layer"></div>
  `;

  els.money = document.getElementById('money');
  els.rate = document.getElementById('rate');
  els.truck = document.getElementById('click-truck');
  els.generators = document.getElementById('generators');
  els.buyMode = document.getElementById('buy-mode');
  els.upgrades = document.getElementById('upgrades');
  els.upgradeBadge = document.getElementById('upgrade-badge');
  els.tabBar = document.querySelector('.tab-bar');

  initJuice();
  bindEvents();
  displayedMoney = state.money;
  syncGeneratorList(true);
  syncUpgradeList(true);
}

function bindEvents() {
  // Tab-Navigation.
  els.tabBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    for (const b of els.tabBar.querySelectorAll('[data-tab]')) {
      b.classList.toggle('active', b === btn);
    }
    for (const tab of document.querySelectorAll('.tab')) {
      tab.classList.toggle('active', tab.id === 'tab-' + btn.dataset.tab);
    }
  });

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

  // Truck-Kauf (Event-Delegation).
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

  // Upgrade-Kauf (Event-Delegation).
  els.upgrades.addEventListener('click', (e) => {
    const card = e.target.closest('[data-upgrade]');
    if (!card || card.classList.contains('locked')) return;
    const up = getVisibleUpgrades(state).find(
      (u) => u.id === card.dataset.upgrade
    );
    if (up && buyUpgrade(state, up)) {
      const rect = card.getBoundingClientRect();
      burstEmojis(rect.left + rect.width / 2, rect.top + rect.height / 2, up.emoji, 10);
      playSound('buy');
      syncUpgradeList(true);
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
    syncUpgradeList();
  }
}

/* ---------- Generatoren ---------- */

function syncGeneratorList(force = false) {
  const visible = getVisibleGenerators(state);
  const key = visible.map((v) => v.gen.id + (v.unlocked ? '+' : '?')).join(',');
  if (force || key !== genListKey) {
    genListKey = key;
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

/* ---------- Upgrades ---------- */

function syncUpgradeList(force = false) {
  const visible = getVisibleUpgrades(state);
  const key = visible.map((u) => u.id).join(',');
  if (force || key !== upgradeListKey) {
    upgradeListKey = key;
    buildUpgradeList(visible);
  }
  updateUpgradeList(visible);
}

function buildUpgradeList(visible) {
  if (visible.length === 0) {
    els.upgrades.innerHTML = `
      <p class="empty-hint">Aktuell keine Upgrades verfügbar.<br>
      Kaufe mehr Trucks, um neue freizuschalten!</p>`;
    return;
  }
  els.upgrades.innerHTML = visible
    .map(
      (up) => `
    <article class="upgrade-card" data-upgrade="${up.id}">
      <div class="gen-emoji">${up.emoji}</div>
      <div class="gen-info">
        <div class="gen-name">${up.name}</div>
        <div class="gen-income">${up.desc}</div>
      </div>
      <span class="upgrade-cost" data-cost>${formatMoney(up.cost)}</span>
    </article>`
    )
    .join('');
}

function updateUpgradeList(visible) {
  let affordableCount = 0;
  for (const card of els.upgrades.querySelectorAll('[data-upgrade]')) {
    const up = visible.find((u) => u.id === card.dataset.upgrade);
    if (!up) continue;
    const locked = state.money < up.cost;
    card.classList.toggle('locked', locked);
    if (!locked) affordableCount++;
  }
  els.upgradeBadge.hidden = affordableCount === 0;
  els.upgradeBadge.textContent = affordableCount;
}
