import type { ReactNode } from 'react';

export function Centered({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      {children && <div className="max-w-xs text-sm text-muted">{children}</div>}
    </div>
  );
}
