import { describe, it, expect } from 'vitest';
import * as schema from '../src/db/schema';

describe('schema exports', () => {
  it('exports every table', () => {
    for (const name of [
      'users', 'volunteers', 'events', 'shifts',
      'shiftAssignments', 'attendance', 'messages', 'settings'
    ]) {
      expect((schema as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
