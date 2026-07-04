// Kosten-Skalierung & Kauf-Logik.
// cost = baseCost * growthRate^owned; Bulk über geometrische Summe.

import { GENERATOR_MAP } from '../data/generators.js';
import { geometricSum, maxAffordable } from '../utils/formulas.js';

export function getCost(generatorId, owned, count = 1) {
  const gen = GENERATOR_MAP[generatorId];
  return geometricSum(gen.baseCost, gen.growthRate, owned, count);
}

export function getMaxBuyCount(generatorId, owned, money) {
  const gen = GENERATOR_MAP[generatorId];
  return maxAffordable(gen.baseCost, gen.growthRate, owned, money);
}

/** Kauft ein Upgrade; gibt true zurück, wenn der Kauf geklappt hat. */
export function buyUpgrade(state, upgrade) {
  if (state.upgrades[upgrade.id]) return false;
  if (state.money < upgrade.cost) return false;
  state.money -= upgrade.cost;
  state.upgrades[upgrade.id] = true;
  // Automatisierungs-Upgrades schalten dauerhaft frei (überlebt Prestige).
  if (upgrade.type === 'auto') state.automation[upgrade.target] = true;
  return true;
}

/** Kauft `count` Einheiten; gibt true zurück, wenn der Kauf geklappt hat. */
export function buyGenerator(state, generatorId, count = 1) {
  if (count <= 0) return false;
  const slot = state.generators[generatorId];
  const cost = getCost(generatorId, slot.owned, count);
  if (state.money < cost) return false;
  state.money -= cost;
  slot.owned += count;
  return true;
}
