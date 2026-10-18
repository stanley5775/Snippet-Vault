import { describe, expect, it } from 'vitest';
import { isButtonTarget, isTypingTarget, matches } from './hotkeys';

const ev = (
  key: string,
  mods: { meta?: boolean; ctrl?: boolean; alt?: boolean } = {},
) => ({
  key,
  metaKey: Boolean(mods.meta),
  ctrlKey: Boolean(mods.ctrl),
  altKey: Boolean(mods.alt),
});

describe('matches', () => {
  it('matches plain keys, case-insensitively', () => {
    expect(matches(ev('j'), 'j')).toBe(true);
    expect(matches(ev('J'), 'j')).toBe(true);
    expect(matches(ev('k'), 'j')).toBe(false);
  });

  it('does not fire plain bindings when ctrl or cmd is held', () => {
    expect(matches(ev('k', { ctrl: true }), 'k')).toBe(false);
    expect(matches(ev('k', { meta: true }), 'k')).toBe(false);
  });

  it('matches mod combos with either ctrl or cmd', () => {
    expect(matches(ev('k', { ctrl: true }), 'mod+k')).toBe(true);
    expect(matches(ev('k', { meta: true }), 'mod+k')).toBe(true);
    expect(matches(ev('k'), 'mod+k')).toBe(false);
    expect(matches(ev('Backspace', { ctrl: true }), 'mod+Backspace')).toBe(true);
  });

  it('matches special keys and ignores shift', () => {
    expect(matches(ev('?'), '?')).toBe(true);
    expect(matches(ev('Enter'), 'Enter')).toBe(true);
    expect(matches(ev('Delete'), 'Delete')).toBe(true);
  });

  it('never matches when alt is held', () => {
    expect(matches(ev('j', { alt: true }), 'j')).toBe(false);
  });
});

describe('isTypingTarget', () => {
  it('is true for inputs, textareas, selects, and contenteditable', () => {
    expect(isTypingTarget({ tagName: 'INPUT' })).toBe(true);
    expect(isTypingTarget({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isTypingTarget({ tagName: 'SELECT' })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
  });

  it('is false for everything else', () => {
    expect(isTypingTarget({ tagName: 'DIV' })).toBe(false);
    expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe('isButtonTarget', () => {
  it('detects elements inside a button or link', () => {
    expect(isButtonTarget({ tagName: 'SPAN', closest: () => ({}) })).toBe(true);
    expect(isButtonTarget({ tagName: 'DIV', closest: () => null })).toBe(false);
    expect(isButtonTarget(null)).toBe(false);
  });
});
