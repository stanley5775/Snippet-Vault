'use client';

import { useEffect, useRef, useState } from 'react';
import { useBackupLabel } from '@/hooks/useBackupStatus';
import {
  backupFilename,
  buildBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
  serializeBackup,
} from '@/lib/backup/format';
import { hasChanges, planMerge, type MergePlan } from '@/lib/backup/merge';
import { markBackedUp } from '@/lib/backup/meta';
import { downloadBlob } from '@/lib/export/download';
import { useVaultStore } from '@/store';

interface Preview {
  fileName: string;
  exportedAt: number;
  skipped: number;
  plan: MergePlan;
}

const primary =
  'rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50';
const quiet =
  'rounded px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover hover:text-ink';
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function BackupDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const applyImport = useVaultStore((s) => s.applyImport);
  const lastBackup = useBackupLabel();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [persistNote, setPersistNote] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    let cancelled = false;
    navigator.storage
      ?.persisted?.()
      .then((value) => {
        if (!cancelled) setPersisted(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function handleExport() {
    const { assets, templates, pushToast } = useVaultStore.getState();
    const assetList = Object.values(assets);
    const templateList = Object.values(templates);
    const blob = new Blob([serializeBackup(buildBackup(assetList, templateList))], {
      type: 'application/json',
    });
    downloadBlob(blob, backupFilename(new Date()));
    markBackedUp();
    pushToast({
      message: `Backup downloaded: ${plural(assetList.length, 'asset', 'assets')}, ${plural(templateList.length, 'template', 'templates')}`,
      duration: 5000,
    });
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > MAX_BACKUP_BYTES) {
      setError('That file is too large to be a backup (50 MB limit).');
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      setError("Couldn't read that file.");
      return;
    }
    const result = parseBackup(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { assets, templates } = useVaultStore.getState();
    setPreview({
      fileName: file.name,
      exportedAt: result.backup.exportedAt,
      skipped: result.skipped,
      plan: planMerge(result.backup, { assets, templates }),
    });
  }

  async function confirmImport() {
    if (!preview) return;
    setBusy(true);
    try {
      await applyImport(preview.plan);
      const { assets, templates } = preview.plan;
      const added = assets.add.length + templates.add.length;
      const updated = assets.update.length + templates.update.length;
      useVaultStore
        .getState()
        .pushToast({
          message: `Imported ${added} new and ${updated} updated`,
          duration: 5000,
        });
      onClose();
    } catch {
      setBusy(false); // the status bar already shows the error
    }
  }

  async function protect() {
    try {
      const granted = await navigator.storage.persist();
      setPersisted(granted);
      setPersistNote(
        granted ? null : 'Your browser declined. Regular backups are the safest option.',
      );
    } catch {
      setPersistNote('Your browser declined. Regular backups are the safest option.');
    }
  }

  const canProtect =
    typeof navigator !== 'undefined' && typeof navigator.storage?.persist === 'function';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-md border border-line bg-panel p-0 text-ink backdrop:bg-black/40"
    >
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <h2 className="text-base font-semibold">Back up and restore</h2>
        <p className="mt-1 text-sm text-muted">
          Your vault lives in this browser only. A backup file is the safe copy.
        </p>

        {preview ? (
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-sm font-medium">Review before importing</h3>
              <p className="mt-1 text-sm text-muted">
                {preview.fileName}
                {preview.exportedAt > 0 &&
                  `, made on ${new Date(preview.exportedAt).toLocaleDateString()}`}
              </p>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-1 font-normal" />
                  <th className="pb-1 text-right font-normal">New</th>
                  <th className="pb-1 text-right font-normal">Updated</th>
                  <th className="pb-1 text-right font-normal">Unchanged</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {(
                  [
                    ['Assets', preview.plan.assets],
                    ['Templates', preview.plan.templates],
                  ] as const
                ).map(([label, bucket]) => (
                  <tr key={label} className="border-t border-line">
                    <th scope="row" className="py-1.5 text-left font-normal">
                      {label}
                    </th>
                    <td className="py-1.5 text-right">{bucket.add.length}</td>
                    <td className="py-1.5 text-right">{bucket.update.length}</td>
                    <td className="py-1.5 text-right">{bucket.unchanged}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-sm text-muted">
              Where both copies exist, the newer one wins. Anything you changed more
              recently stays as it is.
            </p>
            {preview.skipped > 0 && (
              <p className="text-sm text-danger">
                {plural(
                  preview.skipped,
                  'item in the file was',
                  'items in the file were',
                )}{' '}
                invalid and will be ignored.
              </p>
            )}
            {!hasChanges(preview.plan) && (
              <p className="text-sm">
                Nothing to import: your vault already has everything in this file.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPreview(null)} className={quiet}>
                Choose another file
              </button>
              <button
                type="button"
                disabled={busy || !hasChanges(preview.plan)}
                onClick={() => void confirmImport()}
                className={primary}
              >
                Import
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            <section>
              <h3 className="text-sm font-medium">Export</h3>
              <p className="mt-1 text-sm text-muted">
                Download all assets and templates as one JSON file. Last backup:{' '}
                {lastBackup}.
              </p>
              <button type="button" onClick={handleExport} className={`${primary} mt-3`}>
                Download backup
              </button>
            </section>

            <section>
              <h3 className="text-sm font-medium">Import</h3>
              <p className="mt-1 text-sm text-muted">
                Restore from a backup file. You will see a summary before anything
                changes.
              </p>
              <input
                type="file"
                accept="application/json,.json"
                aria-label="Choose a backup file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = ''; // allow choosing the same file again
                  void handleFile(file);
                }}
                className="mt-3 block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-hover file:px-3 file:py-1.5 file:text-sm file:text-ink"
              />
              {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            </section>

            {canProtect && persisted !== null && (
              <section>
                <h3 className="text-sm font-medium">Storage protection</h3>
                <p className="mt-1 text-sm text-muted">
                  {persisted
                    ? 'Protected. The browser will not clear this data automatically.'
                    : 'Not protected. If the device runs low on space, the browser may clear this data.'}
                </p>
                {!persisted && (
                  <button
                    type="button"
                    onClick={() => void protect()}
                    className={`${quiet} -ml-3 mt-2`}
                  >
                    Protect my data
                  </button>
                )}
                {persistNote && <p className="mt-1 text-sm text-muted">{persistNote}</p>}
              </section>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={onClose} className={quiet}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
