import { assetsRepo } from '@/lib/db';
import { guarded, without } from '../utils';
import type { AssetsSlice, SliceCreator } from '../types';

export const createAssetsSlice: SliceCreator<AssetsSlice> = (set, get) => ({
  assets: {},

  createAsset: (input) =>
    guarded(get, 'save the asset', async () => {
      const asset = await assetsRepo.create(input);
      set((s) => ({ assets: { ...s.assets, [asset.id]: asset } }));
      return asset;
    }),

  updateAsset: (id, patch) =>
    guarded(get, 'save changes', async () => {
      const asset = await assetsRepo.update(id, patch);
      set((s) => ({ assets: { ...s.assets, [asset.id]: asset } }));
      return asset;
    }),

  removeAsset: (id) =>
    guarded(get, 'delete the asset', async () => {
      const removed = await assetsRepo.remove(id);
      if (!removed) return;
      set((s) => ({ assets: without(s.assets, id) }));
      get().pushToast({
        message: `Deleted “${removed.title}”`,
        duration: 6000,
        action: { label: 'Undo', run: () => get().restoreAsset(removed) },
      });
    }),

  restoreAsset: (asset) =>
    guarded(get, 'restore the asset', async () => {
      await assetsRepo.restore(asset);
      set((s) => ({ assets: { ...s.assets, [asset.id]: asset } }));
    }),

  toggleFavorite: async (id) => {
    const current = get().assets[id];
    if (!current) return;
    await get().updateAsset(id, { favorite: !current.favorite });
  },
});
