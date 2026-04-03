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

/**
 * Takes a screenshot and returns the raw JPEG bytes as a base64 string.
 * Returns null on failure so the caller can decide how to handle it.
 */
export async function captureScreenshotBase64(url: string): Promise<string | null> {
  const accessKey = process.env.SCREENSHOT_ONE_ACCESS_KEY;
  const secret = process.env.SCREENSHOT_ONE_SECRET;

  if (!accessKey || !secret) {
    console.warn('[Screenshot] Credentials not configured');
    return null;
  }

  const params: Record<string, string> = {
    access_key: accessKey,
    url,
    format: 'jpg',
    viewport_width: '1280',
    viewport_height: '800',
    full_page: 'false',
    image_quality: '80',
    delay: '3',
    block_ads: 'true',
    block_cookie_banners: 'true',
  };

  const apiUrl = buildSignedUrl(params, secret);

  try {
    const res = await fetch(apiUrl, { method: 'GET' });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Screenshot] API error ${res.status}:`, body);
      return null;
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('image/')) {
      const body = await res.text();
      console.error('[Screenshot] Unexpected content-type:', contentType, body.slice(0, 200));
      return null;
    }

    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (err) {
    console.error('[Screenshot] Request failed:', err);
    return null;
  }
}
