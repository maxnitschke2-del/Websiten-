// Geteilte Mathe-Helfer – reine Funktionen, keine Abhängigkeiten.

/**
 * Gesamtkosten für `count` Käufe eines Generators mit geometrischem
 * Kostenwachstum, beginnend bei `owned` bereits gekauften Einheiten:
 * base * r^owned * (r^count - 1) / (r - 1)
 */
export function geometricSum(base, growthRate, owned, count) {
  if (count <= 0) return 0;
  return (
    (base * Math.pow(growthRate, owned) * (Math.pow(growthRate, count) - 1)) /
    (growthRate - 1)
  );
}

/**
 * Maximale Anzahl Käufe, die mit `money` bezahlbar sind
 * (Umkehrung der geometrischen Summe).
 */
export function maxAffordable(base, growthRate, owned, money) {
  const firstCost = base * Math.pow(growthRate, owned);
  if (money < firstCost) return 0;
  const n = Math.floor(
    Math.log((money * (growthRate - 1)) / firstCost + 1) / Math.log(growthRate)
  );
  // Floating-Point-Absicherung: nie mehr melden, als wirklich bezahlbar ist
  return geometricSum(base, growthRate, owned, n) <= money ? n : n - 1;
}
