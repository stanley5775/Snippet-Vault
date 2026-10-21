import { describe, expect, it } from 'vitest';
import type { Asset, StarterTemplate } from '@/types';
import { hasChanges, planMerge } from './merge';

const asset = (id: string, updatedAt: number, title = id): Asset => ({
  id,
  type: 'snippet',
  title,
  content: '',
  language: 'ts',
  tags: [],
  favorite: false,
  createdAt: 1,
  updatedAt,
});

const template = (id: string, updatedAt: number): StarterTemplate => ({
  id,
  name: id,
  items: [],
  createdAt: 1,
  updatedAt,
});

const noTemplates = { templates: [] as StarterTemplate[] };
const noLocalTemplates = { templates: {} as Record<string, StarterTemplate> };

describe('planMerge', () => {
  it('adds new, updates newer, and leaves older or equal ones alone', () => {
    const local = {
      assets: { a: asset('a', 5), b: asset('b', 5), c: asset('c', 5) },
      ...noLocalTemplates,
    };
    const incoming = {
      assets: [asset('a', 9), asset('b', 5), asset('c', 1), asset('d', 1)],
      ...noTemplates,
    };
    const plan = planMerge(incoming, local);
    expect(plan.assets.update.map((a) => a.id)).toEqual(['a']);
    expect(plan.assets.add.map((a) => a.id)).toEqual(['d']);
    expect(plan.assets.unchanged).toBe(2);
  });

  it('keeps the newest copy when the file repeats an id', () => {
    const plan = planMerge(
      { assets: [asset('a', 1, 'old'), asset('a', 3, 'new')], ...noTemplates },
      { assets: {}, ...noLocalTemplates },
    );
    expect(plan.assets.add).toHaveLength(1);
    expect(plan.assets.add[0].title).toBe('new');
  });

  it('handles templates the same way', () => {
    const plan = planMerge(
      { assets: [], templates: [template('t1', 9), template('t2', 1)] },
      { assets: {}, templates: { t1: template('t1', 5) } },
    );
    expect(plan.templates.update.map((t) => t.id)).toEqual(['t1']);
    expect(plan.templates.add.map((t) => t.id)).toEqual(['t2']);
  });

  it('reports whether anything would change', () => {
    const local = { assets: { a: asset('a', 5) }, ...noLocalTemplates };
    expect(
      hasChanges(planMerge({ assets: [asset('a', 5)], ...noTemplates }, local)),
    ).toBe(false);
    expect(
      hasChanges(planMerge({ assets: [asset('b', 1)], ...noTemplates }, local)),
    ).toBe(true);
  });
});
