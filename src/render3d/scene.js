// Three.js-Grundgerüst: Renderer, feste Diorama-Kamera, Licht und
// Render-Loop. Keine Spiel-Logik — src/ui/scene.js platziert hierüber
// Objekte und rechnet 3D-Punkte in Overlay-Pixel um.
// Für Welt-Übergänge (Phase 5) sind Kamera + Sonne nach außen sichtbar
// und der Himmel lässt sich weich überblenden (tweenSky).
import * as THREE from 'three';

// Feste, leicht schräge Kamera (Eatventure-Diorama): kein freies
// Umherfahren, dadurch mobile-tauglich und vorhersagbare Projektion.
const CAM_POS = { x: 0, y: 9.2, z: 16.5 };
const CAM_TARGET = new THREE.Vector3(0, 1.9, -0.5);
const SUN_OFFSET = { x: 7, y: 13, z: 9 };

export function init3d(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // Persistente Farb-Instanzen, damit Himmel/Nebel tweenbar sind
  const bgColor = new THREE.Color('#8ed3f5');
  scene.background = bgColor;
  scene.fog = new THREE.Fog(bgColor.clone(), 32, 70);

  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 200);
  camera.position.set(CAM_POS.x, CAM_POS.y, CAM_POS.z);
  camera.lookAt(CAM_TARGET);

  // Warmes Sonnenlicht mit Schatten + Himmels-/Bodenlicht + kühles
  // Gegenlicht, damit die Low-Poly-Flächen plastisch bleiben.
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8474, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff1d6, 1.6);
  sun.position.set(SUN_OFFSET.x, SUN_OFFSET.y, SUN_OFFSET.z);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.far = 45;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target); // Ziel muss in der Szene sein, um es zu bewegen

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

  // Zielfarben für Himmel/Nebel/Hemisphärenlicht aus einem Theme
  function skyColors({ sky, ground }) {
    const skyColor = new THREE.Color(sky);
    return {
      bg: skyColor,
      hemiSky: skyColor.clone().lerp(new THREE.Color(0xffffff), 0.6),
      hemiGround: new THREE.Color(ground),
    };
  }

  return {
    camera,
    sun,
    add(obj) {
      scene.add(obj);
    },
    setSky(theme) {
      const c = skyColors(theme);
      bgColor.copy(c.bg);
      scene.fog.color.copy(c.bg);
      hemi.color.copy(c.hemiSky);
      hemi.groundColor.copy(c.hemiGround);
    },
    // Weiche Überblendung (Welt-Übergang); liefert die Tweens zurück,
    // damit der Aufrufer sie bei einem Abbruch killen kann.
    tweenSky(theme, duration) {
      const c = skyColors(theme);
      const opts = { duration, ease: 'power1.inOut' };
      return [
        gsap.to(bgColor, { r: c.bg.r, g: c.bg.g, b: c.bg.b, ...opts }),
        gsap.to(scene.fog.color, { r: c.bg.r, g: c.bg.g, b: c.bg.b, ...opts }),
        gsap.to(hemi.color, { r: c.hemiSky.r, g: c.hemiSky.g, b: c.hemiSky.b, ...opts }),
        gsap.to(hemi.groundColor, { r: c.hemiGround.r, g: c.hemiGround.g, b: c.hemiGround.b, ...opts }),
      ];
    },
    // Kamera + Sonne (samt Schatten-Frustum) seitlich versetzen
    setViewOffset(x) {
      camera.position.x = CAM_POS.x + x;
      sun.position.x = SUN_OFFSET.x + x;
      sun.target.position.x = x;
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
