'use client';

import { useEffect } from 'react';
import { useVaultStore, type Toast } from '@/store';

const VARIANTS: Record<Toast['variant'], string> = {
  info: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useVaultStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  async function handleAction() {
    dismiss(toast.id);
    try {
      await toast.action?.run();
    } catch {
      // the store already showed an error toast
    }
  }

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm shadow-lg ${VARIANTS[toast.variant]}`}
    >
      <span>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={handleAction}
          className="font-semibold underline underline-offset-2"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const toasts = useVaultStore((s) => s.toasts);
  return (
    <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
