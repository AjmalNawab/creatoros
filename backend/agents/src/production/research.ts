import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, MP3_KBPS, TAIL_SEC, VOICE, WORDS_PER_MIN, feedbackOf, project, readJson, withFeedback, writeJson } from './shared';

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
    const p = await project(ctx);
    const params = p.params as { topic: string; language: string; durationSec: number };
    const dir = paths.content(p.slug, 'research');
    const r = await askAi(getDb(), ctx, {
      kind: 'research', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Research Agent of CreatorOS, preparing an original educational ${params.language === 'ur' ? 'Urdu' : 'English'} video (~${params.durationSec}s) for a general audience in Pakistan.

Topic: ${params.topic}

Collect 8-12 accurate, interesting, verifiable facts suitable for a short explainer. Prefer authoritative sources (USGS, NASA, NOAA, WHO, Smithsonian, National Geographic, Britannica, peer-reviewed). Mark confidence honestly. Include a local (Pakistan) angle if one genuinely exists — never invent one. List things to avoid (misconceptions, sensationalism).

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
