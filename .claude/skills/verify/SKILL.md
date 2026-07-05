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
- Umzug testen: Spielstand mit allen Stationen am Cap setzen, dann
  `#move-btn` mit `{ force: true }` klicken (der Button pulsiert per
  CSS-Animation, Playwright hält ihn sonst für instabil). Danach: genau
  1 Canvas in `#scene`, neues Standort-Theme, keine pageerrors.
