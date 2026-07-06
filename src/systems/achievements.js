import { ACHIEVEMENTS } from '../data/achievements.js';
import { STATIONS } from '../data/stations.js';
import { WORLDS } from '../data/worlds.js';

// Reine Auswertungslogik. Baut aus dem State einen Metrik-Snapshot und
// vergleicht ihn gegen die deklarativen Achievement-Schwellen.
export function buildSnapshot(state) {
  let stationsUnlocked = 0;
  let maxLevel = 0;
  let worldsMaxed = 0;

  for (const world of WORLDS) {
    const cfgs = STATIONS[world.id];
    const ws = state.worlds[world.id];
    if (!cfgs || !ws) continue;

    let allMaxed = true;
    for (const cfg of cfgs) {
      const st = ws.stations[cfg.id];
      if (st.unlocked) {
        stationsUnlocked++;
        if (st.level > maxLevel) maxLevel = st.level;
        if (st.level < cfg.levelCap) allMaxed = false;
      } else {
        allMaxed = false;
      }
    }
    if (allMaxed) worldsMaxed++;
  }

  const worldsUnlocked = WORLDS.filter((w) => state.worlds[w.id]?.unlocked).length;
  const managersHired = WORLDS.filter((w) => state.worlds[w.id]?.managerHired).length;

  return {
    totalEarned: state.stats.totalEarned,
    tipsCollected: state.stats.tipsCollected,
    stationsUnlocked,
    maxLevel,
    worldsUnlocked,
    worldsMaxed,
    managersHired
  };
}

export function isAchievementMet(ach, snapshot) {
  return snapshot[ach.metric] >= ach.threshold;
}

// Liefert alle Achievements mit Freischalt-Status + Fortschritt (für die UI).
export function evaluateAchievements(state) {
  const snap = buildSnapshot(state);
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: isAchievementMet(a, snap),
    current: snap[a.metric],
    progress: Math.max(0, Math.min(1, snap[a.metric] / a.threshold))
  }));
}

// Neu erfüllte Achievements finden und im State vermerken (mutiert state.achievements).
export function collectNewlyUnlocked(state) {
  const snap = buildSnapshot(state);
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) continue;
    if (isAchievementMet(a, snap)) {
      state.achievements.push(a.id);
      newly.push(a);
    }
  }
  return newly;
}
