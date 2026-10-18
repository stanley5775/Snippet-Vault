import { describe, expect, it } from 'vitest';
import { parsePalette } from './palette';

describe('parsePalette', () => {
  it('returns valid hex colors', () => {
    expect(parsePalette('["#fff", "#0F172A"]')).toEqual(['#fff', '#0F172A']);
  });
  it('returns null for invalid JSON or non-arrays', () => {
    expect(parsePalette('not json')).toBeNull();
    expect(parsePalette('{"a":1}')).toBeNull();
  });
  it('drops entries that are not hex colors', () => {
    expect(parsePalette('["#fff", "red", 5, "#12"]')).toEqual(['#fff']);
  });
});
