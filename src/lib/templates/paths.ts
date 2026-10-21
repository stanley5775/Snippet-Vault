import type { Asset } from '@/types';

function hasControlChar(text: string): boolean {
  for (const ch of text) {
    if (ch.charCodeAt(0) < 32) return true;
  }
  return false;
}

/** Returns a problem description, or null if the path is fine. */
export function validatePath(path: string): string | null {
  if (!path) return 'Enter a file path.';
  if (path !== path.trim()) return 'Remove spaces at the start or end.';
  if (path.length > 200) return 'Use a shorter path (200 characters max).';
  if (path.startsWith('/')) return 'Use a relative path, without a leading slash.';
  if (path.endsWith('/')) return 'The path must end with a file name.';
  if (path.includes('\\')) return 'Use forward slashes (/).';
  if (hasControlChar(path) || /[<>:"|?*]/.test(path)) {
    return 'Remove characters that are not allowed in file names: < > : " | ? *';
  }
  for (const segment of path.split('/')) {
    if (segment === '') return 'The path has an empty folder name.';
    if (segment === '.' || segment === '..')
      return 'Paths cannot contain "." or ".." folders.';
    if (segment.length > 100)
      return 'A folder or file name is too long (100 characters max).';
    if (segment.endsWith('.') || segment.endsWith(' ')) {
      return 'Names cannot end with a dot or a space.';
    }
  }
  return null;
}

/** Map of lowercased path to message, for paths that clash with another file. */
export function pathConflicts(paths: string[]): Map<string, string> {
  const lower = paths.map((p) => p.toLowerCase());
  const counts = new Map<string, number>();
  for (const p of lower) counts.set(p, (counts.get(p) ?? 0) + 1);

  const conflicts = new Map<string, string>();
  for (const p of lower) {
    if ((counts.get(p) ?? 0) > 1) {
      conflicts.set(p, 'Another file already uses this path.');
    } else if (lower.some((q) => q.startsWith(`${p}/`))) {
      conflicts.set(p, 'This path is also used as a folder by another file.');
    }
  }
  return conflicts;
}

const EXT_BY_LANGUAGE: Record<string, string> = {
  ts: 'ts',
  tsx: 'tsx',
  js: 'js',
  jsx: 'jsx',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  bash: 'sh',
  python: 'py',
  sql: 'sql',
  md: 'md',
  svg: 'svg',
  yaml: 'yaml',
  rust: 'rs',
  go: 'go',
  ruby: 'rb',
  kotlin: 'kt',
  csharp: 'cs',
};

export function fileExtension(asset: Pick<Asset, 'type' | 'language'>): string {
  if (asset.type === 'tailwind') return 'txt';
  if (asset.type === 'palette') return 'json';
  if (asset.type === 'svg') return 'svg';
  if (Object.hasOwn(EXT_BY_LANGUAGE, asset.language))
    return EXT_BY_LANGUAGE[asset.language];
  return /^[a-z0-9]{1,6}$/.test(asset.language) ? asset.language : 'txt';
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '') || 'asset'
  );
}

/** A default file name from the asset's title, made unique against `taken` (lowercased paths). */
export function suggestPath(asset: Asset, taken: Set<string>): string {
  const base = slugify(asset.title);
  const ext = fileExtension(asset);
  let candidate = `${base}.${ext}`;
  for (let n = 2; taken.has(candidate.toLowerCase()); n++)
    candidate = `${base}-${n}.${ext}`;
  return candidate;
}
