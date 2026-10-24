'use client';

import Link from 'next/link';
import { Kbd } from '@/components/ui/Kbd';
import { useModLabel } from '@/hooks/useModLabel';
import { FEEDBACK_URL } from '@/lib/site';
import { dismissWelcome } from '@/lib/welcome';

export function WelcomePanel() {
  const mod = useModLabel();
  const tips = [
    { keys: '/', text: 'Search. Try #react, lang:ts, or type:svg.' },
    { keys: 'Enter', text: 'Copy the selected asset.' },
    { keys: mod('K'), text: 'Open the command palette.' },
    { keys: '?', text: 'See every shortcut.' },
  ];

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold tracking-tight">Welcome to Snippet Vault</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Keep the snippets, class lists, SVGs, and palettes you keep re-finding, and copy
          them in a keystroke. Everything stays in this browser, so there is no account to
          make.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {tips.map((tip) => (
            <li key={tip.text} className="flex items-center gap-3">
              <span className="w-16 shrink-0">
                <Kbd>{tip.keys}</Kbd>
              </span>
              {tip.text}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">
          Because your data lives in this browser, export a backup now and then. You will
          find Backup in the sidebar.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <button
            type="button"
            onClick={dismissWelcome}
            className="rounded bg-accent px-3 py-1.5 font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Got it
          </button>
          <Link href="/docs" className="text-accent hover:underline">
            Read the docs
          </Link>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Send feedback
          </a>
        </div>
      </div>
    </div>
  );
}
