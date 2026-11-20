import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, LANG_NAME, voiceFor, MP3_KBPS, TAIL_SEC, brandBlock, feedbackOf, project, projectWithBrand, readJson, withFeedback, writeJson } from './shared';
import type { Research } from './research';

export const ScriptSchema = z.object({
  titleOptions: z.array(z.string()).min(1).max(5),
  scenes: z.array(z.object({ title: z.string(), visual: z.string(), text: z.string().min(10) })).min(4).max(10),
});
export type Script = z.infer<typeof ScriptSchema>;

export const script: AgentDefinition = {
  id: 'script', name: 'Script Writing Agent', department: 'Content Creation', timeoutSec: 120, requiresApprovalAfter: true,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    const params = p.params as { topic: string; language: string; durationSec: number; angle?: string; audience?: string; titleHint?: string };
    const r = await readJson<Research>(paths.content(p.slug, 'research', 'research.json'));
    const target = Math.round((params.durationSec / 60) * voiceFor(profile, params.language).wpm);
    const s = await askAi(getDb(), ctx, {
      kind: 'script', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Script Writing Agent of CreatorOS. Write an ORIGINAL ${LANG_NAME[params.language as 'en' | 'ur'] ?? LANG_NAME.en} narration script for a ~${params.durationSec}s animated video.

${brandBlock(brand.name, profile)}

Topic: ${params.topic}
${params.angle ? `Angle (owner-selected idea): ${params.angle}\nTarget audience: ${params.audience}\nWorking title: ${params.titleHint}\n` : ''}Research (use only these facts; prefer high confidence):
${JSON.stringify({ summary: r.summary, facts: r.facts, avoid: r.avoid }, null, 1)}

Requirements:
- ${target} words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Follow the brand tone. Short sentences (they become subtitles).${params.language === 'ur' ? ' Spell numbers as words.' : ''}
- For each scene give a short English "visual" note describing an animated diagram in this style: ${profile.visualStyle}

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}]}`, ctx),
      validate: (raw) => {
        const v = ScriptSchema.parse(parseJson(raw));
        const words = v.scenes.reduce((n, sc) => n + sc.text.split(/\s+/).filter(Boolean).length, 0);
        if (words < target * 0.75 || words > target * 1.3) throw new Error(`Script has ${words} words; target is ${target} (±15%).`);
        return v;
      },
    });
    const dir = paths.content(p.slug, 'script');
    await mkdir(dir, { recursive: true });
    await writeJson(path.join(dir, 'script.json'), s);
    const md = [`# Script: ${params.topic}`, '', '**Title options**', ...s.titleOptions.map((t, i) => `${i + 1}. ${t}`), '',
      ...s.scenes.flatMap((sc, i) => [`### Scene ${i + 1}: ${sc.title}`, `*Visual: ${sc.visual}*`, '', sc.text, ''])].join('\n');
    await writeFile(path.join(dir, 'script.md'), md);
    const words = s.scenes.reduce((n, sc) => n + sc.text.split(/\s+/).filter(Boolean).length, 0);
    return { output: { file: `content/${p.slug}/script/script.md`, words, targetWords: target, titleOptions: s.titleOptions, scenes: s.scenes } };
  },
};
