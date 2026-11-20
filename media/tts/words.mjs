// Word-level timings for captions.
// Usage: node words.mjs <audio.wav> <scriptText>   → prints [{text,start,end}] (seconds) as JSON
// whisper.cpp gives token timings; we map them onto the EXACT script words (never whisper's spelling),
// so captions always match the approved script. Falls back to proportional timing if alignment fails.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const WHISPER = path.join(here, '..', 'whisper.cpp', 'build', 'bin', 'whisper-cli');
const MODEL = path.join(here, '..', 'whisper.cpp', 'models', 'ggml-base.en.bin');

const [audio, ...rest] = process.argv.slice(2);
const script = rest.join(' ');
const scriptWords = script.split(/\s+/).filter(Boolean);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function durationOf(file) {
  const buf = readFileSync(file);           // 16-bit PCM WAV: data bytes / (rate*channels*2)
  const rate = buf.readUInt32LE(24), ch = buf.readUInt16LE(22), bits = buf.readUInt16LE(34);
  return (buf.length - 44) / (rate * ch * (bits / 8));
}

function proportional(total) {
  const weights = scriptWords.map((w) => Math.max(2, w.length));
  const sum = weights.reduce((a, b) => a + b, 0);
  let t = 0.05;
  const span = Math.max(0.1, total - 0.15);
  return scriptWords.map((w, i) => { const d = (weights[i] / sum) * span; const r = { text: w, start: +t.toFixed(3), end: +(t + d).toFixed(3) }; t += d; return r; });
}

let words;
try {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'whisper-'));
  const out = path.join(dir, 'out');
  execFileSync(WHISPER, ['-m', MODEL, '-f', audio, '-ojf', '-of', out, '-np', '-l', 'en', '-t', '4'], { stdio: 'pipe' });
  const json = JSON.parse(readFileSync(`${out}.json`, 'utf8'));
  rmSync(dir, { recursive: true, force: true });
  // Merge sub-word tokens into words (a new word starts with a space).
  const heard = [];
  for (const seg of json.transcription ?? []) {
    for (const tok of seg.tokens ?? []) {
      if (/^\[_|^\[/.test(tok.text)) continue;                    // special tokens
      const from = tok.offsets.from / 1000, to = tok.offsets.to / 1000;
      if (tok.text.startsWith(' ') || !heard.length) heard.push({ text: tok.text.trim(), start: from, end: to });
      else { heard.at(-1).text += tok.text; heard.at(-1).end = to; }
    }
  }
  const hw = heard.filter((h) => norm(h.text));
  // Greedy alignment: walk script words, match the next heard word with the same normalised text within a window.
  words = [];
  let j = 0;
  for (const w of scriptWords) {
    let k = -1;
    for (let x = j; x < Math.min(hw.length, j + 4); x++) if (norm(hw[x].text) === norm(w)) { k = x; break; }
    if (k >= 0) { words.push({ text: w, start: hw[k].start, end: hw[k].end }); j = k + 1; }
    else words.push({ text: w, start: NaN, end: NaN });
  }
  const matched = words.filter((w) => !Number.isNaN(w.start)).length;
  if (matched < scriptWords.length * 0.6) throw new Error(`weak alignment ${matched}/${scriptWords.length}`);
  // Fill unmatched words by interpolating between neighbours.
  const total = durationOf(audio);
  for (let i = 0; i < words.length; i++) {
    if (!Number.isNaN(words[i].start)) continue;
    let a = i - 1; while (a >= 0 && Number.isNaN(words[a].start)) a--;
    let b = i + 1; while (b < words.length && Number.isNaN(words[b].start)) b++;
    const t0 = a >= 0 ? words[a].end : 0.05, t1 = b < words.length ? words[b].start : total - 0.1;
    const n = b - a - 1, step = (t1 - t0) / n;
    for (let m = 0; m < n; m++) words[a + 1 + m] = { text: words[a + 1 + m].text, start: t0 + m * step, end: t0 + (m + 1) * step };
    i = b - 1;
  }
  words = words.map((w) => ({ text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
  process.stderr.write(`aligned ${matched}/${scriptWords.length} words\n`);
} catch (e) {
  process.stderr.write(`whisper alignment failed (${e.message}); using proportional timing\n`);
  words = proportional(durationOf(audio));
}
process.stdout.write(JSON.stringify(words));
