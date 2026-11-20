import { mkdir, rm, stat, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { paths, run, type AgentDefinition } from '@creatoros/core';
import { MP3_KBPS, isKokoro, projectWithBrand, rateToSpeed, readJson, voiceFor, writeJson } from './shared';
import type { Script } from './script';

/**
 * Voice agent. One audio file per scene/line:
 *  - English: Kokoro-82M, local and free (media/tts/kokoro.mjs) → scene_N.wav
 *  - Urdu: edge-tts (Kokoro has no Urdu) → scene_N.mp3 + scene_N.srt
 * Then word-level timings for captions → audio/words_N.json
 *  - English: whisper.cpp aligned to the exact script words (media/tts/words.mjs)
 *  - Urdu: proportional by word length across the line (whisper base.en is English-only)
 */
export type Word = { text: string; start: number; end: number };

/** Audio length in seconds: WAV from its header, MP3 from edge-tts' constant bitrate. */
export async function audioSeconds(file: string): Promise<number> {
  if (file.endsWith('.mp3')) return ((await stat(file)).size * 8) / (MP3_KBPS * 1000);
  const b = await readFile(file);
  const byteRate = b.readUInt32LE(28);
  let off = 12;                                   // walk RIFF chunks to find "data"
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4), size = b.readUInt32LE(off + 4);
    if (id === 'data') return Math.min(size, b.length - off - 8) / byteRate;
    off += 8 + size + (size % 2);
  }
  return (b.length - 44) / byteRate;
}

export function proportionalWords(text: string, total: number): Word[] {
  const ws = text.split(/\s+/).filter(Boolean);
  const weights = ws.map((w) => Math.max(2, w.length));
  const sum = weights.reduce((a, b) => a + b, 0);
  const span = Math.max(0.1, total - 0.2);
  let t = 0.08;
  return ws.map((w, i) => { const d = (weights[i] / sum) * span; const r = { text: w, start: +t.toFixed(3), end: +(t + d).toFixed(3) }; t += d; return r; });
}

export const voice: AgentDefinition = {
  id: 'voice', name: 'Voice Agent', department: 'Content Creation', timeoutSec: 900,
  async run(ctx) {
    const { p, profile } = await projectWithBrand(ctx);
    const s = await readJson<Script>(paths.content(p.slug, 'script', 'script.json'));
    const v = voiceFor(profile, p.language);
    const dir = paths.content(p.slug, 'audio');
    await mkdir(dir, { recursive: true });
    const lines = s.scenes.map((sc) => sc.text);
    const files: string[] = [];

    if (isKokoro(v.voice)) {
      const linesFile = path.join(dir, 'lines.json');
      await writeFile(linesFile, JSON.stringify(lines));
      const tmp = path.join(dir, '_kokoro');
      await run('node', [path.join('..', 'tts', 'kokoro.mjs'), v.voice, String(rateToSpeed(v.rate)), tmp, linesFile],
        { cwd: paths.renderer(), signal: ctx.signal });
      for (let i = 0; i < lines.length; i++) {
        const out = path.join(dir, `scene_${i + 1}.wav`);
        await writeFile(out, await readFile(path.join(tmp, `line_${i + 1}.wav`)));
        files.push(path.basename(out));
      }
      await rm(tmp, { recursive: true, force: true });
    } else {
      for (const [i, text] of lines.entries()) {
        const base = path.join(dir, `scene_${i + 1}`);
        let ok = false;
        for (let attempt = 1; attempt <= 6 && !ok; attempt++) {
          try {
            // --text (not -f): the service intermittently returns no audio for file input.
            await run(paths.venvBin('edge-tts'), ['--voice', v.voice, `--rate=${v.rate}`, '--text', text,
              '--write-media', `${base}.mp3`, '--write-subtitles', `${base}.srt`], { signal: ctx.signal });
            ok = (await stat(`${base}.mp3`)).size > 1000;
          } catch (e) { if (ctx.signal.aborted) throw e; }
          if (!ok) await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
        if (!ok) throw new Error(`edge-tts failed for scene ${i + 1} after 6 attempts`);
        files.push(`scene_${i + 1}.mp3`);
      }
    }

    // Word timings for captions.
    let aligned = 0;
    for (const [i, text] of lines.entries()) {
      const audio = path.join(dir, files[i]);
      let words: Word[];
      if (p.language === 'en' && audio.endsWith('.wav')) {
        const out = await run('node', [path.join('..', 'tts', 'words.mjs'), audio, text], { cwd: paths.renderer(), signal: ctx.signal });
        words = JSON.parse(out) as Word[];
        aligned++;
      } else {
        words = proportionalWords(text, await audioSeconds(audio));
      }
      await writeJson(path.join(dir, `words_${i + 1}.json`), words);
      await ctx.log(`voice line ${i + 1}/${lines.length} done`);
    }
    return { output: { voice: v.voice, rate: v.rate, engine: isKokoro(v.voice) ? 'kokoro' : 'edge-tts', language: p.language, files, wordTimings: aligned ? 'whisper' : 'proportional' } };
  },
};
