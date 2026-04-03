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
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-raptive-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Raptive</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 transition-colors">Creators</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Advertisers</a>
            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">
              Login
            </a>
            <a
              href="https://dashboard.raptive.com/apply/site-info"
              className="px-4 py-2 bg-raptive-purple text-white text-sm font-semibold rounded-lg hover:bg-raptive-purple-dark transition-colors"
            >
              Apply now
            </a>
          </div>
        </div>
      </nav>

      {/* Page top padding for fixed nav */}
      <div className="h-16" />

      {/* Render components from page-config.json */}
      {components.map((component, i) => renderComponent(component, i))}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-raptive-purple flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="text-white font-semibold">Raptive</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Raptive. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
