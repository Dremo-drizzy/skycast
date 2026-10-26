import { describe, expect, it } from 'vitest';
import { placeFromUrl, placeToSearch, stableId } from './urlState';

describe('urlState', () => {
  it('round-trips a place through the query string', () => {
    const place = { id: 6094817, name: 'Ottawa', latitude: 45.4112, longitude: -75.6981, admin1: 'Ontario', country: 'Canada' };
    expect(placeFromUrl(placeToSearch(place))).toEqual(place);
  });

  it('rejects missing or out-of-range coordinates', () => {
    expect(placeFromUrl('')).toBeUndefined();
    expect(placeFromUrl('?place=X&lat=abc&lon=1')).toBeUndefined();
    expect(placeFromUrl('?place=X&lat=95&lon=1')).toBeUndefined();
  });

  it('derives a stable negative id when none is given', () => {
    const p = placeFromUrl('?place=Here&lat=44.5&lon=-63.5');
    expect(p?.id).toBe(stableId(44.5, -63.5));
    expect(p!.id).toBeLessThan(0);
  });
});
