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
  ],
  // Welt 3 = Welt 1 × 1600² (= ×2.56e6).
  w3: [
    {
      id: 'rolls',
      name: 'Maki-Rollen',
      icon: '🍣',
      baseCost: 10.24e6,
      baseIncome: 2.56e6,
      growthRate: 1.14,
      levelCap: 50,
      unlockCost: 0
    },
    {
      id: 'nigiri',
      name: 'Nigiri-Theke',
      icon: '🍤',
      baseCost: 153.6e6,
      baseIncome: 17.92e6,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 768e6
    },
    {
      id: 'tea',
      name: 'Grüntee-Bar',
      icon: '🍵',
      baseCost: 1.92e9,
      baseIncome: 115.2e6,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 10.24e9
    },
    {
      id: 'mochi',
      name: 'Mochi-Theke',
      icon: '🍡',
      baseCost: 23.04e9,
      baseIncome: 716.8e6,
      growthRate: 1.16,
      levelCap: 50,
      unlockCost: 128e9
    }
  ],
  // Welt 4 = Welt 1 × 1600³ (= ×4.096e9).
  w4: [
    {
      id: 'sundae',
      name: 'Sundae-Theke',
      icon: '🍨',
      baseCost: 16.384e9,
      baseIncome: 4.096e9,
      growthRate: 1.14,
      levelCap: 50,
      unlockCost: 0
    },
    {
      id: 'donuts',
      name: 'Donut-Theke',
      icon: '🍩',
      baseCost: 245.76e9,
      baseIncome: 28.672e9,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 1.2288e12
    },
    {
      id: 'shakes',
      name: 'Milchshake-Bar',
      icon: '🥤',
      baseCost: 3.072e12,
      baseIncome: 184.32e9,
      growthRate: 1.15,
      levelCap: 50,
      unlockCost: 16.384e12
    },
    {
      id: 'cupcakes',
      name: 'Cupcake-Theke',
      icon: '🧁',
      baseCost: 36.864e12,
      baseIncome: 1.14688e12,
      growthRate: 1.16,
      levelCap: 50,
      unlockCost: 204.8e12
    }
  ]
};
