'use client';

import { useEffect, useRef } from 'react';
import { Kbd } from '@/components/ui/Kbd';
import { useModLabel } from '@/hooks/useModLabel';
import { SHORTCUT_GROUPS } from '@/lib/shortcuts';

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const mod = useModLabel();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click on the backdrop
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-md border border-line bg-panel p-0 text-ink backdrop:bg-black/40"
    >
      <div className="max-h-[80vh] overflow-y-auto p-5">
        <h2 className="text-base font-semibold">Keyboard shortcuts</h2>
        <p className="mt-1 text-sm text-muted">
          Single-letter keys work whenever you are not typing in a field.
        </p>
        <div className="mt-4 space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="mb-1 text-xs font-medium text-muted">{group.title}</h3>
              <ul>
                {group.rows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span>{row.label}</span>
                    <Kbd>{row.mod ? mod(row.mod) : (row.keys ?? '')}</Kbd>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
