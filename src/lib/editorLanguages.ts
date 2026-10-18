import type { Extension } from '@codemirror/state';

const LOADERS: Record<string, () => Promise<Extension>> = {
  ts: () =>
    import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true })),
  tsx: () =>
    import('@codemirror/lang-javascript').then((m) =>
      m.javascript({ typescript: true, jsx: true }),
    ),
  js: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
  jsx: () =>
    import('@codemirror/lang-javascript').then((m) => m.javascript({ jsx: true })),
  html: () => import('@codemirror/lang-html').then((m) => m.html()),
  css: () => import('@codemirror/lang-css').then((m) => m.css()),
  scss: () => import('@codemirror/lang-css').then((m) => m.css()),
  json: () => import('@codemirror/lang-json').then((m) => m.json()),
  python: () => import('@codemirror/lang-python').then((m) => m.python()),
  sql: () => import('@codemirror/lang-sql').then((m) => m.sql()),
  md: () => import('@codemirror/lang-markdown').then((m) => m.markdown()),
  yaml: () => import('@codemirror/lang-yaml').then((m) => m.yaml()),
  svg: () => import('@codemirror/lang-xml').then((m) => m.xml()),
};

/** Languages without a loader (bash, custom ones) edit as plain text. */
export async function loadLanguageExtension(language: string): Promise<Extension> {
  const loader = Object.hasOwn(LOADERS, language) ? LOADERS[language] : undefined;
  if (!loader) return [];
  try {
    return await loader();
  } catch {
    return [];
  }
}
