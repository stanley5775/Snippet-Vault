import { useMemo } from 'react';
import { sortAssets } from '@/lib/search';
import { useVaultStore } from '@/store';

/** Favorites first, then most recently updated. */
export function useAssetList() {
  const assets = useVaultStore((s) => s.assets);
  return useMemo(() => sortAssets(Object.values(assets)), [assets]);
}
