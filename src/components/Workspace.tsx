'use client';

import { Plus } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { AssetDetail } from '@/components/assets/AssetDetail';
import { AssetEditor } from '@/components/assets/AssetEditor';
import { AssetList } from '@/components/assets/AssetList';
import { SearchBar } from '@/components/SearchBar';
import { Sidebar } from '@/components/Sidebar';
import { StatusBar } from '@/components/StatusBar';
import { useAssetList } from '@/hooks/useAssetList';
import { useSearchResults } from '@/hooks/useSearchResults';
import { useWorkspaceParams, type View } from '@/hooks/useWorkspaceParams';
import { claimFirstRunSeed, seedExamples } from '@/lib/seed';
import { useVaultStore } from '@/store';

const primaryButton =
  'rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90';

function Centered({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      {children && <div className="max-w-xs text-sm text-muted">{children}</div>}
    </div>
  );
}

function EmptyList({ view }: { view: View }) {
  if (view === 'favorites') {
    return (
      <Centered title="No favorites yet">Star an asset and it shows up here.</Centered>
    );
  }
  return (
    <Centered title="Nothing here yet">
      <p>Create your first asset, or load a few examples to see how the vault works.</p>
      <button
        type="button"
        onClick={() => void seedExamples().catch(() => undefined)}
        className={`${primaryButton} mt-4`}
      >
        Load examples
      </button>
    </Centered>
  );
}

function NoMatches({ query }: { query: string }) {
  const setQuery = useVaultStore((s) => s.setQuery);
  return (
    <Centered title="No matches">
      <p className="break-words">
        Nothing matches “{query.trim()}”. Try fewer words, or remove a filter.
      </p>
      <button
        type="button"
        onClick={() => setQuery('')}
        className="mt-3 text-accent hover:underline"
      >
        Clear search
      </button>
    </Centered>
  );
}

export function Workspace() {
  const init = useVaultStore((s) => s.init);
  const status = useVaultStore((s) => s.status);
  const error = useVaultStore((s) => s.error);
  const query = useVaultStore((s) => s.query);
  const assets = useAssetList();
  const { id, view, mode, selectAsset, setView, startNew, startEdit, finishEditing } =
    useWorkspaceParams();
  const visible = useSearchResults(view);
  const selected = useVaultStore((s) => (id ? s.assets[id] : undefined));

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (status !== 'ready') return;
    const hasAssets = Object.keys(useVaultStore.getState().assets).length > 0;
    if (claimFirstRunSeed(hasAssets)) void seedExamples().catch(() => undefined);
  }, [status]);

  const favoritesCount = assets.filter((a) => a.favorite).length;
  const detailOpen = Boolean(id) || mode === 'new';
  const filtering = query.trim().length > 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar
          view={view}
          counts={{ all: assets.length, favorites: favoritesCount }}
          onChange={setView}
          className={`${detailOpen ? 'hidden md:flex' : 'flex'} border-b md:border-b-0`}
        />

        {view === 'templates' ? (
          <div className="flex flex-1 bg-panel">
            <Centered title="Project Starter">
              Bundle your snippets into a downloadable ZIP. Coming soon.
            </Centered>
          </div>
        ) : (
          <>
            <section
              className={`${detailOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-1 flex-col bg-panel md:w-80 md:flex-none md:border-r md:border-line`}
            >
              {status === 'error' ? (
                <p className="p-4 text-sm text-danger">{error}</p>
              ) : status !== 'ready' ? (
                <p className="p-4 text-sm text-muted">Loading your vault…</p>
              ) : (
                <>
                  <SearchBar />
                  <button
                    type="button"
                    onClick={startNew}
                    className="flex w-full items-center gap-2 border-b border-line px-4 py-2.5 text-left text-sm text-accent transition-colors hover:bg-hover"
                  >
                    <Plus className="size-4" />
                    New asset
                  </button>
                  {visible.length > 0 ? (
                    <AssetList assets={visible} selectedId={id} onSelect={selectAsset} />
                  ) : filtering ? (
                    <NoMatches query={query} />
                  ) : (
                    <EmptyList view={view} />
                  )}
                </>
              )}
            </section>

            <main
              className={`${detailOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-panel`}
            >
              {mode === 'new' ? (
                <AssetEditor
                  key="new"
                  onSaved={(newId) => finishEditing(newId)}
                  onCancel={() => finishEditing(null)}
                />
              ) : mode === 'edit' && selected ? (
                <AssetEditor
                  key={selected.id}
                  asset={selected}
                  onSaved={(savedId) => finishEditing(savedId)}
                  onCancel={() => finishEditing(selected.id)}
                />
              ) : selected ? (
                <AssetDetail
                  asset={selected}
                  onBack={() => selectAsset(null)}
                  onEdit={() => startEdit(selected.id)}
                />
              ) : id && status === 'ready' ? (
                <Centered title="That asset is gone">
                  <p>It may have been deleted.</p>
                  <button
                    type="button"
                    onClick={() => selectAsset(null)}
                    className="mt-3 text-accent hover:underline"
                  >
                    Back to the list
                  </button>
                </Centered>
              ) : (
                <Centered title="Pick an asset">
                  Choose one from the list to read and copy it. Everything you save stays
                  in this browser.
                </Centered>
              )}
            </main>
          </>
        )}
      </div>
      <StatusBar
        assetCount={assets.length}
        matchCount={filtering ? visible.length : undefined}
      />
    </div>
  );
}
