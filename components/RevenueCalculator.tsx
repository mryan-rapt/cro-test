'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

interface RevenueCalculatorProps {
  sliderPrompt: string;
}

const RPM = 12;
const UPLIFT = 1.4;

export function RevenueCalculator({ sliderPrompt }: RevenueCalculatorProps) {
  const [pageviews, setPageviews] = useState(500000);
  const [interacted, setInteracted] = useState(false);

  function handleSlider(val: number) {
    setPageviews(val);
    if (!interacted) {
      setInteracted(true);
      posthog.capture('revenue_calculator_interact');
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const fmtPv = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;

  const base = (pageviews / 1000) * RPM;
  const raptive = base * UPLIFT;
  const uplift = raptive - base;

  return (
    <section style={{ maxWidth: 1120, margin: '80px auto 0', padding: '0 32px 0' }}>
      <div
        style={{
          background: 'var(--light-grey)',
          borderRadius: 20,
          border: '1px solid var(--warm-grey)',
          padding: '56px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
        className="calc-grid"
      >
        {/* Left */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--purple-0)', display: 'block', marginBottom: 14 }}>
            Revenue estimate
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12 }}>
            {sliderPrompt}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: 36 }}>
            Based on average RPM data across 6,500+ Raptive creator sites. Your results will vary based on niche, audience, and content quality.
          </p>

          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            Monthly pageviews
          </label>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--purple-0)', marginBottom: 16 }}>
            {fmtPv(pageviews)}
          </div>
          <input
            type="range"
            min={50000}
            max={10000000}
            step={50000}
            value={pageviews}
            onChange={e => handleSlider(Number(e.target.value))}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', fontWeight: 300 }}>
            <span>50K</span><span>10M</span>
          </div>
        </div>

        {/* Right */}
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              background: 'var(--warm-grey)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div style={{ background: 'var(--white)', padding: '22px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Other networks
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--muted)', lineHeight: 1 }}>
                {fmt(base)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 4 }}>/month</div>
            </div>
            <div style={{ background: 'var(--purple-90)', padding: '22px 20px', border: '1px solid var(--purple-80)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--purple-0)', marginBottom: 8 }}>
                With Raptive
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--purple-0)', lineHeight: 1 }}>
                {fmt(raptive)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 4 }}>/month</div>
            </div>
          </div>

          <div style={{ background: 'var(--yellow)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>Potential uplift</span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--black)' }}>+{fmt(uplift)}/mo</span>
          </div>

          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 12, lineHeight: 1.5 }}>
            Based on 40% average RPM improvement across our network. Estimates are illustrative — actual results depend on niche, content quality, and audience.
          </p>
        </div>
      </div>

      <style>{`
        .calc-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 960px) { .calc-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 40px 32px !important; } }
        @media (max-width: 580px) { .calc-grid { padding: 32px 24px !important; } }
      `}</style>
    </section>
  );
}
