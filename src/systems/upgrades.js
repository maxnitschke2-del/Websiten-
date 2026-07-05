import { state } from '../core/state.js';
import { getStation, upgradeCost } from '../data/stations.js';

export function costFor(stationId) {
  return upgradeCost(getStation(stationId), state.stations[stationId].level);
}

export function canUpgrade(stationId) {
  return state.money >= costFor(stationId);
}

export function tryUpgrade(stationId) {
  const cost = costFor(stationId);
  if (state.money < cost) return false;
  state.money -= cost;
  state.stations[stationId].level += 1;
  return true;
}
