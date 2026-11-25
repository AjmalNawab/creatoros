/**
 * Post engagement tracking. Each check appends a PostMetric snapshot (never overwritten).
 * null means "not available / not checked"; 0 means really zero.
 *  - YouTube: automatic via the free YouTube Data API (needs YOUTUBE_API_KEY).
 *  - Facebook / TikTok / Instagram: no free API for us, so the operator reads the numbers in the
 *    owner's Chrome and records them with `pnpm stats record` (skill: post-stats).
 */
import type { PrismaClient } from '@creatoros/db';
import { audit } from '@creatoros/core';

export const METRIC_FIELDS = ['views', 'likes', 'comments', 'shares', 'saves', 'reach', 'watchTimeSec'] as const;
export type MetricField = (typeof METRIC_FIELDS)[number];
export type MetricValues = Partial<Record<MetricField, number | null>>;

function clean(m: MetricValues): Record<MetricField, number | null> {
  const out = {} as Record<MetricField, number | null>;
  for (const k of METRIC_FIELDS) {
    const v = m[k];
    if (v === undefined || v === null) out[k] = null;
    else if (!Number.isInteger(v) || v < 0) throw new Error(`${k} must be a whole number ≥ 0 (or null if unavailable)`);
    else out[k] = v;
  }
  return out;
}

export async function recordPostMetric(
  db: PrismaClient, postId: string, values: MetricValues,
  opts: { source: 'youtube_api' | 'browser' | 'manual'; actor: string; note?: string; raw?: Record<string, unknown> },
) {
  const post = await db.platformPost.findUnique({ where: { id: postId }, include: { contentProject: { select: { brandId: true } } } });
  if (!post) throw new Error(`no post ${postId}`);
  const m = clean(values);
  if (METRIC_FIELDS.every((k) => m[k] === null)) throw new Error('no numbers given');
  const row = await db.postMetric.create({
    data: { platformPostId: post.id, brandId: post.contentProject.brandId, source: opts.source, ...m,
      note: opts.note, raw: JSON.parse(JSON.stringify(opts.raw ?? {})) },
  });
  await audit(db, opts.actor, 'post.metrics_recorded', { entity: 'PlatformPost', entityId: post.id, brandId: post.contentProject.brandId,
    data: { platform: post.platform, source: opts.source, ...m } });
  return row;
}

const YT_ID = /(?:youtu\.be\/|[?&]v=|shorts\/)([\w-]{11})/;
export function youtubeVideoId(p: { externalId: string | null; url: string | null }) {
  return p.externalId && /^[\w-]{11}$/.test(p.externalId) ? p.externalId : p.url?.match(YT_ID)?.[1] ?? null;
}

/** Fetch public statistics for every YouTube post and append a snapshot each. */
export async function refreshYouTubeMetrics(db: PrismaClient, actor: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY is not set in .env (free key: Google Cloud → APIs → YouTube Data API v3 → Credentials)');
  const posts = await db.platformPost.findMany({ where: { platform: 'youtube', status: { not: 'removed' } } });
  const byVid = new Map<string, string>();
  for (const p of posts) { const v = youtubeVideoId(p); if (v) byVid.set(v, p.id); }
  const ids = [...byVid.keys()];
  let recorded = 0; const missing: string[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk.join(',')}&key=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error(`YouTube API ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = (await r.json()) as { items?: { id: string; statistics: Record<string, string | undefined> }[] };
    const seen = new Set<string>();
    for (const it of j.items ?? []) {
      seen.add(it.id);
      const n = (s?: string) => (s === undefined ? null : Number(s)); // hidden counts → null (unavailable)
      await recordPostMetric(db, byVid.get(it.id)!, { views: n(it.statistics.viewCount), likes: n(it.statistics.likeCount), comments: n(it.statistics.commentCount) },
        { source: 'youtube_api', actor, raw: it.statistics });
      recorded++;
    }
    missing.push(...chunk.filter((v) => !seen.has(v)));
  }
  return { recorded, missing };
}

/** Everything published, grouped by video, with the latest and previous snapshot per post. */
export async function publishedOverview(db: PrismaClient) {
  const posts = await db.platformPost.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { contentProject: { select: { id: true, slug: true, title: true } }, metrics: { orderBy: { capturedAt: 'desc' }, take: 2 } },
  });
  const groups = new Map<string, { project: { id: string; slug: string; title: string }; title: string; firstPublishedAt: Date; posts: unknown[] }>();
  for (const p of posts) {
    const meta = (p.metadata ?? {}) as { title?: string };
    let g = groups.get(p.contentProjectId);
    if (!g) { g = { project: p.contentProject, title: '', firstPublishedAt: p.publishedAt, posts: [] }; groups.set(p.contentProjectId, g); }
    if (!g.title && meta.title) g.title = meta.title;
    if (p.publishedAt < g.firstPublishedAt) g.firstPublishedAt = p.publishedAt;
    const [latest, previous] = p.metrics;
    g.posts.push({ id: p.id, platform: p.platform, url: p.url, status: p.status, visibility: p.visibility, publishedAt: p.publishedAt,
      title: meta.title ?? null, latest: latest ?? null, previous: previous ?? null });
  }
  return [...groups.values()].map((g) => ({ ...g, title: g.title || g.project.title }))
    .sort((a, b) => +b.firstPublishedAt - +a.firstPublishedAt);
}
