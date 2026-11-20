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
import { PLATFORMS, addPlatform, ensureBrands, getDefaultBrand, profileOf, rejectIdea, selectIdea, setActiveBrand, submitIdeation, submitInstruction, type PlatformId } from '@creatoros/agents';

// BigInt (lock tokens, audit ids) → JSON string
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () { return this.toString(); };

const DB = 'DB';
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
      include: { agent: { select: { name: true } }, dependsOn: { select: { dependsOnId: true } } },
    });
  }

  @Get('tasks/:id')
  async get(@Param('id') id: string) {
    const t = await this.db.task.findUnique({ where: { id }, include: { runs: { orderBy: { startedAt: 'desc' } }, children: true, approvals: true } });
    if (!t) throw new NotFoundException();
    return t;
  }

  @Post('instructions')
  async instruct(@Body() body: unknown) {
    const { text, brandId, language } = parse(z.object({ text: z.string().min(3).max(2000), brandId: z.string().uuid().optional(), language: z.enum(['en', 'ur']).optional() }), body);
    return submitInstruction(this.db, text, { brandId, language, actor: OWNER });
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
  approvals(@Query('decision') decision?: string) {
    return this.db.approval.findMany({ where: decision ? { decision: decision as never } : {}, orderBy: { createdAt: 'desc' }, take: 100,
      include: { task: { select: { type: true, agentId: true, output: true, input: true, contentProjectId: true, contentProject: { select: { title: true, slug: true, language: true } } } } } });
  }

  @Post('approvals/:id/decide')
  decide(@Param('id') id: string, @Body() body: unknown) {
    const { decision, feedback } = parse(z.object({
      decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']), feedback: z.string().max(4000).optional() }), body);
    return decideApproval(this.db, id, decision, OWNER, feedback);
  }
}

/** Lists files under a content project folder (relative paths). */
function listFiles(slug: string): { path: string; bytes: number }[] {
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
function findVideo(slug: string): string | null {
  const files = listFiles(slug).filter((f) => /^output\/[^/]+\.mp4$/.test(f.path));
  return (files.find((f) => f.path === `output/${slug}.mp4`) ?? files.sort((a, b) => b.path.localeCompare(a.path))[0])?.path ?? null;
}

/** A light preview image: YouTube thumbnail, else a middle scene still. */
function findPoster(slug: string): string | null {
  const files = listFiles(slug).map((f) => f.path);
  if (files.includes('platforms/youtube/thumbnail.jpg')) return 'platforms/youtube/thumbnail.jpg';
  const stills = files.filter((f) => /^(visuals\/stills|output\/stills)\/[^/]+\.(jpg|png)$/.test(f)).sort();
  return stills[Math.min(2, stills.length - 1)] ?? null;
}

@Controller()
class ContentController {
  constructor(@Inject(DB) private db: PrismaClient) {}

  @Get('content')
  async list() {
    const projects = await this.db.contentProject.findMany({ orderBy: { createdAt: 'desc' },
      include: { tasks: { select: { agentId: true, status: true, type: true }, orderBy: { priority: 'asc' } } } });
    return projects.map((p) => ({ ...p, video: findVideo(p.slug), poster: findPoster(p.slug) }));
  }

  @Get('content/:id')
  async get(@Param('id') id: string) {
    const p = await this.db.contentProject.findUnique({ where: { id }, include: {
      tasks: { orderBy: { priority: 'asc' }, include: { approvals: { orderBy: { createdAt: 'desc' } }, aiRequests: { orderBy: { createdAt: 'desc' }, select: { id: true, kind: true, status: true, error: true, createdAt: true } } } },
      posts: { orderBy: { publishedAt: 'desc' } } } });
    if (!p) throw new NotFoundException();
    const brand = p.brandId ? await this.db.brand.findUnique({ where: { id: p.brandId } }) : null;
    const youtube = brand ? profileOf(brand).channels.youtube ?? null : null;
    return { ...p, files: listFiles(p.slug), video: findVideo(p.slug), brand: brand ? { name: brand.name, slug: brand.slug, youtube } : null };
  }

  /** Streams a file from content/<slug>/ (supports Range for video seeking). */
  @Get('content/:id/file')
  async file(@Param('id') id: string, @Query('path') rel: string, @Res() res: Response) {
    const p = await this.db.contentProject.findUnique({ where: { id } });
    if (!p || !rel) throw new NotFoundException();
    let full: string;
    try { full = safeContentPath(p.slug, rel); } catch { throw new BadRequestException('invalid path'); }
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
    return Object.values(PLATFORMS).map(({ id, name, status, route, notes, agents }) => ({ id, name, status, route, notes, agents: agents.map((a) => a.id) }));
  }

  @Get('posts')
  posts() {
    return this.db.platformPost.findMany({ orderBy: { publishedAt: 'desc' }, take: 100, include: { contentProject: { select: { id: true, title: true, slug: true } } } });
  }

  @Get('human-actions')
  humanActions(@Query('status') status?: string) {
    return this.db.humanActionRequest.findMany({ where: status ? { status: status as never } : {}, orderBy: { createdAt: 'desc' }, take: 100,
      include: { task: { select: { id: true, agentId: true, contentProject: { select: { id: true, slug: true, title: true } } } } } });
  }

  @Post('human-actions/:id/complete')
  async completeAction(@Param('id') id: string, @Body() body: unknown) {
    const { result } = parse(z.object({ result: z.record(z.unknown()) }), body);
    try { await completeHumanAction(this.db, id, result as never, OWNER); return { ok: true }; }
    catch (e) { throw new BadRequestException((e as Error).message); }
  }

  // ---------- Strategy: brand profile + ideas ----------
  @Get('brands')
  async brands() {
    await ensureBrands(this.db);
    const active = await getDefaultBrand(this.db);
    const all = await this.db.brand.findMany({ orderBy: { createdAt: 'asc' } });
    return all.map((b) => ({ id: b.id, slug: b.slug, name: b.name, description: b.description, active: b.id === active.id, profile: profileOf(b) }));
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
      visualStyle: z.string().min(5), youtubeCategory: z.string().min(3),
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
    const { count, focus } = parse(z.object({ count: z.number().int().min(3).max(10).default(5), focus: z.string().max(300).optional() }), body ?? {});
    return submitIdeation(this.db, { count, focus, actor: OWNER });
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
    const { language } = parse(z.object({ language: z.enum(['en', 'ur']).optional() }), body ?? {});
    try { return await selectIdea(this.db, id, { actor: OWNER, language }); } catch (e) { throw new BadRequestException((e as Error).message); }
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
        task: { select: { id: true, contentProject: { select: { id: true, slug: true, title: true } } } } } });
  }
}

@Module({
  controllers: [SystemController, AgentsController, TasksController, ContentController],
  providers: [{ provide: DB, useFactory: () => getDb() }, { provide: APP_GUARD, useClass: ApiKeyGuard }],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, '127.0.0.1');
  console.log(`[api] listening on http://127.0.0.1:${port}`);
}
bootstrap();
