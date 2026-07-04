// Zahlenformatierung: unter 1e6 lokalisiert (de-DE), ab 1e6 mit Suffixen.

const SUFFIXES = ['M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

const intFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const smallFmt = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});
const suffixFmt = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 1000) return smallFmt.format(n);
  if (n < 1e6) return intFmt.format(Math.floor(n));
  const tier = Math.min(Math.floor(Math.log10(n) / 3) - 2, SUFFIXES.length - 1);
  const scaled = n / Math.pow(10, (tier + 2) * 3);
  return suffixFmt.format(scaled) + ' ' + SUFFIXES[tier];
}

export function formatMoney(n) {
  return formatNumber(n) + ' €';
}

export function formatRate(n) {
  return formatNumber(n) + ' €/s';
}

export function formatDuration(seconds) {
  const s = Math.floor(seconds);
  if (s < 60) return s + ' s';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60);
  const restM = m % 60;
  return restM > 0 ? `${h} h ${restM} min` : `${h} h`;
}
