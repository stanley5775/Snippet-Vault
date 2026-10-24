import { describe, expect, it } from 'vitest';
import { REPO_URL } from './site';

describe('site constants', () => {
  it('points at a real GitHub repository, not the placeholder', () => {
    expect(REPO_URL).not.toContain('YOUR-USERNAME');
    expect(REPO_URL).toMatch(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/);
  });
});
