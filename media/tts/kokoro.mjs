// Local English TTS with Kokoro-82M (Apache-2.0). Usage:
//   node kokoro.mjs <voice> <speed> <outDir> <lines.json>
// lines.json: ["line one", "line two", ...] → outDir/line_<n>.wav (24 kHz mono) + durations.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { KokoroTTS } from 'kokoro-js';

const [voice = 'am_michael', speed = '1', outDir = 'out', linesFile] = process.argv.slice(2);
const lines = JSON.parse(readFileSync(linesFile, 'utf8'));
mkdirSync(outDir, { recursive: true });
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
const durations = [];
/**
 * Kokoro reads at most ~510 tokens (~25-30 s of speech) per call and silently drops the rest, so long
 * documentary scenes are voiced sentence by sentence (grouped up to ~220 chars) and joined with short pauses.
 */
function chunks(text, max = 220) {
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
  const out = [];
  for (const s of sentences.map((x) => x.trim()).filter(Boolean)) {
    if (out.length && (out.at(-1) + ' ' + s).length <= max) out[out.length - 1] += ' ' + s;
    else out.push(s);
  }
  return out;
}
async function speak(text) {
  const parts = chunks(text);
  if (parts.length === 1) return tts.generate(text, { voice, speed: Number(speed) });
  const audios = [];
  for (const part of parts) audios.push(await tts.generate(part, { voice, speed: Number(speed) }));
  const sr = audios[0].sampling_rate, gap = Math.round(sr * 0.12);
  const total = audios.reduce((n, a) => n + a.audio.length, 0) + gap * (audios.length - 1);
  const joined = new Float32Array(total);
  let o = 0;
  for (const [k, a] of audios.entries()) { joined.set(a.audio, o); o += a.audio.length + (k < audios.length - 1 ? gap : 0); }
  return new audios[0].constructor(joined, sr);
}

for (const [i, text] of lines.entries()) {
  const audio = await speak(text);
  const file = path.join(outDir, `line_${i + 1}.wav`);
  await audio.save(file);
  durations.push({ line: i + 1, file: path.basename(file), seconds: audio.audio.length / audio.sampling_rate });
  console.log(`line ${i + 1}/${lines.length} ${durations.at(-1).seconds.toFixed(2)}s`);
}
writeFileSync(path.join(outDir, 'durations.json'), JSON.stringify(durations, null, 1));
