// Sichtbarkeits- & Unlock-Logik – reine Funktionen über dem State.

import { GENERATORS } from '../data/generators.js';
import { UPGRADES } from '../data/upgrades.js';

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
