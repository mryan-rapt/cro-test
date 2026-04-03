import timelineData from '@/cro-timeline.json';
import { ActionButtons } from './ActionButtons';

type RunStatus = 'pending' | 'accepted' | 'rejected';

interface TimelineEntry {
  id: string;
  timestamp: string;
  status: RunStatus;
  variant: string;
  previewUrl: string;
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

function StatusBadge({ status }: { status: RunStatus }) {
  const styles: Record<RunStatus, { bg: string; color: string; border: string; label: string }> = {
    pending: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: '⏳ Pending review' },
    accepted: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: '✓ Accepted' },
    rejected: { bg: 'var(--light-grey)', color: 'var(--muted)', border: 'var(--warm-grey)', label: '✕ Rejected' },
  };
  const s = styles[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: '0.04em' }}>
      {s.label}
    </span>
  );
}

function MetricBadge({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500,
      background: highlight ? '#fef2f2' : 'var(--light-grey)',
      color: highlight ? '#dc2626' : 'var(--muted)',
      border: `1px solid ${highlight ? '#fecaca' : 'var(--warm-grey)'}`,
    }}>
      {highlight && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />}
      {label}: <strong>{value}</strong>
    </span>
  );
}

function ScreenshotFrame({ url, label }: { url: string; label: string }) {
  const isValid = url && url.startsWith('/screenshots/');
  if (!isValid) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--purple-90)', border: '1px solid var(--purple-80)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple-0)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300 }}>{label} — pending</div>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={label} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', objectPosition: 'top', borderRadius: 10, border: '1px solid var(--warm-grey)', display: 'block' }} />;
}

export default function CROTimeline() {
  const entries = (timelineData as unknown as TimelineEntry[]).filter(e => e.id && e.status);
  const reversed = [...entries].reverse();
  const pendingCount = entries.filter(e => e.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light-grey)', fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div style={{ background: 'var(--purple-0)', padding: '56px 32px 48px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>R</div>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)' }}>Raptive · CRO Decision Log</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: 'white', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Autonomous CRO Recommendations
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 300, maxWidth: 520, lineHeight: 1.6, marginBottom: 28 }}>
            Each daily run analyses PostHog data, proposes a design change to a private preview URL, and waits for your approval before touching the live site.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Total experiments', value: String(entries.length) },
              { label: 'Pending review', value: String(pendingCount) },
              { label: 'Schedule', value: 'Daily · 6AM UTC' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 20px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 300, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 32px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', background: 'white', borderRadius: 16, border: '1px dashed var(--warm-grey)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Awaiting first CRO run</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>
              Trigger manually at <code style={{ background: 'var(--light-grey)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>/api/run-cro</code>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {reversed.map((entry, i) => (
              <article key={entry.id} style={{ background: 'white', borderRadius: 16, border: entry.status === 'pending' ? '2px solid var(--yellow)' : '1px solid var(--warm-grey)', overflow: 'hidden' }}>
                {/* Entry header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--light-grey)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-90)', color: 'var(--purple-0)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {entries.length - (entries.length - 1 - i)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                        Experiment #{entries.length - i} · <span style={{ color: 'var(--purple-0)' }}>{entry.variant}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 2 }}>
                        {new Date(entry.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        {entry.posthog_snapshot?.isMockData && (
                          <span style={{ marginLeft: 8, background: '#fffbeb', color: '#92400e', fontSize: 10, padding: '1px 6px', borderRadius: 999, border: '1px solid #fde68a' }}>Mock data</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <StatusBadge status={entry.status} />
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                      🎯 {entry.bottleneck}
                    </span>
                  </div>
                </div>

                {/* Main content: screenshots + actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 240px', gap: 0 }} className="timeline-content">
                  {/* Before */}
                  <div style={{ padding: '20px 24px', borderRight: '1px solid var(--light-grey)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>Current live</p>
                    <ScreenshotFrame url={entry.beforeScreenshotUrl} label="Live" />
                  </div>

                  {/* After/Preview */}
                  <div style={{ padding: '20px 24px', borderRight: '1px solid var(--light-grey)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--purple-0)', marginBottom: 10 }}>Proposed preview</p>
                    <ScreenshotFrame url={entry.afterScreenshotUrl} label="Preview" />
                  </div>

                  {/* Actions panel */}
                  <div style={{ padding: '20px 20px' }}>
                    {entry.status === 'pending' ? (
                      <ActionButtons runId={entry.id} previewUrl={entry.previewUrl} variant={entry.variant} />
                    ) : (
                      <div style={{ paddingTop: 8 }}>
                        <StatusBadge status={entry.status} />
                        {entry.status === 'accepted' && (
                          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 10, lineHeight: 1.5 }}>
                            This variant was promoted to the live site.
                          </p>
                        )}
                        {entry.status === 'rejected' && (
                          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, marginTop: 10, lineHeight: 1.5 }}>
                            Rejected. The next CRO run will re-analyse with fresh data.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Data signals + hypothesis */}
                <div style={{ padding: '20px 24px', background: 'var(--light-grey)', borderTop: '1px solid var(--warm-grey)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="timeline-data">
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
                      PostHog signals · {entry.posthog_snapshot?.date}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      <MetricBadge label="Sessions" value={(entry.posthog_snapshot?.sessions || 0).toLocaleString()} />
                      <MetricBadge label="Bounce" value={`${entry.posthog_snapshot?.bounceRate}%`} highlight={(entry.posthog_snapshot?.bounceRate || 0) > 60} />
                      <MetricBadge label="Scroll 50%" value={`${entry.posthog_snapshot?.scrollDepth50}%`} highlight={(entry.posthog_snapshot?.scrollDepth50 || 0) < 40} />
                      <MetricBadge label="CTA CTR" value={`${entry.posthog_snapshot?.ctaCtr}%`} highlight={(entry.posthog_snapshot?.ctaCtr || 0) < 5} />
                    </div>
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', marginBottom: 4 }}>Analysis</p>
                      <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, fontWeight: 300 }}>{entry.analysis}</p>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
                      Hypothesis &amp; change
                    </p>
                    <div style={{ background: 'var(--purple-90)', border: '1px solid var(--purple-80)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple-0)', marginBottom: 4 }}>Hypothesis</p>
                      <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, fontWeight: 300, fontStyle: 'italic' }}>&ldquo;{entry.hypothesis}&rdquo;</p>
                    </div>
                    <div style={{ background: 'white', border: '1px solid var(--warm-grey)', borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 6 }}>Git commit</p>
                      <code style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'monospace', display: 'block', marginBottom: 6, lineHeight: 1.5 }}>{entry.gitCommit}</code>
                      {entry.commitSha && (
                        <a href={`https://github.com/mryan-rapt/cro-test/commit/${entry.commitSha}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--purple-0)' }}>
                          {entry.commitSha.slice(0, 7)} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 960px) {
          .timeline-content { grid-template-columns: 1fr 1fr !important; }
          .timeline-content > div:last-child { grid-column: 1 / -1; border-top: 1px solid var(--light-grey); border-right: none !important; }
          .timeline-data { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .timeline-content { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
