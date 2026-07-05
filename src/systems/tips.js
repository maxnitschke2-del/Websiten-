// Trinkgeld-System (Tap-to-Collect): Kunden hinterlassen beim Rausgehen
// eine antippbare Trinkgeld-Bubble als Bonus-Einnahme. Bewusst getrennt
// vom passiven Idle-Einkommen (systems/production.js).
import { state } from '../core/state.js';
import { totalIncomePerSecond } from './production.js';
import { onCustomerLeaving } from './customers.js';
import { createTipBubble, spawnFloatingText } from '../ui/scene.js';
import { formatMoney, rand } from '../utils/format.js';

const TIP_INCOME_SECONDS = 12; // Trinkgeld ≈ 12 s passives Einkommen
const TIP_MIN = 2;
const BUBBLE_LIFETIME = 12; // s, danach verfällt eine nicht angetippte Bubble
const MAX_BUBBLES = 5;

let activeBubbles = 0;

export function initTips() {
  onCustomerLeaving((customerEl) => {
    if (activeBubbles >= MAX_BUBBLES) return;
    dropTip(customerEl);
  });
}

function tipAmount() {
  return Math.max(TIP_MIN, Math.round(totalIncomePerSecond() * TIP_INCOME_SECONDS));
}

function dropTip(customerEl) {
  activeBubbles += 1;
  const x = gsap.getProperty(customerEl, 'x') + rand(-24, 24);
  const bubble = createTipBubble(x);
  let collected = false;

  gsap.to(bubble, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' });
  const bob = gsap.to(bubble, {
    y: -6,
    duration: 0.7,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 0.35,
  });

  const expire = gsap.delayedCall(BUBBLE_LIFETIME, () => {
    release();
    gsap.to(bubble, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'back.in(2)',
      onComplete: () => bubble.remove(),
    });
  });

  bubble.addEventListener('pointerdown', () => {
    if (collected) return;
    collected = true;
    expire.kill();
    release();

    const amount = tipAmount();
    state.money += amount;
    state.tipsCollected += 1;
    spawnFloatingText(x, `+$${formatMoney(amount)}`);
    gsap.to(bubble, {
      scale: 1.6,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => bubble.remove(),
    });
  });

  function release() {
    activeBubbles -= 1;
    bob.kill();
  }
}
