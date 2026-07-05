// Stations-Definitionen. Die erste Station ist von Anfang an frei,
// weitere werden per unlockCost freigeschaltet (Level 0 = gesperrt).
export const STATIONS = [
  {
    id: 'grill',
    name: 'Burger-Grill',
    emoji: '🍔',
    sign: 'BURGER',
    baseIncome: 1, // $/s bei Level 1
    baseCost: 10,
    costGrowth: 1.15,
    unlockCost: 0,
    theme: { awning: '#e23b3b', shirt: '#e23b3b' },
  },
  {
    id: 'fries',
    name: 'Pommes-Station',
    emoji: '🍟',
    sign: 'POMMES',
    baseIncome: 4,
    baseCost: 60,
    costGrowth: 1.15,
    unlockCost: 150,
    theme: { awning: '#f5a623', shirt: '#f5a623' },
  },
  {
    id: 'drinks',
    name: 'Getränke-Stand',
    emoji: '🥤',
    sign: 'DRINKS',
    baseIncome: 12,
    baseCost: 200,
    costGrowth: 1.15,
    unlockCost: 600,
    theme: { awning: '#3a7bd5', shirt: '#3a7bd5' },
  },
];

export function getStation(id) {
  return STATIONS.find((s) => s.id === id);
}

export function incomePerSecond(def, level) {
  return def.baseIncome * level;
}

// Level 0 -> Freischalt-Kosten, danach normale Upgrade-Kurve.
export function upgradeCost(def, level) {
  if (level === 0) return def.unlockCost;
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, level - 1));
}
