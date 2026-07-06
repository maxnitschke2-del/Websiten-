import { gsap } from 'gsap';
import { formatMoney } from '../utils/formatNumber.js';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min`;
  return `${Math.floor(seconds)} s`;
}

// Modales "Willkommen zurück"-Overlay mit dem Offline-Ertrag.
export function showOfflineModal(offline, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-emoji">🚚💤</div>
      <h2>Willkommen zurück!</h2>
      <p class="modal-sub">Deine Trucks liefen ${formatDuration(offline.seconds)} weiter${
        offline.wasCapped ? ' (max. 3 h)' : ''
      }.</p>
      <div class="modal-earned">+ ${formatMoney(offline.earned)}</div>
      <button class="modal-btn">Einsammeln</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const card = overlay.querySelector('.modal-card');
  gsap.from(card, { scale: 0.8, opacity: 0, duration: 0.35, ease: 'back.out(1.6)' });

  function close() {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      onComplete: () => {
        overlay.remove();
        if (onClose) onClose();
      }
    });
  }
  overlay.querySelector('.modal-btn').addEventListener('click', close);
}
