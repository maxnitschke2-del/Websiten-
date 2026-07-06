import { milestoneMultiplier } from '../utils/formulas.js';

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
  return sum;
}

export function tickProduction(state, stationCfgs, dt) {
  const worldState = state.worlds[state.currentWorld];
  const gained = worldIncomePerSec(stationCfgs, worldState) * dt;
  state.money += gained;
  state.stats.totalEarned += gained;
}
