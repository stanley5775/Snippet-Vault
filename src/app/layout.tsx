import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';

const ui = Schibsted_Grotesk({ variable: '--font-ui', subsets: ['latin'] });
const mono = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

const description =
  'Save, tag, search, and copy code snippets, Tailwind classes, CSS, SVG icons, and color palettes. Local-first, keyboard-driven, and no account needed.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Snippet Vault', template: '%s | Snippet Vault' },
  description,
  openGraph: {
    title: 'Snippet Vault',
    description,
    type: 'website',
    siteName: 'Snippet Vault',
  },
  twitter: { card: 'summary_large_image', title: 'Snippet Vault', description },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f8' },
    { media: '(prefers-color-scheme: dark)', color: '#14171a' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${ui.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
