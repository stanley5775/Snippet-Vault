'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '2rem',
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem' }}>Something went wrong</h1>
          <p style={{ color: '#646d76', maxWidth: '24rem' }}>
            Your snippets live in this browser and were not touched. Reload the page to
            try again.
          </p>
          <button type="button" onClick={reset} style={{ padding: '0.4rem 0.9rem' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
