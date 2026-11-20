import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, MP3_KBPS, TAIL_SEC, VOICE, WORDS_PER_MIN, feedbackOf, project, readJson, withFeedback, writeJson } from './shared';
import type { Script } from './script';

export const voice: AgentDefinition = {
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
