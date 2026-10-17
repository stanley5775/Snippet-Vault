import type { AssetType } from '@/types';

export const KNOWN_LANGUAGES = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'html',
  'css',
  'scss',
  'json',
  'bash',
  'python',
  'sql',
  'md',
  'svg',
  'yaml',
] as const;
export type KnownLanguage = (typeof KNOWN_LANGUAGES)[number];

const ALIASES: Record<string, KnownLanguage> = {
  typescript: 'ts',
  javascript: 'js',
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  py: 'python',
  markdown: 'md',
  yml: 'yaml',
  htm: 'html',
};

export function normalizeLanguage(input: string): string {
  const value = input.trim().toLowerCase();
  if (!value) return 'text';
  return ALIASES[value] ?? value;
}

export function defaultLanguageFor(type: AssetType): KnownLanguage {
  switch (type) {
    case 'tailwind':
      return 'html';
    case 'css':
      return 'css';
    case 'svg':
      return 'svg';
    case 'palette':
      return 'json';
    default:
      return 'ts';
  }
}
