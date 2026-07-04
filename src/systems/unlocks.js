// Sichtbarkeits- & Unlock-Logik – reine Funktionen über dem State.

import { GENERATORS } from '../data/generators.js';
import { UPGRADES } from '../data/upgrades.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { getTotalIncome } from './production.js';

// Teaser ("???") erscheint, wenn 1/5 der Unlock-Schwelle verdient wurde.
const TEASE_FRACTION = 0.2;

export function isGeneratorUnlocked(state, gen) {
  return state.totalEarned >= gen.unlockAt || state.generators[gen.id].owned > 0;
}

export function isGeneratorTeased(state, gen) {
  return state.totalEarned >= gen.unlockAt * TEASE_FRACTION;
}

export function isUpgradeVisible(state, up) {
  if (state.upgrades[up.id]) return false; // gekauft → ausblenden
  // Automatisierung bleibt über Prestige erhalten → nie doppelt anbieten.
  if (up.type === 'auto' && state.automation[up.target]) return false;
  const req = up.requires;
  if (!req) return true;
  if (req.generator !== undefined) {
    return state.generators[req.generator].owned >= req.owned;
  }
  if (req.totalEarned !== undefined) {
    return state.totalEarned >= req.totalEarned;
  }
  return true;
}

/** Kaufbare (sichtbare, noch nicht gekaufte) Upgrades, billigste zuerst. */
export function getVisibleUpgrades(state) {
  return UPGRADES.filter((up) => isUpgradeVisible(state, up)).sort(
    (a, b) => a.cost - b.cost
  );
}

/**
 * Sichtbare Generatoren: alle freigeschalteten + der nächste als Teaser.
 * Liefert [{ gen, unlocked }].
 */
export function getVisibleGenerators(state) {
  const visible = [];
  for (const gen of GENERATORS) {
    if (isGeneratorUnlocked(state, gen)) {
      visible.push({ gen, unlocked: true });
    } else if (isGeneratorTeased(state, gen)) {
      visible.push({ gen, unlocked: false });
      break; // nur einen Teaser zeigen – kein Overload
    } else {
      break;
    }
  }
  return visible;
}

/* ---------- Achievements ---------- */

function getTotalTrucks(state) {
  let total = 0;
  for (const gen of GENERATORS) total += state.generators[gen.id].owned;
  return total;
}

/** Fortschritt 0..∞ (>= 1 heißt erreicht). */
export function getAchievementProgress(state, ach) {
  const c = ach.cond;
  switch (c.type) {
    case 'clicks':
      return state.stats.clicks / c.value;
    case 'generatorOwned':
      return state.generators[c.target].owned / c.value;
    case 'totalTrucks':
      return getTotalTrucks(state) / c.value;
    case 'lifetimeEarned':
      return state.lifetimeEarned / c.value;
    case 'income':
      return getTotalIncome(state) / c.value;
    case 'resets':
      return state.prestige.totalResets / c.value;
    case 'upgradesOwned':
      return Object.keys(state.upgrades).length / c.value;
    default:
      return 0;
  }
}

/** Prüft alle Erfolge und gibt die NEU freigeschalteten zurück. */
export function checkAchievements(state) {
  const newly = [];
  for (const ach of ACHIEVEMENTS) {
    if (!state.achievements[ach.id] && getAchievementProgress(state, ach) >= 1) {
      state.achievements[ach.id] = true;
      newly.push(ach);
    }
  }
  return newly;
}

/**
 * Nächstes Ziel für das UI-Banner: der Erfolg, der dem Abschluss
 * am nächsten ist – so gibt es immer genau EIN klares Ziel.
 */
export function getNextGoal(state) {
  let best = null;
  for (const ach of ACHIEVEMENTS) {
    if (state.achievements[ach.id]) continue;
    const progress = Math.min(getAchievementProgress(state, ach), 0.999);
    if (!best || progress > best.progress) best = { ach, progress };
  }
  return best;
}
