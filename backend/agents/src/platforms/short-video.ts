/**
 * Shared builder for vertical short-video platforms posted from the owner's Chrome (Instagram Reels,
 * Snapchat Spotlight). Same safety pattern as TikTok:
 *   package (Claude writes the caption → owner approves the exact package)
 *   → publish (re-check approval + unchanged video + never twice → human action in Chrome → record the link).
 * A platform switches on only when its account handle is set in .env, so nothing blocks before the account exists.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { getDb } from '@creatoros/db';
import { askAi, audit, awaitHumanAction, findValidApproval, parseJson, paths, type AgentDefinition, type Json } from '@creatoros/core';
import { brandBlock, footageCredits, project, projectWithBrand, readJson, withFeedback, writeJson } from '../production/shared';
import { sha256File } from './youtube/package';

export type ShortVideoConfig = {
  id: 'instagram' | 'snapchat';
  name: string;
  handleEnv: string;
  profileUrl: (handle: string) => string;
  /** Valid public post link; group 1 = the post id. */
  postUrl: RegExp;
  urlExample: string;
  /** Who the account is for, and how this platform's feed works (goes into the caption prompt). */
  feed: string;
  captionLines: string;
  captionMax: number;
  hashtags: { min: number; max: number; rule: string };
  /** Add the sources line to the caption (skip where captions are very short). */
  sources: boolean;
  aiLabel: string;
  uploadSteps: (videoPath: string) => string[];
};

export type ShortVideoPackage = {
  platform: string; account: { name: string; handle: string; url: string }; video: string; videoSha256: string; caption: string;
  coverText: string; visibility: string; allowComments: boolean; aiGeneratedLabel: boolean; language: string; series: string; route: string;
};

export function shortVideoPlatform(cfg: ShortVideoConfig) {
  const handle = () => process.env[cfg.handleEnv] ?? '';
  const account = () => ({ name: 'Chai & Curiosity', handle: handle(), url: handle() ? cfg.profileUrl(handle()) : '' });
  const Meta = z.object({
    caption: z.string().min(10).max(cfg.captionMax),
    hashtags: z.array(z.string().regex(/^#\S+$/)).min(cfg.hashtags.min).max(cfg.hashtags.max),
    coverText: z.string().min(2).max(40),
  });

  const pkgAgent: AgentDefinition = {
    id: `${cfg.id}.package`, name: `${cfg.name} Agent: package`, department: `Platforms / ${cfg.name}`, timeoutSec: 300, requiresApprovalAfter: true,
    async run(ctx) {
      const { p, brand, profile } = await projectWithBrand(ctx);
      if (!handle()) throw new Error(`BLOCKED: ${cfg.handleEnv} is not set in .env (create the ${cfg.name} account first)`);
      const ur = p.language === 'ur';
      const sb = await readJson<{ lines?: unknown[]; width?: number; height?: number }>(paths.content(p.slug, 'storyboard', 'storyboard.json'));
      if (!(sb.lines || (sb.height ?? 0) > (sb.width ?? 0))) throw new Error(`BLOCKED: ${cfg.name} needs a vertical (9:16) video; this project is horizontal`);
      const script = await readJson<{ titleOptions: string[]; scenes: { text: string }[] }>(paths.content(p.slug, 'script', 'script.json'));
      const research = await readJson<{ sources: { name: string }[] }>(paths.content(p.slug, 'research', 'research.json'));

      const meta = await askAi(getDb(), ctx, {
        kind: `${cfg.id}_metadata`, format: 'json', promptDir: paths.content(p.slug, 'ai'),
        prompt: withFeedback(`You are the ${cfg.name} Agent of CreatorOS. Write the ${cfg.name} post for this original ${ur ? 'Urdu' : 'English'} vertical video on the account "${account().name}" (${handle()}).

${brandBlock(brand.name, profile)}

Topic: ${p.title}
Approved title ideas: ${JSON.stringify(script.titleOptions)}
Narration: ${JSON.stringify(script.scenes.map((s) => s.text))}

${cfg.feed}
Rules:
- caption: ${ur ? 'Urdu' : 'English'}, ${cfg.captionLines} Line 1 is a hook or question that works without the video. End with a genuine question that invites a comment (no "like/follow/share" begging, no engagement bait). No links. Honest: nothing the video doesn't show. Max ${cfg.captionMax} characters.
- hashtags: ${cfg.hashtags.min}-${cfg.hashtags.max}. ${cfg.hashtags.rule}
- coverText: 2-6 words for the cover, same language.

Answer with ONLY a JSON object:
{"caption": string, "hashtags": [string], "coverText": string}`, ctx),
        validate: (raw) => {
          const m = Meta.parse(parseJson(raw));
          if (/https?:\/\//i.test(m.caption)) throw new Error('No links in the caption.');
          if (/#fyp|#foryou|#viral|#explore/i.test(m.hashtags.join(' '))) throw new Error('No #fyp/#viral/#explore spam hashtags.');
          return m;
        },
      });

      const footage = await footageCredits(p.slug);
      const credit = `🎙️ AI voice${footage.used ? ` · ${footage.line.replace('🎞️ ', '')}` : ' · original animation'}`;
      const caption = [meta.caption.trim(), '', ...(cfg.sources ? [`📚 ${research.sources.slice(0, 3).map((s) => s.name).join(' · ')}`] : []), credit, '', meta.hashtags.join(' ')]
        .join('\n').slice(0, 2200);

      await mkdir(paths.content(p.slug, 'platforms', cfg.id), { recursive: true });
      const videoRel = `output/${p.slug}.mp4`;
      const pkg: ShortVideoPackage = {
        platform: cfg.id, account: account(), video: videoRel, videoSha256: await sha256File(paths.content(p.slug, videoRel)),
        caption, coverText: meta.coverText, visibility: 'Public', allowComments: true,
        aiGeneratedLabel: true, // the narration is an AI voice: label it honestly
        language: ur ? 'Urdu' : 'English', series: brand.name, route: 'browser',
      };
      await writeJson(paths.content(p.slug, 'platforms', cfg.id, 'package.json'), pkg);
      await writeFile(paths.content(p.slug, 'platforms', cfg.id, 'caption.txt'), caption);
      return { output: pkg as unknown as Json };
    },
  };

  const publishAgent: AgentDefinition = {
    id: `${cfg.id}.publish`, name: `${cfg.name} Agent: publish`, department: `Platforms / ${cfg.name}`, timeoutSec: 120, maxAttempts: 2,
    async run(ctx) {
      const db = getDb();
      const p = await project(ctx);
      const pkgTask = await db.task.findFirstOrThrow({ where: { contentProjectId: p.id, agentId: `${cfg.id}.package`, status: 'COMPLETED' }, orderBy: { completedAt: 'desc' } });
      const pkg = pkgTask.output as unknown as ShortVideoPackage;

      const approval = await findValidApproval(db, pkgTask.id, pkg);
      if (!approval) throw new Error(`BLOCKED: no valid owner approval for this exact ${cfg.name} package`);
      if ((await sha256File(paths.content(p.slug, pkg.video))) !== pkg.videoSha256) {
        throw new Error(`BLOCKED: video file changed after approval; re-run the ${cfg.name} package step and approve again`);
      }
      const idempotencyKey = createHash('sha256').update(`${pkg.videoSha256}:${cfg.id}`).digest('hex');
      const existing = await db.platformPost.findUnique({ where: { idempotencyKey } });
      if (existing) return { output: { alreadyPublished: true, url: existing.url, postId: existing.id } as Json };

      const videoPath = paths.content(p.slug, pkg.video);
      const result = await awaitHumanAction<{ url: string; notes?: string }>(db, ctx, {
        kind: `${cfg.id}_upload`,
        title: `Post to ${cfg.name}: ${pkg.caption.split('\n')[0].slice(0, 60)}`,
        payload: { ...pkg, videoPath, approvalId: approval.id, idempotencyKey } as never,
        instructions: [
          `Post this APPROVED package on the ${cfg.name} account ${pkg.account.handle} ("${pkg.account.name}") in the owner's logged-in Chrome.`,
          "The logged-in account must be exactly this handle (never the owner's personal account). Stop on login, CAPTCHA, 2FA or verification.",
          ...cfg.uploadSteps(videoPath),
          `AI label: ${cfg.aiLabel} ON (AI voice). No boosting or ads.`,
          `Then open the post and copy its link (${cfg.urlExample}), and complete this action with {"url": "<link>", "notes": "..."}.`,
        ].join('\n'),
      });

      const m = String(result.url ?? '').match(cfg.postUrl);
      if (!m) {
        await db.humanActionRequest.updateMany({ where: { taskId: ctx.taskId, kind: `${cfg.id}_upload`, status: 'DONE' }, data: { status: 'CANCELLED' } });
        throw new Error(`Upload result has no valid ${cfg.name} post URL: ${result.url}`);
      }
      // These platforms have no free public check for a post, so the link is recorded as "unverified".
      const post = await db.platformPost.create({ data: {
        contentProjectId: p.id, platform: cfg.id, route: 'browser', idempotencyKey, approvalId: approval.id, externalId: m[1], url: result.url,
        visibility: pkg.visibility.toLowerCase(), status: 'unverified',
        metadata: { account: pkg.account.handle, title: pkg.caption.split('\n')[0].slice(0, 100) } as never,
        evidence: { verified: false, operatorNotes: result.notes ?? null } as never } });
      await audit(db, `agent:${ctx.agentId}`, 'platform.published', { entity: 'platform_post', entityId: post.id, data: { platform: cfg.id, url: result.url } });
      return { output: { url: result.url, externalId: m[1], postId: post.id } as Json };
    },
  };

  return {
    account,
    module: {
      id: cfg.id, name: cfg.name, status: handle() ? ('active' as const) : ('planned' as const), route: 'browser' as const,
      agents: [pkgAgent, publishAgent],
      steps: [
        { key: `${cfg.id}_package`, agentId: `${cfg.id}.package`, type: `${cfg.id}_package`, dependsOn: ['qa'] },
        { key: `${cfg.id}_publish`, agentId: `${cfg.id}.publish`, type: `${cfg.id}_publish`, dependsOn: [`${cfg.id}_package`] },
      ],
      notes: '',
    },
  };
}
