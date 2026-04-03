'use client';

import posthog from 'posthog-js';

interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export function Hero({ headline, subheadline, ctaText }: HeroProps) {
  function handleCTA() {
    posthog.capture('cta_click', { button_text: ctaText, position: 'hero' });
    window.open('https://dashboard.raptive.com/apply/site-info', '_blank');
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-raptive-navy via-raptive-purple-dark to-raptive-purple pt-24 pb-32 px-6">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 50%, #9333EA 0%, transparent 60%), radial-gradient(circle at 75% 20%, #6B21A8 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 text-white/80 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          6,500+ creator sites · 224M monthly readers
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          {headline}
        </h1>

        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleCTA}
            className="px-8 py-4 bg-white text-raptive-purple font-bold text-lg rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {ctaText}
          </button>
          <p className="text-white/50 text-sm">No commitment required · Free to apply</p>
        </div>
      </div>
    </section>
  );
}
