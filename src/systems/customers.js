// Kunden-System: lässt 3D-Kunden zu einer zufälligen freigeschalteten
// Station laufen, kurz warten (bestellen) und wieder rausgehen. Beim
// Rausgehen feuert der Leaving-Hook (Trinkgeld, systems/tips.js).
// Bewegung seit Phase 2 in Welt-Koordinaten (Three.js), nicht Pixeln.
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

const WALK_SPEED = 2.4; // Welt-Einheiten pro Sekunde
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
  const actor = createCustomer();
  // Kunden kommen zufällig von links oder rechts
  const startX = (Math.random() < 0.5 ? 1 : -1) * getEntryX();
  const stopX = getStandStop(stationDef.id) + rand(-0.7, 0.7);
  const pace = rand(0.85, 1.25); // individuelles Lauftempo

  actor.place(startX);
  actor.face(stopX > startX ? 1 : -1);
  actor.setWalking(true);

  const tl = gsap.timeline({
    onComplete() {
      removeCustomer(actor);
      activeCustomers -= 1;
    },
  });

  tl.to(actor.pos, { x: stopX, duration: walkDuration(startX, stopX) / pace, ease: 'none' })
    // Am Truck: stehen bleiben, zum Fenster drehen, Bestellung zeigen
    .call(() => {
      actor.setWalking(false);
      actor.faceTruck();
      playSound('order');
      actor.showBubble(stationDef.emoji);
    })
    .to({}, { duration: rand(1.6, 3.2) })
    .call(() => actor.hideBubble())
    .to({}, { duration: 0.2 })
    // Umdrehen und rausgehen
    .call(() => {
      if (leavingHook) leavingHook(actor);
      actor.face(startX > stopX ? 1 : -1);
      actor.setWalking(true);
      // manche Kunden zeigen beim Gehen, dass es geschmeckt hat
      if (Math.random() < 0.45) {
        actor.showBubble(pick(['😋', '❤️', '👍']), 1.1);
      }
    })
    .to(actor.pos, { x: startX, duration: walkDuration(stopX, startX) / pace, ease: 'none' });
}
