import MiniSearch from 'minisearch';
import type { Asset, AssetType } from '@/types';

interface IndexDoc {
  id: string;
  title: string;
  tags: string;
  description: string;
  content: string;
}

const CONTENT_LIMIT = 2000;
const SKIP_CONTENT: AssetType[] = ['svg', 'palette'];

/** Splits on non-alphanumerics, and also splits camelCase: "useDebounce" -> usedebounce, use, debounce. */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const word of text.split(/[^\p{L}\p{N}]+/u)) {
    if (!word) continue;
    out.push(word);
    const parts = word
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .split(' ');
    if (parts.length > 1) out.push(...parts);
  }
  return out;
}

function toDoc(asset: Asset): IndexDoc {
  return {
    id: asset.id,
    title: asset.title,
    tags: asset.tags.join(' '),
    description: asset.description ?? '',
    content: SKIP_CONTENT.includes(asset.type)
      ? ''
      : asset.content.slice(0, CONTENT_LIMIT),
  };
}

function createIndex() {
  return new MiniSearch<IndexDoc>({
    fields: ['title', 'tags', 'description', 'content'],
    idField: 'id',
    tokenize,
    searchOptions: {
      boost: { title: 3, tags: 2.5, description: 1.5 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
  });
}

export class VaultSearch {
  private index = createIndex();
  private synced: Record<string, Asset> = {};

  /** Brings the index in line with the assets map, touching only what changed. */
  sync(assets: Record<string, Asset>) {
    if (assets === this.synced) return;
    const previous = this.synced;

    if (Object.keys(previous).length === 0) {
      this.index.addAll(Object.values(assets).map(toDoc));
    } else {
      for (const [id, asset] of Object.entries(assets)) {
        if (previous[id] === asset) continue;
        if (this.index.has(id)) this.index.replace(toDoc(asset));
        else this.index.add(toDoc(asset));
      }
      for (const id of Object.keys(previous)) {
        if (!(id in assets) && this.index.has(id)) this.index.discard(id);
      }
    }
    this.synced = assets;
  }

  /** Returns asset ids, best match first. */
  search(assets: Record<string, Asset>, text: string): string[] {
    this.sync(assets);
    return this.index.search(text).map((result) => String(result.id));
  }
}

export const vaultSearch = new VaultSearch();
