import * as THREE from 'three';

// Generischer Diorama-Aufbau, den sich alle Welten teilen. Jede Welt liefert
// nur ihr welt-spezifisches Truck-Emblem und ihre Stations-Aufbauten (worldModel).
// So bleiben die zugrunde liegenden Systeme (Layout, Kamera-Rahmen, Freischalten)
// über alle Welten identisch.

export const STATION_SPACING = 3.4;
export const STATION_Z = 1.2;
export const TRUCK_Z = -3.4;

// Anker für Personal (hinter der Theke) und Kunden (davor, auf dem Gehweg).
export const WORKER_DZ = -1.0;
export const CUSTOMER_DZ = 1.35;
export const SIDEWALK_Z = STATION_Z + CUSTOMER_DZ;
export const STREET_Z = 4.2;

// Sitzbereich im Vordergrund (Kamera-Seite, hinter der Straße).
export const TABLE_Z = 5.9;
export const SEAT_DZ = 0.6; // Kunde sitzt kameraseitig am Tisch
export const SERVE_DZ = -0.75; // Kellner bedient von der Truck-Seite

export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    ...opts
  });
}

export function mesh(geometry, color, opts) {
  const m = new THREE.Mesh(geometry, mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export const box = (w, h, d, color, opts) =>
  mesh(new THREE.BoxGeometry(w, h, d), color, opts);
export const cylinder = (rTop, rBottom, h, color, seg = 16, opts) =>
  mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), color, opts);
export const cone = (r, h, color, seg = 16) =>
  mesh(new THREE.ConeGeometry(r, h, seg), color);
export const sphere = (r, color, seg = 12) =>
  mesh(new THREE.SphereGeometry(r, seg, seg), color);

export function buildWorld(scene, worldCfg, stationCfgs, worldStationState, worldModel) {
  const palette = worldCfg.palette;
  const group = new THREE.Group();

  buildGround(group, palette);
  buildTruck(group, palette, worldModel.emblem);
  const tableLayout = buildTables(group, palette, stationCfgs.length);

  const stationMeshes = {};
  const stationLayout = [];
  const count = stationCfgs.length;
  stationCfgs.forEach((cfg, i) => {
    const x = (i - (count - 1) / 2) * STATION_SPACING;
    const stationState = worldStationState[cfg.id];
    const station = stationState.unlocked
      ? buildStation(cfg.id, palette, worldModel)
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

  // Kamera-Rahmen: Truck + alle Stationen + der Sitzbereich im Vordergrund.
  const frameBounds = new THREE.Box3(
    new THREE.Vector3(-(count / 2) * STATION_SPACING - 1.4, 0, TRUCK_Z - 1.6),
    new THREE.Vector3((count / 2) * STATION_SPACING + 1.4, 3.6, TABLE_Z + 1.2)
  );

  return { group, stationMeshes, stationLayout, tableLayout, frameBounds };
}

export function swapToUnlockedStation(group, stationMeshes, id, palette, worldModel) {
  const old = stationMeshes[id];
  const station = buildStation(id, palette, worldModel);
  station.position.copy(old.position);
  group.remove(old);
  disposeObject(old);
  group.add(station);
  stationMeshes[id] = station;
  return station;
}

// Gibt Geometrien/Materialien eines Teilbaums frei (wichtig beim Welt-Wechsel).
export function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material.dispose();
    }
  });
}

function buildGround(group, palette) {
  const ground = box(48, 0.5, 26, palette.ground);
  ground.position.y = -0.25;
  ground.castShadow = false;
  group.add(ground);

  const street = box(48, 0.06, 3.6, palette.street);
  street.position.set(0, 0.03, 4.2);
  street.castShadow = false;
  group.add(street);

  for (let x = -22; x <= 22; x += 4) {
    const stripe = box(1.4, 0.02, 0.22, 0xf4f1de);
    stripe.position.set(x, 0.07, 4.2);
    stripe.castShadow = false;
    group.add(stripe);
  }

  const sidewalk = box(48, 0.08, 2.2, palette.sidewalk);
  sidewalk.position.set(0, 0.04, 2.6);
  sidewalk.castShadow = false;
  group.add(sidewalk);

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

  for (const x of [-9.5, 9.5]) {
    const trunk = cylinder(0.14, 0.18, 0.9, 0x795548, 8);
    trunk.position.set(x, 0.45, TRUCK_Z - 0.4);
    group.add(trunk);
    const crown = cone(0.85, 1.6, 0x6a994e, 8);
    crown.position.set(x, 1.7, TRUCK_Z - 0.4);
    group.add(crown);
  }
}

function buildTruck(group, palette, emblemBuilder) {
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

  const hatch = box(3.4, 1.0, 0.1, 0xfff3e0, { roughness: 0.6 });
  hatch.position.set(0.4, 1.7, 1.08);
  truck.add(hatch);

  const awning = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const slat = box(0.76, 0.06, 1.1, i % 2 === 0 ? palette.awning : 0xffffff);
    slat.position.x = -1.52 + i * 0.76;
    awning.add(slat);
  }
  awning.position.set(0.4, 2.5, 1.55);
  awning.rotation.x = -0.35;
  truck.add(awning);

  // Welt-spezifisches Dach-Emblem (Signature-Gericht)
  const emblem = emblemBuilder();
  emblem.position.set(0.4, 2.85, 0);
  truck.add(emblem);

  truck.position.set(0, 0, TRUCK_Z);
  group.add(truck);
}

export function buildCounter(palette) {
  const station = new THREE.Group();
  const base = box(2.4, 1.0, 1.3, palette.counter);
  base.position.y = 0.5;
  station.add(base);
  const top = box(2.6, 0.14, 1.5, palette.counterTop);
  top.position.y = 1.07;
  station.add(top);
  return station;
}

// Sitzbereich: 3 kleine Tische mit Stuhl im Vordergrund. Liefert die Anker
// (Kunden-Sitzplatz, Kellner-Serveplatz, Tischmitte) fürs Entity-System.
function buildTables(group, palette, stationCount) {
  const halfW = (stationCount / 2) * STATION_SPACING;
  const xs = [-halfW * 0.62, 0, halfW * 0.62];
  const layout = [];

  xs.forEach((x, i) => {
    const table = new THREE.Group();

    const leg = cylinder(0.1, 0.13, 0.85, 0x8a6d4f, 10);
    leg.position.y = 0.42;
    table.add(leg);
    const top = cylinder(0.56, 0.56, 0.1, palette.counterTop, 18);
    top.position.y = 0.9;
    table.add(top);

    // Stuhl auf der Kamera-Seite (Kunde sitzt mit Blick zum Tisch)
    const seatZ = SEAT_DZ;
    const chairSeat = box(0.5, 0.08, 0.5, palette.accent);
    chairSeat.position.set(0, 0.5, seatZ);
    table.add(chairSeat);
    const chairLeg = cylinder(0.07, 0.08, 0.5, 0x6d4c33, 8);
    chairLeg.position.set(0, 0.25, seatZ);
    table.add(chairLeg);
    const chairBack = box(0.5, 0.5, 0.08, palette.accent);
    chairBack.position.set(0, 0.75, seatZ + 0.24);
    table.add(chairBack);

    table.position.set(x, 0, TABLE_Z);
    group.add(table);

    layout.push({
      index: i,
      x,
      z: TABLE_Z,
      seatZ: TABLE_Z + SEAT_DZ,
      serveZ: TABLE_Z + SERVE_DZ
    });
  });

  return layout;
}

function buildStation(id, palette, worldModel) {
  const station = buildCounter(palette);
  const addProps = worldModel.stationProps[id];
  if (addProps) addProps(station);
  return station;
}

function buildLockedStation(palette) {
  const station = new THREE.Group();

  const base = box(2.4, 1.0, 1.3, 0x9aa0a6, { roughness: 0.95 });
  base.position.y = 0.5;
  station.add(base);
  const top = box(2.6, 0.14, 1.5, 0xb9bec4, { roughness: 0.95 });
  top.position.y = 1.07;
  station.add(top);

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
