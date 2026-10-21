import type { Asset, StarterTemplate } from '@/types';

interface Bucket<T> {
  add: T[];
  update: T[];
  unchanged: number;
}

export interface MergePlan {
  assets: Bucket<Asset>;
  templates: Bucket<StarterTemplate>;
}

function plan<T extends { id: string; updatedAt: number }>(
  incoming: T[],
  local: Record<string, T>,
): Bucket<T> {
  // If the file repeats an ID, keep the newest copy
  const newest = new Map<string, T>();
  for (const item of incoming) {
    const seen = newest.get(item.id);
    if (!seen || item.updatedAt > seen.updatedAt) newest.set(item.id, item);
  }

  const result: Bucket<T> = { add: [], update: [], unchanged: 0 };
  for (const item of newest.values()) {
    const existing = Object.hasOwn(local, item.id) ? local[item.id] : undefined;
    if (!existing) result.add.push(item);
    else if (item.updatedAt > existing.updatedAt) result.update.push(item);
    else result.unchanged++; // same or older than what you have: yours wins
  }
  return result;
}

export function planMerge(
  incoming: { assets: Asset[]; templates: StarterTemplate[] },
  local: { assets: Record<string, Asset>; templates: Record<string, StarterTemplate> },
): MergePlan {
  return {
    assets: plan(incoming.assets, local.assets),
    templates: plan(incoming.templates, local.templates),
  };
}

export function hasChanges(p: MergePlan): boolean {
  return (
    p.assets.add.length +
      p.assets.update.length +
      p.templates.add.length +
      p.templates.update.length >
    0
  );
}
