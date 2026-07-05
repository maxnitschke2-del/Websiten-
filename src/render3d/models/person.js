// Prozedurale Low-Poly-Figuren (Kunden + Personal) aus Boxen — ersetzt
// die 2D-SVG-Sprites aus Phase 1-6. Figuren schauen in +z-Richtung;
// Beine/Arme haben ihren Pivot oben und werden wie Gelenke rotiert.
import * as THREE from 'three';

// Varianten-Pools wie im alten 2D-Sprite-System
const SKIN_TONES = ['#f2c19a', '#e8b183', '#c68642', '#8d5524'];
const HAIR_COLORS = ['#5b3a1e', '#2c2c2c', '#a55728', '#e0c068', '#888888'];
const HAIR_STYLES = ['round', 'round', 'cap', 'long', 'bald'];
const SHIRT_COLORS = ['#4a90d9', '#7a56c2', '#3aa76d', '#d95f4a', '#c2a13a', '#d9639b'];
const PANTS_COLORS = ['#3b4664', '#54432e', '#2f5d50', '#5a3b5d'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomCustomerVariant() {
  return {
    skin: pick(SKIN_TONES),
    hairColor: pick(HAIR_COLORS),
    hairStyle: pick(HAIR_STYLES),
    shirt: pick(SHIRT_COLORS),
    pants: pick(PANTS_COLORS),
    kid: Math.random() < 0.15,
  };
}

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function box(w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.castShadow = true;
  return m;
}

// Gliedmaße mit Pivot am oberen Ende (Hüfte/Schulter)
function limb(w, h, d, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(0, -h / 2, 0);
  const m = new THREE.Mesh(geo, mat(color));
  m.castShadow = true;
  return m;
}

function addHair(head, v) {
  switch (v.hairStyle) {
    case 'bald':
      return;
    case 'cap': {
      const cap = box(0.38, 0.12, 0.38, v.hairColor);
      cap.position.set(0, 0.2, 0);
      const brim = box(0.3, 0.045, 0.2, v.hairColor);
      brim.position.set(0, 0.15, 0.26);
      head.add(cap, brim);
      return;
    }
    case 'long': {
      const top = box(0.38, 0.15, 0.38, v.hairColor);
      top.position.set(0, 0.19, -0.01);
      const back = box(0.36, 0.5, 0.12, v.hairColor);
      back.position.set(0, -0.12, -0.21);
      head.add(top, back);
      return;
    }
    default: {
      const top = box(0.38, 0.16, 0.38, v.hairColor);
      top.position.set(0, 0.19, -0.01);
      head.add(top);
    }
  }
}

export function createPerson(v) {
  const group = new THREE.Group();

  const legL = limb(0.16, 0.5, 0.18, v.pants);
  legL.position.set(-0.11, 0.5, 0);
  const legR = limb(0.16, 0.5, 0.18, v.pants);
  legR.position.set(0.11, 0.5, 0);

  const torso = box(0.46, 0.56, 0.28, v.shirt);
  torso.position.y = 0.78;

  const armL = limb(0.11, 0.42, 0.13, v.shirt);
  armL.position.set(-0.3, 1.02, 0);
  const armR = limb(0.11, 0.42, 0.13, v.shirt);
  armR.position.set(0.3, 1.02, 0);

  const head = box(0.34, 0.34, 0.32, v.skin);
  head.position.y = 1.28;
  const eyeL = box(0.045, 0.045, 0.02, '#333333');
  eyeL.position.set(-0.075, 0.03, 0.165);
  eyeL.castShadow = false;
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.075;
  head.add(eyeL, eyeR);
  addHair(head, v);

  group.add(legL, legR, torso, armL, armR, head);

  if (v.kid) group.scale.setScalar(0.72);
  const height = 1.62 * group.scale.y;

  // Beine/Arme schwingen gegenläufig; beim Stoppen sauber zurück auf 0.
  let walkTweens = [];
  function setWalking(on) {
    for (const t of walkTweens) t.kill();
    walkTweens = [];
    if (on) {
      const D = 0.27;
      walkTweens = [
        gsap.fromTo(legL.rotation, { x: -0.55 }, { x: 0.55, duration: D, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.fromTo(legR.rotation, { x: 0.55 }, { x: -0.55, duration: D, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.fromTo(armL.rotation, { x: 0.4 }, { x: -0.4, duration: D, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        gsap.fromTo(armR.rotation, { x: -0.4 }, { x: 0.4, duration: D, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
      ];
    } else {
      for (const l of [legL, legR, armL, armR]) {
        gsap.to(l.rotation, { x: 0, duration: 0.15 });
      }
    }
  }

  function dispose() {
    setWalking(false);
    gsap.killTweensOf(group.rotation);
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
  }

  return { group, legL, legR, armL, armR, head, torso, height, setWalking, dispose };
}

// Personal: Figur in Truck-Farben mit Kochmütze und Schürze. Steht im
// Verkaufsfenster (Beine verschwinden im Truck-Korpus).
export function createWorker(truckTheme) {
  const person = createPerson({
    skin: pick(SKIN_TONES),
    hairColor: '#ffffff',
    hairStyle: 'bald',
    shirt: truckTheme.awning,
    pants: '#4a4a52',
    kid: false,
  });

  // Flache Kochmütze (hohe Hüte verschwinden hinter der Markise)
  const hat = box(0.36, 0.09, 0.36, '#ffffff');
  hat.position.set(0, 0.21, 0);
  const brim = box(0.3, 0.05, 0.16, '#ffffff');
  brim.position.set(0, 0.17, 0.25);
  person.head.add(hat, brim);

  const apron = box(0.4, 0.42, 0.05, '#fdf6e9');
  apron.position.set(0, 0.72, 0.16);
  apron.castShadow = false;
  person.group.add(apron);

  // Steht hinterm Tresen: Beine würden sonst unten aus dem
  // Truck-Korpus ragen.
  person.legL.visible = false;
  person.legR.visible = false;

  return person;
}
