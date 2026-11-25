import { mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, type AgentDefinition } from '@creatoros/core';
import { brandBlock, footageCredits, projectWithBrand, readJson, withFeedback, writeJson } from '../../production/shared';
import { sha256File } from '../youtube/package';

/**
 * The owner's TikTok account (separate, anonymous: email sign-up, no phone, "suggest account" off).
 * Set TIKTOK_HANDLE in .env once the account exists (e.g. @chaiandcuriosity).
 */
export const TIKTOK_ACCOUNT = {
  name: 'Chai & Curiosity',
  handle: process.env.TIKTOK_HANDLE ?? '',
  url: process.env.TIKTOK_HANDLE ? `https://www.tiktok.com/${process.env.TIKTOK_HANDLE}` : '',
};

const MetaSchema = z.object({
  caption: z.string().min(20).max(1500),
  hashtags: z.array(z.string().regex(/^#\S+$/)).min(3).max(6),
  coverText: z.string().min(2).max(40),
});

/**
 * TikTok Package agent: prepares the exact post (vertical video, caption, hashtags, AI-content label).
 * TikTok only takes vertical videos here; the owner approves the package, and the publish agent posts only that exact package.
 */
export const tiktokPackage: AgentDefinition = {
  id: 'tiktok.package', name: 'TikTok Agent: package', department: 'Platforms / TikTok', timeoutSec: 300, requiresApprovalAfter: true,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    if (!TIKTOK_ACCOUNT.handle) throw new Error('BLOCKED: TIKTOK_HANDLE is not set in .env (create the TikTok account first)');
    const ur = p.language === 'ur';
    const sb = await readJson<{ lines?: unknown[]; width?: number; height?: number }>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    const vertical = !!sb.lines || (sb.height ?? 0) > (sb.width ?? 0);
    if (!vertical) throw new Error('BLOCKED: TikTok needs a vertical (9:16) video; this project is horizontal');
    const script = await readJson<{ titleOptions: string[]; scenes: { text: string }[] }>(paths.content(p.slug, 'script', 'script.json'));
    const research = await readJson<{ sources: { name: string }[] }>(paths.content(p.slug, 'research', 'research.json'));

    const meta = await askAi(getDb(), ctx, {
      kind: 'tiktok_metadata', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the TikTok Agent of CreatorOS. Write the TikTok post for this original ${ur ? 'Urdu' : 'English'} vertical video on the account "${TIKTOK_ACCOUNT.name}" (${TIKTOK_ACCOUNT.handle}): science, myths vs facts and world records, for a Pakistani audience.

${brandBlock(brand.name, profile)}

Topic: ${p.title}
Approved title ideas: ${JSON.stringify(script.titleOptions)}
Narration: ${JSON.stringify(script.scenes.map((s) => s.text))}

TikTok is a fast feed: people decide in one second, and comments push a video to more people.
Rules:
- caption: ${ur ? 'Urdu' : 'English'}, 1-3 short lines. Line 1 is a punchy hook or question (works without the video). End with a genuine question that invites a comment (no "like/follow/share" begging, no engagement bait). No links. Honest: nothing the video doesn't show.
- hashtags: 3-6 relevant ones (mix Urdu/Roman Urdu/English where natural, e.g. #سائنس #pakistan #facts). No #fyp spam.
- coverText: 2-6 words for the cover/first frame, same language.

Answer with ONLY a JSON object:
{"caption": string, "hashtags": [string], "coverText": string}`, ctx),
      validate: (raw) => {
        const m = MetaSchema.parse(parseJson(raw));
        if (/https?:\/\//i.test(m.caption)) throw new Error('No links in the caption.');
        if (/#fyp|#foryou|#viral/i.test(m.hashtags.join(' '))) throw new Error('No #fyp/#viral spam hashtags.');
        return m;
      },
    });

    const footage = await footageCredits(p.slug);
    const caption = [meta.caption.trim(), '', `📚 ${research.sources.slice(0, 3).map((s) => s.name).join(' · ')}`,
      `🎙️ AI voice${footage.used ? ` · ${footage.line.replace('🎞️ ', '')}` : ' · original animation'}`, '', meta.hashtags.join(' ')].join('\n').slice(0, 2200);

    const dir = paths.content(p.slug, 'platforms', 'tiktok');
    await mkdir(dir, { recursive: true });
    const videoRel = `output/${p.slug}.mp4`;
    const pkg = {
      platform: 'tiktok',
      account: TIKTOK_ACCOUNT,
      video: videoRel,
      videoSha256: await sha256File(paths.content(p.slug, videoRel)),
      caption,
      coverText: meta.coverText,
      visibility: 'Everyone',
      allowComments: true,
      aiGeneratedLabel: true, // TikTok's "AI-generated content" switch: the narration is an AI voice.
      language: ur ? 'Urdu' : 'English',
      series: brand.name,
      route: 'browser',
    };
    await writeJson(paths.content(p.slug, 'platforms', 'tiktok', 'package.json'), pkg);
    await writeFile(paths.content(p.slug, 'platforms', 'tiktok', 'caption.txt'), caption);
    return { output: pkg };
  },
};
