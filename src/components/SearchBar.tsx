'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useVaultStore } from '@/store';

interface Props {
  onMove: (delta: number) => void;
  onSubmit: () => void;
}

export function SearchBar({ onMove, onSubmit }: Props) {
  const query = useVaultStore((s) => s.query);
  const setQuery = useVaultStore((s) => s.setQuery);
  const input = useRef<HTMLInputElement>(null);

  // Keyboard-first on desktop: start with the search box focused (unless something else has focus).
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
    if (desktop && document.activeElement === document.body) input.current?.focus();
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onMove(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        onMove(-1);
        break;
      case 'Enter':
        e.preventDefault();
        onSubmit();
        break;
      case 'Escape':
        e.preventDefault();
        if (query) setQuery('');
        else e.currentTarget.blur(); // hand the keyboard back to the shortcuts
        break;
    }
  }

  return (
    <div className="relative border-b border-line p-2">
      <input
        ref={input}
        id="asset-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
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
