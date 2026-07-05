// Baut die 2D-Restaurant-Szene: Kulisse, Stände mit Personal-Sprites,
// und liefert Fabriken + Laufpositionen für Kunden-Sprites.
import { STATIONS } from '../data/stations.js';
import { getLocation } from '../data/locations.js';
import { state } from '../core/state.js';
import { pick } from '../utils/format.js';

let scene;

const AWNING_STRIPES = 8;
const STAND_LEFTS = ['3%', '37.5%', '71%'];

function awningSvg(def) {
  const x0 = 16;
  const width = 248;
  const stripeW = width / AWNING_STRIPES;
  const clipId = `awning-clip-${def.id}`;
  let stripes = '';
  let scallops = '';
  for (let i = 0; i < AWNING_STRIPES; i++) {
    const color = i % 2 === 0 ? def.theme.awning : '#fff';
    stripes += `<rect x="${x0 + i * stripeW}" y="14" width="${stripeW}" height="34" fill="${color}" clip-path="url(#${clipId})"/>`;
    scallops += `<ellipse cx="${x0 + stripeW / 2 + i * stripeW}" cy="48" rx="${stripeW / 2}" ry="9" fill="${color}"/>`;
  }
  return `
    <defs><clipPath id="${clipId}"><rect x="${x0}" y="14" width="${width}" height="34" rx="10"/></clipPath></defs>
    <g class="awning">${scallops}${stripes}</g>`;
}

function standSvg(def) {
  return `
<svg viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg" aria-label="${def.name}">
  <!-- Pfosten -->
  <rect x="30" y="40" width="8" height="100" rx="3" fill="#8a5a2b"/>
  <rect x="242" y="40" width="8" height="100" rx="3" fill="#8a5a2b"/>

  <!-- Personal-Sprite (steht hinter der Theke) -->
  <g class="worker-g" transform="translate(105 62)">
    <g class="worker-body">
      <rect x="8" y="26" width="36" height="40" rx="10" fill="${def.theme.shirt}"/>
      <rect x="14" y="34" width="24" height="32" rx="5" fill="#fff5e6"/>
      <circle cx="26" cy="12" r="13" fill="#f2c19a"/>
      <circle cx="30" cy="11" r="1.8" fill="#333"/>
      <circle cx="35" cy="11" r="1.8" fill="#333"/>
      <path d="M13 4 A13 13 0 0 1 39 4 Z" fill="#fff"/>
      <rect x="12" y="1" width="28" height="7" rx="3.5" fill="#fff"/>
    </g>
    <g class="worker-arm">
      <rect x="41" y="30" width="7" height="20" rx="3.5" fill="#f2c19a"/>
      <rect x="43" y="48" width="4" height="12" fill="#666"/>
      <rect x="37" y="58" width="16" height="7" rx="2" fill="#999"/>
    </g>
  </g>

  <!-- Dampf über der Arbeitsfläche -->
  <g class="steam">
    <circle class="steam-puff" cx="165" cy="102" r="6" fill="#fff" opacity="0"/>
    <circle class="steam-puff" cx="176" cy="105" r="4.5" fill="#fff" opacity="0"/>
    <circle class="steam-puff" cx="156" cy="106" r="4" fill="#fff" opacity="0"/>
  </g>

  <!-- Theke -->
  <rect x="34" y="126" width="212" height="66" rx="8" fill="#b45f24"/>
  <rect x="42" y="134" width="196" height="50" rx="6" fill="#a05320"/>
  <rect x="26" y="116" width="228" height="14" rx="7" fill="#d98e4a"/>

  <!-- Arbeitsfläche mit Produkt -->
  <rect x="148" y="106" width="46" height="12" rx="3" fill="#444"/>
  <text x="162" y="106" font-size="14">${def.emoji}</text>

  <!-- Schild -->
  <rect x="96" y="140" width="88" height="38" rx="8" fill="#fff8ec"/>
  <text x="140" y="157" text-anchor="middle" font-size="13" font-weight="bold" fill="#7a4a21" font-family="sans-serif">${def.sign}</text>
  <text x="140" y="172" text-anchor="middle" font-size="11">${def.emoji}</text>

  <!-- Räder -->
  <circle cx="72" cy="198" r="15" fill="#333"/>
  <circle cx="72" cy="198" r="6" fill="#777"/>
  <circle cx="208" cy="198" r="15" fill="#333"/>
  <circle cx="208" cy="198" r="6" fill="#777"/>

  ${awningSvg(def)}
</svg>`;
}

// Kunden-Varianten: Hautton, Frisur, Kleidung, Brille, Kinder.
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
      // Basecap mit Schirm (Blickrichtung links)
      return `<path d="M17 14 A13 13 0 0 1 43 14 Z" fill="${v.hairColor}"/>
        <rect x="9" y="11" width="15" height="5" rx="2.5" fill="${v.hairColor}"/>`;
    case 'long':
      // lange Haare fallen hinten (rechts) herunter
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

// Standort-Optik: Theme-Farben als CSS-Variablen auf die Szene legen.
function applyLocationTheme() {
  const theme = getLocation(state.locationIndex).theme;
  scene.style.setProperty('--sky-top', theme.skyTop);
  scene.style.setProperty('--sky-bottom', theme.skyBottom);
  scene.style.setProperty('--ground', theme.ground);
  scene.style.setProperty('--ground-dark', theme.groundDark);
  scene.style.setProperty('--building', theme.building);
}

export function buildScene(root) {
  scene = root;
  applyLocationTheme();
  const stands = STATIONS.map((def, i) => {
    const locked = state.stations[def.id].level === 0;
    return `
      <div class="stand${locked ? ' locked' : ''}" data-station="${def.id}" style="left:${STAND_LEFTS[i]}">
        ${standSvg(def)}
        <div class="stand-lock">🔒</div>
      </div>`;
  }).join('');

  scene.innerHTML = `
    <div class="scene-sun"></div>
    <div class="scene-building" style="left:2%; width:13%; height:36%;"></div>
    <div class="scene-building" style="left:17%; width:9%; height:27%;"></div>
    <div class="scene-building" style="left:55%; width:11%; height:31%;"></div>
    <div class="scene-building" style="left:86%; width:11%; height:24%;"></div>
    <div class="scene-ground"></div>
    ${stands}
  `;
}

function animateWorker(standEl) {
  // Das Personal "arbeitet": Arm mit Werkzeug wippt, Körper wippt mit.
  gsap.to(standEl.querySelector('.worker-arm'), {
    rotation: -28,
    transformOrigin: '50% 15%',
    duration: 0.35,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
  });
  gsap.to(standEl.querySelector('.worker-body'), {
    y: -2,
    duration: 0.35,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
  standEl.querySelectorAll('.steam-puff').forEach((puff, i) => {
    gsap.to(puff, {
      keyframes: { y: [0, -30], opacity: [0, 0.65, 0] },
      duration: 1.8,
      repeat: -1,
      delay: i * 0.6,
      ease: 'sine.out',
    });
  });
}

export function startWorkerAnimations() {
  scene.querySelectorAll('.stand:not(.locked)').forEach(animateWorker);
}

// Nach dem Freischalten: Stand einfärben und Personal loslegen lassen.
export function unlockStandVisual(stationId) {
  const standEl = scene.querySelector(`.stand[data-station="${stationId}"]`);
  if (!standEl || !standEl.classList.contains('locked')) return;
  standEl.classList.remove('locked');
  animateWorker(standEl);
  gsap.from(standEl, { scale: 0.85, duration: 0.5, ease: 'back.out(2)' });
}

export function createCustomer(orderEmoji) {
  const el = document.createElement('div');
  el.className = 'customer';
  const variant = randomCustomerVariant();
  if (variant.kid) el.classList.add('kid');
  el.innerHTML = customerSvg(variant) + `<div class="bubble">${orderEmoji}</div>`;
  scene.appendChild(el);
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
  scene.appendChild(el);
  gsap.set(el, { x, scale: 0 });
  return el;
}

// Aufsteigender "+$X"-Text als Sammel-Feedback.
export function spawnFloatingText(x, text) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  scene.appendChild(el);
  gsap.set(el, { x });
  gsap.to(el, {
    y: -50,
    opacity: 0,
    duration: 1.1,
    ease: 'power1.out',
    onComplete: () => el.remove(),
  });
}

// Haltepunkt für Kunden: mittig vor dem jeweiligen Stand.
export function getStandStop(stationId) {
  const standEl = scene.querySelector(`.stand[data-station="${stationId}"]`);
  return standEl.offsetLeft + standEl.offsetWidth / 2;
}

export function getEntryX() {
  return scene.clientWidth + 60;
}
