// Reine Konfiguration – keine Logik.
// growthRate laut Balancing-Regel: 1.12–1.18.
// unlockCost = 0 bedeutet: Station ist von Anfang an freigeschaltet (Level 1).
// Stationen der Welten 2-4 folgen in Phase 5/6.
export const STATIONS = {
  w1: [
    {
      id: 'grill',
      name: 'Burger-Grill',
      icon: '🍔',
      baseCost: 4,
      baseIncome: 1,
      growthRate: 1.14,
      levelCap: 50,
      unlockCost: 0
    },
    {
      id: 'fries',
      name: 'Pommes-Station',
      icon: '🍟',
      baseCost: 60,
      baseIncome: 7,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 300
    },
    {
      id: 'drinks',
      name: 'Getränke-Bar',
      icon: '🥤',
      baseCost: 750,
      baseIncome: 45,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 4000
    },
    {
      id: 'icecream',
      name: 'Eis-Theke',
      icon: '🍦',
      baseCost: 9000,
      baseIncome: 280,
      growthRate: 1.16,
      levelCap: 50,
      unlockCost: 50000
    }
  ]
};
