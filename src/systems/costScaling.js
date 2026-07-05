// cost = baseCost * growthRate^level  (Balancing-Regel)
export function upgradeCost(stationCfg, level) {
  return stationCfg.baseCost * Math.pow(stationCfg.growthRate, level);
}

// Gesamtkosten, um eine Station von Level a auf Level b zu bringen.
// Geometrische Reihe – wird ab Phase 2/5 für den Welt-Max-Check gebraucht.
export function totalUpgradeCost(stationCfg, fromLevel, toLevel) {
  const g = stationCfg.growthRate;
  return (
    (stationCfg.baseCost * (Math.pow(g, toLevel) - Math.pow(g, fromLevel))) /
    (g - 1)
  );
}
