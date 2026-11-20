import { readFile, writeFile } from 'node:fs/promises';
import { getDb } from '@creatoros/db';
import { type AgentContext } from '@creatoros/core';
import { brandForProject, profileOf, type BrandProfile } from '../strategy/brand';

/**
 * Shared helpers for the production agents (the $0 pipeline proven by hand in content/001-volcanoes).
 * All files live in content/<slug>/; the renderer gets per-video scenes in media/renderer/src/videos/<key>.tsx.
 */

export const FPS = 30;
export const TAIL_SEC = 0.6;          // pause after each scene's narration
export const MP3_KBPS = 48;           // edge-tts output: 24kHz mono 48kbps CBR

export async function project(ctx: AgentContext) {
  if (!ctx.contentProjectId) throw new Error('task has no content project');
  return getDb().contentProject.findUniqueOrThrow({ where: { id: ctx.contentProjectId } });
}
export const readJson = async <T>(file: string) => JSON.parse(await readFile(file, 'utf8')) as T;
export const writeJson = (file: string, v: unknown) => writeFile(file, JSON.stringify(v, null, 1), 'utf8');
export const feedbackOf = (ctx: AgentContext) => (ctx.input as { feedback?: string } | null)?.feedback;
export const withFeedback = (prompt: string, ctx: AgentContext) =>
  feedbackOf(ctx) ? `${prompt}\n\n---\nOWNER FEEDBACK ON THE PREVIOUS VERSION (must be addressed):\n${feedbackOf(ctx)}` : prompt;

/** Project + its brand profile (language, voice, pace, rules, visual style). */
export async function projectWithBrand(ctx: AgentContext) {
  const p = await project(ctx);
  const brand = await brandForProject(getDb(), p);
  return { p, brand, profile: profileOf(brand) };
}

export const LANG_NAME: Record<BrandProfile['language'], string> = {
  en: 'English (clear, natural spoken documentary English)',
  ur: 'Urdu (natural spoken Pakistani Urdu, Urdu script)',
};

/** Brand block injected into every content prompt. */
export const brandBlock = (name: string, b: BrandProfile) => `Brand: ${name}
Niche: ${b.niche}
Audience: ${b.audience}
Tone: ${b.tone}
Editorial rules (mandatory):
${b.rules.map((r) => `- ${r}`).join('\n')}
Never: ${b.avoid.join('; ')}`;
