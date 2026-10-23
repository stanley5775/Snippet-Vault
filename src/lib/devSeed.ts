import type { Asset, AssetType } from '@/types';

const WORDS = [
  'button',
  'modal',
  'fetch',
  'debounce',
  'grid',
  'flex',
  'theme',
  'auth',
  'form',
  'table',
  'chart',
  'cache',
  'hook',
  'layout',
  'gradient',
  'shadow',
  'router',
  'query',
  'store',
  'parser',
];
const TYPES: AssetType[] = ['snippet', 'tailwind', 'css', 'svg', 'palette'];
const LANGUAGES = ['ts', 'tsx', 'js', 'css', 'html', 'json'];

function pick<T>(list: T[], i: number, salt: number): T {
  return list[(i * 7 + salt * 13) % list.length];
}

/** Fake assets for performance checks. IDs start with ast_dev_ so they are easy to remove. */
export function generateAssets(count: number, now = Date.now()): Asset[] {
  return Array.from({ length: count }, (_, i) => {
    const first = pick(WORDS, i, 1);
    const second = pick(WORDS, i, 2);
    const hook = `use${second[0].toUpperCase()}${second.slice(1)}`;
    return {
      id: `ast_dev_${i}`,
      type: TYPES[i % TYPES.length],
      title: `${first} ${second} ${i}`,
      description: `Generated asset about ${first}`,
      content: Array.from(
        { length: 12 },
        (_, line) => `const ${first}${line} = ${hook}(${i}, ${line});`,
      ).join('\n'),
      language: LANGUAGES[i % LANGUAGES.length],
      tags: ['generated', first, second],
      favorite: i % 50 === 0,
      createdAt: now - i * 1000,
      updatedAt: now - i * 1000,
    };
  });
}
