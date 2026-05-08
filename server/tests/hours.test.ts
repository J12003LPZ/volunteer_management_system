import { describe, it, expect } from 'vitest';
import { calcHours } from '../src/lib/hours';

describe('calcHours', () => {
  it('returns 0 if either time missing', () => {
    expect(calcHours(null, '2026-01-01T10:00:00Z')).toBe(0);
    expect(calcHours('2026-01-01T09:00:00Z', null)).toBe(0);
  });
  it('computes diff in hours rounded to 2 decimals', () => {
    expect(calcHours('2026-01-01T09:00:00Z', '2026-01-01T13:30:00Z')).toBe(4.5);
  });
});
