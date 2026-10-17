import Dexie, { type EntityTable } from 'dexie';
import type { Asset, StarterTemplate } from '@/types';

class VaultDB extends Dexie {
  assets!: EntityTable<Asset, 'id'>;
  templates!: EntityTable<StarterTemplate, 'id'>;

  constructor() {
    super('snippet-vault');
    // Never edit a shipped version. Schema changes become version(2) + upgrade().
    this.version(1).stores({
      assets: 'id, type, language, *tags, updatedAt',
      templates: 'id, updatedAt',
    });
  }
}

export const db = new VaultDB();
