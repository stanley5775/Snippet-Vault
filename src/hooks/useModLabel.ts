import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/** Returns a formatter: mod('K') gives "⌘K" on Mac and "Ctrl K" elsewhere. */
export function useModLabel() {
  const isMac = useSyncExternalStore(
    subscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
  return (key: string) => (isMac ? `⌘${key}` : `Ctrl ${key}`);
}
