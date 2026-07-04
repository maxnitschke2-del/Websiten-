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
import {
  getFameGain,
  getFameMultiplier,
  canPrestige,
  doPrestige,
  getCurrentCity,
  getNextCity,
  FAME_MULT_PER_POINT,
} from '../systems/prestige.js';
import {
  canUnlockAutoBuyer,
  unlockAutoBuyer,
  AUTO_BUYER_FAME_COST,
} from '../systems/automation.js';
import { CITIES } from '../data/cities.js';
import { exportSave, importSave, hardReset, save } from '../core/save.js';
import {
  formatMoney,
  formatRate,
  formatNumber,
  formatDuration,
} from '../utils/formatNumber.js';
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
      <button class="settings-btn" id="settings-btn" aria-label="Optionen">⚙️</button>
      <h1 class="hud-title">🚚 Food Truck Empire</h1>
      <div class="hud-money" id="money">0 €</div>
      <div class="hud-rate" id="rate">0 €/s</div>
      <div class="hud-city" id="hud-city"></div>
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
      <section class="tab" id="tab-world">
        <div class="prestige-card">
          <h2>🌍 Globale Expansion</h2>
          <p class="prestige-desc">
            Verkaufe dein Imperium und expandiere in eine neue Stadt!
            Trucks, Geld und Upgrades gehen verloren – deine
            <b>Marken-Bekanntheit</b> bleibt für immer.
          </p>
          <div class="prestige-stats">
            <div class="prestige-stat"><span>Bekanntheit</span><b data-fame>0 ⭐</b></div>
            <div class="prestige-stat"><span>Dein Bonus</span><b data-fame-mult>+0%</b></div>
            <div class="prestige-stat"><span>Bei Expansion</span><b data-fame-gain>+0 ⭐</b></div>
          </div>
          <button class="modal-btn" id="prestige-btn" disabled>Expandieren! 🌍</button>
          <p class="prestige-hint" data-prestige-hint></p>
        </div>
        <div id="autobuyer-card"></div>
        <h3 class="section-title">Deine Welt-Tour</h3>
        <div class="city-map" id="city-map"></div>
      </section>
    </main>
    <nav class="tab-bar">
      <button data-tab="trucks" class="active">🚚<span>Trucks</span></button>
      <button data-tab="upgrades">💼<span>Upgrades</span><em class="badge" id="upgrade-badge" hidden></em></button>
      <button data-tab="world">🌍<span>Welt</span><em class="badge" id="world-badge" hidden>!</em></button>
    </nav>
    <div id="modal-root"></div>
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
  els.modalRoot = document.getElementById('modal-root');

  els.hudCity = document.getElementById('hud-city');
  els.prestigeBtn = document.getElementById('prestige-btn');
  els.prestigeHint = document.querySelector('[data-prestige-hint]');
  els.fame = document.querySelector('[data-fame]');
  els.fameMult = document.querySelector('[data-fame-mult]');
  els.fameGain = document.querySelector('[data-fame-gain]');
  els.cityMap = document.getElementById('city-map');
  els.autobuyerCard = document.getElementById('autobuyer-card');
  els.worldBadge = document.getElementById('world-badge');

  initJuice();
  bindEvents();
  displayedMoney = state.money;
  applyCityTheme();
  buildCityMap();
  buildAutobuyerCard();
  syncGeneratorList(true);
  syncUpgradeList(true);
  updateWorldTab();
}

function bindEvents() {
  // Optionen-Modal.
  document
    .getElementById('settings-btn')
    .addEventListener('click', showSettings);

  // Modal-Aktionen (Event-Delegation).
  els.modalRoot.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target.classList.contains('modal-overlay')) {
      closeModal();
      return;
    }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'copy') {
      const area = document.getElementById('export-area');
      area.select();
      navigator.clipboard?.writeText(area.value);
      e.target.textContent = 'Kopiert ✓';
    } else if (action === 'import') {
      const code = document.getElementById('import-area').value;
      if (importSave(code)) {
        location.reload();
      } else {
        document.getElementById('import-error').hidden = false;
      }
    } else if (action === 'reset') {
      if (confirm('Wirklich ALLES löschen? Das kann nicht rückgängig gemacht werden!')) {
        hardReset();
        location.reload();
      }
    } else if (action === 'prestige') {
      const city = doPrestige(state);
      if (!city) return;
      save();
      onRunReset();
      showModal(`
        <h2>${city.flag} Willkommen in ${city.name}!</h2>
        <p>${city.bonusDesc}</p>
        <p>Deine Bekanntheit: <b>${formatNumber(state.prestige.fame)} ⭐</b><br>
        Permanenter Bonus: <b>+${formatNumber(state.prestige.fame * FAME_MULT_PER_POINT * 100)}%</b></p>
        <button class="modal-btn" data-close>Neustart mit Rückenwind! 🚀</button>
      `);
      playSound('prestige');
    }
  });

  // Auto-Buyer-Karte im Welt-Tab.
  els.autobuyerCard.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'unlock-autobuyer') {
      if (unlockAutoBuyer(state)) {
        save();
        buildAutobuyerCard();
        updateWorldTab();
        playSound('buy');
      }
    } else if (action === 'toggle-autobuyer') {
      state.automation.autoBuyer.enabled = !state.automation.autoBuyer.enabled;
      buildAutobuyerCard();
    }
  });

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

  // Prestige-Flow: Bestätigung → Reset → Feier-Modal.
  els.prestigeBtn.addEventListener('click', () => {
    if (!canPrestige(state)) return;
    const gain = getFameGain(state);
    const next = getNextCity(state);
    showModal(`
      <h2>🌍 Globale Expansion</h2>
      <p>Du erhältst <b>+${formatNumber(gain)} ⭐ Bekanntheit</b>
      (dauerhaft +${formatNumber(gain * FAME_MULT_PER_POINT * 100)}% Einkommen).</p>
      <p>${next ? `Nächste Stadt: <b>${next.flag} ${next.name}</b><br>${next.bonusDesc}` : 'Du hast bereits die ganze Welt erobert!'}</p>
      <p>⚠️ Geld, Trucks und Upgrades werden zurückgesetzt.</p>
      <button class="modal-btn" data-action="prestige">Los geht's! 🚀</button>
      <button class="modal-btn modal-btn--small modal-btn--ghost" data-close>Noch nicht</button>
    `);
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
    updateWorldTab();
  }
}

/** Nach einem Prestige-Reset: Anzeige und Listen neu aufbauen. */
function onRunReset() {
  displayedMoney = 0;
  genListKey = '';
  upgradeListKey = '';
  applyCityTheme();
  buildCityMap();
  buildAutobuyerCard();
  syncGeneratorList(true);
  syncUpgradeList(true);
  updateWorldTab();
}

/* ---------- Welt-Tab ---------- */

function applyCityTheme() {
  const city = getCurrentCity(state);
  document.documentElement.style.setProperty('--c-sky-2', city.accent);
  els.hudCity.textContent = `📍 ${city.flag} ${city.name}`;
}

function buildCityMap() {
  const idx = Math.min(state.prestige.cityIndex, CITIES.length - 1);
  els.cityMap.innerHTML = CITIES.map((city, i) => {
    const status = i < idx ? 'done' : i === idx ? 'current' : 'locked';
    return `
      <div class="city-stop city-stop--${status}">
        <span class="city-flag">${status === 'locked' ? '🔒' : city.flag}</span>
        <span class="city-name">${status === 'locked' && i > idx + 1 ? '???' : city.name}</span>
        <span class="city-bonus">${status === 'locked' ? (i === idx + 1 ? city.bonusDesc : '') : city.bonusDesc}</span>
        ${status === 'current' ? '<span class="city-truck">🚚</span>' : ''}
      </div>`;
  }).join('<div class="city-link"></div>');
}

function buildAutobuyerCard() {
  const ab = state.automation.autoBuyer;
  if (ab.unlocked) {
    els.autobuyerCard.innerHTML = `
      <div class="gen-card">
        <div class="gen-emoji">🤖</div>
        <div class="gen-info">
          <div class="gen-name">Auto-Buyer</div>
          <div class="gen-income">Kauft jede Sekunde den günstigsten Truck.</div>
        </div>
        <button class="buy-btn ${ab.enabled ? '' : 'buy-btn--off'}" data-action="toggle-autobuyer">
          ${ab.enabled ? 'AN' : 'AUS'}
        </button>
      </div>`;
  } else if (state.prestige.totalResets >= 1) {
    els.autobuyerCard.innerHTML = `
      <div class="gen-card">
        <div class="gen-emoji">🤖</div>
        <div class="gen-info">
          <div class="gen-name">Auto-Buyer freischalten</div>
          <div class="gen-income">Kauft automatisch Trucks – kostet ${AUTO_BUYER_FAME_COST} ⭐ Bekanntheit!</div>
        </div>
        <button class="buy-btn" data-action="unlock-autobuyer"
          ${canUnlockAutoBuyer(state) ? '' : 'disabled'}>
          ${AUTO_BUYER_FAME_COST} ⭐
        </button>
      </div>`;
  } else {
    els.autobuyerCard.innerHTML = '';
  }
}

function updateWorldTab() {
  const gain = getFameGain(state);
  els.fame.textContent = formatNumber(state.prestige.fame) + ' ⭐';
  els.fameMult.textContent =
    '+' + formatNumber((getFameMultiplier(state) - 1) * 100) + '%';
  els.fameGain.textContent = '+' + formatNumber(gain) + ' ⭐';
  els.prestigeBtn.disabled = gain < 1;
  els.prestigeHint.textContent =
    gain < 1
      ? `Verdiene insgesamt ${formatMoney(1e6)}, um zu expandieren.`
      : 'Bereit für die nächste Stadt!';
  els.worldBadge.hidden = gain < 1;

  // Freischalt-Button reaktivieren, sobald genug Bekanntheit da ist.
  const unlockBtn = els.autobuyerCard.querySelector('[data-action="unlock-autobuyer"]');
  if (unlockBtn) unlockBtn.disabled = !canUnlockAutoBuyer(state);
}

/* ---------- Modals ---------- */

function showModal(html) {
  els.modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card">${html}</div>
    </div>`;
}

function closeModal() {
  els.modalRoot.innerHTML = '';
}

export function showWelcomeBack({ seconds, earned }) {
  showModal(`
    <h2>Willkommen zurück! 👋</h2>
    <p>Du warst ${formatDuration(seconds)} unterwegs.<br>
    Deine Trucks haben fleißig weiterverkauft:</p>
    <p class="modal-money">+${formatMoney(earned)}</p>
    <button class="modal-btn" data-close>Kassieren! 💰</button>
  `);
}

function showSettings() {
  showModal(`
    <h2>⚙️ Optionen</h2>
    <label class="modal-label" for="export-area">Save exportieren</label>
    <textarea id="export-area" readonly>${exportSave()}</textarea>
    <button class="modal-btn modal-btn--small" data-action="copy">Kopieren</button>
    <label class="modal-label" for="import-area">Save importieren</label>
    <textarea id="import-area" placeholder="Save-Code hier einfügen …"></textarea>
    <p id="import-error" class="modal-error" hidden>Ungültiger Save-Code!</p>
    <button class="modal-btn modal-btn--small" data-action="import">Importieren</button>
    <hr class="modal-sep">
    <button class="modal-btn modal-btn--small modal-btn--danger" data-action="reset">Spielstand löschen</button>
    <button class="modal-btn" data-close>Schließen</button>
  `);
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
