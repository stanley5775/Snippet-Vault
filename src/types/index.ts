import { z } from 'zod';

export const ASSET_TYPES = ['snippet', 'tailwind', 'css', 'svg', 'palette'] as const;
export const assetTypeSchema = z.enum(ASSET_TYPES);
export type AssetType = z.infer<typeof assetTypeSchema>;

export const assetSchema = z.object({
  id: z.string().min(1),
  type: assetTypeSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().max(1000).optional(),
  content: z.string().max(500_000),
  language: z.string().trim().min(1),
  tags: z.array(z.string()),
  favorite: z.boolean(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type Asset = z.infer<typeof assetSchema>;

export const templateItemSchema = z.object({
  assetId: z.string().min(1),
  path: z.string().min(1),
  order: z.number().int(),
  frozenContent: z.string().optional(), // set = frozen, unset = live
});
export type TemplateItem = z.infer<typeof templateItemSchema>;

export const starterTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(1000).optional(),
  items: z.array(templateItemSchema),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type StarterTemplate = z.infer<typeof starterTemplateSchema>;
