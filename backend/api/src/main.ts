import 'reflect-metadata';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Response } from 'express';
import {
  Body, CanActivate, Res, Controller, ExecutionContext, Get, Inject, Injectable, Module, NotFoundException,
  BadRequestException, Param, Patch, Post, Query, UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD, NestFactory } from '@nestjs/core';
import { z } from 'zod';
import { getDb, type PrismaClient } from '@creatoros/db';
import { audit, completeHumanAction, decideApproval, getLock, isEmergencyStopped, paths, safeContentPath, setEmergencyStop } from '@creatoros/core';
import { FACEBOOK_PAGE, TIKTOK_ACCOUNT, INSTAGRAM_ACCOUNT, SNAPCHAT_ACCOUNT, IG_POST, SC_POST, FB_POST, TT_POST, PLATFORMS, addPlatform, displayTitles, displayTitle, publishedOverview, recordPostMetric, refreshYouTubeMetrics, ensureBrands, getDefaultBrand, profileOf, rejectIdea, selectIdea, setActiveBrand, submitIdeation, submitInstruction, type PlatformId } from '@creatoros/agents';

// BigInt (lock tokens, audit ids) → JSON string
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () { return this.toString(); };

// The API serves several parallel queries per page; give it a few more pooler connections than the worker (pool max 15).
process.env.DB_CONNECTION_LIMIT ??= '5';

import { operatorStatus, startAutoLoop, startOperator, stopOperator } from './operator';

const DB = 'DB';

/** Adds `displayTitle` (the real video title) to rows that reference a content project. */
async function withTitles<T>(db: PrismaClient, rows: T[], projectId: (r: T) => string | null | undefined): Promise<(T & { displayTitle: string | null })[]> {
  const ids = [...new Set(rows.map(projectId).filter((x): x is string => !!x))];
  const titles = await displayTitles(db, ids);
  return rows.map((r) => { const id = projectId(r); return { ...r, displayTitle: id ? titles.get(id) ?? null : null }; });
}
const OWNER = 'user:owner';

/** Phase 1 auth: shared secret between the dashboard server and this API (API binds to localhost only). */
@Injectable()
class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    if (req.path === '/health') return true;
    const key = process.env.API_KEY;
    if (!key || req.headers['x-api-key'] !== key) throw new UnauthorizedException();
    return true;
  }
}

const parse = <T>(schema: z.ZodType<T>, body: unknown): T => {
  const r = schema.safeParse(body);
  if (!r.success) throw new BadRequestException(r.error.flatten());
  return r.data;
};

@Controller()
class SystemController {
  constructor(@Inject(DB) private db: PrismaClient) {}

  @Get('health') health() { return { ok: true }; }

  /** Everything the dashboard frame needs, in ONE database round trip. */
  @Get('status')
  async status() {
    const [r] = await this.db.$queryRaw<{
      approvals: number; ai: number; actions: number; ideas: number; stop: unknown; pulse: string | null;
      agent_id: string | null; task_type: string | null; project_id: string | null; brand_name: string | null; brand_settings: unknown;
    }[]>`
      SELECT
        (SELECT count(*) FROM "Approval" WHERE decision = 'PENDING')::int AS approvals,
        (SELECT count(*) FROM "AiRequest" WHERE status = 'PENDING')::int AS ai,
        (SELECT count(*) FROM "HumanActionRequest" WHERE status = 'PENDING')::int AS actions,
        (SELECT count(*) FROM "Idea" WHERE status = 'PROPOSED')::int AS ideas,
        (SELECT value FROM "SystemSetting" WHERE key = 'emergency_stop') AS stop,
        (SELECT max(id) FROM "AuditLog")::text AS pulse,
        r."agentId" AS agent_id, t.type AS task_type, t."contentProjectId" AS project_id,
        b.name AS brand_name, b.settings AS brand_settings
      FROM (SELECT 1) x
      LEFT JOIN "ExecutionLock" l ON l.id = 'global' AND l."leaseUntil" > now()
      LEFT JOIN "TaskRun" r ON r.id = l.holder
      LEFT JOIN "Task" t ON t.id = r."taskId"
      LEFT JOIN "Brand" b ON b.slug = COALESCE((SELECT value #>> '{}' FROM "SystemSetting" WHERE key = 'active_brand'), 'margin-of-safety')`;
    const brand = r.brand_name ? profileOf({ settings: r.brand_settings }) : null;
    return {
      pendingApprovals: r.approvals, aiPending: r.ai, actionsPending: r.actions, ideasProposed: r.ideas,
      emergencyStop: r.stop === true, pulse: r.pulse ?? '0',
      running: r.agent_id ? { agentId: r.agent_id, type: r.task_type, projectId: r.project_id, title: r.project_id ? await displayTitle(this.db, r.project_id) : null } : null,
      activeBrand: r.brand_name ? { name: r.brand_name, youtube: brand?.channels.youtube ?? null } : null,
    };
  }

  /** Cheap change detector: the dashboard re-renders only when this value changes. */
  @Get('pulse')
  async pulse() {
    const [r] = await this.db.$queryRaw<{ v: string | null; lease: string | null }[]>`
      SELECT (SELECT max(id) FROM "AuditLog" WHERE action <> 'agent.log')::text AS v,
             (SELECT holder FROM "ExecutionLock" WHERE id = 'global' AND "leaseUntil" > now()) AS lease`;
    // While Claude is working on the queue, change every 5 s so the dashboard shows its progress live.
    const op = (await operatorStatus(this.db)).running ? `:op${Math.floor(Date.now() / 5000)}` : '';
    return { v: `${r.v ?? 0}:${r.lease ?? '-'}${op}` };
  }

  // ---------- "Process with Claude" (headless Claude Code answers the AI queue) ----------
  @Get('operator')
  operator() { return operatorStatus(this.db); }

  @Post('operator/run')
  async operatorRun() {
    try { return await startOperator(this.db, 'button'); } catch (e) { throw new BadRequestException((e as Error).message); }
  }

  @Post('operator/stop')
  async operatorStop() {
    const stopped = stopOperator();
    if (stopped) await audit(this.db, OWNER, 'operator.run_stopped');
    return { stopped };
  }

  @Post('operator/auto')
  async operatorAuto(@Body() body: unknown) {
    const { enabled } = parse(z.object({ enabled: z.boolean() }), body);
    await this.db.systemSetting.upsert({ where: { key: 'operator_auto' }, create: { key: 'operator_auto', value: enabled, updatedBy: OWNER }, update: { value: enabled, updatedBy: OWNER } });
    await audit(this.db, OWNER, enabled ? 'operator.auto_on' : 'operator.auto_off');
    return operatorStatus(this.db);
  }

  @Get('overview')
  async overview() {
    const [byStatus, pendingApprovals, lock, stopped, agents, brands, aiPending, actionsPending, ideasProposed, activeBrand, posts] = await Promise.all([
      this.db.task.groupBy({ by: ['status'], _count: true }),
      this.db.approval.count({ where: { decision: 'PENDING' } }),
      getLock(this.db),
      isEmergencyStopped(this.db),
      this.db.agent.count({ where: { enabled: true } }),
      this.db.brand.count(),
      this.db.aiRequest.count({ where: { status: 'PENDING' } }),
      this.db.humanActionRequest.count({ where: { status: 'PENDING' } }),
      this.db.idea.count({ where: { status: 'PROPOSED' } }),
      getDefaultBrand(this.db),
      this.db.platformPost.count(),
    ]);
    const running = lock?.holder && lock.leaseUntil && lock.leaseUntil > new Date()
      ? await this.db.taskRun.findUnique({ where: { id: lock.holder }, include: { task: true } }) : null;
    return {
      tasks: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      pendingApprovals, emergencyStop: stopped, enabledAgents: agents, brands, aiPending, actionsPending, ideasProposed, posts,
      activeBrand: { name: activeBrand.name, slug: activeBrand.slug, language: profileOf(activeBrand).language, youtube: profileOf(activeBrand).channels.youtube ?? null },
      lock: { holder: lock?.holder ?? null, workerId: lock?.workerId ?? null, leaseUntil: lock?.leaseUntil ?? null, token: lock?.token ?? 0n },
      running: running ? { runId: running.id, taskId: running.taskId, agentId: running.agentId, type: running.task.type, startedAt: running.startedAt } : null,
    };
  }

  @Post('system/stop') async stop() { await setEmergencyStop(this.db, true, OWNER); return { emergencyStop: true }; }
  @Post('system/resume') async resume() { await setEmergencyStop(this.db, false, OWNER); return { emergencyStop: false }; }

  @Get('audit')
  audit(@Query('limit') limit?: string, @Query('entityId') entityId?: string) {
    return this.db.auditLog.findMany({ where: entityId ? { entityId } : {}, orderBy: { id: 'desc' }, take: Math.min(Number(limit) || 100, 500) });
  }
}

@Controller('agents')
class AgentsController {
  constructor(@Inject(DB) private db: PrismaClient) {}

  @Get()
  async list() {
    const agents = await this.db.agent.findMany({ orderBy: [{ department: 'asc' }, { name: 'asc' }] });
    const stats = await this.db.taskRun.groupBy({ by: ['agentId', 'status'], _count: true, _sum: { costUsd: true } });
    const last = await this.db.taskRun.findMany({ distinct: ['agentId'], orderBy: { startedAt: 'desc' } });
    return agents.map((a) => {
      const s = stats.filter((x) => x.agentId === a.id);
      const total = s.reduce((n, x) => n + x._count, 0);
      const ok = s.find((x) => x.status === 'SUCCEEDED')?._count ?? 0;
      const cost = s.reduce((n, x) => n + Number(x._sum.costUsd ?? 0), 0);
      return { ...a, runs: total, successRate: total ? ok / total : null, costUsd: cost, lastRun: last.find((r) => r.agentId === a.id) ?? null };
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const { enabled } = parse(z.object({ enabled: z.boolean() }), body);
    const a = await this.db.agent.update({ where: { id }, data: { enabled } });
    await audit(this.db, OWNER, enabled ? 'agent.enabled' : 'agent.disabled', { entity: 'agent', entityId: id });
    return a;
  }
}

@Controller()
class TasksController {
  constructor(@Inject(DB) private db: PrismaClient) {}

  @Get('tasks')
  list(@Query('status') status?: string) {
    return this.db.task.findMany({
      where: status ? { status: status as never } : {}, orderBy: { createdAt: 'desc' }, take: 200,
      select: { id: true, type: true, status: true, agentId: true, attempts: true, maxAttempts: true, lastError: true, priority: true,
        nextAttemptAt: true, createdAt: true, startedAt: true, completedAt: true, updatedAt: true, contentProjectId: true,
        agent: { select: { name: true } }, dependsOn: { select: { dependsOnId: true } } },
    }).then((rows) => withTitles(this.db, rows, (t) => t.contentProjectId));
  }

  @Get('tasks/:id')
  async get(@Param('id') id: string) {
    const t = await this.db.task.findUnique({ where: { id }, include: { runs: { orderBy: { startedAt: 'desc' } }, children: true, approvals: true } });
    if (!t) throw new NotFoundException();
    return t;
  }

  @Post('instructions')
  async instruct(@Body() body: unknown) {
    const { text, brandId, language, format, platforms } = parse(z.object({ text: z.string().min(3).max(2000), brandId: z.string().uuid().optional(), language: z.enum(['en', 'ur']).optional(), format: z.enum(['short', 'long']).optional(),
      platforms: z.array(z.enum(Object.keys(PLATFORMS) as [PlatformId, ...PlatformId[]])).max(8).optional() }), body);
    return submitInstruction(this.db, text, { brandId, language, format, platforms, actor: OWNER });
  }

  @Post('tasks/:id/retry')
  async retry(@Param('id') id: string) {
    const r = await this.db.task.updateMany({ where: { id, status: { in: ['DEAD', 'FAILED', 'CANCELLED'] } },
      data: { status: 'QUEUED', attempts: 0, nextAttemptAt: null } });
    if (!r.count) throw new BadRequestException('task is not retryable');
    await audit(this.db, OWNER, 'task.retry_requested', { entity: 'task', entityId: id });
    return { ok: true };
  }

  @Post('tasks/:id/cancel')
  async cancel(@Param('id') id: string) {
    const r = await this.db.task.updateMany({ where: { id, status: { in: ['PENDING', 'QUEUED', 'FAILED', 'AWAITING_APPROVAL', 'BLOCKED', 'WAITING_AI', 'WAITING_HUMAN'] } },
      data: { status: 'CANCELLED' } });
    if (!r.count) throw new BadRequestException('task cannot be cancelled in its current state');
    // A cancelled task can no longer be approved: close its open approval requests.
    await this.db.approval.updateMany({ where: { taskId: id, decision: 'PENDING' },
      data: { decision: 'REJECTED', decidedBy: 'system', feedback: 'task cancelled', decidedAt: new Date() } });
    await audit(this.db, OWNER, 'task.cancelled', { entity: 'task', entityId: id });
    return { ok: true };
  }

  @Get('approvals')
  async approvals(@Query('decision') decision?: string) {
    const full = { type: true, agentId: true, output: true, input: true, contentProjectId: true, contentProject: { select: { id: true, title: true, slug: true, language: true } } } as const;
    const light = { type: true, agentId: true, contentProjectId: true, contentProject: { select: { id: true, title: true, slug: true, language: true } } } as const;
    const rows = decision === 'PENDING'
      ? await this.db.approval.findMany({ where: { decision: 'PENDING' }, orderBy: { createdAt: 'asc' }, include: { task: { select: full } } })
      : await this.db.approval.findMany({ where: decision ? { decision: decision as never } : { decision: { not: 'PENDING' } }, orderBy: { decidedAt: 'desc' }, take: 40, include: { task: { select: light } } });
    return withTitles(this.db, rows, (a) => a.task?.contentProjectId);
  }

  @Post('approvals/:id/decide')
  decide(@Param('id') id: string, @Body() body: unknown) {
    const { decision, feedback } = parse(z.object({
      decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']), feedback: z.string().max(4000).optional() }), body);
    return decideApproval(this.db, id, decision, OWNER, feedback);
  }
}

const slugCache = new Map<string, string>();

/** Lists files under a content project folder (relative paths). Cached for a few seconds: list pages call it per project. */
const fileCache = new Map<string, { at: number; files: { path: string; bytes: number }[] }>();
function listFiles(slug: string): { path: string; bytes: number }[] {
  const hit = fileCache.get(slug);
  if (hit && Date.now() - hit.at < 8000) return hit.files;
  const files = walkFiles(slug);
  fileCache.set(slug, { at: Date.now(), files });
  return files;
}
function walkFiles(slug: string): { path: string; bytes: number }[] {
  const base = paths.content(slug);
  if (!existsSync(base)) return [];
  const out: { path: string; bytes: number }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full); else out.push({ path: path.relative(base, full), bytes: st.size });
    }
  };
  walk(base);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

/** The project's final video: output/<slug>.mp4, else the newest .mp4 in output/. */
function findVideo(slug: string, all = listFiles(slug)): string | null {
  const files = all.filter((f) => /^output\/[^/]+\.mp4$/.test(f.path));
  return (files.find((f) => f.path === `output/${slug}.mp4`) ?? files.sort((a, b) => b.path.localeCompare(a.path))[0])?.path ?? null;
}

/** A light preview image: YouTube thumbnail, else a middle scene still. */
function findPoster(slug: string, all = listFiles(slug)): string | null {
  const files = all.map((f) => f.path);
  if (files.includes('platforms/youtube/thumbnail.jpg')) return 'platforms/youtube/thumbnail.jpg';
  const stills = files.filter((f) => /^(visuals\/stills|output\/stills)\/[^/]+\.(jpg|png)$/.test(f)).sort();
  return stills[Math.min(2, stills.length - 1)] ?? null;
}

@Controller()
class ContentController {
  constructor(@Inject(DB) private db: PrismaClient) {}

  /** The owner's day: what needs them (per video), what is being made, and this week's numbers. */
  @Get('today')
  async today() {
    const [approvals, actions, aiPending, failed, making, week] = await Promise.all([
      this.db.approval.findMany({ where: { decision: 'PENDING' }, orderBy: { createdAt: 'asc' }, select: { id: true, createdAt: true, task: { select: { type: true, contentProjectId: true } } } }),
      this.db.humanActionRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, select: { id: true, kind: true, createdAt: true, task: { select: { contentProjectId: true } } } }),
      this.db.aiRequest.count({ where: { status: 'PENDING' } }),
      this.db.task.findMany({ where: { status: 'DEAD', contentProject: { archivedAt: null } }, select: { id: true, agentId: true, lastError: true, updatedAt: true, contentProjectId: true } }),
      this.db.contentProject.findMany({ where: { archivedAt: null, tasks: { some: { status: { notIn: ['COMPLETED', 'CANCELLED', 'DEAD'] } } } }, orderBy: { createdAt: 'desc' }, take: 8,
        select: { id: true, slug: true, createdAt: true, tasks: { select: { agentId: true, status: true }, orderBy: { priority: 'asc' } } } }),
      this.db.$queryRaw<{ posts_week: number; views: number | null; comments: number | null; checked: number }[]>`
        SELECT (SELECT count(*) FROM "PlatformPost" WHERE "publishedAt" > now() - interval '7 days')::int AS posts_week,
               sum(m.views)::int AS views, sum(m.comments)::int AS comments, count(*)::int AS checked
        FROM (SELECT DISTINCT ON ("platformPostId") views, comments FROM "PostMetric" ORDER BY "platformPostId", "capturedAt" DESC) m`,
    ]);
    const ids = [...approvals.map((a) => a.task?.contentProjectId), ...actions.map((a) => a.task?.contentProjectId), ...failed.map((f) => f.contentProjectId), ...making.map((p) => p.id)];
    const titles = await displayTitles(this.db, [...new Set(ids.filter((x): x is string => !!x))]);
    const title = (id?: string | null) => (id ? titles.get(id) ?? null : null);
    const needs = [
      ...approvals.map((a) => ({ kind: 'approve', id: a.id, what: a.task?.type ?? 'approval', projectId: a.task?.contentProjectId ?? null, title: title(a.task?.contentProjectId), since: a.createdAt })),
      ...actions.map((a) => ({ kind: 'post', id: a.id, what: a.kind, projectId: a.task?.contentProjectId ?? null, title: title(a.task?.contentProjectId), since: a.createdAt })),
      ...failed.map((f) => ({ kind: 'failed', id: f.id, what: f.agentId, projectId: f.contentProjectId, title: title(f.contentProjectId), since: f.updatedAt, error: f.lastError?.slice(0, 200) ?? null })),
    ];
    const posters = making.map((p) => ({ ...p, title: title(p.id), poster: findPoster(p.slug) }));
    const [w] = week;
    return { needs, aiPending, making: posters, week: { posts: w?.posts_week ?? 0, views: w?.checked ? w.views : null, comments: w?.checked ? w.comments : null } };
  }

  @Post('content/:id/archive')
  async archive(@Param('id') id: string, @Body() body: unknown) {
    const { archived } = parse(z.object({ archived: z.boolean() }), body);
    const p = await this.db.contentProject.update({ where: { id }, data: { archivedAt: archived ? new Date() : null } }).catch(() => null);
    if (!p) throw new NotFoundException();
    await audit(this.db, OWNER, archived ? 'project.archived' : 'project.unarchived', { entity: 'content_project', entityId: id, brandId: p.brandId });
    return { ok: true };
  }

  @Get('content')
  async list() {
    const projects = await this.db.contentProject.findMany({ orderBy: { createdAt: 'desc' },
      include: { tasks: { select: { agentId: true, status: true, type: true }, orderBy: { priority: 'asc' } }, posts: { select: { platform: true, url: true } } } });
    const titles = await displayTitles(this.db, projects.map((p) => p.id));
    return projects.map((p) => { const files = listFiles(p.slug); return { ...p, displayTitle: titles.get(p.id) ?? p.title, video: findVideo(p.slug, files), poster: findPoster(p.slug, files) }; });
  }

  @Get('content/:id')
  async get(@Param('id') id: string) {
    const p = await this.db.contentProject.findUnique({ where: { id }, include: {
      tasks: { orderBy: { priority: 'asc' }, include: { approvals: { orderBy: { createdAt: 'desc' } }, aiRequests: { orderBy: { createdAt: 'desc' }, select: { id: true, kind: true, status: true, error: true, createdAt: true } } } },
      posts: { orderBy: { publishedAt: 'desc' }, include: { metrics: { orderBy: { capturedAt: 'desc' }, take: 1 } } } } });
    if (!p) throw new NotFoundException();
    const brand = p.brandId ? await this.db.brand.findUnique({ where: { id: p.brandId } }) : null;
    const youtube = brand ? profileOf(brand).channels.youtube ?? null : null;
    const files = listFiles(p.slug);
    return { ...p, displayTitle: await displayTitle(this.db, p.id), files, video: findVideo(p.slug, files), brand: brand ? { name: brand.name, slug: brand.slug, youtube } : null };
  }

  /** Streams a file from content/<slug>/ (supports Range for video seeking). */
  @Get('content/:id/file')
  async file(@Param('id') id: string, @Query('path') rel: string, @Res() res: Response) {
    // A project's slug never changes: remember it, so media requests skip the database.
    let slug = slugCache.get(id);
    if (!slug) {
      const p = await this.db.contentProject.findUnique({ where: { id }, select: { slug: true } });
      if (p) slugCache.set(id, (slug = p.slug));
    }
    if (!slug || !rel) throw new NotFoundException();
    let full: string;
    try { full = safeContentPath(slug, rel); } catch { throw new BadRequestException('invalid path'); }
    if (!existsSync(full)) throw new NotFoundException();
    res.sendFile(full, { acceptRanges: true, dotfiles: 'deny' });
  }

  @Post('content/:id/platforms')
  async addPlatformToProject(@Param('id') id: string, @Body() body: unknown) {
    const { platform } = parse(z.object({ platform: z.enum(Object.keys(PLATFORMS) as [PlatformId, ...PlatformId[]]) }), body);
    try { return await addPlatform(this.db, id, platform, OWNER); } catch (e) { throw new BadRequestException((e as Error).message); }
  }

  @Get('platforms')
  platforms() {
    const accounts: Record<string, { name: string; handle?: string; url: string } | null> = {
      facebook: { name: FACEBOOK_PAGE.name, url: FACEBOOK_PAGE.url },
      tiktok: TIKTOK_ACCOUNT.handle ? { name: TIKTOK_ACCOUNT.name, handle: TIKTOK_ACCOUNT.handle, url: TIKTOK_ACCOUNT.url } : null,
      instagram: INSTAGRAM_ACCOUNT().handle ? INSTAGRAM_ACCOUNT() : null,
      snapchat: SNAPCHAT_ACCOUNT().handle ? SNAPCHAT_ACCOUNT() : null,
    };
    return Object.values(PLATFORMS).map(({ id, name, status, route, notes, agents }) => ({ id, name, status, route, notes, agents: agents.map((a) => a.id), account: accounts[id] ?? null }));
  }

  @Get('published')
  published() { return publishedOverview(this.db); }

  @Post('published/youtube/refresh')
  async refreshYouTube() {
    try { return await refreshYouTubeMetrics(this.db, OWNER); }
    catch (e) { throw new BadRequestException((e as Error).message); }
  }

  @Post('posts/:id/metrics')
  async recordMetrics(@Param('id') id: string, @Body() body: unknown) {
    const n = z.number().int().min(0).nullable().optional();
    const { note, ...values } = parse(z.object({ views: n, likes: n, comments: n, shares: n, saves: n, reach: n, watchTimeSec: n, note: z.string().max(500).optional() }), body);
    try { return await recordPostMetric(this.db, id, values, { source: 'manual', actor: OWNER, note }); }
    catch (e) { throw new BadRequestException((e as Error).message); }
  }

  @Get('posts')
  posts() {
    return this.db.platformPost.findMany({ orderBy: { publishedAt: 'desc' }, take: 100, include: { contentProject: { select: { id: true, title: true, slug: true } } } })
      .then((rows) => withTitles(this.db, rows, (r) => r.contentProjectId));
  }

  @Get('human-actions')
  humanActions(@Query('status') status?: string) {
    return this.db.humanActionRequest.findMany({ where: status ? { status: status as never } : {}, orderBy: { createdAt: 'desc' }, take: status === 'PENDING' ? 100 : 40,
      include: { task: { select: { id: true, agentId: true, contentProject: { select: { id: true, slug: true, title: true } } } } } })
      .then((rows) => withTitles(this.db, rows, (r) => r.task?.contentProject?.id));
  }

  @Post('human-actions/:id/complete')
  async completeAction(@Param('id') id: string, @Body() body: unknown) {
    const { result } = parse(z.object({ result: z.record(z.unknown()) }), body);
    const action = await this.db.humanActionRequest.findUnique({ where: { id } });
    if (action?.kind === 'youtube_upload' && !/^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/|studio\.youtube\.com\/video\/)[\w-]{11}/.test(String(result.url ?? ''))) {
      throw new BadRequestException('Paste the YouTube video link (e.g. https://youtube.com/shorts/… or https://youtu.be/…).');
    }
    if (action?.kind === 'facebook_upload' && !FB_POST.test(String(result.url ?? ''))) {
      throw new BadRequestException('Paste the Facebook post link (e.g. https://www.facebook.com/reel/… or …/videos/…).');
    }
    if (action?.kind === 'tiktok_upload' && !TT_POST.test(String(result.url ?? ''))) {
      throw new BadRequestException('Paste the TikTok video link (e.g. https://www.tiktok.com/@handle/video/…).');
    }
    if (action?.kind === 'instagram_upload' && !IG_POST.test(String(result.url ?? ''))) {
      throw new BadRequestException('Paste the Instagram Reel link (e.g. https://www.instagram.com/reel/…).');
    }
    if (action?.kind === 'snapchat_upload' && !SC_POST.test(String(result.url ?? ''))) {
      throw new BadRequestException('Paste the Snapchat Spotlight link (e.g. https://www.snapchat.com/spotlight/…).');
    }
    try { await completeHumanAction(this.db, id, result as never, OWNER); return { ok: true }; }
    catch (e) { throw new BadRequestException((e as Error).message); }
  }

  // ---------- Strategy: brand profile + ideas ----------
  @Get('brands')
  async brands() {
    // Built-in series are ensured once at startup (bootstrap), so this is two parallel reads.
    const [setting, all] = await Promise.all([
      this.db.systemSetting.findUnique({ where: { key: 'active_brand' } }),
      this.db.brand.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);
    const activeSlug = typeof setting?.value === 'string' ? setting.value : 'margin-of-safety';
    const active = all.find((b) => b.slug === activeSlug) ?? all[0];
    return all.map((b) => ({ id: b.id, slug: b.slug, name: b.name, description: b.description, active: b.id === active?.id, profile: profileOf(b) }));
  }

  @Post('brands/:slug/activate')
  async activate(@Param('slug') slug: string) {
    try { await setActiveBrand(this.db, slug, OWNER); } catch { throw new NotFoundException(); }
    await audit(this.db, OWNER, 'brand.activated', { entity: 'brand', entityId: slug });
    return { ok: true };
  }

  @Post('brands/:slug')
  async updateBrand(@Param('slug') slug: string, @Body() body: unknown) {
    const list = z.array(z.string().min(1)).max(20);
    const { name, profile } = parse(z.object({ name: z.string().min(2).max(80), profile: z.object({
      niche: z.string().min(5), audience: z.string().min(5), region: z.string().length(2), language: z.enum(['en', 'ur']),
      tone: z.string().min(3), pillars: list, avoid: list, rules: list, formats: list,
      voice: z.string().min(3), voiceRate: z.string().regex(/^[+-]\d{1,2}%$/), wordsPerMinute: z.number().int().min(80).max(250),
      visualStyle: z.string().min(5), youtubeCategory: z.string().min(3), youtubePlaylist: z.string().max(150).optional(),
      channels: z.object({ youtube: z.object({ id: z.string().regex(/^UC[\w-]{22}$/), handle: z.string(), name: z.string() }).optional() }),
    }) }), body);
    const b = await this.db.brand.findUnique({ where: { slug } });
    if (!b) throw new NotFoundException();
    await this.db.brand.update({ where: { id: b.id }, data: { name, tone: profile.tone, language: profile.language, settings: { ...(b.settings as object), profile } as never } });
    await audit(this.db, OWNER, 'brand.updated', { entity: 'brand', entityId: b.id, brandId: b.id });
    return { ok: true };
  }

  @Post('ideation')
  async ideation(@Body() body: unknown) {
    const { count, focus, brandId } = parse(z.object({ count: z.number().int().min(3).max(10).default(5), focus: z.string().max(300).optional(), brandId: z.string().uuid().optional() }), body ?? {});
    return submitIdeation(this.db, { count, focus, brandId, actor: OWNER });
  }

  @Get('ideas')
  async ideas() {
    const [ideas, rounds] = await Promise.all([
      this.db.idea.findMany({ orderBy: [{ createdAt: 'desc' }, { rank: 'asc' }], take: 60 }),
      this.db.task.findMany({ where: { type: { in: ['trends_report', 'ideas'] } }, orderBy: { createdAt: 'desc' }, take: 10,
        select: { id: true, agentId: true, status: true, createdAt: true, output: true, input: true } }),
    ]);
    return { ideas, rounds };
  }

  @Post('ideas/:id/select')
  async select(@Param('id') id: string, @Body() body: unknown) {
    const { language, platforms } = parse(z.object({ language: z.enum(['en', 'ur']).optional(),
      platforms: z.array(z.enum(Object.keys(PLATFORMS) as [PlatformId, ...PlatformId[]])).max(8).optional() }), body ?? {});
    try { return await selectIdea(this.db, id, { actor: OWNER, language, platforms }); } catch (e) { throw new BadRequestException((e as Error).message); }
  }

  @Post('ideas/:id/reject')
  async reject(@Param('id') id: string, @Body() body: unknown) {
    const { feedback } = parse(z.object({ feedback: z.string().max(1000).optional() }), body ?? {});
    await rejectIdea(this.db, id, feedback, OWNER);
    return { ok: true };
  }

  @Get('ai-requests')
  ai(@Query('status') status?: string) {
    return this.db.aiRequest.findMany({ where: status ? { status: status as never } : {}, orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, kind: true, format: true, status: true, error: true, createdAt: true, answeredAt: true, answeredBy: true,
        task: { select: { id: true, contentProject: { select: { id: true, slug: true, title: true } } } } } })
      .then((rows) => withTitles(this.db, rows, (r) => r.task?.contentProject?.id));
  }
}

@Module({
  controllers: [SystemController, AgentsController, TasksController, ContentController],
  providers: [{ provide: DB, useFactory: () => getDb() }, { provide: APP_GUARD, useClass: ApiKeyGuard }],
})
class AppModule {}

async function bootstrap() {
  await ensureBrands(getDb()); // once per start; /brands and /status then only read
  startAutoLoop(getDb());     // "Auto" mode for Process with Claude (does nothing unless switched on)
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, '127.0.0.1');
  console.log(`[api] listening on http://127.0.0.1:${port}`);
}
bootstrap();
