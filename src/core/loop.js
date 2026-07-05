const TICK_MS = 100;

export function startLoop(onTick) {
  let last = performance.now();
  setInterval(() => {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    onTick(dt);
  }, TICK_MS);
}
