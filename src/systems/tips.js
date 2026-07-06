// Trinkgeld-System – reine Funktionen/Konstanten, testbar.
// Trinkgeld ist ein dezenter Bonus zum Idle-Einkommen, kein Ersatz:
// eine Münze entspricht wenigen Sekunden passivem Einkommen.
export const TIP_INCOME_SECONDS = 8;
export const TIP_COIN_LIFETIME = 15; // Sekunden, dann verschwindet die Münze
export const MAX_TIP_COINS = 5;

export function tipValue(incomePerSec, rand = Math.random()) {
  const base = Math.max(1, incomePerSec * TIP_INCOME_SECONDS);
  return base * (0.8 + rand * 0.6);
}
