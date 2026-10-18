'use client';

import { Star } from 'lucide-react';
import { useEffect } from 'react';
import { TYPE_EDGE, TYPE_LABEL } from '@/lib/assetTypes';
import type { Asset } from '@/types';

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
  // Keep the selected row visible when moving with J/K or the arrow keys
  useEffect(() => {
    if (selectedId) {
      document
        .getElementById(`asset-row-${selectedId}`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedId]);

  return (
    <ul className="flex-1 overflow-y-auto">
      {assets.map((a) => {
        const selected = a.id === selectedId;
        return (
          <li key={a.id} className="border-b border-line">
            <button
              type="button"
              id={`asset-row-${a.id}`}
              data-asset-id={a.id}
              onClick={() => onSelect(a.id)}
              aria-current={selected ? 'true' : undefined}
              className={`relative block w-full py-2.5 pr-4 pl-5 text-left transition-colors ${
                selected ? 'bg-wash' : 'hover:bg-hover'
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-[3px] ${TYPE_EDGE[a.type]}`}
              />
              <span className="sr-only">{TYPE_LABEL[a.type]}: </span>
              <span className="flex items-baseline gap-2">
                <span className="truncate text-sm font-medium">{a.title}</span>
                {a.favorite && (
                  <Star
                    aria-label="Favorite"
                    className="size-3 shrink-0 fill-accent text-accent"
                  />
                )}
                <span className="ml-auto shrink-0 font-code text-xs text-muted">
                  {a.language}
                </span>
              </span>
              <span className="mt-0.5 block truncate font-code text-xs text-muted">
                {excerpt(a.content)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
