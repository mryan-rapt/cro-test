import { NextRequest, NextResponse } from 'next/server';
import { getFile, commitMultipleFiles } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing run id' }, { status: 400 });

    const timelineFile = await getFile('cro-timeline.json');
    const timeline: Record<string, unknown>[] = JSON.parse(timelineFile.content);

    const entry = timeline.find(e => e.id === id);
    if (!entry) return NextResponse.json({ error: `Run ${id} not found` }, { status: 404 });
    if (entry.status !== 'pending') {
      return NextResponse.json({ error: `Run is already ${entry.status}` }, { status: 409 });
    }

    const updatedTimeline = timeline.map(e =>
      e.id === id ? { ...e, status: 'rejected', rejectedAt: new Date().toISOString() } : e
    );

    // Mark rejected in timeline + clear preview config
    await commitMultipleFiles(
      [
        { path: 'cro-timeline.json', content: JSON.stringify(updatedTimeline, null, 2) },
        { path: 'page-config-preview.json', content: 'null\n' },
      ],
      `CRO: Reject variant ${entry.variant} [${id}]`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
