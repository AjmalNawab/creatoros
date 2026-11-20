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
for (const [i, text] of lines.entries()) {
  const audio = await tts.generate(text, { voice, speed: Number(speed) });
  const file = path.join(outDir, `line_${i + 1}.wav`);
  await audio.save(file);
  durations.push({ line: i + 1, file: path.basename(file), seconds: audio.audio.length / audio.sampling_rate });
  console.log(`line ${i + 1}/${lines.length} ${durations.at(-1).seconds.toFixed(2)}s`);
}
writeFileSync(path.join(outDir, 'durations.json'), JSON.stringify(durations, null, 1));
