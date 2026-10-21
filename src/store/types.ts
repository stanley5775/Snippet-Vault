import type { StateCreator } from 'zustand';
import type { Asset, StarterTemplate } from '@/types';
import type {
  AssetPatch,
  NewAssetInput,
  NewTemplateInput,
  TemplatePatch,
} from '@/lib/db';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface Toast {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'error';
  duration: number; // ms; the toast component handles the timer (M3)
  action?: { label: string; run: () => void | Promise<void> };
}

export type ToastInput = Pick<Toast, 'message'> & Partial<Omit<Toast, 'id' | 'message'>>;

export interface LifecycleSlice {
  status: LoadStatus;
  error: string | null;
  init: () => Promise<void>;
}

export interface AssetsSlice {
  assets: Record<string, Asset>;
  createAsset: (input: NewAssetInput) => Promise<Asset>;
  updateAsset: (id: string, patch: AssetPatch) => Promise<Asset>;
  removeAsset: (id: string) => Promise<void>;
  restoreAsset: (asset: Asset) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export interface TemplatesSlice {
  templates: Record<string, StarterTemplate>;
  createTemplate: (input: NewTemplateInput) => Promise<StarterTemplate>;
  updateTemplate: (id: string, patch: TemplatePatch) => Promise<StarterTemplate>;
  removeTemplate: (id: string) => Promise<void>;
  restoreTemplate: (template: StarterTemplate) => Promise<void>;
  addTemplateAssets: (templateId: string, assetIds: string[]) => Promise<void>;
  removeTemplateItem: (templateId: string, assetId: string) => Promise<void>;
  moveTemplateItem: (templateId: string, assetId: string, delta: -1 | 1) => Promise<void>;
  setTemplateItemPath: (
    templateId: string,
    assetId: string,
    path: string,
  ) => Promise<void>;
  setTemplateItemFrozen: (
    templateId: string,
    assetId: string,
    frozen: boolean,
  ) => Promise<void>;
  swapTemplateItem: (
    templateId: string,
    oldAssetId: string,
    newAssetId: string,
  ) => Promise<void>;
}

export interface UiSlice {
  toasts: Toast[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  query: string;
  setQuery: (query: string) => void;
}

export type VaultState = LifecycleSlice & AssetsSlice & TemplatesSlice & UiSlice;
export type SliceCreator<T> = StateCreator<VaultState, [], [], T>;
