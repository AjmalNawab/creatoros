import { createHash } from 'node:crypto';
import { getDb } from '@creatoros/db';
import { audit, awaitHumanAction, findValidApproval, paths, type AgentDefinition, type Json } from '@creatoros/core';
import { project } from '../../production/shared';
import { sha256File } from './package';

/**
 * YouTube Publish agent. Enforced server-side, immediately before the external action:
 *  1. the package has a valid APPROVED approval for its exact content (hash);
 *  2. the video file is byte-identical to the approved one;
 *  3. idempotency: the same video is never published twice to YouTube.
 * Route "browser" (default, $0): the upload is a Human/Operator action. Claude Code performs it in the
 * owner's logged-in Chrome via DevTools while the owner watches, then reports the URL. It never
 * bypasses CAPTCHA, 2FA or verification; those steps are done by the owner.
 * Route "api": reserved for the YouTube Data API once the project is verified.
 */
type Pkg = { channel?: { id: string; handle: string; name: string }; video: string; videoSha256: string; thumbnail: string; title: string; description: string; tags: string[]; visibility: string; madeForKids: boolean; category: string; language: string; alteredContent: boolean };

const VIDEO_ID = /(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/|studio\.youtube\.com\/video\/)([A-Za-z0-9_-]{11})/;

export const youtubePublish: AgentDefinition = {
  id: 'youtube.publish', name: 'YouTube Agent: publish', department: 'Platforms / YouTube', timeoutSec: 120, maxAttempts: 2,
  async run(ctx) {
    const db = getDb();
    const p = await project(ctx);
    const pkgTask = await db.task.findFirstOrThrow({ where: { contentProjectId: p.id, agentId: 'youtube.package', status: 'COMPLETED' }, orderBy: { completedAt: 'desc' } });
    const pkg = pkgTask.output as unknown as Pkg;

    const approval = await findValidApproval(db, pkgTask.id, pkg);
    if (!approval) throw new Error('BLOCKED: no valid owner approval for this exact YouTube package');
    if ((await sha256File(paths.content(p.slug, pkg.video))) !== pkg.videoSha256) {
      throw new Error('BLOCKED: video file changed after approval; re-run the YouTube package step and approve again');
    }

    const idempotencyKey = createHash('sha256').update(`${pkg.videoSha256}:youtube`).digest('hex');
    const existing = await db.platformPost.findUnique({ where: { idempotencyKey } });
    if (existing) {
      await ctx.log('already published; not uploading again', { url: existing.url });
      return { output: { alreadyPublished: true, url: existing.url, postId: existing.id } as Json };
    }

    if (!pkg.channel?.id) throw new Error('BLOCKED: package has no target channel');
    const route = process.env.YOUTUBE_ROUTE ?? 'browser';
    if (route !== 'browser') throw new Error(`YouTube route "${route}" is not configured yet`);

    const abs = (rel: string) => paths.content(p.slug, rel);
    const result = await awaitHumanAction<{ url: string; visibility?: string; notes?: string }>(db, ctx, {
      kind: 'youtube_upload',
      title: `Upload to YouTube: ${pkg.title}`,
      payload: { ...pkg, videoPath: abs(pkg.video), thumbnailPath: abs(pkg.thumbnail), approvalId: approval.id, idempotencyKey } as never,
      instructions: [
        'Upload this APPROVED package to the owner\'s YouTube channel using their logged-in Chrome (Chrome DevTools MCP).',
        'Use exactly these values. Do not change anything. Stop and hand over to the owner on any login, CAPTCHA, 2FA or verification prompt.',
        '',
        `0. TARGET CHANNEL: ${pkg.channel.name} (${pkg.channel.handle}, id ${pkg.channel.id}). Open https://studio.youtube.com/channel/${pkg.channel.id} and confirm the Studio URL contains this id. If Studio shows a different channel, STOP (switch account/channel with the owner).`,
        '1. Create → Upload videos.',
        `2. Select file: ${abs(pkg.video)}`,
        `3. Title: copy from payload.title`,
        `4. Description: copy from payload.description (also in ${abs('platforms/youtube/description.txt')})`,
        `5. Thumbnail: ${abs(pkg.thumbnail)} (needs a phone-verified channel; if unavailable, skip and note it)`,
        `6. Audience: "No, it's not made for kids". Show more → Altered content: No. Tags: payload.tags. Category: ${pkg.category}. Video language: ${pkg.language}.`,
        `7. Visibility: ${pkg.visibility}. Save/Publish.`,
        '8. Copy the video link and complete this action with {"url": "<link>", "visibility": "<visibility>", "notes": "..."}.',
      ].join('\n'),
    });

    const videoId = result.url?.match(VIDEO_ID)?.[1];
    if (!videoId) throw new Error(`Upload result has no valid YouTube video URL: ${result.url}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Verify the video exists (oEmbed answers for public and unlisted videos; private ones are not verifiable this way).
    let verified = false; let verifyNote = '';
    try {
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, { signal: ctx.signal });
      verified = r.ok; verifyNote = `oembed ${r.status}`;
    } catch (e) { verifyNote = `oembed error: ${(e as Error).message}`; }

    const post = await db.platformPost.create({ data: {
      contentProjectId: p.id, platform: 'youtube', route, idempotencyKey, approvalId: approval.id, externalId: videoId, url,
      visibility: result.visibility ?? pkg.visibility, status: verified ? 'published' : 'unverified',
      metadata: { title: pkg.title, tags: pkg.tags, visibility: pkg.visibility } as never,
      evidence: { verified, verifyNote, operatorNotes: result.notes ?? null } as never } });
    await db.contentProject.update({ where: { id: p.id }, data: { status: 'published' } });
    await audit(db, `agent:${ctx.agentId}`, 'platform.published', { entity: 'platform_post', entityId: post.id, data: { platform: 'youtube', url, verified } });
    return { output: { url, videoId, verified, verifyNote, postId: post.id } as Json };
  },
};
