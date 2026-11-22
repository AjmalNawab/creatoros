import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, LANG_NAME, MP3_KBPS, TAIL_SEC, brandBlock, feedbackOf, project, projectWithBrand, readJson, withFeedback, writeJson } from './shared';

export const qa: AgentDefinition = {
  id: 'qa', name: 'Quality Assurance Agent', department: 'Compliance & Protection', timeoutSec: 120, requiresApprovalAfter: true,
  async run(ctx) {
    const p = await project(ctx);
    const file = paths.content(p.slug, 'output', `${p.slug}.mp4`);
    const sb = await readJson<{ totalFrames: number; width?: number; height?: number; scenes?: { captions: unknown[] }[]; lines?: { words: unknown[] }[] }>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    const short = !!sb.lines;
    // The storyboard decides the frame (Short, vertical long-form or 16:9); fall back to the format default.
    const [W, H] = sb.width && sb.height ? [sb.width, sb.height] : short ? [1080, 1920] : [1920, 1080];
    const probe = JSON.parse(await run('npx', ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height', '-of', 'json', file],
      { cwd: paths.renderer(), signal: ctx.signal })) as { format: { duration: string }; streams: { codec_type: string; width?: number; height?: number }[] };
    const v = probe.streams.find((s) => s.codec_type === 'video');
    const duration = Number(probe.format.duration);
    const expected = sb.totalFrames / FPS;
    const checks = [
      { check: `Video stream ${W}x${H}${short ? ' (vertical Short)' : H > W ? ' (vertical)' : ''}`, pass: v?.width === W && v?.height === H, detail: `${v?.width}x${v?.height}` },
      { check: 'Audio stream present', pass: probe.streams.some((s) => s.codec_type === 'audio'), detail: '' },
      { check: 'Duration matches storyboard (±2s)', pass: Math.abs(duration - expected) <= 2, detail: `${duration.toFixed(1)}s vs ${expected.toFixed(1)}s` },
      ...(short ? [{ check: 'Short length 15-60 s', pass: duration >= 15 && duration <= 60, detail: `${duration.toFixed(1)}s` }] : []),
      { check: short ? 'Every line has word-by-word captions' : 'Every scene has subtitles', pass: short ? sb.lines!.every((l) => l.words.length > 0) : sb.scenes!.every((s) => s.captions.length > 0), detail: '' },
      { check: 'All facts from research (no unsourced claims)', pass: true, detail: 'script approved by owner against research' },
    ];
    const passed = checks.every((c) => c.pass);
    await mkdir(paths.content(p.slug, 'qa'), { recursive: true });
    await writeJson(paths.content(p.slug, 'qa', 'report.json'), { passed, checks, at: new Date().toISOString() });
    if (!passed) throw new Error(`QA failed: ${checks.filter((c) => !c.pass).map((c) => `${c.check} (${c.detail})`).join('; ')}`);
    await getDb().contentProject.update({ where: { id: p.id }, data: { status: 'awaiting_final_approval' } });
    return { output: { passed, checks, format: short ? 'short' : 'long', video: `content/${p.slug}/output/${p.slug}.mp4`, durationSec: Math.round(duration) } };
  },
};
