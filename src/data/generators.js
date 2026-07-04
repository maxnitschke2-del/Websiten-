// Reine Config – KEINE Logik. Truck-Typen (Generatoren).
// unlockAt = totalEarned-Schwelle, ab der der Truck kaufbar wird.
// Davor (ab unlockAt/5) erscheint er als "???"-Teaser.
// growthRate gestaffelt 1.07 → 1.15: frühe Trucks bleiben lange relevant,
// späte skalieren teurer → echter Trade-off zwischen Breite und Tiefe.

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
  {
    id: 'burger',
    name: 'Burger-Truck',
    emoji: '🍔',
    desc: 'Saftige Patties, hausgemachte Saucen.',
    baseCost: 100,
    baseIncome: 4,
    growthRate: 1.09,
    unlockAt: 50,
  },
  {
    id: 'fries',
    name: 'Pommes-Buden-Truck',
    emoji: '🍟',
    desc: 'Knusprig-goldene Fritten mit 20 Dips.',
    baseCost: 1100,
    baseIncome: 30,
    growthRate: 1.1,
    unlockAt: 550,
  },
  {
    id: 'taco',
    name: 'Taco-Truck',
    emoji: '🌮',
    desc: 'Street-Food-Fiesta auf vier Rädern.',
    baseCost: 12000,
    baseIncome: 220,
    growthRate: 1.11,
    unlockAt: 6000,
  },
  {
    id: 'pizza',
    name: 'Pizza-Ofen-Truck',
    emoji: '🍕',
    desc: 'Steinofen an Bord, Neapel im Herzen.',
    baseCost: 130000,
    baseIncome: 1800,
    growthRate: 1.12,
    unlockAt: 65000,
  },
  {
    id: 'ramen',
    name: 'Ramen-Truck',
    emoji: '🍜',
    desc: '18 Stunden gekochte Brühe. Schlürfen erlaubt.',
    baseCost: 1.4e6,
    baseIncome: 15000,
    growthRate: 1.13,
    unlockAt: 700000,
  },
  {
    id: 'sushi',
    name: 'Sushi-Truck',
    emoji: '🍣',
    desc: 'Omakase to go – der Fisch ist frischer als dein Feed.',
    baseCost: 20e6,
    baseIncome: 140000,
    growthRate: 1.14,
    unlockAt: 10e6,
  },
  {
    id: 'gourmet',
    name: 'Gourmet-Fusion-Truck',
    emoji: '⭐',
    desc: 'Sterneküche auf Rädern. Kritiker weinen vor Glück.',
    baseCost: 330e6,
    baseIncome: 1.5e6,
    growthRate: 1.15,
    unlockAt: 165e6,
  },
];

export const GENERATOR_MAP = Object.fromEntries(
  GENERATORS.map((g) => [g.id, g])
);
