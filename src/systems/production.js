// Produktions-Berechnung – reine Funktionen über dem State.

import { GENERATORS, GENERATOR_MAP } from '../data/generators.js';
import { UPGRADES } from '../data/upgrades.js';

export function getGeneratorMultiplier(state, generatorId) {
  let mult = 1;
  for (const up of UPGRADES) {
    if (up.type === 'genMult' && up.target === generatorId && state.upgrades[up.id]) {
      mult *= up.value;
    }
  }
  return mult;
}

// Prestige (Fame) und Achievements docken in Phase 5/6 hier an.
export function getGlobalMultiplier(state) {
  let mult = 1;
  for (const up of UPGRADES) {
    if (up.type === 'globalMult' && state.upgrades[up.id]) mult *= up.value;
  }
  return mult;
}

export function getGeneratorIncome(state, generatorId) {
  const gen = GENERATOR_MAP[generatorId];
  const owned = state.generators[generatorId]?.owned ?? 0;
  return (
    gen.baseIncome *
    owned *
    getGeneratorMultiplier(state, generatorId) *
    getGlobalMultiplier(state)
  );
}

export function getTotalIncome(state) {
  let total = 0;
  for (const gen of GENERATORS) total += getGeneratorIncome(state, gen.id);
  return total;
}

// Klick-Wert: Basis 1 € × Klick-Upgrades × global, plus %-Anteil des €/s.
export function getClickValue(state) {
  let base = 1;
  let incomePct = 0;
  for (const up of UPGRADES) {
    if (!state.upgrades[up.id]) continue;
    if (up.type === 'clickMult') base *= up.value;
    else if (up.type === 'clickIncomePct') incomePct += up.value;
  }
  return base * getGlobalMultiplier(state) + getTotalIncome(state) * incomePct;
}

export function earn(state, amount) {
  state.money += amount;
  state.totalEarned += amount;
  state.lifetimeEarned += amount;
}
