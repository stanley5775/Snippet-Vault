import { bundledLanguages, createHighlighter } from 'shiki';
import type { BundledLanguage, Highlighter } from 'shiki';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [],
    engine: createJavaScriptRegexEngine(), // no WASM download
  });
  return highlighterPromise;
}

export async function highlight(code: string, language: string): Promise<string> {
  const highlighter = await getHighlighter();
  let lang = 'text';
  if (Object.hasOwn(bundledLanguages, language)) {
    try {
      await highlighter.loadLanguage(language as BundledLanguage);
      lang = language;
    } catch {
      // keep plain text
    }
  }
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}
