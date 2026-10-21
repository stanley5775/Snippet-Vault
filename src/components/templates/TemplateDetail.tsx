'use client';

import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CommitInput } from '@/components/ui/CommitInput';
import {
  DEFAULT_TEMPLATE_NAME,
  resolveTemplate,
  templateIssues,
} from '@/lib/templates/items';
import { useVaultStore } from '@/store';
import type { StarterTemplate } from '@/types';
import { AssetPicker } from './AssetPicker';
import { TemplateItemRow } from './TemplateItemRow';

const ghostButton =
  'rounded p-2 text-muted transition-colors hover:bg-hover hover:text-ink';
const ignore = () => undefined;

type PickerState = null | { mode: 'add' } | { mode: 'swap'; assetId: string };

export function TemplateDetail({
  template,
  onBack,
}: {
  template: StarterTemplate;
  onBack: () => void;
}) {
  const assets = useVaultStore((s) => s.assets);
  const updateTemplate = useVaultStore((s) => s.updateTemplate);
  const removeTemplate = useVaultStore((s) => s.removeTemplate);
  const addTemplateAssets = useVaultStore((s) => s.addTemplateAssets);
  const swapTemplateItem = useVaultStore((s) => s.swapTemplateItem);
  const [picker, setPicker] = useState<PickerState>(null);

  const resolved = useMemo(() => resolveTemplate(template, assets), [template, assets]);
  const issues = templateIssues(resolved);

  // A freshly created template starts with its name selected, ready to rename.
  const isNew = useRef(template.name === DEFAULT_TEMPLATE_NAME);
  useEffect(() => {
    if (!isNew.current) return;
    const el = document.getElementById('template-name') as HTMLInputElement | null;
    el?.focus();
    el?.select();
  }, []);

  async function handleDelete() {
    try {
      await removeTemplate(template.id);
      onBack();
    } catch {
      // the status bar already shows the error
    }
  }

  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4 md:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to templates"
          className={`${ghostButton} -ml-2 md:hidden`}
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <CommitInput
            id="template-name"
            value={template.name}
            aria-label="Template name"
            validate={(draft) => (draft.trim() ? null : 'A template needs a name.')}
            onCommit={(name) => {
              if (name.trim())
                void updateTemplate(template.id, { name: name.trim() }).catch(ignore);
            }}
            className="w-full border-0 border-b border-transparent bg-transparent pb-1 text-xl font-semibold tracking-tight outline-none transition-colors hover:border-line focus:border-accent"
          />
          <CommitInput
            value={template.description ?? ''}
            aria-label="Template description"
            placeholder="What is this starter for? (optional)"
            onCommit={(description) =>
              void updateTemplate(template.id, {
                description: description.trim() || undefined,
              }).catch(ignore)
            }
            className="mt-1 w-full bg-transparent text-sm text-muted outline-none placeholder:text-muted focus:text-ink"
          />
        </div>
        <button
          type="button"
          aria-label="Delete template"
          onClick={handleDelete}
          className={ghostButton}
        >
          <Trash2 className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
        <div className="max-w-3xl space-y-4">
          {(issues.badPaths > 0 || issues.missing > 0) && (
            <div className="space-y-1 rounded-md border border-line bg-surface px-4 py-3 text-sm">
              {issues.badPaths > 0 && (
                <p className="text-danger">
                  {plural(issues.badPaths, 'file path needs', 'file paths need')} fixing
                  before you can download.
                </p>
              )}
              {issues.missing > 0 && (
                <p>
                  {plural(issues.missing, 'deleted snippet', 'deleted snippets')} will be
                  skipped when you download.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">
              Files{' '}
              <span className="font-normal text-muted tabular-nums">
                {resolved.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setPicker({ mode: 'add' })}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm text-accent transition-colors hover:bg-hover"
            >
              <Plus className="size-4" />
              Add snippets
            </button>
          </div>

          {resolved.length === 0 ? (
            <p className="rounded-md border border-dashed border-line p-6 text-center text-sm text-muted">
              No files yet. Add snippets to build the starter.
            </p>
          ) : (
            <ul className="border-t border-line">
              {resolved.map((r, i) => (
                <TemplateItemRow
                  key={r.item.assetId}
                  templateId={template.id}
                  resolved={r}
                  isFirst={i === 0}
                  isLast={i === resolved.length - 1}
                  onSwap={() => setPicker({ mode: 'swap', assetId: r.item.assetId })}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {picker && (
        <AssetPicker
          title={picker.mode === 'add' ? 'Add snippets' : 'Swap in a snippet'}
          confirmLabel={picker.mode === 'add' ? 'Add' : 'Swap'}
          multiple={picker.mode === 'add'}
          excludeIds={template.items.map((i) => i.assetId)}
          onClose={() => setPicker(null)}
          onConfirm={(ids) => {
            if (picker.mode === 'add')
              void addTemplateAssets(template.id, ids).catch(ignore);
            else void swapTemplateItem(template.id, picker.assetId, ids[0]).catch(ignore);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
