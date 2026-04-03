'use client';

import posthog from 'posthog-js';

interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
}

const BULLETS = [
  {
    strong: '6,500+ independent creator sites.',
    text: ' More sites, more data, more leverage. Raptive manages monetisation for one of the largest independent publisher networks on the open web.',
  },
  {
    strong: '40% higher RPM on average.',
    text: ' Our programmatic stack and direct brand relationships consistently outperform generic ad networks — from day one.',
  },
  {
    strong: 'Real humans behind every account.',
    text: ' Dedicated partner managers who know your niche, answer your questions, and treat your site like a business — not a ticket.',
  },
  {
    strong: 'Data that helps you grow, not just earn.',
    text: ' Exclusive network insights, traffic analysis, and publishing intelligence built from 224 million monthly readers.',
  },
];

export function Hero({ headline, subheadline, ctaText }: HeroProps) {
  function handleCTA() {
    posthog.capture('cta_click', { button_text: ctaText, position: 'hero' });
    window.open('https://dashboard.raptive.com/apply/site-info', '_blank');
  }

  return (
    <section
      style={{
        padding: '72px 32px 0',
        maxWidth: 1120,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: 80,
        alignItems: 'start',
      }}
      className="hero-grid"
    >
      {/* ── LEFT ── */}
      <div style={{ paddingTop: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--yellow)',
            color: 'var(--black)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          Powering creator independence
        </span>

        <h1
          style={{
            fontSize: 'clamp(32px, 4.2vw, 50px)',
            fontWeight: 300,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            marginBottom: 22,
          }}
          dangerouslySetInnerHTML={{
            __html: headline.replace(
              /(earn|grow|turn|power|join|become|build|scale|maximize)/gi,
              '<em style="color:var(--purple-0)">$1</em>'
            ),
          }}
        />

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: 'var(--muted)',
            maxWidth: 540,
            marginBottom: 40,
            fontWeight: 300,
          }}
        >
          {subheadline}
        </p>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'var(--warm-grey)',
            border: '1px solid var(--warm-grey)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            marginBottom: 48,
          }}
        >
          {[
            { num: '6,500+', label: 'Creator sites in our network' },
            { num: '224M',   label: 'Monthly readers reached' },
            { num: '+40%',   label: 'Avg RPM uplift vs generic networks' },
          ].map(s => (
            <div key={s.num} style={{ background: 'var(--white)', padding: '20px 18px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--purple-0)', lineHeight: 1, marginBottom: 5 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, fontWeight: 300 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bullet list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 48px' }}>
          {BULLETS.map((b, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '18px 0',
                borderBottom: '1px solid var(--light-grey)',
                borderTop: i === 0 ? '1px solid var(--light-grey)' : undefined,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  background: 'var(--purple-90)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--purple-0)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
                <strong style={{ fontWeight: 600 }}>{b.strong}</strong>{b.text}
              </p>
            </li>
          ))}
        </ul>

        <button
          onClick={handleCTA}
          style={{
            background: 'var(--yellow)',
            color: 'var(--black)',
            border: 'none',
            borderRadius: 999,
            padding: '14px 32px',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--purple-0)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--white)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--yellow)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--black)';
          }}
        >
          {ctaText} →
        </button>
      </div>

      {/* ── RIGHT — sticky card ── */}
      <div
        style={{
          background: 'var(--light-grey)',
          borderRadius: 20,
          padding: '36px 32px',
          position: 'sticky',
          top: 32,
          border: '1px solid var(--warm-grey)',
        }}
      >
        {/* Report preview tile */}
        <div
          style={{
            background: 'var(--purple-90)',
            borderRadius: 10,
            padding: '16px 18px',
            marginBottom: 26,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            border: '1px solid var(--purple-80)',
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              background: 'var(--purple-0)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Partner programme
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>
              Premium ad management for independent creators
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 300, marginBottom: 6, lineHeight: 1.3 }}>
          See if you <strong style={{ fontWeight: 700, color: 'var(--purple-0)' }}>qualify</strong>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.55, fontWeight: 300 }}>
          Most creators see a significant revenue increase within their first 30 days. Application takes under 5 minutes.
        </p>

        {/* Checklist */}
        {[
          'Minimum 100K monthly pageviews',
          'Original long-form content',
          'English-language site',
          'No violations of ad policies',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--purple-90)', border: '1px solid var(--purple-80)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--purple-0)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 300, color: 'var(--text)' }}>{item}</span>
          </div>
        ))}

        <button
          onClick={handleCTA}
          style={{
            width: '100%',
            background: 'var(--yellow)',
            color: 'var(--black)',
            border: 'none',
            borderRadius: 999,
            padding: 14,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            marginTop: 24,
            transition: 'background 0.2s, color 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--purple-0)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--white)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--yellow)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--black)';
          }}
        >
          {ctaText} →
        </button>

        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 14, textAlign: 'center', fontWeight: 300 }}>
          Free to apply · No long-term contracts · Cancel any time
        </p>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding-top: 40px !important; }
        }
        @media (max-width: 580px) {
          .hero-grid { padding: 32px 20px 0 !important; }
        }
      `}</style>
    </section>
  );
}
