'use client';

import { useEffect, useState } from 'react';
import { highlight } from '@/lib/highlight';

export function CodeView({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlight(code, language)
      .then((out) => {
        if (!cancelled) setHtml(out);
      })
      .catch(() => undefined); // keep the plain-text fallback
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (html === null) {
    return (
      <pre className="overflow-x-auto p-4 font-mono text-sm whitespace-pre">{code}</pre>
    );
  }
  return (
    <div
      className="[&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
