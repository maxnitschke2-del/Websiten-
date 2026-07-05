// "Willkommen zurück"-Modal für den Offline-Verdienst.
import { formatMoney, formatDuration } from '../utils/format.js';
import { OFFLINE_CAP_SECONDS } from '../systems/offline.js';

export function showOfflineModal(result) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card">
        <div class="modal-emoji">🚚💤</div>
        <h2>Willkommen zurück!</h2>
        <p>Du warst ${formatDuration(result.awaySeconds)} weg.<br>
        Dein Team hat weiterverkauft und verdient:</p>
        <div class="modal-amount">$${formatMoney(result.amount)}</div>
        ${
          result.capped
            ? `<p class="modal-cap-note">⏳ Offline-Verdienst ist auf ${formatDuration(OFFLINE_CAP_SECONDS)} gedeckelt.</p>`
            : ''
        }
        <button class="modal-btn" type="button">Einsammeln 💰</button>
      </div>
    </div>`;

  const overlay = root.querySelector('.modal-overlay');
  const card = root.querySelector('.modal-card');
  gsap.from(card, { scale: 0.7, opacity: 0, duration: 0.4, ease: 'back.out(1.8)' });
  root.querySelector('.modal-btn').addEventListener(
    'click',
    () => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          root.innerHTML = '';
        },
      });
    },
    { once: true }
  );
}
