// Baut die 2D-Restaurant-Szene: Kulisse, Stand mit Personal-Sprite,
// und liefert die Fabrik + Laufpositionen für Kunden-Sprites.

let scene;

const AWNING_STRIPES = 8;

function awningSvg() {
  const x0 = 16;
  const width = 248;
  const stripeW = width / AWNING_STRIPES;
  let stripes = '';
  let scallops = '';
  for (let i = 0; i < AWNING_STRIPES; i++) {
    const color = i % 2 === 0 ? '#e23b3b' : '#fff';
    stripes += `<rect x="${x0 + i * stripeW}" y="14" width="${stripeW}" height="34" fill="${color}" clip-path="url(#awning-clip)"/>`;
    scallops += `<ellipse cx="${x0 + stripeW / 2 + i * stripeW}" cy="48" rx="${stripeW / 2}" ry="9" fill="${color}"/>`;
  }
  return `
    <defs><clipPath id="awning-clip"><rect x="${x0}" y="14" width="${width}" height="34" rx="10"/></clipPath></defs>
    <g id="awning">${scallops}${stripes}</g>`;
}

const STAND_SVG = `
<svg viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg" aria-label="Burger-Stand">
  <!-- Pfosten -->
  <rect x="30" y="40" width="8" height="100" rx="3" fill="#8a5a2b"/>
  <rect x="242" y="40" width="8" height="100" rx="3" fill="#8a5a2b"/>

  <!-- Personal-Sprite (steht hinter der Theke) -->
  <g id="worker" transform="translate(105 62)">
    <g id="worker-body">
      <rect x="8" y="26" width="36" height="40" rx="10" fill="#e23b3b"/>
      <rect x="14" y="34" width="24" height="32" rx="5" fill="#fff5e6"/>
      <circle cx="26" cy="12" r="13" fill="#f2c19a"/>
      <circle cx="30" cy="11" r="1.8" fill="#333"/>
      <circle cx="35" cy="11" r="1.8" fill="#333"/>
      <path d="M13 4 A13 13 0 0 1 39 4 Z" fill="#fff"/>
      <rect x="12" y="1" width="28" height="7" rx="3.5" fill="#fff"/>
    </g>
    <g id="worker-arm">
      <rect x="41" y="30" width="7" height="20" rx="3.5" fill="#f2c19a"/>
      <rect x="43" y="48" width="4" height="12" fill="#666"/>
      <rect x="37" y="58" width="16" height="7" rx="2" fill="#999"/>
    </g>
  </g>

  <!-- Dampf überm Grill -->
  <g id="steam">
    <circle class="steam-puff" cx="165" cy="102" r="6" fill="#fff" opacity="0"/>
    <circle class="steam-puff" cx="176" cy="105" r="4.5" fill="#fff" opacity="0"/>
    <circle class="steam-puff" cx="156" cy="106" r="4" fill="#fff" opacity="0"/>
  </g>

  <!-- Theke -->
  <rect x="34" y="126" width="212" height="66" rx="8" fill="#b45f24"/>
  <rect x="42" y="134" width="196" height="50" rx="6" fill="#a05320"/>
  <rect x="26" y="116" width="228" height="14" rx="7" fill="#d98e4a"/>

  <!-- Grill auf der Theke -->
  <rect x="148" y="106" width="46" height="12" rx="3" fill="#444"/>
  <text x="162" y="106" font-size="14">🍔</text>

  <!-- Schild -->
  <rect x="96" y="140" width="88" height="38" rx="8" fill="#fff8ec"/>
  <text x="140" y="157" text-anchor="middle" font-size="13" font-weight="bold" fill="#7a4a21" font-family="sans-serif">BURGER</text>
  <text x="140" y="172" text-anchor="middle" font-size="11">🍔🍟</text>

  <!-- Räder -->
  <circle cx="72" cy="198" r="15" fill="#333"/>
  <circle cx="72" cy="198" r="6" fill="#777"/>
  <circle cx="208" cy="198" r="15" fill="#333"/>
  <circle cx="208" cy="198" r="6" fill="#777"/>

  ${awningSvg()}
</svg>`;

const SHIRT_COLORS = ['#4a90d9', '#7a56c2', '#3aa76d', '#d95f4a', '#c2a13a'];

function customerSvg(shirt) {
  return `
<svg class="sprite" viewBox="0 0 60 96" xmlns="http://www.w3.org/2000/svg" aria-label="Kunde">
  <path d="M17 15 A13 13 0 0 1 43 15 Z" fill="#5b3a1e"/>
  <circle cx="30" cy="16" r="13" fill="#f2c19a"/>
  <path d="M17 12 A13 13 0 0 1 43 12 L43 15 A13 10 0 0 0 17 15 Z" fill="#5b3a1e"/>
  <circle cx="21" cy="16" r="1.8" fill="#333"/>
  <circle cx="26" cy="16" r="1.8" fill="#333"/>
  <rect x="16" y="28" width="28" height="38" rx="10" fill="${shirt}"/>
  <rect x="20" y="64" width="8" height="24" rx="3" fill="#3b4664"/>
  <rect x="32" y="64" width="8" height="24" rx="3" fill="#3b4664"/>
  <rect x="15" y="85" width="13" height="6" rx="3" fill="#222"/>
  <rect x="32" y="85" width="13" height="6" rx="3" fill="#222"/>
</svg>`;
}

export function buildScene(root) {
  scene = root;
  scene.innerHTML = `
    <div class="scene-sun"></div>
    <div class="scene-building" style="left:2%; width:13%; height:36%;"></div>
    <div class="scene-building" style="left:17%; width:9%; height:27%;"></div>
    <div class="scene-building" style="left:68%; width:14%; height:32%;"></div>
    <div class="scene-building" style="left:85%; width:11%; height:24%;"></div>
    <div class="scene-ground"></div>
    <div class="stand">${STAND_SVG}</div>
  `;
}

export function startWorkerAnimation() {
  // Das Personal "arbeitet": Arm mit Pfannenwender wippt, Körper wippt mit.
  gsap.to('#worker-arm', {
    rotation: -28,
    transformOrigin: '50% 15%',
    duration: 0.35,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
  });
  gsap.to('#worker-body', {
    y: -2,
    duration: 0.35,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
  scene.querySelectorAll('.steam-puff').forEach((puff, i) => {
    gsap.to(puff, {
      keyframes: { y: [0, -30], opacity: [0, 0.65, 0] },
      duration: 1.8,
      repeat: -1,
      delay: i * 0.6,
      ease: 'sine.out',
    });
  });
}

export function createCustomer() {
  const el = document.createElement('div');
  el.className = 'customer';
  const shirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  el.innerHTML = customerSvg(shirt) + '<div class="bubble">🍔</div>';
  scene.appendChild(el);
  gsap.set(el.querySelector('.bubble'), { xPercent: -50, scale: 0 });
  return el;
}

export function removeCustomer(el) {
  el.remove();
}

// Laufpunkte für Kunden: kommen von rechts, halten rechts neben dem Stand.
export function getWalkPositions() {
  const standEl = scene.querySelector('.stand');
  const startX = scene.clientWidth + 60;
  const counterX = standEl.offsetLeft + standEl.offsetWidth + 6;
  return { startX, counterX, exitX: startX };
}
