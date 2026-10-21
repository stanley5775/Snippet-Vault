import type { Asset, StarterTemplate, TemplateItem } from '@/types';
import { pathConflicts, suggestPath, validatePath } from './paths';

export const DEFAULT_TEMPLATE_NAME = 'Untitled template';

const byOrder = (items: TemplateItem[]) => [...items].sort((a, b) => a.order - b.order);
const renumber = (items: TemplateItem[]) =>
  items.map((item, order) => ({ ...item, order }));

/** Appends assets with suggested unique paths. Assets already present are skipped. */
export function addItems(items: TemplateItem[], assets: Asset[]): TemplateItem[] {
  const next = byOrder(items);
  const taken = new Set(next.map((i) => i.path.toLowerCase()));
  const present = new Set(next.map((i) => i.assetId));
  for (const asset of assets) {
    if (present.has(asset.id)) continue;
    const path = suggestPath(asset, taken);
    taken.add(path.toLowerCase());
    present.add(asset.id);
    next.push({ assetId: asset.id, path, order: next.length });
  }
  return renumber(next);
}

export function removeItem(items: TemplateItem[], assetId: string): TemplateItem[] {
  return renumber(byOrder(items).filter((i) => i.assetId !== assetId));
}

export function moveItem(
  items: TemplateItem[],
  assetId: string,
  delta: -1 | 1,
): TemplateItem[] {
  const list = byOrder(items);
  const from = list.findIndex((i) => i.assetId === assetId);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= list.length) return renumber(list);
  [list[from], list[to]] = [list[to], list[from]];
  return renumber(list);
}

export function setItemPath(
  items: TemplateItem[],
  assetId: string,
  path: string,
): TemplateItem[] {
  return items.map((i) => (i.assetId === assetId ? { ...i, path } : i));
}

/** Pass content to freeze, or undefined to unfreeze (go back to the live snippet). */
export function setFrozen(
  items: TemplateItem[],
  assetId: string,
  content: string | undefined,
): TemplateItem[] {
  return items.map((item) => {
    if (item.assetId !== assetId) return item;
    const copy = { ...item };
    if (content === undefined) delete copy.frozenContent;
    else copy.frozenContent = content;
    return copy;
  });
}

/** Points an item at a different asset, keeping its path and position. The new link is live. */
export function swapItem(
  items: TemplateItem[],
  oldId: string,
  newId: string,
): TemplateItem[] {
  if (items.some((i) => i.assetId === newId)) return items;
  return items.map((i) =>
    i.assetId === oldId ? { assetId: newId, path: i.path, order: i.order } : i,
  );
}

export type ItemStatus = 'live' | 'frozen' | 'missing';

export interface ResolvedItem {
  item: TemplateItem;
  asset?: Asset;
  status: ItemStatus;
  /** Frozen, and the live snippet has changed since. */
  stale: boolean;
  /** What would be written at download: the frozen copy, else the live content. */
  content?: string;
  pathError: string | null;
}

export function resolveTemplate(
  template: StarterTemplate,
  assets: Record<string, Asset>,
): ResolvedItem[] {
  const items = byOrder(template.items);
  const conflicts = pathConflicts(items.map((i) => i.path));

  return items.map((item) => {
    const asset = assets[item.assetId];
    const frozen = item.frozenContent !== undefined;
    return {
      item,
      asset,
      status: frozen ? 'frozen' : asset ? 'live' : 'missing',
      stale: frozen && asset !== undefined && asset.content !== item.frozenContent,
      content: frozen ? item.frozenContent : asset?.content,
      pathError:
        validatePath(item.path) ?? conflicts.get(item.path.toLowerCase()) ?? null,
    };
  });
}

export function templateIssues(resolved: ResolvedItem[]) {
  return {
    /** Live items whose snippet was deleted. They are skipped at download. */
    missing: resolved.filter((r) => r.status === 'missing').length,
    /** Path problems. These block the download. */
    badPaths: resolved.filter((r) => r.pathError).length,
    /** Items needing attention, for list badges. */
    problemItems: resolved.filter((r) => r.status === 'missing' || r.pathError).length,
  };
}
