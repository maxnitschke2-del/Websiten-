// Reine Konfiguration – keine Logik. Jedes Achievement vergleicht eine
// Metrik (Schlüssel aus dem Stats-Snapshot in systems/achievements.js) mit
// einem Schwellenwert. Die Vergleichslogik liegt komplett im System.
export const ACHIEVEMENTS = [
  { id: 'warmup', name: 'Aufgewärmt', desc: 'Bringe eine Station auf Level 2', icon: '🔥', metric: 'maxLevel', threshold: 2 },
  { id: 'expand', name: 'Wachstum', desc: 'Schalte eine zweite Station frei', icon: '🍟', metric: 'stationsUnlocked', threshold: 2 },
  { id: 'first_million', name: 'Erste Million', desc: 'Verdiene insgesamt 1M $', icon: '💵', metric: 'totalEarned', threshold: 1e6 },
  { id: 'billionaire', name: 'Milliardär', desc: 'Verdiene insgesamt 1B $', icon: '💰', metric: 'totalEarned', threshold: 1e9 },
  { id: 'trillionaire', name: 'Billionär', desc: 'Verdiene insgesamt 1T $', icon: '🏦', metric: 'totalEarned', threshold: 1e12 },
  { id: 'generous', name: 'Trinkgeld-Sammler', desc: 'Sammle 25 Trinkgelder ein', icon: '🪙', metric: 'tipsCollected', threshold: 25 },
  { id: 'tip_master', name: 'Trinkgeld-Magnat', desc: 'Sammle 100 Trinkgelder ein', icon: '🤑', metric: 'tipsCollected', threshold: 100 },
  { id: 'maxed_station', name: 'Ausgereizt', desc: 'Bringe eine Station auf Level 50', icon: '⭐', metric: 'maxLevel', threshold: 50 },
  { id: 'new_kitchen', name: 'Neue Küche', desc: 'Schalte eine zweite Welt frei', icon: '🌮', metric: 'worldsUnlocked', threshold: 2 },
  { id: 'empire', name: 'Foodtruck-Imperium', desc: 'Schalte alle 4 Welten frei', icon: '🌍', metric: 'worldsUnlocked', threshold: 4 },
  { id: 'perfectionist', name: 'Perfektionist', desc: 'Baue eine ganze Welt komplett aus', icon: '🏆', metric: 'worldsMaxed', threshold: 1 }
];
