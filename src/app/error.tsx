'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted">
        Your snippets live in this browser and were not touched. Try again, and if it
        keeps happening, reload the page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
