'use client';

import { X } from 'lucide-react';
import { useVaultStore } from '@/store';

export function SearchBar() {
  const query = useVaultStore((s) => s.query);
  const setQuery = useVaultStore((s) => s.setQuery);

  return (
    <div className="relative border-b border-line p-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && query) {
            e.preventDefault();
            setQuery('');
          }
        }}
        placeholder="Search or filter: #tag lang:ts type:svg"
        aria-label="Search assets"
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded border border-line bg-surface py-1.5 pr-8 pl-3 text-sm placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery('')}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-muted hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
