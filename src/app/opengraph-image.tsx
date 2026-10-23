import { ImageResponse } from 'next/og';

export const alt =
  'Snippet Vault: a local-first vault for code snippets and design assets';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#14171a',
        color: '#e6e8ea',
        padding: 80,
      }}
    >
      <div style={{ display: 'flex', fontSize: 48, color: '#7b93ff' }}>[ ]</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 112, letterSpacing: -3 }}>
          Snippet Vault
        </div>
        <div style={{ display: 'flex', fontSize: 38, color: '#8b949e', marginTop: 16 }}>
          Snippets, assets, and palettes. Local-first and keyboard-driven.
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 28, color: '#8b949e' }}>
        No account. Your data stays in your browser.
      </div>
    </div>,
    size,
  );
}
