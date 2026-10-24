import { describe, expect, it } from 'vitest';
import { SHORTCUT_GROUPS } from './shortcuts';

const rows = SHORTCUT_GROUPS.flatMap((g) => g.rows);

describe('SHORTCUT_GROUPS', () => {
  it('gives every row either keys or a mod key, never both', () => {
    for (const row of rows) expect(Boolean(row.keys) !== Boolean(row.mod)).toBe(true);
  });
  it('uses unique labels', () => {
    expect(new Set(rows.map((r) => r.label)).size).toBe(rows.length);
  });
});
