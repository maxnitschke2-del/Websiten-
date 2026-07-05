// Welten-Konfiguration für die 3D-Schicht. Phase 1: nur Welt 1.
// Jede Welt bekommt eigenen Truck-Stil, Signature-Gericht, Freischalt-
// Kosten und Farbschema; weitere Welten folgen in Phase 3/4.
// Die Wirtschafts-Wahrheit (Stationen, Level, Kosten) bleibt in
// data/stations.js + data/locations.js — hier steht nur Optik/Meta.
export const WORLDS = [
  {
    id: 'sonnenbucht',
    name: 'Sonnenbucht',
    tagline: 'Mediterrane Hafenstadt',
    signature: { dish: 'Classic Burger', emoji: '🍔' },
    unlockCost: 0,
    // Umgebungs-Farben, die nicht vom Standort (data/locations.js)
    // kommen: Straße, Dächer, Bäume, Wolken.
    env: {
      road: '#5b5b66',
      roadLine: '#f4efe4',
      roof: '#c96f4a',
      foliage: '#7da55f',
      foliageDark: '#4f7f52',
      trunk: '#8a5a2b',
      cloud: '#ffffff',
    },
    // Farbschema je Foodtruck, gekeyt auf die Stations-IDs der
    // bestehenden Wirtschaft.
    trucks: {
      grill: {
        body: '#e2574c',
        bodyDark: '#c04237',
        cabin: '#f4ede1',
        awning: '#e2574c',
        awningAlt: '#fdf6e9',
        counter: '#8a5a2b',
      },
      fries: {
        body: '#f2a93b',
        bodyDark: '#d68f26',
        cabin: '#fdf6e9',
        awning: '#f2a93b',
        awningAlt: '#fdf6e9',
        counter: '#8a5a2b',
      },
      drinks: {
        body: '#3f8fd2',
        bodyDark: '#2f74b0',
        cabin: '#eef4f8',
        awning: '#3f8fd2',
        awningAlt: '#fdf6e9',
        counter: '#8a5a2b',
      },
    },
  },
];

export function getWorld(index) {
  return WORLDS[Math.min(index, WORLDS.length - 1)];
}
