import * as THREE from 'three';
import { gsap } from 'gsap';
import { buildPerson } from './models/people.js';
import { STREET_Z, TRUCK_Z, box, cylinder, sphere } from './models/worldBuilder.js';
import { tipValue, TIP_COIN_LIFETIME, MAX_TIP_COINS } from '../systems/tips.js';

// Verwaltet die belebte Szene: Personal arbeitet sichtbar an den Stationen,
// Kunden laufen animiert rein/raus und hinterlassen dezente Trinkgeld-Münzen.
// Bekommt die 3D-Details, kennt aber keine Spiel-Logik – die kommt über hooks.
export function createEntitySystem(scene, camera, domElement, palette, layout, hooks) {
  const worldGroup = hooks.worldGroup;

  const workers = {}; // stationId -> { group, arms }
  const customers = new Set();
  const coins = new Set();
  const waiters = new Set();
  const foods = new Set();

  // Tische mit Belegungsstatus (aus dem Welt-Aufbau).
  const tables = (hooks.tableLayout || []).map((t) => ({ ...t, occupied: false }));

  const ENTER_X = -9.5;
  const EXIT_X = 9.5;
  const WAITER_HOME_Z = TRUCK_Z + 1.6;

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

  // Kontinuierliches Geh-Wippen (Basis y=0).
  function walkBob(g) {
    return gsap.to(g.position, {
      y: 0.05,
      duration: 0.28,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  function randomCustomer() {
    return buildPerson({
      bodyColor:
        palette.customerColors[
          Math.floor(Math.random() * palette.customerColors.length)
        ]
    });
  }

  function freeTable() {
    const free = tables.filter((t) => !t.occupied);
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  // ---------- Kunden ----------
  // Ist ein Tisch frei, setzt sich der Kunde und wird bedient; sonst
  // holt er sich das Essen an der Theke (Takeaway-Fallback bei vollem Lokal).
  function spawnCustomer() {
    const openStations = layout.filter((s) => hooks.isUnlocked(s.id));
    if (openStations.length === 0) return;
    const table = freeTable();
    if (table) spawnSeatedCustomer(table);
    else spawnTakeawayCustomer(openStations);
  }

  function spawnSeatedCustomer(table) {
    table.occupied = true;
    const person = randomCustomer();
    const g = person.group;
    g.position.set(ENTER_X, 0, STREET_Z);
    g.rotation.y = Math.PI / 2;
    worldGroup.add(g);
    customers.add(g);

    let bob = walkBob(g);
    const tl = gsap.timeline({
      onComplete: () => {
        if (g.userData.bob) g.userData.bob.kill();
        worldGroup.remove(g);
        customers.delete(g);
        table.occupied = false;
      }
    });
    g.userData.bob = bob;
    g.userData.tl = tl;

    // reinlaufen bis auf Höhe des Tisches, dann zum Sitzplatz treten
    tl.to(g.position, { x: table.x, z: STREET_Z, duration: 1.0, ease: 'power1.out' });
    tl.call(() => { g.rotation.y = Math.PI; });
    tl.to(g.position, { z: table.seatZ, duration: 0.6, ease: 'power1.inOut' });

    // hinsetzen: Geh-Wippen stoppen, absenken, Kellner losschicken
    tl.call(() => {
      bob.kill();
      g.userData.bob = null;
      dispatchWaiter(table);
    });
    tl.to(g.position, { y: -0.35, duration: 0.3, ease: 'power1.in' });

    // warten bis das Essen serviert ist
    tl.to({}, { duration: SERVE_DURATION });

    // essen: kleines Auf-und-Ab
    tl.to(g.position, {
      y: -0.28,
      duration: 0.22,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 5
    });

    // aufstehen, Essen abräumen, Trinkgeld hinterlassen, rausgehen
    tl.to(g.position, { y: 0, duration: 0.28, ease: 'power1.out' });
    tl.call(() => {
      removeFood(table);
      dropCoin(table.x, table.seatZ - 0.2);
      g.rotation.y = Math.PI / 2;
      g.userData.bob = walkBob(g);
    });
    tl.to(g.position, { z: STREET_Z, duration: 0.6, ease: 'power1.inOut' });
    tl.to(g.position, { x: EXIT_X, duration: 1.4, ease: 'power1.in' });
  }

  function spawnTakeawayCustomer(openStations) {
    const target = openStations[Math.floor(Math.random() * openStations.length)];
    const person = randomCustomer();
    const g = person.group;
    g.position.set(ENTER_X, 0, STREET_Z);
    g.rotation.y = Math.PI / 2;
    worldGroup.add(g);
    customers.add(g);

    const bob = walkBob(g);
    const tl = gsap.timeline({
      onComplete: () => {
        bob.kill();
        worldGroup.remove(g);
        customers.delete(g);
      }
    });
    g.userData.bob = bob;
    g.userData.tl = tl;

    tl.to(g.position, {
      x: target.x,
      z: target.customerZ,
      duration: 1.6,
      ease: 'power1.inOut'
    });
    tl.call(() => { g.rotation.y = Math.PI; });
    tl.to({}, { duration: 1.2 });
    tl.call(() => {
      dropCoin(target.x, target.customerZ);
      g.rotation.y = Math.PI / 2;
    });
    tl.to(g.position, { x: EXIT_X, z: STREET_Z, duration: 1.6, ease: 'power1.in' });
  }

  // ---------- Kellner (Servieren) ----------
  const SERVE_WALK = 1.5;
  const SERVE_ACT = 0.5;
  const SERVE_DURATION = SERVE_WALK + SERVE_ACT; // bis das Essen am Tisch steht

  function dispatchWaiter(table) {
    const waiter = buildPerson({
      bodyColor: 0xffffff,
      apronColor: palette.workerColor,
      hatColor: 0xffffff
    });
    const g = waiter.group;
    const homeX = table.x < 0 ? -1.2 : 1.2;
    g.position.set(homeX, 0, WAITER_HOME_Z);
    g.rotation.y = 0;
    // Tablett in der Hand
    const tray = buildFoodPlate();
    tray.position.set(0.28, 0.7, 0.2);
    g.add(tray);
    worldGroup.add(g);
    waiters.add(g);

    const bob = walkBob(g);
    const tl = gsap.timeline({
      onComplete: () => {
        bob.kill();
        worldGroup.remove(g);
        waiters.delete(g);
      }
    });
    g.userData.bob = bob;
    g.userData.tl = tl;

    // zum Serveplatz laufen (Truck-Seite des Tisches)
    tl.to(g.position, {
      x: table.x,
      z: table.serveZ,
      duration: SERVE_WALK,
      ease: 'power1.inOut'
    });
    // servieren: Arm heben, Essen auf den Tisch stellen, Tablett ablegen
    tl.call(() => {
      gsap.to(waiter.arms.right.rotation, { x: -1.2, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' });
      placeFood(table);
      g.remove(tray);
    });
    tl.to({}, { duration: SERVE_ACT });
    // zurück zum Truck
    tl.call(() => { g.rotation.y = Math.PI; });
    tl.to(g.position, { x: homeX, z: WAITER_HOME_Z, duration: SERVE_WALK * 0.9, ease: 'power1.in' });
  }

  // ---------- Essen auf dem Tisch ----------
  function buildFoodPlate() {
    const plate = new THREE.Group();
    const disk = cylinder(0.18, 0.18, 0.04, 0xf6f7eb, 14);
    plate.add(disk);
    const food = sphere(0.12, palette.accent, 10);
    food.scale.y = 0.7;
    food.position.y = 0.1;
    plate.add(food);
    return plate;
  }

  function placeFood(table) {
    removeFood(table);
    const plate = buildFoodPlate();
    plate.position.set(table.x, 0.98, table.z);
    plate.scale.setScalar(0.01);
    worldGroup.add(plate);
    table.foodMesh = plate;
    foods.add(plate);
    gsap.to(plate.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(2)' });
  }

  function removeFood(table) {
    const plate = table.foodMesh;
    if (!plate) return;
    table.foodMesh = null;
    foods.delete(plate);
    worldGroup.remove(plate);
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

    // Manager: gemanagte Trucks sammeln das Trinkgeld automatisch ein.
    if (hooks.isManaged && hooks.isManaged()) {
      coin.userData.autoTimeout = setTimeout(() => {
        if (!coin.userData.alive) return;
        hooks.onTip(coin.userData.value, coin.getWorldPosition(new THREE.Vector3()));
        removeCoin(coin, true);
      }, 550);
    }
  }

  function removeCoin(coin, collected) {
    if (!coin.userData.alive) return;
    coin.userData.alive = false;
    clearTimeout(coin.userData.timeout);
    clearTimeout(coin.userData.autoTimeout);
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
  const MAX_CUSTOMERS = 9;

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
    for (const g of [...customers, ...waiters]) {
      if (g.userData.tl) g.userData.tl.kill();
      if (g.userData.bob) g.userData.bob.kill();
      gsap.killTweensOf(g.position);
    }
    for (const coin of coins) {
      clearTimeout(coin.userData.timeout);
      clearTimeout(coin.userData.autoTimeout);
      gsap.killTweensOf(coin.position);
      gsap.killTweensOf(coin.rotation);
      gsap.killTweensOf(coin.scale);
    }
    for (const plate of foods) gsap.killTweensOf(plate.scale);
    customers.clear();
    waiters.clear();
    foods.clear();
  }

  return { addWorker, update, dispose };
}
