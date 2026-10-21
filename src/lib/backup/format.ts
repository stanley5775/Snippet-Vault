import { normalizeLanguage } from '@/lib/languages';
import { normalizeTags } from '@/lib/tags';
import {
  assetSchema,
  starterTemplateSchema,
  type Asset,
  type StarterTemplate,
} from '@/types';

export const BACKUP_APP = 'snippet-vault';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

// Our own IDs always carry these prefixes. Anything else (like "constructor") is rejected.
const ASSET_ID = /^ast_[\w-]{1,100}$/;
const TEMPLATE_ID = /^tpl_[\w-]{1,100}$/;

export interface Backup {
  app: typeof BACKUP_APP;
  formatVersion: number;
  exportedAt: number;
  assets: Asset[];
  templates: StarterTemplate[];
}

export function buildBackup(
  assets: Asset[],
  templates: StarterTemplate[],
  now = Date.now(),
): Backup {
  return {
    app: BACKUP_APP,
    formatVersion: BACKUP_VERSION,
    exportedAt: now,
    assets: [...assets].sort((a, b) => a.createdAt - b.createdAt),
    templates: [...templates].sort((a, b) => a.createdAt - b.createdAt),
  };
}

export const serializeBackup = (backup: Backup) => JSON.stringify(backup, null, 2);

export function backupFilename(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `snippet-vault-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

export type ParseResult =
  | {
      ok: true;
      backup: { exportedAt: number; assets: Asset[]; templates: StarterTemplate[] };
      skipped: number;
    }
  | { ok: false; error: string };

const NOT_A_BACKUP = "This file isn't a Snippet Vault backup.";

export function parseBackup(text: string): ParseResult {
  if (text.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'That file is too large to be a backup (50 MB limit).' };
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: NOT_A_BACKUP };
  }

  const record = data as Record<string, unknown>;
  if (record.app !== BACKUP_APP) return { ok: false, error: NOT_A_BACKUP };

  const version = record.formatVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: 'This backup has no valid version number.' };
  }
  if (version > BACKUP_VERSION) {
    return {
      ok: false,
      error:
        'This backup was made by a newer version of Snippet Vault. Update the app and try again.',
    };
  }
  // When a format version 2 exists, upgrade older data here, before validating.

  if (!Array.isArray(record.assets) || !Array.isArray(record.templates)) {
    return { ok: false, error: 'This backup is missing its assets or templates.' };
  }

  let skipped = 0;

  const assets: Asset[] = [];
  for (const raw of record.assets) {
    const parsed = assetSchema.safeParse(raw);
    if (!parsed.success || !ASSET_ID.test(parsed.data.id)) {
      skipped++;
      continue;
    }
    assets.push({
      ...parsed.data,
      language: normalizeLanguage(parsed.data.language),
      tags: normalizeTags(parsed.data.tags),
    });
  }

  const templates: StarterTemplate[] = [];
  for (const raw of record.templates) {
    const parsed = starterTemplateSchema.safeParse(raw);
    if (
      !parsed.success ||
      !TEMPLATE_ID.test(parsed.data.id) ||
      !parsed.data.items.every((item) => ASSET_ID.test(item.assetId))
    ) {
      skipped++;
      continue;
    }
    templates.push(parsed.data);
  }

  const exportedAt = typeof record.exportedAt === 'number' ? record.exportedAt : 0;
  return { ok: true, backup: { exportedAt, assets, templates }, skipped };
}
