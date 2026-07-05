# Verify: Foodtruck Empire (statische Website)

Rein statische Site (HTML + ES-Module + vendored GSAP), kein Build-Schritt.

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
});
```

Achtung: `/opt/pw-browsers/chromium` ist ein Verzeichnis-Alias ohne Binary —
das echte Binary liegt unter `chromium-<rev>/chrome-linux/chrome`.

## Sinnvolle Flows

- Seite laden, `console`/`pageerror` sammeln (müssen leer sein).
- `.customer` erscheint nach ~1,2 s, läuft von rechts zum Stand, Bubble
  (`.customer .bubble`, Scale 0→1) erscheint, Kunde verschwindet wieder
  (Element wird entfernt) → gesamter GSAP-Zyklus.
- `#hud-money-value` steigt über die Zeit (passives Einkommen).
- `.upgrade-btn` wird bei genug Geld aktiv; Klick erhöht Level in
  `.station-meta` und zieht Kosten ab.
- Persistenz: Save läuft alle 5 s + bei `beforeunload`; Reload behält Level.
  Hinweis: localStorage-Manipulation vor `page.reload()` wird durch den
  `beforeunload`-Save wieder überschrieben — für Corrupt-Save-Tests einen
  frischen `browser.newContext()` verwenden.
- Mobile-Viewport 375 px gegenprüfen (Layout ist flex/percentage-basiert).
