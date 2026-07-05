import { state } from '../core/state.js';
import { getStation, upgradeCost } from '../data/stations.js';
import { locationCostMult, levelCap } from './progression.js';

export function costFor(stationId) {
  const def = getStation(stationId);
  const level = state.stations[stationId].level;
  return Math.ceil(upgradeCost(def, level) * locationCostMult());
}

export function isAtCap(stationId) {
  return state.stations[stationId].level >= levelCap();
}

export function canUpgrade(stationId) {
  return !isAtCap(stationId) && state.money >= costFor(stationId);
}

export function tryUpgrade(stationId) {
  if (!canUpgrade(stationId)) return false;
  state.money -= costFor(stationId);
  state.stations[stationId].level += 1;
  return true;
}
