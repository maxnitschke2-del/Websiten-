import { gsap } from 'gsap';
import { formatMoney, formatNumber } from '../utils/formatNumber.js';
import { upgradeCost } from '../systems/costScaling.js';
import { worldIncomePerSec } from '../systems/production.js';
import { nextMilestoneLevel } from '../utils/formulas.js';
import { STATIONS } from '../data/stations.js';
import {
  worldCfgById,
  nextWorldCfg,
  prevWorldCfg,
  isWorldUnlocked
} from '../systems/worldUnlock.js';

// DOM-Schicht, strikt getrennt von der 3D-Szene.
// Baut die Karten für die AKTIVE Welt und wird bei Welt-Wechsel via
// setWorld() neu aufgebaut. update() schreibt nur bei Änderungen.
export function createUI(state, actions) {
  const el = {
    money: document.getElementById('money'),
    income: document.getElementById('income'),
    goal: document.getElementById('goal-chip'),
    worldName: document.getElementById('world-name'),
    worldSignature: document.getElementById('world-signature'),
    prev: document.getElementById('world-prev'),
    next: document.getElementById('world-next'),
    banner: document.getElementById('unlock-banner'),
    list: document.getElementById('stations-list')
  };

  let activeWorldId = null;
  let stationCfgs = [];
  let cards = {};
  const topCache = {};

  el.prev.addEventListener('click', () => {
    const p = prevWorldCfg(activeWorldId);
    if (p && isWorldUnlocked(state, p.id)) actions.switchWorld(p.id);
  });
  el.next.addEventListener('click', () => {
    const n = nextWorldCfg(activeWorldId);
    if (n && isWorldUnlocked(state, n.id)) actions.switchWorld(n.id);
  });
  el.banner.addEventListener('click', () => {
    const n = nextWorldCfg(activeWorldId);
    if (n && !isWorldUnlocked(state, n.id) && state.money >= n.unlockCost) {
      actions.unlockWorld(n);
    }
  });

  // (Neu-)Aufbau der Karten und Kopfzeile für eine Welt.
  function setWorld(worldId) {
    activeWorldId = worldId;
    stationCfgs = STATIONS[worldId];
    const worldCfg = worldCfgById(worldId);

    el.worldName.textContent = `${worldCfg.name} · Welt ${worldCfg.index}/4`;
    el.worldSignature.textContent = `Signature: ${worldCfg.signature}`;

    el.list.innerHTML = '';
    cards = {};
    for (const cfg of stationCfgs) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="icon">${cfg.icon}</span>
        <span class="name">${cfg.name}</span>
        <span class="lvl"></span>
        <button class="buy"></button>
      `;
      card.querySelector('.buy').addEventListener('click', () => actions.buy(cfg.id));
      el.list.appendChild(card);
      cards[cfg.id] = {
        root: card,
        lvl: card.querySelector('.lvl'),
        buy: card.querySelector('.buy'),
        cache: {}
      };
    }
    // Caches zurücksetzen, damit nach dem Wechsel alles neu geschrieben wird.
    for (const k in topCache) delete topCache[k];
    update();
  }

  function setText(node, cache, key, value) {
    if (cache[key] === value) return;
    cache[key] = value;
    node.textContent = value;
  }

  function update() {
    const worldState = state.worlds[activeWorldId];

    setText(el.money, topCache, 'money', formatMoney(state.money));
    const income = worldIncomePerSec(stationCfgs, worldState);
    setText(el.income, topCache, 'income', `+${formatNumber(income)}/s`);
    setText(el.goal, topCache, 'goal', nextGoalText(worldState));

    updateWorldNav();

    for (const cfg of stationCfgs) {
      const st = worldState.stations[cfg.id];
      const card = cards[cfg.id];

      if (!st.unlocked) {
        card.root.classList.add('locked');
        setText(card.lvl, card.cache, 'lvl', '🔒');
        setText(card.buy, card.cache, 'buy', `🔓 ${formatMoney(cfg.unlockCost)}`);
        setAffordable(card, state.money >= cfg.unlockCost);
        continue;
      }

      card.root.classList.remove('locked');
      setText(card.lvl, card.cache, 'lvl', `Lv ${st.level}`);

      if (st.level >= cfg.levelCap) {
        setText(card.buy, card.cache, 'buy', 'MAX');
        card.buy.disabled = true;
        card.buy.classList.add('maxed');
      } else {
        const cost = upgradeCost(cfg, st.level);
        setText(card.buy, card.cache, 'buy', formatMoney(cost));
        setAffordable(card, state.money >= cost);
      }
    }
  }

  function setAffordable(card, affordable) {
    if (card.cache.affordable !== affordable) {
      card.cache.affordable = affordable;
      card.buy.disabled = !affordable;
    }
  }

  // Pfeile aktivieren, wenn Nachbarwelt freigeschaltet ist. Auf der obersten
  // freigeschalteten Welt: Freischalt-Banner der nächsten Welt einblenden.
  function updateWorldNav() {
    const prev = prevWorldCfg(activeWorldId);
    const next = nextWorldCfg(activeWorldId);
    const prevOpen = !!prev && isWorldUnlocked(state, prev.id);
    const nextOpen = !!next && isWorldUnlocked(state, next.id);

    setNav(el.prev, prevOpen);
    setNav(el.next, nextOpen);

    if (next && !nextOpen) {
      const affordable = state.money >= next.unlockCost;
      el.banner.hidden = false;
      setText(el.banner, topCache, 'banner',
        `🔓 ${next.name} freischalten — ${formatMoney(next.unlockCost)}`);
      if (topCache.bannerAfford !== affordable) {
        topCache.bannerAfford = affordable;
        el.banner.disabled = !affordable;
        el.banner.classList.toggle('ready', affordable);
      }
    } else {
      el.banner.hidden = true;
    }
  }

  function setNav(btn, enabled) {
    btn.disabled = !enabled;
    btn.classList.toggle('active', enabled);
  }

  function nextGoalText(worldState) {
    const locked = stationCfgs.find((c) => !worldState.stations[c.id].unlocked);
    if (locked) {
      return `🎯 ${locked.name} freischalten (${formatMoney(locked.unlockCost)})`;
    }
    let weakest = null;
    for (const cfg of stationCfgs) {
      const lvl = worldState.stations[cfg.id].level;
      if (lvl >= cfg.levelCap) continue;
      if (!weakest || lvl < worldState.stations[weakest.id].level) weakest = cfg;
    }
    if (!weakest) {
      const next = nextWorldCfg(activeWorldId);
      if (next && !isWorldUnlocked(state, next.id)) {
        return `🎯 ${next.name} freischalten (${formatMoney(next.unlockCost)})`;
      }
      return '🎯 Welt komplett ausgebaut!';
    }
    const lvl = worldState.stations[weakest.id].level;
    return `🎯 ${weakest.name} Lv ${nextMilestoneLevel(lvl)} → ×2 Produktion`;
  }

  function flashCard(id) {
    const card = cards[id];
    if (!card) return;
    gsap.fromTo(
      card.root,
      { scale: 1.04, backgroundColor: '#eaffea' },
      { scale: 1, backgroundColor: '#ffffff', duration: 0.35, ease: 'power2.out', clearProps: 'backgroundColor,scale' }
    );
  }

  function pulseMoney() {
    gsap.fromTo(
      el.money,
      { scale: 1.25, color: '#ffd23f' },
      { scale: 1, color: '#ffffff', duration: 0.4, ease: 'power2.out', clearProps: 'color,scale' }
    );
  }

  return { setWorld, update, flashCard, pulseMoney };
}
