import type { NewAssetInput } from '@/lib/db';
import { useVaultStore } from '@/store';

const SEEDED_KEY = 'snippet-vault:seeded';

/** True only on a user's first run with an empty vault. Marks the flag either way. */
export function claimFirstRunSeed(hasAssets: boolean): boolean {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return false;
    localStorage.setItem(SEEDED_KEY, '1');
    return !hasAssets;
  } catch {
    return false;
  }
}

export const SEEDS: NewAssetInput[] = [
  {
    type: 'tailwind',
    title: 'Primary button',
    description: 'Indigo button with hover and focus ring.',
    tags: ['button', 'ui'],
    content:
      'inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  },
  {
    type: 'css',
    title: 'Fade in up',
    description: 'Subtle entrance. Use: animation: fade-in-up 0.4s ease-out both;',
    tags: ['animation', 'keyframes'],
    content: [
      '@keyframes fade-in-up {',
      '  from {',
      '    opacity: 0;',
      '    transform: translateY(8px);',
      '  }',
      '  to {',
      '    opacity: 1;',
      '    transform: translateY(0);',
      '  }',
      '}',
    ].join('\n'),
  },
  {
    type: 'snippet',
    title: 'useDebounce hook',
    description: 'Delays updating a value until it stops changing.',
    tags: ['react', 'hooks'],
    content: [
      "import { useEffect, useState } from 'react';",
      '',
      'export function useDebounce<T>(value: T, delay = 300): T {',
      '  const [debounced, setDebounced] = useState(value);',
      '',
      '  useEffect(() => {',
      '    const timer = setTimeout(() => setDebounced(value), delay);',
      '    return () => clearTimeout(timer);',
      '  }, [value, delay]);',
      '',
      '  return debounced;',
      '}',
    ].join('\n'),
  },
  {
    type: 'snippet',
    title: 'Typed fetch helper',
    tags: ['typescript', 'fetch'],
    content: [
      'export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {',
      '  const res = await fetch(url, init);',
      '  if (!res.ok) throw new Error(`Request failed: ${res.status}`);',
      '  return res.json() as Promise<T>;',
      '}',
    ].join('\n'),
  },
  {
    type: 'svg',
    title: 'Arrow right icon',
    tags: ['icon'],
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  },
  {
    type: 'palette',
    title: 'Slate and sky',
    description: 'Dark UI palette with a sky accent.',
    tags: ['palette', 'dark'],
    content: JSON.stringify(
      ['#0f172a', '#1e293b', '#38bdf8', '#f1f5f9', '#f59e0b'],
      null,
      2,
    ),
  },
];

export async function seedExamples() {
  const { createAsset } = useVaultStore.getState();
  for (const seed of SEEDS) await createAsset(seed);
}
