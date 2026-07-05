// Welten-Konfiguration: jede Welt hat 4 eigene Foodtrucks (= Stationen
// der Wirtschaft), ein Signature-Gericht, eigene Kunden-Farben und ein
// eigenes Farbschema für Trucks/Umgebung. Die Standort-Progression
// (data/locations.js) läuft in jeder Welt separat durch.
//
// Freischaltung der nächsten Welt: hohe Kostenkurve, bezahlt mit dem
// Geld der gerade aktiven Welt (systems/worlds.js).
export const TOTAL_WORLDS = 4;

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
        baseCost: 12,
        costGrowth: 1.8,
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
        baseIncome: 5,
        baseCost: 80,
        costGrowth: 1.66,
        unlockCost: 300,
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
        baseIncome: 18,
        baseCost: 350,
        costGrowth: 1.56,
        unlockCost: 3000,
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
        baseIncome: 60,
        baseCost: 1200,
        costGrowth: 1.48,
        unlockCost: 25_000,
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
        baseCost: 650,
        costGrowth: 1.8,
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
        baseIncome: 275,
        baseCost: 4400,
        costGrowth: 1.66,
        unlockCost: 16_500,
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
        baseIncome: 990,
        baseCost: 19_000,
        costGrowth: 1.56,
        unlockCost: 165_000,
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
        baseIncome: 3300,
        baseCost: 66_000,
        costGrowth: 1.48,
        unlockCost: 1_400_000,
        truck: {
          body: '#6f9940', bodyDark: '#5b7f33', cabin: '#f2f4ec',
          awning: '#6f9940', awningAlt: '#f6f2ea', counter: '#7a5a41',
        },
      },
    ],
  },
  {
    id: 'mesa',
    name: 'Rote Mesa',
    tagline: 'Wüstenstadt in den Canyons',
    signature: { dish: 'Street-Tacos', emoji: '🌮' },
    unlockCost: 1_400_000_000,
    env: {
      road: '#6b5a4a',
      roadLine: '#f0e6d2',
      roof: '#a8503c',
      foliage: '#7fa06a',
      foliageDark: '#5d8050',
      trunk: '#7a5a3a',
      cloud: '#fdf6e9',
      building: '#c98d5f',
      cactus: true, // Wüsten-Vegetation statt Laubbäumen
    },
    customers: {
      shirts: ['#c2563a', '#8a6bb8', '#3a8a7a', '#d9a441', '#a8503c', '#5d8050'],
    },
    stations: [
      {
        id: 'taco',
        name: 'Taco-Truck',
        emoji: '🌮',
        sign: 'TACOS',
        baseIncome: 3000,
        baseCost: 36_000,
        costGrowth: 1.8,
        unlockCost: 0,
        truck: {
          body: '#d97f3e', bodyDark: '#b96628', cabin: '#f4e8d4',
          awning: '#d97f3e', awningAlt: '#f4e8d4', counter: '#7a5a3a',
        },
      },
      {
        id: 'burrito',
        name: 'Burrito-Grill',
        emoji: '🌯',
        sign: 'BURRITO',
        baseIncome: 15_000,
        baseCost: 240_000,
        costGrowth: 1.66,
        unlockCost: 900_000,
        truck: {
          body: '#b34a3a', bodyDark: '#963a2c', cabin: '#f4e8d4',
          awning: '#b34a3a', awningAlt: '#f4e8d4', counter: '#7a5a3a',
        },
      },
      {
        id: 'elote',
        name: 'Elote-Stand',
        emoji: '🌽',
        sign: 'ELOTE',
        baseIncome: 54_500,
        baseCost: 1_050_000,
        costGrowth: 1.56,
        unlockCost: 9_000_000,
        truck: {
          body: '#d9b23e', bodyDark: '#bd9829', cabin: '#f4e8d4',
          awning: '#5d8050', awningAlt: '#f4e8d4', counter: '#7a5a3a',
        },
      },
      {
        id: 'agua',
        name: 'Agua-Fresca-Bar',
        emoji: '🍹',
        sign: 'AGUA',
        baseIncome: 180_000,
        baseCost: 3_600_000,
        costGrowth: 1.48,
        unlockCost: 75_000_000,
        truck: {
          body: '#4a9c8c', bodyDark: '#3a8274', cabin: '#f4e8d4',
          awning: '#4a9c8c', awningAlt: '#f4e8d4', counter: '#7a5a3a',
        },
      },
    ],
  },
  {
    id: 'fjordlicht',
    name: 'Fjordlicht',
    tagline: 'Nordisches Hafendorf',
    signature: { dish: 'Lachs-Brötchen', emoji: '🐟' },
    unlockCost: 75_000_000_000,
    env: {
      road: '#4a4f58',
      roadLine: '#e8ecef',
      roof: '#3e4a56',
      foliage: '#3f6b4f',
      foliageDark: '#2e523c',
      trunk: '#5a4632',
      cloud: '#f0f4f8',
      building: '#994a3f',
      coneChance: 0.8, // überwiegend Nadelbäume
    },
    customers: {
      shirts: ['#3e6e8e', '#8a4a3f', '#4a6b52', '#c2803a', '#5a5f6b', '#9c7a9a'],
    },
    stations: [
      {
        id: 'fisch',
        name: 'Fisch-Kutter',
        emoji: '🐟',
        sign: 'FISCH',
        baseIncome: 166_000,
        baseCost: 2_000_000,
        costGrowth: 1.8,
        unlockCost: 0,
        truck: {
          body: '#3e6e8e', bodyDark: '#325a75', cabin: '#e8ecef',
          awning: '#3e6e8e', awningAlt: '#eef2f4', counter: '#5a4632',
        },
      },
      {
        id: 'waffeln',
        name: 'Waffel-Hütte',
        emoji: '🧇',
        sign: 'WAFFELN',
        baseIncome: 830_000,
        baseCost: 13_000_000,
        costGrowth: 1.66,
        unlockCost: 50_000_000,
        truck: {
          body: '#d9a441', bodyDark: '#bd8a2c', cabin: '#f4ede1',
          awning: '#d9a441', awningAlt: '#f4ede1', counter: '#5a4632',
        },
      },
      {
        id: 'eintopf',
        name: 'Eintopf-Kombüse',
        emoji: '🍲',
        sign: 'EINTOPF',
        baseIncome: 3_000_000,
        baseCost: 58_000_000,
        costGrowth: 1.56,
        unlockCost: 500_000_000,
        truck: {
          body: '#5d7a52', bodyDark: '#4a6341', cabin: '#eef2ec',
          awning: '#5d7a52', awningAlt: '#eef2ec', counter: '#5a4632',
        },
      },
      {
        id: 'kakao',
        name: 'Kakao-Bude',
        emoji: '☕',
        sign: 'KAKAO',
        baseIncome: 10_000_000,
        baseCost: 200_000_000,
        costGrowth: 1.48,
        unlockCost: 4_100_000_000,
        truck: {
          body: '#8a5a4a', bodyDark: '#71483a', cabin: '#f4ede1',
          awning: '#8a5a4a', awningAlt: '#f4ede1', counter: '#5a4632',
        },
      },
    ],
  },
];

export function getWorld(index) {
  return WORLDS[Math.min(index, WORLDS.length - 1)];
}
