// Reine Konfiguration – keine Logik.
// growthRate laut Balancing-Regel: 1.12–1.18.
// unlockCost = 0 bedeutet: Station ist von Anfang an freigeschaltet (Level 1).
//
// Welt-Skalierung (per Balancing-Simulation hergeleitet): Welt N ist gegenüber
// Welt 1 in Kosten UND Einkommen um WORLD_SCALE^(N-1) skaliert. Da beide um den
// gleichen Faktor wachsen, bleibt die Pacing-Kurve pro Welt identisch (~15-30 min).
// Die Welt-Freischaltkosten sind 2.5× der Max-Kosten der Vorwelt – das ergibt
// exakt die geforderten 40% (Max-Welt ≈ 40% der nächsten Freischaltung).
// Welt 3/4 folgen in Phase 6.
export const WORLD_SCALE = 1600;

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
  ],
  // Welt 2 = Welt 1 × 1600 (Kosten, Einkommen und Stations-Freischaltungen).
  w2: [
    {
      id: 'griddle',
      name: 'Taco-Plancha',
      icon: '🌮',
      baseCost: 6400,
      baseIncome: 1600,
      growthRate: 1.14,
      levelCap: 50,
      unlockCost: 0
    },
    {
      id: 'salsa',
      name: 'Salsa-Bar',
      icon: '🥑',
      baseCost: 96000,
      baseIncome: 11200,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 480000
    },
    {
      id: 'aguas',
      name: 'Aguas Frescas',
      icon: '🍹',
      baseCost: 1200000,
      baseIncome: 72000,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 6400000
    },
    {
      id: 'churros',
      name: 'Churros-Stand',
      icon: '🍩',
      baseCost: 14400000,
      baseIncome: 448000,
      growthRate: 1.16,
      levelCap: 50,
      unlockCost: 80000000
    }
  ]
};
