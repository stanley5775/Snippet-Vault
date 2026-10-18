import { normalizeLanguage } from '@/lib/languages';
import { normalizeTags } from '@/lib/tags';
import { ASSET_TYPES, type AssetType } from '@/types';

export interface ParsedQuery {
  text: string;
  tags: string[]; // all must match (by prefix)
  languages: string[]; // any may match
  types: AssetType[]; // any may match
}

export function parseQuery(input: string): ParsedQuery {
  const text: string[] = [];
  const tags: string[] = [];
  const languages: string[] = [];
  const types: AssetType[] = [];

  for (const token of input.trim().split(/\s+/)) {
    if (!token) continue;

    if (token.startsWith('#')) {
      const [tag] = normalizeTags([token]);
      if (tag) tags.push(tag); // a lone "#" is ignored while typing
      continue;
    }

    const lower = token.toLowerCase();

    if (lower.startsWith('lang:')) {
      const value = lower.slice(5);
      if (value) languages.push(normalizeLanguage(value));
      continue;
    }

    if (lower.startsWith('type:')) {
      const value = lower.slice(5);
      if (!value) continue;
      const matches = ASSET_TYPES.filter((t) => t.startsWith(value));
      if (matches.length > 0) types.push(...matches);
      else text.push(token); // unknown type: treat as plain text
      continue;
    }

    text.push(token);
  }

  return { text: text.join(' '), tags, languages, types };
}
