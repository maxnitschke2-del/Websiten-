// Juice: GSAP-Animationen für Feedback – strikt ohne Spiellogik.

import { gsap } from 'gsap';

let fxLayer;

export function initJuice() {
  fxLayer = document.getElementById('fx-layer');
}

/** "+X €"-Floaty an Bildschirmposition (px). */
export function spawnFloaty(x, y, text) {
  const el = document.createElement('span');
  el.className = 'floaty';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  fxLayer.appendChild(el);
  gsap.fromTo(
    el,
    { y: 0, opacity: 1, scale: 0.7 },
    {
      y: -90,
      opacity: 0,
      scale: 1.15,
      duration: 1,
      ease: 'power1.out',
      onComplete: () => el.remove(),
    }
  );
}

/** Kurzer "Squash"-Pulse auf einem Element (Buttons, Truck). */
export function pulse(el, strength = 0.12) {
  gsap.fromTo(
    el,
    { scale: 1 - strength },
    { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)', overwrite: true }
  );
}

/** Emoji-Partikel-Burst, z.B. beim Kauf eines Trucks. */
export function burstEmojis(x, y, emoji, count = 8) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = emoji;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    fxLayer.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 70;
    gsap.to(el, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 40,
      opacity: 0,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.5 + Math.random() * 0.8,
      duration: 0.7 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => el.remove(),
    });
  }
}

/** Toast oben im Bild, z.B. für Achievements. */
export function showToast(html) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  fxLayer.appendChild(el);
  gsap.fromTo(
    el,
    { y: -80, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' }
  );
  gsap.to(el, {
    y: -80,
    opacity: 0,
    delay: 2.6,
    duration: 0.35,
    ease: 'power1.in',
    onComplete: () => el.remove(),
  });
}

/** Konfetti-Regen für große Momente (Achievement, Prestige). */
export function confetti() {
  const emojis = ['🎉', '✨', '🎊', '⭐'];
  for (let i = 0; i < 16; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = emojis[i % emojis.length];
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.top = '-30px';
    fxLayer.appendChild(el);
    gsap.to(el, {
      y: window.innerHeight * (0.4 + Math.random() * 0.5),
      x: (Math.random() - 0.5) * 120,
      rotation: (Math.random() - 0.5) * 360,
      opacity: 0,
      duration: 1.4 + Math.random() * 0.8,
      ease: 'power1.in',
      onComplete: () => el.remove(),
    });
  }
}

// Sound-Hook: bewusst no-op, damit Aufrufstellen schon stehen.
export function playSound(id) {
  // TODO: echte Sounds einhängen (id: 'click' | 'buy' | 'achievement' | ...)
}
