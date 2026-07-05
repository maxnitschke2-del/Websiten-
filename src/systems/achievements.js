// Achievement-System: prüft die Erfolgs-Bedingungen gegen den Spielstand
// und meldet neue Freischaltungen an die UI (Toast + Grid).
import { ACHIEVEMENTS } from '../data/achievements.js';
import { state, saveState } from '../core/state.js';
import { getStations } from '../data/stations.js';
import { stationsAtCap, isFinalLocation } from './progression.js';

let onUnlockCb = null;

export function onAchievementUnlocked(fn) {
  onUnlockCb = fn;
}

export function isUnlocked(id) {
  return state.achievements.includes(id);
}

function contextNow() {
  const stations = getStations();
  const atCap = stationsAtCap();
  return {
    tips: state.tipsCollected,
    money: state.money,
    unlockedStations: stations.filter((d) => state.stations[d.id].level > 0).length,
    totalStations: stations.length,
    stationsAtCap: atCap,
    locationIndex: state.locationIndex,
    worldsUnlocked: state.unlockedWorlds,
    mastered: isFinalLocation() && atCap === stations.length,
  };
}

export function checkAchievements() {
  const ctx = contextNow();
  for (const def of ACHIEVEMENTS) {
    if (isUnlocked(def.id)) continue;
    if (def.check(ctx)) {
      state.achievements.push(def.id);
      saveState();
      if (onUnlockCb) onUnlockCb(def);
    }
  }
}
