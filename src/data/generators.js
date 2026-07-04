// Reine Config – KEINE Logik. Truck-Typen (Generatoren).
// unlockAt = totalEarned-Schwelle, ab der der Truck sichtbar/kaufbar wird.

export const GENERATORS = [
  {
    id: 'hotdog',
    name: 'Hotdog-Stand',
    emoji: '🌭',
    desc: 'Der bescheidene Anfang: Würstchen im Brötchen.',
    baseCost: 15,
    baseIncome: 0.5,
    growthRate: 1.07,
    unlockAt: 0,
  },
];

export const GENERATOR_MAP = Object.fromEntries(
  GENERATORS.map((g) => [g.id, g])
);
