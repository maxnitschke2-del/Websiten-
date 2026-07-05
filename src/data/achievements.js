// Erfolge. check() bekommt einen Kontext-Schnappschuss vom
// Achievement-System (systems/achievements.js).
export const ACHIEVEMENTS = [
  { id: 'first-tip', emoji: '🪙', name: 'Erstes Trinkgeld', desc: 'Sammle dein erstes Trinkgeld', check: (c) => c.tips >= 1 },
  { id: 'tip-25', emoji: '💰', name: 'Stammkundschaft', desc: 'Sammle 25 Trinkgelder', check: (c) => c.tips >= 25 },
  { id: 'tip-100', emoji: '🤑', name: 'Trinkgeld-Magnet', desc: 'Sammle 100 Trinkgelder', check: (c) => c.tips >= 100 },
  { id: 'second-station', emoji: '🍟', name: 'Expansion', desc: 'Schalte eine zweite Station frei', check: (c) => c.unlockedStations >= 2 },
  { id: 'all-stations', emoji: '👨‍🍳', name: 'Volles Haus', desc: 'Alle Stationen aktiv', check: (c) => c.unlockedStations >= c.totalStations },
  { id: 'first-max', emoji: '📈', name: 'Ausgereizt', desc: 'Bringe eine Station ans Level-Cap', check: (c) => c.stationsAtCap >= 1 },
  { id: 'rich-10k', emoji: '💵', name: 'Gut im Geschäft', desc: 'Besitze $10K', check: (c) => c.money >= 10_000 },
  { id: 'millionaire', emoji: '💎', name: 'Millionär', desc: 'Besitze $1M', check: (c) => c.money >= 1_000_000 },
  { id: 'city-2', emoji: '🌳', name: 'Neues Pflaster', desc: 'Zieh in den Stadtpark um', check: (c) => c.locationIndex >= 1 },
  { id: 'city-4', emoji: '🏖️', name: 'Strandläufer', desc: 'Erreiche die Strandpromenade', check: (c) => c.locationIndex >= 3 },
  { id: 'master', emoji: '👑', name: 'Foodtruck-Imperium', desc: 'Meistere alle Städte', check: (c) => c.mastered },
  { id: 'world-2', emoji: '🌸', name: 'Weltenbummler', desc: 'Schalte eine zweite Welt frei', check: (c) => c.worldsUnlocked >= 2 },
  { id: 'all-worlds', emoji: '🌍', name: 'Weltreisender', desc: 'Schalte alle Welten frei', check: (c) => c.worldsUnlocked >= 4 },
];
