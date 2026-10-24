'use client';

import Link from 'next/link';
import { useBackupLabel, useBackupStale } from '@/hooks/useBackupStatus';
import type { View } from '@/hooks/useWorkspaceParams';
import { FEEDBACK_URL } from '@/lib/site';

interface Props {
  view: View;
  counts: { all: number; favorites: number; templates: number };
  onChange: (view: View) => void;
  onOpenBackup: () => void;
  className?: string;
}

const row =
  'flex shrink-0 items-center justify-between gap-3 rounded px-2.5 py-1.5 text-left text-sm whitespace-nowrap transition-colors';
const quiet = `${row} text-muted hover:bg-hover hover:text-ink`;

export function Sidebar({ view, counts, onChange, onOpenBackup, className = '' }: Props) {
  const backupLabel = useBackupLabel();
  const backupStale = useBackupStale(counts.all + counts.templates > 0);

  const items: { view: View; label: string; count: number }[] = [
    { view: 'all', label: 'All assets', count: counts.all },
    { view: 'favorites', label: 'Favorites', count: counts.favorites },
    { view: 'templates', label: 'Templates', count: counts.templates },
  ];

  return (
    <nav
      aria-label="Library"
      className={`gap-0.5 overflow-x-auto border-line bg-surface p-2 md:w-48 md:flex-col md:overflow-visible md:border-r md:p-3 ${className}`}
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
            className={`${row} ${
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
      <button type="button" onClick={onOpenBackup} className={`${quiet} md:mt-auto`}>
        Backup
        <span className={`hidden text-xs md:inline ${backupStale ? 'text-accent' : ''}`}>
          {backupLabel}
        </span>
      </button>
      <Link href="/docs" className={quiet}>
        Docs
      </Link>
      <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className={quiet}>
        Feedback
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </nav>
  );
}
