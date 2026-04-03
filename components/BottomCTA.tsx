'use client';

import posthog from 'posthog-js';

interface BottomCTAProps {
  headline: string;
  ctaText: string;
}

export function BottomCTA({ headline, ctaText }: BottomCTAProps) {
  function handleCTA() {
    posthog.capture('cta_click', { button_text: ctaText, position: 'bottom' });
    window.open('https://dashboard.raptive.com/apply/site-info', '_blank');
  }

  return (
    <div
      style={{
        background: 'var(--light-grey)',
        borderTop: '1px solid var(--warm-grey)',
        padding: '72px 32px 0',
        marginTop: 80,
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--purple-0)', display: 'block', marginBottom: 14 }}>
        Free. Immediate. No commitment.
      </span>

      <h2
        style={{
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          marginBottom: 12,
          lineHeight: 1.2,
        }}
        dangerouslySetInnerHTML={{
          __html: headline.replace(
            /(earn|grow|power|join|build|scale|start|become)/gi,
            '<em style="color:var(--purple-0)">$1</em>'
          ),
        }}
      />

      <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 32, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', fontWeight: 300, lineHeight: 1.6 }}>
        Built on data from the largest independent publisher network on the open web. Application takes under 5 minutes.
      </p>

      <button
        onClick={handleCTA}
        style={{
          display: 'inline-block',
          background: 'var(--yellow)',
          color: 'var(--black)',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font)',
          textDecoration: 'none',
          padding: '14px 32px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--purple-0)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--white)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--yellow)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--black)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        {ctaText} →
      </button>

      {/* Footer — flush to bottom of section */}
      <footer style={{ marginTop: 72, borderTop: '1px solid var(--warm-grey)', padding: '28px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, maxWidth: 1120, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--purple-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>R</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>Raptive</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300 }}>© {new Date().getFullYear()} Raptive. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', fontWeight: 300 }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
