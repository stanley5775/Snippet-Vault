import { describe, expect, it } from 'vitest';
import type { Asset } from '@/types';
import {
  fileExtension,
  pathConflicts,
  slugify,
  suggestPath,
  validatePath,
} from './paths';

const asset = (over: Partial<Asset> = {}): Asset => ({
  id: '1',
  type: 'snippet',
  title: 'Auth Middleware!',
  content: '',
  language: 'ts',
  tags: [],
  favorite: false,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

describe('validatePath', () => {
  it('accepts normal relative paths', () => {
    expect(validatePath('src/components/Button.tsx')).toBeNull();
    expect(validatePath('README.md')).toBeNull();
    expect(validatePath('.env.example')).toBeNull();
  });

  it('rejects empty, absolute, trailing-slash, and padded paths', () => {
    expect(validatePath('')).not.toBeNull();
    expect(validatePath('/etc/passwd')).not.toBeNull();
    expect(validatePath('src/')).not.toBeNull();
    expect(validatePath(' a.ts')).not.toBeNull();
  });

  it('rejects traversal and dot folders', () => {
    expect(validatePath('../secrets.txt')).not.toBeNull();
    expect(validatePath('a/../b.txt')).not.toBeNull();
    expect(validatePath('./a.txt')).not.toBeNull();
  });

  it('rejects backslashes, empty folders, and illegal characters', () => {
    expect(validatePath('src\\a.ts')).not.toBeNull();
    expect(validatePath('src//a.ts')).not.toBeNull();
    expect(validatePath('a?.ts')).not.toBeNull();
    expect(validatePath('a:b.ts')).not.toBeNull();
  });

  it('rejects names ending in a dot', () => {
    expect(validatePath('a.')).not.toBeNull();
  });
});

describe('pathConflicts', () => {
  it('flags duplicates case-insensitively', () => {
    const result = pathConflicts(['a.ts', 'A.ts', 'b.ts']);
    expect(result.has('a.ts')).toBe(true);
    expect(result.has('b.ts')).toBe(false);
  });

  it('flags a path used as both a file and a folder', () => {
    expect(pathConflicts(['src', 'src/a.ts']).has('src')).toBe(true);
  });

  it('returns nothing for a clean list', () => {
    expect(pathConflicts(['a.ts', 'src/b.ts']).size).toBe(0);
  });
});

describe('suggestPath', () => {
  it('builds a slug with the right extension and keeps it unique', () => {
    expect(suggestPath(asset(), new Set())).toBe('auth-middleware.ts');
    expect(suggestPath(asset(), new Set(['auth-middleware.ts']))).toBe(
      'auth-middleware-2.ts',
    );
  });

  it('uses txt for Tailwind class lists', () => {
    expect(
      suggestPath(
        asset({ type: 'tailwind', title: 'Button', language: 'html' }),
        new Set(),
      ),
    ).toBe('button.txt');
  });
});

describe('fileExtension and slugify', () => {
  it('maps languages, with sensible fallbacks', () => {
    expect(fileExtension({ type: 'snippet', language: 'rust' })).toBe('rs');
    expect(fileExtension({ type: 'snippet', language: 'weird language!' })).toBe('txt');
    expect(fileExtension({ type: 'palette', language: 'json' })).toBe('json');
  });
  it('falls back for titles with no usable characters', () => {
    expect(slugify('!!!')).toBe('asset');
  });
});
