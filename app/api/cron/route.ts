import { NextRequest, NextResponse } from 'next/server';
import { fetchYesterdayMetrics } from '@/lib/posthog';
import { runCROEngine, type PageConfig } from '@/lib/cro-engine';
import { getFile, commitMultipleFiles } from '@/lib/github';
import { takeScreenshot } from '@/lib/screenshot';

export const maxDuration = 60; // 60 seconds (Vercel Pro max for cron)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return runCROCycle();
}

// Also allow POST for manual triggers (from /api/run-cro)
export async function POST() {
  return runCROCycle();
}

async function runCROCycle() {
  const startTime = Date.now();
  const siteUrl = process.env.SITE_URL || 'https://cro-test.vercel.app';

  try {
    console.log('[CRO] Starting daily cycle...');

    // 1. Fetch PostHog metrics
    const metrics = await fetchYesterdayMetrics();
    console.log('[CRO] Metrics:', JSON.stringify(metrics));

    // 2. Get current page config from GitHub
    const configFile = await getFile('page-config.json');
    const currentConfig: PageConfig = JSON.parse(configFile.content);

    // 3. Take BEFORE screenshot
    console.log('[CRO] Taking before screenshot...');
    const beforeScreenshot = await takeScreenshot(siteUrl, `before-v${currentConfig.version}`);

    // 4. Run CRO engine
    const decision = runCROEngine(metrics, currentConfig);
    console.log('[CRO] Decision:', decision.gitCommit);

    // 5. Get current timeline
    const timelineFile = await getFile('cro-timeline.json');
    const timeline = JSON.parse(timelineFile.content);

    // 6. Build timeline entry (without after screenshot yet)
    const entryId = `run-${Date.now()}`;
    const newEntry = {
      id: entryId,
      timestamp: new Date().toISOString(),
      variant: decision.newConfig.activeVariant,
      posthog_snapshot: metrics,
      analysis: decision.analysis,
      hypothesis: decision.hypothesis,
      bottleneck: decision.bottleneck,
      changedElement: decision.changedElement,
      gitCommit: decision.gitCommit,
      commitSha: '',
      beforeScreenshotUrl: beforeScreenshot,
      afterScreenshotUrl: '',
    };

    const updatedTimeline = [...timeline, newEntry];

    // 7. Commit both files atomically
    const commitSha = await commitMultipleFiles(
      [
        {
          path: 'page-config.json',
          content: JSON.stringify(decision.newConfig, null, 2),
        },
        {
          path: 'cro-timeline.json',
          content: JSON.stringify(updatedTimeline, null, 2),
        },
      ],
      decision.gitCommit
    );

    console.log('[CRO] Committed:', commitSha);

    // 8. Wait for Vercel to deploy (give it ~45 seconds)
    // In production, Vercel typically deploys in 30-60s after a GitHub push
    await new Promise(resolve => setTimeout(resolve, 45000));

    // 9. Take AFTER screenshot
    console.log('[CRO] Taking after screenshot...');
    const afterScreenshot = await takeScreenshot(siteUrl, `after-v${decision.newConfig.version}`);

    // 10. Update timeline entry with commitSha + after screenshot
    const finalEntry = { ...newEntry, commitSha, afterScreenshotUrl: afterScreenshot };
    const finalTimeline = updatedTimeline.map(e => (e.id === entryId ? finalEntry : e));

    // Get fresh SHA for cro-timeline.json after the first commit
    const freshTimelineFile = await getFile('cro-timeline.json');
    await commitMultipleFiles(
      [
        {
          path: 'cro-timeline.json',
          content: JSON.stringify(finalTimeline, null, 2),
        },
      ],
      `CRO: Add after-screenshot for ${decision.newConfig.activeVariant}`
    );

    void freshTimelineFile; // suppress unused warning

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[CRO] Cycle complete in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}s`,
      variant: decision.newConfig.activeVariant,
      bottleneck: decision.bottleneck,
      analysis: decision.analysis,
      hypothesis: decision.hypothesis,
      gitCommit: decision.gitCommit,
      commitSha,
      metrics,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[CRO] Cycle failed:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
