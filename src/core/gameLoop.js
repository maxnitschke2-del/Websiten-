// requestAnimationFrame-Loop mit delta time.
// Logik-Tick läuft jeden Frame, Render-Handler können sich selbst drosseln.

const tickHandlers = [];
const renderHandlers = [];

export function onTick(fn) {
  tickHandlers.push(fn);
}

export function onRender(fn) {
  renderHandlers.push(fn);
}

// Frames > 1s werden gekappt – lange Abwesenheit wird als
// Offline-Progress verrechnet (save.js), nicht als Riesen-Tick.
const MAX_DELTA = 1;

let lastTime = 0;

export function startLoop() {
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

function frame(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt > MAX_DELTA) dt = MAX_DELTA;
  if (dt > 0) {
    for (const fn of tickHandlers) fn(dt);
    for (const fn of renderHandlers) fn(dt);
  }
  requestAnimationFrame(frame);
}
