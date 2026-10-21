'use client';

import { ArrowLeft, Download, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CommitInput } from '@/components/ui/CommitInput';
import { downloadBlob } from '@/lib/export/download';
import { planZip, zipBytes } from '@/lib/export/zip';
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
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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
  const pushToast = useVaultStore((s) => s.pushToast);
  const [picker, setPicker] = useState<PickerState>(null);
  const [includeReadme, setIncludeReadme] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const resolved = useMemo(() => resolveTemplate(template, assets), [template, assets]);
  const issues = templateIssues(resolved);
  const canDownload = resolved.length > 0 && issues.badPaths === 0 && !downloading;

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

  async function handleDownload() {
    const result = planZip(template, assets, { readme: includeReadme, now: new Date() });
    if (!result.ok) {
      pushToast({ message: result.reason, variant: 'error' });
      return;
    }
    setDownloading(true);
    try {
      const bytes = await zipBytes(result.plan);
      // copy into a fresh Uint8Array so the Blob constructor accepts it on every TypeScript version
      downloadBlob(
        new Blob([new Uint8Array(bytes)], { type: 'application/zip' }),
        result.plan.filename,
      );
      const fileCount = result.plan.files.length - (result.plan.readmeIncluded ? 1 : 0);
      const skipped = result.plan.skipped.length;
      pushToast({
        message: `Downloaded ${result.plan.filename} with ${plural(fileCount, 'file', 'files')}${
          skipped > 0 ? `, ${skipped} skipped (deleted)` : ''
        }`,
        duration: 5000,
      });
    } catch {
      pushToast({ message: "Couldn't create the ZIP.", variant: 'error' });
    } finally {
      setDownloading(false);
    }
  }

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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              disabled={!canDownload}
              onClick={() => void handleDownload()}
              className="inline-flex items-center gap-2 rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download className="size-4" />
              Download ZIP
            </button>
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={includeReadme}
                onChange={(e) => setIncludeReadme(e.target.checked)}
              />
              Include a README
            </label>
          </div>

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
