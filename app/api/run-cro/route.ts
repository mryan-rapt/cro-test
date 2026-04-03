import { NextResponse } from 'next/server';

// Manual trigger endpoint — calls the same cron handler
// Secured with CRON_SECRET in production
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const body = await request.json().catch(() => ({}));
    if (body.secret !== secret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
  }

  // Delegate to cron handler
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/cron`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// GET for easy browser triggering during development
export async function GET() {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/cron`, { method: 'POST' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
