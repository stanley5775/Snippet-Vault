'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { CommitInput } from '@/components/ui/CommitInput';
import { TYPE_LABEL } from '@/lib/assetTypes';
import type { ResolvedItem } from '@/lib/templates/items';
import { validatePath } from '@/lib/templates/paths';
import { useVaultStore } from '@/store';

interface Props {
  templateId: string;
  resolved: ResolvedItem;
  isFirst: boolean;
  isLast: boolean;
  onSwap: () => void;
}

const arrowButton =
  'rounded p-1 text-muted transition-colors hover:bg-hover hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';
const textButton = 'text-xs text-muted hover:text-ink hover:underline';

export function TemplateItemRow({
  templateId,
  resolved,
  isFirst,
  isLast,
  onSwap,
}: Props) {
  const move = useVaultStore((s) => s.moveTemplateItem);
  const remove = useVaultStore((s) => s.removeTemplateItem);
  const setPath = useVaultStore((s) => s.setTemplateItemPath);
  const setFrozen = useVaultStore((s) => s.setTemplateItemFrozen);
  const { item, asset, status, stale, pathError } = resolved;
  const label = asset?.title ?? 'deleted snippet';
  const ignore = () => undefined;

  return (
    <li className="border-b border-line py-3">
      <div className="flex items-start gap-3">
        <div className="flex flex-col">
          <button
            type="button"
            aria-label={`Move ${label} up`}
            disabled={isFirst}
            onClick={() => void move(templateId, item.assetId, -1).catch(ignore)}
            className={arrowButton}
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Move ${label} down`}
            disabled={isLast}
            onClick={() => void move(templateId, item.assetId, 1).catch(ignore)}
            className={arrowButton}
          >
            <ChevronDown className="size-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <CommitInput
            value={item.path}
            aria-label={`File path for ${label}`}
            spellCheck={false}
            validate={validatePath}
            error={pathError}
            onCommit={(path) =>
              void setPath(templateId, item.assetId, path).catch(ignore)
            }
            className="w-full rounded border border-line bg-surface px-2.5 py-1.5 font-code text-[13px]"
          />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {status === 'missing' ? (
              <span className="rounded border border-danger px-1.5 py-0.5 font-medium text-danger">
                Snippet missing (deleted)
              </span>
            ) : (
              <span>
                {asset
                  ? `${asset.title}, ${TYPE_LABEL[asset.type]}`
                  : 'Original snippet deleted'}
              </span>
            )}
            {status === 'live' && <span>Live</span>}
            {status === 'frozen' && (
              <span>{stale ? 'Frozen, the snippet has changed since' : 'Frozen'}</span>
            )}

            {status === 'missing' && (
              <button type="button" onClick={onSwap} className={textButton}>
                Swap
              </button>
            )}
            {status === 'live' && (
              <button
                type="button"
                onClick={() =>
                  void setFrozen(templateId, item.assetId, true).catch(ignore)
                }
                className={textButton}
              >
                Freeze
              </button>
            )}
            {status === 'frozen' && (
              <button
                type="button"
                onClick={() =>
                  void setFrozen(templateId, item.assetId, false).catch(ignore)
                }
                className={textButton}
              >
                Unfreeze
              </button>
            )}
            <button
              type="button"
              onClick={() => void remove(templateId, item.assetId).catch(ignore)}
              className={textButton}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
