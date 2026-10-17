import { db } from './db';
import {
  assetSchema,
  starterTemplateSchema,
  type Asset,
  type StarterTemplate,
} from '@/types';
import { defaultLanguageFor, normalizeLanguage } from '@/lib/languages';
import { normalizeTags } from '@/lib/tags';

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

export type NewAssetInput = Pick<Asset, 'type' | 'title' | 'content'> &
  Partial<Pick<Asset, 'description' | 'language' | 'tags' | 'favorite'>>;

export type AssetPatch = Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>;

export const assetsRepo = {
  getAll: () => db.assets.toArray(),

  async create(input: NewAssetInput): Promise<Asset> {
    const now = Date.now();
    const asset = assetSchema.parse({
      id: createId('ast'),
      type: input.type,
      title: input.title,
      description: input.description,
      content: input.content,
      language: normalizeLanguage(input.language ?? defaultLanguageFor(input.type)),
      tags: normalizeTags(input.tags ?? []),
      favorite: input.favorite ?? false,
      createdAt: now,
      updatedAt: now,
    });
    await db.assets.add(asset);
    return asset;
  },

  async update(id: string, patch: AssetPatch): Promise<Asset> {
    const existing = await db.assets.get(id);
    if (!existing) throw new Error(`Asset not found: ${id}`);
    const next = assetSchema.parse({
      ...existing,
      ...patch,
      language: normalizeLanguage(patch.language ?? existing.language),
      tags: normalizeTags(patch.tags ?? existing.tags),
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    await db.assets.put(next);
    return next;
  },

  /** Hard delete. Returns the removed record so the UI can offer Undo. */
  async remove(id: string): Promise<Asset | undefined> {
    const existing = await db.assets.get(id);
    if (!existing) return undefined;
    await db.assets.delete(id);
    return existing;
  },

  /** Undo: re-insert with the SAME id so template references heal. */
  restore: (asset: Asset) => db.assets.put(asset),

  /** Used by import in M8. */
  bulkPut: (assets: Asset[]) => db.assets.bulkPut(assets),
};

export type NewTemplateInput = Pick<StarterTemplate, 'name'> &
  Partial<Pick<StarterTemplate, 'description' | 'items'>>;

export type TemplatePatch = Partial<
  Omit<StarterTemplate, 'id' | 'createdAt' | 'updatedAt'>
>;

export const templatesRepo = {
  getAll: () => db.templates.toArray(),

  async create(input: NewTemplateInput): Promise<StarterTemplate> {
    const now = Date.now();
    const template = starterTemplateSchema.parse({
      id: createId('tpl'),
      name: input.name,
      description: input.description,
      items: input.items ?? [],
      createdAt: now,
      updatedAt: now,
    });
    await db.templates.add(template);
    return template;
  },

  async update(id: string, patch: TemplatePatch): Promise<StarterTemplate> {
    const existing = await db.templates.get(id);
    if (!existing) throw new Error(`Template not found: ${id}`);
    const next = starterTemplateSchema.parse({
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    await db.templates.put(next);
    return next;
  },

  async remove(id: string): Promise<StarterTemplate | undefined> {
    const existing = await db.templates.get(id);
    if (!existing) return undefined;
    await db.templates.delete(id);
    return existing;
  },

  restore: (template: StarterTemplate) => db.templates.put(template),
  bulkPut: (templates: StarterTemplate[]) => db.templates.bulkPut(templates),
};
