import { Hero } from '@/components/Hero';
import { ValuePropGrid } from '@/components/ValuePropGrid';
import { SocialProof } from '@/components/SocialProof';
import { RevenueCalculator } from '@/components/RevenueCalculator';
import { BottomCTA } from '@/components/BottomCTA';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ComponentType = 'Hero' | 'ValuePropGrid' | 'SocialProof' | 'RevenueCalculator' | 'BottomCTA';
interface ComponentConfig { type: ComponentType; props: Record<string, unknown>; }
interface PageConfig { version: number; activeVariant: string; components: ComponentConfig[]; }

async function getPreviewConfig(): Promise<PageConfig | null> {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/mryan-rapt/cro-test/main/page-config-preview.json',
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data as PageConfig;
  } catch {
    return null;
  }
}

function renderComponent(config: ComponentConfig, index: number) {
  switch (config.type) {
    case 'Hero':
      return <Hero key={index} headline={config.props.headline as string} subheadline={config.props.subheadline as string} ctaText={config.props.ctaText as string} />;
    case 'ValuePropGrid':
      return <ValuePropGrid key={index} features={config.props.features as Array<{ title: string; description: string }>} />;
    case 'SocialProof':
      return <SocialProof key={index} quotes={config.props.quotes as Array<{ text: string; author: string; site: string; metric: string }>} />;
    case 'RevenueCalculator':
      return <RevenueCalculator key={index} sliderPrompt={config.props.sliderPrompt as string} />;
    case 'BottomCTA':
      return <BottomCTA key={index} headline={config.props.headline as string} ctaText={config.props.ctaText as string} />;
    default:
      return null;
  }
}

export default async function PreviewPage() {
  const config = await getPreviewConfig();

  if (!config) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--light-grey)', fontFamily: 'var(--font)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🕐</div>
          <p style={{ color: 'var(--muted)', fontWeight: 300 }}>No preview available. Awaiting next CRO run.</p>
        </div>
      </div>
    );
  }

  return (
    <main style={{ fontFamily: 'var(--font)' }}>
      {/* Preview banner */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--yellow)', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--black)' }}>
            Preview — not live
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 300 }}>variant: {config.activeVariant}</span>
        </div>
        <a href="/cro-timeline" style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)', textDecoration: 'none' }}>
          ← Back to timeline
        </a>
      </div>

      {/* Offset for banner + nav */}
      <div style={{ height: 36 }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 36, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--warm-grey)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--purple-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>R</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Raptive</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, color: 'var(--muted)' }}>
            <a href="#" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Creators</a>
            <a href="#" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Advertisers</a>
          </div>
          <a href="https://dashboard.raptive.com/apply/site-info" style={{ fontSize: 13, fontWeight: 700, color: 'var(--black)', background: 'var(--yellow)', padding: '8px 20px', borderRadius: 999, textDecoration: 'none' }}>Apply now</a>
        </div>
      </nav>

      {config.components.map((component, i) => renderComponent(component, i))}
    </main>
  );
}
