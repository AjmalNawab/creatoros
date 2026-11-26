/**
 * Human-facing video titles. ContentProject.title is the owner's raw instruction (it feeds prompts as the
 * topic, so it must not change); the dashboard shows this display title instead:
 * approved YouTube title → Facebook title → first script title option → the instruction without its
 * "format, length, language:" prefix.
 */
import type { PrismaClient } from '@creatoros/db';

const FORMAT_WORDS = /\b(reel|short|video|documentary|explainer|tiktok|youtube|facebook|instagram|seconds?|minutes?|vertical|urdu|english|9:16|series)\b/i;

/** "Facebook Reel, about 60 seconds, Urdu: K2 in Pakistan, …" → "K2 in Pakistan, …" */
export function cleanInstruction(text: string): string {
  let t = text.trim();
  const colon = t.indexOf(':');
  if (colon > 0 && colon < 90 && FORMAT_WORDS.test(t.slice(0, colon))) t = t.slice(colon + 1).trim();
  t = t.replace(/\s*(Platforms?|Use real licensed footage)[:.].*$/i, '').trim();
  const firstSentence = t.split(/(?<=[.?!])\s/)[0];
  if (firstSentence.length >= 20) t = firstSentence;
  if (t.length > 90) t = `${t.slice(0, 87).replace(/[\s,;:.-]+\S*$/, '')}…`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

type Row = { id: string; title: string; yt: string | null; fb: string | null; script: string | null };

/** One query for many projects. */
export async function displayTitles(db: PrismaClient, ids: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!ids.length) return out;
  const rows = await db.$queryRaw<Row[]>`
    SELECT p.id, p.title,
      (SELECT t.output->>'title' FROM "Task" t WHERE t."contentProjectId" = p.id AND t.type = 'youtube_package' AND t.output ? 'title' ORDER BY t."createdAt" DESC LIMIT 1) AS yt,
      (SELECT t.output->>'title' FROM "Task" t WHERE t."contentProjectId" = p.id AND t.type = 'facebook_package' AND t.output ? 'title' ORDER BY t."createdAt" DESC LIMIT 1) AS fb,
      (SELECT t.output->'titleOptions'->>0 FROM "Task" t WHERE t."contentProjectId" = p.id AND t.type = 'script' AND t.output ? 'titleOptions' ORDER BY t."createdAt" DESC LIMIT 1) AS script
    FROM "ContentProject" p WHERE p.id = ANY(${ids})`;
  for (const r of rows) out.set(r.id, (r.yt || r.fb || r.script || cleanInstruction(r.title)).trim());
  return out;
}

export async function displayTitle(db: PrismaClient, id: string) {
  return (await displayTitles(db, [id])).get(id) ?? '';
}
