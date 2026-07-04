// Reine Config – KEINE Logik. Erfolge/Meilensteine.
// Jeder freigeschaltete Erfolg gibt permanent +1% auf alles.
//
// cond-Typen: clicks | generatorOwned | totalTrucks | lifetimeEarned
//             | income | resets | upgradesOwned

export const ACHIEVEMENT_BONUS = 0.01; // +1% pro Erfolg

export const ACHIEVEMENTS = [
  { id: 'click1', name: 'Erster Verkauf', desc: 'Tippe 1× auf den Truck.', emoji: '👆', cond: { type: 'clicks', value: 1 } },
  { id: 'click100', name: 'Fleißige Finger', desc: 'Tippe 100× auf den Truck.', emoji: '🫰', cond: { type: 'clicks', value: 100 } },
  { id: 'click1000', name: 'Klick-Maschine', desc: 'Tippe 1.000× auf den Truck.', emoji: '⚡', cond: { type: 'clicks', value: 1000 } },

  { id: 'hotdog1', name: 'Der erste Stand', desc: 'Kaufe deinen ersten Hotdog-Stand.', emoji: '🌭', cond: { type: 'generatorOwned', target: 'hotdog', value: 1 } },
  { id: 'hotdog25', name: 'Wurst-Imperium', desc: 'Besitze 25 Hotdog-Stände.', emoji: '🌭', cond: { type: 'generatorOwned', target: 'hotdog', value: 25 } },
  { id: 'burger10', name: 'Patty-Party', desc: 'Besitze 10 Burger-Trucks.', emoji: '🍔', cond: { type: 'generatorOwned', target: 'burger', value: 10 } },
  { id: 'fries10', name: 'Frittenbude', desc: 'Besitze 10 Pommes-Buden.', emoji: '🍟', cond: { type: 'generatorOwned', target: 'fries', value: 10 } },
  { id: 'taco10', name: 'Taco Tuesday', desc: 'Besitze 10 Taco-Trucks.', emoji: '🌮', cond: { type: 'generatorOwned', target: 'taco', value: 10 } },
  { id: 'pizza10', name: 'Bella Napoli', desc: 'Besitze 10 Pizza-Trucks.', emoji: '🍕', cond: { type: 'generatorOwned', target: 'pizza', value: 10 } },
  { id: 'ramen10', name: 'Nudel-Nirwana', desc: 'Besitze 10 Ramen-Trucks.', emoji: '🍜', cond: { type: 'generatorOwned', target: 'ramen', value: 10 } },
  { id: 'sushi10', name: 'Roll-Modell', desc: 'Besitze 10 Sushi-Trucks.', emoji: '🍣', cond: { type: 'generatorOwned', target: 'sushi', value: 10 } },
  { id: 'gourmet10', name: 'Sterne-Flotte', desc: 'Besitze 10 Gourmet-Trucks.', emoji: '⭐', cond: { type: 'generatorOwned', target: 'gourmet', value: 10 } },

  { id: 'trucks50', name: 'Kleine Flotte', desc: 'Besitze insgesamt 50 Trucks.', emoji: '🚛', cond: { type: 'totalTrucks', value: 50 } },
  { id: 'trucks150', name: 'Truck-Armada', desc: 'Besitze insgesamt 150 Trucks.', emoji: '🚚', cond: { type: 'totalTrucks', value: 150 } },
  { id: 'trucks400', name: 'Straßen-Monopol', desc: 'Besitze insgesamt 400 Trucks.', emoji: '🛣️', cond: { type: 'totalTrucks', value: 400 } },

  { id: 'earn1k', name: 'Erste Tausender', desc: 'Verdiene insgesamt 1.000 €.', emoji: '💵', cond: { type: 'lifetimeEarned', value: 1e3 } },
  { id: 'earn1m', name: 'Millionär', desc: 'Verdiene insgesamt 1 Mio €.', emoji: '💰', cond: { type: 'lifetimeEarned', value: 1e6 } },
  { id: 'earn1b', name: 'Milliardär', desc: 'Verdiene insgesamt 1 Mrd €.', emoji: '🤑', cond: { type: 'lifetimeEarned', value: 1e9 } },
  { id: 'earn1t', name: 'Foodtruck-Tycoon', desc: 'Verdiene insgesamt 1 Bio €.', emoji: '👑', cond: { type: 'lifetimeEarned', value: 1e12 } },

  { id: 'income100', name: 'Läuft bei dir', desc: 'Erreiche 100 €/s.', emoji: '📈', cond: { type: 'income', value: 100 } },
  { id: 'income10k', name: 'Geldmaschine', desc: 'Erreiche 10.000 €/s.', emoji: '💸', cond: { type: 'income', value: 10000 } },
  { id: 'income1m', name: 'Gelddruckerei', desc: 'Erreiche 1 Mio €/s.', emoji: '🏦', cond: { type: 'income', value: 1e6 } },

  { id: 'upgrades10', name: 'Feintuning', desc: 'Kaufe 10 Upgrades in einem Run.', emoji: '🔧', cond: { type: 'upgradesOwned', value: 10 } },

  { id: 'prestige1', name: 'Weltenbummler', desc: 'Expandiere zum ersten Mal global.', emoji: '🌍', cond: { type: 'resets', value: 1 } },
  { id: 'prestige3', name: 'Marken-Botschafter', desc: 'Expandiere 3× global.', emoji: '✈️', cond: { type: 'resets', value: 3 } },
  { id: 'prestige6', name: 'Food-Weltmacht', desc: 'Expandiere 6× global.', emoji: '🗺️', cond: { type: 'resets', value: 6 } },
];
