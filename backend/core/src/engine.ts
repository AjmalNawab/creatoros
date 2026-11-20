import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@creatoros/db';
import { acquireLock, ensureLockRow, getLock, releaseLock, renewLock } from './lock';
import { audit, isEmergencyStopped } from './system';
import { DeferError, type AgentDefinition, type Json, type TickResult } from './types';

export interface EngineOptions {
  workerId?: string;
  leaseSec?: number;          // lock lease length; renewed every leaseSec/3
  retryBaseSec?: number;      // backoff: base * 2^(attempt-1)
}

/**
 * Sequential execution engine. One tick = at most one agent run, under the global lock.
 * Safe to run several engines/processes: the DB lock guarantees only one executes.
 */
export class Engine {
  readonly workerId: string;
  private leaseSec: number;
  private retryBaseSec: number;
  private agents = new Map<string, AgentDefinition>();

  constructor(private db: PrismaClient, opts: EngineOptions = {}) {
    this.workerId = opts.workerId ?? `worker-${randomUUID().slice(0, 8)}`;
    this.leaseSec = opts.leaseSec ?? 30;
    this.retryBaseSec = opts.retryBaseSec ?? 30;
  }

  /** Register agent handlers in code and sync their metadata to the DB registry. */
  async register(defs: AgentDefinition[]) {
    for (const d of defs) {
      this.agents.set(d.id, d);
      const meta = { name: d.name, department: d.department, description: d.description,
        timeoutSec: d.timeoutSec ?? 600, maxAttempts: d.maxAttempts ?? 3, requiresApprovalAfter: d.requiresApprovalAfter ?? false };
      await this.db.agent.upsert({ where: { id: d.id }, create: { id: d.id, ...meta }, update: meta });
    }
    await ensureLockRow(this.db);
  }

  /** Recover from crashes: runs still marked RUNNING whose lease is gone. */
  async recover(): Promise<number> {
    const lock = await getLock(this.db);
    const leaseValid = !!(lock?.holder && lock.leaseUntil && lock.leaseUntil > new Date());
    const orphans = await this.db.taskRun.findMany({
      where: { status: 'RUNNING', ...(leaseValid ? { id: { not: lock!.holder! } } : {}) },
      include: { task: true },
    });
    for (const run of orphans) {
      await this.db.taskRun.update({ where: { id: run.id }, data: { status: 'ABORTED', error: 'lease lost (crash/restart)', finishedAt: new Date() } });
      await this.failTask(run.task.id, run.task.attempts, run.task.maxAttempts, 'run orphaned: worker crashed or lease expired');
      await audit(this.db, `system:${this.workerId}`, 'task.recovered', { entity: 'task', entityId: run.taskId, data: { runId: run.id } });
    }
    return orphans.length;
  }

  /** PENDING → QUEUED when all prerequisites are COMPLETED; FAILED → QUEUED when backoff elapsed. */
  async promote() {
    await this.db.$executeRaw`
      UPDATE "Task" t SET status = 'QUEUED', "updatedAt" = now()
       WHERE t.status = 'PENDING'
         AND NOT EXISTS (SELECT 1 FROM "TaskDependency" d JOIN "Task" p ON p.id = d."dependsOnId"
                          WHERE d."taskId" = t.id AND p.status <> 'COMPLETED')`;
    await this.db.$executeRaw`
      UPDATE "Task" SET status = 'QUEUED', "updatedAt" = now()
       WHERE status = 'FAILED' AND "nextAttemptAt" IS NOT NULL AND "nextAttemptAt" <= now()`;
  }

  async tick(): Promise<TickResult> {
    if (await isEmergencyStopped(this.db)) return { kind: 'stopped' };
    await this.recover();
    await this.promote();

    const task = await this.db.task.findFirst({
      where: { status: 'QUEUED', agent: { enabled: true }, agentId: { in: [...this.agents.keys()] } },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
    if (!task) return { kind: 'idle' };

    const runId = randomUUID();
    const token = await acquireLock(this.db, runId, this.workerId, this.leaseSec);
    if (token === null) return { kind: 'busy' };

    try {
      // Re-check under the lock: stop flag + task still queued (another worker may have taken it before us).
      if (await isEmergencyStopped(this.db)) return { kind: 'stopped' };
      const claimed = await this.db.task.updateMany({
        where: { id: task.id, status: 'QUEUED' },
        data: { status: 'RUNNING', attempts: { increment: 1 }, startedAt: new Date() },
      });
      if (claimed.count === 0) return { kind: 'busy' };
      return await this.execute(task.id, runId, token);
    } finally {
      await releaseLock(this.db, runId, token);
    }
  }

  private async execute(taskId: string, runId: string, token: bigint): Promise<TickResult> {
    const task = await this.db.task.findUniqueOrThrow({ where: { id: taskId } });
    const agent = this.agents.get(task.agentId)!;
    const timeoutSec = agent.timeoutSec ?? 600;
    await this.db.taskRun.create({ data: { id: runId, taskId, agentId: task.agentId, attempt: task.attempts, workerId: this.workerId, lockToken: token } });
    await audit(this.db, `system:${this.workerId}`, 'task.started', { entity: 'task', entityId: taskId, brandId: task.brandId, data: { runId, agent: task.agentId, attempt: task.attempts, lockToken: token } });

    const ac = new AbortController();
    let abortReason = '';
    const abort = (why: string) => { if (!ac.signal.aborted) { abortReason = why; ac.abort(new Error(why)); } };
    const timer = setTimeout(() => abort(`timeout after ${timeoutSec}s`), timeoutSec * 1000);
    const heartbeat = setInterval(async () => {
      try {
        if (await isEmergencyStopped(this.db)) return abort('emergency stop');
        if (!(await renewLock(this.db, runId, token, this.leaseSec))) abort('lock lease lost');
      } catch (e) { abort(`heartbeat error: ${(e as Error).message}`); }
    }, Math.max(1000, (this.leaseSec * 1000) / 3));

    const aborted = new Promise<never>((_, rej) => ac.signal.addEventListener('abort', () => rej(ac.signal.reason), { once: true }));
    try {
      const result = await Promise.race([
        agent.run({
          taskId, agentId: task.agentId, contentProjectId: task.contentProjectId, runId, brandId: task.brandId, input: task.input as Json, signal: ac.signal,
          log: (message, data) => audit(this.db, `agent:${task.agentId}`, 'agent.log', { entity: 'task', entityId: taskId, data: { message, ...data } }),
        }),
        aborted,
      ]);
      // Fencing: only commit if we still hold the lock with our token.
      if (!(await renewLock(this.db, runId, token, this.leaseSec))) throw new Error('lock lease lost before commit');

      const needsApproval = agent.requiresApprovalAfter ?? false;
      await this.db.$transaction([
        this.db.taskRun.update({ where: { id: runId }, data: {
          status: 'SUCCEEDED', output: result.output as never, finishedAt: new Date(),
          costUsd: result.costUsd ?? 0, tokensIn: result.tokensIn ?? 0, tokensOut: result.tokensOut ?? 0 } }),
        this.db.task.update({ where: { id: taskId }, data: {
          status: needsApproval ? 'AWAITING_APPROVAL' : 'COMPLETED', output: result.output as never,
          completedAt: needsApproval ? null : new Date(), lastError: null } }),
        ...(needsApproval ? [this.db.approval.create({ data: {
          brandId: task.brandId, taskId, type: task.type, subjectRef: `task:${taskId}`,
          contentHash: hashJson(result.output) } })] : []),
      ]);
      await audit(this.db, `agent:${task.agentId}`, needsApproval ? 'task.awaiting_approval' : 'task.completed', { entity: 'task', entityId: taskId, brandId: task.brandId, data: { runId } });
      return { kind: 'ran', taskId, runId, outcome: needsApproval ? 'awaiting_approval' : 'succeeded' };
    } catch (e) {
      if (e instanceof DeferError && !abortReason) {
        // Not a failure: pause the task (attempt not consumed) and free the lock for other work.
        await this.db.$transaction([
          this.db.taskRun.update({ where: { id: runId }, data: { status: 'DEFERRED', error: e.message, finishedAt: new Date() } }),
          this.db.task.update({ where: { id: taskId }, data: { status: e.waitFor === 'human' ? 'WAITING_HUMAN' : 'WAITING_AI', attempts: { decrement: 1 } } }),
        ]);
        await audit(this.db, `agent:${task.agentId}`, `task.waiting_${e.waitFor}`, { entity: 'task', entityId: taskId, data: { runId, ref: e.ref } });
        return { kind: 'ran', taskId, runId, outcome: 'deferred' };
      }
      const msg = abortReason || (e as Error).message || String(e);
      const isAbort = !!abortReason && abortReason !== `timeout after ${timeoutSec}s`;
      await this.db.taskRun.update({ where: { id: runId }, data: {
        status: isAbort ? 'ABORTED' : abortReason ? 'TIMED_OUT' : 'FAILED', error: msg, finishedAt: new Date() } });
      if (abortReason === 'emergency stop') {
        await this.db.task.update({ where: { id: taskId }, data: { status: 'QUEUED', attempts: { decrement: 1 }, lastError: msg } });
        await audit(this.db, `system:${this.workerId}`, 'task.aborted', { entity: 'task', entityId: taskId, data: { runId, reason: msg } });
        return { kind: 'ran', taskId, runId, outcome: 'aborted' };
      }
      const fresh = await this.db.task.findUniqueOrThrow({ where: { id: taskId } });
      const dead = await this.failTask(taskId, fresh.attempts, fresh.maxAttempts, msg);
      return { kind: 'ran', taskId, runId, outcome: dead ? 'dead' : 'failed' };
    } finally {
      clearTimeout(timer);
      clearInterval(heartbeat);
    }
  }

  /** Schedules a retry with exponential backoff, or dead-letters the task. Returns true if dead. */
  private async failTask(taskId: string, attempts: number, maxAttempts: number, error: string): Promise<boolean> {
    const dead = attempts >= maxAttempts;
    const delay = this.retryBaseSec * 2 ** Math.max(0, attempts - 1);
    await this.db.task.update({ where: { id: taskId }, data: {
      status: dead ? 'DEAD' : 'FAILED', lastError: error,
      nextAttemptAt: dead ? null : new Date(Date.now() + delay * 1000) } });
    await audit(this.db, `system:${this.workerId}`, dead ? 'task.dead' : 'task.failed', { entity: 'task', entityId: taskId, data: { error, attempts, retryInSec: dead ? null : delay } });
    return dead;
  }

  /** Long-running loop for the worker process. */
  async runForever(opts: { idleMs?: number; signal?: AbortSignal } = {}) {
    const idleMs = opts.idleMs ?? 2000;
    while (!opts.signal?.aborted) {
      const r = await this.tick().catch((e) => { console.error('[engine] tick error', e); return { kind: 'idle' } as TickResult; });
      if (r.kind !== 'ran') await new Promise((res) => setTimeout(res, idleMs));
    }
  }
}

import { createHash } from 'node:crypto';
/** Canonical JSON (object keys sorted recursively) so a value hashes the same after a Postgres jsonb round trip. */
export const canonicalJson = (v: unknown): string => JSON.stringify(v, (_k, x) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]])) : x);
export const hashJson = (v: unknown) => createHash('sha256').update(canonicalJson(v)).digest('hex');
