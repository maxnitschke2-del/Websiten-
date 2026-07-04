// Save/Load, Autosave & Offline-Progress.
// Saves liegen Base64-codiert als JSON in localStorage.

import {
  state,
  replaceState,
  createDefaultState,
  SAVE_VERSION,
} from './gameState.js';
import { getTotalIncome, earn } from '../systems/production.js';

const SAVE_KEY = 'foodTruckEmpire.save';
export const AUTOSAVE_INTERVAL_MS = 15000;

// Offline-Verdienst: max. 8h, mit 50% der normalen Rate.
const OFFLINE_CAP_SECONDS = 8 * 3600;
const OFFLINE_RATE = 0.5;
// Unter 1 Minute Abwesenheit: kein Popup, keine Verrechnung.
const OFFLINE_MIN_SECONDS = 60;

export function encodeSave(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

export function decodeSave(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
}

export function save() {
  state.lastSaveTime = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, encodeSave(state));
  } catch {
    // localStorage voll/blockiert – Spiel läuft trotzdem weiter
  }
}

/**
 * Lädt den Save (falls vorhanden) in den State.
 * Rückgabe: Offline-Progress-Ergebnis ({ seconds, earned }) oder null.
 */
export function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let saved;
  try {
    saved = decodeSave(raw);
  } catch {
    return null; // korrupter Save → frisch starten statt crashen
  }
  replaceState(migrate(saved));
  const offline = applyOfflineProgress();
  save();
  return offline;
}

/**
 * Migration: fehlende Felder aus dem Default-State ergänzen,
 * damit alte Saves neue Features überleben.
 */
function migrate(saved) {
  const merged = deepMerge(createDefaultState(), saved);
  merged.version = SAVE_VERSION;
  return merged;
}

function deepMerge(target, source) {
  if (source === null || typeof source !== 'object' || Array.isArray(source)) {
    return source === undefined ? target : source;
  }
  const out = { ...target };
  for (const key of Object.keys(source)) {
    out[key] =
      typeof out[key] === 'object' && out[key] !== null && !Array.isArray(out[key])
        ? deepMerge(out[key], source[key])
        : source[key];
  }
  return out;
}

/** Verrechnet die Zeit seit lastSaveTime als Offline-Verdienst. */
export function applyOfflineProgress() {
  const elapsedSec = (Date.now() - state.lastSaveTime) / 1000;
  if (elapsedSec < OFFLINE_MIN_SECONDS) return null;
  const seconds = Math.min(elapsedSec, OFFLINE_CAP_SECONDS);
  const earned = getTotalIncome(state) * seconds * OFFLINE_RATE;
  if (earned <= 0) return null;
  earn(state, earned);
  return { seconds, earned };
}

export function initAutosave() {
  setInterval(save, AUTOSAVE_INTERVAL_MS);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save();
  });
}

export function exportSave() {
  return encodeSave(state);
}

export function importSave(str) {
  try {
    replaceState(migrate(decodeSave(str)));
    save();
    return true;
  } catch {
    return false;
  }
}

export function hardReset() {
  replaceState(createDefaultState());
  save();
}
