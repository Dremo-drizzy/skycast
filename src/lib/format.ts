export type Units = 'metric' | 'imperial';

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

/** Rounded temperature with degree sign, e.g. "-3°". Avoids printing "-0°". */
export function formatTemp(celsius: number, units: Units): string {
  const value = units === 'imperial' ? toFahrenheit(celsius) : celsius;
  const rounded = Math.round(value);
  return `${Object.is(rounded, -0) ? 0 : rounded}°`;
}

export function formatWind(kmh: number, units: Units): string {
  return units === 'imperial' ? `${Math.round(kmhToMph(kmh))} mph` : `${Math.round(kmh)} km/h`;
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/** 0–360 degrees to an 8-point compass direction. Wind direction is where it blows FROM. */
export function compass(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return COMPASS[Math.round(normalized / 45) % 8];
}

// Open-Meteo returns local wall-clock times without an offset ("2026-10-26T14:00")
// because we ask for timezone=auto. Read the parts directly instead of letting the
// browser reinterpret them in the viewer's own timezone.

export function hourLabel(isoLocal: string): string {
  const hour = Number(isoLocal.slice(11, 13));
  const suffix = hour < 12 ? 'am' : 'pm';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${suffix}`;
}

export function timeLabel(isoLocal: string): string {
  const hour = Number(isoLocal.slice(11, 13));
  const minute = isoLocal.slice(14, 16);
  const suffix = hour < 12 ? 'am' : 'pm';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minute} ${suffix}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "2026-10-26" -> "Mon". Uses UTC so the weekday never shifts with the viewer's timezone. */
export function weekday(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function placeLabel(place: { name: string; admin1?: string; country?: string }): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(', ');
}
