import { createInitialState } from './gameState.js';
import { STATIONS } from '../data/stations.js';
import { worldIncomePerSec } from '../systems/production.js';

// Save/Load + Offline-Progress. localStorage als JSON, versioniert.
const KEY = 'foodtruck-empire-save';
const VERSION = 1;
export const OFFLINE_CAP_SECONDS = 3 * 3600; // Offline-Progress gedeckelt auf 3h

export function saveGame(state) {
  const payload = { version: VERSION, savedAt: Date.now(), state };
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false; // privater Modus / Quota – Spiel läuft trotzdem weiter
  }
}

export function loadGame() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!payload || payload.version !== VERSION || !payload.state) return null;

  const state = mergeState(payload.state);
  const offline = computeOffline(state, payload.savedAt);
  return { state, offline };
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Frisches Gerüst bauen und gespeicherte Werte darüberlegen. So bleiben
// neue Stationen/Welten aus der Config auch bei alten Saves konsistent.
function mergeState(saved) {
  const fresh = createInitialState();

  if (typeof saved.money === 'number' && Number.isFinite(saved.money)) {
    fresh.money = Math.max(0, saved.money);
  }
  if (saved.currentWorld && fresh.worlds[saved.currentWorld]) {
    fresh.currentWorld = saved.currentWorld;
  }

  for (const wid in fresh.worlds) {
    const savedWorld = saved.worlds?.[wid];
    if (!savedWorld) continue;
    if (savedWorld.unlocked) fresh.worlds[wid].unlocked = true;
    if (savedWorld.managerHired) fresh.worlds[wid].managerHired = true;

    for (const sid in fresh.worlds[wid].stations) {
      const savedStation = savedWorld.stations?.[sid];
      if (!savedStation) continue;
      const st = fresh.worlds[wid].stations[sid];
      if (savedStation.unlocked) st.unlocked = true;
      if (typeof savedStation.level === 'number' && savedStation.level >= 0) {
        st.level = Math.floor(savedStation.level);
      }
      if (st.unlocked && st.level < 1) st.level = 1;
    }
  }

  // Statistiken, Achievements und Einstellungen übernehmen (defensiv).
  if (saved.stats) {
    if (Number.isFinite(saved.stats.totalEarned)) {
      fresh.stats.totalEarned = Math.max(0, saved.stats.totalEarned);
    }
    if (Number.isFinite(saved.stats.tipsCollected)) {
      fresh.stats.tipsCollected = Math.max(0, Math.floor(saved.stats.tipsCollected));
    }
  }
  if (Array.isArray(saved.achievements)) {
    fresh.achievements = saved.achievements.filter((id) => typeof id === 'string');
  }
  fresh.muted = !!saved.muted;

  return fresh;
}

function computeOffline(state, savedAt) {
  if (!savedAt) return null;
  const elapsed = Math.max(0, (Date.now() - savedAt) / 1000);
  const capped = Math.min(elapsed, OFFLINE_CAP_SECONDS);
  if (capped < 1) return null;

  const cfgs = STATIONS[state.currentWorld];
  if (!cfgs) return null;
  const income = worldIncomePerSec(cfgs, state.worlds[state.currentWorld]);
  const earned = income * capped;
  if (earned <= 0) return null;

  return {
    earned,
    seconds: capped,
    wasCapped: elapsed > OFFLINE_CAP_SECONDS
  };
}
