'use client';

import { useEffect, type ReactNode } from 'react';
import { AssetDetail } from '@/components/assets/AssetDetail';
import { AssetList } from '@/components/assets/AssetList';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from '@/components/ui/Toaster';
import { useAssetList } from '@/hooks/useAssetList';
import { useWorkspaceParams, type View } from '@/hooks/useWorkspaceParams';
import { claimFirstRunSeed, seedExamples } from '@/lib/seed';
import { useVaultStore } from '@/store';

function Centered({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      {children && <div className="max-w-sm text-sm text-neutral-500">{children}</div>}
    </div>
  );
}

function EmptyList({ view }: { view: View }) {
  if (view === 'favorites') {
    return <Centered title="No favorites yet">Star an asset to pin it here.</Centered>;
  }
  return (
    <Centered title="Your vault is empty">
      <p>Save your first snippet, or start with a few examples.</p>
      <button
        type="button"
        onClick={() => void seedExamples().catch(() => undefined)}
        className="mt-3 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
      >
        Add example snippets
      </button>
    </Centered>
  );
}

export function Workspace() {
  const init = useVaultStore((s) => s.init);
  const status = useVaultStore((s) => s.status);
  const error = useVaultStore((s) => s.error);
  const assets = useAssetList();
  const { id, view, selectAsset, setView } = useWorkspaceParams();
  const selected = useVaultStore((s) => (id ? s.assets[id] : undefined));

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (status !== 'ready') return;
    const hasAssets = Object.keys(useVaultStore.getState().assets).length > 0;
    if (claimFirstRunSeed(hasAssets)) void seedExamples().catch(() => undefined);
  }, [status]);

  const favorites = assets.filter((a) => a.favorite);
  const visible = view === 'favorites' ? favorites : assets;
  const detailOpen = Boolean(id);

  return (
    <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
      <Sidebar
        view={view}
        counts={{ all: assets.length, favorites: favorites.length }}
        onChange={setView}
        className={`${detailOpen ? 'hidden md:flex' : 'flex'} border-b md:border-b-0`}
      />

      {view === 'templates' ? (
        <Centered title="Templates">
          Project Starter templates arrive in a later milestone.
        </Centered>
      ) : (
        <>
          <section
            className={`${detailOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-1 flex-col border-neutral-200 md:w-80 md:flex-none md:border-r dark:border-neutral-800`}
          >
            {status === 'error' ? (
              <p className="p-4 text-sm text-red-600">{error}</p>
            ) : status !== 'ready' ? (
              <p className="p-4 text-sm text-neutral-500">Loading your vault…</p>
            ) : visible.length === 0 ? (
              <EmptyList view={view} />
            ) : (
              <AssetList assets={visible} selectedId={id} onSelect={selectAsset} />
            )}
          </section>

          <main
            className={`${detailOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col`}
          >
            {selected ? (
              <AssetDetail asset={selected} onBack={() => selectAsset(null)} />
            ) : id && status === 'ready' ? (
              <Centered title="Asset not found">
                <p>It may have been deleted.</p>
                <button
                  type="button"
                  onClick={() => selectAsset(null)}
                  className="mt-3 underline"
                >
                  Back to list
                </button>
              </Centered>
            ) : (
              <Centered title="Welcome to Snippet Vault">
                Pick an asset from the list to preview and copy it. Everything is stored
                locally in this browser.
              </Centered>
            )}
          </main>
        </>
      )}

      <Toaster />
    </div>
  );
}
