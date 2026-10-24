export interface ShortcutRow {
  label: string;
  /** Shown as-is. */
  keys?: string;
  /** A key pressed with Ctrl (Windows, Linux) or Cmd (Mac). */
  mod?: string;
}

export interface ShortcutGroup {
  title: string;
  rows: ShortcutRow[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Anywhere',
    rows: [{ mod: 'K', label: 'Open the command palette' }],
  },
  {
    title: 'When you are not typing in a field',
    rows: [
      { keys: '/', label: 'Focus the search box' },
      { keys: 'N', label: 'New asset' },
      { keys: '?', label: 'Show the shortcuts list' },
      { keys: 'J / K', label: 'Next or previous asset' },
      { keys: 'Enter', label: 'Copy the selected asset' },
      { keys: 'E', label: 'Edit the selected asset' },
      { keys: 'F', label: 'Toggle favorite' },
      { keys: 'Delete', label: 'Delete (Undo is offered)' },
      { keys: 'Esc', label: 'Close the asset' },
    ],
  },
  {
    title: 'In the search box',
    rows: [
      { keys: '↑ ↓', label: 'Move through results' },
      { keys: 'Enter', label: 'Copy the highlighted result' },
      { keys: 'Esc', label: 'Clear, then leave the box' },
    ],
  },
  {
    title: 'While editing',
    rows: [
      { mod: 'S', label: 'Save' },
      { keys: 'Tab', label: 'Move to the next field' },
    ],
  },
];