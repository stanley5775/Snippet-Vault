import { describe, expect, it } from 'vitest';
import { generateAssets } from '@/lib/devSeed';
import { searchAssets, VaultSearch } from './index';

// The goal is about 50ms on a normal laptop. The limit is generous so this only
// fails on a real regression, not on a slow machine.
const LIMIT_MS = 250;

function time<T>(fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  return [result, performance.now() - start];
}

describe('search at 5,000 assets', () => {
  const assets = Object.fromEntries(generateAssets(5000).map((a) => [a.id, a]));
  const engine = new VaultSearch();

  it('builds the index and answers the first query', () => {
    const [results, ms] = time(() => searchAssets(assets, 'debounce', engine));
    console.log(
      `first search including indexing: ${ms.toFixed(0)}ms, ${results.length} results`,
    );
    expect(results.length).toBeGreaterThan(0);
    expect(ms).toBeLessThan(5000);
  });

  it('answers warm queries quickly', () => {
    searchAssets(assets, 'warm', engine);
    for (const query of [
      'debounce',
      'button grid',
      'fetch #generated',
      'lang:ts hook',
      'gradiant',
    ]) {
      const [, ms] = time(() => searchAssets(assets, query, engine));
      console.log(`"${query}": ${ms.toFixed(1)}ms`);
      expect(ms).toBeLessThan(LIMIT_MS);
    }
  });

  it('applies a single edit without re-indexing everything', () => {
    searchAssets(assets, 'warm', engine);
    const edited = {
      ...assets,
      ast_dev_10: { ...assets.ast_dev_10, title: 'zebra unique', updatedAt: 1 },
    };
    const [results, ms] = time(() => searchAssets(edited, 'zebra', engine));
    expect(results.map((a) => a.id)).toEqual(['ast_dev_10']);
    expect(ms).toBeLessThan(LIMIT_MS);
  });
});
