import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, audit, parseJson, type AgentDefinition, type Json } from '@creatoros/core';
import { profileOf } from './brand';
import type { Trends } from './trends';

/**
 * Content Strategy (Idea) agent. Turns trend signals into ranked, brand-fit video ideas with audience,
 * angle, competition and evidence. Ideas are stored as PROPOSED; the owner picks one in the dashboard
 * and it becomes a content project (selectIdea).
 */
const IdeasSchema = z.object({
  ideas: z.array(z.object({
    title: z.string().min(5),
    topic: z.string().min(3),
    angle: z.string().min(10),
    audience: z.string().min(5),
    whyNow: z.string().min(10),
    evidence: z.array(z.object({ source: z.string(), detail: z.string(), url: z.string().optional() })).min(1),
    competition: z.string().min(10),
    keywords: z.array(z.string()).min(3).max(15),
    format: z.enum(['long', 'short']),
    durationSec: z.number().int().min(30).max(600),
    score: z.number().int().min(1).max(10),
  })).min(3).max(10),
});

export const ideas: AgentDefinition = {
  id: 'ideas', name: 'Content Strategy Agent', department: 'Strategy & Research', timeoutSec: 120,
  async run(ctx) {
    const db = getDb();
    const brand = await db.brand.findUniqueOrThrow({ where: { id: ctx.brandId! } });
    const profile = profileOf(brand);
    const { count = 5, focus } = (ctx.input ?? {}) as { count?: number; focus?: string };
    const trendTask = await db.task.findFirstOrThrow({ where: { dependents: { some: { taskId: ctx.taskId } }, agentId: 'trends' } });
    const t = trendTask.output as unknown as Trends;
    const recent = await db.contentProject.findMany({ where: { brandId: brand.id }, orderBy: { createdAt: 'desc' }, take: 30, select: { title: true } });
    const rejected = await db.idea.findMany({ where: { brandId: brand.id, status: 'REJECTED' }, orderBy: { decidedAt: 'desc' }, take: 20, select: { topic: true, feedback: true } });

    const res = await askAi(db, ctx, {
      kind: 'ideas', format: 'json',
      prompt: `You are the Content Strategy Agent of CreatorOS. Propose the ${count} best NEXT videos for this brand.

Brand profile: ${JSON.stringify(profile)}
${focus ? `Owner focus: ${focus}` : ''}
Trend signals (with sources): ${JSON.stringify(t.trends)}
Already made (do not repeat): ${JSON.stringify(recent.map((r) => r.title))}
Previously rejected by owner (learn from feedback): ${JSON.stringify(rejected)}

For each idea:
- title: catchy, honest Urdu working title
- topic: the topic in English (short)
- angle: what makes OUR video different/better than existing ones
- audience: the specific viewers it targets and why they will care
- whyNow: why this is timely (link to the trend signals)
- evidence: cite the signals/sources used
- competition: what already exists (check YouTube search for the Urdu/Hindi/English topic) and how we beat it
- keywords: search phrases people actually use (Urdu + Roman Urdu + English)
- format: "long" (60-180s) or "short" (<60s); durationSec
- score: 1-10 = brand fit × opportunity (trend strength vs competition). Be honest; rank best first.
Ideas must be explainable with simple animated diagrams (no real footage) and fit the "avoid" list.

Answer with ONLY JSON: {"ideas": [{"title","topic","angle","audience","whyNow","evidence":[{"source","detail","url"}],"competition","keywords":[],"format","durationSec","score"}]}`,
      validate: (raw) => IdeasSchema.parse(parseJson(raw)),
    });

    const sorted = [...res.ideas].sort((a, b) => b.score - a.score);
    for (const [i, idea] of sorted.entries()) {
      await db.idea.create({ data: { ...idea, brandId: brand.id, taskId: ctx.taskId, rank: i + 1,
        evidence: idea.evidence as never, keywords: idea.keywords as never, platforms: ['youtube'] as never } });
    }
    await audit(db, 'agent:ideas', 'ideas.proposed', { entity: 'task', entityId: ctx.taskId, brandId: brand.id, data: { count: sorted.length } });
    return { output: { proposed: sorted.length, top: sorted.slice(0, 3).map((x) => ({ title: x.title, score: x.score })) } as unknown as Json };
  },
};
