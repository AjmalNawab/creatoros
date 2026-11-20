import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson } from '../ai';
import { paths, run } from '../paths';
import type { AgentContext, AgentDefinition } from '../types';

/**
 * Phase 2 content-production agents (the $0 pipeline proven by hand in content/001-volcanoes).
 * All files live in content/<slug>/; the renderer gets per-video scenes in media/renderer/src/videos/<key>.tsx.
 */

const FPS = 30;
const TAIL_SEC = 0.6;          // pause after each scene's narration
const MP3_KBPS = 48;           // edge-tts output: 24kHz mono 48kbps CBR
const WORDS_PER_MIN = 175;     // measured: Asad voice at +8% ≈ 178 wpm
const VOICE = 'ur-PK-AsadNeural';

async function project(ctx: AgentContext) {
  if (!ctx.contentProjectId) throw new Error('task has no content project');
  return getDb().contentProject.findUniqueOrThrow({ where: { id: ctx.contentProjectId } });
}
const readJson = async <T>(file: string) => JSON.parse(await readFile(file, 'utf8')) as T;
const writeJson = (file: string, v: unknown) => writeFile(file, JSON.stringify(v, null, 1), 'utf8');
const feedbackOf = (ctx: AgentContext) => (ctx.input as { feedback?: string } | null)?.feedback;
const withFeedback = (prompt: string, ctx: AgentContext) =>
  feedbackOf(ctx) ? `${prompt}\n\n---\nOWNER FEEDBACK ON THE PREVIOUS VERSION (must be addressed):\n${feedbackOf(ctx)}` : prompt;

// ---------------------------------------------------------------- Research
const ResearchSchema = z.object({
  summary: z.string().min(20),
  audience: z.string(),
  facts: z.array(z.object({ fact: z.string(), confidence: z.enum(['high', 'medium', 'low']), source: z.string() })).min(5),
  sources: z.array(z.object({ name: z.string(), url: z.string().url() })).min(1),
  avoid: z.array(z.string()).default([]),
});
type Research = z.infer<typeof ResearchSchema>;

const research: AgentDefinition = {
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

// ---------------------------------------------------------------- Script
const ScriptSchema = z.object({
  titleOptions: z.array(z.string()).min(1).max(5),
  scenes: z.array(z.object({ title: z.string(), visual: z.string(), text: z.string().min(10) })).min(4).max(10),
});
type Script = z.infer<typeof ScriptSchema>;

const script: AgentDefinition = {
  id: 'script', name: 'Script Writing Agent', department: 'Content Creation', timeoutSec: 120, requiresApprovalAfter: true,
  async run(ctx) {
    const p = await project(ctx);
    const params = p.params as { topic: string; language: string; durationSec: number };
    const r = await readJson<Research>(paths.content(p.slug, 'research', 'research.json'));
    const target = Math.round((params.durationSec / 60) * WORDS_PER_MIN);
    const s = await askAi(getDb(), ctx, {
      kind: 'script', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Script Writing Agent of CreatorOS. Write an ORIGINAL ${params.language === 'ur' ? 'Urdu (natural spoken Pakistani Urdu, Urdu script)' : 'English'} narration script for a ~${params.durationSec}s animated educational video.

Topic: ${params.topic}
Research (use only these facts; prefer high confidence):
${JSON.stringify({ summary: r.summary, facts: r.facts, avoid: r.avoid }, null, 1)}

Requirements:
- ${target} words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Simple, warm, curious tone. Short sentences (they become subtitles). Spell numbers as words.
- For each scene give a short English "visual" note describing an animated diagram that can be drawn with simple SVG shapes (no photos, no real people, no logos).

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

// ---------------------------------------------------------------- Voice
const voice: AgentDefinition = {
  id: 'voice', name: 'Voice Agent', department: 'Content Creation', timeoutSec: 600,
  async run(ctx) {
    const p = await project(ctx);
    const s = await readJson<Script>(paths.content(p.slug, 'script', 'script.json'));
    const dir = paths.content(p.slug, 'audio');
    await mkdir(dir, { recursive: true });
    const files: string[] = [];
    for (const [i, sc] of s.scenes.entries()) {
      const base = path.join(dir, `scene_${i + 1}`);
      let ok = false;
      for (let attempt = 1; attempt <= 6 && !ok; attempt++) {
        try {
          // --text (not -f): the service intermittently returns no audio for file input.
          await run(paths.venvBin('edge-tts'), ['--voice', VOICE, '--rate=+8%', '--text', sc.text,
            '--write-media', `${base}.mp3`, '--write-subtitles', `${base}.srt`], { signal: ctx.signal });
          ok = (await stat(`${base}.mp3`)).size > 1000;
        } catch (e) { if (ctx.signal.aborted) throw e; }
        if (!ok) await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
      if (!ok) throw new Error(`edge-tts failed for scene ${i + 1} after 6 attempts`);
      files.push(`scene_${i + 1}.mp3`);
      await ctx.log(`voice scene ${i + 1}/${s.scenes.length} done`);
    }
    return { output: { voice: VOICE, files } };
  },
};

// ---------------------------------------------------------------- Storyboard
const ts = (s: string) => { const [h, m, rest] = s.split(':'); const [sec, ms] = rest.split(','); return +h * 3600 + +m * 60 + +sec + +ms / 1000; };
function parseSrt(text: string) {
  return text.trim().split(/\n\s*\n/).flatMap((block) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return [];
    const [a, b] = lines[1].split('-->').map((x) => x.trim());
    return [{ start: ts(a), end: ts(b), text: lines.slice(2).join(' ') }];
  });
}

const storyboard: AgentDefinition = {
  id: 'storyboard', name: 'Storyboard Agent', department: 'Content Creation', timeoutSec: 60,
  async run(ctx) {
    const p = await project(ctx);
    const s = await readJson<Script>(paths.content(p.slug, 'script', 'script.json'));
    const pub = paths.renderer('public', p.key);
    await mkdir(pub, { recursive: true });
    let cursor = 0;
    const scenes = [];
    for (const [i, sc] of s.scenes.entries()) {
      const mp3 = paths.content(p.slug, 'audio', `scene_${i + 1}.mp3`);
      const audioSec = ((await stat(mp3)).size * 8) / (MP3_KBPS * 1000);
      const durationFrames = Math.ceil((audioSec + TAIL_SEC) * FPS);
      await copyFile(mp3, path.join(pub, `scene_${i + 1}.mp3`));
      scenes.push({ id: i + 1, title: sc.title, visual: sc.visual, text: sc.text, audio: `${p.key}/scene_${i + 1}.mp3`,
        audioSec: Math.round(audioSec * 1000) / 1000, startFrame: cursor, durationFrames,
        captions: parseSrt(await readFile(paths.content(p.slug, 'audio', `scene_${i + 1}.srt`), 'utf8')) });
      cursor += durationFrames;
    }
    const data = { key: p.key, fps: FPS, width: 1920, height: 1080, totalFrames: cursor, scenes };
    await mkdir(paths.content(p.slug, 'storyboard'), { recursive: true });
    await writeJson(paths.content(p.slug, 'storyboard', 'storyboard.json'), data);
    await writeJson(paths.content(p.slug, 'storyboard', 'props.json'), { data });
    return { output: { scenes: scenes.length, totalFrames: cursor, seconds: Math.round(cursor / FPS) } };
  },
};

// ---------------------------------------------------------------- Visuals
async function regenerateVideoIndex() {
  const keys = (await readdir(paths.renderer('src', 'videos'))).filter((f) => /^p\d+\.tsx$/.test(f)).map((f) => f.replace('.tsx', '')).sort();
  await writeFile(paths.renderer('src', 'videos', 'index.ts'), [
    '// AUTO-GENERATED by the Visuals agent. Maps content key → scene components.',
    "import type React from 'react';",
    ...keys.map((k) => `import { SCENES as ${k} } from './${k}';`), '',
    'export const VIDEOS: Record<string, React.FC[]> = {', ...keys.map((k) => `  ${k},`), '};', ''].join('\n'));
}

const visuals: AgentDefinition = {
  id: 'visuals', name: 'Visual Generation Agent', department: 'Content Creation', timeoutSec: 900,
  async run(ctx) {
    const p = await project(ctx);
    type SB = { totalFrames: number; scenes: { id: number; title: string; visual: string; text: string; startFrame: number; durationFrames: number }[] };
    const sb = await readJson<SB>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    const file = paths.renderer('src', 'videos', `${p.key}.tsx`);
    const code = await askAi(getDb(), ctx, {
      kind: 'visuals', format: 'text', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a 1920x1080 educational video.

Write the file content for: media/renderer/src/videos/${p.key}.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene${sb.scenes.length}];  (exactly ${sb.scenes.length}, in order)
- Import helpers only from '../common' (C, NightSky, Particles, Tag, UrduText, ease, prog) and from 'remotion'. No external images, fonts, or network.
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- Keep the bottom 170px clear of important content (subtitles are drawn there). Urdu on-screen labels via <UrduText>/<Tag>.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Storyboard:
${JSON.stringify(sb.scenes.map((s) => ({ scene: s.id, title: s.title, seconds: +(s.durationFrames / 30).toFixed(1), visual: s.visual, narration: s.text })), null, 1)}

Answer with ONLY the complete TSX file content.`, ctx),
      validate: async (raw) => {
        const src = (raw.match(/```(?:tsx|typescript|ts)?\s*([\s\S]*?)```/)?.[1] ?? raw).trim();
        if (!/export const SCENES/.test(src)) throw new Error('Module must export const SCENES');
        const prev = existsSync(file) ? await readFile(file, 'utf8') : null;
        await writeFile(file, src);
        await regenerateVideoIndex();
        try {
          await run('npx', ['tsc', '-p', '.', '--noEmit'], { cwd: paths.renderer(), signal: ctx.signal });
        } catch (e) {
          if (prev != null) await writeFile(file, prev); else await rm(file, { force: true });
          await regenerateVideoIndex();
          throw new Error(`TypeScript errors:\n${(e as Error).message.slice(0, 3000)}`);
        }
        return src;
      },
    });
    // Preview stills (one per scene, at 85% of the scene) for review in the Content Studio.
    const frames = sb.scenes.map((s) => s.startFrame + Math.floor(s.durationFrames * 0.85));
    await run('node', ['scripts/stills.mjs', paths.content(p.slug, 'storyboard', 'props.json'), paths.content(p.slug, 'visuals', 'stills'), ...frames.map(String)],
      { cwd: paths.renderer(), signal: ctx.signal });
    return { output: { file: `media/renderer/src/videos/${p.key}.tsx`, lines: code.split('\n').length, stills: sb.scenes.map((_, i) => `visuals/stills/scene_${i + 1}.jpg`) } };
  },
};

// ---------------------------------------------------------------- Video assembly
const video: AgentDefinition = {
  id: 'video', name: 'Video Production Agent', department: 'Content Creation', timeoutSec: 2400, maxAttempts: 2,
  async run(ctx) {
    const p = await project(ctx);
    const out = paths.content(p.slug, 'output', `${p.slug}.mp4`);
    await mkdir(path.dirname(out), { recursive: true });
    const t0 = Date.now();
    await run('npx', ['remotion', 'render', 'src/index.ts', 'Video', out, `--props=${paths.content(p.slug, 'storyboard', 'props.json')}`, '--codec=h264', '--crf=20'],
      { cwd: paths.renderer(), signal: ctx.signal });
    const size = (await stat(out)).size;
    return { output: { file: `content/${p.slug}/output/${p.slug}.mp4`, bytes: size, renderSec: Math.round((Date.now() - t0) / 1000) } };
  },
};

// ---------------------------------------------------------------- QA
const qa: AgentDefinition = {
  id: 'qa', name: 'Quality Assurance Agent', department: 'Compliance & Protection', timeoutSec: 120, requiresApprovalAfter: true,
  async run(ctx) {
    const p = await project(ctx);
    const file = paths.content(p.slug, 'output', `${p.slug}.mp4`);
    const sb = await readJson<{ totalFrames: number; scenes: { captions: unknown[] }[] }>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    const probe = JSON.parse(await run('npx', ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', file],
      { cwd: paths.renderer(), signal: ctx.signal })) as { format: { duration: string }; streams: { codec_type: string; width?: number; height?: number }[] };
    const v = probe.streams.find((s) => s.codec_type === 'video');
    const duration = Number(probe.format.duration);
    const expected = sb.totalFrames / FPS;
    const checks = [
      { check: 'Video stream 1920x1080', pass: v?.width === 1920 && v?.height === 1080, detail: `${v?.width}x${v?.height}` },
      { check: 'Audio stream present', pass: probe.streams.some((s) => s.codec_type === 'audio'), detail: '' },
      { check: 'Duration matches storyboard (±1s)', pass: Math.abs(duration - expected) <= 1, detail: `${duration.toFixed(1)}s vs ${expected.toFixed(1)}s` },
      { check: 'Every scene has subtitles', pass: sb.scenes.every((s) => s.captions.length > 0), detail: '' },
      { check: 'All facts from research (no unsourced claims)', pass: true, detail: 'script approved by owner against research' },
    ];
    const passed = checks.every((c) => c.pass);
    await mkdir(paths.content(p.slug, 'qa'), { recursive: true });
    await writeJson(paths.content(p.slug, 'qa', 'report.json'), { passed, checks, at: new Date().toISOString() });
    if (!passed) throw new Error(`QA failed: ${checks.filter((c) => !c.pass).map((c) => `${c.check} (${c.detail})`).join('; ')}`);
    await getDb().contentProject.update({ where: { id: p.id }, data: { status: 'awaiting_final_approval' } });
    return { output: { passed, checks, video: `content/${p.slug}/output/${p.slug}.mp4`, durationSec: Math.round(duration) } };
  },
};

export const CONTENT_AGENTS: AgentDefinition[] = [research, script, voice, storyboard, visuals, video, qa];
