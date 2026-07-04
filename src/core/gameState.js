// Single Source of Truth für den gesamten Spielzustand.

import { GENERATORS } from '../data/generators.js';

export const SAVE_VERSION = 1;

export function createDefaultState() {
  const generators = {};
  for (const g of GENERATORS) generators[g.id] = { owned: 0 };
  return {
    version: SAVE_VERSION,
    money: 0,
    totalEarned: 0, // dieser Run – Basis für Prestige-Gain
    lifetimeEarned: 0, // über alle Runs – für Achievements
    generators,
    upgrades: {}, // gekaufte Upgrade-IDs -> true
    achievements: {}, // freigeschaltete Achievement-IDs -> true
    prestige: { fame: 0, totalResets: 0, cityIndex: 0 },
    automation: {
      autoClicker: false,
      autoBuyer: { unlocked: false, enabled: false },
    },
    stats: { clicks: 0, playtimeMs: 0 },
    lastSaveTime: Date.now(),
  };
}

// Das eine, zentrale State-Objekt. Wird nie ersetzt, nur mutiert,
// damit alle Module dieselbe Referenz behalten.
export const state = createDefaultState();

export function replaceState(next) {
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, next);
}
