// Kunden-System: lässt Kunden animiert zum Stand laufen, kurz warten
// (bestellen) und wieder rausgehen. In Phase 1 rein visuell — ab Phase 2
// hängt sich das Trinkgeld-System (systems/tips.js) an den Leaving-Hook.
import { createCustomer, removeCustomer, getWalkPositions } from '../ui/scene.js';
import { rand } from '../utils/format.js';

const WALK_SPEED = 110; // Pixel pro Sekunde
const SPAWN_DELAY_MIN = 2500;
const SPAWN_DELAY_MAX = 6000;

let leavingHook = null;

export function onCustomerLeaving(fn) {
  leavingHook = fn;
}

export function startCustomers() {
  schedule(1200);
}

function schedule(delay = rand(SPAWN_DELAY_MIN, SPAWN_DELAY_MAX)) {
  setTimeout(spawn, delay);
}

function walkDuration(from, to) {
  return Math.abs(to - from) / WALK_SPEED;
}

function spawn() {
  const el = createCustomer();
  const sprite = el.querySelector('.sprite');
  const bubble = el.querySelector('.bubble');
  const { startX, counterX, exitX } = getWalkPositions();

  gsap.set(el, { x: startX });
  const bob = gsap.to(sprite, {
    y: -4,
    duration: 0.16,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  const tl = gsap.timeline({
    onComplete() {
      bob.kill();
      removeCustomer(el);
      schedule();
    },
  });

  tl.to(el, { x: counterX, duration: walkDuration(startX, counterX), ease: 'none' })
    // Am Stand: stehen bleiben und Bestellung zeigen
    .call(() => bob.pause(0))
    .to(bubble, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
    .to({}, { duration: rand(1.6, 3.2) })
    .to(bubble, { scale: 0, duration: 0.15, ease: 'back.in(2)' })
    // Umdrehen und rausgehen
    .call(() => {
      if (leavingHook) leavingHook(el);
      gsap.set(sprite, { scaleX: -1 });
      bob.play();
    })
    .to(el, { x: exitX, duration: walkDuration(counterX, exitX), ease: 'none' });
}
