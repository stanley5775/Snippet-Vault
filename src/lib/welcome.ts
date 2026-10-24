const KEY = 'snippet-vault:welcome-dismissed';
const EVENT = 'vault:welcome-changed';

export function readWelcomeDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true; // cannot remember a dismissal, so do not nag
  }
}

export function dismissWelcome() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeWelcome(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
