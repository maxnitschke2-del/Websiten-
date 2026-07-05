// Welten-Konfiguration: jede Welt hat 4 eigene Foodtrucks (= Stationen
// der Wirtschaft), ein Signature-Gericht, eigene Kunden-Farben und ein
// eigenes Farbschema für Trucks/Umgebung. Die Standort-Progression
// (data/locations.js) läuft in jeder Welt separat durch.
//
// Freischaltung der nächsten Welt: hohe Kostenkurve, bezahlt mit dem
// Geld der gerade aktiven Welt (systems/worlds.js).
export const TOTAL_WORLDS = 4; // Endausbau; Welt 3+4 folgen in Phase 4

export const WORLDS = [
  {
    id: 'sonnenbucht',
    name: 'Sonnenbucht',
    tagline: 'Mediterrane Hafenstadt',
    signature: { dish: 'Classic Burger', emoji: '🍔' },
    unlockCost: 0,
    // Umgebungs-Akzente; Himmel/Boden/Gebäude-Basis kommen weiter vom
    // Standort-Theme (data/locations.js), `building` kann übersteuern.
    env: {
      road: '#5b5b66',
      roadLine: '#f4efe4',
      roof: '#c96f4a',
      foliage: '#7da55f',
      foliageDark: '#4f7f52',
      trunk: '#8a5a2b',
      cloud: '#ffffff',
    },
    customers: {
      shirts: ['#4a90d9', '#7a56c2', '#3aa76d', '#d95f4a', '#c2a13a', '#d9639b'],
    },
    stations: [
      {
        id: 'grill',
        name: 'Burger-Grill',
        emoji: '🍔',
        sign: 'BURGER',
        baseIncome: 1,
        baseCost: 10,
        costGrowth: 1.15,
        unlockCost: 0,
        truck: {
          body: '#e2574c', bodyDark: '#c04237', cabin: '#f4ede1',
          awning: '#e2574c', awningAlt: '#fdf6e9', counter: '#8a5a2b',
        },
      },
      {
        id: 'fries',
        name: 'Pommes-Station',
        emoji: '🍟',
        sign: 'POMMES',
        baseIncome: 4,
        baseCost: 60,
        costGrowth: 1.15,
        unlockCost: 150,
        truck: {
          body: '#f2a93b', bodyDark: '#d68f26', cabin: '#fdf6e9',
          awning: '#f2a93b', awningAlt: '#fdf6e9', counter: '#8a5a2b',
        },
      },
      {
        id: 'drinks',
        name: 'Getränke-Stand',
        emoji: '🥤',
        sign: 'DRINKS',
        baseIncome: 12,
        baseCost: 200,
        costGrowth: 1.15,
        unlockCost: 600,
        truck: {
          body: '#3f8fd2', bodyDark: '#2f74b0', cabin: '#eef4f8',
          awning: '#3f8fd2', awningAlt: '#fdf6e9', counter: '#8a5a2b',
        },
      },
      {
        id: 'ice',
        name: 'Eis-Truck',
        emoji: '🍦',
        sign: 'EIS',
        baseIncome: 32,
        baseCost: 550,
        costGrowth: 1.15,
        unlockCost: 2400,
        truck: {
          body: '#8fd0c0', bodyDark: '#72b5a4', cabin: '#fdf6e9',
          awning: '#e78fb3', awningAlt: '#fdf6e9', counter: '#8a5a2b',
        },
      },
    ],
  },
  {
    id: 'kirschbluete',
    name: 'Kirschblüten-Hafen',
    tagline: 'Hanami am Wasser',
    signature: { dish: 'Shoyu-Ramen', emoji: '🍜' },
    unlockCost: 25_000_000,
    env: {
      road: '#4d4a55',
      roadLine: '#efe9dd',
      roof: '#7d5a6e',
      foliage: '#f0a8c4',
      foliageDark: '#d97fa8',
      trunk: '#6e4a3a',
      cloud: '#ffffff',
      building: '#a89aa3',
    },
    customers: {
      shirts: ['#c94f6d', '#5a7d9a', '#8d6bb8', '#3aa78b', '#e0a04f', '#7a8f5a'],
    },
    stations: [
      {
        id: 'sushi',
        name: 'Sushi-Truck',
        emoji: '🍣',
        sign: 'SUSHI',
        baseIncome: 55,
        baseCost: 500,
        costGrowth: 1.15,
        unlockCost: 0,
        truck: {
          body: '#3f6fa8', bodyDark: '#325a8a', cabin: '#eef2f6',
          awning: '#3f6fa8', awningAlt: '#f6f2ea', counter: '#7a5a41',
        },
      },
      {
        id: 'ramen',
        name: 'Ramen-Küche',
        emoji: '🍜',
        sign: 'RAMEN',
        baseIncome: 220,
        baseCost: 3000,
        costGrowth: 1.15,
        unlockCost: 8000,
        truck: {
          body: '#d94f3d', bodyDark: '#b83e2f', cabin: '#f6efe2',
          awning: '#d94f3d', awningAlt: '#f6efe2', counter: '#7a5a41',
        },
      },
      {
        id: 'onigiri',
        name: 'Onigiri-Stand',
        emoji: '🍙',
        sign: 'ONIGIRI',
        baseIncome: 660,
        baseCost: 10_000,
        costGrowth: 1.15,
        unlockCost: 32_000,
        truck: {
          body: '#ece6d8', bodyDark: '#d5cdb9', cabin: '#f6f2ea',
          awning: '#3d3d46', awningAlt: '#f6f2ea', counter: '#7a5a41',
        },
      },
      {
        id: 'matcha',
        name: 'Matcha-Bar',
        emoji: '🍵',
        sign: 'MATCHA',
        baseIncome: 1750,
        baseCost: 28_000,
        costGrowth: 1.15,
        unlockCost: 130_000,
        truck: {
          body: '#6f9940', bodyDark: '#5b7f33', cabin: '#f2f4ec',
          awning: '#6f9940', awningAlt: '#f6f2ea', counter: '#7a5a41',
        },
      },
    ],
  },
];

export function getWorld(index) {
  return WORLDS[Math.min(index, WORLDS.length - 1)];
}
