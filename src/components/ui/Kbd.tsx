import type { ReactNode } from 'react';

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-panel px-1.5 py-0.5 font-code text-[11px] leading-none text-muted">
      {children}
    </kbd>
  );
}
