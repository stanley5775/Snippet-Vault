import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted">There is nothing at this address.</p>
      <Link href="/" className="text-sm text-accent hover:underline">
        Back to your vault
      </Link>
    </main>
  );
}
