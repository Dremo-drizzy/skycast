// Keeps the selected place in the URL (?place=Halifax&lat=44.6488&lon=-63.5752) so a
// forecast can be bookmarked or shared, and the back button works between places.

import type { Place } from '../api/openMeteo';

export function placeFromUrl(search: string): Place | undefined {
  const params = new URLSearchParams(search);
  const name = params.get('place');
  const lat = Number(params.get('lat'));
  const lon = Number(params.get('lon'));
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return undefined;
  return {
    id: Number(params.get('id')) || stableId(lat, lon),
    name,
    latitude: lat,
    longitude: lon,
    admin1: params.get('region') ?? undefined,
    country: params.get('country') ?? undefined,
  };
}

export function placeToSearch(place: Place): string {
  const params = new URLSearchParams({
    place: place.name,
    lat: place.latitude.toFixed(4),
    lon: place.longitude.toFixed(4),
    id: String(place.id),
  });
  if (place.admin1) params.set('region', place.admin1);
  if (place.country) params.set('country', place.country);
  return `?${params.toString()}`;
}

/** Deterministic id for places that didn't come from the geocoder (e.g. "my location"). */
export function stableId(lat: number, lon: number): number {
  return -Math.abs(Math.round(lat * 1000) * 100000 + Math.round(lon * 1000));
}
