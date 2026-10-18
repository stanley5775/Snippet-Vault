import { useDeferredValue, useMemo } from 'react';
import type { View } from '@/hooks/useWorkspaceParams';
import { searchAssets } from '@/lib/search';
import { useVaultStore } from '@/store';

export function useSearchResults(view: View) {
  const assets = useVaultStore((s) => s.assets);
  const query = useVaultStore((s) => s.query);
  const deferredQuery = useDeferredValue(query);

  return useMemo(() => {
    const results = searchAssets(assets, deferredQuery);
    return view === 'favorites' ? results.filter((a) => a.favorite) : results;
  }, [assets, deferredQuery, view]);
}
