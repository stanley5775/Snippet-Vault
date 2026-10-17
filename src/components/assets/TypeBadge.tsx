import type { AssetType } from '@/types';

const STYLES: Record<AssetType, string> = {
  snippet: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  tailwind: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  css: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  svg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  palette: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
};

export function TypeBadge({ type }: { type: AssetType }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STYLES[type]}`}>
      {type}
    </span>
  );
}
