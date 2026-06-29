export function convertTemp(celsius, unit) {
  if (unit === 'imperial') return Math.round((celsius * 9 / 5) + 32);
  return Math.round(celsius);
}

export function tempSymbol(unit) {
  return unit === 'imperial' ? '°F' : '°C';
}

export function convertSpeed(ms, unit) {
  if (unit === 'imperial') return (ms * 2.237).toFixed(1);
  return ms.toFixed(1);
}

export function speedUnit(unit) {
  return unit === 'imperial' ? 'mph' : 'm/s';
}
