// Offline-Progress: verpasstes passives Einkommen seit dem letzten Besuch,
// gedeckelt auf 3 Stunden - regelmäßiges Reinschauen bleibt so belohnt.
import { state } from '../core/state.js';
import { totalIncomePerSecond } from './production.js';

export const OFFLINE_CAP_SECONDS = 3 * 3600;
const MIN_AWAY_SECONDS = 60;

export function computeOfflineEarnings(now = Date.now()) {
  const awaySeconds = (now - state.lastSeen) / 1000;
  if (!Number.isFinite(awaySeconds) || awaySeconds < MIN_AWAY_SECONDS) return null;

  const countedSeconds = Math.min(awaySeconds, OFFLINE_CAP_SECONDS);
  const amount = totalIncomePerSecond() * countedSeconds;
  if (amount <= 0) return null;

  return {
    awaySeconds,
    countedSeconds,
    capped: awaySeconds > OFFLINE_CAP_SECONDS,
    amount,
  };
}
