import type { Asset } from '@/types';
import { VaultSearch, vaultSearch } from './engine';
import { parseQuery } from './parseQuery';

export { VaultSearch, tokenize } from './engine';
export { parseQuery } from './parseQuery';

/** Favorites first, then most recently updated. */
export function sortAssets(list: Asset[]): Asset[] {
  return [...list].sort(
    (a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt,
  );
}

export function searchAssets(
  assets: Record<string, Asset>,
  rawQuery: string,
  engine: VaultSearch = vaultSearch,
): Asset[] {
  const query = parseQuery(rawQuery);

  const candidates: Asset[] = query.text
    ? engine
        .search(assets, query.text)
        .map((id) => assets[id])
        .filter((a): a is Asset => Boolean(a))
    : sortAssets(Object.values(assets));

  return candidates.filter(
    (a) =>
      query.tags.every((t) => a.tags.some((tag) => tag.startsWith(t))) &&
      (query.languages.length === 0 || query.languages.includes(a.language)) &&
      (query.types.length === 0 || query.types.includes(a.type)),
  );
}
