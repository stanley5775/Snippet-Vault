import { describe, expect, it } from 'vitest';
import type { Asset, StarterTemplate } from '@/types';
import { backupFilename, buildBackup, parseBackup, serializeBackup } from './format';

const asset = (over: Partial<Asset> = {}): Asset => ({
  id: 'ast_1',
  type: 'snippet',
  title: 'One',
  content: 'x',
  language: 'ts',
  tags: ['a'],
  favorite: false,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

const template = (over: Partial<StarterTemplate> = {}): StarterTemplate => ({
  id: 'tpl_1',
  name: 'T',
  items: [{ assetId: 'ast_1', path: 'a.ts', order: 0 }],
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

const valid = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    app: 'snippet-vault',
    formatVersion: 1,
    exportedAt: 5,
    assets: [asset()],
    templates: [template()],
    ...over,
  });

function ok(text: string) {
  const result = parseBackup(text);
  if (!result.ok) throw new Error(result.error);
  return result;
}

const errorOf = (text: string) => {
  const result = parseBackup(text);
  return result.ok ? null : result.error;
};

describe('backup round trip', () => {
  it('serializes and parses back to the same data', () => {
    const backup = buildBackup([asset()], [template()], 123);
    const result = ok(serializeBackup(backup));
    expect(result.backup).toEqual({
      exportedAt: 123,
      assets: backup.assets,
      templates: backup.templates,
    });
    expect(result.skipped).toBe(0);
  });

  it('names the file by local date', () => {
    expect(backupFilename(new Date(2026, 9, 22))).toBe(
      'snippet-vault-backup-2026-10-22.json',
    );
  });
});

describe('parseBackup rejects unusable files', () => {
  it('rejects invalid JSON', () => {
    expect(errorOf('{nope')).toMatch(/valid JSON/);
  });
  it('rejects files from another app or non-objects', () => {
    expect(errorOf(valid({ app: 'other' }))).toMatch(/isn't a Snippet Vault backup/);
    expect(errorOf('[]')).toMatch(/isn't a Snippet Vault backup/);
  });
  it('rejects a missing or bad version', () => {
    expect(errorOf(valid({ formatVersion: 'x' }))).toMatch(/version number/);
  });
  it('rejects a newer format version', () => {
    expect(errorOf(valid({ formatVersion: 99 }))).toMatch(/newer version/);
  });
  it('rejects a file with no assets or templates', () => {
    expect(errorOf(valid({ assets: undefined }))).toMatch(/missing/);
  });
});

describe('parseBackup tolerance', () => {
  it('skips invalid items and counts them', () => {
    const result = ok(
      valid({
        assets: [asset(), { id: 'ast_2' }],
        templates: [template(), { nope: true }],
      }),
    );
    expect(result.skipped).toBe(2);
    expect(result.backup.assets).toHaveLength(1);
    expect(result.backup.templates).toHaveLength(1);
  });

  it('normalizes tags and language', () => {
    const result = ok(
      valid({ assets: [asset({ tags: ['#React', ' react '], language: 'TypeScript' })] }),
    );
    expect(result.backup.assets[0].tags).toEqual(['react']);
    expect(result.backup.assets[0].language).toBe('ts');
  });

  it('rejects ids that could collide with object internals', () => {
    const result = ok(
      valid({
        assets: [asset({ id: 'constructor' })],
        templates: [
          template({ items: [{ assetId: '__proto__', path: 'a.ts', order: 0 }] }),
        ],
      }),
    );
    expect(result.skipped).toBe(2);
    expect(result.backup.assets).toHaveLength(0);
    expect(result.backup.templates).toHaveLength(0);
  });
});
