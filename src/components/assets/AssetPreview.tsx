'use client';

import { useState } from 'react';
import { copyText } from '@/lib/clipboard';
import { parsePalette } from '@/lib/palette';
import { useVaultStore } from '@/store';
import type { AssetType } from '@/types';

function PaletteSwatches({ content }: { content: string }) {
  const pushToast = useVaultStore((s) => s.pushToast);
  const colors = parsePalette(content);

  if (!colors || colors.length === 0) {
    return (
      <p className="text-sm text-muted">
        Not a palette yet. Use a JSON array of hex colors, like [&quot;#0f172a&quot;,
        &quot;#38bdf8&quot;].
      </p>
    );
  }

  async function copy(color: string) {
    const ok = await copyText(color);
    pushToast(
      ok
        ? { message: `Copied ${color}`, duration: 1500 }
        : { message: "Couldn't copy", variant: 'error' },
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {colors.map((color, i) => (
        <li key={`${color}-${i}`}>
          <button
            type="button"
            aria-label={`Copy ${color}`}
            onClick={() => void copy(color)}
            className="group block w-full text-left"
          >
            <span
              className="block h-14 rounded border border-line"
              style={{ backgroundColor: color }}
            />
            <span className="mt-1 block font-code text-xs text-muted group-hover:text-ink">
              {color}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SvgPreview({ content }: { content: string }) {
  const [dark, setDark] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // currentColor has no meaning inside <img>, so give it a visible color
  const shown = content.replaceAll('currentColor', dark ? '#ffffff' : '#000000');
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shown)}`;
  const failed = failedSrc === src;

  return (
    <div>
      <div
        className="flex h-40 items-center justify-center rounded-md border border-line"
        style={{ backgroundColor: dark ? '#111418' : '#ffffff' }}
      >
        {failed ? (
          <p className="text-sm text-neutral-500">This SVG can&apos;t be rendered.</p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, never run as a page
          <img
            src={src}
            alt="SVG preview"
            onError={() => setFailedSrc(src)}
            className="h-24 w-auto max-w-[80%]"
          />
        )}
      </div>
      <div className="mt-2 flex gap-4 text-xs">
        <button
          type="button"
          aria-pressed={!dark}
          onClick={() => setDark(false)}
          className={!dark ? 'text-ink' : 'text-muted hover:text-ink'}
        >
          Light background
        </button>
        <button
          type="button"
          aria-pressed={dark}
          onClick={() => setDark(true)}
          className={dark ? 'text-ink' : 'text-muted hover:text-ink'}
        >
          Dark background
        </button>
      </div>
    </div>
  );
}

export function AssetPreview({ type, content }: { type: AssetType; content: string }) {
  if (type === 'palette') return <PaletteSwatches content={content} />;
  if (type === 'svg') return <SvgPreview content={content} />;
  return null;
}
