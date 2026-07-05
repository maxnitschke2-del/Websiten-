const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

export function formatMoney(value) {
  if (value < 1000) return String(Math.floor(value));
  let v = value;
  let unit = 0;
  while (v >= 1000 && unit < UNITS.length - 1) {
    v /= 1000;
    unit += 1;
  }
  return v.toFixed(v < 100 ? 1 : 0) + UNITS[unit];
}

export function formatRate(perSecond) {
  if (perSecond < 100) return perSecond.toFixed(1).replace(/\.0$/, '');
  return formatMoney(perSecond);
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}
