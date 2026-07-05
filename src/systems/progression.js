// Standort-Progression: Level-Cap prüfen, Umzug in die nächste Stadt,
// permanenter Basis-Bonus pro gemeisterter Stadt.
import { state, resetForNewLocation, saveState } from '../core/state.js';
import { getStations, incomePerSecond } from '../data/stations.js';
import { LOCATIONS, getLocation } from '../data/locations.js';

export const BONUS_PER_CITY = 0.5; // +50% Basis-Einkommen je gemeisterter Stadt

export function currentLocation() {
  return getLocation(state.locationIndex);
}

export function prestigeMultiplier() {
  return 1 + BONUS_PER_CITY * state.locationIndex;
}

export function globalIncomeMultiplier() {
  return currentLocation().incomeMult * prestigeMultiplier();
}

export function locationCostMult() {
  return currentLocation().costMult;
}

export function levelCap() {
  return currentLocation().levelCap;
}

// Effektives Einkommen einer Station inkl. Standort- und Prestige-Bonus.
export function stationIncome(def, level) {
  return incomePerSecond(def, level) * globalIncomeMultiplier();
}

export function stationsAtCap() {
  const cap = levelCap();
  return getStations().filter((def) => state.stations[def.id].level >= cap).length;
}

export function isFinalLocation() {
  return state.locationIndex >= LOCATIONS.length - 1;
}

export function canMove() {
  return stationsAtCap() === getStations().length && !isFinalLocation();
}

export function moveToNextLocation() {
  if (!canMove()) return false;
  state.locationIndex += 1;
  resetForNewLocation();
  saveState();
  return true;
}
