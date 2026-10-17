'use client';

import { ArrowLeft, Copy, Star, Trash2 } from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import { useVaultStore } from '@/store';
import type { Asset } from '@/types';
import { CodeView } from './CodeView';
import { TypeBadge } from './TypeBadge';

export function AssetDetail({ asset, onBack }: { asset: Asset; onBack: () => void }) {
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const removeAsset = useVaultStore((s) => s.removeAsset);
  const pushToast = useVaultStore((s) => s.pushToast);

  async function handleCopy() {
    const ok = await copyText(asset.content);
    pushToast(
      ok
        ? { message: 'Copied to clipboard', variant: 'success', duration: 1800 }
        : {
            message: 'Copy failed. Select the text and copy it manually.',
            variant: 'error',
          },
    );
  }

  async function handleDelete() {
    try {
      await removeAsset(asset.id);
      onBack();
    } catch {
      // the store already showed an error toast
    }
  }

  const iconButton =
    'rounded-md p-2 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className={`${iconButton} md:hidden`}
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="truncate text-lg font-semibold">{asset.title}</h1>
        <TypeBadge type={asset.type} />
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={asset.favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => void toggleFavorite(asset.id).catch(() => undefined)}
            className={iconButton}
          >
            <Star
              className={`size-4 ${asset.favorite ? 'fill-amber-400 text-amber-400' : ''}`}
            />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={handleDelete}
            className={iconButton}
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-1 inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            <Copy className="size-4" /> Copy
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {asset.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {asset.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono dark:bg-neutral-800">
            {asset.language}
          </span>
          {asset.tags.map((t) => (
            <span key={t} className="text-neutral-500">
              #{t}
            </span>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <CodeView
            key={`${asset.id}:${asset.updatedAt}`}
            code={asset.content}
            language={asset.language}
          />
        </div>
      </div>
    </div>
  );
}
