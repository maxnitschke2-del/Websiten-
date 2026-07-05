// Szenen-Schicht: baut die 3D-Welt (Three.js, src/render3d/) und hält
// dieselbe API wie die frühere 2D-Szene, damit customers/tips/hud
// unverändert funktionieren. Kunden + Trinkgeld-Bubbles bleiben bis
// Phase 2 DOM-Sprites in einem Overlay über dem Canvas; ihre Positionen
// kommen aus der Projektion der Truck-Positionen.
import { STATIONS } from '../data/stations.js';
import { getLocation } from '../data/locations.js';
import { getWorld } from '../data/worlds.js';
import { state } from '../core/state.js';
import { pick } from '../utils/format.js';
import { init3d } from '../render3d/scene.js';
import { createFoodtruck } from '../render3d/models/foodtruck.js';
import { buildEnvironment } from '../render3d/models/environment.js';

// Truck-Positionen auf der Plaza (x in Weltkoordinaten)
const TRUCK_XS = [-6.0, 0, 6.0];

let r3d = null;
let overlay = null;
let trucks = new Map(); // stationId -> { group, awning, sign, vent, setLocked }
let lockBadges = new Map(); // stationId -> DOM-Element
let idleTweens = [];

// ---------- Aufbau / Teardown ----------

function teardown() {
  for (const tw of idleTweens) tw.kill();
  idleTweens = [];
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
    truck.setLocked(state.stations[def.id].level === 0);
    r3d.add(truck.group);
    trucks.set(def.id, truck);
  });

  updateLockBadges();
  r3d.onResize(updateLockBadges);
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
  // Dach-Schild wippt leicht, Lüfter-Hut dreht sich: "hier wird gearbeitet".
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
    }),
    gsap.to(truck.awning.rotation, {
      x: 0.56,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  );
}

export function startWorkerAnimations() {
  for (const [id, truck] of trucks) {
    if (state.stations[id].level > 0) animateTruck(truck);
  }
}

// Nach dem Freischalten: Farben zurück, Badge weg, Pop-Effekt.
export function unlockStandVisual(stationId) {
  const truck = trucks.get(stationId);
  if (!truck) return;
  truck.setLocked(false);
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

// ---------- Kunden als DOM-Sprites (bis Phase 2) ----------

const SKIN_TONES = ['#f2c19a', '#e8b183', '#c68642', '#8d5524'];
const HAIR_COLORS = ['#5b3a1e', '#2c2c2c', '#a55728', '#e0c068', '#888'];
const HAIR_STYLES = ['round', 'round', 'cap', 'long', 'bald'];
const SHIRT_COLORS = ['#4a90d9', '#7a56c2', '#3aa76d', '#d95f4a', '#c2a13a', '#d9639b'];
const PANTS_COLORS = ['#3b4664', '#54432e', '#2f5d50', '#5a3b5d'];

function randomCustomerVariant() {
  return {
    skin: pick(SKIN_TONES),
    hairColor: pick(HAIR_COLORS),
    hairStyle: pick(HAIR_STYLES),
    shirt: pick(SHIRT_COLORS),
    pants: pick(PANTS_COLORS),
    glasses: Math.random() < 0.18,
    kid: Math.random() < 0.15,
  };
}

function hairSvg(v) {
  switch (v.hairStyle) {
    case 'bald':
      return '';
    case 'cap':
      return `<path d="M17 14 A13 13 0 0 1 43 14 Z" fill="${v.hairColor}"/>
        <rect x="9" y="11" width="15" height="5" rx="2.5" fill="${v.hairColor}"/>`;
    case 'long':
      return `<path d="M17 14 A13 13 0 0 1 43 14 Z" fill="${v.hairColor}"/>
        <rect x="37" y="12" width="8" height="24" rx="4" fill="${v.hairColor}"/>`;
    default:
      return `<path d="M17 13.5 A13 13 0 0 1 43 13.5 Z" fill="${v.hairColor}"/>`;
  }
}

function customerSvg(v) {
  const glasses = v.glasses
    ? `<circle cx="21" cy="16" r="3.6" fill="none" stroke="#333" stroke-width="1.4"/>
       <circle cx="29" cy="16" r="3.6" fill="none" stroke="#333" stroke-width="1.4"/>`
    : '';
  return `
<svg class="sprite" viewBox="0 0 60 96" xmlns="http://www.w3.org/2000/svg" aria-label="Kunde">
  <circle cx="30" cy="16" r="13" fill="${v.skin}"/>
  ${hairSvg(v)}
  <circle cx="21" cy="16" r="1.8" fill="#333"/>
  <circle cx="26" cy="16" r="1.8" fill="#333"/>
  ${glasses}
  <rect x="16" y="28" width="28" height="38" rx="10" fill="${v.shirt}"/>
  <rect x="20" y="64" width="8" height="24" rx="3" fill="${v.pants}"/>
  <rect x="32" y="64" width="8" height="24" rx="3" fill="${v.pants}"/>
  <rect x="15" y="85" width="13" height="6" rx="3" fill="#222"/>
  <rect x="32" y="85" width="13" height="6" rx="3" fill="#222"/>
</svg>`;
}

export function createCustomer(orderEmoji) {
  const el = document.createElement('div');
  el.className = 'customer';
  const variant = randomCustomerVariant();
  if (variant.kid) el.classList.add('kid');
  el.innerHTML = customerSvg(variant) + `<div class="bubble">${orderEmoji}</div>`;
  overlay.appendChild(el);
  gsap.set(el.querySelector('.bubble'), { xPercent: -50, scale: 0 });
  return el;
}

export function removeCustomer(el) {
  el.remove();
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

// Haltepunkt für Kunden: Bodenpunkt vor dem Verkaufsfenster des Trucks,
// in Overlay-Pixel projiziert.
export function getStandStop(stationId) {
  const truck = trucks.get(stationId);
  return r3d.project(truck.getStopPoint()).x;
}

export function getEntryX() {
  return overlay.clientWidth + 60;
}
