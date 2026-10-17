import { describe, expect, it } from 'vitest';
import { normalizeTags } from './tags';

describe('normalizeTags', () => {
  it('trims, lowercases, strips #, dedupes, and drops empties', () => {
    expect(normalizeTags(['#UI', ' ui ', 'Cards', '', '  '])).toEqual(['ui', 'cards']);
  });
  it('turns spaces into dashes', () => {
    expect(normalizeTags(['dark mode'])).toEqual(['dark-mode']);
  });
});
