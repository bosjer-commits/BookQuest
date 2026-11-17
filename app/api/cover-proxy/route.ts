// Passes a Google Books thumbnail through our own address so the cover picker can
// look at its pixels (browsers don't allow that for images from another site).
// Only Google Books image hosts are accepted, so this can't be used to fetch anything else.
const ALLOWED_HOSTS = new Set(['books.google.com', 'books.googleusercontent.com']);

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get('url');
  let parsed: URL;
  try {
    parsed = new URL(target ?? '');
  } catch {
    return new Response('Bad url', { status: 400 });
  }
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return new Response('Host not allowed', { status: 400 });
  }

  try {
    const upstream = await fetch(parsed, { signal: AbortSignal.timeout(6000) });
    const type = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !type.startsWith('image/')) {
      return new Response('Not an image', { status: 502 });
    }
    return new Response(upstream.body, {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' },
    });
  } catch {
    return new Response('Fetch failed', { status: 502 });
  }
}
