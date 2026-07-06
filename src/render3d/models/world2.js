import * as THREE from 'three';
import { box, cylinder, cone, sphere } from './worldBuilder.js';

// Welt 2 "Taco Fiesta" – Emblem (Riesen-Taco) + Stations-Aufbauten.

const TORTILLA = 0xe9c46a;

function tacoEmblem() {
  const emblem = new THREE.Group();
  // Zwei schräge Wände + gerundeter Boden bilden die Taco-Schale (U zur Kamera).
  const shellL = box(0.14, 0.85, 0.95, TORTILLA);
  shellL.position.set(-0.3, 0.05, 0);
  shellL.rotation.z = 0.45;
  emblem.add(shellL);
  const shellR = box(0.14, 0.85, 0.95, TORTILLA);
  shellR.position.set(0.3, 0.05, 0);
  shellR.rotation.z = -0.45;
  emblem.add(shellR);
  const belly = cylinder(0.32, 0.32, 0.95, TORTILLA, 16);
  belly.rotation.x = Math.PI / 2;
  belly.position.y = -0.28;
  emblem.add(belly);
  // Füllung: Fleisch, Salat, Tomate lugen oben heraus
  const fillings = [
    [0x6f4518, -0.18, 0.34],
    [0x6a994e, 0.05, 0.4],
    [0xe63946, 0.22, 0.34],
    [0x6a994e, -0.02, 0.36]
  ];
  for (const [c, x, y] of fillings) {
    const bit = sphere(0.14, c, 8);
    bit.position.set(x, y, 0.2);
    emblem.add(bit);
  }
  return emblem;
}

// Plancha (Taco-Grill): heiße Platte mit Tortillas
function addGriddleProps(station) {
  const plate = box(1.6, 0.18, 0.95, 0x3a3a3a, { roughness: 0.4, metalness: 0.55 });
  plate.position.y = 1.24;
  station.add(plate);
  for (let i = 0; i < 3; i++) {
    const tortilla = cylinder(0.22, 0.22, 0.04, TORTILLA, 14);
    tortilla.position.set(-0.5 + i * 0.5, 1.35, 0.05);
    station.add(tortilla);
  }
  const backsplash = box(1.7, 0.5, 0.08, 0x9c6644);
  backsplash.position.set(0, 1.5, -0.5);
  station.add(backsplash);
}

// Salsa-Bar: bunte Salsa-Schüsseln
function addSalsaProps(station) {
  const board = box(1.9, 0.1, 1.0, 0x8a5a44);
  board.position.y = 1.2;
  station.add(board);
  const salsaColors = [0xd62828, 0x52b788, 0xf4a261];
  salsaColors.forEach((c, i) => {
    const bowl = cylinder(0.26, 0.18, 0.22, 0xf1faee, 14);
    bowl.position.set(-0.6 + i * 0.6, 1.36, 0.05);
    station.add(bowl);
    const salsa = cylinder(0.22, 0.22, 0.06, c, 14);
    salsa.position.set(-0.6 + i * 0.6, 1.46, 0.05);
    station.add(salsa);
  });
}

// Aguas Frescas: bunte Saftspender
function addAguasProps(station) {
  const juiceColors = [0xe63946, 0xf4a261, 0x90be6d];
  juiceColors.forEach((c, i) => {
    const jar = cylinder(0.24, 0.24, 0.7, c, 12, {
      transparent: true,
      opacity: 0.85,
      roughness: 0.25
    });
    jar.position.set(-0.6 + i * 0.6, 1.5, 0);
    station.add(jar);
    const lid = cylinder(0.26, 0.26, 0.08, 0xadb5bd, 12, { metalness: 0.5 });
    lid.position.set(-0.6 + i * 0.6, 1.88, 0);
    station.add(lid);
    const tap = box(0.1, 0.14, 0.14, 0x6c757d);
    tap.position.set(-0.6 + i * 0.6, 1.22, 0.28);
    station.add(tap);
  });
}

// Churros: Fritteuse + Churros im Becher
function addChurrosProps(station) {
  const fryer = box(1.0, 0.5, 0.8, 0xadb5bd, { metalness: 0.5, roughness: 0.35 });
  fryer.position.set(-0.55, 1.4, 0);
  station.add(fryer);
  const oil = box(0.8, 0.06, 0.6, 0xe9b949);
  oil.position.set(-0.55, 1.63, 0);
  station.add(oil);
  const cup = cylinder(0.26, 0.2, 0.5, 0xbc4749, 12);
  cup.position.set(0.6, 1.4, 0.1);
  station.add(cup);
  for (let i = 0; i < 5; i++) {
    const churro = cylinder(0.05, 0.05, 0.55, 0xb5651d, 8);
    const a = (i / 5) * Math.PI * 2;
    churro.position.set(0.6 + Math.cos(a) * 0.1, 1.72, 0.1 + Math.sin(a) * 0.1);
    churro.rotation.z = Math.cos(a) * 0.2;
    churro.rotation.x = Math.sin(a) * 0.2;
    station.add(churro);
  }
}

export const world2Model = {
  emblem: tacoEmblem,
  stationProps: {
    griddle: addGriddleProps,
    salsa: addSalsaProps,
    aguas: addAguasProps,
    churros: addChurrosProps
  }
};
