import * as THREE from 'three';

// Welt 1 "Burger Boulevard" – komplett prozedural aus Grundformen
// (Box/Cylinder/Cone/Sphere/Torus), keine externen Modell-Dateien.

const STATION_SPACING = 3.4;
const STATION_Z = 1.2;
const TRUCK_Z = -3.4;

// Anker für Personal (hinter der Theke) und Kunden (davor, auf dem Gehweg).
// Personal steht klar hinter dem Tresen, wo keine Aufbauten verdecken.
export const WORKER_DZ = -1.0; // relativ zur Station: hinter dem Tresen
export const CUSTOMER_DZ = 1.35; // davor auf dem Gehweg
export const SIDEWALK_Z = STATION_Z + CUSTOMER_DZ;
export const STREET_Z = 4.2;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    ...opts
  });
}

function mesh(geometry, color, opts) {
  const m = new THREE.Mesh(geometry, mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const box = (w, h, d, color, opts) =>
  mesh(new THREE.BoxGeometry(w, h, d), color, opts);
const cylinder = (rTop, rBottom, h, color, seg = 16, opts) =>
  mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), color, opts);
const cone = (r, h, color, seg = 16) =>
  mesh(new THREE.ConeGeometry(r, h, seg), color);
const sphere = (r, color, seg = 12) =>
  mesh(new THREE.SphereGeometry(r, seg, seg), color);

export function buildWorld1(scene, palette, stationCfgs, worldStationState) {
  const group = new THREE.Group();

  buildGround(group, palette);
  buildTruck(group, palette);

  const stationMeshes = {};
  const stationLayout = [];
  const count = stationCfgs.length;
  stationCfgs.forEach((cfg, i) => {
    const x = (i - (count - 1) / 2) * STATION_SPACING;
    const stationState = worldStationState[cfg.id];
    const station = stationState.unlocked
      ? buildStation(cfg.id, palette)
      : buildLockedStation(palette);
    station.position.set(x, 0, STATION_Z);
    group.add(station);
    stationMeshes[cfg.id] = station;
    stationLayout.push({
      id: cfg.id,
      x,
      workerZ: STATION_Z + WORKER_DZ,
      customerZ: SIDEWALK_Z
    });
  });

  scene.add(group);

  // Rahmen für die Kamera: Truck + alle 4 Stationen inkl. Straßenstreifen.
  // Bewusst NICHT der riesige Boden – der läuft sichtbar über den Bildrand hinaus.
  const frameBounds = new THREE.Box3(
    new THREE.Vector3(-(count / 2) * STATION_SPACING - 1.4, 0, TRUCK_Z - 1.6),
    new THREE.Vector3((count / 2) * STATION_SPACING + 1.4, 3.6, STATION_Z + 3.4)
  );

  return { group, stationMeshes, stationLayout, frameBounds };
}

// Ersetzt eine gesperrte Station durch die gebaute Variante (Phase 2).
export function swapToUnlockedStation(group, stationMeshes, id, palette) {
  const old = stationMeshes[id];
  const station = buildStation(id, palette);
  station.position.copy(old.position);
  group.remove(old);
  group.add(station);
  stationMeshes[id] = station;
  return station;
}

function buildGround(group, palette) {
  const ground = box(48, 0.5, 26, palette.ground);
  ground.position.y = -0.25;
  ground.castShadow = false;
  group.add(ground);

  // Straße, auf der später die Kunden laufen (vor den Theken)
  const street = box(48, 0.06, 3.6, palette.street);
  street.position.set(0, 0.03, 4.2);
  street.castShadow = false;
  group.add(street);

  // Mittelstreifen
  for (let x = -22; x <= 22; x += 4) {
    const stripe = box(1.4, 0.02, 0.22, 0xf4f1de);
    stripe.position.set(x, 0.07, 4.2);
    stripe.castShadow = false;
    group.add(stripe);
  }

  // Gehweg zwischen Theken und Straße
  const sidewalk = box(48, 0.08, 2.2, palette.sidewalk);
  sidewalk.position.set(0, 0.04, 2.6);
  sidewalk.castShadow = false;
  group.add(sidewalk);

  // Grünstreifen mit Büschen auf der anderen Straßenseite (Kamera-Seite),
  // damit der Vordergrund des Dioramas nicht leer wirkt
  const grass = box(48, 0.07, 9, 0x7fb069);
  grass.position.set(0, 0.035, 10.5);
  grass.castShadow = false;
  group.add(grass);
  for (const [x, z, s] of [[-7.5, 7.2, 0.5], [-2.8, 7.8, 0.38], [1.9, 7.1, 0.45], [6.6, 7.6, 0.55], [-11, 7.5, 0.42], [10.5, 7.2, 0.4]]) {
    const bush = sphere(s, 0x5c8d3e, 10);
    bush.scale.y = 0.72;
    bush.position.set(x, 0.25, z);
    group.add(bush);
  }

  // Deko: ein paar Bäume am Rand hinter dem Truck
  for (const x of [-9.5, 9.5]) {
    const trunk = cylinder(0.14, 0.18, 0.9, 0x795548, 8);
    trunk.position.set(x, 0.45, TRUCK_Z - 0.4);
    group.add(trunk);
    const crown = cone(0.85, 1.6, 0x6a994e, 8);
    crown.position.set(x, 1.7, TRUCK_Z - 0.4);
    group.add(crown);
  }
}

function buildTruck(group, palette) {
  const truck = new THREE.Group();

  const body = box(5.4, 2.1, 2.1, palette.truck);
  body.position.y = 1.45;
  truck.add(body);

  const roof = box(5.6, 0.22, 2.3, palette.truckRoof);
  roof.position.y = 2.6;
  truck.add(roof);

  const cab = box(1.5, 1.4, 2.0, palette.truck);
  cab.position.set(-3.35, 1.1, 0);
  truck.add(cab);

  const windshield = box(0.12, 0.7, 1.6, 0xa8dadc, { roughness: 0.3 });
  windshield.position.set(-4.06, 1.35, 0);
  truck.add(windshield);

  for (const [x, z] of [[-3.3, 0.95], [-3.3, -0.95], [1.8, 0.95], [1.8, -0.95], [-1.4, 0.95], [-1.4, -0.95]]) {
    const wheel = cylinder(0.45, 0.45, 0.3, 0x2b2d42, 18);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.45, z);
    truck.add(wheel);
    const hub = cylinder(0.18, 0.18, 0.32, 0xadb5bd, 12);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(x, 0.45, z);
    truck.add(hub);
  }

  // Serviceklappe zur Kamera hin
  const hatch = box(3.4, 1.0, 0.1, 0xfff3e0, { roughness: 0.6 });
  hatch.position.set(0.4, 1.7, 1.08);
  truck.add(hatch);

  // Markise über der Klappe
  const awning = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const slat = box(0.76, 0.06, 1.1, i % 2 === 0 ? palette.awning : 0xffffff);
    slat.position.x = -1.52 + i * 0.76;
    awning.add(slat);
  }
  awning.position.set(0.4, 2.5, 1.55);
  awning.rotation.x = -0.35;
  truck.add(awning);

  // Riesen-Burger als Dach-Emblem
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
  emblem.position.set(0.4, 2.85, 0);
  truck.add(emblem);

  truck.position.set(0, 0, TRUCK_Z);
  group.add(truck);
}

function buildCounter(palette) {
  const station = new THREE.Group();
  const base = box(2.4, 1.0, 1.3, palette.counter);
  base.position.y = 0.5;
  station.add(base);
  const top = box(2.6, 0.14, 1.5, palette.counterTop);
  top.position.y = 1.07;
  station.add(top);
  return station;
}

function buildStation(id, palette) {
  const station = buildCounter(palette);
  const builders = {
    grill: addGrillProps,
    fries: addFriesProps,
    drinks: addDrinkProps,
    icecream: addIceCreamProps
  };
  (builders[id] || (() => {}))(station);
  return station;
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
  // Pommes-Tüte: roter Becher mit gelben Stäbchen
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

function buildLockedStation(palette) {
  const station = new THREE.Group();

  const base = box(2.4, 1.0, 1.3, 0x9aa0a6, { roughness: 0.95 });
  base.position.y = 0.5;
  station.add(base);
  const top = box(2.6, 0.14, 1.5, 0xb9bec4, { roughness: 0.95 });
  top.position.y = 1.07;
  station.add(top);

  // Vorhängeschloss aus Box + halbem Torus
  const lock = new THREE.Group();
  const lockBody = box(0.56, 0.46, 0.2, 0x495057, { metalness: 0.4, roughness: 0.4 });
  lock.add(lockBody);
  const shackle = mesh(
    new THREE.TorusGeometry(0.2, 0.055, 10, 20, Math.PI),
    0x868e96,
    { metalness: 0.6, roughness: 0.3 }
  );
  shackle.position.y = 0.23;
  lock.add(shackle);
  const keyhole = cylinder(0.05, 0.05, 0.22, 0x212529, 10);
  keyhole.rotation.x = Math.PI / 2;
  lock.add(keyhole);
  lock.position.y = 1.75;
  station.add(lock);

  return station;
}
