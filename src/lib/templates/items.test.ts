import { describe, expect, it } from 'vitest';
import type { Asset, StarterTemplate, TemplateItem } from '@/types';
import {
  addItems,
  moveItem,
  removeItem,
  resolveTemplate,
  setFrozen,
  swapItem,
  templateIssues,
} from './items';

const asset = (over: Partial<Asset> & Pick<Asset, 'id' | 'title'>): Asset => ({
  type: 'snippet',
  content: '',
  language: 'ts',
  tags: [],
  favorite: false,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

const item = (
  assetId: string,
  order: number,
  extra: Partial<TemplateItem> = {},
): TemplateItem => ({
  assetId,
  path: `${assetId}.ts`,
  order,
  ...extra,
});

describe('addItems', () => {
  it('adds assets with suggested paths in order, skipping duplicates', () => {
    const a1 = asset({ id: 'a1', title: 'One' });
    const a2 = asset({ id: 'a2', title: 'Two', type: 'css', language: 'css' });
    const added = addItems([], [a1, a2, a1]);
    expect(added.map((i) => i.path)).toEqual(['one.ts', 'two.css']);
    expect(added.map((i) => i.order)).toEqual([0, 1]);
    expect(addItems(added, [a1])).toHaveLength(2);
  });
});

describe('removeItem and moveItem', () => {
  const items = [item('a', 0), item('b', 1), item('c', 2)];

  it('removes and renumbers', () => {
    const next = removeItem(items, 'b');
    expect(next.map((i) => i.assetId)).toEqual(['a', 'c']);
    expect(next.map((i) => i.order)).toEqual([0, 1]);
  });

  it('moves up and down, and ignores moves past the ends', () => {
    expect(moveItem(items, 'b', -1).map((i) => i.assetId)).toEqual(['b', 'a', 'c']);
    expect(moveItem(items, 'b', 1).map((i) => i.assetId)).toEqual(['a', 'c', 'b']);
    expect(moveItem(items, 'a', -1).map((i) => i.assetId)).toEqual(['a', 'b', 'c']);
  });
});

describe('setFrozen and swapItem', () => {
  it('freezes content and unfreezes by removing the key', () => {
    const frozen = setFrozen([item('a', 0)], 'a', 'snapshot');
    expect(frozen[0].frozenContent).toBe('snapshot');
    const live = setFrozen(frozen, 'a', undefined);
    expect('frozenContent' in live[0]).toBe(false);
  });

  it('swaps the asset, keeping path and order, and drops any frozen copy', () => {
    const swapped = swapItem(
      [item('a', 0, { frozenContent: 'x' }), item('b', 1)],
      'a',
      'z',
    );
    expect(swapped[0]).toEqual({ assetId: 'z', path: 'a.ts', order: 0 });
  });

  it('refuses to swap in an asset that is already in the template', () => {
    const items = [item('a', 0), item('b', 1)];
    expect(swapItem(items, 'a', 'b')).toBe(items);
  });
});

describe('resolveTemplate', () => {
  const assets = {
    a1: asset({ id: 'a1', title: 'One', content: 'live1' }),
    a2: asset({ id: 'a2', title: 'Two', content: 'new' }),
    a3: asset({ id: 'a3', title: 'Three', content: 'x' }),
  };
  const template: StarterTemplate = {
    id: 't',
    name: 'T',
    createdAt: 1,
    updatedAt: 1,
    items: [
      item('a1', 0),
      item('a2', 1, { frozenContent: 'old' }),
      item('gone', 2),
      item('gone2', 3, { frozenContent: 'kept' }),
      item('a3', 4, { path: '../x' }),
    ],
  };
  const resolved = resolveTemplate(template, assets);

  it('classifies live, frozen, and missing items', () => {
    expect(resolved.map((r) => r.status)).toEqual([
      'live',
      'frozen',
      'missing',
      'frozen',
      'live',
    ]);
  });

  it('marks a frozen copy as stale when the live snippet changed', () => {
    expect(resolved.map((r) => r.stale)).toEqual([false, true, false, false, false]);
  });

  it('keeps content for frozen items even when the snippet was deleted', () => {
    expect(resolved.map((r) => r.content)).toEqual([
      'live1',
      'old',
      undefined,
      'kept',
      'x',
    ]);
  });

  it('reports path problems and counts issues', () => {
    expect(resolved.map((r) => r.pathError === null)).toEqual([
      true,
      true,
      true,
      true,
      false,
    ]);
    expect(templateIssues(resolved)).toEqual({
      missing: 1,
      badPaths: 1,
      problemItems: 2,
    });
  });

  it('flags duplicate paths on every file involved', () => {
    const dupes = resolveTemplate(
      {
        ...template,
        items: [item('a1', 0, { path: 'a.ts' }), item('a2', 1, { path: 'A.ts' })],
      },
      assets,
    );
    expect(dupes.every((r) => r.pathError !== null)).toBe(true);
  });
});
