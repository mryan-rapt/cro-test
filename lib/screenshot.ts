import crypto from 'crypto';

const SCREENSHOT_API = 'https://api.screenshotone.com/take';

function buildSignedUrl(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(sorted)
    .digest('hex');

  return `${SCREENSHOT_API}?${sorted}&signature=${signature}`;
}

export interface ScreenshotResult {
  base64: string | null;
  error: string | null;
}

/**
 * Takes a screenshot and returns the raw JPEG bytes as a base64 string.
 */
export async function captureScreenshotBase64(url: string): Promise<ScreenshotResult> {
  const accessKey = process.env.SCREENSHOT_ONE_ACCESS_KEY;
  const secret = process.env.SCREENSHOT_ONE_SECRET;

  if (!accessKey || !secret) {
    return { base64: null, error: 'SCREENSHOT_ONE credentials not set' };
  }

  const params: Record<string, string> = {
    access_key: accessKey.trim(),
    url: url.trim(),
    format: 'jpg',
    viewport_width: '1280',
    viewport_height: '800',
    full_page: 'false',
    image_quality: '80',
    delay: '2',
  };

  const apiUrl = buildSignedUrl(params, secret);

  try {
    const res = await fetch(apiUrl, { method: 'GET' });

    if (!res.ok) {
      const body = await res.text();
      const msg = `ScreenshotOne ${res.status}: ${body.slice(0, 200)}`;
      console.error('[Screenshot]', msg);
      return { base64: null, error: msg };
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('image/')) {
      const body = await res.text();
      const msg = `Unexpected content-type "${contentType}": ${body.slice(0, 200)}`;
      console.error('[Screenshot]', msg);
      return { base64: null, error: msg };
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    console.log(`[Screenshot] Captured ${buffer.byteLength} bytes for ${url}`);
    return { base64, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Screenshot] Request failed:', msg);
    return { base64: null, error: msg };
  }
}
