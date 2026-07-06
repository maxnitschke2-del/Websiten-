// Reine Konfiguration. Die Stationswerte werden aus einem numerischen
// Template (= Welt 1) erzeugt: Welt N skaliert baseCost/baseIncome/unlockCost
// um WORLD_SCALE^(N-1). Da Kosten UND Einkommen um denselben Faktor wachsen,
// ist die Pacing-Kurve pro Welt identisch (~24 min aktives Spiel bis zur
// nächsten Welt, per Simulation getunt). growthRate liegt bei ~1.12, damit
// das Einkommen (Meilenstein ×2 alle 10 Level = ×1024 bei Level 100) über den
// gesamten Level-Cap mit der Kostenkurve mithält.
export const WORLD_SCALE = 1600;
export const LEVEL_CAP = 100;

// Numerisches Template (Welt 1), sortiert von günstig nach teuer.
const SLOTS = [
  { g: 1.12, base: 4, inc: 1.4, unlock: 0 },
  { g: 1.12, base: 55, inc: 11, unlock: 200 },
  { g: 1.12, base: 700, inc: 98, unlock: 3500 },
  { g: 1.122, base: 9000, inc: 900, unlock: 45000 },
  { g: 1.122, base: 120000, inc: 8400, unlock: 600000 },
  { g: 1.125, base: 1.6e6, inc: 84000, unlock: 8e6 }
];

// Pro Welt: id / Name / Icon je Slot (gleiche Reihenfolge wie SLOTS).
const NAMES = {
  w1: [
    ['grill', 'Burger-Grill', '🍔'],
    ['fries', 'Pommes-Station', '🍟'],
    ['drinks', 'Getränke-Bar', '🥤'],
    ['hotdog', 'Hotdog-Stand', '🌭'],
    ['icecream', 'Eis-Theke', '🍦'],
    ['shake', 'Milchshake-Bar', '🧋']
  ],
  w2: [
    ['griddle', 'Taco-Plancha', '🌮'],
    ['salsa', 'Salsa-Bar', '🥑'],
    ['aguas', 'Aguas Frescas', '🍹'],
    ['nachos', 'Nachos-Stand', '🧀'],
    ['churros', 'Churros-Stand', '🍩'],
    ['burrito', 'Burrito-Rolle', '🌯']
  ],
  w3: [
    ['rolls', 'Maki-Rollen', '🍣'],
    ['nigiri', 'Nigiri-Theke', '🍤'],
    ['tea', 'Grüntee-Bar', '🍵'],
    ['ramen', 'Ramen-Küche', '🍜'],
    ['mochi', 'Mochi-Theke', '🍡'],
    ['sake', 'Sake-Bar', '🍶']
  ],
  w4: [
    ['sundae', 'Sundae-Theke', '🍨'],
    ['donuts', 'Donut-Theke', '🍩'],
    ['shakes', 'Milchshake-Bar', '🥤'],
    ['cookies', 'Keks-Ofen', '🍪'],
    ['cupcakes', 'Cupcake-Theke', '🧁'],
    ['candy', 'Süßwaren-Stand', '🍭']
  ]
};

function buildStations(worldId, factor) {
  return NAMES[worldId].map(([id, name, icon], i) => {
    const s = SLOTS[i];
    return {
      id,
      name,
      icon,
      growthRate: s.g,
      levelCap: LEVEL_CAP,
      baseCost: s.base * factor,
      baseIncome: s.inc * factor,
      unlockCost: s.unlock * factor
    };
  });
}

export const STATIONS = {
  w1: buildStations('w1', 1),
  w2: buildStations('w2', WORLD_SCALE),
  w3: buildStations('w3', WORLD_SCALE ** 2),
  w4: buildStations('w4', WORLD_SCALE ** 3)
};
