// Stations-Helfer. Die Stations-Definitionen selbst liegen seit Phase 3
// pro Welt in data/worlds.js — hier gibt es nur den Zugriff auf die
// Stationen der aktiven Welt plus die Wirtschafts-Formeln.
// Die erste Station jeder Welt ist frei, weitere werden per unlockCost
// freigeschaltet (Level 0 = gesperrt).
import { state } from '../core/state.js';
import { getWorld } from './worlds.js';

export function getStationsFor(worldIndex) {
  return getWorld(worldIndex).stations;
}

export function getStations() {
  return getStationsFor(state.worldIndex);
}

export function getStation(id) {
  return getStations().find((s) => s.id === id);
}

// Einkommen wächst linear mit dem Level, plus Meilenstein-Verdopplung
// alle 5 Level — so bleibt die steile Kosten-Kurve erspielbar und
// Meilenstein-Level fühlen sich wie kleine Durchbrüche an.
const MILESTONE_EVERY = 5;

export function milestoneMultiplier(level) {
  return 2 ** Math.floor(level / MILESTONE_EVERY);
}

export function incomePerSecond(def, level) {
  return def.baseIncome * level * milestoneMultiplier(level);
}

// Level 0 -> Freischalt-Kosten, danach normale Upgrade-Kurve.
export function upgradeCost(def, level) {
  if (level === 0) return def.unlockCost;
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, level - 1));
}
