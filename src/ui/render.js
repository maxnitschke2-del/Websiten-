import { gsap } from 'gsap';
import { formatMoney, formatNumber } from '../utils/formatNumber.js';
import { upgradeCost } from '../systems/costScaling.js';
import { worldIncomePerSec } from '../systems/production.js';
import { nextMilestoneLevel } from '../utils/formulas.js';

// DOM-Schicht, strikt getrennt von der 3D-Szene.
// createUI baut die Elemente einmal, update() schreibt nur bei Änderungen.
export function createUI(state, worldCfg, stationCfgs, actions) {
  const el = {
    money: document.getElementById('money'),
    income: document.getElementById('income'),
    goal: document.getElementById('goal-chip'),
    worldName: document.getElementById('world-name'),
    worldSignature: document.getElementById('world-signature'),
    list: document.getElementById('stations-list')
  };

  el.worldName.textContent = `${worldCfg.name} · Welt ${worldCfg.index}/4`;
  el.worldSignature.textContent = `Signature: ${worldCfg.signature}`;

  const cards = {};
  for (const cfg of stationCfgs) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="icon">${cfg.icon}</span>
      <span class="name">${cfg.name}</span>
      <span class="lvl"></span>
      <button class="buy"></button>
    `;
    const buy = card.querySelector('.buy');
    buy.addEventListener('click', () => actions.upgrade(cfg.id));
    el.list.appendChild(card);
    cards[cfg.id] = {
      root: card,
      lvl: card.querySelector('.lvl'),
      buy,
      cache: {}
    };
  }

  // Nur schreiben, wenn sich der Wert geändert hat – kein DOM-Thrashing im Loop.
  function setText(node, cache, key, value) {
    if (cache[key] === value) return;
    cache[key] = value;
    node.textContent = value;
  }

  const topCache = {};

  function update() {
    const worldState = state.worlds[state.currentWorld];

    setText(el.money, topCache, 'money', formatMoney(state.money));
    const income = worldIncomePerSec(stationCfgs, worldState);
    setText(el.income, topCache, 'income', `+${formatNumber(income)}/s`);

    // Nächstes Ziel immer sichtbar: nächster Meilenstein der ersten
    // ausbaubaren Station (ab Phase 7 übernehmen Achievements diese Rolle).
    const goalCfg = stationCfgs[0];
    const goalState = worldState.stations[goalCfg.id];
    const goalLvl = nextMilestoneLevel(goalState.level);
    setText(
      el.goal,
      topCache,
      'goal',
      goalState.level >= goalCfg.levelCap
        ? `🎯 ${goalCfg.name} ist ausgebaut!`
        : `🎯 ${goalCfg.name} Lv ${goalLvl} → ×2 Produktion`
    );

    for (const cfg of stationCfgs) {
      const st = worldState.stations[cfg.id];
      const card = cards[cfg.id];

      if (!st.unlocked) {
        // Freischalten kommt in Phase 2 – Ziel trotzdem sichtbar machen.
        card.root.classList.add('locked');
        setText(card.lvl, card.cache, 'lvl', '🔒');
        setText(card.buy, card.cache, 'buy', formatMoney(cfg.unlockCost));
        card.buy.disabled = true;
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
        const affordable = state.money >= cost;
        if (card.cache.affordable !== affordable) {
          card.cache.affordable = affordable;
          card.buy.disabled = !affordable;
        }
      }
    }
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

  return { update, flashCard };
}
