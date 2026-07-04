// Prestige "Globale Expansion" – reine Funktionen über dem State.

import { CITIES } from '../data/cities.js';

// +2% Einkommen pro Bekanntheits-Punkt, permanent.
export const FAME_MULT_PER_POINT = 0.02;

/** Bekanntheit, die ein Reset JETZT bringen würde. */
export function getFameGain(state) {
  return Math.floor(Math.sqrt(state.totalEarned / 1e6));
}

export function getFameMultiplier(state) {
  return 1 + state.prestige.fame * FAME_MULT_PER_POINT;
}

export function canPrestige(state) {
  return getFameGain(state) >= 1;
}

export function getCurrentCity(state) {
  return CITIES[Math.min(state.prestige.cityIndex, CITIES.length - 1)];
}

export function getNextCity(state) {
  return CITIES[state.prestige.cityIndex + 1] ?? null;
}

/** Alle eroberten Städte (inkl. aktueller) – ihre Boni sind aktiv. */
export function getConqueredCities(state) {
  return CITIES.slice(0, Math.min(state.prestige.cityIndex, CITIES.length - 1) + 1);
}

/**
 * Führt die Globale Expansion aus: Run-Fortschritt wird zurückgesetzt,
 * Bekanntheit und Stadt bleiben permanent. Gibt die neue Stadt zurück.
 */
export function doPrestige(state) {
  const gain = getFameGain(state);
  if (gain < 1) return null;

  state.prestige.fame += gain;
  state.prestige.totalResets++;
  state.prestige.cityIndex = Math.min(
    state.prestige.cityIndex + 1,
    CITIES.length - 1
  );

  // Run-Reset: Geld, Trucks, Upgrades. Achievements & Automation bleiben.
  state.money = 0;
  state.totalEarned = 0;
  for (const id of Object.keys(state.generators)) {
    state.generators[id].owned = 0;
  }
  state.upgrades = {};

  return getCurrentCity(state);
}
