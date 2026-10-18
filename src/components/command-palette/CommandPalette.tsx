'use client';

import { Command } from 'cmdk';
import { Kbd } from '@/components/ui/Kbd';

export interface PaletteCommand {
  id: string;
  group: string;
  label: string; // must be unique
  keys?: string;
  disabled?: boolean;
  run: () => void;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: PaletteCommand[];
}

export function CommandPalette({ open, onOpenChange, commands }: Props) {
  const groups = [...new Set(commands.map((c) => c.group))];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      overlayClassName="fixed inset-0 z-40 bg-black/40"
      contentClassName="fixed top-[14vh] left-1/2 z-50 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-md border border-line bg-panel text-ink"
    >
      <Command.Input
        placeholder="Type a command"
        className="w-full border-b border-line bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-80 overflow-y-auto p-1.5">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
          No matching command.
        </Command.Empty>
        {groups.map((group) => (
          <Command.Group
            key={group}
            heading={group}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted"
          >
            {commands
              .filter((c) => c.group === group)
              .map((c) => (
                <Command.Item
                  key={c.id}
                  value={c.label}
                  disabled={c.disabled}
                  onSelect={() => {
                    onOpenChange(false);
                    // let the dialog return focus first, then run the action
                    setTimeout(c.run, 50);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm data-[disabled=true]:cursor-default data-[disabled=true]:opacity-40 data-[selected=true]:bg-wash"
                >
                  {c.label}
                  {c.keys && <Kbd>{c.keys}</Kbd>}
                </Command.Item>
              ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
