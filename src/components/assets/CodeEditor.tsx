'use client';

import type { Compartment } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { loadLanguageExtension } from '@/lib/editorLanguages';

interface Props {
  /** Initial text only. The parent re-mounts the editor (via key) to load different text. */
  value: string;
  language: string;
  onChange: (value: string) => void;
  label: string;
}

interface Instance {
  view: EditorView;
  compartment: Compartment;
}

export function CodeEditor({ value, language, onChange, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const instance = useRef<Promise<Instance | null>>(Promise.resolve(null));
  const onChangeRef = useRef(onChange);
  const initial = useRef({ value, language, label });

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Create the editor once.
  useEffect(() => {
    let cancelled = false;

    instance.current = (async () => {
      const [{ Compartment, EditorState }, cmView, cmCommands, cmLang, { tags: t }] =
        await Promise.all([
          import('@codemirror/state'),
          import('@codemirror/view'),
          import('@codemirror/commands'),
          import('@codemirror/language'),
          import('@lezer/highlight'),
        ]);
      const languageExtension = await loadLanguageExtension(initial.current.language);
      if (cancelled || !host.current) return null;

      const compartment = new Compartment();

      const highlightStyle = cmLang.HighlightStyle.define([
        {
          tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.modifier],
          color: 'var(--syn-keyword)',
        },
        { tag: [t.string, t.special(t.string), t.regexp], color: 'var(--syn-string)' },
        {
          tag: [t.comment, t.lineComment, t.blockComment],
          color: 'var(--syn-comment)',
          fontStyle: 'italic',
        },
        {
          tag: [t.number, t.bool, t.null, t.atom, t.propertyName, t.attributeName],
          color: 'var(--syn-constant)',
        },
        {
          tag: [
            t.function(t.variableName),
            t.definition(t.variableName),
            t.className,
            t.typeName,
          ],
          color: 'var(--syn-function)',
        },
        { tag: [t.tagName], color: 'var(--syn-tag)' },
      ]);

      const theme = cmView.EditorView.theme({
        '&': {
          height: '100%',
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          fontSize: '13px',
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
          lineHeight: '1.5rem',
        },
        '.cm-content': { padding: '12px 0', caretColor: 'var(--accent)' },
        '.cm-cursor': { borderLeftColor: 'var(--accent)' },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          color: 'var(--muted)',
          border: 'none',
        },
        '.cm-activeLine': { backgroundColor: 'var(--hover)' },
        '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ink)' },
        '&.cm-focused': { outline: 'none' },
        '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
          { background: 'color-mix(in srgb, var(--accent) 25%, transparent)' },
      });

      const editor = new cmView.EditorView({
        parent: host.current,
        state: EditorState.create({
          doc: initial.current.value,
          extensions: [
            cmView.lineNumbers(),
            cmView.highlightActiveLine(),
            cmView.highlightActiveLineGutter(),
            cmView.drawSelection(),
            cmCommands.history(),
            cmLang.indentOnInput(),
            cmLang.bracketMatching(),
            cmLang.syntaxHighlighting(highlightStyle),
            cmView.keymap.of([...cmCommands.defaultKeymap, ...cmCommands.historyKeymap]),
            compartment.of(languageExtension),
            theme,
            cmView.EditorView.contentAttributes.of({
              'aria-label': initial.current.label,
            }),
            cmView.EditorView.updateListener.of((update) => {
              if (update.docChanged) onChangeRef.current(update.state.doc.toString());
            }),
          ],
        }),
      });

      viewRef.current = editor;
      return { view: editor, compartment };
    })();

    return () => {
      cancelled = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  // Swap the language without losing cursor or undo history.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const current = await instance.current;
      if (!current || cancelled || viewRef.current !== current.view) return;
      const extension = await loadLanguageExtension(language);
      if (cancelled || viewRef.current !== current.view) return;
      current.view.dispatch({ effects: current.compartment.reconfigure(extension) });
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  return (
    <div
      ref={host}
      className="h-80 overflow-hidden empty:before:block empty:before:p-4 empty:before:text-sm empty:before:text-muted empty:before:content-['Loading_editor…']"
    />
  );
}
