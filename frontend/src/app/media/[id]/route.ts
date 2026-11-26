import { type NextRequest } from 'next/server';
import { backgroundUser } from '@/lib/api';

/**
 * Authenticated proxy for content files (audio, images, video with Range support).
 * Browser caching: files are re-checked cheaply (ETag → 304) instead of re-downloaded every time.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await backgroundUser())) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const rel = req.nextUrl.searchParams.get('path') ?? '';
  const headers: Record<string, string> = { 'x-api-key': process.env.API_KEY! };
  for (const h of ['range', 'if-none-match', 'if-modified-since']) {
    const v = req.headers.get(h);
    if (v) headers[h] = v;
  }
  const upstream = await fetch(`${process.env.API_URL}/content/${id}/file?path=${encodeURIComponent(rel)}`, { headers, cache: 'no-store' });
  const out = new Headers();
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag']) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  // Images/audio: reuse for 2 min, then serve the cached copy while re-checking in the background.
  out.set('cache-control', /\.(jpe?g|png|webp|mp3|wav)$/i.test(rel) ? 'private, max-age=120, stale-while-revalidate=604800' : 'private, max-age=0, must-revalidate');
  return new Response(upstream.status === 304 ? null : upstream.body, { status: upstream.status, headers: out });
}
