import { describe, expect, it } from 'vitest';
import { parseQuery } from './parseQuery';

describe('parseQuery', () => {
  it('keeps plain text', () => {
    expect(parseQuery('debounce hook').text).toBe('debounce hook');
  });

  it('extracts and normalizes tags', () => {
    const q = parseQuery('react #Hooks #ui');
    expect(q.tags).toEqual(['hooks', 'ui']);
    expect(q.text).toBe('react');
  });

  it('ignores a lone # or empty operators', () => {
    const q = parseQuery('# lang: type: button');
    expect(q).toEqual({ text: 'button', tags: [], languages: [], types: [] });
  });

  it('normalizes language aliases', () => {
    expect(parseQuery('lang:TypeScript').languages).toEqual(['ts']);
  });

  it('matches types by prefix', () => {
    expect(parseQuery('type:sv').types).toEqual(['svg']);
    expect(parseQuery('type:s').types).toEqual(['snippet', 'svg']);
  });

  it('treats an unknown type as plain text', () => {
    const q = parseQuery('type:foo');
    expect(q.types).toEqual([]);
    expect(q.text).toBe('type:foo');
  });

  it('works with operators anywhere in the query', () => {
    const q = parseQuery('button type:tailwind #ui');
    expect(q.text).toBe('button');
    expect(q.types).toEqual(['tailwind']);
    expect(q.tags).toEqual(['ui']);
  });

  it('handles empty input', () => {
    expect(parseQuery('   ')).toEqual({ text: '', tags: [], languages: [], types: [] });
  });
});
