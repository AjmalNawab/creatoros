import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, LANG_NAME, MP3_KBPS, TAIL_SEC, brandBlock, feedbackOf, project, projectWithBrand, readJson, withFeedback, writeJson } from './shared';

export const video: AgentDefinition = {
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
