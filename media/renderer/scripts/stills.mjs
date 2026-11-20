// Usage: node scripts/stills.mjs <props.json> <outDir> <frame> [frame...]
// Bundles once, renders several preview stills (JPEG, half size).
import path from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [propsFile, outDir, ...frames] = process.argv.slice(2);
const inputProps = JSON.parse(readFileSync(propsFile, 'utf8'));
const browserExecutable = process.env.REMOTION_BROWSER ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: process.env.COMPOSITION ?? 'Video', inputProps, browserExecutable });
for (const [i, f] of frames.entries()) {
  const output = path.join(outDir, `scene_${i + 1}.jpg`);
  await renderStill({ serveUrl, composition, inputProps, frame: Number(f), output, imageFormat: 'jpeg', scale: 0.5, browserExecutable });
  console.log(output);
}
