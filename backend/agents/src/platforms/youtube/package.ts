import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, parseJson, paths, run, type AgentDefinition } from '@creatoros/core';
import { FPS, brandBlock, projectWithBrand, readJson, withFeedback, writeJson } from '../../production/shared';

/**
 * YouTube Package agent: prepares the exact upload package (video, title, description with chapters,
 * tags, thumbnail, settings). Its output is what the owner approves; the publish agent may only
 * upload a package whose hash matches an approval.
 */
export const LIMITS = { title: 100, description: 5000, tagsTotal: 500 };
export const DEFAULT_VISIBILITY = (process.env.YOUTUBE_DEFAULT_VISIBILITY ?? 'unlisted') as 'public' | 'unlisted' | 'private';

const MetaSchema = z.object({
  title: z.string().min(10).max(LIMITS.title),
  description: z.string().min(50).max(3500),
  chapterTitles: z.array(z.string().min(2).max(60)),
  tags: z.array(z.string().min(2).max(40)).min(5).max(25),
  hashtags: z.array(z.string().regex(/^#\S+$/)).max(3),
  thumbnailText: z.string().min(2).max(30),
});

export const sha256File = (file: string) => new Promise<string>((resolve, reject) => {
  const h = createHash('sha256');
  createReadStream(file).on('data', (d) => h.update(d)).on('end', () => resolve(h.digest('hex'))).on('error', reject);
});

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

export const youtubePackage: AgentDefinition = {
  id: 'youtube.package', name: 'YouTube Agent: package', department: 'Platforms / YouTube', timeoutSec: 300, requiresApprovalAfter: true,
  async run(ctx) {
    const { p, brand, profile } = await projectWithBrand(ctx);
    const channel = profile.channels.youtube;
    if (!channel) throw new Error(`BLOCKED: brand "${brand.name}" has no YouTube channel configured (Brand page → channels)`);
    const ur = p.language === 'ur';
    type SB = { scenes: { title: string; startFrame: number }[] };
    const sb = await readJson<SB>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    const script = await readJson<{ titleOptions: string[]; scenes: { text: string }[] }>(paths.content(p.slug, 'script', 'script.json'));
    const research = await readJson<{ sources: { name: string; url: string }[] }>(paths.content(p.slug, 'research', 'research.json'));

    const meta = await askAi(getDb(), ctx, {
      kind: 'youtube_metadata', format: 'json', promptDir: paths.content(p.slug, 'ai'),
      prompt: withFeedback(`You are the YouTube Agent of CreatorOS. Write YouTube metadata for this original ${ur ? 'Urdu' : 'English'} animated video on the channel "${channel.name}".

${brandBlock(brand.name, profile)}

Topic: ${p.title}
Approved title ideas: ${JSON.stringify(script.titleOptions)}
Scenes (for chapters): ${JSON.stringify(sb.scenes.map((s, i) => ({ scene: i + 1, title: s.title, narration: script.scenes[i]?.text })))}

Rules:
- title ≤ ${LIMITS.title} chars${ur ? ': Urdu first, then " | " and a short English version' : ''}. Curiosity + the key subject; honest (must match what the video shows), no ALL CAPS, no "<" or ">".
- description: 2-4 short ${ur ? 'Urdu' : 'English'} paragraphs; the first 150 characters say what the viewer will learn. No links, no "<" or ">" (chapters, sources and disclosure are added automatically).
- chapterTitles: exactly ${sb.scenes.length} short ${ur ? 'Urdu' : 'English'} chapter names, one per scene, in order.
- tags: 8-15 real search phrases${ur ? ' (Urdu, Roman Urdu and English)' : ''}, total under ${LIMITS.tagsTotal} chars.
- hashtags: up to 3 relevant hashtags.
- thumbnailText: 2-4 bold ${ur ? 'Urdu' : 'English'} words for the thumbnail (complements the title, readable at small size).

Answer with ONLY a JSON object:
{"title": string, "description": string, "chapterTitles": [string], "tags": [string], "hashtags": [string], "thumbnailText": string}`, ctx),
      validate: (raw) => {
        const m = MetaSchema.parse(parseJson(raw));
        if (/[<>]/.test(m.title + m.description)) throw new Error('YouTube does not allow "<" or ">" in title/description.');
        if (m.chapterTitles.length !== sb.scenes.length) throw new Error(`chapterTitles must have exactly ${sb.scenes.length} entries.`);
        if (m.tags.join(',').length > LIMITS.tagsTotal) throw new Error(`tags exceed ${LIMITS.tagsTotal} characters in total.`);
        return m;
      },
    });

    // Chapters need: first at 0:00, at least 3, each ≥ 10s apart (YouTube rules).
    const chapters = sb.scenes.map((s, i) => ({ at: s.startFrame / FPS, title: meta.chapterTitles[i] }))
      .filter((c, i, arr) => i === 0 || c.at - arr[i - 1].at >= 10);
    const description = [
      meta.description.trim(), '',
      ...(chapters.length >= 3 ? [ur ? '⏱️ ابواب' : '⏱️ Chapters', ...chapters.map((c) => `${mmss(c.at)} ${c.title}`), ''] : []),
      `📚 Sources: ${research.sources.map((s) => s.name).join(' · ')}`,
      '🎙️ Narration: AI voice. Animation: original.', '',
      meta.hashtags.join(' '),
    ].join('\n').slice(0, LIMITS.description);

    // Thumbnail 1280x720 from scene 1 + title text.
    const dir = paths.content(p.slug, 'platforms', 'youtube');
    await mkdir(dir, { recursive: true });
    const thumbProps = paths.content(p.slug, 'platforms', 'youtube', 'thumbnail.props.json');
    const data = await readJson<{ scenes: { durationFrames: number }[] }>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
    await writeJson(thumbProps, { data, sceneIndex: 0, text: meta.thumbnailText });
    const frame = Math.floor(data.scenes[0].durationFrames * 0.85);
    await run('npx', ['remotion', 'still', 'src/index.ts', 'Thumbnail', paths.content(p.slug, 'platforms', 'youtube', 'thumbnail.jpg'),
      `--props=${thumbProps}`, `--frame=${frame}`, '--image-format=jpeg', '--jpeg-quality=90'], { cwd: paths.renderer(), signal: ctx.signal });

    const videoRel = `output/${p.slug}.mp4`;
    const pkg = {
      platform: 'youtube',
      video: videoRel,
      videoSha256: await sha256File(paths.content(p.slug, videoRel)),
      thumbnail: 'platforms/youtube/thumbnail.jpg',
      title: meta.title,
      description,
      tags: meta.tags,
      visibility: DEFAULT_VISIBILITY,
      madeForKids: false,
      category: profile.youtubeCategory,
      language: ur ? 'Urdu' : 'English',
      channel,
      alteredContent: false, // stylised animation, nothing realistic → no "altered or synthetic" disclosure needed
      route: 'browser',
    };
    await writeJson(paths.content(p.slug, 'platforms', 'youtube', 'package.json'), pkg);
    await writeFile(paths.content(p.slug, 'platforms', 'youtube', 'description.txt'), description);
    return { output: pkg };
  },
};
