# Foodtruck Empire

Idle-Game im Eatventure-Stil: ein 2D-Foodtruck mit sichtbar arbeitendem
Personal und animierten Kunden, passives Idle-Einkommen plus (ab Phase 2)
antippbare Trinkgeld-Bubbles.

## Starten

Statischer Webserver im Projektordner genügt, z. B.:

```
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen.

## Architektur

```
index.html          Einstieg (lädt vendor/gsap.min.js + src/main.js)
css/style.css       Layout, HUD, Szene, Panel
vendor/gsap.min.js  GSAP 3.12.5 (lokal, kein CDN)
src/
  main.js           Bootstrapping: State laden, Szene bauen, Loop starten
  core/             state.js (Spielstand + localStorage), loop.js (Tick)
  data/             stations.js (Stationen), locations.js (Standorte, Phase 4)
  systems/          production.js (passives Einkommen), upgrades.js,
                    customers.js (Kunden-Animation; Trinkgeld-Hook für Phase 2)
  ui/               scene.js (2D-Szene, Sprites), hud.js (Geld, Upgrade-Panel)
  utils/            format.js (Zahlenformat, Zufall)
```

## Build-Plan

1. ✅ Restaurant-Szene: 1 Stand, 1 Personal-Sprite, 1 Kunde (rein/raus, GSAP)
2. ✅ Tap-to-Collect: Trinkgeld-Bubbles (src/systems/tips.js)
3. ✅ Mehrere Stationen/Personal parallel (Freischalten über unlockCost)
4. ✅ Standort-Progression (Cap → nächste Stadt + permanenter Bonus)
5. ⬜ Offline-Progress mit 3h-Cap
6. ⬜ Polish: Kunden-Varianten, Sound-Hooks, Achievements
