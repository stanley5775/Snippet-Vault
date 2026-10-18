import { describe, expect, it } from 'vitest';
import type { Asset } from '@/types';
import { searchAssets, tokenize, VaultSearch } from './index';

function asset(over: Partial<Asset> & Pick<Asset, 'id' | 'title'>): Asset {
  return {
    type: 'snippet',
    content: '',
    language: 'ts',
    tags: [],
    favorite: false,
    createdAt: 1,
    updatedAt: 1,
    ...over,
  };
}

const toMap = (list: Asset[]) => Object.fromEntries(list.map((a) => [a.id, a]));
const titles = (list: Asset[]) => list.map((a) => a.title);

describe('tokenize', () => {
  it('splits camelCase and keeps the whole word', () => {
    expect(tokenize('useDebounce')).toEqual(['useDebounce', 'use', 'Debounce']);
  });
  it('splits on punctuation', () => {
    expect(tokenize('dark-mode, fade_in')).toEqual(['dark', 'mode', 'fade', 'in']);
  });
});

describe('searchAssets', () => {
  const engine = () => new VaultSearch();

  it('matches by prefix and across camelCase', () => {
    const map = toMap([asset({ id: '1', title: 'useDebounce hook' })]);
    expect(titles(searchAssets(map, 'deb', engine()))).toEqual(['useDebounce hook']);
    expect(titles(searchAssets(map, 'debounce', engine()))).toEqual(['useDebounce hook']);
  });

  it('tolerates typos', () => {
    const map = toMap([asset({ id: '1', title: 'Gradient background' })]);
    expect(titles(searchAssets(map, 'gradiant', engine()))).toEqual([
      'Gradient background',
    ]);
  });

  it('ranks title matches above content matches', () => {
    const map = toMap([
      asset({ id: '1', title: 'Layout helper', content: 'display: flex;' }),
      asset({ id: '2', title: 'Flex center', content: 'align-items: center;' }),
    ]);
    expect(titles(searchAssets(map, 'flex', engine()))[0]).toBe('Flex center');
  });

  it('filters by tag prefix, language, and type', () => {
    const map = toMap([
      asset({ id: '1', title: 'A', tags: ['react'], language: 'tsx' }),
      asset({ id: '2', title: 'B', tags: ['vue'], language: 'js' }),
      asset({ id: '3', title: 'C', type: 'svg', language: 'svg', tags: ['react'] }),
    ]);
    const e = engine();
    expect(titles(searchAssets(map, '#rea', e)).sort()).toEqual(['A', 'C']);
    expect(titles(searchAssets(map, 'lang:js', e))).toEqual(['B']);
    expect(titles(searchAssets(map, 'type:svg', e))).toEqual(['C']);
    expect(titles(searchAssets(map, '#react type:svg', e))).toEqual(['C']);
  });

  it('combines free text with operators', () => {
    const map = toMap([
      asset({ id: '1', title: 'Primary button', type: 'tailwind', tags: ['ui'] }),
      asset({ id: '2', title: 'Button hook', type: 'snippet', tags: ['ui'] }),
    ]);
    expect(titles(searchAssets(map, 'button type:tailwind', engine()))).toEqual([
      'Primary button',
    ]);
  });

  it('reflects edits and deletions', () => {
    const e = engine();
    const original = asset({ id: '1', title: 'Note', content: 'alpha' });
    expect(titles(searchAssets(toMap([original]), 'alpha', e))).toEqual(['Note']);

    const edited = { ...original, content: 'beta', updatedAt: 2 };
    expect(searchAssets(toMap([edited]), 'alpha', e)).toEqual([]);
    expect(titles(searchAssets(toMap([edited]), 'beta', e))).toEqual(['Note']);

    expect(searchAssets({}, 'beta', e)).toEqual([]);
  });

  it('does not index svg or palette content', () => {
    const map = toMap([
      asset({ id: '1', title: 'Icon', type: 'svg', content: '<svg xmlns="x"/>' }),
    ]);
    expect(searchAssets(map, 'xmlns', engine())).toEqual([]);
  });

  it('with no text returns favorites first, then newest', () => {
    const map = toMap([
      asset({ id: '1', title: 'Old', updatedAt: 1 }),
      asset({ id: '2', title: 'New', updatedAt: 3 }),
      asset({ id: '3', title: 'Fav', updatedAt: 2, favorite: true }),
    ]);
    expect(titles(searchAssets(map, '', engine()))).toEqual(['Fav', 'New', 'Old']);
  });
});
