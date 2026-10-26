import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFS, loadPrefs, MAX_SAVED, savePrefs } from './storage';

const halifax = { id: 1, name: 'Halifax', latitude: 44.6, longitude: -63.5 };

describe('storage', () => {
  it('round-trips preferences', () => {
    savePrefs({ saved: [halifax], units: 'imperial', theme: 'dark', last: halifax }, localStorage);
    expect(loadPrefs(localStorage)).toEqual({ saved: [halifax], units: 'imperial', theme: 'dark', last: halifax });
  });

  it('returns defaults for missing or corrupt data', () => {
    expect(loadPrefs(localStorage)).toEqual(DEFAULT_PREFS);
    localStorage.setItem('skycast:v1', '{not json');
    expect(loadPrefs(localStorage)).toEqual(DEFAULT_PREFS);
  });

  it('drops invalid places and caps the saved list', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ ...halifax, id: i }));
    localStorage.setItem(
      'skycast:v1',
      JSON.stringify({ saved: [{ name: 'broken' }, ...many], units: 'kelvin', theme: 'neon', last: 'x' }),
    );
    const prefs = loadPrefs(localStorage);
    expect(prefs.saved).toHaveLength(MAX_SAVED);
    expect(prefs.units).toBe('metric');
    expect(prefs.theme).toBe('system');
    expect(prefs.last).toBeUndefined();
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    } as unknown as Storage;
    expect(loadPrefs(broken)).toEqual(DEFAULT_PREFS);
    expect(() => savePrefs(DEFAULT_PREFS, broken)).not.toThrow();
  });
});
