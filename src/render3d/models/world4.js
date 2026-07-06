import * as THREE from 'three';
import { box, cylinder, cone, sphere, mesh } from './worldBuilder.js';

// Welt 4 "Sweet Dreams" – Emblem (Regenbogen-Sundae) + Stations-Aufbauten.

const GLASS = 0xbfe3ef;
const SCOOPS = [0xff8fab, 0xffe08a, 0x8ec7ff];

function sundaeEmblem() {
  const g = new THREE.Group();
  const glass = cylinder(0.42, 0.22, 0.6, GLASS, 14, {
    transparent: true,
    opacity: 0.65,
    roughness: 0.2
  });
  glass.position.y = -0.15;
  g.add(glass);
  SCOOPS.forEach((c, i) => {
    const scoop = sphere(0.3 - i * 0.035, c, 12);
    scoop.position.y = 0.18 + i * 0.27;
    g.add(scoop);
  });
  const stick = cylinder(0.02, 0.02, 0.2, 0x6a4c2f, 6);
  stick.position.y = 0.98;
  g.add(stick);
  const cherry = sphere(0.1, 0xd00000, 10);
  cherry.position.y = 1.1;
  g.add(cherry);
  return g;
}

// Sundae-Theke: Eisbecher mit gestapelten Kugeln
function addSundaeProps(station) {
  for (let i = 0; i < 3; i++) {
    const x = -0.55 + i * 0.55;
    const glass = cylinder(0.2, 0.12, 0.32, GLASS, 12, {
      transparent: true,
      opacity: 0.6,
      roughness: 0.2
    });
    glass.position.set(x, 1.32, 0.05);
    station.add(glass);
    SCOOPS.forEach((c, j) => {
      const scoop = sphere(0.15 - j * 0.02, c, 10);
      scoop.position.set(x, 1.5 + j * 0.16, 0.05);
      station.add(scoop);
    });
  }
}

// Donut-Theke: gestapelte bunte Donuts
function addDonutProps(station) {
  const stand = cylinder(0.1, 0.1, 0.5, 0xadb5bd, 10, { metalness: 0.4 });
  stand.position.set(-0.5, 1.35, 0);
  station.add(stand);
  const glazes = [0xff85a1, 0x9d4edd, 0xffca3a, 0x8ac926];
  glazes.forEach((c, i) => {
    const donut = mesh(new THREE.TorusGeometry(0.19, 0.09, 10, 18), c);
    donut.position.set(-0.5, 1.16 + i * 0.16, 0);
    donut.rotation.x = Math.PI / 2;
    station.add(donut);
  });
  // ein paar Donuts daneben liegend
  for (let i = 0; i < 2; i++) {
    const donut = mesh(new THREE.TorusGeometry(0.18, 0.085, 10, 18), glazes[i + 1]);
    donut.position.set(0.35 + i * 0.42, 1.24, 0.1);
    station.add(donut);
  }
}

// Milchshake-Bar: Becher mit Sahnehaube und Strohhalm
function addShakeProps(station) {
  const shakeColors = [0xffb3c6, 0xd4a373, 0xcdb4db];
  shakeColors.forEach((c, i) => {
    const x = -0.55 + i * 0.55;
    const cup = cylinder(0.16, 0.13, 0.42, c, 12);
    cup.position.set(x, 1.32, 0.05);
    station.add(cup);
    const cream = sphere(0.17, 0xfff8f0, 10);
    cream.scale.y = 0.7;
    cream.position.set(x, 1.56, 0.05);
    station.add(cream);
    const cherry = sphere(0.06, 0xd00000, 8);
    cherry.position.set(x, 1.68, 0.05);
    station.add(cherry);
    const straw = cylinder(0.025, 0.025, 0.35, 0xff5d8f, 6);
    straw.position.set(x + 0.06, 1.62, 0.05);
    straw.rotation.z = 0.25;
    station.add(straw);
  });
}

// Cupcake-Theke: Cupcakes mit Zuckergussspitze
function addCupcakeProps(station) {
  const tray = box(1.7, 0.08, 0.85, 0xf1faee);
  tray.position.set(0, 1.2, 0.05);
  station.add(tray);
  const frostings = [0xff8fab, 0xb5e48c, 0x90dbf4];
  for (let i = 0; i < 3; i++) {
    const x = -0.55 + i * 0.55;
    const base = cylinder(0.16, 0.13, 0.2, 0xd9a066, 12);
    base.position.set(x, 1.34, 0.05);
    station.add(base);
    const frost = cone(0.17, 0.32, frostings[i], 12);
    frost.position.set(x, 1.6, 0.05);
    station.add(frost);
    const cherry = sphere(0.05, 0xd00000, 8);
    cherry.position.set(x, 1.8, 0.05);
    station.add(cherry);
  }
}

// Keks-Ofen: Backblech mit Cookies auf einem Ofen
function addCookieProps(station) {
  const oven = box(1.0, 0.7, 0.7, 0xe0e0e0, { metalness: 0.3, roughness: 0.5 });
  oven.position.set(-0.55, 1.35, 0);
  station.add(oven);
  const window_ = box(0.6, 0.35, 0.05, 0x5a4633);
  window_.position.set(-0.55, 1.35, 0.36);
  station.add(window_);
  const tray = box(1.0, 0.05, 0.6, 0x9aa0a6, { metalness: 0.4 });
  tray.position.set(0.5, 1.22, 0.05);
  station.add(tray);
  for (let i = 0; i < 4; i++) {
    const cookie = cylinder(0.13, 0.13, 0.06, 0xc68642, 12);
    cookie.position.set(0.25 + (i % 2) * 0.4, 1.28, -0.1 + Math.floor(i / 2) * 0.3);
    station.add(cookie);
    const chip = sphere(0.03, 0x3a2416, 6);
    chip.position.set(0.25 + (i % 2) * 0.4, 1.33, -0.1 + Math.floor(i / 2) * 0.3);
    station.add(chip);
  }
}

// Süßwaren-Stand: Gläser mit buntem Naschwerk + Lutscher
function addCandyProps(station) {
  const jarColors = [0xff8fab, 0x8ec7ff, 0xb5e48c];
  jarColors.forEach((c, i) => {
    const jar = cylinder(0.18, 0.18, 0.5, 0xdfefff, 12, {
      transparent: true,
      opacity: 0.55,
      roughness: 0.2
    });
    jar.position.set(-0.5 + i * 0.5, 1.4, 0);
    station.add(jar);
    const candy = sphere(0.14, c, 10);
    candy.position.set(-0.5 + i * 0.5, 1.35, 0);
    station.add(candy);
  });
  const lolly = cylinder(0.02, 0.02, 0.4, 0xf1faee, 6);
  lolly.position.set(0.6, 1.4, 0.2);
  station.add(lolly);
  const swirl = sphere(0.13, 0xff5d8f, 10);
  swirl.position.set(0.6, 1.62, 0.2);
  station.add(swirl);
}

export const world4Model = {
  emblem: sundaeEmblem,
  stationProps: {
    sundae: addSundaeProps,
    donuts: addDonutProps,
    shakes: addShakeProps,
    cookies: addCookieProps,
    cupcakes: addCupcakeProps,
    candy: addCandyProps
  }
};
