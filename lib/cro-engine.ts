import type { PostHogMetrics } from './posthog';

export interface PageConfig {
  version: number;
  lastUpdated: string;
  activeVariant: string;
  components: ComponentConfig[];
}

export interface ComponentConfig {
  type: 'Hero' | 'ValuePropGrid' | 'SocialProof' | 'RevenueCalculator' | 'BottomCTA';
  props: Record<string, unknown>;
}

export interface CRODecision {
  analysis: string;
  hypothesis: string;
  bottleneck: string;
  changedElement: string;
  gitCommit: string;
  newConfig: PageConfig;
}

// Thresholds for bottleneck detection
const THRESHOLDS = {
  BOUNCE_RATE_HIGH: 60, // > 60% bounce = Hero is failing
  SCROLL_50_LOW: 40,   // < 40% reach midpoint = early dropout, reorder components
  CTA_CTR_LOW: 5,      // < 5% CTR = CTA copy is weak
  SESSIONS_LOW: 200,   // < 200 sessions = not enough data, use mock logic
};

// Copy variant library — data-driven alternatives for each element
const HERO_VARIANTS = [
  {
    headline: 'Turn Your Audience Into a Premium Business',
    subheadline: 'Raptive is the ad management partner for the world\'s most independent creators. Join 6,500+ sites earning more every month.',
    ctaText: 'Apply Now',
  },
  {
    headline: 'Your Content Deserves Premium Ad Revenue',
    subheadline: 'Stop leaving money on the table. Raptive\'s creator network drives 40% higher RPMs than typical ad networks — with real human support behind every account.',
    ctaText: 'See If You Qualify',
  },
  {
    headline: 'Independent Creators Earn More With Raptive',
    subheadline: 'We manage ads for 6,500+ creator websites, reaching 224 million readers monthly. Apply in minutes and see your earning potential.',
    ctaText: 'Calculate My Revenue',
  },
  {
    headline: 'The Business Partner Every Creator Deserves',
    subheadline: 'Premium ad management, data-driven growth tools, and a team that actually picks up the phone. Raptive powers the world\'s most independent creators.',
    ctaText: 'Apply to Join',
  },
];

const BOTTOM_CTA_VARIANTS = [
  {
    headline: 'Ready to Power Your Independence?',
    ctaText: 'Apply to Join Raptive',
  },
  {
    headline: 'Join 6,500 Creators Already Earning More',
    ctaText: 'Start Your Application',
  },
  {
    headline: 'See Exactly What You Could Be Earning',
    ctaText: 'Apply Now — It\'s Free',
  },
  {
    headline: 'Your Next Revenue Milestone Starts Here',
    ctaText: 'Apply in Under 5 Minutes',
  },
];

// Cycle to next variant (avoids repeating the same test)
function nextVariant<T>(variants: T[], currentIndex: number): { variant: T; index: number } {
  const index = (currentIndex + 1) % variants.length;
  return { variant: variants[index], index };
}

function detectVariantIndex(config: PageConfig, variants: { headline: string }[]): number {
  const hero = config.components.find(c => c.type === 'Hero');
  if (!hero) return 0;
  const currentHeadline = (hero.props as { headline: string }).headline;
  const idx = variants.findIndex(v => v.headline === currentHeadline);
  return idx >= 0 ? idx : 0;
}

function detectBottomCTAIndex(config: PageConfig): number {
  const cta = config.components.find(c => c.type === 'BottomCTA');
  if (!cta) return 0;
  const currentHeadline = (cta.props as { headline: string }).headline;
  const idx = BOTTOM_CTA_VARIANTS.findIndex(v => v.headline === currentHeadline);
  return idx >= 0 ? idx : 0;
}

// Reorder components to surface social proof higher (combats mid-page dropout)
function reorderForScrollDepth(components: ComponentConfig[]): ComponentConfig[] {
  const order: ComponentConfig['type'][] = [
    'Hero',
    'SocialProof',     // Moved up — trust signal early
    'ValuePropGrid',
    'RevenueCalculator',
    'BottomCTA',
  ];
  return order
    .map(type => components.find(c => c.type === type))
    .filter(Boolean) as ComponentConfig[];
}

function restoreDefaultOrder(components: ComponentConfig[]): ComponentConfig[] {
  const order: ComponentConfig['type'][] = [
    'Hero',
    'ValuePropGrid',
    'SocialProof',
    'RevenueCalculator',
    'BottomCTA',
  ];
  return order
    .map(type => components.find(c => c.type === type))
    .filter(Boolean) as ComponentConfig[];
}

export function runCROEngine(metrics: PostHogMetrics, currentConfig: PageConfig): CRODecision {
  const { bounceRate, scrollDepth50, ctaCtr } = metrics;
  const now = new Date().toISOString();

  // --- BOTTLENECK DETECTION (priority order) ---

  // 1. High bounce rate → Hero copy is failing to hook visitors
  if (bounceRate > THRESHOLDS.BOUNCE_RATE_HIGH) {
    const currentIdx = detectVariantIndex(currentConfig, HERO_VARIANTS);
    const { variant: newHero, index: newIdx } = nextVariant(HERO_VARIANTS, currentIdx);

    const newComponents = currentConfig.components.map(c =>
      c.type === 'Hero' ? { ...c, props: newHero } : c
    );

    const variantName = `hero-v${newIdx + 1}`;

    return {
      analysis: `Bounce rate is ${bounceRate}% (threshold: ${THRESHOLDS.BOUNCE_RATE_HIGH}%). The majority of visitors leave after the Hero without scrolling further, indicating the above-the-fold messaging is not resonating with the target creator audience.`,
      hypothesis: `If we rewrite the Hero headline to lead with a concrete value outcome (revenue uplift), then bounce rate will decrease because creators respond to specific earning proof over abstract positioning.`,
      bottleneck: 'Bounce Rate',
      changedElement: 'Hero copy',
      gitCommit: `CRO: Update Hero copy to optimize Bounce Rate [${variantName}]`,
      newConfig: {
        ...currentConfig,
        version: currentConfig.version + 1,
        lastUpdated: now,
        activeVariant: variantName,
        components: newComponents,
      },
    };
  }

  // 2. Low mid-page scroll → users aren't reaching value props, reorder components
  if (scrollDepth50 < THRESHOLDS.SCROLL_50_LOW) {
    // Check if SocialProof is already second — if so, restore default order (A/A reset)
    const secondComponent = currentConfig.components[1];
    const isAlreadyReordered = secondComponent?.type === 'SocialProof';

    const newComponents = isAlreadyReordered
      ? restoreDefaultOrder(currentConfig.components)
      : reorderForScrollDepth(currentConfig.components);

    const variantName = isAlreadyReordered ? 'order-default' : 'order-social-first';

    return {
      analysis: `Only ${scrollDepth50}% of sessions reach the midpoint of the page (threshold: ${THRESHOLDS.SCROLL_50_LOW}%). Users are dropping off before encountering the value proposition and social proof sections, which are the primary trust-building elements.`,
      hypothesis: `If we move SocialProof above ValuePropGrid, then scroll depth will increase because trust signals (creator quotes + metrics) are more emotionally compelling than feature lists and will pull users further down the page.`,
      bottleneck: 'Scroll Depth (50%)',
      changedElement: 'Component order',
      gitCommit: `CRO: Reorder components to optimize Scroll Depth [${variantName}]`,
      newConfig: {
        ...currentConfig,
        version: currentConfig.version + 1,
        lastUpdated: now,
        activeVariant: variantName,
        components: newComponents,
      },
    };
  }

  // 3. Low CTA CTR → conversion copy is weak despite engagement
  if (ctaCtr < THRESHOLDS.CTA_CTR_LOW) {
    const currentIdx = detectBottomCTAIndex(currentConfig);
    const { variant: newCTA, index: newIdx } = nextVariant(BOTTOM_CTA_VARIANTS, currentIdx);

    const newComponents = currentConfig.components.map(c =>
      c.type === 'BottomCTA' ? { ...c, props: newCTA } : c
    );

    const variantName = `cta-v${newIdx + 1}`;

    return {
      analysis: `CTA click-through rate is ${ctaCtr}% (threshold: ${THRESHOLDS.CTA_CTR_LOW}%). Users are scrolling through the page but not converting at the bottom CTA, suggesting the closing copy lacks urgency or specificity.`,
      hypothesis: `If we rewrite the BottomCTA to emphasize social proof (number of creators) and reduce commitment friction, then CTA CTR will increase because creators respond to peer validation and low-risk entry points.`,
      bottleneck: 'CTA Click-Through Rate',
      changedElement: 'BottomCTA copy',
      gitCommit: `CRO: Update BottomCTA copy to optimize CTA CTR [${variantName}]`,
      newConfig: {
        ...currentConfig,
        version: currentConfig.version + 1,
        lastUpdated: now,
        activeVariant: variantName,
        components: newComponents,
      },
    };
  }

  // 4. No bottleneck detected — metrics are healthy, run Hero refinement for compound gains
  const currentIdx = detectVariantIndex(currentConfig, HERO_VARIANTS);
  const { variant: newHero, index: newIdx } = nextVariant(HERO_VARIANTS, currentIdx);
  const newComponents = currentConfig.components.map(c =>
    c.type === 'Hero' ? { ...c, props: newHero } : c
  );
  const variantName = `hero-optimised-v${newIdx + 1}`;

  return {
    analysis: `All primary metrics are within healthy ranges (Bounce: ${bounceRate}%, Scroll50: ${scrollDepth50}%, CTA CTR: ${ctaCtr}%). Entering compound optimisation mode — running a Hero copy refinement to push conversion rate above current baseline.`,
    hypothesis: `If we cycle to the next Hero variant, then conversion rate will incrementally improve because continuous multivariate testing identifies marginal gains even when no single metric is in crisis.`,
    bottleneck: 'Compound Optimisation',
    changedElement: 'Hero copy (refinement)',
    gitCommit: `CRO: Refine Hero copy for compound conversion gains [${variantName}]`,
    newConfig: {
      ...currentConfig,
      version: currentConfig.version + 1,
      lastUpdated: now,
      activeVariant: variantName,
      components: newComponents,
    },
  };
}
