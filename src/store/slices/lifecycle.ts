import { assetsRepo, importAll, templatesRepo } from '@/lib/db';
import type { LifecycleSlice, SliceCreator } from '../types';
import { byId, guarded } from '../utils';

export const createLifecycleSlice: SliceCreator<LifecycleSlice> = (set, get) => ({
  status: 'idle',
  error: null,

  init: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') return; // idempotent
    set({ status: 'loading', error: null });
    try {
      const [assets, templates] = await Promise.all([
        assetsRepo.getAll(),
        templatesRepo.getAll(),
      ]);
      set({ assets: byId(assets), templates: byId(templates), status: 'ready' });
    } catch (e) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to load your vault',
      });
    }
  },

  applyImport: (plan) =>
    guarded(get, 'import the backup', async () => {
      const assets = [...plan.assets.add, ...plan.assets.update];
      const templates = [...plan.templates.add, ...plan.templates.update];
      await importAll(assets, templates);
      set((s) => ({
        assets: { ...s.assets, ...byId(assets) },
        templates: { ...s.templates, ...byId(templates) },
      }));
    }),
});
