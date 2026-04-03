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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {headline}
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
          Join thousands of independent creators who trust Raptive to grow their business. Apply in
          under 5 minutes.
        </p>

        <button
          onClick={handleCTA}
          className="px-10 py-5 bg-raptive-purple text-white font-bold text-xl rounded-xl hover:bg-raptive-purple-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          {ctaText}
        </button>

        <p className="text-gray-400 text-sm mt-5">
          Free to apply · No long-term contracts · Cancel anytime
        </p>

        {/* Trust logos strip */}
        <div className="mt-14 pt-8 border-t border-gray-100">
          <p className="text-gray-300 text-xs uppercase tracking-widest mb-4 font-medium">
            Featured in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-30 grayscale">
            {['Forbes', 'TechCrunch', 'AdAge', 'Digiday'].map(name => (
              <span key={name} className="text-lg font-bold text-gray-600">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
