// Prozeduraler Low-Poly-Foodtruck, komplett aus Grundformen (Box,
// Zylinder, Kegel) — keine externen Modell-Dateien. Farbschema kommt
// aus data/worlds.js, Beschriftung (Schild) aus der Stations-Definition.
import * as THREE from 'three';

const LOCKED_MAT = new THREE.MeshLambertMaterial({ color: 0x9aa0a6 });

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function box(w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.castShadow = true;
  return m;
}

function cylinder(rTop, rBottom, h, color, segments = 12) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, h, segments),
    mat(color)
  );
  m.castShadow = true;
  return m;
}

// Dach-Schild als CanvasTexture: Emoji + Stations-Name, gerahmt in der
// Markisen-Farbe. Einzige "Textur" am Truck, Rest sind flache Farben.
function signTexture(def, theme) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff8ec';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = theme.awning;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 86);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '46px sans-serif';
  ctx.fillText(def.emoji, 46, 52);
  ctx.fillStyle = '#7a4a21';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(def.sign, 156, 52);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function wheel(x, z) {
  const g = new THREE.Group();
  const tire = cylinder(0.34, 0.34, 0.22, '#2e2e34', 14);
  const hub = cylinder(0.15, 0.15, 0.26, '#d8d3c8', 10);
  tire.rotation.x = hub.rotation.x = Math.PI / 2;
  g.add(tire, hub);
  g.position.set(x, 0.34, z);
  return g;
}

export function createFoodtruck(theme, def) {
  const group = new THREE.Group();
  // Innere Gruppe gleicht aus, dass die Kabine links übersteht —
  // group.position ist damit die visuelle Truck-Mitte.
  const inner = new THREE.Group();
  inner.position.x = 0.45;
  group.add(inner);

  // Aufbau (Küchenkasten) + Dachkante
  const body = box(3.2, 1.7, 1.5, theme.body);
  body.position.set(0.35, 1.3, 0);
  const roof = box(3.3, 0.1, 1.6, theme.bodyDark);
  roof.position.set(0.35, 2.2, 0);

  // Fahrerkabine mit Haube, Windschutzscheibe und Scheinwerfern
  const cabin = box(1.0, 1.15, 1.4, theme.cabin);
  cabin.position.set(-1.85, 1.0, 0);
  const hood = box(0.55, 0.62, 1.3, theme.cabin);
  hood.position.set(-2.6, 0.76, 0);
  const windshield = box(0.06, 0.62, 1.1, '#9fd3e8');
  windshield.position.set(-2.36, 1.28, 0);
  windshield.rotation.z = -0.22;
  const bumper = box(0.18, 0.22, 1.34, '#4d4d55');
  bumper.position.set(-2.92, 0.5, 0);
  const lightL = box(0.1, 0.14, 0.2, '#ffe9a8');
  lightL.material.emissive = new THREE.Color('#c9a83a');
  const lightR = lightL.clone();
  lightL.position.set(-2.9, 0.72, 0.45);
  lightR.position.set(-2.9, 0.72, -0.45);

  // Verkaufsfenster (+z zeigt zur Kamera) mit Tresen
  const windowOpening = box(1.7, 0.8, 0.08, '#3a2d26');
  windowOpening.position.set(0.35, 1.55, 0.74);
  const counter = box(1.9, 0.1, 0.4, theme.counter);
  counter.position.set(0.35, 1.1, 0.92);

  // Markise aus abwechselnd gefärbten Streifen, an der Dachkante
  // aufgehängt. Bewusst kurz und flach geneigt, damit die erhöhte
  // Diorama-Kamera das Personal im Fenster nicht verdeckt.
  const awning = new THREE.Group();
  const stripeCount = 6;
  const stripeW = 2.0 / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    const stripe = box(
      stripeW,
      0.05,
      0.42,
      i % 2 === 0 ? theme.awning : theme.awningAlt
    );
    stripe.position.set(-1.0 + stripeW / 2 + i * stripeW, 0, 0.21);
    awning.add(stripe);
  }
  awning.position.set(0.35, 2.2, 0.76);
  awning.rotation.x = 0.32;

  // Dach-Schild (Textur nur auf der Vorderseite) + Lüfter
  const signGeo = new THREE.BoxGeometry(1.7, 0.62, 0.1);
  const signSide = mat('#fff8ec');
  const sign = new THREE.Mesh(signGeo, [
    signSide,
    signSide,
    signSide,
    signSide,
    new THREE.MeshLambertMaterial({ map: signTexture(def, theme) }),
    signSide,
  ]);
  sign.castShadow = true;
  sign.position.set(0.35, 2.62, 0.1);
  const vent = cylinder(0.11, 0.13, 0.42, '#8f959c', 10);
  vent.position.set(-0.7, 2.42, -0.4);
  const ventCap = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.16, 10),
    mat('#767c84')
  );
  ventCap.castShadow = true;
  ventCap.position.set(-0.7, 2.7, -0.4);

  inner.add(
    body, roof, cabin, hood, windshield, bumper, lightL, lightR,
    windowOpening, counter, awning, sign, vent, ventCap,
    wheel(-1.85, 0.65), wheel(-1.85, -0.65),
    wheel(1.15, 0.65), wheel(1.15, -0.65)
  );

  // Unsichtbare Anker: Kunden-Haltepunkt vor dem Verkaufsfenster und
  // Position fürs Gesperrt-Badge. Über getWorldPosition immer korrekt,
  // egal wie der Truck verschoben/skaliert wird.
  const stopAnchor = new THREE.Object3D();
  stopAnchor.position.set(0.35, 0, 2.3);
  const badgeAnchor = new THREE.Object3D();
  badgeAnchor.position.set(0.35, 1.6, 0.8);
  inner.add(stopAnchor, badgeAnchor);
  const worldPos = new THREE.Vector3();
  function anchorPoint(anchor) {
    anchor.getWorldPosition(worldPos);
    return { x: worldPos.x, y: worldPos.y, z: worldPos.z };
  }

  // Gesperrt-Zustand: alle Materialien grau tauschen (Original merken).
  let locked = false;
  function setLocked(value) {
    if (locked === value) return;
    locked = value;
    group.traverse((obj) => {
      if (!obj.isMesh) return;
      if (value) {
        obj.userData.origMat = obj.material;
        obj.material = LOCKED_MAT;
      } else if (obj.userData.origMat) {
        obj.material = obj.userData.origMat;
        delete obj.userData.origMat;
      }
    });
  }

  return {
    group,
    mount: inner, // hier docken Personal-Figuren an (lokale Truck-Koordinaten)
    awning,
    sign,
    vent: ventCap,
    setLocked,
    getStopPoint: () => anchorPoint(stopAnchor),
    getBadgePoint: () => anchorPoint(badgeAnchor),
  };
}
