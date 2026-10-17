import { beforeEach, describe, expect, it } from 'vitest';
import { assetsRepo, db, templatesRepo } from '@/lib/db';

beforeEach(async () => {
  await db.assets.clear();
  await db.templates.clear();
});

describe('assetsRepo', () => {
  it('creates an asset with defaults and normalized fields', async () => {
    const a = await assetsRepo.create({
      type: 'tailwind',
      title: 'Card',
      content: 'p-4 rounded',
      tags: ['#UI', ' ui ', 'Cards'],
    });
    expect(a.id).toMatch(/^ast_/);
    expect(a.language).toBe('html');
    expect(a.tags).toEqual(['ui', 'cards']);
    expect(a.favorite).toBe(false);
    expect(await db.assets.get(a.id)).toEqual(a);
  });

  it('rejects an empty title', async () => {
    await expect(
      assetsRepo.create({ type: 'snippet', title: '   ', content: 'x' }),
    ).rejects.toThrow();
  });

  it('updates fields, keeps createdAt, bumps updatedAt', async () => {
    const a = await assetsRepo.create({ type: 'snippet', title: 'A', content: 'x' });
    const b = await assetsRepo.update(a.id, { title: 'B', language: 'TypeScript' });
    expect(b.title).toBe('B');
    expect(b.language).toBe('ts');
    expect(b.createdAt).toBe(a.createdAt);
    expect(b.updatedAt).toBeGreaterThanOrEqual(a.updatedAt);
  });

  it('removes and restores with the same id', async () => {
    const a = await assetsRepo.create({
      type: 'css',
      title: 'Fade',
      content: '@keyframes',
    });
    const removed = await assetsRepo.remove(a.id);
    expect(await db.assets.get(a.id)).toBeUndefined();
    await assetsRepo.restore(removed!);
    expect((await db.assets.get(a.id))?.title).toBe('Fade');
  });

  it('finds assets by tag via the multi-entry index', async () => {
    await assetsRepo.create({
      type: 'snippet',
      title: 'One',
      content: '1',
      tags: ['react'],
    });
    await assetsRepo.create({
      type: 'snippet',
      title: 'Two',
      content: '2',
      tags: ['vue'],
    });
    const hits = await db.assets.where('tags').equals('react').toArray();
    expect(hits.map((h) => h.title)).toEqual(['One']);
  });
});

describe('templatesRepo', () => {
  it('creates, updates items, and removes', async () => {
    const t = await templatesRepo.create({ name: 'Starter' });
    expect(t.items).toEqual([]);
    const updated = await templatesRepo.update(t.id, {
      items: [{ assetId: 'ast_1', path: 'src/a.ts', order: 0 }],
    });
    expect(updated.items).toHaveLength(1);
    await templatesRepo.remove(t.id);
    expect(await db.templates.get(t.id)).toBeUndefined();
  });
});
