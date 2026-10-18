'use client';

import { useEffect } from 'react';
import { Kbd } from '@/components/ui/Kbd';
import { useVaultStore, type Toast } from '@/store';

export interface Hint {
  keys: string;
  label: string;
}

/** Each toast expires on its own clock, even while a newer one is showing. */
function Expiry({ toast }: { toast: Toast }) {
  const dismiss = useVaultStore((s) => s.dismissToast);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);
  return null;
}

interface Props {
  assetCount: number;
  matchCount?: number;
  hints: Hint[];
}

export function StatusBar({ assetCount, matchCount, hints }: Props) {
  const toasts = useVaultStore((s) => s.toasts);
  const dismiss = useVaultStore((s) => s.dismissToast);
  const current = toasts.at(-1);
  const noun = assetCount === 1 ? 'asset' : 'assets';

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
            {matchCount === undefined
              ? `${assetCount} ${noun}`
              : `${matchCount} of ${assetCount} ${noun}`}
          </span>
        )}
      </div>
      <div className="hidden shrink-0 items-center gap-4 md:flex">
        {hints.map((hint) => (
          <span key={hint.label} className="flex items-center gap-1.5">
            <Kbd>{hint.keys}</Kbd>
            {hint.label}
          </span>
        ))}
      </div>
    </footer>
  );
}
