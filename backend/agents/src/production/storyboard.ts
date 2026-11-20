import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, MP3_KBPS, TAIL_SEC, VOICE, WORDS_PER_MIN, feedbackOf, project, readJson, withFeedback, writeJson } from './shared';
import type { Script } from './script';

const ts = (s: string) => { const [h, m, rest] = s.split(':'); const [sec, ms] = rest.split(','); return +h * 3600 + +m * 60 + +sec + +ms / 1000; };
function parseSrt(text: string) {
  return text.trim().split(/\n\s*\n/).flatMap((block) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return [];
    const [a, b] = lines[1].split('-->').map((x) => x.trim());
    return [{ start: ts(a), end: ts(b), text: lines.slice(2).join(' ') }];
  });
}

export const storyboard: AgentDefinition = {
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
