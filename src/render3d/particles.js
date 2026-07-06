import * as THREE from 'three';
import { gsap } from 'gsap';

// Leichtgewichtige Partikel-Bursts für Kauf/Freischalten/Trinkgeld.
// Partikel werden in Weltkoordinaten in die Szene gelegt und räumen sich
// per GSAP selbst wieder auf. Die Geometrie wird geteilt (billig).
export function createParticleSystem(scene) {
  const geo = new THREE.SphereGeometry(0.1, 6, 6);

  function burst(pos, { color = 0xffd23f, count = 10, power = 1.3, size = 1 } = {}) {
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
      m.position.copy(pos);
      m.scale.setScalar(size * (0.7 + Math.random() * 0.6));
      scene.add(m);

      const ang = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 0.7;
      const up = 0.5 + Math.random() * power;
      gsap.to(m.position, {
        x: pos.x + Math.cos(ang) * r,
        z: pos.z + Math.sin(ang) * r,
        y: pos.y + up,
        duration: 0.6 + Math.random() * 0.3,
        ease: 'power2.out'
      });
      gsap.to(m.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.6 + Math.random() * 0.3,
        ease: 'power1.in',
        onComplete: () => {
          scene.remove(m);
          m.material.dispose();
        }
      });
    }
  }

  return { burst };
}
