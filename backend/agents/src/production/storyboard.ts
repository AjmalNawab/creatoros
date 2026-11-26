import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, TAIL_SEC, projectWithBrand, readJson, writeJson } from './shared';
import { audioSeconds, type Word } from './voice';
import type { Script } from './script';
import { FACEBOOK_PAGE } from '../platforms/facebook/package';

const ts = (s: string) => { const [h, m, rest] = s.split(':'); const [sec, ms] = rest.split(','); return +h * 3600 + +m * 60 + +sec + +ms / 1000; };
function parseSrt(text: string) {
  return text.trim().split(/\n\s*\n/).flatMap((block) => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return [];
    const [a, b] = lines[1].split('-->').map((x) => x.trim());
    return [{ start: ts(a), end: ts(b), text: lines.slice(2).join(' ') }];
  });
}

/** Group word timings into caption cues (~8 words, break on sentence end) for long videos without SRT. */
function cuesFromWords(words: Word[]) {
  const cues: { start: number; end: number; text: string }[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) cues.push({ start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map((w) => w.text).join(' ') }); cur = []; };
  for (const w of words) { cur.push(w); if (cur.length >= 8 || /[.!?]$/.test(w.text)) flush(); }
  flush();
  return cues;
}

const SHORT_TAIL_SEC = 0.12; // Shorts: tight pacing between lines

export const storyboard: AgentDefinition = {
  id: 'storyboard', name: 'Storyboard Agent', department: 'Content Creation', timeoutSec: 60,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    const s = await readJson<Script>(paths.content(p.slug, 'script', 'script.json'));
    const short = (p.params as { format?: string }).format === 'short';
    const pub = paths.renderer('public', p.key);
    await mkdir(pub, { recursive: true });
    let cursor = 0;
    const scenes = [];
    for (const [i, sc] of s.scenes.entries()) {
      const wav = paths.content(p.slug, 'audio', `scene_${i + 1}.wav`);
      const file = existsSync(wav) ? wav : paths.content(p.slug, 'audio', `scene_${i + 1}.mp3`);
      const ext = path.extname(file);
      const audioSec = await audioSeconds(file);
      const durationFrames = Math.ceil((audioSec + (short ? SHORT_TAIL_SEC : TAIL_SEC)) * FPS);
      await copyFile(file, path.join(pub, `scene_${i + 1}${ext}`));
      const wordsFile = paths.content(p.slug, 'audio', `words_${i + 1}.json`);
      const words: Word[] = existsSync(wordsFile) ? await readJson<Word[]>(wordsFile) : [];
      const srt = paths.content(p.slug, 'audio', `scene_${i + 1}.srt`);
      const captions = existsSync(srt) ? parseSrt(await readFile(srt, 'utf8')) : cuesFromWords(words);
      scenes.push({ id: i + 1, title: sc.title, visual: sc.visual, text: sc.text, audio: `${p.key}/scene_${i + 1}${ext}`,
        audioSec: Math.round(audioSec * 1000) / 1000, startFrame: cursor, durationFrames, captions, words });
      cursor += durationFrames;
    }
    const platforms = ((p.params as { platforms?: string[] }).platforms ?? []);
    // Videos not going to YouTube belong to the "Chai & Curiosity" accounts (Facebook Page, TikTok, Instagram, Snapchat),
    // so the end card must not show the YouTube channel handle.
    const chaiOnly = platforms.length > 0 && !platforms.includes('youtube');
    const chaiHandle = platforms.length === 1 && platforms[0] === 'instagram' ? `instagram · ${process.env.INSTAGRAM_HANDLE ?? '@chai_curiosity'}`
      : platforms.length === 1 && platforms[0] === 'tiktok' ? `tiktok · ${process.env.TIKTOK_HANDLE ?? 'Chai & Curiosity'}`
      : platforms.length === 1 && platforms[0] === 'facebook' ? 'facebook.com · Chai & Curiosity'
      : 'Chai & Curiosity';
    const data = short
      ? { key: p.key, language: p.language, fps: FPS, width: 1080, height: 1920, totalFrames: cursor,
          lines: scenes.map(({ id, text, audio, startFrame, durationFrames, words, visual, title }) => ({ id, text, title, audio, startFrame, durationFrames, words, visual })),
          // The end card names where the video is posted (not the YouTube channel for Chai & Curiosity-only videos).
          brand: chaiOnly ? { name: FACEBOOK_PAGE.name, handle: chaiHandle, accent: '#ffd27a' }
            : { name: brand.name, handle: profile.channels.youtube?.handle, accent: p.language === 'ur' ? '#fdd835' : '#ff7a1a' },
          endCard: s.endCard }
      : (p.params as { orientation?: string }).orientation === 'vertical'
        ? { key: p.key, language: p.language, fps: FPS, width: 1080, height: 1920, totalFrames: cursor, scenes }
        : { key: p.key, language: p.language, fps: FPS, width: 1920, height: 1080, totalFrames: cursor, scenes };
    await mkdir(paths.content(p.slug, 'storyboard'), { recursive: true });
    await writeJson(paths.content(p.slug, 'storyboard', 'storyboard.json'), data);
    await writeJson(paths.content(p.slug, 'storyboard', 'props.json'), { data });
    return { output: { format: short ? 'short' : 'long', scenes: scenes.length, totalFrames: cursor, seconds: Math.round(cursor / FPS) } };
  },
};
