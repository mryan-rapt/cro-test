import { Hero } from '@/components/Hero';
import { ValuePropGrid } from '@/components/ValuePropGrid';
import { SocialProof } from '@/components/SocialProof';
import { RevenueCalculator } from '@/components/RevenueCalculator';
import { BottomCTA } from '@/components/BottomCTA';
import pageConfig from '@/page-config.json';

type ComponentType = 'Hero' | 'ValuePropGrid' | 'SocialProof' | 'RevenueCalculator' | 'BottomCTA';

interface ComponentConfig {
  type: ComponentType;
  props: Record<string, unknown>;
}

function renderComponent(config: ComponentConfig, index: number) {
  switch (config.type) {
    case 'Hero':
      return (
        <Hero
          key={index}
          headline={config.props.headline as string}
          subheadline={config.props.subheadline as string}
          ctaText={config.props.ctaText as string}
        />
      );
    case 'ValuePropGrid':
      return (
        <ValuePropGrid
          key={index}
          features={config.props.features as Array<{ title: string; description: string }>}
        />
      );
    case 'SocialProof':
      return (
        <SocialProof
          key={index}
          quotes={
            config.props.quotes as Array<{
              text: string;
              author: string;
              site: string;
              metric: string;
            }>
          }
        />
      );
    case 'RevenueCalculator':
      return (
        <RevenueCalculator
          key={index}
          sliderPrompt={config.props.sliderPrompt as string}
        />
      );
    case 'BottomCTA':
      return (
        <BottomCTA
          key={index}
          headline={config.props.headline as string}
          ctaText={config.props.ctaText as string}
        />
      );
    default:
      return null;
  }
}

export default function LandingPage() {
  const components = pageConfig.components as ComponentConfig[];

  return (
    <main style={{ fontFamily: 'var(--font)' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--warm-grey)',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--purple-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>R</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Raptive</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, color: 'var(--muted)' }} className="nav-links">
            <a href="#" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Creators</a>
            <a href="#" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Advertisers</a>
            <a href="#" style={{ textDecoration: 'none', color: 'var(--muted)' }}>About</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="#" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 300 }}>Login</a>
            <a
              href="https://dashboard.raptive.com/apply/site-info"
              style={{
                fontSize: 13, fontWeight: 700, color: 'var(--black)',
                background: 'var(--yellow)', padding: '8px 20px',
                borderRadius: 999, textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              Apply now
            </a>
          </div>
        </div>
      </nav>

      {/* Page top padding for fixed nav */}
      <div style={{ height: 60 }} />

      {/* Render components from page-config.json */}
      {components.map((component, i) => renderComponent(component, i))}

    </main>
  );
}
