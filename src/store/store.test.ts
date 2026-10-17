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
