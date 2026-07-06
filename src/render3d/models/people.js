import * as THREE from 'three';

// Prozedurale Low-Poly-Personen aus Grundformen.
// Gesamthöhe ~1.5 – hinter der Theke (1.14 hoch) bleiben Kopf und
// Schultern sichtbar, auf dem Gehweg ist die Figur komplett zu sehen.

const SKIN_TONES = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.02,
    ...opts
  });
}

function part(geometry, color) {
  const m = new THREE.Mesh(geometry, mat(color));
  m.castShadow = true;
  return m;
}

export function buildPerson({
  bodyColor = 0x5c7aea,
  skinColor = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
  apronColor = null,
  hatColor = null
} = {}) {
  const group = new THREE.Group();

  const legs = part(new THREE.CylinderGeometry(0.17, 0.19, 0.45, 10), 0x39393a);
  legs.position.y = 0.23;
  group.add(legs);

  const torso = part(new THREE.CylinderGeometry(0.2, 0.23, 0.55, 10), bodyColor);
  torso.position.y = 0.72;
  group.add(torso);

  const head = part(new THREE.SphereGeometry(0.2, 12, 10), skinColor);
  head.position.y = 1.22;
  group.add(head);

  // Arme mit Drehpunkt an der Schulter, damit sie animierbar sind
  const arms = {};
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.26, 0.95, 0);
    const arm = part(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8), bodyColor);
    arm.position.y = -0.19;
    shoulder.add(arm);
    const hand = part(new THREE.SphereGeometry(0.07, 8, 8), skinColor);
    hand.position.y = -0.42;
    shoulder.add(hand);
    group.add(shoulder);
    arms[side === -1 ? 'left' : 'right'] = shoulder;
  }

  if (apronColor !== null) {
    const apron = part(new THREE.BoxGeometry(0.34, 0.42, 0.05), apronColor);
    apron.position.set(0, 0.68, 0.2);
    group.add(apron);
  }

  if (hatColor !== null) {
    const hatBase = part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 10), hatColor);
    hatBase.position.y = 1.42;
    group.add(hatBase);
    const hatTop = part(new THREE.CylinderGeometry(0.18, 0.15, 0.14, 10), hatColor);
    hatTop.position.y = 1.53;
    group.add(hatTop);
  }

  return { group, arms };
}
