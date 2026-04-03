import crypto from 'crypto';

const SCREENSHOT_API = 'https://api.screenshotone.com/take';

function signRequest(params: Record<string, string>, secret: string): string {
  // Sort params alphabetically and build query string
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(sorted)
    .digest('hex');

  return `${sorted}&signature=${signature}`;
}

export async function takeScreenshot(url: string, label: string): Promise<string> {
  const accessKey = process.env.SCREENSHOT_ONE_ACCESS_KEY;
  const secret = process.env.SCREENSHOT_ONE_SECRET;

  if (!accessKey || !secret) {
    console.warn('[Screenshot] ScreenshotOne credentials not configured, using placeholder');
    return `https://via.placeholder.com/1280x800/6B21A8/ffffff?text=${encodeURIComponent(label)}`;
  }

  const params: Record<string, string> = {
    access_key: accessKey,
    url,
    format: 'jpg',
    viewport_width: '1280',
    viewport_height: '800',
    full_page: 'false',
    delay: '2',
    store: 'true',
    storage_path: `cro-screenshots/${label}-${Date.now()}`,
  };

  const queryString = signRequest(params, secret);
  const apiUrl = `${SCREENSHOT_API}?${queryString}`;

  try {
    const res = await fetch(apiUrl, { method: 'GET' });

    if (!res.ok) {
      console.error(`[Screenshot] API returned ${res.status}: ${await res.text()}`);
      return generatePlaceholder(label);
    }

    const contentType = res.headers.get('content-type') ?? '';

    // If store=true worked, ScreenshotOne returns JSON with store URL
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return (data.store?.url ?? data.url ?? generatePlaceholder(label)) as string;
    }

    // Fallback: screenshot was returned as image bytes — build signed URL for later display
    const displayParams: Record<string, string> = {
      access_key: accessKey,
      url,
      format: 'jpg',
      viewport_width: '1280',
      viewport_height: '800',
      full_page: 'false',
      delay: '2',
    };
    const displayQuery = signRequest(displayParams, secret);
    return `${SCREENSHOT_API}?${displayQuery}`;
  } catch (err) {
    console.error('[Screenshot] Failed:', err);
    return generatePlaceholder(label);
  }
}

function generatePlaceholder(label: string): string {
  return `https://via.placeholder.com/1280x800/6B21A8/ffffff?text=${encodeURIComponent(label)}`;
}
