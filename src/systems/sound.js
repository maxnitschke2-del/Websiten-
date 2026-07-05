// Sound-System: kleine synthetisierte Effekte über WebAudio, keine
// Asset-Dateien nötig. playSound(name) ist der zentrale Hook - wer echte
// Samples will, tauscht hier nur die Einträge in SOUNDS aus.
import { state, saveState } from '../core/state.js';

let ctx = null;

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function initSound() {
  // AudioContext darf erst nach einer User-Geste laufen
  window.addEventListener('pointerdown', ensureContext, { once: true });
}

function note(freq, start, dur, type = 'sine', gain = 0.12) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

const SOUNDS = {
  tip() { note(880, 0, 0.09, 'square', 0.06); note(1320, 0.07, 0.12, 'square', 0.06); },
  upgrade() { note(520, 0, 0.08, 'triangle'); note(660, 0.06, 0.1, 'triangle'); },
  unlock() { [440, 550, 660, 880].forEach((f, i) => note(f, i * 0.07, 0.12, 'triangle')); },
  move() { note(220, 0, 0.25, 'sawtooth', 0.08); note(330, 0.2, 0.3, 'sawtooth', 0.08); },
  achievement() { [660, 880, 1100].forEach((f, i) => note(f, i * 0.09, 0.16, 'sine', 0.1)); },
  order() { note(700, 0, 0.05, 'sine', 0.04); },
};

export function playSound(name) {
  if (state.muted || !SOUNDS[name]) return;
  if (!ensureContext() || ctx.state !== 'running') return;
  SOUNDS[name]();
}

export function toggleMute() {
  state.muted = !state.muted;
  saveState();
  return state.muted;
}
