// Reine Konfiguration – keine Logik.
//
// unlockCost nach Balancing-Regel: Welt komplett maxen ≈ 30-50% der
// Freischalt-Kosten der NÄCHSTEN Welt. Mit 6 Stationen und Level-Cap 100
// kostet Welt 1 komplett maxen ~1.78e12 (Simulation) → Welt 2 = 4.4e12
// ergibt 40%. Die weiteren Welten skalieren im ×1600-Raster (2.5×M1×1600^n),
// sodass das 40%-Verhältnis über alle Welten erhalten bleibt.
export const WORLDS = [
  {
    id: 'w1',
    index: 1,
    name: 'Burger Boulevard',
    signature: 'Classic Cheeseburger',
    unlockCost: 0,
    managerCost: 1e8,
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
      accent: 0xff7043,
      workerColor: 0xd64545,
      customerColors: [0x5c7aea, 0xe4572e, 0x76b041, 0xf7b32b, 0x9d4edd, 0x3aafa9]
    }
  },
  {
    id: 'w2',
    index: 2,
    name: 'Taco Fiesta',
    signature: 'Street Taco Deluxe',
    unlockCost: 4.4e12,
    managerCost: 1.6e11,
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
      accent: 0xf4a261,
      workerColor: 0x2a6f97,
      customerColors: [0xe76f51, 0x2a9d8f, 0xe9c46a, 0x8ab17d, 0xbc4749, 0x6d597a]
    }
  },
  {
    id: 'w3',
    index: 3,
    name: 'Sushi Harbor',
    signature: 'Dragon Roll',
    unlockCost: 7.04e15,
    managerCost: 2.56e14,
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
      accent: 0x457b9d,
      workerColor: 0x1d3557,
      customerColors: [0x457b9d, 0xe63946, 0x2b9348, 0xf3722c, 0x7209b7, 0x118ab2]
    }
  },
  {
    id: 'w4',
    index: 4,
    name: 'Sweet Dreams',
    signature: 'Rainbow Sundae',
    unlockCost: 1.1264e19,
    managerCost: 4.096e17,
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
      accent: 0xf48fb1,
      workerColor: 0xc4548e,
      customerColors: [0xf48fb1, 0x9575cd, 0x4fc3f7, 0xaed581, 0xffb74d, 0xba68c8]
    }
  }
];
