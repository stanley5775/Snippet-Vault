# Snippet Vault

A local-first vault for the things developers and designers keep copy-pasting: code snippets, Tailwind class lists, CSS keyframes, SVG icons, and color palettes. Save, tag, search, and copy them without leaving the keyboard.

Everything is stored in your browser (IndexedDB). There is no account and no server-side storage.

## Features

- Instant fuzzy search with typo tolerance, camelCase awareness, and filters
- Syntax highlighting and one-click copy
- Five asset types: snippet, Tailwind classes, CSS, SVG, palette, with previews for SVGs and palettes
- Tags, favorites, and a code editor with live highlighting (CodeMirror 6, loaded on demand)
- Project Starter: bundle snippets into a template with file paths, then download it as a ZIP
- JSON backup and restore with a merge preview
- Command palette and keyboard shortcuts throughout
- Light and dark themes that follow your system setting

## Search syntax

| Query | Meaning |
| --- | --- |
| `debounce hook` | Words must all match (prefix and typo tolerant) |
| `#react` | Has a tag starting with `react`. Repeat to require several tags |
| `lang:ts` | Language is `ts`. Repeat to allow several |
| `type:svg` | Asset type starts with `svg`. Repeat to allow several |

Operators combine with words, for example `button type:tailwind #ui`.

## Keyboard shortcuts

Single-letter keys work whenever focus is not in a text field. Press `?` in the app for the full list.

| Key | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Command palette |
| `/` | Focus search |
| `J` / `K` | Next / previous asset |
| `Enter` | Copy the selected asset (in search: the highlighted result) |
| `E` / `N` / `F` | Edit / new / toggle favorite |
| `Delete` | Delete, with Undo in the status bar |
| `Ctrl/Cmd + S` | Save while editing |

## Your data

Data lives only in this browser. Clearing site data removes it, and some browsers may clear it when storage runs low. Safari can delete site data after seven days without a visit. Use **Backup** in the sidebar to export a JSON file regularly, and **Protect my data** to ask the browser to keep storage.

## Getting started

Requires Node.js 20 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm test` | Run the unit tests |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm lint` | Lint |

In development, the command palette has extra commands to add and remove 5,000 test assets.

## Project structure

```
src/
  app/          Next.js routes, metadata, error pages
  components/   UI: workspace, assets, templates, command palette, ui primitives
  hooks/        Hotkeys, URL state, search results, backup status
  lib/
    db/         Dexie database and repositories
    search/     MiniSearch index and the query parser
    templates/  Template item operations and path rules
    backup/     Backup format, merge planning
    export/     ZIP planning and download
  store/        Zustand store, built from slices
  types/        Zod schemas and the types derived from them
```

Notes on the design:

- Types are derived from Zod schemas, which also validate backup imports.
- Writes go to IndexedDB first and then update the store, so the two cannot drift apart.
- Selection and mode live in the URL (`?id=`, `?view=`, `?mode=`), so links and the back button work.
- The search index syncs lazily by comparing the assets map with what it last indexed.

## Tests

`pnpm test` covers the data layer, store, search (including a 5,000-asset benchmark), query parsing, hotkey logic, template rules, backup and merge, and ZIP generation.

## Deploying

Deploys to Vercel with default settings and no environment variables. Set `NEXT_PUBLIC_SITE_URL` if you use a custom domain, so social previews use the right address.

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari (Safari 16.4 or newer).

## Roadmap

- Live preview for CSS animations and Tailwind classes
- Highlight matched text in search results
- Optional cloud sync
- Usage counts and recently used
- Virtualized list for very large vaults
- Add to template from an asset, and an in-app guard for unsaved edits

## License

MIT. See [LICENSE](LICENSE).