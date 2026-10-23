import { db, importAll } from '@/lib/db';
import { generateAssets } from '@/lib/devSeed';
import { useVaultStore } from '@/store';

const PREFIX = 'ast_dev_';

export async function addTestAssets(count = 5000) {
  const assets = generateAssets(count);
  await importAll(assets, []);
  useVaultStore.setState((s) => ({
    assets: { ...s.assets, ...Object.fromEntries(assets.map((a) => [a.id, a])) },
  }));
  useVaultStore.getState().pushToast({ message: `Added ${count} test assets` });
}

export async function removeTestAssets() {
  const ids = Object.keys(useVaultStore.getState().assets).filter((id) =>
    id.startsWith(PREFIX),
  );
  await db.assets.bulkDelete(ids);
  useVaultStore.setState((s) => {
    const next = { ...s.assets };
    for (const id of ids) delete next[id];
    return { assets: next };
  });
  useVaultStore.getState().pushToast({ message: `Removed ${ids.length} test assets` });
}
