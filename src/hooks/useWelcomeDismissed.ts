import { useSyncExternalStore } from 'react';
import { readWelcomeDismissed, subscribeWelcome } from '@/lib/welcome';

export function useWelcomeDismissed(): boolean {
  return useSyncExternalStore(subscribeWelcome, readWelcomeDismissed, () => true);
}
