// Reine Konfiguration – keine Logik.
// Welt-Themen sind Platzhalter, bis die finale Ausfüll-Liste vorliegt.
//
// unlockCost nach Balancing-Regel: Welt komplett maxen ≈ 30-50% der
// Freischalt-Kosten der NÄCHSTEN Welt. Welt 1 maxen kostet ~100M
// (Simulation, Phase 2) → Welt 2 = 250M ergibt 39.9%.
// Welt 3/4 sind Schätzwerte und werden in Phase 5/6 gegen die dann
// definierten Stationsdaten gegengerechnet.
export const WORLDS = [
  {
    id: 'w1',
    index: 1,
    name: 'Burger Boulevard',
    signature: 'Classic Cheeseburger',
    unlockCost: 0,
    palette: {
      sky: 0x9fd8ef,
      ground: 0xd7b98e,
      street: 0x5c6b73,
      sidewalk: 0xb8a88a,
      truck: 0xe94f37,
      truckRoof: 0xf6f7eb,
      awning: 0xffd166,
      counter: 0x8a5a44,
      counterTop: 0xf4e8d1,
      accent: 0xff7043
    }
  },
  {
    id: 'w2',
    index: 2,
    name: 'Taco Fiesta',
    signature: 'Street Taco Deluxe',
    unlockCost: 250e6,
    palette: {
      sky: 0xffe0b2,
      ground: 0xe0b97d,
      street: 0x6d5b4b,
      sidewalk: 0xc9a877,
      truck: 0x2a9d8f,
      truckRoof: 0xfff3e0,
      awning: 0xe76f51,
      counter: 0x7a4f2a,
      counterTop: 0xfdf0d5,
      accent: 0xf4a261
    }
  },
  {
    id: 'w3',
    index: 3,
    name: 'Sushi Harbor',
    signature: 'Dragon Roll',
    unlockCost: 400e9,
    palette: {
      sky: 0xb3e5fc,
      ground: 0x90a4ae,
      street: 0x455a64,
      sidewalk: 0xa7b6bd,
      truck: 0x1d3557,
      truckRoof: 0xf1faee,
      awning: 0xe63946,
      counter: 0x5c4033,
      counterTop: 0xf1faee,
      accent: 0x457b9d
    }
  },
  {
    id: 'w4',
    index: 4,
    name: 'Sweet Dreams',
    signature: 'Rainbow Sundae',
    unlockCost: 640e12,
    palette: {
      sky: 0xf8bbd0,
      ground: 0xf3d9e5,
      street: 0x8e7cc3,
      sidewalk: 0xd9c8ea,
      truck: 0xff8fab,
      truckRoof: 0xfff0f6,
      awning: 0xb388eb,
      counter: 0x9d6b53,
      counterTop: 0xfff0f6,
      accent: 0xf48fb1
    }
  }
];
