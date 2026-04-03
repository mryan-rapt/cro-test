import timelineData from '@/cro-timeline.json';

interface TimelineEntry {
  id: string;
  timestamp: string;
  variant: string;
  posthog_snapshot: {
    date: string;
    sessions: number;
    bounceRate: number;
    scrollDepth50: number;
    scrollDepth75: number;
    ctaCtr: number;
    conversionRate: number;
    isMockData: boolean;
  };
  analysis: string;
  hypothesis: string;
  bottleneck: string;
  changedElement: string;
  gitCommit: string;
  commitSha: string;
  beforeScreenshotUrl: string;
  afterScreenshotUrl: string;
}

function MetricBadge({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        highlight
          ? 'bg-red-100 text-red-700 border border-red-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {highlight && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
      {label}: <strong>{value}</strong>
    </span>
  );
}

function ScreenshotFrame({ url, label }: { url: string; label: string }) {
  const isValid = url && url.startsWith('/screenshots/');

  if (!isValid) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--purple-90)', border: '1px solid var(--purple-80)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--purple-0)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300 }}>{label} — screenshot pending</div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={label}
      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', objectPosition: 'top', borderRadius: 12, border: '1px solid var(--warm-grey)', display: 'block' }}
    />
  );
}

export default function CROTimeline() {
  const entries = timelineData as TimelineEntry[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-700 px-6 py-14 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
              R
            </div>
            <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
              Raptive · CRO Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Autonomous CRO Decision Log</h1>
          <p className="text-white/60 max-w-xl text-lg">
            An evidence trail of every A/B test decision made by the CRO engine — what the data
            showed, what hypothesis was formed, and what changed.
          </p>
          <div className="flex gap-4 mt-8 text-sm">
            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2">
              <span className="text-white/50">Total experiments</span>
              <div className="text-xl font-bold">{entries.length}</div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2">
              <span className="text-white/50">Runs automatically</span>
              <div className="text-xl font-bold">Daily · 6AM UTC</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {entries.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">🕐</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Awaiting first CRO run</h2>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">
              The CRO engine runs daily at 6AM UTC. You can also trigger it manually via{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">/api/run-cro</code>.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {[...entries].reverse().map((entry, i) => (
              <article
                key={entry.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Entry header */}
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center">
                      {entries.length - i}
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">
                        Experiment #{entries.length - i} · <span className="text-purple-600">{entry.variant}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                        {entry.posthog_snapshot?.isMockData && (
                          <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">
                            Mock data
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                      🎯 {entry.bottleneck}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                      ✏️ {entry.changedElement}
                    </span>
                  </div>
                </div>

                {/* Before / After screenshots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Before
                    </p>
                    <ScreenshotFrame url={entry.beforeScreenshotUrl} label="Before" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-3">
                      After
                    </p>
                    <ScreenshotFrame url={entry.afterScreenshotUrl} label="After" />
                  </div>
                </div>

                {/* Data signals + decision */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: PostHog signals */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                        PostHog Signals (Yesterday · {entry.posthog_snapshot?.date})
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <MetricBadge
                          label="Sessions"
                          value={entry.posthog_snapshot?.sessions?.toLocaleString()}
                        />
                        <MetricBadge
                          label="Bounce Rate"
                          value={`${entry.posthog_snapshot?.bounceRate}%`}
                          highlight={entry.posthog_snapshot?.bounceRate > 60}
                        />
                        <MetricBadge
                          label="Scroll 50%"
                          value={`${entry.posthog_snapshot?.scrollDepth50}%`}
                          highlight={entry.posthog_snapshot?.scrollDepth50 < 40}
                        />
                        <MetricBadge
                          label="Scroll 75%"
                          value={`${entry.posthog_snapshot?.scrollDepth75}%`}
                        />
                        <MetricBadge
                          label="CTA CTR"
                          value={`${entry.posthog_snapshot?.ctaCtr}%`}
                          highlight={entry.posthog_snapshot?.ctaCtr < 5}
                        />
                        <MetricBadge
                          label="Conv. Rate"
                          value={`${entry.posthog_snapshot?.conversionRate}%`}
                        />
                      </div>

                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                          Analysis
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.analysis}</p>
                      </div>
                    </div>

                    {/* Right: Hypothesis + action */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                        Hypothesis & Action
                      </h3>

                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                          Hypothesis
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                          &ldquo;{entry.hypothesis}&rdquo;
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Git Commit
                        </p>
                        <code className="text-xs text-gray-700 font-mono block mb-2">
                          {entry.gitCommit}
                        </code>
                        {entry.commitSha && (
                          <a
                            href={`https://github.com/mryan-rapt/cro-test/commit/${entry.commitSha}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:underline"
                          >
                            {entry.commitSha.slice(0, 7)} →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
