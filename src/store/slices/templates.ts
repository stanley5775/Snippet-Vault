import { templatesRepo } from '@/lib/db';
import { guarded, without } from '../utils';
import type { SliceCreator, TemplatesSlice } from '../types';

export const createTemplatesSlice: SliceCreator<TemplatesSlice> = (set, get) => ({
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
});
