// Achievement-System: prüft die Erfolgs-Bedingungen gegen den Spielstand
// und meldet neue Freischaltungen an die UI (Toast + Grid).
import { ACHIEVEMENTS } from '../data/achievements.js';
import { state, saveState } from '../core/state.js';
import { STATIONS } from '../data/stations.js';
import { stationsAtCap, isFinalLocation } from './progression.js';

let onUnlockCb = null;

export function onAchievementUnlocked(fn) {
  onUnlockCb = fn;
}

export function isUnlocked(id) {
  return state.achievements.includes(id);
}

function contextNow() {
  const atCap = stationsAtCap();
  return {
    tips: state.tipsCollected,
    money: state.money,
    unlockedStations: STATIONS.filter((d) => state.stations[d.id].level > 0).length,
    stationsAtCap: atCap,
    locationIndex: state.locationIndex,
    mastered: isFinalLocation() && atCap === STATIONS.length,
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
