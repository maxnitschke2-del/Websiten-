import { STATIONS } from '../data/stations.js';
import { WORLDS } from '../data/worlds.js';

// Single source of truth. Alle Systeme lesen/schreiben ausschließlich hier.
export function createInitialState() {
  const worlds = {};
  for (const world of WORLDS) {
    const stationCfgs = STATIONS[world.id];
    if (!stationCfgs) continue;
    const stations = {};
    for (const cfg of stationCfgs) {
      const startsUnlocked = cfg.unlockCost === 0;
      stations[cfg.id] = {
        level: startsUnlocked ? 1 : 0,
        unlocked: startsUnlocked
      };
    }
    worlds[world.id] = {
      unlocked: world.unlockCost === 0,
      managerHired: false,
      stations
    };
  }

  return {
    money: 0,
    currentWorld: 'w1',
    worlds,
    // Lebenslauf-Statistiken für Achievements.
    stats: {
      totalEarned: 0,
      tipsCollected: 0
    },
    achievements: [], // IDs bereits freigeschalteter Achievements
    muted: false
  };
}

export function getCurrentWorldState(state) {
  return state.worlds[state.currentWorld];
}
