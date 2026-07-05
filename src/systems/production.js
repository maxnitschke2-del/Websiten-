// Passives Idle-Einkommen aus allen Stationen.
// Trinkgelder (Phase 2) laufen bewusst getrennt in systems/tips.js.
import { state } from '../core/state.js';
import { STATIONS } from '../data/stations.js';
import { stationIncome } from './progression.js';

export function totalIncomePerSecond() {
  return STATIONS.reduce(
    (sum, def) => sum + stationIncome(def, state.stations[def.id].level),
    0
  );
}

export function tick(dtSeconds) {
  state.money += totalIncomePerSecond() * dtSeconds;
}
