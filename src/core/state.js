import { getStationsFor } from '../data/stations.js';

const SAVE_KEY = 'foodtruck-idle-v1';

export const state = {
  money: 0,
  worldIndex: 0, // aktive Welt
  unlockedWorlds: 1, // Anzahl freigeschalteter Welten (sequenziell)
  worldSaves: {}, // worldIndex -> { money, locationIndex, stations } (inaktive Welten)
  locationIndex: 0,
  stations: {}, // stationId -> { level } (aktive Welt)
  tipsCollected: 0,
  achievements: [], // freigeschaltete Achievement-IDs
  muted: false,
  lastSeen: Date.now(),
};

export function ensureStations() {
  for (const def of getStationsFor(state.worldIndex)) {
    if (!state.stations[def.id]) {
      state.stations[def.id] = { level: def.unlockCost > 0 ? 0 : 1 };
    }
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (err) {
    console.warn('Spielstand konnte nicht geladen werden:', err);
  }
  ensureStations();
}

// Umzug in eine neue Stadt: Geld und Stationen zurücksetzen,
// locationIndex und tipsCollected bleiben erhalten.
export function resetForNewLocation() {
  state.money = 0;
  state.stations = {};
  ensureStations();
}

export function saveState() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Spielstand konnte nicht gespeichert werden:', err);
  }
}
