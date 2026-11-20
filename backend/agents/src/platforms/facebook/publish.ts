import { createHash } from 'node:crypto';
import { getDb } from '@creatoros/db';
import { audit, awaitHumanAction, findValidApproval, paths, type AgentDefinition, type Json } from '@creatoros/core';
import { project } from '../../production/shared';
import { sha256File } from '../youtube/package';
import type { FACEBOOK_PAGE } from './package';

/**
 * Facebook Publish agent. Same server-side gate as YouTube, right before the external action:
 *  1. a valid APPROVED approval for this exact package (hash);
 *  2. the video file is byte-identical to the approved one;
 *  3. idempotency: the same video is never posted twice to Facebook.
 * Route "browser": Claude Code posts it in the owner's logged-in Chrome (DevTools) while the owner watches.
 */
type Pkg = { page: typeof FACEBOOK_PAGE; video: string; videoSha256: string; format: string; postAs: 'reel' | 'video'; title: string; caption: string; audience: string; language: string; series: string };

/** Accepts Reel, video, watch and share links; returns a stable id-ish key. */
export const FB_POST = /^https:\/\/(?:www\.|m\.|web\.)?facebook\.com\/(?:reel\/(\d+)|[^/?#]+\/videos\/(?:[^/?#]+\/)?(\d+)|watch\/?\?v=(\d+)|share\/[rv]\/([A-Za-z0-9]+))/;

export const facebookPublish: AgentDefinition = {
  id: 'facebook.publish', name: 'Facebook Agent: publish', department: 'Platforms / Facebook', timeoutSec: 120, maxAttempts: 2,
  async run(ctx) {
    const db = getDb();
    const p = await project(ctx);
    const pkgTask = await db.task.findFirstOrThrow({ where: { contentProjectId: p.id, agentId: 'facebook.package', status: 'COMPLETED' }, orderBy: { completedAt: 'desc' } });
    const pkg = pkgTask.output as unknown as Pkg;

    const approval = await findValidApproval(db, pkgTask.id, pkg);
    if (!approval) throw new Error('BLOCKED: no valid owner approval for this exact Facebook package');
    if ((await sha256File(paths.content(p.slug, pkg.video))) !== pkg.videoSha256) {
      throw new Error('BLOCKED: video file changed after approval; re-run the Facebook package step and approve again');
    }

    const idempotencyKey = createHash('sha256').update(`${pkg.videoSha256}:facebook`).digest('hex');
    const existing = await db.platformPost.findUnique({ where: { idempotencyKey } });
    if (existing) {
      await ctx.log('already posted; not posting again', { url: existing.url });
      return { output: { alreadyPublished: true, url: existing.url, postId: existing.id } as Json };
    }

    const route = process.env.FACEBOOK_ROUTE ?? 'browser';
    if (route !== 'browser') throw new Error(`Facebook route "${route}" is not configured yet`);
    const videoPath = paths.content(p.slug, pkg.video);
    const result = await awaitHumanAction<{ url: string; notes?: string }>(db, ctx, {
      kind: 'facebook_upload',
      title: `Post to Facebook (${pkg.postAs}): ${pkg.title}`,
      payload: { ...pkg, videoPath, approvalId: approval.id, idempotencyKey } as never,
      instructions: [
        `Post this APPROVED package as a ${pkg.postAs === 'reel' ? 'Reel' : 'video'} on the Facebook Page "${pkg.page.name}" in the owner's logged-in Chrome (Chrome DevTools MCP).`,
        'Use exactly these values. Stop and hand over to the owner on any login, CAPTCHA, 2FA or verification prompt.',
        '',
        `0. TARGET PAGE: open ${pkg.page.url} and make sure you are acting AS the Page "${pkg.page.name}" (switch profile if needed), never as the owner's personal profile.`,
        `1. ${pkg.postAs === 'reel' ? 'Create → Reel' : 'Create post → Photo/video'}; select file: ${videoPath}`,
        '2. Caption/description: payload.caption exactly. Title (if asked): payload.title.',
        `3. Audience: ${pkg.audience}. If Meta asks about AI-generated content: the narration is AI; animation is stylised, not realistic (answer honestly).`,
        '4. Share/Publish. Then open the post and copy its link (facebook.com/reel/<id> or …/videos/<id>).',
        '5. Complete this action with {"url": "<link>", "notes": "..."}.',
      ].join('\n'),
    });

    const m = String(result.url ?? '').match(FB_POST);
    if (!m) {
      await db.humanActionRequest.updateMany({ where: { taskId: ctx.taskId, kind: 'facebook_upload', status: 'DONE' }, data: { status: 'CANCELLED' } });
      throw new Error(`Upload result has no valid Facebook post URL: ${result.url}`);
    }
    const externalId = m[1] ?? m[2] ?? m[3] ?? m[4];

    // Facebook has no keyless oEmbed: verification is the operator's evidence until the Graph API route exists.
    const post = await db.platformPost.create({ data: {
      contentProjectId: p.id, platform: 'facebook', route, idempotencyKey, approvalId: approval.id, externalId, url: result.url,
      visibility: pkg.audience.toLowerCase(), status: 'unverified',
      metadata: { title: pkg.title, postAs: pkg.postAs, page: pkg.page.name } as never,
      evidence: { verified: false, verifyNote: 'operator-reported; Facebook has no keyless verification', operatorNotes: result.notes ?? null } as never } });
    await audit(db, `agent:${ctx.agentId}`, 'platform.published', { entity: 'platform_post', entityId: post.id, data: { platform: 'facebook', url: result.url } });
    return { output: { url: result.url, externalId, postId: post.id } as Json };
  },
};
