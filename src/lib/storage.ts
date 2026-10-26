// Small, defensive wrapper around localStorage. Storage can be unavailable (private
// mode, blocked cookies) or contain old/corrupt data, so every read validates its shape
// and every write is allowed to fail silently: the app must still work without it.

import type { Place } from '../api/openMeteo';
import type { Units } from './format';

const KEY = 'skycast:v1';
export const MAX_SAVED = 8;

export interface Prefs {
  saved: Place[];
  units: Units;
  theme: 'system' | 'light' | 'dark';
  last?: Place;
}

export const DEFAULT_PREFS: Prefs = { saved: [], units: 'metric', theme: 'system' };

function isPlace(value: unknown): value is Place {
  const p = value as Place;
  return (
    !!p &&
    typeof p === 'object' &&
    typeof p.id === 'number' &&
    typeof p.name === 'string' &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude)
  );
}

export function loadPrefs(storage: Storage | undefined = safeStorage()): Prefs {
  if (!storage) return { ...DEFAULT_PREFS };
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter(isPlace).slice(0, MAX_SAVED) : [],
      units: parsed.units === 'imperial' ? 'imperial' : 'metric',
      theme: parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : 'system',
      last: isPlace(parsed.last) ? parsed.last : undefined,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: Prefs, storage: Storage | undefined = safeStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Quota exceeded or storage blocked: preferences just won't persist.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}
