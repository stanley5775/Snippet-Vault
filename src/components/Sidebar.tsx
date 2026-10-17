'use client';

import type { View } from '@/hooks/useWorkspaceParams';

interface Props {
  view: View;
  counts: { all: number; favorites: number };
  onChange: (view: View) => void;
  className?: string;
}

export function Sidebar({ view, counts, onChange, className = '' }: Props) {
  const items: { view: View; label: string; count?: number }[] = [
    { view: 'all', label: 'All assets', count: counts.all },
    { view: 'favorites', label: 'Favorites', count: counts.favorites },
    { view: 'templates', label: 'Templates' },
  ];

  return (
    <nav
      className={`gap-1 border-neutral-200 p-3 md:w-56 md:flex-col md:border-r dark:border-neutral-800 ${className}`}
    >
      <p className="hidden px-2 pb-3 text-sm font-semibold md:block">Snippet Vault</p>
      {items.map((item) => (
        <button
          key={item.view}
          type="button"
          onClick={() => onChange(item.view)}
          aria-current={view === item.view ? 'page' : undefined}
          className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
            view === item.view ? 'bg-neutral-100 font-medium dark:bg-neutral-900' : ''
          }`}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="ml-3 text-xs text-neutral-500">{item.count}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
