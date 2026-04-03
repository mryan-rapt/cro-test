import { NextRequest, NextResponse } from 'next/server';
import { getFile, commitMultipleFiles } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing run id' }, { status: 400 });

    // Load current timeline
    const timelineFile = await getFile('cro-timeline.json');
    const timeline: Record<string, unknown>[] = JSON.parse(timelineFile.content);

    const entry = timeline.find(e => e.id === id);
    if (!entry) return NextResponse.json({ error: `Run ${id} not found` }, { status: 404 });
    if (entry.status !== 'pending') {
      return NextResponse.json({ error: `Run is already ${entry.status}` }, { status: 409 });
    }

    const proposedConfig = entry.proposedConfig;
    if (!proposedConfig) {
      return NextResponse.json({ error: 'No proposed config stored for this run' }, { status: 422 });
    }

    // Mark as accepted in timeline
    const updatedTimeline = timeline.map(e =>
      e.id === id ? { ...e, status: 'accepted', acceptedAt: new Date().toISOString() } : e
    );

    // Commit: new page-config.json (live) + updated timeline + clear preview config
    await commitMultipleFiles(
      [
        { path: 'page-config.json', content: JSON.stringify(proposedConfig, null, 2) },
        { path: 'cro-timeline.json', content: JSON.stringify(updatedTimeline, null, 2) },
        { path: 'page-config-preview.json', content: 'null\n' },
      ],
      `CRO: Accept variant ${entry.variant} → promote to live [${id}]`
    );

    return NextResponse.json({ success: true, variant: entry.variant });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
