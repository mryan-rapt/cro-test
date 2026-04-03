interface Feature {
  title: string;
  description: string;
}

interface ValuePropGridProps {
  features: Feature[];
}

const ICONS = ['💰', '🤝', '📊', '⚡'];

export function ValuePropGrid({ features }: ValuePropGridProps) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to run a premium creator business
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Raptive goes far beyond ad management. We&apos;re a full-stack growth partner for
            independent digital creators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-100 hover:border-raptive-purple/30 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-4">{ICONS[i % ICONS.length]}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-raptive-purple transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
