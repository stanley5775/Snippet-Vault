import type { AssetType } from '@/types';

export const TYPE_LABEL: Record<AssetType, string> = {
  snippet: 'Snippet',
  tailwind: 'Tailwind classes',
  css: 'CSS',
  svg: 'SVG',
  palette: 'Palette',
};

// Full class names so Tailwind can detect them
export const TYPE_EDGE: Record<AssetType, string> = {
  snippet: 'bg-t-snippet',
  tailwind: 'bg-t-tailwind',
  css: 'bg-t-css',
  svg: 'bg-t-svg',
  palette: 'bg-t-palette',
};
