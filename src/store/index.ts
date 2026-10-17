import { create } from 'zustand';
import { createAssetsSlice } from './slices/assets';
import { createLifecycleSlice } from './slices/lifecycle';
import { createTemplatesSlice } from './slices/templates';
import { createUiSlice } from './slices/ui';
import type { VaultState } from './types';

export const useVaultStore = create<VaultState>()((...a) => ({
  ...createLifecycleSlice(...a),
  ...createAssetsSlice(...a),
  ...createTemplatesSlice(...a),
  ...createUiSlice(...a),
}));

export type { VaultState, Toast } from './types';
