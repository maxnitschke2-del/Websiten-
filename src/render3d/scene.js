// Three.js-Grundgerüst: Renderer, feste Diorama-Kamera, Licht und
// Render-Loop. Keine Spiel-Logik — src/ui/scene.js platziert hierüber
// Objekte und rechnet 3D-Punkte in Overlay-Pixel um.
import * as THREE from 'three';

// Feste, leicht schräge Kamera (Eatventure-Diorama): kein freies
// Umherfahren, dadurch mobile-tauglich und vorhersagbare Projektion.
const CAM_POS = { x: 0, y: 9.2, z: 16.5 };
const CAM_TARGET = new THREE.Vector3(0, 1.9, -0.5);

export function init3d(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 120);
  camera.position.set(CAM_POS.x, CAM_POS.y, CAM_POS.z);
  camera.lookAt(CAM_TARGET);

  // Warmes Sonnenlicht mit Schatten + Himmels-/Bodenlicht + kühles
  // Gegenlicht, damit die Low-Poly-Flächen plastisch bleiben.
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8474, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff1d6, 1.6);
  sun.position.set(7, 13, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.far = 45;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xbfd8ff, 0.35);
  fill.position.set(-8, 6, -5);
  scene.add(fill);

  const frameHooks = new Set();
  const resizeHooks = new Set();

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    resizeHooks.forEach((fn) => fn());
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let rafId = 0;
  let last = performance.now();
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1); // Tab-Wechsel abfedern
    last = now;
    frameHooks.forEach((fn) => fn(dt, now / 1000));
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(frame);

  const v = new THREE.Vector3();

  return {
    add(obj) {
      scene.add(obj);
    },
    // Himmel + Nebel aus dem Standort-Theme; das Hemisphärenlicht
    // nimmt die Bodenfarbe auf, damit die Szene farblich zusammenhängt.
    setSky({ sky, ground }) {
      const skyColor = new THREE.Color(sky);
      scene.background = skyColor;
      scene.fog = new THREE.Fog(skyColor, 32, 70);
      hemi.color.copy(skyColor).lerp(new THREE.Color(0xffffff), 0.6);
      hemi.groundColor.set(ground);
    },
    // 3D-Punkt -> Pixelkoordinate im Container (für DOM-Overlay).
    project({ x, y, z }) {
      v.set(x, y, z).project(camera);
      return {
        x: (v.x * 0.5 + 0.5) * container.clientWidth,
        y: (-v.y * 0.5 + 0.5) * container.clientHeight,
      };
    },
    onFrame(fn) {
      frameHooks.add(fn);
    },
    onResize(fn) {
      resizeHooks.add(fn);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      frameHooks.clear();
      resizeHooks.clear();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of mats) {
            if (m.map) m.map.dispose();
            m.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
