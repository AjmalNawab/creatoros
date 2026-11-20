import { mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, type AgentDefinition } from '@creatoros/core';
import { brandBlock, projectWithBrand, readJson, withFeedback, writeJson } from '../../production/shared';
import { sha256File } from '../youtube/package';

/**
 * The owner's Facebook Page. One Page hosts every series (English and Urdu; documentaries, explainers,
 * lighter content), so the target is platform-wide rather than per brand.
 */
export const FACEBOOK_PAGE = {
  name: 'Chai & Curiosity',
  profileId: '61596576848668',
  pageId: '1391534190718152',
  url: 'https://www.facebook.com/profile.php?id=61596576848668',
};

const MetaSchema = z.object({
  title: z.string().min(5).max(100),
  caption: z.string().min(40).max(1500),
  hashtags: z.array(z.string().regex(/^#\S+$/)).min(2).max(5),
});

/**
 * Facebook Package agent: prepares the exact post (video, title, caption, hashtags, Reel or video post).
 * Its output is what the owner approves; the publish agent may only post a package whose hash matches.
 */
export const facebookPackage: AgentDefinition = {
  id: 'facebook.package', name: 'Facebook Agent: package', department: 'Platforms / Facebook', timeoutSec: 300, requiresApprovalAfter: true,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    const ur = p.language === 'ur';
    const sb = await readJson<{ lines?: unknown[] }>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    const short = !!sb.lines;
    const script = await readJson<{ titleOptions: string[]; scenes: { text: string }[] }>(paths.content(p.slug, 'script', 'script.json'));
    const research = await readJson<{ sources: { name: string }[] }>(paths.content(p.slug, 'research', 'research.json'));

    const meta = await askAi(getDb(), ctx, {
      kind: 'facebook_metadata', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the Facebook Agent of CreatorOS. Write the Facebook ${short ? 'Reel' : 'video post'} for this original ${ur ? 'Urdu' : 'English'} animated video, posted on the Page "${FACEBOOK_PAGE.name}" (a mixed Page: stories, science and lighter moments in English and Urdu, "best enjoyed with a cup of chai").

${brandBlock(brand.name, profile)}

Topic: ${p.title}
Approved title ideas: ${JSON.stringify(script.titleOptions)}
Narration: ${JSON.stringify(script.scenes.map((s) => s.text))}

Facebook is not YouTube: people scroll a feed, mostly with sound off, and share what makes them feel something.
Rules:
- title: ≤ 100 chars${ur ? ' (Urdu)' : ''}; used as the video title. Honest, must match what the video shows.
- caption: ${ur ? 'Urdu' : 'English'}, 2-4 short lines. Line 1 is a hook that works without the video (a surprising fact or question). Then one line of context. End with a light, genuine question that invites comments (no "like and share" begging, no engagement bait). Conversational, a little warm. No links. Max 1500 chars.
- hashtags: 2-5 relevant hashtags${short ? ' (include #reels)' : ''}.

Answer with ONLY a JSON object:
{"title": string, "caption": string, "hashtags": [string]}`, ctx),
      validate: (raw) => {
        const m = MetaSchema.parse(parseJson(raw));
        if (/https?:\/\//i.test(m.caption)) throw new Error('No links in the caption.');
        return m;
      },
    });

    const caption = [meta.caption.trim(), '', `📚 Sources: ${research.sources.map((s) => s.name).join(' · ')}`,
      '🎙️ AI narration · original animation', '', meta.hashtags.join(' ')].join('\n');

    const dir = paths.content(p.slug, 'platforms', 'facebook');
    await mkdir(dir, { recursive: true });
    const videoRel = `output/${p.slug}.mp4`;
    const pkg = {
      platform: 'facebook',
      page: FACEBOOK_PAGE,
      video: videoRel,
      videoSha256: await sha256File(paths.content(p.slug, videoRel)),
      format: short ? 'short' : 'long',
      postAs: short ? 'reel' : 'video',
      title: meta.title,
      caption,
      audience: 'Public',
      series: brand.name,
      language: ur ? 'Urdu' : 'English',
      aiDisclosure: 'AI narration, original animation (stylised; no realistic people or events depicted)',
      route: 'browser',
    };
    await writeJson(paths.content(p.slug, 'platforms', 'facebook', 'package.json'), pkg);
    await writeFile(paths.content(p.slug, 'platforms', 'facebook', 'caption.txt'), caption);
    return { output: pkg };
  },
};
