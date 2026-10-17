import { useMemo } from 'react';
import { useVaultStore } from '@/store';

/** Favorites first, then most recently updated. */
export function useAssetList() {
  const assets = useVaultStore((s) => s.assets);
  return useMemo(
    () =>
      Object.values(assets).sort(
        (a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt,
      ),
    [assets],
  );
}
