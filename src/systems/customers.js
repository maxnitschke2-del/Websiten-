// Kunden-System: lässt Kunden animiert zu einer zufälligen freigeschalteten
// Station laufen, kurz warten (bestellen) und wieder rausgehen. Beim
// Rausgehen feuert der Leaving-Hook (Trinkgeld, systems/tips.js).
import {
  createCustomer,
  removeCustomer,
  getStandStop,
  getEntryX,
} from '../ui/scene.js';
import { STATIONS } from '../data/stations.js';
import { state } from '../core/state.js';
import { currentLocation } from './progression.js';
import { playSound } from './sound.js';
import { rand, pick } from '../utils/format.js';

const WALK_SPEED = 110; // Pixel pro Sekunde
const SPAWN_DELAY_MIN = 2000;
const SPAWN_DELAY_MAX = 5000;

let leavingHook = null;
let activeCustomers = 0;

export function onCustomerLeaving(fn) {
  leavingHook = fn;
}

export function startCustomers() {
  schedule(1200);
}

function schedule(delay = rand(SPAWN_DELAY_MIN, SPAWN_DELAY_MAX)) {
  setTimeout(tickSpawn, delay);
}

function unlockedStations() {
  return STATIONS.filter((def) => state.stations[def.id].level > 0);
}

// Kapazität wächst mit dem Standort (maxCustomers), begrenzt auf
// maximal zwei Kunden je freigeschalteter Station.
function tickSpawn() {
  const targets = unlockedStations();
  const capacity = Math.min(targets.length * 2, currentLocation().maxCustomers);
  if (activeCustomers < capacity) {
    spawn(targets[Math.floor(Math.random() * targets.length)]);
  }
  schedule();
}

function walkDuration(from, to) {
  return Math.abs(to - from) / WALK_SPEED;
}

function spawn(stationDef) {
  activeCustomers += 1;
  const el = createCustomer(stationDef.emoji);
  const sprite = el.querySelector('.sprite');
  const bubble = el.querySelector('.bubble');
  const startX = getEntryX();
  const stopX = getStandStop(stationDef.id) - el.offsetWidth / 2 + rand(-26, 26);
  const pace = rand(0.85, 1.25); // individuelles Lauftempo

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
      activeCustomers -= 1;
    },
  });

  tl.to(el, { x: stopX, duration: walkDuration(startX, stopX) / pace, ease: 'none' })
    // Am Stand: stehen bleiben und Bestellung zeigen
    .call(() => {
      bob.pause(0);
      playSound('order');
    })
    .to(bubble, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
    .to({}, { duration: rand(1.6, 3.2) })
    .to(bubble, { scale: 0, duration: 0.15, ease: 'back.in(2)' })
    // Umdrehen und rausgehen
    .call(() => {
      if (leavingHook) leavingHook(el);
      gsap.set(sprite, { scaleX: -1 });
      bob.play();
      // manche Kunden zeigen beim Gehen, dass es geschmeckt hat
      if (Math.random() < 0.45) {
        bubble.textContent = pick(['😋', '❤️', '👍']);
        gsap.to(bubble, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
        gsap.to(bubble, { scale: 0, delay: 1.1, duration: 0.15 });
      }
    })
    .to(el, { x: startX, duration: walkDuration(stopX, startX) / pace, ease: 'none' });
}
