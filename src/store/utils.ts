import type { VaultState } from './types';

export function byId<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export function without<T>(record: Record<string, T>, id: string): Record<string, T> {
  const next = { ...record };
  delete next[id];
  return next;
}

/** Runs a write. On failure: error toast, then re-throw so callers can react. */
export async function guarded<T>(
  get: () => VaultState,
  action: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    get().pushToast({ message: `Couldn't ${action}`, variant: 'error' });
    throw error;
  }
}
