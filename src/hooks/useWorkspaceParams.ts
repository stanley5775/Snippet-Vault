import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type View = 'all' | 'favorites' | 'templates';
const VIEWS: View[] = ['all', 'favorites', 'templates'];

export function useWorkspaceParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const id = params.get('id');
  const rawView = params.get('view');
  const view: View = VIEWS.includes(rawView as View) ? (rawView as View) : 'all';

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return {
    id,
    view,
    selectAsset: (assetId: string | null) => update({ id: assetId }),
    setView: (v: View) => update({ view: v === 'all' ? null : v, id: null }),
  };
}
