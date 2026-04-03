import { NextRequest, NextResponse } from 'next/server';
import { fetchYesterdayMetrics } from '@/lib/posthog';
import { runCROEngine, type PageConfig } from '@/lib/cro-engine';
import { getFile, commitMultipleFiles } from '@/lib/github';
import { captureScreenshotBase64, type ScreenshotResult } from '@/lib/screenshot';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCROCycle();
}

export async function POST() {
  return runCROCycle();
}

async function runCROCycle() {
  const startTime = Date.now();
  const siteUrl = process.env.SITE_URL || 'https://cro-test-ashy.vercel.app';

  try {
    console.log('[CRO] Starting cycle...');

    // 1. Fetch PostHog metrics
    const metrics = await fetchYesterdayMetrics();
    console.log('[CRO] Metrics fetched, isMock:', metrics.isMockData);

    // 2. Load current config + timeline from GitHub
    const [configFile, timelineFile] = await Promise.all([
      getFile('page-config.json'),
      getFile('cro-timeline.json'),
    ]);
    const currentConfig: PageConfig = JSON.parse(configFile.content);
    const timeline: object[] = JSON.parse(timelineFile.content);

    // 3. Take BEFORE screenshot (raw bytes → base64)
    console.log('[CRO] Capturing before screenshot...');
    const beforeResult: ScreenshotResult = await captureScreenshotBase64(siteUrl);
    const entryId = `run-${Date.now()}`;
    const beforePath = `public/screenshots/${entryId}-before.jpg`;
    const beforeUrl = beforeResult.base64 ? `/screenshots/${entryId}-before.jpg` : '';

    // 4. Run CRO engine
    const decision = runCROEngine(metrics, currentConfig);
    console.log('[CRO] Decision:', decision.gitCommit);

    // 5. Build timeline entry
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
      beforeScreenshotUrl: beforeUrl,
      afterScreenshotUrl: '',
    };

    const updatedTimeline = [...timeline, newEntry];

    // 6. Commit: page-config + timeline + before screenshot (all atomic)
    const filesToCommit: Array<{ path: string; content: string; encoding?: 'utf-8' | 'base64' }> = [
      { path: 'page-config.json', content: JSON.stringify(decision.newConfig, null, 2) },
      { path: 'cro-timeline.json', content: JSON.stringify(updatedTimeline, null, 2) },
    ];
    if (beforeResult.base64) {
      filesToCommit.push({ path: beforePath, content: beforeResult.base64, encoding: 'base64' });
    }

    const commitSha = await commitMultipleFiles(filesToCommit, decision.gitCommit);
    console.log('[CRO] Committed:', commitSha);

    // 7. Wait for Vercel to deploy the new page-config
    await new Promise(resolve => setTimeout(resolve, 45000));

    // 8. Take AFTER screenshot
    console.log('[CRO] Capturing after screenshot...');
    const afterResult: ScreenshotResult = await captureScreenshotBase64(siteUrl);
    const afterPath = `public/screenshots/${entryId}-after.jpg`;
    const afterUrl = afterResult.base64 ? `/screenshots/${entryId}-after.jpg` : '';

    // 9. Update timeline entry with commitSha + after screenshot URL
    const finalEntry = { ...newEntry, commitSha, afterScreenshotUrl: afterUrl };
    const finalTimeline = updatedTimeline.map(e =>
      (e as { id: string }).id === entryId ? finalEntry : e
    );

    const screenshotFiles: Array<{ path: string; content: string; encoding?: 'utf-8' | 'base64' }> = [
      { path: 'cro-timeline.json', content: JSON.stringify(finalTimeline, null, 2) },
    ];
    if (afterResult.base64) {
      screenshotFiles.push({ path: afterPath, content: afterResult.base64, encoding: 'base64' });
    }

    await commitMultipleFiles(
      screenshotFiles,
      `CRO: Add after-screenshot for ${decision.newConfig.activeVariant}`
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[CRO] Complete in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}s`,
      variant: decision.newConfig.activeVariant,
      bottleneck: decision.bottleneck,
      analysis: decision.analysis,
      hypothesis: decision.hypothesis,
      gitCommit: decision.gitCommit,
      commitSha,
      screenshots: {
        before: !!beforeResult.base64,
        beforeError: beforeResult.error,
        after: !!afterResult.base64,
        afterError: afterResult.error,
      },
      metrics,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[CRO] Cycle failed:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
