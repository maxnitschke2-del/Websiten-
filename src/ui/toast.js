// Toast-Benachrichtigungen (z. B. freigeschaltete Erfolge), nacheinander
// abgearbeitet, damit sich nichts überlappt.
const queue = [];
let showing = false;

export function showToast(html) {
  queue.push(html);
  if (!showing) next();
}

function next() {
  const html = queue.shift();
  if (!html) {
    showing = false;
    return;
  }
  showing = true;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  document.body.appendChild(el);
  gsap.fromTo(el, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.7)' });
  gsap.to(el, {
    y: -80,
    opacity: 0,
    delay: 2.6,
    duration: 0.3,
    ease: 'power1.in',
    onComplete() {
      el.remove();
      next();
    },
  });
}
