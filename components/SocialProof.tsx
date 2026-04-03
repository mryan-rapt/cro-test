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
    <section className="py-20 px-6 bg-raptive-gray">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by creators who treat their content as a business
          </h2>
          <p className="text-gray-500 text-lg">Real results from real creators in our network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-4 italic">
                &ldquo;{q.text}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{q.author}</p>
                  <p className="text-gray-400 text-xs">{q.site}</p>
                </div>
                <span className="text-xs font-bold text-raptive-purple bg-raptive-purple/10 px-2 py-1 rounded-full">
                  {q.metric}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {[
            { value: '6,500+', label: 'Creator sites' },
            { value: '224M', label: 'Monthly readers' },
            { value: '40%', label: 'Avg. RPM uplift' },
            { value: '$1B+', label: 'Paid to creators' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-raptive-purple">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
