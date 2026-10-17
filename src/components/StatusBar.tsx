'use client';

import { useEffect } from 'react';
import { useVaultStore, type Toast } from '@/store';

/** Each toast expires on its own clock, even while a newer one is showing. */
function Expiry({ toast }: { toast: Toast }) {
  const dismiss = useVaultStore((s) => s.dismissToast);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);
  return null;
}

export function StatusBar({ assetCount }: { assetCount: number }) {
  const toasts = useVaultStore((s) => s.toasts);
  const dismiss = useVaultStore((s) => s.dismissToast);
  const current = toasts.at(-1);

  async function handleAction() {
    if (!current?.action) return;
    dismiss(current.id);
    try {
      await current.action.run();
    } catch {
      // the store already reported the failure
    }
  }

  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-line bg-surface px-3 text-xs text-muted">
      {toasts.map((t) => (
        <Expiry key={t.id} toast={t} />
      ))}
      <div
        role="status"
        aria-live="polite"
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {current ? (
          <>
            <span
              className={`truncate ${current.variant === 'error' ? 'text-danger' : 'text-ink'}`}
            >
              {current.message}
            </span>
            {current.action && (
              <button
                type="button"
                onClick={handleAction}
                className="shrink-0 font-medium text-accent hover:underline"
              >
                {current.action.label}
              </button>
            )}
          </>
        ) : (
          <span className="tabular-nums">
            {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
          </span>
        )}
      </div>
      <span className="hidden md:inline">Stored in this browser</span>
    </footer>
  );
}
