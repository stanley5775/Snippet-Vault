import { assetsRepo, templatesRepo } from '@/lib/db';
import { byId } from '../utils';
import type { LifecycleSlice, SliceCreator } from '../types';

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
});
