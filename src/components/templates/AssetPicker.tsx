'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TYPE_LABEL } from '@/lib/assetTypes';
import { searchAssets } from '@/lib/search';
import { useVaultStore } from '@/store';

interface Props {
  title: string;
  confirmLabel: string;
  multiple: boolean;
  excludeIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

export function AssetPicker({
  title,
  confirmLabel,
  multiple,
  excludeIds,
  onClose,
  onConfirm,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const assets = useVaultStore((s) => s.assets);
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string[]>([]);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const candidates = useMemo(() => {
    const excluded = new Set(excludeIds);
    return searchAssets(assets, query).filter((a) => !excluded.has(a.id));
  }, [assets, query, excludeIds]);

  function toggle(id: string) {
    if (!multiple) setChosen([id]);
    else setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-md border border-line bg-panel p-0 text-ink backdrop:bg-black/40"
    >
      <div className="flex max-h-[80vh] flex-col">
        <div className="border-b border-line p-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your assets"
            aria-label="Search assets"
            autoComplete="off"
            spellCheck={false}
            className="mt-3 w-full rounded border border-line bg-surface px-3 py-1.5 text-sm placeholder:text-muted"
          />
        </div>

        <ul className="min-h-40 flex-1 overflow-y-auto">
          {candidates.length === 0 ? (
            <li className="p-6 text-center text-sm text-muted">Nothing to add here.</li>
          ) : (
            candidates.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-3 border-b border-line px-4 py-2.5 text-sm hover:bg-hover">
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    name="picker"
                    checked={chosen.includes(a.id)}
                    onChange={() => toggle(a.id)}
                  />
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {TYPE_LABEL[a.type]}
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>

        <div className="flex justify-end gap-2 border-t border-line p-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={chosen.length === 0}
            onClick={() => onConfirm(chosen)}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {confirmLabel}
            {multiple && chosen.length > 0 ? ` (${chosen.length})` : ''}
          </button>
        </div>
      </div>
    </dialog>
  );
}
