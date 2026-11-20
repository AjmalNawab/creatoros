import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, type AgentDefinition, type Json } from '@creatoros/core';
import { profileOf } from './brand';

/**
 * Trend Monitoring agent. Collects what is trending now for the brand's region/niche.
 * Official data first: if YOUTUBE_API_KEY is set, it pulls YouTube "most popular" charts for the region
 * (free quota, public data only). The AI answer (operator: Claude Code with web search / Chrome) adds
 * Google Trends, news and search signals, and must cite where each signal came from.
 */
const TrendsSchema = z.object({
  trends: z.array(z.object({
    topic: z.string(), signal: z.string(), source: z.string(), url: z.string().optional(),
    freshness: z.enum(['today', 'this_week', 'this_month', 'evergreen_rising', 'seasonal']),
    relevance: z.number().int().min(1).max(5),
  })).min(5),
  notes: z.string().default(''),
});
export type Trends = z.infer<typeof TrendsSchema>;

async function youtubePopular(region: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const out: { category: string; title: string; channel: string; views: number; publishedAt: string }[] = [];
  for (const [cat, name] of [['', 'all'], ['27', 'Education'], ['28', 'Science & Technology']]) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=25${cat ? `&videoCategoryId=${cat}` : ''}&key=${key}`;
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json() as { items: { snippet: { title: string; channelTitle: string; publishedAt: string }; statistics: { viewCount?: string } }[] };
      for (const v of j.items) out.push({ category: name, title: v.snippet.title, channel: v.snippet.channelTitle, views: Number(v.statistics.viewCount ?? 0), publishedAt: v.snippet.publishedAt });
    } catch { /* a missing category chart is fine */ }
  }
  return out;
}

export const trends: AgentDefinition = {
  id: 'trends', name: 'Trend Monitoring Agent', department: 'Strategy & Research', timeoutSec: 120,
  async run(ctx) {
    const db = getDb();
    const brand = await db.brand.findUniqueOrThrow({ where: { id: ctx.brandId! } });
    const profile = profileOf(brand);
    const focus = (ctx.input as { focus?: string })?.focus;
    const yt = await youtubePopular(profile.region);
    const today = new Date().toISOString().slice(0, 10);
    const result = await askAi(db, ctx, {
      kind: 'trends', format: 'json',
      prompt: `You are the Trend Monitoring Agent of CreatorOS. Today is ${today}. Find what is trending NOW that fits this brand.

Brand: ${brand.name}
Niche: ${profile.niche}
Audience: ${profile.audience}
Region: ${profile.region} · Language: ${profile.language}
Pillars: ${profile.pillars.join('; ')}
Avoid: ${profile.avoid.join('; ')}
${focus ? `Owner focus for this round: ${focus}` : ''}

${yt ? `Official YouTube "most popular" data for ${profile.region} (YouTube Data API):\n${JSON.stringify(yt.slice(0, 60))}` : 'No YouTube API key configured: gather signals yourself.'}

Use real, current signals (web search, Google Trends for ${profile.region}, YouTube search suggestions and recent uploads, news, seasonal events, science news from NASA/ESA/WHO/etc.). Cite each signal's source; never invent trends. Include evergreen topics that are currently rising, and upcoming seasonal/astronomical events in the next 2-4 weeks.

Answer with ONLY JSON:
{"trends": [{"topic": string, "signal": string (what shows it is trending), "source": string, "url": string (optional), "freshness": "today"|"this_week"|"this_month"|"evergreen_rising"|"seasonal", "relevance": 1-5 (fit to brand)}], "notes": string}`,
      validate: (raw) => TrendsSchema.parse(parseJson(raw)),
    });
    return { output: { ...result, youtubeApi: yt ? yt.length : 0, date: today } as unknown as Json };
  },
};
