# 🚚 Food Truck Empire

Ein Mobile-First Idle/Incremental Game: Ein Foodtruck erobert die Welt –
Expansion über Städte statt Qualitätsstufen.

## Spielen

```bash
npm install
npm run dev      # Dev-Server auf http://localhost:5173
npm run build    # Production-Build nach dist/
```

## Features

- **8 Cuisine-Trucks** (Hotdog → Gourmet-Fusion) mit geometrischer
  Kosten-Skalierung (1.07–1.15× pro Kauf) und Bulk-Buy (×1/×10/Max)
- **3 Kaufpfade**: Personal-Upgrades pro Truck, Klick-Pfad
  (Klick skaliert mit % des Einkommens), globale Marketing-Multiplikatoren
- **Prestige „Globale Expansion"**: Reset gegen permanente
  Marken-Bekanntheit (+2 %/Punkt) und eine neue Stadt mit thematischem
  Bonus (Wien: Hotdogs ×2, Rom: Pizza ×2 …)
- **Automatisierung als Belohnung**: Verkaufs-Roboter (Auto-Klicker) kaufbar,
  Auto-Buyer kostet Bekanntheit nach dem ersten Prestige
- **26 Erfolge** (je +1 % Einkommen) mit „Nächstes Ziel"-Banner
- **Save/Load**: Autosave in localStorage, Offline-Progress (50 % Rate,
  8 h Cap), Save-Export/-Import
- **Juice**: GSAP-Animationen – hochzählende Zahlen, Floaties,
  Emoji-Partikel, Konfetti, Toasts; Sound-Hooks vorbereitet

## Architektur

```
src/core/     gameState.js (Single Source of Truth), gameLoop.js (rAF + delta),
              save.js (Save/Load/Offline)
src/data/     generators.js, upgrades.js, achievements.js, cities.js
              (reine Config, keine Logik)
src/systems/  production.js, costScaling.js, prestige.js, unlocks.js,
              automation.js (reine Funktionen, testbar)
src/ui/       render.js (DOM), juice.js (GSAP-Feedback)
src/utils/    formatNumber.js (K/M/B/T…-Suffixe), formulas.js
```
