interface KeyEventLike {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}

/**
 * Combos look like 'j', '/', '?', 'Enter', 'mod+k', 'mod+Backspace'.
 * 'mod' accepts Cmd or Ctrl. Shift is ignored so '?' works on every layout.
 */
export function matches(event: KeyEventLike, combo: string): boolean {
  const parts = combo.split('+');
  const key = parts[parts.length - 1].toLowerCase();
  const wantsMod = parts.slice(0, -1).includes('mod');
  const hasMod = event.metaKey || event.ctrlKey;
  if (wantsMod !== hasMod || event.altKey) return false;
  return event.key.toLowerCase() === key;
}

interface ElementLike {
  tagName: string;
  isContentEditable?: boolean;
  closest?: (selector: string) => unknown;
}

function asElement(target: unknown): ElementLike | null {
  if (
    target &&
    typeof target === 'object' &&
    typeof (target as ElementLike).tagName === 'string'
  ) {
    return target as ElementLike;
  }
  return null;
}

/** True for text fields, selects, and contenteditable areas (like the code editor). */
export function isTypingTarget(target: unknown): boolean {
  const el = asElement(target);
  if (!el) return false;
  if (el.isContentEditable) return true;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

/** Buttons and links, except asset rows (those are handled specially). */
export function isButtonTarget(target: unknown): boolean {
  const el = asElement(target);
  return Boolean(
    el?.closest?.('button:not([data-asset-id]), a, summary, [role="button"]'),
  );
}
