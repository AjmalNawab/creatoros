import { readFile, writeFile } from 'node:fs/promises';
import { getDb } from '@creatoros/db';
import { paths, type AgentContext } from '@creatoros/core';

/**
 * Shared helpers for the production agents (the $0 pipeline proven by hand in content/001-volcanoes).
 * All files live in content/<slug>/; the renderer gets per-video scenes in media/renderer/src/videos/<key>.tsx.
 */

export const FPS = 30;
export const TAIL_SEC = 0.6;          // pause after each scene's narration
export const MP3_KBPS = 48;           // edge-tts output: 24kHz mono 48kbps CBR
export const WORDS_PER_MIN = 175;     // measured: Asad voice at +8% ≈ 178 wpm
export const VOICE = 'ur-PK-AsadNeural';

export async function project(ctx: AgentContext) {
  if (!ctx.contentProjectId) throw new Error('task has no content project');
  return getDb().contentProject.findUniqueOrThrow({ where: { id: ctx.contentProjectId } });
}
export const readJson = async <T>(file: string) => JSON.parse(await readFile(file, 'utf8')) as T;
export const writeJson = (file: string, v: unknown) => writeFile(file, JSON.stringify(v, null, 1), 'utf8');
export const feedbackOf = (ctx: AgentContext) => (ctx.input as { feedback?: string } | null)?.feedback;
export const withFeedback = (prompt: string, ctx: AgentContext) =>
  feedbackOf(ctx) ? `${prompt}\n\n---\nOWNER FEEDBACK ON THE PREVIOUS VERSION (must be addressed):\n${feedbackOf(ctx)}` : prompt;
