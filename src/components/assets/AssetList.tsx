'use client';

import { Star } from 'lucide-react';
import type { Asset } from '@/types';
import { TypeBadge } from './TypeBadge';

function excerpt(content: string) {
  const line = content.split('\n').find((l) => l.trim()) ?? '';
  return line.trim().slice(0, 90);
}

interface Props {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AssetList({ assets, selectedId, onSelect }: Props) {
  return (
    <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto dark:divide-neutral-800">
      {assets.map((a) => {
        const selected = a.id === selectedId;
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onSelect(a.id)}
              aria-current={selected ? 'true' : undefined}
              className={`w-full px-4 py-3 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
                selected ? 'bg-neutral-100 dark:bg-neutral-900' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{a.title}</span>
                {a.favorite && (
                  <Star
                    aria-label="Favorite"
                    className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                  />
                )}
                <span className="ml-auto shrink-0">
                  <TypeBadge type={a.type} />
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-xs text-neutral-500">
                {excerpt(a.content)}
              </p>
              {a.tags.length > 0 && (
                <p className="mt-1 truncate text-xs text-neutral-400">
                  {a.tags
                    .slice(0, 4)
                    .map((t) => `#${t}`)
                    .join(' ')}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
