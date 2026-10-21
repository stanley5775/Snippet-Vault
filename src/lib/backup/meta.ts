const KEY = 'snippet-vault:last-backup';
const EVENT = 'vault:backup-changed';
const DAY = 86_400_000;
const STALE_DAYS = 14;

export function readLastBackup(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function markBackedUp(now = Date.now()) {
  try {
    localStorage.setItem(KEY, String(now));
  } catch {
    // storage unavailable: nothing to remember
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeBackup(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function formatBackupAge(last: number | null, now: number): string {
  if (last === null) return 'Never';
  const days = Math.floor((now - last) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function isBackupStale(last: number | null, now: number): boolean {
  return last === null || now - last > STALE_DAYS * DAY;
}
