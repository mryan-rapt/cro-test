interface Feature {
  title: string;
  description: string;
}

interface ValuePropGridProps {
  features: Feature[];
}

export function ValuePropGrid({ features }: ValuePropGridProps) {
  return (
    <section style={{ maxWidth: 1120, margin: '80px auto 0', padding: '0 32px' }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--purple-0)', display: 'block', marginBottom: 14 }}>
          What you get
        </span>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Four reasons creators choose Raptive
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
          background: 'var(--warm-grey)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
        className="vp-grid"
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{ background: 'var(--white)', padding: '32px 28px' }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, fontWeight: 300 }}>
              {f.description}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 960px) { .vp-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 580px) { .vp-grid { margin: 0 -20px !important; border-radius: 0 !important; } }
      `}</style>
    </section>
  );
}
