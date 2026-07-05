// Prozedurale Low-Poly-Umgebung: Boden, Straße, Häuserzeile, Bäume und
// treibende Wolken. Farben kommen aus dem Standort-Theme (Himmel/Boden/
// Gebäude, data/locations.js) plus Welt-Akzenten (data/worlds.js).
import * as THREE from 'three';

// Kleiner seeded RNG (mulberry32), damit eine Stadt bei jedem Laden
// gleich aussieht und erst der Umzug ein neues Stadtbild würfelt.
function makeRng(seed) {
  let a = seed + 0x6d2b79f5;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function box(w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function tree(rng, env) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.14, 0.7, 7),
    mat(env.trunk)
  );
  trunk.castShadow = true;
  trunk.position.y = 0.35;
  g.add(trunk);
  if (rng() < 0.35) {
    // Zypresse: schlanker Kegel
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.4, 8),
      mat(env.foliageDark)
    );
    cone.castShadow = true;
    cone.position.y = 1.7;
    g.add(cone);
  } else {
    // Laubbaum: kantige Kugel (Icosahedron = Low-Poly-Look)
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.75 + rng() * 0.3, 0),
      mat(rng() < 0.5 ? env.foliage : env.foliageDark)
    );
    crown.castShadow = true;
    crown.position.y = 1.35;
    crown.rotation.y = rng() * Math.PI;
    g.add(crown);
  }
  return g;
}

function cloud(rng, color) {
  const g = new THREE.Group();
  const puffs = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < puffs; i++) {
    const puff = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55 + rng() * 0.5, 0),
      mat(color)
    );
    puff.position.set(i * 0.8 - puffs * 0.4, (rng() - 0.5) * 0.3, 0);
    puff.scale.y = 0.6;
    g.add(puff);
  }
  return g;
}

export function buildEnvironment({ loc, env, seed }) {
  const rng = makeRng(seed * 1013 + 7);
  const group = new THREE.Group();

  // Boden (Plaza, auf der die Trucks stehen)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), mat(loc.ground));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -5);
  ground.receiveShadow = true;
  group.add(ground);

  // Gehweg-Streifen vor den Trucks (dunklerer Bodenton)
  const walk = box(80, 0.05, 5.5, loc.groundDark);
  walk.position.set(0, 0.025, 4.2);
  group.add(walk);

  // Straße hinter den Trucks mit Mittelstreifen
  const road = box(80, 0.05, 3.4, env.road);
  road.position.set(0, 0.025, -4.6);
  group.add(road);
  for (let x = -30; x <= 30; x += 3) {
    const line = box(1.1, 0.02, 0.16, env.roadLine);
    line.position.set(x, 0.06, -4.6);
    line.castShadow = false;
    group.add(line);
  }

  // Häuserzeile im Hintergrund, Farbton leicht variiert
  const base = new THREE.Color(loc.building);
  let x = -16;
  while (x < 16) {
    const w = 2.6 + rng() * 2.2;
    const h = 2.1 + rng() * 2.3;
    const c = base.clone().offsetHSL(0, 0, (rng() - 0.5) * 0.12);
    const b = box(w, h, 2.6, c);
    b.position.set(x + w / 2, h / 2, -9.5 - rng() * 3);
    group.add(b);
    if (rng() < 0.55) {
      // Satteldach-Andeutung als flacher Kegel in Welt-Dachfarbe
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(w * 0.62, 0.9 + rng() * 0.5, 4),
        mat(env.roof)
      );
      roof.castShadow = true;
      roof.rotation.y = Math.PI / 4;
      roof.position.set(b.position.x, h + 0.4, b.position.z);
      group.add(roof);
    }
    x += w + 0.5 + rng() * 1.2;
  }

  // Bäume: an den Rändern und vereinzelt zwischen Straße und Häusern
  const treeSpots = [
    [-9.5, 2.8], [9.5, 2.8],
    [-12.5, -2], [12.5, -2],
    [-6.5, -6.8], [0.5, -6.9], [7, -6.7],
  ];
  for (const [tx, tz] of treeSpots) {
    if (rng() < 0.85) {
      const t = tree(rng, env);
      t.position.set(tx + (rng() - 0.5), 0, tz);
      const s = 0.85 + rng() * 0.5;
      t.scale.set(s, s, s);
      group.add(t);
    }
  }

  // Wolken, die langsam durchs Bild treiben
  const clouds = [];
  for (let i = 0; i < 3; i++) {
    const c = cloud(rng, env.cloud);
    c.position.set(-14 + i * 12 + rng() * 4, 8.5 + rng() * 2.5, -13 - rng() * 4);
    group.add(c);
    clouds.push(c);
  }

  function update(dt) {
    for (const c of clouds) {
      c.position.x += dt * 0.25;
      if (c.position.x > 22) c.position.x = -22;
    }
  }

  return { group, update };
}
