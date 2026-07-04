// Produktions-Berechnung – reine Funktionen über dem State.

import { GENERATORS, GENERATOR_MAP } from '../data/generators.js';

// Multiplikator-Pipeline: Upgrades, Achievements und Prestige
// docken in späteren Phasen hier an.
export function getGeneratorMultiplier(state, generatorId) {
  return 1;
}

export function getGlobalMultiplier(state) {
  return 1;
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

// Klick-Wert: Basis 1 € – Klick-Upgrades (Phase 3) addieren % des Einkommens.
export function getClickValue(state) {
  return 1 * getGlobalMultiplier(state);
}

export function earn(state, amount) {
  state.money += amount;
  state.totalEarned += amount;
  state.lifetimeEarned += amount;
}
