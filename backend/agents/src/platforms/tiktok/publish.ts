import { createHash } from 'node:crypto';
import { getDb } from '@creatoros/db';
import { audit, awaitHumanAction, findValidApproval, paths, type AgentDefinition, type Json } from '@creatoros/core';
import { project } from '../../production/shared';
import { sha256File } from '../youtube/package';
import type { TIKTOK_ACCOUNT } from './package';

type Pkg = { account: typeof TIKTOK_ACCOUNT; video: string; videoSha256: string; caption: string; coverText: string; visibility: string; allowComments: boolean; aiGeneratedLabel: boolean; language: string };

/** https://www.tiktok.com/@handle/video/1234567890 */
export const TT_POST = /^https:\/\/(?:www\.)?tiktok\.com\/@([\w.]+)\/video\/(\d+)/;

/**
 * TikTok Publish agent. Same gate as YouTube/Facebook right before the external action: valid approval for this
 * exact package, unchanged video file, never post the same video twice. Route "browser" = owner's Chrome.
 */
export const tiktokPublish: AgentDefinition = {
  id: 'tiktok.publish', name: 'TikTok Agent: publish', department: 'Platforms / TikTok', timeoutSec: 120, maxAttempts: 2,
  async run(ctx) {
    const db = getDb();
    const p = await project(ctx);
    const pkgTask = await db.task.findFirstOrThrow({ where: { contentProjectId: p.id, agentId: 'tiktok.package', status: 'COMPLETED' }, orderBy: { completedAt: 'desc' } });
    const pkg = pkgTask.output as unknown as Pkg;

    const approval = await findValidApproval(db, pkgTask.id, pkg);
    if (!approval) throw new Error('BLOCKED: no valid owner approval for this exact TikTok package');
    if ((await sha256File(paths.content(p.slug, pkg.video))) !== pkg.videoSha256) {
      throw new Error('BLOCKED: video file changed after approval; re-run the TikTok package step and approve again');
    }
    const idempotencyKey = createHash('sha256').update(`${pkg.videoSha256}:tiktok`).digest('hex');
    const existing = await db.platformPost.findUnique({ where: { idempotencyKey } });
    if (existing) return { output: { alreadyPublished: true, url: existing.url, postId: existing.id } as Json };

    const route = process.env.TIKTOK_ROUTE ?? 'browser';
    if (route !== 'browser') throw new Error(`TikTok route "${route}" is not configured yet`);
    const videoPath = paths.content(p.slug, pkg.video);
    const result = await awaitHumanAction<{ url: string; notes?: string }>(db, ctx, {
      kind: 'tiktok_upload',
      title: `Post to TikTok: ${pkg.caption.split('\n')[0].slice(0, 60)}`,
      payload: { ...pkg, videoPath, approvalId: approval.id, idempotencyKey } as never,
      instructions: [
        `Post this APPROVED package on the TikTok account ${pkg.account.handle} ("${pkg.account.name}") in the owner's logged-in Chrome (TikTok Studio upload page).`,
        'Make sure the logged-in account is exactly this handle (never the owner\'s personal account). Stop on login, CAPTCHA, 2FA or verification.',
        `1. tiktok.com/tiktokstudio/upload → select file: ${videoPath}`,
        '2. Description: payload.caption exactly.',
        `3. Who can watch: ${pkg.visibility}. Comments: ${pkg.allowComments ? 'on' : 'off'}. More options → "AI-generated content": ${pkg.aiGeneratedLabel ? 'ON (AI voice)' : 'off'}. No promotion/ads.`,
        '4. Post. Then open the video and copy its link (tiktok.com/@handle/video/<id>).',
        '5. Complete this action with {"url": "<link>", "notes": "..."}.',
      ].join('\n'),
    });

    const m = String(result.url ?? '').match(TT_POST);
    if (!m) {
      await db.humanActionRequest.updateMany({ where: { taskId: ctx.taskId, kind: 'tiktok_upload', status: 'DONE' }, data: { status: 'CANCELLED' } });
      throw new Error(`Upload result has no valid TikTok video URL: ${result.url}`);
    }
    // Public oEmbed confirms the video exists and belongs to the account.
    let verified = false; let author = '';
    try {
      const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(result.url)}`);
      if (r.ok) { const j = await r.json() as { author_unique_id?: string }; author = j.author_unique_id ?? ''; verified = !!author && `@${author}` === pkg.account.handle; }
    } catch { /* network: stays unverified */ }
    const post = await db.platformPost.create({ data: {
      contentProjectId: p.id, platform: 'tiktok', route, idempotencyKey, approvalId: approval.id, externalId: m[2], url: result.url,
      visibility: pkg.visibility.toLowerCase(), status: verified ? 'published' : 'unverified',
      metadata: { account: pkg.account.handle } as never,
      evidence: { verified, oembedAuthor: author || null, operatorNotes: result.notes ?? null } as never } });
    await audit(db, `agent:${ctx.agentId}`, 'platform.published', { entity: 'platform_post', entityId: post.id, data: { platform: 'tiktok', url: result.url, verified } });
    return { output: { url: result.url, externalId: m[2], postId: post.id, verified } as Json };
  },
};
