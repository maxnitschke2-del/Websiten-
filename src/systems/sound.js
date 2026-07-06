// Sound-Hooks. Aktuell ein winziger WebAudio-Synth, damit es hörbares
// Feedback gibt – die Aufrufstellen (sound.play('buy') etc.) bleiben aber
// stabil, sodass später echte Audio-Samples dahintergehängt werden können,
// ohne den Spielcode anzufassen.
const PRESETS = {
  buy: { notes: [523], type: 'triangle', dur: 0.09, gain: 0.12 },
  unlock: { notes: [523, 784], type: 'square', dur: 0.12, gain: 0.12 },
  tip: { notes: [988], type: 'sine', dur: 0.08, gain: 0.1 },
  world: { notes: [392, 523, 659], type: 'sawtooth', dur: 0.16, gain: 0.1 },
  achievement: { notes: [523, 659, 784, 1047], type: 'triangle', dur: 0.14, gain: 0.13 }
};

export function createSound(isMuted) {
  let ctx = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch {
        return null;
      }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(c, freq, type, start, dur, gain) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function play(name) {
    if (isMuted && isMuted()) return;
    const c = ensureCtx();
    if (!c) return;
    const p = PRESETS[name] || PRESETS.buy;
    p.notes.forEach((f, i) => {
      tone(c, f, p.type, c.currentTime + i * p.dur * 0.9, p.dur, p.gain);
    });
  }

  // Nach der ersten Nutzergeste aufrufen, um den AudioContext zu entsperren.
  function unlock() {
    ensureCtx();
  }

  return { play, unlock };
}
