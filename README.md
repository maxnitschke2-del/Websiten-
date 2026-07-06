# Foodtruck Empire 🍔🚚

Idle-Tycoon-Spiel im Eatventure-Stil mit prozeduralen Low-Poly-3D-Welten.
Ziel: produktionsreif für den Play Store.

## Tech-Stack

- **Vite** + Vanilla JS (ES6 Modules)
- **Three.js** – 3D-Szenen, komplett prozedural aus Grundformen (keine Modell-Dateien)
- **GSAP** – UI-Animationen und Feedback-Effekte
- **localStorage** – Saves (ab Phase 4)

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal testen
```

## Architektur

| Verzeichnis     | Inhalt                                                        |
| --------------- | ------------------------------------------------------------- |
| `src/core/`     | gameState (single source of truth), gameLoop (rAF + delta)    |
| `src/data/`     | Welten/Stationen/Achievements als reine Config – keine Logik  |
| `src/systems/`  | production, costScaling … reine, testbare Funktionen          |
| `src/render3d/` | Three.js-Szene, Kamera-Fitting, prozedurale Modelle pro Welt  |
| `src/ui/`       | DOM-Panels/Buttons, strikt getrennt von der 3D-Szene          |
| `src/utils/`    | formatNumber (K/M/B/T…), Formeln (Meilensteine)               |

## Build-Phasen

- [x] **Phase 1** – Grundgerüst: Welt 1, erste Station, Kamera-Framing (komplette Straße), UI-Proportionen (3D-Szene 62% Höhe)
- [ ] Phase 2 – Alle 4 Stationen in Welt 1 + Kosten-Skalierung
- [x] **Phase 3** – Personal arbeitet sichtbar, Kunden laufen animiert rein/raus, Tap-to-Collect Trinkgeld
- [ ] Phase 4 – Save/Load + Offline-Progress (3h-Cap)
- [ ] Phase 5 – Welt 2 + Welt-Freischaltung nach Balancing-Regel
- [ ] Phase 6 – Welt 3 + Welt 4
- [ ] Phase 7 – Polish: Achievements, Partikel, Sound-Hooks, Monetization-Stub

## Balancing-Regeln

- Stations-Kosten: `cost = baseCost * growthRate^level`, growthRate 1.12–1.18
- Welt komplett maxen ≈ 30–50 % der Freischalt-Kosten der nächsten Welt
- Zielkorridor: 15–30 Minuten aktives Spiel pro Welt
- Offline-Progress gedeckelt auf 3 Stunden
