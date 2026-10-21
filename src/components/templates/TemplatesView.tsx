'use client';

import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Centered } from '@/components/ui/Centered';
import { resolveTemplate, templateIssues } from '@/lib/templates/items';
import { useVaultStore } from '@/store';
import { TemplateDetail } from './TemplateDetail';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  detailOpen: boolean;
}

export function TemplatesView({ selectedId, onSelect, onCreate, detailOpen }: Props) {
  const templates = useVaultStore((s) => s.templates);
  const assets = useVaultStore((s) => s.assets);
  const selected = selectedId ? templates[selectedId] : undefined;

  const rows = useMemo(
    () =>
      Object.values(templates)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((template) => {
          const resolved = resolveTemplate(template, assets);
          return {
            template,
            fileCount: resolved.length,
            attention: templateIssues(resolved).problemItems,
          };
        }),
    [templates, assets],
  );

  return (
    <>
      <section
        className={`${detailOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-1 flex-col bg-panel md:w-80 md:flex-none md:border-r md:border-line`}
      >
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center gap-2 border-b border-line px-4 py-2.5 text-left text-sm text-accent transition-colors hover:bg-hover"
        >
          <Plus className="size-4" />
          New template
        </button>

        {rows.length === 0 ? (
          <Centered title="No templates yet">
            A template bundles snippets into a starter project you can download.
          </Centered>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {rows.map(({ template, fileCount, attention }) => {
              const active = template.id === selectedId;
              return (
                <li key={template.id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => onSelect(template.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`block w-full px-4 py-2.5 text-left transition-colors ${
                      active ? 'bg-wash' : 'hover:bg-hover'
                    }`}
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="truncate text-sm font-medium">
                        {template.name}
                      </span>
                      <span className="ml-auto shrink-0 text-xs text-muted tabular-nums">
                        {fileCount} {fileCount === 1 ? 'file' : 'files'}
                      </span>
                    </span>
                    {template.description && (
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {template.description}
                      </span>
                    )}
                    {attention > 0 && (
                      <span className="mt-0.5 block text-xs text-danger">
                        {attention} {attention === 1 ? 'file needs' : 'files need'}{' '}
                        attention
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <main
        className={`${detailOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-panel`}
      >
        {selected ? (
          <TemplateDetail
            key={selected.id}
            template={selected}
            onBack={() => onSelect(null)}
          />
        ) : selectedId ? (
          <Centered title="That template is gone">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="mt-1 text-accent hover:underline"
            >
              Back to the list
            </button>
          </Centered>
        ) : (
          <Centered title="Pick a template">Open one to arrange its files.</Centered>
        )}
      </main>
    </>
  );
}
