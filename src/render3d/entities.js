import * as THREE from 'three';
import { gsap } from 'gsap';
import { buildPerson } from './models/people.js';
import { STREET_Z } from './models/worldBuilder.js';
import { tipValue, TIP_COIN_LIFETIME, MAX_TIP_COINS } from '../systems/tips.js';

// Verwaltet die belebte Szene: Personal arbeitet sichtbar an den Stationen,
// Kunden laufen animiert rein/raus und hinterlassen dezente Trinkgeld-Münzen.
// Bekommt die 3D-Details, kennt aber keine Spiel-Logik – die kommt über hooks.
export function createEntitySystem(scene, camera, domElement, palette, layout, hooks) {
  const worldGroup = hooks.worldGroup;

  const workers = {}; // stationId -> { group, arms }
  const customers = new Set();
  const coins = new Set();

  const ENTER_X = -9.5;
  const EXIT_X = 9.5;

  // ---------- Personal ----------
  function addWorker(stationId) {
    if (workers[stationId]) return;
    const slot = layout.find((s) => s.id === stationId);
    if (!slot) return;

    const person = buildPerson({
      bodyColor: 0xffffff,
      apronColor: palette.workerColor,
      hatColor: 0xffffff
    });
    person.group.position.set(slot.x, 0, slot.workerZ);
    worldGroup.add(person.group);
    workers[stationId] = person;

    // Dauerhafte, leicht versetzte Arbeitsbewegung der Arme ("hantieren")
    const startArmLoop = (shoulder, delay) => {
      gsap.to(shoulder.rotation, {
        x: -1.15,
        duration: 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay
      });
    };
    startArmLoop(person.arms.right, Math.random() * 0.4);
    startArmLoop(person.arms.left, 0.25 + Math.random() * 0.4);

    // sanftes Wippen des ganzen Körpers
    gsap.to(person.group.position, {
      y: 0.04,
      duration: 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 0.5
    });
  }

  // ---------- Kunden ----------
  function spawnCustomer() {
    const openStations = layout.filter((s) => hooks.isUnlocked(s.id));
    if (openStations.length === 0) return;
    const target = openStations[Math.floor(Math.random() * openStations.length)];

    const person = buildPerson({
      bodyColor:
        palette.customerColors[
          Math.floor(Math.random() * palette.customerColors.length)
        ]
    });
    const g = person.group;
    g.position.set(ENTER_X, 0, STREET_Z);
    g.rotation.y = Math.PI / 2; // nach rechts blickend
    worldGroup.add(g);
    customers.add(g);

    // Geh-Wippen, solange der Kunde unterwegs ist
    const bob = gsap.to(g.position, {
      y: 0.05,
      duration: 0.28,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    const tl = gsap.timeline({
      onComplete: () => {
        bob.kill();
        worldGroup.remove(g);
        customers.delete(g);
      }
    });
    // Referenzen für sauberes Aufräumen beim Welt-Wechsel merken.
    g.userData.bob = bob;
    g.userData.tl = tl;

    // rein zur Theke
    tl.to(g.position, {
      x: target.x,
      z: target.customerZ,
      duration: 1.6,
      ease: 'power1.inOut',
      onStart: () => {
        g.rotation.y = Math.PI / 2;
      }
    });
    // an der Theke: zum Tresen drehen, kurz warten (Bestellung)
    tl.call(() => {
      g.rotation.y = Math.PI; // zur Theke (Richtung -z)
    });
    tl.to({}, { duration: 1.2 });
    // Trinkgeld hinterlassen und weiterlaufen
    tl.call(() => {
      dropCoin(target.x, target.customerZ);
      g.rotation.y = Math.PI / 2;
    });
    tl.to(g.position, {
      x: EXIT_X,
      z: STREET_Z,
      duration: 1.6,
      ease: 'power1.in'
    });
  }

  // ---------- Trinkgeld-Münzen ----------
  const coinGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffd23f,
    roughness: 0.35,
    metalness: 0.7,
    emissive: 0x5a4600,
    emissiveIntensity: 0.25
  });

  function dropCoin(x, z) {
    if (coins.size >= MAX_TIP_COINS) return;
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.castShadow = true;
    coin.rotation.x = Math.PI / 2; // flach liegend, Fläche zur Kamera gekippt
    coin.position.set(x + (Math.random() - 0.5) * 0.5, 0.55, z + 0.15);
    coin.scale.setScalar(0.01);
    coin.userData.value = tipValue(hooks.getIncomePerSec());
    coin.userData.alive = true;
    worldGroup.add(coin);
    coins.add(coin);

    gsap.to(coin.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'back.out(2)' });
    // dezentes Schweben + Drehen, damit sie auffällt ohne aufdringlich zu sein
    gsap.to(coin.position, {
      y: 0.72,
      duration: 0.9,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
    gsap.to(coin.rotation, { z: Math.PI * 2, duration: 2.4, ease: 'none', repeat: -1 });

    // Lebensdauer: nach Ablauf sanft ausblenden
    coin.userData.timeout = setTimeout(() => removeCoin(coin, false), TIP_COIN_LIFETIME * 1000);
  }

  function removeCoin(coin, collected) {
    if (!coin.userData.alive) return;
    coin.userData.alive = false;
    clearTimeout(coin.userData.timeout);
    gsap.killTweensOf(coin.position);
    gsap.killTweensOf(coin.rotation);
    coins.delete(coin);

    if (collected) {
      gsap.to(coin.position, { y: 1.6, duration: 0.4, ease: 'power2.out' });
      gsap.to(coin.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => worldGroup.remove(coin)
      });
    } else {
      gsap.to(coin.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => worldGroup.remove(coin)
      });
    }
  }

  // ---------- Tap-to-Collect ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onTap(e) {
    const rect = domElement.getBoundingClientRect();
    const cx = e.clientX ?? (e.changedTouches && e.changedTouches[0].clientX);
    const cy = e.clientY ?? (e.changedTouches && e.changedTouches[0].clientY);
    if (cx == null) return;
    pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...coins], false);
    if (hits.length > 0) {
      const coin = hits[0].object;
      if (coin.userData.alive) {
        hooks.onTip(coin.userData.value, coin.getWorldPosition(new THREE.Vector3()));
        removeCoin(coin, true);
      }
    }
  }
  domElement.addEventListener('pointerdown', onTap);

  // ---------- Kunden-Spawn-Takt ----------
  let spawnAcc = 0;
  const MAX_CUSTOMERS = 6;

  function update(dt) {
    spawnAcc += dt;
    // Spawnrate steigt leicht mit dem Einkommen (mehr Betrieb = mehr los)
    const interval = Math.max(0.9, 2.6 - Math.log10(hooks.getIncomePerSec() + 1) * 0.25);
    if (spawnAcc >= interval && customers.size < MAX_CUSTOMERS) {
      spawnAcc = 0;
      spawnCustomer();
    }
  }

  // Räumt Tweens, Timeouts und den Tap-Listener beim Welt-Wechsel auf.
  // Die Meshes selbst hängen an worldGroup und werden dort disposed.
  function dispose() {
    domElement.removeEventListener('pointerdown', onTap);
    for (const id in workers) {
      const w = workers[id];
      gsap.killTweensOf(w.group.position);
      gsap.killTweensOf(w.arms.left.rotation);
      gsap.killTweensOf(w.arms.right.rotation);
    }
    for (const g of customers) {
      if (g.userData.tl) g.userData.tl.kill();
      if (g.userData.bob) g.userData.bob.kill();
      gsap.killTweensOf(g.position);
    }
    for (const coin of coins) {
      clearTimeout(coin.userData.timeout);
      gsap.killTweensOf(coin.position);
      gsap.killTweensOf(coin.rotation);
      gsap.killTweensOf(coin.scale);
    }
    customers.clear();
    coins.clear();
  }

  return { addWorker, update, dispose };
}
