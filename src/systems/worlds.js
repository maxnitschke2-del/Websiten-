// Welten-Fortschritt: sequenzielles Freischalten (hohe Kostenkurve,
// bezahlt mit dem Geld der aktiven Welt) und Wechsel zwischen Welten.
// Jede Welt hat ihren eigenen Wirtschafts-Stand (Geld, Stationen,
// Standort-Progression) — beim Wechsel wird er ein-/ausgelagert.
import { state, ensureStations, saveState } from '../core/state.js';
import { WORLDS, getWorld } from '../data/worlds.js';

export function activeWorld() {
  return getWorld(state.worldIndex);
}

export function isWorldUnlocked(index) {
  return index < state.unlockedWorlds;
}

// Index der nächsten freischaltbaren Welt, -1 wenn alle offen sind.
export function nextWorldIndex() {
  return state.unlockedWorlds < WORLDS.length ? state.unlockedWorlds : -1;
}

export function nextWorldCost() {
  const i = nextWorldIndex();
  return i < 0 ? Infinity : WORLDS[i].unlockCost;
}

export function canUnlockNextWorld() {
  return nextWorldIndex() >= 0 && state.money >= nextWorldCost();
}

export function unlockNextWorld() {
  if (!canUnlockNextWorld()) return false;
  const index = nextWorldIndex();
  state.money -= WORLDS[index].unlockCost;
  state.unlockedWorlds += 1;
  switchWorld(index);
  return true;
}

export function switchWorld(index) {
  if (index === state.worldIndex || !isWorldUnlocked(index)) return false;
  // aktive Welt einlagern, Ziel-Welt auslagern (oder frisch starten)
  state.worldSaves[state.worldIndex] = {
    money: state.money,
    locationIndex: state.locationIndex,
    stations: state.stations,
  };
  const save = state.worldSaves[index] || {
    money: 0,
    locationIndex: 0,
    stations: {},
  };
  delete state.worldSaves[index]; // keine geteilte Referenz mit der aktiven Welt
  state.worldIndex = index;
  state.money = save.money;
  state.locationIndex = save.locationIndex;
  state.stations = save.stations;
  ensureStations();
  saveState();
  return true;
}

// Stand einer Welt für den Auswahl-Screen (aktive Welt = Live-Werte).
export function worldSnapshot(index) {
  if (index === state.worldIndex) {
    return { money: state.money, locationIndex: state.locationIndex };
  }
  return state.worldSaves[index] || { money: 0, locationIndex: 0 };
}
