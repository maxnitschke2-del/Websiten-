// Reine Config – KEINE Logik. Städte der Welt-Expansion.
// Jede "Globale Expansion" (Prestige) erobert die nächste Stadt.
// bonus: permanenter thematischer Bonus, solange die Stadt erobert ist.

export const CITIES = [
  { id: 'berlin', name: 'Berlin', flag: '🇩🇪', accent: '#ff8a3d', bonus: null, bonusDesc: 'Heimatbasis – hier fing alles an' },
  { id: 'wien', name: 'Wien', flag: '🇦🇹', accent: '#e5533d', bonus: { type: 'genMult', target: 'hotdog', value: 2 }, bonusDesc: 'Würstelstand-Kultur: Hotdog-Stände ×2' },
  { id: 'amsterdam', name: 'Amsterdam', flag: '🇳🇱', accent: '#f28c28', bonus: { type: 'genMult', target: 'fries', value: 2 }, bonusDesc: 'Frituren-Tradition: Pommes-Buden ×2' },
  { id: 'paris', name: 'Paris', flag: '🇫🇷', accent: '#5a7bd8', bonus: { type: 'globalMult', value: 1.1 }, bonusDesc: 'Haute Cuisine: +10% auf alles' },
  { id: 'rom', name: 'Rom', flag: '🇮🇹', accent: '#3dae5b', bonus: { type: 'genMult', target: 'pizza', value: 2 }, bonusDesc: 'Pizza-Heimat: Pizza-Trucks ×2' },
  { id: 'barcelona', name: 'Barcelona', flag: '🇪🇸', accent: '#d84b8a', bonus: { type: 'clickMult', value: 2 }, bonusDesc: 'Tapas-Flair: Klick-Wert ×2' },
  { id: 'london', name: 'London', flag: '🇬🇧', accent: '#7a5ad8', bonus: { type: 'globalMult', value: 1.1 }, bonusDesc: 'Food-Market-Szene: +10% auf alles' },
  { id: 'newyork', name: 'New York', flag: '🇺🇸', accent: '#3d8fd8', bonus: { type: 'genMult', target: 'burger', value: 2 }, bonusDesc: 'Burger-Hauptstadt: Burger-Trucks ×2' },
  { id: 'mexiko', name: 'Mexiko-Stadt', flag: '🇲🇽', accent: '#2fae74', bonus: { type: 'genMult', target: 'taco', value: 2 }, bonusDesc: 'Taco-Heimat: Taco-Trucks ×2' },
  { id: 'seoul', name: 'Seoul', flag: '🇰🇷', accent: '#d8563d', bonus: { type: 'genMult', target: 'ramen', value: 2 }, bonusDesc: 'Street-Food-Mekka: Ramen-Trucks ×2' },
  { id: 'tokio', name: 'Tokio', flag: '🇯🇵', accent: '#e0447a', bonus: { type: 'genMult', target: 'sushi', value: 2 }, bonusDesc: 'Sushi-Perfektion: Sushi-Trucks ×2' },
  { id: 'rio', name: 'Rio de Janeiro', flag: '🇧🇷', accent: '#2fb89a', bonus: { type: 'globalMult', value: 1.2 }, bonusDesc: 'Karnevals-Stimmung: +20% auf alles' },
];
