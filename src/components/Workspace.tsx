'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AssetDetail } from '@/components/assets/AssetDetail';
import { AssetEditor } from '@/components/assets/AssetEditor';
import { AssetList } from '@/components/assets/AssetList';
import {
  CommandPalette,
  type PaletteCommand,
} from '@/components/command-palette/CommandPalette';
import { SearchBar } from '@/components/SearchBar';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { Sidebar } from '@/components/Sidebar';
import { StatusBar, type Hint } from '@/components/StatusBar';
import { TemplatesView } from '@/components/templates/TemplatesView';
import { Centered } from '@/components/ui/Centered';
import { useAssetList } from '@/hooks/useAssetList';
import { useHotkeys, type Hotkey } from '@/hooks/useHotkeys';
import { useModLabel } from '@/hooks/useModLabel';
import { useSearchResults } from '@/hooks/useSearchResults';
import { useWorkspaceParams, type View } from '@/hooks/useWorkspaceParams';
import { copyAsset } from '@/lib/actions';
import { seedExamples, claimFirstRunSeed } from '@/lib/seed';
import { DEFAULT_TEMPLATE_NAME } from '@/lib/templates/items';
import { useVaultStore } from '@/store';
import { BackupDialog } from '@/components/BackupDialog';

const primaryButton =
  'rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90';

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

function focusSearch() {
  const el = document.getElementById('asset-search') as HTMLInputElement | null;
  el?.focus();
  el?.select();
}

function VaultError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <Centered title="Couldn't open your vault">
      <p>
        Your browser may be blocking local storage. Private browsing or strict site-data
        settings can cause this.
      </p>
      {message && <p className="mt-2 text-xs break-words">{message}</p>}
      <button type="button" onClick={onRetry} className={`${primaryButton} mt-4`}>
        Try again
      </button>
    </Centered>
  );
}

export function Workspace() {
  const init = useVaultStore((s) => s.init);
  const status = useVaultStore((s) => s.status);
  const error = useVaultStore((s) => s.error);
  const query = useVaultStore((s) => s.query);
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const removeAsset = useVaultStore((s) => s.removeAsset);
  const createTemplate = useVaultStore((s) => s.createTemplate);
  const templateCount = useVaultStore((s) => Object.keys(s.templates).length);
  const assets = useAssetList();
  const {
    id,
    view,
    mode,
    selectAsset,
    setView,
    startNew,
    startEdit,
    finishEditing,
    openTemplate,
  } = useWorkspaceParams();
  const visible = useSearchResults(view);
  const selected = useVaultStore((s) => (id ? s.assets[id] : undefined));
  const mod = useModLabel();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
    const [backupOpen, setBackupOpen] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (status !== 'ready') return;
    const hasAssets = Object.keys(useVaultStore.getState().assets).length > 0;
    if (claimFirstRunSeed(hasAssets)) void seedExamples().catch(() => undefined);
  }, [status]);

  const filtering = query.trim().length > 0;

  // While searching on desktop, keep the top result selected so Enter has a target.
  useEffect(() => {
    if (view === 'templates' || !filtering || mode !== 'view' || visible.length === 0)
      return;
    if (visible.some((a) => a.id === id)) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    selectAsset(visible[0].id, { replace: true });
  }, [view, filtering, mode, visible, id, selectAsset]);

  const selectedIndex = visible.findIndex((a) => a.id === id);

  function moveSelection(delta: number) {
    if (visible.length === 0) return;
    const next =
      selectedIndex === -1
        ? delta > 0
          ? 0
          : visible.length - 1
        : Math.min(Math.max(selectedIndex + delta, 0), visible.length - 1);
    selectAsset(visible[next].id, { replace: true });
  }

  /** Enter in the search box: copy the highlighted result, or the top one. */
  function copyHighlighted() {
    const target = visible.find((a) => a.id === id) ?? visible[0];
    if (target) void copyAsset(target);
  }

  function onEnter(event: KeyboardEvent) {
    // Enter on a focused row that isn't selected yet selects it instead of copying another asset
    const row = (event.target as HTMLElement | null)?.closest?.('[data-asset-id]');
    const rowId = row instanceof HTMLElement ? row.dataset.assetId : undefined;
    if (rowId && rowId !== id) {
      selectAsset(rowId);
      return;
    }
    if (selected) void copyAsset(selected);
  }

  function editSelected() {
    if (selected) startEdit(selected.id);
  }

  function favoriteSelected() {
    if (selected) void toggleFavorite(selected.id).catch(() => undefined);
  }

  async function deleteSelected() {
    if (!selected) return;
    const neighbor =
      selectedIndex >= 0
        ? (visible[selectedIndex + 1] ?? visible[selectedIndex - 1])
        : undefined;
    try {
      await removeAsset(selected.id);
      selectAsset(neighbor?.id ?? null, { replace: true });
    } catch {
      // the status bar already shows the error
    }
  }

  function closeSelected() {
    if (id) selectAsset(null);
  }

  async function newTemplate() {
    try {
      const template = await createTemplate({ name: DEFAULT_TEMPLATE_NAME });
      openTemplate(template.id);
    } catch {
      // the status bar already shows the error
    }
  }

  const browsing = mode === 'view' && view !== 'templates';

  const bindings: Hotkey[] = [
    { keys: 'mod+k', allowInInputs: true, run: () => setPaletteOpen(true) },
    { keys: '?', run: () => setHelpOpen(true) },
    { keys: '/', run: focusSearch },
    ...(browsing
      ? [
          { keys: 'j', repeat: true, run: () => moveSelection(1) },
          { keys: 'k', repeat: true, run: () => moveSelection(-1) },
          { keys: 'Enter', skipOnButtons: true, run: onEnter },
          { keys: 'e', run: editSelected },
          { keys: 'n', run: startNew },
          { keys: 'f', run: favoriteSelected },
          { keys: 'Delete', run: () => void deleteSelected() },
          { keys: 'mod+Backspace', run: () => void deleteSelected() },
          { keys: 'Escape', run: closeSelected },
        ]
      : []),
  ];
  useHotkeys(bindings, !paletteOpen && !helpOpen && !backupOpen);

  const commands: PaletteCommand[] = [
    { id: 'new', group: 'Assets', label: 'New asset', keys: 'N', run: startNew },
    {
      id: 'copy',
      group: 'Assets',
      label: 'Copy selected asset',
      keys: 'Enter',
      disabled: !selected,
      run: () => selected && void copyAsset(selected),
    },
    {
      id: 'edit',
      group: 'Assets',
      label: 'Edit selected asset',
      keys: 'E',
      disabled: !selected,
      run: editSelected,
    },
    {
      id: 'favorite',
      group: 'Assets',
      label: 'Toggle favorite',
      keys: 'F',
      disabled: !selected,
      run: favoriteSelected,
    },
    {
      id: 'delete',
      group: 'Assets',
      label: 'Delete selected asset',
      keys: 'Del',
      disabled: !selected,
      run: () => void deleteSelected(),
    },
    {
      id: 'new-template',
      group: 'Templates',
      label: 'New template',
      run: () => void newTemplate(),
    },
    { id: 'go-all', group: 'Go to', label: 'All assets', run: () => setView('all') },
    {
      id: 'go-favorites',
      group: 'Go to',
      label: 'Favorites',
      run: () => setView('favorites'),
    },
    {
      id: 'go-templates',
      group: 'Go to',
      label: 'Templates',
      run: () => setView('templates'),
    },
    {
      id: 'examples',
      group: 'Vault',
      label: 'Load example snippets',
      run: () => void seedExamples().catch(() => undefined),
    },
    {
      id: 'backup',
      group: 'Vault',
      label: 'Back up and restore…',
      run: () => setBackupOpen(true),
    },
    {
      id: 'shortcuts',
      group: 'Help',
      label: 'Keyboard shortcuts',
      keys: '?',
      run: () => setHelpOpen(true),
    },

    ...(process.env.NODE_ENV === 'development'
      ? [
          {
            id: 'dev-add',
            group: 'Dev',
            label: 'Add 5,000 test assets',
            run: () => void import('@/lib/devTools').then((m) => m.addTestAssets()),
          },
          {
            id: 'dev-remove',
            group: 'Dev',
            label: 'Remove test assets',
            run: () => void import('@/lib/devTools').then((m) => m.removeTestAssets()),
          },
        ]
      : []),
  ];

  const hints: Hint[] = [
    ...(view === 'templates'
      ? []
      : mode !== 'view'
        ? [{ keys: mod('S'), label: 'save' }]
        : selected
          ? [
              { keys: 'Enter', label: 'copy' },
              { keys: 'E', label: 'edit' },
              { keys: 'F', label: 'favorite' },
            ]
          : [
              { keys: 'N', label: 'new' },
              { keys: '/', label: 'search' },
            ]),
    { keys: mod('K'), label: 'commands' },
    ...(mode === 'view' ? [{ keys: '?', label: 'shortcuts' }] : []),
  ];

  const favoritesCount = assets.filter((a) => a.favorite).length;
  const detailOpen = Boolean(id) || mode === 'new';

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-1.5 focus:text-sm focus:text-accent-ink"
      >
        Skip to content
      </a>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar
          view={view}
          counts={{
            all: assets.length,
            favorites: favoritesCount,
            templates: templateCount,
          }}
          onChange={setView}
          onOpenBackup={() => setBackupOpen(true)}
          className={`${detailOpen ? 'hidden md:flex' : 'flex'} border-b md:border-b-0`}
        />

        {view === 'templates' ? (
          status === 'ready' ? (
            <TemplatesView
              selectedId={id}
              onSelect={selectAsset}
              onCreate={() => void newTemplate()}
              detailOpen={detailOpen}
            />
          ) : status === 'error' ? (
            <div className="flex flex-1 bg-panel">
              <VaultError message={error} onRetry={() => void init()} />
            </div>
          ) : (
            <p className="flex-1 bg-panel p-4 text-sm text-muted">Loading your vault…</p>
          )
        ) : (
          <>
            <section
              aria-label="Assets"
              className={`${detailOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-1 flex-col bg-panel md:w-80 md:flex-none md:border-r md:border-line`}
            >
              {status === 'error' ? (
                <VaultError message={error} onRetry={() => void init()} />
              ) : status !== 'ready' ? (
                <p className="p-4 text-sm text-muted">Loading your vault…</p>
              ) : (
                <>
                  <SearchBar onMove={moveSelection} onSubmit={copyHighlighted} />
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
              id="main"
              tabIndex={-1}
              className={`${detailOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-panel focus:outline-none`}
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
        matchCount={filtering && view !== 'templates' ? visible.length : undefined}
        hints={hints}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
      />
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      {backupOpen && <BackupDialog onClose={() => setBackupOpen(false)} />}
    </div>
  );
}
