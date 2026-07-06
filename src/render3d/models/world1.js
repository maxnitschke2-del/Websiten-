import * as THREE from 'three';
import { box, cylinder, cone, sphere } from './worldBuilder.js';

// Welt 1 "Burger Boulevard" – Emblem (Riesen-Burger) + Stations-Aufbauten.
// Aufbau/Boden/Truck-Basis kommen generisch aus worldBuilder.js.

function burgerEmblem() {
  const emblem = new THREE.Group();
  const bunBottom = cylinder(0.55, 0.6, 0.25, 0xe9c46a, 20);
  emblem.add(bunBottom);
  const patty = cylinder(0.62, 0.62, 0.18, 0x6f4518, 20);
  patty.position.y = 0.2;
  emblem.add(patty);
  const cheese = box(1.05, 0.06, 1.05, 0xffb703);
  cheese.position.y = 0.32;
  cheese.rotation.y = Math.PI / 4;
  emblem.add(cheese);
  const bunTop = sphere(0.62, 0xe9c46a, 16);
  bunTop.scale.y = 0.62;
  bunTop.position.y = 0.5;
  emblem.add(bunTop);
  return emblem;
}

function addGrillProps(station) {
  const grill = box(1.5, 0.35, 0.9, 0x343a40, { roughness: 0.4, metalness: 0.5 });
  grill.position.y = 1.32;
  station.add(grill);
  for (let i = 0; i < 3; i++) {
    const patty = cylinder(0.18, 0.18, 0.09, 0x6f4518, 12);
    patty.position.set(-0.45 + i * 0.45, 1.55, 0);
    station.add(patty);
  }
  const hood = box(1.7, 0.12, 1.0, 0x6c757d, { metalness: 0.6, roughness: 0.35 });
  hood.position.y = 2.3;
  station.add(hood);
  for (const x of [-0.75, 0.75]) {
    const pole = cylinder(0.05, 0.05, 1.1, 0x495057, 8);
    pole.position.set(x, 1.75, -0.35);
    station.add(pole);
  }
}

function addFriesProps(station) {
  const fryer = box(1.0, 0.5, 0.8, 0xadb5bd, { metalness: 0.5, roughness: 0.35 });
  fryer.position.set(-0.55, 1.4, 0);
  station.add(fryer);
  const cup = cylinder(0.28, 0.2, 0.5, 0xe63946, 10);
  cup.position.set(0.6, 1.4, 0.1);
  station.add(cup);
  for (let i = 0; i < 6; i++) {
    const fry = box(0.07, 0.5, 0.07, 0xffd166);
    const a = (i / 6) * Math.PI * 2;
    fry.position.set(0.6 + Math.cos(a) * 0.11, 1.72, 0.1 + Math.sin(a) * 0.11);
    fry.rotation.z = Math.cos(a) * 0.22;
    fry.rotation.x = Math.sin(a) * 0.22;
    station.add(fry);
  }
}

function addDrinkProps(station) {
  const dispenser = box(1.1, 0.9, 0.7, 0x1d3557, { roughness: 0.5 });
  dispenser.position.set(-0.5, 1.6, 0);
  station.add(dispenser);
  const tap = box(0.14, 0.2, 0.3, 0xadb5bd, { metalness: 0.6 });
  tap.position.set(-0.5, 1.35, 0.45);
  station.add(tap);
  const cupColors = [0xe63946, 0xf4a261, 0x2a9d8f];
  cupColors.forEach((c, i) => {
    const cup = cylinder(0.14, 0.11, 0.34, c, 10);
    cup.position.set(0.35 + i * 0.36, 1.31, 0.15);
    station.add(cup);
    const straw = cylinder(0.025, 0.025, 0.3, 0xffffff, 6);
    straw.position.set(0.35 + i * 0.36, 1.55, 0.15);
    straw.rotation.z = 0.25;
    station.add(straw);
  });
}

function addIceCreamProps(station) {
  const machine = box(0.9, 1.0, 0.7, 0xf1faee, { roughness: 0.55 });
  machine.position.set(-0.6, 1.64, 0);
  station.add(machine);
  const nozzle = box(0.2, 0.25, 0.2, 0x6c757d, { metalness: 0.5 });
  nozzle.position.set(-0.6, 1.1, 0.35);
  station.add(nozzle);
  const scoopColors = [0xf48fb1, 0xfff3b0, 0x8ecae6];
  scoopColors.forEach((c, i) => {
    const iceCone = cone(0.16, 0.42, 0xe9c46a, 10);
    iceCone.rotation.x = Math.PI;
    iceCone.position.set(0.3 + i * 0.42, 1.35, 0.12);
    station.add(iceCone);
    const scoop = sphere(0.17, c, 10);
    scoop.position.set(0.3 + i * 0.42, 1.62, 0.12);
    station.add(scoop);
  });
}

function addHotdogProps(station) {
  const griddle = box(1.6, 0.14, 0.85, 0x343a40, { metalness: 0.5, roughness: 0.4 });
  griddle.position.y = 1.22;
  station.add(griddle);
  for (let i = 0; i < 3; i++) {
    const bun = box(0.5, 0.16, 0.24, 0xe9c46a);
    bun.position.set(-0.5 + i * 0.5, 1.35, 0.05);
    station.add(bun);
    const sausage = cylinder(0.07, 0.07, 0.5, 0xb5462f, 8);
    sausage.rotation.z = Math.PI / 2;
    sausage.position.set(-0.5 + i * 0.5, 1.45, 0.05);
    station.add(sausage);
  }
}

function addShakeProps(station) {
  const blender = box(0.7, 0.7, 0.6, 0xadb5bd, { metalness: 0.4, roughness: 0.4 });
  blender.position.set(-0.6, 1.45, 0);
  station.add(blender);
  const shakeColors = [0xffb3c6, 0xd4a373, 0xcdb4db];
  shakeColors.forEach((c, i) => {
    const cup = cylinder(0.15, 0.12, 0.4, c, 12);
    cup.position.set(0.25 + i * 0.34, 1.32, 0.12);
    station.add(cup);
    const cream = sphere(0.16, 0xfff8f0, 10);
    cream.scale.y = 0.65;
    cream.position.set(0.25 + i * 0.34, 1.54, 0.12);
    station.add(cream);
    const straw = cylinder(0.022, 0.022, 0.3, 0xff5d8f, 6);
    straw.position.set(0.29 + i * 0.34, 1.62, 0.12);
    straw.rotation.z = 0.22;
    station.add(straw);
  });
}

export const world1Model = {
  emblem: burgerEmblem,
  stationProps: {
    grill: addGrillProps,
    fries: addFriesProps,
    drinks: addDrinkProps,
    hotdog: addHotdogProps,
    icecream: addIceCreamProps,
    shake: addShakeProps
  }
};
