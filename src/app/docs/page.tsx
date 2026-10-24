import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Kbd } from '@/components/ui/Kbd';
import { SHORTCUT_GROUPS } from '@/lib/shortcuts';
import { FEEDBACK_URL, REPO_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Docs',
  description:
    'How to use Snippet Vault: search syntax, keyboard shortcuts, templates, and backups.',
};

const SECTIONS = [
  { id: 'getting-started', title: 'Getting started' },
  { id: 'search', title: 'Search' },
  { id: 'keyboard', title: 'Keyboard shortcuts' },
  { id: 'templates', title: 'Templates' },
  { id: 'backup', title: 'Backup and your data' },
  { id: 'faq', title: 'Questions' },
];

const link = 'text-accent hover:underline';
const list = 'list-disc space-y-1.5 pl-5';
const numbered = 'list-decimal space-y-1.5 pl-5';

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-10 border-t border-line pt-8 pb-10 first:border-t-0 first:pt-0"
    >
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-7">{children}</div>
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-hover px-1.5 py-0.5 font-code text-[13px]">
      {children}
    </code>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-line align-top">
              {cells.map((cell, j) => (
                <td key={j} className="py-2 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  return (
    <main className="mx-auto flex max-w-5xl gap-12 px-5 py-10 md:px-8">
      <nav
        aria-label="On this page"
        className="sticky top-10 hidden h-fit w-44 shrink-0 text-sm md:block"
      >
        <Link href="/" className={`${link} mb-4 block`}>
          Back to the app
        </Link>
        <ul className="space-y-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-muted hover:text-ink">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <article className="min-w-0 max-w-2xl flex-1">
        <header className="mb-8">
          <Link href="/" className={`${link} mb-4 block text-sm md:hidden`}>
            Back to the app
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
          <p className="mt-2 text-muted">
            Snippet Vault keeps your snippets, assets, and palettes in your browser.
            Nothing is uploaded, and there is no account.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm md:hidden">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={link}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <Section id="getting-started" title="Getting started">
          <p>
            On your first visit the vault holds six example assets so you can try
            everything. Delete them whenever you like. If you empty the vault, a{' '}
            <strong>Load examples</strong> button brings them back.
          </p>
          <ul className={list}>
            <li>
              <strong>Create:</strong> click <strong>New asset</strong> or press{' '}
              <Kbd>N</Kbd>. Choose a type, add a title and content, then save with{' '}
              <Kbd>Ctrl/Cmd + S</Kbd>.
            </li>
            <li>
              <strong>Find:</strong> type in the search box. See Search below.
            </li>
            <li>
              <strong>Copy:</strong> select an asset and press <Kbd>Enter</Kbd>, or click
              Copy.
            </li>
            <li>
              <strong>Organize:</strong> add tags, star favorites with <Kbd>F</Kbd>, and
              use the Favorites view.
            </li>
          </ul>
          <h3 className="pt-2 text-base font-semibold">Asset types</h3>
          <DataTable
            head={['Type', 'What it holds']}
            rows={[
              ['Snippet', 'Code in any language, with syntax highlighting.'],
              ['Tailwind classes', 'A list of utility classes, saved as plain text.'],
              ['CSS', 'Styles or keyframes.'],
              ['SVG', 'SVG markup, previewed as an image.'],
              [
                'Palette',
                <>
                  A JSON list of hex colors, such as{' '}
                  <Code>{'["#0f172a", "#38bdf8"]'}</Code>. Colors show as swatches you can
                  click to copy.
                </>,
              ],
            ]}
          />
          <p className="text-muted">
            SVG previews are shown as images, so scripts inside an SVG never run.
          </p>
        </Section>

        <Section id="search" title="Search">
          <p>
            Search is instant and forgiving. It matches the start of words, tolerates
            small typos, and splits camelCase, so <Code>debounce</Code> finds{' '}
            <Code>useDebounce</Code>.
          </p>
          <DataTable
            head={['Query', 'Meaning']}
            rows={[
              [<Code key="a">debounce hook</Code>, 'Every word must match.'],
              [
                <Code key="b">#react</Code>,
                'Has a tag starting with react. Repeat to require several tags.',
              ],
              [
                <Code key="c">lang:ts</Code>,
                'The language is ts. Repeat to allow several.',
              ],
              [
                <Code key="d">type:svg</Code>,
                'The type starts with svg. Repeat to allow several.',
              ],
            ]}
          />
          <p>
            Mix them freely, for example <Code>button type:tailwind #ui</Code>. On a
            desktop screen the top result is selected as you type, so <Kbd>Enter</Kbd>{' '}
            copies it. Press <Kbd>Esc</Kbd> to clear the box, and <Kbd>Esc</Kbd> again to
            leave it so the single-letter shortcuts work.
          </p>
        </Section>

        <Section id="keyboard" title="Keyboard shortcuts">
          <p>
            Press <Kbd>?</Kbd> in the app to see this list, or <Kbd>Ctrl/Cmd + K</Kbd> to
            open the command palette.
          </p>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-1 text-base font-semibold">{group.title}</h3>
              <DataTable
                head={['Keys', 'Action']}
                rows={group.rows.map((row) => [
                  <Kbd key={row.label}>
                    {row.mod ? `Ctrl/Cmd + ${row.mod}` : row.keys}
                  </Kbd>,
                  row.label,
                ])}
              />
            </div>
          ))}
        </Section>

        <Section id="templates" title="Templates">
          <p>
            A template bundles snippets into a starter project you can download as a ZIP.
          </p>
          <ol className={numbered}>
            <li>
              Open <strong>Templates</strong> in the sidebar and click{' '}
              <strong>New template</strong>. Give it a name.
            </li>
            <li>
              Click <strong>Add snippets</strong> and pick what to include.
            </li>
            <li>
              Set each file path, for example <Code>src/components/Button.tsx</Code>.
              Folders are created from the path.
            </li>
            <li>Reorder files with the arrows.</li>
            <li>
              Click <strong>Download ZIP</strong>. Leave <strong>Include a README</strong>{' '}
              ticked if you want a list of the files.
            </li>
          </ol>
          <h3 className="pt-2 text-base font-semibold">Live and frozen files</h3>
          <p>
            A file is <strong>live</strong> by default: the ZIP gets the snippet as it is
            now. <strong>Freeze</strong> copies the content into the template, so later
            edits to the snippet do not change it. <strong>Unfreeze</strong> goes back to
            live.
          </p>
          <h3 className="pt-2 text-base font-semibold">Deleted snippets</h3>
          <p>
            If a live file snippet was deleted, the row shows{' '}
            <strong>Snippet missing (deleted)</strong>. Swap it for another snippet, or
            remove it. If you download anyway, deleted files are skipped and listed in the
            README. Frozen files keep working because they carry their own copy.
          </p>
          <h3 className="pt-2 text-base font-semibold">Path rules</h3>
          <p>
            Paths must be relative, with no leading slash and no <Code>..</Code> folders.
            They cannot contain <Code>{'< > : " | ? *'}</Code>, and no two files can share
            a path (capital letters do not make them different). The download is blocked
            until every path is valid.
          </p>
        </Section>

        <Section id="backup" title="Backup and your data">
          <p>
            Everything lives in this browser storage. Nothing is uploaded and there is no
            account. That also means the browser holds the only copy.
          </p>
          <ul className={list}>
            <li>Clearing site data removes your vault.</li>
            <li>A browser may clear storage when the device runs low on space.</li>
            <li>Safari can delete site data after seven days without a visit.</li>
          </ul>
          <ol className={numbered}>
            <li>
              <strong>Back up:</strong> open <strong>Backup</strong> in the sidebar and
              click <strong>Download backup</strong>. You get one JSON file with all
              assets and templates. The sidebar shows when you last did this.
            </li>
            <li>
              <strong>Restore:</strong> choose a backup file in the same dialog. You see a
              summary of new, updated, and unchanged items before anything changes. Where
              both copies exist the newer one wins, so anything you edited more recently
              stays as it is.
            </li>
            <li>
              <strong>Protect my data</strong> asks the browser not to clear storage. It
              helps, but it does not replace backups.
            </li>
            <li>
              <strong>Moving to another device:</strong> export on one, import on the
              other.
            </li>
          </ol>
        </Section>

        <Section id="faq" title="Questions">
          <h3 className="text-base font-semibold">Does it work offline?</h3>
          <p>
            Not currently. The page loads from the network, but your snippets never leave
            the browser.
          </p>
          <h3 className="text-base font-semibold">Is my data sent anywhere?</h3>
          <p>
            No. Saving, searching, and exporting all happen in your browser. The page is
            served by the host like any website, but your content is not part of that.
          </p>
          <h3 className="text-base font-semibold">Can I sync across devices?</h3>
          <p>Not yet. Use backup and import to move data between devices.</p>
          <h3 className="text-base font-semibold">Which browsers work?</h3>
          <p>Current Chrome, Edge, Firefox, and Safari 16.4 or newer.</p>
          <h3 className="text-base font-semibold">Found a bug, or want a feature?</h3>
          <p>
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Open an issue on GitHub
            </a>
            . Snippet Vault is open source under the MIT license, and the code is on{' '}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={link}>
              GitHub
            </a>
            .
          </p>
        </Section>
      </article>
    </main>
  );
}
