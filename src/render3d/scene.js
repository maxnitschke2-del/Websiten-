import * as THREE from 'three';

// Feste, leicht schräge Diorama-Perspektive. Kein freies Rumfahren.
const VIEW_DIR = new THREE.Vector3(0.14, 0.88, 1).normalize();
// Sicherheitsrand: Szene darf max. bis ~93% des Bildrands reichen.
const EDGE_PADDING = 0.07;

export function createScene(container, palette) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.sky, 45, 110);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 300);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xc8b490, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff2d9, 1.6);
  sun.position.set(-8, 14, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  sun.shadow.camera.far = 60;
  scene.add(sun);

  let frameBox = null;

  // Positioniert die Kamera entlang VIEW_DIR so, dass die komplette
  // frameBox (Straße + alle 4 Stationen + Truck) im Bild liegt –
  // unabhängig vom Seitenverhältnis (Portrait-Handy bis Desktop).
  function refit() {
    if (!frameBox) return;
    const center = frameBox.getCenter(new THREE.Vector3());
    const corners = boxCorners(frameBox);
    const ndc = new THREE.Vector3();
    const limit = 1 - EDGE_PADDING;

    const fits = (dist) => {
      camera.position.copy(center).addScaledVector(VIEW_DIR, dist);
      camera.lookAt(center);
      camera.updateMatrixWorld(true);
      for (const corner of corners) {
        ndc.copy(corner).project(camera);
        if (Math.abs(ndc.x) > limit || Math.abs(ndc.y) > limit) return false;
      }
      return true;
    };

    let lo = 1;
    let hi = 250;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) hi = mid;
      else lo = mid;
    }
    fits(hi);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    refit();
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    scene,
    camera,
    renderer,
    setFrameBox(box) {
      frameBox = box;
      refit();
    },
    setBackground(palette) {
      scene.background.set(palette.sky);
      scene.fog.color.set(palette.sky);
    },
    render() {
      renderer.render(scene, camera);
    }
  };
}

function boxCorners(box) {
  const { min, max } = box;
  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z)
  ];
}
