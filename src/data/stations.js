// Stations-Definitionen. Phase 1: eine einzige Station (Burger-Grill).
// Weitere Stationen kommen in Phase 3 dazu.
export const STATIONS = [
  {
    id: 'grill',
    name: 'Burger-Grill',
    emoji: '🍔',
    baseIncome: 1, // $/s bei Level 1
    baseCost: 10,
    costGrowth: 1.15,
  },
];

export function getStation(id) {
  return STATIONS.find((s) => s.id === id);
}

export function incomePerSecond(def, level) {
  return def.baseIncome * level;
}

export function upgradeCost(def, level) {
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, level - 1));
}
