# Verify: Foodtruck Empire (statische Website)

Rein statische Site (HTML + ES-Module + vendored GSAP + vendored Three.js
über Importmap), kein Build-Schritt. Die Szene ist ein Three.js-Canvas
(`#scene canvas`); Kunden und Personal sind 3D-Figuren (nur im Canvas
sichtbar, nicht per DOM abfragbar). Im Overlay `.scene-overlay` liegen
nur noch: Bestell-Sprechblasen (`.actor-bubble`), Trinkgeld-Bubbles
(`.tip-bubble`), Schwebe-Texte (`.float-text`) und Schloss-Badges
(`.lock-badge`).

## Starten

```bash
python3 -m http.server 8741 --bind 127.0.0.1 &   # im Repo-Root
```

## Fahren (Playwright + vorinstalliertes Chromium)

```bash
npm install playwright   # in einem Scratch-Ordner, Browser NICHT neu laden
```

```js
const { chromium } = require('playwright');
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  // Headless-WebGL für die Three.js-Szene:
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
```

Headless-WebGL loggt beim Screenshotten `GPU stall due to ReadPixels`
Warnings — harmlos, kein App-Fehler.

Achtung: `/opt/pw-browsers/chromium` ist ein Verzeichnis-Alias ohne Binary —
das echte Binary liegt unter `chromium-<rev>/chrome-linux/chrome`.

## Sinnvolle Flows

- Seite laden, `console`/`pageerror` sammeln (müssen leer sein).
- Kunden-Zyklus: 3D-Kunde spawnt nach ~1,2 s und läuft zum Truck (im DOM
  unsichtbar). Prüfbar: `.actor-bubble` bekommt das Bestell-Emoji und
  Breite > 0, verschwindet wieder; danach `.tip-bubble` (klickbar).
- `#hud-money-value` steigt über die Zeit (passives Einkommen).
- `.upgrade-btn` wird bei genug Geld aktiv; Klick erhöht Level in
  `.station-meta` und zieht Kosten ab.
- Persistenz: Save läuft alle 5 s + bei `beforeunload`; Reload behält Level.
  Hinweis: localStorage-Manipulation vor `page.reload()` wird durch den
  `beforeunload`-Save wieder überschrieben — für Corrupt-Save-Tests einen
  frischen `browser.newContext()` verwenden.
- Mobile-Viewport 375 px gegenprüfen (Layout ist flex/percentage-basiert).
- Stationen freischalten: Spielstand vorab per `addInitScript` in localStorage
  legen (Key `foodtruck-idle-v1`, z. B. `{"money":800}`), dann Unlock-Button
  klicken → ein `.lock-badge` im Overlay verschwindet (Anzahl sinkt),
  Einkommen/s steigt. Gesperrte Trucks sind im 3D-Canvas grau.
- Welten (Phase 3): `#worlds-btn` öffnet das Auswahl-Modal (`.world-card`,
  4 Stück: freigeschaltete Welten, nächste mit `.world-unlock-btn`, Rest
  `???`). Freischalt-Test: Spielstand `{"money":30000000}` setzen →
  Button aktiv, Klick wechselt in Welt 2 (Stations-Karten zeigen
  Sushi/Ramen/Onigiri/Matcha, Szene mit Sakura-Bäumen). `.world-switch-btn`
  wechselt zurück; Geld ist pro Welt getrennt (`state.worldSaves`).
  Alte Spielstände ohne worldIndex migrieren automatisch (Welt 1,
  4. Station "Eis" wird gesperrt ergänzt).
- Umzug testen: Spielstand mit allen Stationen am Cap setzen, dann
  `#move-btn` mit `{ force: true }` klicken (der Button pulsiert per
  CSS-Animation, Playwright hält ihn sonst für instabil). Danach: genau
  1 Canvas in `#scene`, neues Standort-Theme, keine pageerrors.
- Welt-Wechsel und Umzug laufen als GSAP-Kamerafahrt (~1,8 s, Phase 5):
  Tests nach dem Klick ~2,5 s warten, bevor Badges/Screenshots geprüft
  werden. Während der Fahrt spawnen keine Kunden (isSceneBusy).
  Wechsel MITTEN in einer laufenden Fahrt ist erlaubt → Notausstieg
  baut die Szene hart neu (weiterhin 1 Canvas, keine Fehler).
