'use client';

import { ArrowLeft, Copy, Pencil, Star, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { COPIED_EVENT, copyAsset } from '@/lib/actions';
import { TYPE_LABEL } from '@/lib/assetTypes';
import { useVaultStore } from '@/store';
import type { Asset } from '@/types';
import { AssetPreview } from './AssetPreview';
import { CodeView } from './CodeView';

const ghostButton =
  'rounded p-2 text-muted transition-colors hover:bg-hover hover:text-ink';

interface Props {
  asset: Asset;
  onBack: () => void;
  onEdit: () => void;
}

export function AssetDetail({ asset, onBack, onEdit }: Props) {
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const removeAsset = useVaultStore((s) => s.removeAsset);
  const codeRef = useRef<HTMLDivElement>(null);

  // Brief outline on the code block whenever an asset is copied (button, Enter, or search)
  useEffect(() => {
    function flash() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      codeRef.current?.animate(
        [
          { boxShadow: '0 0 0 2px var(--accent)' },
          { boxShadow: '0 0 0 2px transparent' },
        ],
        { duration: 700, easing: 'ease-out' },
      );
    }
    window.addEventListener(COPIED_EVENT, flash);
    return () => window.removeEventListener(COPIED_EVENT, flash);
  }, []);

  async function handleDelete() {
    try {
      await removeAsset(asset.id);
      onBack();
    } catch {
      // the store already reported the failure
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4 md:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to list"
          className={`${ghostButton} -ml-2 md:hidden`}
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">{asset.title}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {TYPE_LABEL[asset.type]}
            <span className="font-code text-xs">{asset.language}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={asset.favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => void toggleFavorite(asset.id).catch(() => undefined)}
            className={ghostButton}
          >
            <Star
              className={`size-4 ${asset.favorite ? 'fill-accent text-accent' : ''}`}
            />
          </button>
          <button
            type="button"
            aria-label="Edit asset"
            onClick={onEdit}
            className={ghostButton}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Delete asset"
            onClick={handleDelete}
            className={ghostButton}
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void copyAsset(asset)}
            className="ml-1 inline-flex items-center gap-2 rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            <Copy className="size-4" />
            Copy
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
        <div className="max-w-3xl space-y-4">
          {asset.description && (
            <p className="max-w-prose text-sm leading-6">{asset.description}</p>
          )}
          {asset.tags.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
              {asset.tags.map((t) => (
                <li key={t}>#{t}</li>
              ))}
            </ul>
          )}
          <AssetPreview type={asset.type} content={asset.content} />
          <div
            ref={codeRef}
            className="overflow-hidden rounded-md border border-line bg-surface"
          >
            <CodeView
              key={`${asset.id}:${asset.updatedAt}`}
              code={asset.content}
              language={asset.language}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
