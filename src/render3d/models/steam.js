// Dampf-Emitter: wenige Low-Poly-Puffs (Icosahedron), die aus dem
// Truck-Lüfter aufsteigen, wachsen und ausblenden. Bewusst ohne echtes
// Partikelsystem — 3 recycelte Meshes pro Truck reichen für den Look
// und bleiben mobile-tauglich.
import * as THREE from 'three';

const PUFF_COUNT = 3;
const LIFETIME = 1.9; // Sekunden pro Aufstieg
const RISE = 1.15; // Aufstiegshöhe in Welt-Einheiten
const MAX_OPACITY = 0.5;

export function createSteam(color = '#ffffff') {
  const group = new THREE.Group();
  const puffs = [];

  for (let i = 0; i < PUFF_COUNT; i++) {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.16, 0),
      new THREE.MeshLambertMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false, // weiche Überlagerung statt harter Kanten
      })
    );
    mesh.rotation.y = (i / PUFF_COUNT) * Math.PI;
    group.add(mesh);
    // Phasen versetzt, damit immer ein Puff unterwegs ist
    puffs.push({ mesh, t: i / PUFF_COUNT, drift: 0.6 + i * 0.5 });
  }

  function update(dt) {
    for (const p of puffs) {
      p.t += dt / LIFETIME;
      if (p.t >= 1) p.t -= 1;
      const t = p.t;
      p.mesh.position.set(
        Math.sin(t * 5 + p.drift * 7) * 0.07,
        t * RISE,
        0
      );
      const s = 0.55 + t * 1.1;
      p.mesh.scale.setScalar(s);
      // schnell einblenden, langsam verrauchen
      p.mesh.material.opacity =
        t < 0.18 ? (t / 0.18) * MAX_OPACITY : MAX_OPACITY * (1 - (t - 0.18) / 0.82);
    }
  }

  return { group, update };
}
