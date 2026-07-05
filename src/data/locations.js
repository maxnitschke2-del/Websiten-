// Standorte für die Standort-Progression: Sind alle Stationen am
// Level-Cap, kann in die nächste Stadt umgezogen werden. Jede Stadt
// bringt neue Optik (theme), größere Kapazität (maxCustomers) und
// höhere Einkommen/Kosten-Multiplikatoren.
export const LOCATIONS = [
  {
    id: 'streetcorner',
    name: 'Straßenecke',
    levelCap: 20,
    incomeMult: 1,
    costMult: 1,
    maxCustomers: 3,
    theme: {
      skyTop: '#8ed3f5',
      skyBottom: '#cdeefb',
      ground: '#b9b2a6',
      groundDark: '#a49c8f',
      building: '#9db4c4',
    },
  },
  {
    id: 'park',
    name: 'Stadtpark',
    levelCap: 25,
    incomeMult: 6,
    costMult: 5,
    maxCustomers: 4,
    theme: {
      skyTop: '#a8def0',
      skyBottom: '#dff3e4',
      ground: '#8fbf6f',
      groundDark: '#7aa95e',
      building: '#6f9e5a',
    },
  },
  {
    id: 'downtown',
    name: 'Innenstadt',
    levelCap: 28,
    incomeMult: 40,
    costMult: 28,
    maxCustomers: 5,
    theme: {
      skyTop: '#f7b267',
      skyBottom: '#f9d5a7',
      ground: '#8d8d99',
      groundDark: '#7b7b88',
      building: '#5a6178',
    },
  },
  {
    id: 'beach',
    name: 'Strandpromenade',
    levelCap: 35,
    incomeMult: 320,
    costMult: 160,
    maxCustomers: 6,
    theme: {
      skyTop: '#6ec6ff',
      skyBottom: '#e0f7ff',
      ground: '#e8d59f',
      groundDark: '#d8c58c',
      building: '#8fd0c0',
    },
  },
];

export function getLocation(index) {
  return LOCATIONS[Math.min(index, LOCATIONS.length - 1)];
}
