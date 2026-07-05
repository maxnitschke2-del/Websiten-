const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae'];

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 1000) {
    return n < 10 && n % 1 !== 0 ? n.toFixed(1) : String(Math.floor(n));
  }
  let tier = Math.floor(Math.log10(n) / 3);
  tier = Math.min(tier, SUFFIXES.length - 1);
  const scaled = n / Math.pow(1000, tier);
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return scaled.toFixed(digits) + SUFFIXES[tier];
}

export function formatMoney(n) {
  return formatNumber(n) + ' $';
}
