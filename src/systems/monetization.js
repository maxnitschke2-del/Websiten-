// MonetizationService – Stub mit No-Op-Funktionen.
// Architektur-Platzhalter: Später lässt sich hier AdMob (oder ein anderer
// Anbieter) einhängen, ohne den Aufrufcode anzufassen. Aktuell werden
// Belohnungen SOFORT gewährt, ohne echte Werbung anzuzeigen.
export function createMonetizationService() {
  let removedAds = false;

  return {
    // Ist eine belohnte Werbung bereit? (Stub: immer ja)
    isRewardedAdReady() {
      return true;
    },

    // Zeigt (später) eine Rewarded Ad und ruft onReward NUR bei erfolgreichem
    // Ansehen. Stub: gewährt die Belohnung direkt und meldet Erfolg.
    showRewardedAd(onReward) {
      if (typeof onReward === 'function') onReward();
      return Promise.resolve({ completed: true });
    },

    // Interstitial zwischen Aktionen. Stub: tut nichts.
    showInterstitial() {
      return Promise.resolve({ shown: false });
    },

    // Kaufabschluss "Werbung entfernen". Stub: merkt sich nur das Flag.
    purchaseRemoveAds() {
      removedAds = true;
      return Promise.resolve({ success: true });
    },

    hasRemovedAds() {
      return removedAds;
    }
  };
}
