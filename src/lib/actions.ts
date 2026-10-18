import { copyText } from '@/lib/clipboard';
import { useVaultStore } from '@/store';
import type { Asset } from '@/types';

export const COPIED_EVENT = 'vault:asset-copied';

export async function copyAsset(asset: Asset): Promise<boolean> {
  const { pushToast } = useVaultStore.getState();
  const ok = await copyText(asset.content);
  if (!ok) {
    pushToast({
      message: "Couldn't copy. Select the text and copy it manually.",
      variant: 'error',
    });
    return false;
  }
  const lines = asset.content.replace(/\n$/, '').split('\n').length;
  pushToast({ message: lines > 1 ? `Copied ${lines} lines` : 'Copied', duration: 1800 });
  window.dispatchEvent(new Event(COPIED_EVENT));
  return true;
}
