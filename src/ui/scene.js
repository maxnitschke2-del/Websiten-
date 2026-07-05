// Szenen-Schicht: baut die 3D-Welt (Three.js, src/render3d/) und stellt
// der Spiel-Logik eine schlanke API bereit. Seit Phase 2 sind Kunden und
// Personal Low-Poly-3D-Figuren; nur noch Sprechblasen, Trinkgeld-Bubbles
// und Schwebe-Texte sind DOM-Elemente im Overlay (antippbar/knackscharf),
// positioniert über die Kamera-Projektion.
import { STATIONS } from '../data/stations.js';
import { getLocation } from '../data/locations.js';
import { getWorld } from '../data/worlds.js';
import { state } from '../core/state.js';
import { rand } from '../utils/format.js';
import { init3d } from '../render3d/scene.js';
import { createFoodtruck } from '../render3d/models/foodtruck.js';
import { buildEnvironment } from '../render3d/models/environment.js';
import {
  createPerson,
  createWorker,
  randomCustomerVariant,
} from '../render3d/models/person.js';

// Truck-Positionen auf der Plaza (x in Weltkoordinaten)
const TRUCK_XS = [-6.0, 0, 6.0];
// Kunden laufen auf dieser z-Spur (vor den Trucks) ein und aus
const ENTRY_X = 13;

let r3d = null;
let overlay = null;
let trucks = new Map(); // stationId -> Truck-Handle + worker
let lockBadges = new Map(); // stationId -> DOM-Element
let idleTweens = [];
let actors = new Set(); // aktive Kunden-Aktoren

// ---------- Aufbau / Teardown ----------

function teardown() {
  for (const tw of idleTweens) tw.kill();
  idleTweens = [];
  for (const actor of actors) actor._kill();
  actors = new Set();
  if (r3d) r3d.dispose();
  r3d = null;
  trucks = new Map();
  lockBadges = new Map();
}

export function buildScene(root) {
  teardown();
  root.innerHTML = '';

  r3d = init3d(root);
  overlay = document.createElement('div');
  overlay.className = 'scene-overlay';
  root.appendChild(overlay);

  const loc = getLocation(state.locationIndex).theme;
  const world = getWorld(0);
  r3d.setSky({ sky: loc.skyTop, ground: loc.ground });

  const env = buildEnvironment({
    loc,
    env: world.env,
    seed: state.locationIndex,
  });
  r3d.add(env.group);
  r3d.onFrame(env.update);

  STATIONS.forEach((def, i) => {
    const truck = createFoodtruck(world.trucks[def.id], def);
    truck.group.position.x = TRUCK_XS[i];
    const locked = state.stations[def.id].level === 0;
    truck.setLocked(locked);
    if (!locked) addWorker(truck, def);
    r3d.add(truck.group);
    trucks.set(def.id, truck);
  });

  updateLockBadges();
  r3d.onResize(updateLockBadges);
  // Sprechblasen folgen den Figurenköpfen
  r3d.onFrame(() => {
    for (const actor of actors) actor._updateBubble();
  });
}

// ---------- Personal ----------

function addWorker(truck, def) {
  const worker = createWorker(getWorld(0).trucks[def.id]);
  // Im Verkaufsfenster: Oberkörper + Kopf ragen vor der dunklen
  // Fensterplatte (z=0.74) auf, Beine stecken unsichtbar im Korpus.
  worker.group.position.set(0.35, 0.5, 0.72);
  worker.group.scale.setScalar(0.85);
  truck.mount.add(worker.group);
  truck.worker = worker;
}

// ---------- Gesperrt-Badges (DOM über gesperrten Trucks) ----------

function updateLockBadges() {
  for (const [id, truck] of trucks) {
    const locked = state.stations[id].level === 0;
    let badge = lockBadges.get(id);
    if (!locked) {
      if (badge) {
        badge.remove();
        lockBadges.delete(id);
      }
      continue;
    }
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'lock-badge';
      badge.textContent = '🔒';
      overlay.appendChild(badge);
      lockBadges.set(id, badge);
    }
    const px = r3d.project(truck.getBadgePoint());
    badge.style.left = `${px.x}px`;
    badge.style.top = `${px.y}px`;
  }
}

// ---------- Truck-Leben (Idle-Animationen) ----------

function animateTruck(truck) {
  // Schild wippt, Lüfter-Hut dreht — und das Personal arbeitet:
  // Arm hackt Richtung Tresen, Körper wippt mit.
  idleTweens.push(
    gsap.to(truck.sign.position, {
      y: truck.sign.position.y + 0.06,
      duration: 1.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }),
    gsap.to(truck.vent.rotation, {
      y: Math.PI * 2,
      duration: 3.5,
      repeat: -1,
      ease: 'none',
    })
  );
  if (truck.worker) {
    idleTweens.push(
      gsap.fromTo(
        truck.worker.armR.rotation,
        { x: -1.15 },
        { x: -0.55, duration: 0.35, repeat: -1, yoyo: true, ease: 'power1.inOut' }
      ),
      gsap.to(truck.worker.group.position, {
        y: truck.worker.group.position.y + 0.035,
        duration: 0.35,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    );
  }
}

export function startWorkerAnimations() {
  for (const [id, truck] of trucks) {
    if (state.stations[id].level > 0) animateTruck(truck);
  }
}

// Nach dem Freischalten: Farben zurück, Personal einstellen, Pop-Effekt.
export function unlockStandVisual(stationId) {
  const truck = trucks.get(stationId);
  if (!truck) return;
  truck.setLocked(false);
  if (!truck.worker) addWorker(truck, STATIONS.find((s) => s.id === stationId));
  updateLockBadges();
  animateTruck(truck);
  gsap.from(truck.group.scale, {
    x: 0.82,
    y: 0.82,
    z: 0.82,
    duration: 0.5,
    ease: 'back.out(2)',
  });
}

// ---------- Kunden als 3D-Figuren ----------

// Kürzester Dreh zum Zielwinkel (statt 270°-Pirouette)
function turnTo(group, target, duration = 0.2) {
  const cur = group.rotation.y;
  let delta = (target - cur) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  gsap.to(group.rotation, { y: cur + delta, duration, ease: 'power1.out' });
}

export function createCustomer() {
  const person = createPerson(randomCustomerVariant());
  person.group.position.set(ENTRY_X, 0, rand(2.3, 3.2));
  r3d.add(person.group);

  const bubble = document.createElement('div');
  bubble.className = 'actor-bubble';
  overlay.appendChild(bubble);
  gsap.set(bubble, {
    xPercent: -50,
    yPercent: -100,
    scale: 0,
    transformOrigin: '50% 100%',
  });

  const actor = {
    pos: person.group.position,
    dead: false,
    _bubbleShown: false,
    place(x) {
      person.group.position.x = x;
    },
    // dir: -1 = nach links laufen, 1 = nach rechts
    face(dir) {
      if (this.dead) return;
      turnTo(person.group, dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    },
    faceTruck() {
      if (this.dead) return;
      turnTo(person.group, Math.PI);
    },
    setWalking(on) {
      if (this.dead) return;
      person.setWalking(on);
    },
    showBubble(emoji, autoHideAfter = 0) {
      if (this.dead) return;
      bubble.textContent = emoji;
      this._bubbleShown = true;
      this._updateBubble();
      gsap.to(bubble, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
      if (autoHideAfter > 0) {
        gsap.to(bubble, {
          scale: 0,
          delay: autoHideAfter,
          duration: 0.15,
          onComplete: () => (this._bubbleShown = false),
        });
      }
    },
    hideBubble() {
      if (this.dead) return;
      this._bubbleShown = false;
      gsap.to(bubble, { scale: 0, duration: 0.15, ease: 'back.in(2)' });
    },
    // Pixel-x des Aktors im Overlay (für Trinkgeld-Bubbles, tips.js)
    screenX() {
      if (this.dead) return 0;
      const p = person.group.position;
      return r3d.project({ x: p.x, y: 0, z: p.z }).x;
    },
    _updateBubble() {
      if (this.dead || !this._bubbleShown) return;
      const p = person.group.position;
      const px = r3d.project({ x: p.x, y: person.height + 0.15, z: p.z });
      bubble.style.left = `${px.x}px`;
      bubble.style.top = `${px.y}px`;
    },
    _kill() {
      this.dead = true;
      gsap.killTweensOf(bubble);
      bubble.remove();
      person.group.parent?.remove(person.group);
      person.dispose();
    },
  };
  actors.add(actor);
  return actor;
}

export function removeCustomer(actor) {
  actors.delete(actor);
  actor._kill();
}

// Antippbare Trinkgeld-Bubble (Logik in systems/tips.js).
export function createTipBubble(x) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'tip-bubble';
  el.setAttribute('aria-label', 'Trinkgeld einsammeln');
  el.textContent = '💰';
  overlay.appendChild(el);
  gsap.set(el, { x, scale: 0 });
  return el;
}

// Aufsteigender "+$X"-Text als Sammel-Feedback.
export function spawnFloatingText(x, text) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  overlay.appendChild(el);
  gsap.set(el, { x });
  gsap.to(el, {
    y: -50,
    opacity: 0,
    duration: 1.1,
    ease: 'power1.out',
    onComplete: () => el.remove(),
  });
}

// Haltepunkt für Kunden: Bodenpunkt vor dem Verkaufsfenster (Welt-x).
export function getStandStop(stationId) {
  return trucks.get(stationId).getStopPoint().x;
}

// Einlauf-x der Kunden am rechten Szenenrand (Welt-x).
export function getEntryX() {
  return ENTRY_X;
}
