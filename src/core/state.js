import { STATIONS } from '../data/stations.js';

const SAVE_KEY = 'foodtruck-idle-v1';

export const state = {
  money: 0,
  locationIndex: 0,
  stations: {}, // stationId -> { level }
  lastSeen: Date.now(),
};

function ensureStations() {
  for (const def of STATIONS) {
    if (!state.stations[def.id]) state.stations[def.id] = { level: 1 };
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

export function saveState() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Spielstand konnte nicht gespeichert werden:', err);
  }
}
