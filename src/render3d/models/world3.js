import * as THREE from 'three';
import { box, cylinder, cone, sphere, mesh } from './worldBuilder.js';

// Welt 3 "Sushi Harbor" – Emblem (Nigiri) + Stations-Aufbauten.

const RICE = 0xf7f3e8;
const NORI = 0x2f3e2f;
const SALMON = 0xfa8072;

function nigiriEmblem() {
  const g = new THREE.Group();
  const rice = sphere(0.5, RICE, 14);
  rice.scale.set(1.15, 0.6, 0.78);
  rice.position.y = -0.05;
  g.add(rice);
  const salmon = box(1.05, 0.14, 0.62, SALMON);
  salmon.position.y = 0.28;
  g.add(salmon);
  const nori = box(0.22, 0.5, 0.66, NORI);
  nori.position.y = 0.05;
  g.add(nori);
  return g;
}

function makiPiece(x, z, station) {
  const rice = cylinder(0.18, 0.18, 0.26, RICE, 14);
  rice.position.set(x, 1.36, z);
  station.add(rice);
  const ring = mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 16), NORI);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, 1.36, z);
  station.add(ring);
  const center = cylinder(0.08, 0.08, 0.28, SALMON, 10);
  center.position.set(x, 1.37, z);
  station.add(center);
}

// Maki-Rollstation: Bambusmatte mit Maki-Stücken
function addRollsProps(station) {
  const matBoard = box(1.7, 0.06, 0.9, 0xcdb487);
  matBoard.position.y = 1.2;
  station.add(matBoard);
  for (let i = 0; i < 4; i++) makiPiece(-0.6 + i * 0.4, 0.05, station);
}

// Nigiri-Theke: Reisbällchen mit Fischauflage
function addNigiriProps(station) {
  const board = box(1.8, 0.08, 0.95, 0x3a2c22);
  board.position.y = 1.2;
  station.add(board);
  const toppings = [0xfa8072, 0xff9e6d, 0xf7c59f];
  for (let i = 0; i < 3; i++) {
    const rice = sphere(0.22, RICE, 12);
    rice.scale.set(1.2, 0.6, 0.8);
    rice.position.set(-0.55 + i * 0.55, 1.3, 0.05);
    station.add(rice);
    const fish = box(0.42, 0.08, 0.28, toppings[i]);
    fish.position.set(-0.55 + i * 0.55, 1.4, 0.05);
    station.add(fish);
  }
}

// Grüntee-Bar: Teekanne + Tassen
function addTeaProps(station) {
  const pot = sphere(0.35, 0x40916c, 12);
  pot.scale.y = 0.8;
  pot.position.set(-0.5, 1.4, 0);
  station.add(pot);
  const lid = cylinder(0.14, 0.16, 0.1, 0x2d6a4f, 10);
  lid.position.set(-0.5, 1.62, 0);
  station.add(lid);
  const spout = cylinder(0.05, 0.08, 0.3, 0x40916c, 8);
  spout.rotation.z = -0.9;
  spout.position.set(-0.16, 1.42, 0.1);
  station.add(spout);
  for (let i = 0; i < 3; i++) {
    const cup = cylinder(0.12, 0.1, 0.16, 0xf1faee, 10);
    cup.position.set(0.3 + i * 0.32, 1.26, 0.12);
    station.add(cup);
    const tea = cylinder(0.1, 0.1, 0.05, 0x74c69d, 10);
    tea.position.set(0.3 + i * 0.32, 1.35, 0.12);
    station.add(tea);
  }
}

// Mochi-Theke: bunte Mochi-Bällchen auf einem Teller
function addMochiProps(station) {
  const plate = cylinder(0.7, 0.7, 0.07, 0xf1faee, 18);
  plate.position.set(0, 1.24, 0.05);
  station.add(plate);
  const mochiColors = [0xffc8dd, 0xbde0fe, 0xd8f3dc, 0xfff3b0, 0xffb4a2];
  mochiColors.forEach((c, i) => {
    const a = (i / mochiColors.length) * Math.PI * 2;
    const mochi = sphere(0.17, c, 10);
    mochi.scale.y = 0.85;
    mochi.position.set(Math.cos(a) * 0.32, 1.36, 0.05 + Math.sin(a) * 0.28);
    station.add(mochi);
  });
}

// Ramen-Küche: dampfende Schüsseln mit Stäbchen
function addRamenProps(station) {
  for (let i = 0; i < 2; i++) {
    const x = -0.4 + i * 0.8;
    const bowl = cylinder(0.34, 0.24, 0.28, 0xbc4749, 14);
    bowl.position.set(x, 1.32, 0.05);
    station.add(bowl);
    const broth = cylinder(0.3, 0.3, 0.06, 0xe9b949, 14);
    broth.position.set(x, 1.46, 0.05);
    station.add(broth);
    const egg = sphere(0.09, 0xf6f7eb, 8);
    egg.position.set(x - 0.1, 1.52, 0.05);
    station.add(egg);
    const chopstick = cylinder(0.02, 0.02, 0.4, 0x8a5a44, 6);
    chopstick.rotation.z = 0.5;
    chopstick.position.set(x + 0.1, 1.6, 0.1);
    station.add(chopstick);
  }
}

// Sake-Bar: Flasche mit kleinen Schälchen
function addSakeProps(station) {
  const bottle = cylinder(0.16, 0.2, 0.7, 0x2f3e2f, 12);
  bottle.position.set(-0.5, 1.5, 0);
  station.add(bottle);
  const neck = cylinder(0.07, 0.09, 0.2, 0x2f3e2f, 8);
  neck.position.set(-0.5, 1.9, 0);
  station.add(neck);
  for (let i = 0; i < 3; i++) {
    const cup = cylinder(0.1, 0.08, 0.14, 0xf1faee, 10);
    cup.position.set(0.25 + i * 0.32, 1.27, 0.12);
    station.add(cup);
  }
}

export const world3Model = {
  emblem: nigiriEmblem,
  stationProps: {
    rolls: addRollsProps,
    nigiri: addNigiriProps,
    tea: addTeaProps,
    ramen: addRamenProps,
    mochi: addMochiProps,
    sake: addSakeProps
  }
};
