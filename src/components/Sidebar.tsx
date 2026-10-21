'use client';

import type { View } from '@/hooks/useWorkspaceParams';

interface Props {
  view: View;
  counts: { all: number; favorites: number; templates: number };
  onChange: (view: View) => void;
  className?: string;
}

export function Sidebar({ view, counts, onChange, className = '' }: Props) {
  const items: { view: View; label: string; count: number }[] = [
    { view: 'all', label: 'All assets', count: counts.all },
    { view: 'favorites', label: 'Favorites', count: counts.favorites },
    { view: 'templates', label: 'Templates', count: counts.templates },
  ];

  return (
    <nav
      className={`gap-0.5 border-line bg-surface p-2 md:w-48 md:flex-col md:border-r md:p-3 ${className}`}
    >
      <p className="hidden px-2.5 pt-1 pb-4 text-[15px] font-semibold tracking-tight md:block">
        Snippet Vault
      </p>
      {items.map((item) => {
        const active = view === item.view;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onChange(item.view)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center justify-between gap-3 rounded px-2.5 py-1.5 text-left text-sm transition-colors ${
              active
                ? 'bg-wash font-medium text-ink'
                : 'text-muted hover:bg-hover hover:text-ink'
            }`}
          >
            {item.label}
            <span className="text-xs text-muted tabular-nums">{item.count}</span>
          </button>
        );
      })}
    </nav>
  );
}
