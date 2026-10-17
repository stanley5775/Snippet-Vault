import { describe, expect, it } from 'vitest';
import { defaultLanguageFor, normalizeLanguage } from './languages';

describe('normalizeLanguage', () => {
  it('maps aliases and trims/lowercases', () => {
    expect(normalizeLanguage('TypeScript')).toBe('ts');
    expect(normalizeLanguage('  JS ')).toBe('js');
    expect(normalizeLanguage('yml')).toBe('yaml');
  });
  it('keeps custom languages and falls back for empty input', () => {
    expect(normalizeLanguage('Rust')).toBe('rust');
    expect(normalizeLanguage('   ')).toBe('text');
  });
});

describe('defaultLanguageFor', () => {
  it('picks a sensible default per type', () => {
    expect(defaultLanguageFor('tailwind')).toBe('html');
    expect(defaultLanguageFor('palette')).toBe('json');
    expect(defaultLanguageFor('snippet')).toBe('ts');
  });
});
