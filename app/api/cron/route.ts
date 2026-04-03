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
  const siteUrl = (process.env.SITE_URL || 'https://cro-test-ashy.vercel.app').trim();
  const previewUrl = `${siteUrl}/preview`;

  try {
    console.log('[CRO] Starting cycle...');

    // 1. Fetch PostHog metrics
    const metrics = await fetchYesterdayMetrics();

    // 2. Load current configs from GitHub
    const [configFile, timelineFile] = await Promise.all([
      getFile('page-config.json'),
      getFile('cro-timeline.json'),
    ]);
    const currentConfig: PageConfig = JSON.parse(configFile.content);
    const timeline: object[] = JSON.parse(timelineFile.content);

    // 3. Check if there's already a pending run — don't queue another until resolved
    const hasPending = (timeline as Array<{ status: string }>).some(e => e.status === 'pending');
    if (hasPending) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'A pending CRO recommendation is awaiting review. Accept or reject it before the next run.',
      });
    }

    // 4. Run CRO engine to generate proposed config
    const decision = runCROEngine(metrics, currentConfig);

    // 5. Take BEFORE screenshot (current live site)
    console.log('[CRO] Capturing before screenshot...');
    const entryId = `run-${Date.now()}`;
    const beforeResult: ScreenshotResult = await captureScreenshotBase64(siteUrl);
    const beforePath = `public/screenshots/${entryId}-before.jpg`;
    const beforeUrl = beforeResult.base64 ? `/screenshots/${entryId}-before.jpg` : '';

    // 6. Commit proposed config to page-config-preview.json + before screenshot
    const previewCommitFiles: Array<{ path: string; content: string; encoding?: 'utf-8' | 'base64' }> = [
      { path: 'page-config-preview.json', content: JSON.stringify(decision.newConfig, null, 2) },
    ];
    if (beforeResult.base64) {
      previewCommitFiles.push({ path: beforePath, content: beforeResult.base64, encoding: 'base64' });
    }
    await commitMultipleFiles(previewCommitFiles, `CRO: Publish preview for ${decision.newConfig.activeVariant}`);
    console.log('[CRO] Preview config committed');

    // 7. Brief pause for GitHub API consistency, then screenshot /preview
    // (preview page fetches via GitHub API, not raw CDN, so no long wait needed)
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('[CRO] Capturing after/preview screenshot...');
    const afterResult: ScreenshotResult = await captureScreenshotBase64(previewUrl);
    const afterPath = `public/screenshots/${entryId}-after.jpg`;
    const afterUrl = afterResult.base64 ? `/screenshots/${entryId}-after.jpg` : '';

    // 8. Build timeline entry with status "pending"
    const newEntry = {
      id: entryId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      variant: decision.newConfig.activeVariant,
      previewUrl,
      proposedConfig: decision.newConfig,
      posthog_snapshot: metrics,
      analysis: decision.analysis,
      hypothesis: decision.hypothesis,
      bottleneck: decision.bottleneck,
      changedElement: decision.changedElement,
      gitCommit: decision.gitCommit,
      commitSha: '',
      beforeScreenshotUrl: beforeUrl,
      afterScreenshotUrl: afterUrl,
    };
    const updatedTimeline = [...timeline, newEntry];

    // 9. Commit: screenshots + updated timeline
    const finalFiles: Array<{ path: string; content: string; encoding?: 'utf-8' | 'base64' }> = [
      { path: 'cro-timeline.json', content: JSON.stringify(updatedTimeline, null, 2) },
    ];
    if (afterResult.base64) {
      finalFiles.push({ path: afterPath, content: afterResult.base64, encoding: 'base64' });
    }
    const commitSha = await commitMultipleFiles(finalFiles, `CRO: Log run ${entryId} as pending review`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[CRO] Complete in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}s`,
      status: 'pending_review',
      variant: decision.newConfig.activeVariant,
      previewUrl,
      bottleneck: decision.bottleneck,
      analysis: decision.analysis,
      hypothesis: decision.hypothesis,
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
