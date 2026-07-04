// Automatisierung: Auto-Buyer (Prestige-Belohnung) & Auto-Klicker.

import { GENERATORS } from '../data/generators.js';
import { getCost, buyGenerator } from './costScaling.js';
import { isGeneratorUnlocked } from './unlocks.js';

// Der Auto-Buyer kostet Bekanntheit – eine echte Entscheidung,
// weil Bekanntheit sonst Einkommens-Multiplikator wäre.
export const AUTO_BUYER_FAME_COST = 5;

export function canUnlockAutoBuyer(state) {
  return (
    !state.automation.autoBuyer.unlocked &&
    state.prestige.totalResets >= 1 &&
    state.prestige.fame >= AUTO_BUYER_FAME_COST
  );
}

export function unlockAutoBuyer(state) {
  if (!canUnlockAutoBuyer(state)) return false;
  state.prestige.fame -= AUTO_BUYER_FAME_COST;
  state.automation.autoBuyer.unlocked = true;
  state.automation.autoBuyer.enabled = true;
  return true;
}

/**
 * Kauft 1× pro Aufruf (im Sekundentakt) den günstigsten kaufbaren Truck.
 * Gibt den gekauften Generator zurück (für UI-Feedback) oder null.
 */
export function autoBuyTick(state) {
  if (!state.automation.autoBuyer.enabled) return null;
  let cheapest = null;
  let cheapestCost = Infinity;
  for (const gen of GENERATORS) {
    if (!isGeneratorUnlocked(state, gen)) continue;
    const cost = getCost(gen.id, state.generators[gen.id].owned, 1);
    if (cost < cheapestCost) {
      cheapestCost = cost;
      cheapest = gen;
    }
  }
  if (cheapest && state.money >= cheapestCost && buyGenerator(state, cheapest.id, 1)) {
    return cheapest;
  }
  return null;
}
