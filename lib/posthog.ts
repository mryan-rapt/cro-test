export interface PostHogMetrics {
  date: string;
  sessions: number;
  pageviews: number;
  bounceRate: number; // 0-100
  scrollDepth50: number; // % of sessions reaching 50% scroll
  scrollDepth75: number; // % of sessions reaching 75% scroll
  ctaClicks: number;
  ctaCtr: number; // 0-100
  conversions: number;
  conversionRate: number; // 0-100
  isMockData: boolean;
}

const POSTHOG_HOST = 'https://app.posthog.com';

async function runHogQLQuery(query: string): Promise<unknown[]> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID || '368030';

  if (!apiKey || apiKey.startsWith('phx_your')) {
    throw new Error('POSTHOG_PERSONAL_API_KEY not configured');
  }

  const response = await fetch(
    `${POSTHOG_HOST}/api/projects/${projectId}/query/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PostHog query failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

export async function fetchYesterdayMetrics(): Promise<PostHogMetrics> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  try {
    // Total sessions
    const sessionsResult = await runHogQLQuery(`
      SELECT count(DISTINCT $session_id) as sessions
      FROM events
      WHERE toDate(timestamp) = '${dateStr}'
        AND event = '$pageview'
    `);
    const sessions = Number((sessionsResult[0] as number[])?.[0] ?? 0);

    // Pageviews
    const pageviewsResult = await runHogQLQuery(`
      SELECT count() as pageviews
      FROM events
      WHERE toDate(timestamp) = '${dateStr}'
        AND event = '$pageview'
    `);
    const pageviews = Number((pageviewsResult[0] as number[])?.[0] ?? 0);

    // Bounce rate: sessions with only 1 pageview
    const bounceResult = await runHogQLQuery(`
      SELECT
        countIf(pv_count = 1) as bounces,
        count() as total
      FROM (
        SELECT $session_id, count() as pv_count
        FROM events
        WHERE toDate(timestamp) = '${dateStr}'
          AND event = '$pageview'
        GROUP BY $session_id
      )
    `);
    const bounces = Number((bounceResult[0] as number[])?.[0] ?? 0);
    const totalSessions = Number((bounceResult[0] as number[])?.[1] ?? 1);
    const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;

    // Scroll depth
    const scrollResult = await runHogQLQuery(`
      SELECT
        countIf(depth >= 50) as reached_50,
        countIf(depth >= 75) as reached_75,
        count(DISTINCT $session_id) as scroll_sessions
      FROM (
        SELECT $session_id, max(toFloat64OrZero(properties.depth)) as depth
        FROM events
        WHERE toDate(timestamp) = '${dateStr}'
          AND event = 'scroll_depth'
        GROUP BY $session_id
      )
    `);
    const reached50 = Number((scrollResult[0] as number[])?.[0] ?? 0);
    const reached75 = Number((scrollResult[0] as number[])?.[1] ?? 0);
    const scrollSessions = Number((scrollResult[0] as number[])?.[2] ?? sessions || 1);
    const scrollDepth50 = scrollSessions > 0 ? (reached50 / scrollSessions) * 100 : 0;
    const scrollDepth75 = scrollSessions > 0 ? (reached75 / scrollSessions) * 100 : 0;

    // CTA clicks
    const ctaResult = await runHogQLQuery(`
      SELECT count(DISTINCT $session_id) as cta_sessions
      FROM events
      WHERE toDate(timestamp) = '${dateStr}'
        AND event = 'cta_click'
    `);
    const ctaClicks = Number((ctaResult[0] as number[])?.[0] ?? 0);
    const ctaCtr = sessions > 0 ? (ctaClicks / sessions) * 100 : 0;

    return {
      date: dateStr,
      sessions,
      pageviews,
      bounceRate: Math.round(bounceRate * 10) / 10,
      scrollDepth50: Math.round(scrollDepth50 * 10) / 10,
      scrollDepth75: Math.round(scrollDepth75 * 10) / 10,
      ctaClicks,
      ctaCtr: Math.round(ctaCtr * 10) / 10,
      conversions: ctaClicks,
      conversionRate: Math.round(ctaCtr * 10) / 10,
      isMockData: false,
    };
  } catch (err) {
    console.warn('[PostHog] Falling back to mock data:', err);
    return generateMockMetrics(dateStr);
  }
}

function generateMockMetrics(date: string): PostHogMetrics {
  // Realistic baseline metrics for a new page — intentionally imperfect
  // so the CRO engine has something to optimize from day one
  return {
    date,
    sessions: 847,
    pageviews: 1203,
    bounceRate: 68.4, // High bounce — Hero isn't landing
    scrollDepth50: 31.2, // Low — users dropping off early
    scrollDepth75: 18.7,
    ctaClicks: 42,
    ctaCtr: 4.9, // Below 5% threshold
    conversions: 42,
    conversionRate: 4.9,
    isMockData: true,
  };
}
