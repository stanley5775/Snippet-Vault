'use client';

import { useEffect, useRef } from 'react';
import { Kbd } from '@/components/ui/Kbd';
import { useModLabel } from '@/hooks/useModLabel';

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

  const groups: { title: string; rows: [string, string][] }[] = [
    {
      title: 'Anywhere',
      rows: [
        [mod('K'), 'Open the command palette'],
        ['/', 'Focus the search box'],
        ['N', 'New asset'],
        ['?', 'Show this list'],
      ],
    },
    {
      title: 'With an asset selected',
      rows: [
        ['J / K', 'Next or previous asset'],
        ['Enter', 'Copy'],
        ['E', 'Edit'],
        ['F', 'Toggle favorite'],
        ['Delete', 'Delete (Undo is offered)'],
        ['Esc', 'Close the asset'],
      ],
    },
    {
      title: 'In the search box',
      rows: [
        ['↑ ↓', 'Move through results'],
        ['Enter', 'Copy the highlighted result'],
        ['Esc', 'Clear, then leave the box'],
      ],
    },
    {
      title: 'While editing',
      rows: [
        [mod('S'), 'Save'],
        ['Tab', 'Move to the next field'],
      ],
    },
  ];

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
          {groups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-1 text-xs font-medium text-muted">{group.title}</h3>
              <ul>
                {group.rows.map(([keys, label]) => (
                  <li
                    key={label}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span>{label}</span>
                    <Kbd>{keys}</Kbd>
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
