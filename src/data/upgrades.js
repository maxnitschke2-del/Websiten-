// Reine Config – KEINE Logik. Upgrade-Definitionen.
//
// Typen:
//  genMult        → Produktion eines Trucks ×value (Personal/Köche)
//  clickMult      → Klick-Basiswert ×value
//  clickIncomePct → Klick erhält zusätzlich value (z.B. 0.01 = 1%) des €/s
//  globalMult     → gesamte Produktion ×value
//
// requires: { generator, owned } → sichtbar ab N Trucks dieses Typs
//           { totalEarned }      → sichtbar ab verdienter Summe

export const UPGRADES = [
  // --- Personal pro Truck-Typ (3 Stufen: 10 / 25 / 50 Trucks) ---
  { id: 'hotdog1', name: 'Senf-Spender Deluxe', emoji: '🌭', desc: 'Hotdog-Stände produzieren doppelt so viel.', cost: 180, type: 'genMult', target: 'hotdog', value: 2, requires: { generator: 'hotdog', owned: 10 } },
  { id: 'hotdog2', name: 'Brioche-Brötchen', emoji: '🌭', desc: 'Hotdog-Stände produzieren doppelt so viel.', cost: 1200, type: 'genMult', target: 'hotdog', value: 2, requires: { generator: 'hotdog', owned: 25 } },
  { id: 'hotdog3', name: 'Wurst-Sommelier', emoji: '🌭', desc: 'Hotdog-Stände produzieren doppelt so viel.', cost: 9000, type: 'genMult', target: 'hotdog', value: 2, requires: { generator: 'hotdog', owned: 50 } },

  { id: 'burger1', name: 'Grillmeister', emoji: '🍔', desc: 'Burger-Trucks produzieren doppelt so viel.', cost: 1200, type: 'genMult', target: 'burger', value: 2, requires: { generator: 'burger', owned: 10 } },
  { id: 'burger2', name: 'Smash-Technik', emoji: '🍔', desc: 'Burger-Trucks produzieren doppelt so viel.', cost: 8000, type: 'genMult', target: 'burger', value: 2, requires: { generator: 'burger', owned: 25 } },
  { id: 'burger3', name: 'Trüffel-Mayo', emoji: '🍔', desc: 'Burger-Trucks produzieren doppelt so viel.', cost: 60000, type: 'genMult', target: 'burger', value: 2, requires: { generator: 'burger', owned: 50 } },

  { id: 'fries1', name: 'Doppelt frittiert', emoji: '🍟', desc: 'Pommes-Buden produzieren doppelt so viel.', cost: 13000, type: 'genMult', target: 'fries', value: 2, requires: { generator: 'fries', owned: 10 } },
  { id: 'fries2', name: 'Dip-Bar', emoji: '🍟', desc: 'Pommes-Buden produzieren doppelt so viel.', cost: 90000, type: 'genMult', target: 'fries', value: 2, requires: { generator: 'fries', owned: 25 } },
  { id: 'fries3', name: 'Belgisches Geheimrezept', emoji: '🍟', desc: 'Pommes-Buden produzieren doppelt so viel.', cost: 660000, type: 'genMult', target: 'fries', value: 2, requires: { generator: 'fries', owned: 50 } },

  { id: 'taco1', name: 'Salsa-Bar', emoji: '🌮', desc: 'Taco-Trucks produzieren doppelt so viel.', cost: 145000, type: 'genMult', target: 'taco', value: 2, requires: { generator: 'taco', owned: 10 } },
  { id: 'taco2', name: 'Abuelas Rezept', emoji: '🌮', desc: 'Taco-Trucks produzieren doppelt so viel.', cost: 960000, type: 'genMult', target: 'taco', value: 2, requires: { generator: 'taco', owned: 25 } },
  { id: 'taco3', name: 'Ghost-Pepper-Special', emoji: '🌮', desc: 'Taco-Trucks produzieren doppelt so viel.', cost: 7.2e6, type: 'genMult', target: 'taco', value: 2, requires: { generator: 'taco', owned: 50 } },

  { id: 'pizza1', name: 'Steinofen-Tuning', emoji: '🍕', desc: 'Pizza-Trucks produzieren doppelt so viel.', cost: 1.56e6, type: 'genMult', target: 'pizza', value: 2, requires: { generator: 'pizza', owned: 10 } },
  { id: 'pizza2', name: 'San-Marzano-Tomaten', emoji: '🍕', desc: 'Pizza-Trucks produzieren doppelt so viel.', cost: 10.4e6, type: 'genMult', target: 'pizza', value: 2, requires: { generator: 'pizza', owned: 25 } },
  { id: 'pizza3', name: 'Pizzaiolo-Weltmeister', emoji: '🍕', desc: 'Pizza-Trucks produzieren doppelt so viel.', cost: 78e6, type: 'genMult', target: 'pizza', value: 2, requires: { generator: 'pizza', owned: 50 } },

  { id: 'ramen1', name: 'Tonkotsu-Brühe', emoji: '🍜', desc: 'Ramen-Trucks produzieren doppelt so viel.', cost: 16.8e6, type: 'genMult', target: 'ramen', value: 2, requires: { generator: 'ramen', owned: 10 } },
  { id: 'ramen2', name: 'Handgezogene Nudeln', emoji: '🍜', desc: 'Ramen-Trucks produzieren doppelt so viel.', cost: 112e6, type: 'genMult', target: 'ramen', value: 2, requires: { generator: 'ramen', owned: 25 } },
  { id: 'ramen3', name: 'Umami-Meister', emoji: '🍜', desc: 'Ramen-Trucks produzieren doppelt so viel.', cost: 840e6, type: 'genMult', target: 'ramen', value: 2, requires: { generator: 'ramen', owned: 50 } },

  { id: 'sushi1', name: 'Frischfisch-Abo', emoji: '🍣', desc: 'Sushi-Trucks produzieren doppelt so viel.', cost: 240e6, type: 'genMult', target: 'sushi', value: 2, requires: { generator: 'sushi', owned: 10 } },
  { id: 'sushi2', name: 'Wasabi-Upgrade', emoji: '🍣', desc: 'Sushi-Trucks produzieren doppelt so viel.', cost: 1.6e9, type: 'genMult', target: 'sushi', value: 2, requires: { generator: 'sushi', owned: 25 } },
  { id: 'sushi3', name: 'Itamae-Meister', emoji: '🍣', desc: 'Sushi-Trucks produzieren doppelt so viel.', cost: 12e9, type: 'genMult', target: 'sushi', value: 2, requires: { generator: 'sushi', owned: 50 } },

  { id: 'gourmet1', name: 'Michelin-Beratung', emoji: '⭐', desc: 'Gourmet-Trucks produzieren doppelt so viel.', cost: 4e9, type: 'genMult', target: 'gourmet', value: 2, requires: { generator: 'gourmet', owned: 10 } },
  { id: 'gourmet2', name: 'Molekularküche', emoji: '⭐', desc: 'Gourmet-Trucks produzieren doppelt so viel.', cost: 26e9, type: 'genMult', target: 'gourmet', value: 2, requires: { generator: 'gourmet', owned: 25 } },
  { id: 'gourmet3', name: 'Drei-Sterne-Crew', emoji: '⭐', desc: 'Gourmet-Trucks produzieren doppelt so viel.', cost: 200e9, type: 'genMult', target: 'gourmet', value: 2, requires: { generator: 'gourmet', owned: 50 } },

  // --- Klick-Pfad: Klicken bleibt lebenslang relevant ---
  { id: 'click1', name: 'Marktschreier', emoji: '📣', desc: 'Klick-Wert verdoppelt.', cost: 100, type: 'clickMult', value: 2, requires: { totalEarned: 50 } },
  { id: 'click2', name: 'Megafon', emoji: '📢', desc: 'Klick-Wert verdoppelt.', cost: 2500, type: 'clickMult', value: 2, requires: { totalEarned: 1200 } },
  { id: 'click3', name: 'Verkaufstalent', emoji: '🤝', desc: 'Klick-Wert verdoppelt.', cost: 50000, type: 'clickMult', value: 2, requires: { totalEarned: 25000 } },
  { id: 'clickPct1', name: 'Laufkundschaft', emoji: '🚶', desc: 'Jeder Klick bringt zusätzlich 1% deines €/s.', cost: 10000, type: 'clickIncomePct', value: 0.01, requires: { totalEarned: 5000 } },
  { id: 'clickPct2', name: 'Foodblogger-Hype', emoji: '🤳', desc: 'Jeder Klick bringt zusätzlich 4% deines €/s.', cost: 1e6, type: 'clickIncomePct', value: 0.04, requires: { totalEarned: 500000 } },

  // --- Globale Multiplikatoren (teuer, wirken auf alles) ---
  { id: 'global1', name: 'Social-Media-Kampagne', emoji: '📱', desc: 'Gesamte Produktion ×1,5.', cost: 25000, type: 'globalMult', value: 1.5, requires: { totalEarned: 12000 } },
  { id: 'global2', name: 'Foodtruck-Festival', emoji: '🎪', desc: 'Gesamte Produktion ×2.', cost: 2e6, type: 'globalMult', value: 2, requires: { totalEarned: 1e6 } },
  { id: 'global3', name: 'TV-Werbespot', emoji: '📺', desc: 'Gesamte Produktion ×2.', cost: 150e6, type: 'globalMult', value: 2, requires: { totalEarned: 75e6 } },
];

export const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
