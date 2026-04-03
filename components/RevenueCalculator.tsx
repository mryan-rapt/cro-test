'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

interface RevenueCalculatorProps {
  sliderPrompt: string;
}

// RPM estimate table based on niche/pageviews
const RPM_ESTIMATE = 12; // Conservative avg RPM in USD for Raptive creators
const RPM_UPLIFT = 1.4;  // 40% uplift vs generic networks

export function RevenueCalculator({ sliderPrompt }: RevenueCalculatorProps) {
  const [pageviews, setPageviews] = useState(500000);
  const [interacted, setInteracted] = useState(false);

  const formatNum = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `${Math.round(n / 1_000)}K`
      : `${n}`;

  function handleSlider(val: number) {
    setPageviews(val);
    if (!interacted) {
      setInteracted(true);
      posthog.capture('revenue_calculator_interact');
    }
  }

  const baseRevenue = (pageviews / 1000) * RPM_ESTIMATE;
  const raptiveRevenue = baseRevenue * RPM_UPLIFT;
  const uplift = raptiveRevenue - baseRevenue;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-raptive-navy to-raptive-purple-dark">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          See your earning potential
        </h2>
        <p className="text-white/60 text-lg mb-12">
          Estimate how much more you could earn with Raptive&apos;s premium ad stack.
        </p>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-sm">
          <label className="block text-white font-semibold text-lg mb-6">{sliderPrompt}</label>

          <div className="mb-8">
            <div className="text-3xl font-bold text-white mb-4">{formatNum(pageviews)} pageviews/mo</div>
            <input
              type="range"
              min={50000}
              max={10000000}
              step={50000}
              value={pageviews}
              onChange={e => handleSlider(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-white/40 text-xs mt-2">
              <span>50K</span>
              <span>10M</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/50 text-sm mb-1">Without Raptive</p>
              <p className="text-2xl font-bold text-white/60">{fmt(baseRevenue)}<span className="text-sm font-normal text-white/40">/mo</span></p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-raptive-purple text-sm font-medium mb-1">With Raptive</p>
              <p className="text-2xl font-bold text-raptive-purple">{fmt(raptiveRevenue)}<span className="text-sm font-normal text-raptive-purple/60">/mo</span></p>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
            <p className="text-green-300 font-semibold text-lg">
              +{fmt(uplift)}/month potential uplift
            </p>
            <p className="text-green-400/70 text-sm mt-1">Based on 40% avg RPM improvement across our network</p>
          </div>
        </div>
      </div>
    </section>
  );
}
