// Standorte für die Standort-Progression (Phase 4).
// Phase 1 nutzt nur den ersten Eintrag als Kulisse.
export const LOCATIONS = [
  {
    id: 'streetcorner',
    name: 'Straßenecke',
    description: 'Dein erster Foodtruck an der Straßenecke.',
    stations: ['grill'],
  },
];

export function getLocation(index) {
  return LOCATIONS[Math.min(index, LOCATIONS.length - 1)];
}
