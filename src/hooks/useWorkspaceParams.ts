import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type View = 'all' | 'favorites' | 'templates';
export type Mode = 'view' | 'edit' | 'new';
const VIEWS: View[] = ['all', 'favorites', 'templates'];

export function useWorkspaceParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const id = params.get('id');
  const rawView = params.get('view');
  const rawMode = params.get('mode');
  const view: View = VIEWS.includes(rawView as View) ? (rawView as View) : 'all';
  const mode: Mode =
    rawMode === 'new' ? 'new' : rawMode === 'edit' && id ? 'edit' : 'view';

  const update = useCallback(
    (changes: Record<string, string | null>, replace = false) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [params, pathname, router],
  );

  return {
    id,
    view,
    mode,
    selectAsset: (assetId: string | null, options?: { replace?: boolean }) =>
      update({ id: assetId, mode: null }, options?.replace),
    setView: (v: View) => update({ view: v === 'all' ? null : v, id: null, mode: null }),
    startNew: () => update({ id: null, mode: 'new' }),
    startEdit: (assetId: string) => update({ id: assetId, mode: 'edit' }),
    /** Leaves the editor. Uses replace so Back doesn't return to a stale form. */
    finishEditing: (assetId: string | null) => update({ id: assetId, mode: null }, true),
  };
}
