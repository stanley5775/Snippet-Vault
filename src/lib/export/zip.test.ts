import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import type { Asset, StarterTemplate, TemplateItem } from '@/types';
import { planZip, zipBytes } from './zip';

const asset = (id: string, title: string, content: string): Asset => ({
  id,
  type: 'snippet',
  title,
  content,
  language: 'ts',
  tags: [],
  favorite: false,
  createdAt: 1,
  updatedAt: 1,
});

const assets = {
  a1: asset('a1', 'Alpha', 'live content'),
  a2: asset('a2', 'Beta', 'changed since freezing'),
};

const item = (
  assetId: string,
  path: string,
  order: number,
  extra: Partial<TemplateItem> = {},
) => ({
  assetId,
  path,
  order,
  ...extra,
});

const template = (
  items: TemplateItem[],
  over: Partial<StarterTemplate> = {},
): StarterTemplate => ({
  id: 't',
  name: 'My Starter',
  description: 'A test starter',
  items,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

const now = new Date(2026, 9, 22, 12);

function plan(t: StarterTemplate, readme = true) {
  const result = planZip(t, assets, { readme, now });
  if (!result.ok) throw new Error(result.reason);
  return result.plan;
}

describe('planZip', () => {
  const items = [
    item('a1', 'src/a.ts', 0),
    item('a2', 'b.css', 1, { frozenContent: 'frozen content' }),
    item('gone', 'c.ts', 2),
  ];

  it('uses live and frozen content, and skips deleted snippets', () => {
    const p = plan(template(items), false);
    expect(p.files).toEqual([
      { path: 'src/a.ts', content: 'live content' },
      { path: 'b.css', content: 'frozen content' },
    ]);
    expect(p.skipped).toEqual(['c.ts']);
    expect(p.filename).toBe('my-starter.zip');
  });

  it('adds a README that lists files and skipped snippets', () => {
    const p = plan(template(items));
    const readme = p.files.find((f) => f.path === 'README.md');
    expect(p.readmeIncluded).toBe(true);
    expect(readme?.content).toContain('# My Starter');
    expect(readme?.content).toContain('A test starter');
    expect(readme?.content).toContain('`src/a.ts`');
    expect(readme?.content).toContain('## Skipped');
    expect(readme?.content).toContain('`c.ts`');
  });

  it('omits the README when switched off', () => {
    expect(plan(template(items), false).files.some((f) => /readme/i.test(f.path))).toBe(
      false,
    );
  });

  it('never overwrites a README the user placed', () => {
    const p = plan(template([item('a1', 'README.md', 0)]));
    expect(p.files.map((f) => f.path)).toEqual(['README.md', 'README.snippet-vault.md']);
    expect(p.files[0].content).toBe('live content');
  });

  it('blocks the download when a path is invalid', () => {
    const result = planZip(template([item('a1', '../x', 0)]), assets, {
      readme: true,
      now,
    });
    expect(result).toEqual({ ok: false, reason: 'Fix 1 file path before downloading.' });
  });

  it('refuses an empty result', () => {
    const result = planZip(template([item('gone', 'c.ts', 0)]), assets, {
      readme: true,
      now,
    });
    expect(result.ok).toBe(false);
  });
});

describe('zipBytes', () => {
  it('builds a real zip that unzips to the planned files', async () => {
    const p = plan(template([item('a1', 'src/a.ts', 0), item('a2', 'b.css', 1)]));
    const unzipped = unzipSync(await zipBytes(p));
    expect(Object.keys(unzipped).sort()).toEqual(['README.md', 'b.css', 'src/a.ts']);
    expect(strFromU8(unzipped['src/a.ts'])).toBe('live content');
  });
});
