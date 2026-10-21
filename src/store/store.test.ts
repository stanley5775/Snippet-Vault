import { beforeEach, describe, expect, it } from 'vitest';
import { assetsRepo, db } from '@/lib/db';
import { useVaultStore } from '@/store';

const initial = useVaultStore.getState();
const store = () => useVaultStore.getState();

beforeEach(async () => {
  useVaultStore.setState(initial, true); // reset the store
  await db.assets.clear();
  await db.templates.clear();
});

describe('lifecycle', () => {
  it('init loads persisted data and is idempotent', async () => {
    const a = await assetsRepo.create({ type: 'snippet', title: 'Seed', content: 'x' });
    await Promise.all([store().init(), store().init()]);
    expect(store().status).toBe('ready');
    expect(store().assets[a.id]?.title).toBe('Seed');
  });
});

describe('assets', () => {
  it('creates and updates, persisting to Dexie', async () => {
    const a = await store().createAsset({
      type: 'css',
      title: 'Fade',
      content: '@keyframes',
    });
    expect(store().assets[a.id]).toEqual(a);
    await store().updateAsset(a.id, { title: 'Fade In' });
    expect(store().assets[a.id].title).toBe('Fade In');
    expect((await db.assets.get(a.id))?.title).toBe('Fade In');
  });

  it('toggles favorite', async () => {
    const a = await store().createAsset({ type: 'snippet', title: 'A', content: 'x' });
    await store().toggleFavorite(a.id);
    expect(store().assets[a.id].favorite).toBe(true);
  });

  it('removes with an Undo toast that restores the same id', async () => {
    const a = await store().createAsset({
      type: 'snippet',
      title: 'Hello',
      content: 'x',
    });
    await store().removeAsset(a.id);
    expect(store().assets[a.id]).toBeUndefined();
    expect(await db.assets.get(a.id)).toBeUndefined();

    const toast = store().toasts[0];
    expect(toast.action?.label).toBe('Undo');
    await toast.action!.run();
    expect(store().assets[a.id]?.title).toBe('Hello');
    expect(await db.assets.get(a.id)).toBeDefined();
  });

  it('leaves the store unchanged and shows an error toast when a write fails', async () => {
    await expect(
      store().createAsset({ type: 'snippet', title: '', content: 'x' }),
    ).rejects.toThrow();
    expect(Object.keys(store().assets)).toHaveLength(0);
    expect(store().toasts[0].variant).toBe('error');
  });
});

describe('templates', () => {
  it('creates, removes, and restores with Undo', async () => {
    const t = await store().createTemplate({ name: 'Starter' });
    await store().removeTemplate(t.id);
    expect(store().templates[t.id]).toBeUndefined();
    await store().toasts[0].action!.run();
    expect(store().templates[t.id]?.name).toBe('Starter');
  });
});

describe('template items', () => {
  it('adds assets with suggested paths and persists them', async () => {
    const a = await store().createAsset({
      type: 'snippet',
      title: 'Auth middleware',
      content: 'x',
      language: 'ts',
    });
    const b = await store().createAsset({ type: 'css', title: 'Fade in', content: 'y' });
    const t = await store().createTemplate({ name: 'Starter' });

    await store().addTemplateAssets(t.id, [a.id, b.id, a.id]);

    expect(store().templates[t.id].items.map((i) => i.path)).toEqual([
      'auth-middleware.ts',
      'fade-in.css',
    ]);
    expect((await db.templates.get(t.id))?.items).toHaveLength(2);
  });

  it('keeps a frozen copy after the asset is deleted', async () => {
    const a = await store().createAsset({
      type: 'snippet',
      title: 'Keep me',
      content: 'original',
    });
    const t = await store().createTemplate({ name: 'Starter' });
    await store().addTemplateAssets(t.id, [a.id]);
    await store().setTemplateItemFrozen(t.id, a.id, true);
    await store().removeAsset(a.id);

    const item = store().templates[t.id].items[0];
    expect(item.frozenContent).toBe('original');
    expect(store().assets[a.id]).toBeUndefined();
  });

  it('removes and reorders items', async () => {
    const a = await store().createAsset({ type: 'snippet', title: 'A', content: '1' });
    const b = await store().createAsset({ type: 'snippet', title: 'B', content: '2' });
    const t = await store().createTemplate({ name: 'Starter' });
    await store().addTemplateAssets(t.id, [a.id, b.id]);

    await store().moveTemplateItem(t.id, b.id, -1);
    expect(store().templates[t.id].items.find((i) => i.order === 0)?.assetId).toBe(b.id);

    await store().removeTemplateItem(t.id, a.id);
    expect(store().templates[t.id].items).toHaveLength(1);
  });
});

describe('import', () => {
  it('writes a merge plan to Dexie and the store', async () => {
    const asset = {
      id: 'ast_imported',
      type: 'snippet' as const,
      title: 'Imported',
      content: 'x',
      language: 'ts',
      tags: [],
      favorite: false,
      createdAt: 1,
      updatedAt: 1,
    };
    await store().applyImport({
      assets: { add: [asset], update: [], unchanged: 0 },
      templates: { add: [], update: [], unchanged: 0 },
    });
    expect(store().assets[asset.id]).toEqual(asset);
    expect(await db.assets.get(asset.id)).toEqual(asset);
  });
});