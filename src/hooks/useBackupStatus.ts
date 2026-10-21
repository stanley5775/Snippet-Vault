import { useSyncExternalStore } from 'react';
import {
  formatBackupAge,
  isBackupStale,
  readLastBackup,
  subscribeBackup,
} from '@/lib/backup/meta';

export function useBackupLabel(): string {
  return useSyncExternalStore(
    subscribeBackup,
    () => formatBackupAge(readLastBackup(), Date.now()),
    () => '',
  );
}

/** True when there is data worth protecting and no recent backup. */
export function useBackupStale(hasData: boolean): boolean {
  return useSyncExternalStore(
    subscribeBackup,
    () => hasData && isBackupStale(readLastBackup(), Date.now()),
    () => false,
  );
}
