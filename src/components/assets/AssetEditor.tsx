'use client';

import { useEffect, useMemo, useState } from 'react';
import { TagInput } from '@/components/ui/TagInput';
import { TYPE_LABEL } from '@/lib/assetTypes';
import { defaultLanguageFor, KNOWN_LANGUAGES, normalizeLanguage } from '@/lib/languages';
import { useVaultStore } from '@/store';
import { ASSET_TYPES, type Asset, type AssetType } from '@/types';
import { AssetPreview } from './AssetPreview';
import { CodeEditor } from './CodeEditor';

const OTHER = '__other';
const fieldClass = 'w-full rounded border border-line bg-surface px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs text-muted';

interface Props {
  asset?: Asset; // undefined = creating
  onSaved: (id: string) => void;
  onCancel: () => void;
}

export function AssetEditor({ asset, onSaved, onCancel }: Props) {
  const createAsset = useVaultStore((s) => s.createAsset);
  const updateAsset = useVaultStore((s) => s.updateAsset);
  const pushToast = useVaultStore((s) => s.pushToast);
  const assets = useVaultStore((s) => s.assets);

  const suggestions = useMemo(
    () => [...new Set(Object.values(assets).flatMap((a) => a.tags))].sort(),
    [assets],
  );

  const [type, setType] = useState<AssetType>(asset?.type ?? 'snippet');
  const [title, setTitle] = useState(asset?.title ?? '');
  const [language, setLanguage] = useState(
    asset?.language ?? defaultLanguageFor('snippet'),
  );
  const [description, setDescription] = useState(asset?.description ?? '');
  const [tags, setTags] = useState<string[]>(asset?.tags ?? []);
  const [content, setContent] = useState(asset?.content ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // The values the form started with, captured once
  const [initial] = useState(() => ({
    type,
    title,
    language,
    description,
    content,
    tags: tags.join(','),
  }));
  const dirty =
    type !== initial.type ||
    title !== initial.title ||
    language !== initial.language ||
    description !== initial.description ||
    content !== initial.content ||
    tags.join(',') !== initial.tags;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function cancel() {
    if (!dirty || window.confirm('Discard your changes?')) onCancel();
  }

  const isKnown = (KNOWN_LANGUAGES as readonly string[]).includes(language);
  const selectValue = isKnown ? language : OTHER;

  function changeType(next: AssetType) {
    // Follow the type's default language unless the user picked their own
    if (language === defaultLanguageFor(type)) setLanguage(defaultLanguageFor(next));
    setType(next);
  }

  async function save() {
    if (saving) return;
    if (!title.trim()) {
      setError('Give it a title.');
      document.getElementById('asset-title')?.focus();
      return;
    }
    if (!content.trim()) {
      setError('Add some content to save.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const fields = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        content,
        language,
        tags,
      };
      const saved = asset
        ? await updateAsset(asset.id, fields)
        : await createAsset(fields);
      pushToast({ message: 'Saved', duration: 1500 });
      onSaved(saved.id);
    } catch {
      // the store already showed an error in the status bar
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          void save();
        }
      }}
    >
      <header className="flex items-center gap-3 border-b border-line px-5 py-3 md:px-8">
        <h1 className="text-sm font-medium">{asset ? 'Edit asset' : 'New asset'}</h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={cancel}
            className="rounded px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
        <div className="max-w-3xl space-y-5">
          <div>
            <label htmlFor="asset-title" className="sr-only">
              Title
            </label>
            <input
              id="asset-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              autoFocus={!asset}
              className="w-full border-0 border-b border-line bg-transparent pb-2 text-xl font-semibold tracking-tight outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="asset-type" className={labelClass}>
                Type
              </label>
              <select
                id="asset-type"
                value={type}
                onChange={(e) => changeType(e.target.value as AssetType)}
                className={fieldClass}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="asset-language" className={labelClass}>
                Language
              </label>
              <div className="flex gap-2">
                <select
                  id="asset-language"
                  value={selectValue}
                  onChange={(e) =>
                    setLanguage(e.target.value === OTHER ? '' : e.target.value)
                  }
                  className={fieldClass}
                >
                  {KNOWN_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  <option value={OTHER}>Other…</option>
                </select>
                {selectValue === OTHER && (
                  <input
                    aria-label="Custom language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="rust, go, php…"
                    className={fieldClass}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="asset-description" className={labelClass}>
              Description (optional)
            </label>
            <input
              id="asset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Setup notes, dependencies, when to use it"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="asset-tags" className={labelClass}>
              Tags
            </label>
            <TagInput
              id="asset-tags"
              value={tags}
              onChange={setTags}
              suggestions={suggestions}
            />
          </div>

          <div>
            <p className={labelClass}>Content</p>
            <div className="rounded-md border border-line bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
              <CodeEditor
                value={content}
                language={normalizeLanguage(language)}
                onChange={setContent}
                label="Content"
              />
            </div>
          </div>

          {(type === 'svg' || type === 'palette') && (
            <div>
              <p className={labelClass}>Preview</p>
              <AssetPreview type={type} content={content} />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
