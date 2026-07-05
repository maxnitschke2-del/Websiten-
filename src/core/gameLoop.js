// requestAnimationFrame-Loop mit Delta-Time in Sekunden.
// dt ist gedeckelt, damit Tab-Wechsel keine riesigen Sprünge erzeugen
// (Offline-Progress übernimmt das in Phase 4 sauber).
const MAX_DT = 0.25;

export function startLoop(update, render) {
  let last = performance.now();
  let running = true;

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    update(dt);
    render(dt);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  return () => {
    running = false;
  };
}
