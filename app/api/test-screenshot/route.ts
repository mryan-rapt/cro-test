import { NextResponse } from 'next/server';
import { captureScreenshotBase64 } from '@/lib/screenshot';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = (process.env.SITE_URL || 'https://cro-test-ashy.vercel.app').trim();

  // Also expose the raw env values (lengths only, not values) for debugging
  const accessKey = process.env.SCREENSHOT_ONE_ACCESS_KEY ?? '';
  const secret = process.env.SCREENSHOT_ONE_SECRET ?? '';

  const result = await captureScreenshotBase64(siteUrl);

  return NextResponse.json({
    url: siteUrl,
    accessKeyLength: accessKey.length,
    accessKeyTrimmedLength: accessKey.trim().length,
    secretLength: secret.length,
    secretTrimmedLength: secret.trim().length,
    captured: !!result.base64,
    bytesIfCaptured: result.base64 ? Math.round(result.base64.length * 0.75) : 0,
    error: result.error,
  });
}
