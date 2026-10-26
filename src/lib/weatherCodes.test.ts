import { describe, expect, it } from 'vitest';
import { describeCode } from './weatherCodes';

describe('describeCode', () => {
  it('describes known WMO codes', () => {
    expect(describeCode(0)).toEqual({ label: 'Clear sky', sky: 'clear' });
    expect(describeCode(63).sky).toBe('rain');
    expect(describeCode(95).sky).toBe('storm');
  });
  it('falls back for unknown codes', () => {
    expect(describeCode(42)).toEqual({ label: 'Unknown', sky: 'cloudy' });
  });
});
