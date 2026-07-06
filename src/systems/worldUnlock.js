import { WORLDS } from '../data/worlds.js';
import { STATIONS } from '../data/stations.js';
import { totalUpgradeCost } from './costScaling.js';

// Reine Funktionen rund um Welt-Freischaltung/-Navigation. Keine Nebenwirkungen.
export function worldCfgById(id) {
  return WORLDS.find((w) => w.id === id);
}

export function nextWorldCfg(id) {
  const w = worldCfgById(id);
  return WORLDS.find((x) => x.index === w.index + 1) || null;
}

export function prevWorldCfg(id) {
  const w = worldCfgById(id);
  return WORLDS.find((x) => x.index === w.index - 1) || null;
}

export function isWorldUnlocked(state, id) {
  return !!state.worlds[id]?.unlocked;
}

export function canAffordWorld(state, worldCfg) {
  return worldCfg != null && state.money >= worldCfg.unlockCost;
}

// Gesamtkosten, um eine Welt komplett zu maxen (Stations-Unlocks + alle Level).
// Nur für Balancing/Tests – nicht im Hot-Path.
export function worldMaxCost(worldId) {
  const cfgs = STATIONS[worldId];
  if (!cfgs) return 0;
  let sum = 0;
  for (const c of cfgs) sum += c.unlockCost + totalUpgradeCost(c, 1, c.levelCap);
  return sum;
}
