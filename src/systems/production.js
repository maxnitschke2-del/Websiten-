import { milestoneMultiplier } from '../utils/formulas.js';

// Permanenter Produktions-Bonus, sobald der Manager des Trucks eingestellt ist.
export const MANAGER_MULT = 1.5;

export function managerMultiplier(worldState) {
  return worldState.managerHired ? MANAGER_MULT : 1;
}

export function stationIncomePerSec(stationCfg, stationState) {
  if (!stationState.unlocked || stationState.level <= 0) return 0;
  return (
    stationCfg.baseIncome *
    stationState.level *
    milestoneMultiplier(stationState.level)
  );
}

export function worldIncomePerSec(stationCfgs, worldState) {
  let sum = 0;
  for (const cfg of stationCfgs) {
    sum += stationIncomePerSec(cfg, worldState.stations[cfg.id]);
  }
  return sum * managerMultiplier(worldState);
}

export function tickProduction(state, stationCfgs, dt) {
  const worldState = state.worlds[state.currentWorld];
  const gained = worldIncomePerSec(stationCfgs, worldState) * dt;
  state.money += gained;
  state.stats.totalEarned += gained;
}
