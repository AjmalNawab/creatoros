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
  scenes: z.array(z.object({ title: z.string(), visual: z.string(), text: z.string().min(3) })).min(4).max(12),
  /** Shorts only: end card shown over the last second. */
  endCard: z.object({ title: z.string().max(60), cta: z.string().max(60) }).optional(),
});
export type Script = z.infer<typeof ScriptSchema>;

export const script: AgentDefinition = {
  id: 'script', name: 'Script Writing Agent', department: 'Content Creation', timeoutSec: 120, requiresApprovalAfter: true,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    const params = p.params as { topic: string; language: string; durationSec: number; format?: 'short' | 'long'; angle?: string; audience?: string; titleHint?: string };
    const short = params.format === 'short';
    const r = await readJson<Research>(paths.content(p.slug, 'research', 'research.json'));
    const target = Math.round((params.durationSec / 60) * voiceFor(profile, params.language).wpm);
    const s = await askAi(getDb(), ctx, {
      kind: 'script', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Script Writing Agent of CreatorOS. Write an ORIGINAL ${LANG_NAME[params.language as 'en' | 'ur'] ?? LANG_NAME.en} narration script for a ~${params.durationSec}s animated video.

${brandBlock(brand.name, profile)}

Topic: ${params.topic}
${params.angle ? `Angle (owner-selected idea): ${params.angle}\nTarget audience: ${params.audience}\nWorking title: ${params.titleHint}\n` : ''}Research (use only these facts; prefer high confidence):
${JSON.stringify({ summary: r.summary, facts: r.facts, avoid: r.avoid }, null, 1)}

${short ? `FORMAT: vertical YouTube SHORT (9:16), ~${params.durationSec}s. Every second counts.
Requirements:
- ${target} words total (±15%), split into 6-10 LINES (each "scene" is one spoken line of 4-16 words; each line gets its own visual beat and word-by-word captions).
- Line 1 is the HOOK: at most 10 words, a surprising fact or tension that makes people stop scrolling. No greeting, no channel intro, no "in this video".
- Then a fast, clear story: the key mechanism or twist in the middle, and one concrete number (it will count up on screen).
- The last line is a short payoff/lesson that loops back to the hook (Shorts replay). Do NOT say "subscribe" in narration; the end card does that.
- endCard: title (the lesson, max 6 words) and cta (e.g. "Follow for a new story every week").
- For each line, a short English "visual" note: one simple animated diagram in this style: ${profile.visualStyle}. Vertical layout.` : `Requirements:
- ${target} words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Follow the brand tone. Short sentences (they become subtitles).${params.language === 'ur' ? ' Spell numbers as words.' : ''}
- For each scene give a short English "visual" note describing an animated diagram in this style: ${profile.visualStyle}`}

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}]${short ? ', "endCard": {"title": string, "cta": string}' : ''}}`, ctx),
      validate: (raw) => {
        const v = ScriptSchema.parse(parseJson(raw));
        const words = v.scenes.reduce((n, sc) => n + sc.text.split(/\s+/).filter(Boolean).length, 0);
        if (words < target * 0.75 || words > target * 1.3) throw new Error(`Script has ${words} words; target is ${target} (±15%).`);
        if (short) {
          if (v.scenes.length < 6) throw new Error('A Short needs 6-10 lines.');
          const hook = v.scenes[0].text.split(/\s+/).length;
          if (hook > 12) throw new Error(`The hook (line 1) has ${hook} words; keep it to 10 or fewer.`);
          const long = v.scenes.find((sc) => sc.text.split(/\s+/).length > 18);
          if (long) throw new Error(`Line too long for a Short (max 16 words): "${long.text}"`);
          if (!v.endCard) throw new Error('Shorts need an endCard {title, cta}.');
        }
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
    return { output: { file: `content/${p.slug}/script/script.md`, format: short ? 'short' : 'long', words, targetWords: target, titleOptions: s.titleOptions, scenes: s.scenes, ...(s.endCard ? { endCard: s.endCard } : {}) } };
  },
};
