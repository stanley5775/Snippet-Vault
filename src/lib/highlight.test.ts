import { describe, expect, it } from 'vitest';
import { highlight } from './highlight';

describe('highlight', () => {
  it('highlights known languages', async () => {
    const html = await highlight('const a = 1;', 'ts');
    expect(html).toContain('shiki');
    expect(html).toContain('--shiki-light');
  });

  it('falls back to plain text for unknown languages', async () => {
    const html = await highlight('hello', 'not-a-language');
    expect(html).toContain('hello');
  });

  it('escapes HTML in code', async () => {
    const html = await highlight('<script>alert(1)</script>', 'html');
    expect(html).not.toContain('<script>');
  });
});
