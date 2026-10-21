import { templatesRepo } from '@/lib/db';
import {
  addItems,
  moveItem,
  removeItem,
  setFrozen,
  setItemPath,
  swapItem,
} from '@/lib/templates/items';
import type { Asset, TemplateItem } from '@/types';
import type { SliceCreator, TemplatesSlice } from '../types';
import { guarded, without } from '../utils';

export const createTemplatesSlice: SliceCreator<TemplatesSlice> = (set, get) => {
  /** Applies a change to one template's items and saves it. */
  async function editItems(
    templateId: string,
    change: (items: TemplateItem[]) => TemplateItem[],
  ) {
    const template = get().templates[templateId];
    if (!template) return;
    await get().updateTemplate(templateId, { items: change(template.items) });
  }

  return {
    templates: {},

    createTemplate: (input) =>
      guarded(get, 'create the template', async () => {
        const template = await templatesRepo.create(input);
        set((s) => ({ templates: { ...s.templates, [template.id]: template } }));
        return template;
      }),

    updateTemplate: (id, patch) =>
      guarded(get, 'save the template', async () => {
        const template = await templatesRepo.update(id, patch);
        set((s) => ({ templates: { ...s.templates, [template.id]: template } }));
        return template;
      }),

    removeTemplate: (id) =>
      guarded(get, 'delete the template', async () => {
        const removed = await templatesRepo.remove(id);
        if (!removed) return;
        set((s) => ({ templates: without(s.templates, id) }));
        get().pushToast({
          message: `Deleted template “${removed.name}”`,
          duration: 6000,
          action: { label: 'Undo', run: () => get().restoreTemplate(removed) },
        });
      }),

    restoreTemplate: (template) =>
      guarded(get, 'restore the template', async () => {
        await templatesRepo.restore(template);
        set((s) => ({ templates: { ...s.templates, [template.id]: template } }));
      }),

    addTemplateAssets: (templateId, assetIds) => {
      const { assets } = get();
      const picked = assetIds
        .map((id) => assets[id])
        .filter((a): a is Asset => Boolean(a));
      return editItems(templateId, (items) => addItems(items, picked));
    },

    removeTemplateItem: (templateId, assetId) =>
      editItems(templateId, (items) => removeItem(items, assetId)),

    moveTemplateItem: (templateId, assetId, delta) =>
      editItems(templateId, (items) => moveItem(items, assetId, delta)),

    setTemplateItemPath: (templateId, assetId, path) =>
      editItems(templateId, (items) => setItemPath(items, assetId, path)),

    setTemplateItemFrozen: (templateId, assetId, frozen) => {
      const content = frozen ? get().assets[assetId]?.content : undefined;
      if (frozen && content === undefined) return Promise.resolve(); // nothing to freeze
      return editItems(templateId, (items) => setFrozen(items, assetId, content));
    },

    swapTemplateItem: (templateId, oldAssetId, newAssetId) =>
      editItems(templateId, (items) => swapItem(items, oldAssetId, newAssetId)),
  };
};
