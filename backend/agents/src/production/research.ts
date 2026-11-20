import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, LANG_NAME, MP3_KBPS, TAIL_SEC, brandBlock, feedbackOf, project, projectWithBrand, readJson, withFeedback, writeJson } from './shared';

export const ResearchSchema = z.object({
  summary: z.string().min(20),
  audience: z.string(),
  facts: z.array(z.object({ fact: z.string(), confidence: z.enum(['high', 'medium', 'low']), source: z.string() })).min(5),
  sources: z.array(z.object({ name: z.string(), url: z.string().url() })).min(1),
  avoid: z.array(z.string()).default([]),
});
export type Research = z.infer<typeof ResearchSchema>;

export const research: AgentDefinition = {
  id: 'research', name: 'Research Agent', department: 'Strategy & Research', timeoutSec: 120,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    const params = p.params as { topic: string; language: string; durationSec: number; angle?: string; audience?: string; keywords?: string[] };
    const dir = paths.content(p.slug, 'research');
    const r = await askAi(getDb(), ctx, {
      kind: 'research', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Research Agent of CreatorOS, preparing an original animated ${params.language === 'ur' ? 'Urdu' : 'English'} video (~${params.durationSec}s).

${brandBlock(brand.name, profile)}

Topic: ${params.topic}
${params.angle ? `Chosen angle (from strategy): ${params.angle}\nTarget audience: ${params.audience}\nSearch keywords: ${(params.keywords ?? []).join(', ')}\n` : ''}
Collect 8-14 accurate, interesting, verifiable facts that tell the story (for incidents: timeline, root cause, investigators' findings, the fix and the lasting lesson). Prefer primary/authoritative sources (official investigation reports, agency sites, engineering papers, Britannica, reputable press). Mark confidence honestly. List things to avoid (misconceptions, myths, sensational framings).

Answer with ONLY a JSON object:
{"summary": string, "audience": string, "facts": [{"fact": string, "confidence": "high"|"medium"|"low", "source": string}], "sources": [{"name": string, "url": string}], "avoid": [string]}`, ctx),
      validate: (raw) => ResearchSchema.parse(parseJson(raw)),
    });
    await mkdir(dir, { recursive: true });
    await writeJson(path.join(dir, 'research.json'), r);
    await writeFile(path.join(dir, 'research.md'), [
      `# Research: ${params.topic}`, '', r.summary, '', `**Audience:** ${r.audience}`, '', '## Facts', '',
      '| # | Fact | Confidence | Source |', '|---|---|---|---|',
      ...r.facts.map((f, i) => `| ${i + 1} | ${f.fact} | ${f.confidence} | ${f.source} |`), '',
      '## Sources', ...r.sources.map((s) => `- ${s.name}: ${s.url}`), '', '## Avoid', ...r.avoid.map((a) => `- ${a}`),
    ].join('\n'));
    return { output: { file: `content/${p.slug}/research/research.md`, facts: r.facts.length, summary: r.summary } };
  },
};
