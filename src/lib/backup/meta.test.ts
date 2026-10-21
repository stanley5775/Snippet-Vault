import { describe, expect, it } from 'vitest';
import { formatBackupAge, isBackupStale } from './meta';

const DAY = 86_400_000;
const now = 100 * DAY;

describe('formatBackupAge', () => {
  it('describes the age in days', () => {
    expect(formatBackupAge(null, now)).toBe('Never');
    expect(formatBackupAge(now - 1000, now)).toBe('Today');
    expect(formatBackupAge(now - DAY, now)).toBe('Yesterday');
    expect(formatBackupAge(now - 5 * DAY, now)).toBe('5 days ago');
  });
});

describe('isBackupStale', () => {
  it('is stale when never backed up or older than two weeks', () => {
    expect(isBackupStale(null, now)).toBe(true);
    expect(isBackupStale(now - 15 * DAY, now)).toBe(true);
    expect(isBackupStale(now - 3 * DAY, now)).toBe(false);
  });
});
