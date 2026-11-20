import { type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** Authenticated proxy for content files (audio, images, video with Range support). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const rel = req.nextUrl.searchParams.get('path') ?? '';
  const headers: Record<string, string> = { 'x-api-key': process.env.API_KEY! };
  const range = req.headers.get('range');
  if (range) headers.range = range;
  const upstream = await fetch(`${process.env.API_URL}/content/${id}/file?path=${encodeURIComponent(rel)}`, { headers, cache: 'no-store' });
  const out = new Headers();
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified']) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  out.set('cache-control', 'private, max-age=0');
  return new Response(upstream.body, { status: upstream.status, headers: out });
}
