import { gsap } from 'gsap';
import { formatMoney, formatNumber } from '../utils/formatNumber.js';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min`;
  return `${Math.floor(seconds)} s`;
}

// Modales "Willkommen zurück"-Overlay mit dem Offline-Ertrag.
// Bietet zusätzlich an, den Ertrag per (gestubbter) Rewarded Ad zu verdoppeln.
export function showOfflineModal(offline, { onDouble } = {}) {
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
      <button class="modal-btn ghost" data-act="double">🎬 Ertrag verdoppeln</button>
      <button class="modal-btn" data-act="collect">Einsammeln</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const card = overlay.querySelector('.modal-card');
  gsap.from(card, { scale: 0.8, opacity: 0, duration: 0.35, ease: 'back.out(1.6)' });

  function close() {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      onComplete: () => overlay.remove()
    });
  }

  overlay.querySelector('[data-act="collect"]').addEventListener('click', close);
  overlay.querySelector('[data-act="double"]').addEventListener('click', () => {
    if (onDouble) {
      onDouble(offline.earned, () => {
        // Bestätigung: verdoppelter Betrag kurz anzeigen, dann schließen.
        const earnedEl = card.querySelector('.modal-earned');
        earnedEl.textContent = `+ ${formatMoney(offline.earned * 2)}`;
        gsap.fromTo(earnedEl, { scale: 1.3 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
        setTimeout(close, 700);
      });
    } else {
      close();
    }
  });
}

// Kurzer Toast unten für freigeschaltete Achievements.
export function showAchievementToast(ach) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${ach.icon}</span>
    <span class="toast-text"><b>Achievement!</b> ${ach.name}</span>
  `;
  document.body.appendChild(toast);
  gsap.fromTo(
    toast,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }
  );
  gsap.to(toast, {
    y: 24,
    opacity: 0,
    duration: 0.35,
    delay: 2.6,
    ease: 'power2.in',
    onComplete: () => toast.remove()
  });
}

// Achievements-Übersicht mit Fortschrittsbalken.
export function showAchievementsModal(list) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const unlockedCount = list.filter((a) => a.unlocked).length;

  const rows = list
    .map((a) => `
      <div class="ach-row ${a.unlocked ? 'done' : ''}">
        <span class="ach-icon">${a.unlocked ? a.icon : '🔒'}</span>
        <div class="ach-body">
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
          <div class="ach-bar"><div class="ach-fill" style="width:${Math.round(a.progress * 100)}%"></div></div>
        </div>
      </div>
    `)
    .join('');

  overlay.innerHTML = `
    <div class="modal-card ach-card">
      <h2>🏆 Achievements <span class="ach-count">${unlockedCount}/${list.length}</span></h2>
      <div class="ach-list">${rows}</div>
      <button class="modal-btn" data-act="close">Schließen</button>
    </div>
  `;
  document.body.appendChild(overlay);
  const card = overlay.querySelector('.modal-card');
  gsap.from(card, { scale: 0.85, opacity: 0, duration: 0.3, ease: 'back.out(1.5)' });

  function close() {
    gsap.to(overlay, { opacity: 0, duration: 0.22, onComplete: () => overlay.remove() });
  }
  overlay.querySelector('[data-act="close"]').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}
