import 'reflect-metadata';
import {
  Body, CanActivate, Controller, ExecutionContext, Get, Inject, Injectable, Module, NotFoundException,
  BadRequestException, Param, Patch, Post, Query, UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD, NestFactory } from '@nestjs/core';
import { z } from 'zod';
import { getDb, type PrismaClient } from '@creatoros/db';
import { audit, decideApproval, getLock, isEmergencyStopped, setEmergencyStop, submitInstruction } from '@creatoros/core';

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
    const [byStatus, pendingApprovals, lock, stopped, agents, brands] = await Promise.all([
      this.db.task.groupBy({ by: ['status'], _count: true }),
      this.db.approval.count({ where: { decision: 'PENDING' } }),
      getLock(this.db),
      isEmergencyStopped(this.db),
      this.db.agent.count({ where: { enabled: true } }),
      this.db.brand.count(),
    ]);
    const running = lock?.holder && lock.leaseUntil && lock.leaseUntil > new Date()
      ? await this.db.taskRun.findUnique({ where: { id: lock.holder }, include: { task: true } }) : null;
    return {
      tasks: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      pendingApprovals, emergencyStop: stopped, enabledAgents: agents, brands,
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
    const { text, brandId } = parse(z.object({ text: z.string().min(3).max(2000), brandId: z.string().uuid().optional() }), body);
    return submitInstruction(this.db, text, { brandId, actor: OWNER });
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
    const r = await this.db.task.updateMany({ where: { id, status: { in: ['PENDING', 'QUEUED', 'FAILED', 'AWAITING_APPROVAL', 'BLOCKED'] } },
      data: { status: 'CANCELLED' } });
    if (!r.count) throw new BadRequestException('task cannot be cancelled in its current state');
    await audit(this.db, OWNER, 'task.cancelled', { entity: 'task', entityId: id });
    return { ok: true };
  }

  @Get('approvals')
  approvals(@Query('decision') decision?: string) {
    return this.db.approval.findMany({ where: decision ? { decision: decision as never } : {}, orderBy: { createdAt: 'desc' }, take: 100,
      include: { task: { select: { type: true, agentId: true, output: true, input: true } } } });
  }

  @Post('approvals/:id/decide')
  decide(@Param('id') id: string, @Body() body: unknown) {
    const { decision, feedback } = parse(z.object({
      decision: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']), feedback: z.string().max(4000).optional() }), body);
    return decideApproval(this.db, id, decision, OWNER, feedback);
  }
}

@Module({
  controllers: [SystemController, AgentsController, TasksController],
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
