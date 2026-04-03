interface Quote {
  text: string;
  author: string;
  site: string;
  metric: string;
}

interface SocialProofProps {
  quotes: Quote[];
}

export function SocialProof({ quotes }: SocialProofProps) {
  return (
    <section
      style={{
        background: 'var(--light-grey)',
        borderTop: '1px solid var(--warm-grey)',
        borderBottom: '1px solid var(--warm-grey)',
        padding: '72px 32px',
        marginTop: 80,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 8, display: 'block' }}>
          Creator results
        </span>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 40 }}>
          The data behind our network
        </h2>

        {/* Stats cards */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 48 }}
          className="proof-cards"
        >
          {[
            { num: '6,500+', strong: 'Publisher sites', desc: 'The largest independent creator network tracking real-time ad performance.' },
            { num: '+40%',   strong: 'Avg RPM uplift',  desc: 'What creators see in their first month after switching to Raptive.' },
            { num: '224M',   strong: 'Monthly readers', desc: 'Reached across the Raptive network every single month.' },
            { num: '$1B+',   strong: 'Paid to creators', desc: 'In ad revenue distributed to independent publishers.' },
          ].map(s => (
            <div
              key={s.num}
              style={{ background: 'var(--white)', border: '1px solid var(--warm-grey)', borderRadius: 'var(--radius)', padding: '24px 22px' }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--purple-0)', lineHeight: 1, marginBottom: 8 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, fontWeight: 300 }}>
                <strong style={{ color: 'var(--text)', fontWeight: 600, display: 'block', marginBottom: 3 }}>{s.strong}</strong>
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Quotes */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
          className="quote-cards"
        >
          {quotes.map((q, i) => (
            <div
              key={i}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--warm-grey)',
                borderRadius: 'var(--radius)',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {[...Array(5)].map((_, s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 20 20" fill="#f59e0b">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, fontWeight: 300, flex: 1, fontStyle: 'italic', marginBottom: 18 }}>
                &ldquo;{q.text}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--light-grey)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{q.author}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300 }}>{q.site}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-0)', background: 'var(--purple-90)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--purple-80)' }}>
                  {q.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .proof-cards { grid-template-columns: repeat(2, 1fr) !important; }
          .quote-cards { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .proof-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
