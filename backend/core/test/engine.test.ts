import { execSync } from 'node:child_process';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@creatoros/db';
import { Engine, acquireLock, getLock, setEmergencyStop, type AgentDefinition } from '../src';

// Isolated schema so tests never touch real data.
const withSchema = (url: string) => url + (url.includes('?') ? '&' : '?') + 'schema=creatoros_test';
const TEST_URL = withSchema(process.env.DATABASE_URL!);
const TEST_DIRECT = withSchema(process.env.DIRECT_URL ?? process.env.DATABASE_URL!);
const db = new PrismaClient({ datasources: { db: { url: TEST_URL } } });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeAll(() => {
  // Non-destructive: applies migrations to the isolated test schema (creates it if missing).
  execSync('npx prisma migrate deploy', {
    cwd: `${__dirname}/../../database`, stdio: 'pipe', env: { ...process.env, DATABASE_URL: TEST_URL, DIRECT_URL: TEST_DIRECT },
  });
}, 120_000);

beforeEach(async () => {
  await db.$executeRawUnsafe(`TRUNCATE "AuditLog","Approval","AiRequest","HumanActionRequest","PlatformPost","TaskRun","TaskDependency","Task","ContentProject","Idea","Brand","Agent","SystemSetting","ExecutionLock" CASCADE`);
});
afterAll(() => db.$disconnect());

/** Agent that tracks how many runs are active at once across all engines. */
function concurrencyProbe() {
  const state = { active: 0, max: 0, done: 0 };
  const def: AgentDefinition = {
    id: 'probe', name: 'Probe', department: 'Test', timeoutSec: 30,
    run: async () => { state.active++; state.max = Math.max(state.max, state.active); await sleep(300); state.active--; state.done++; return { output: { ok: true } }; },
  };
  return { state, def };
}

async function queue(agentId: string, n: number, extra: Record<string, unknown> = {}) {
  for (let i = 0; i < n; i++) await db.task.create({ data: { agentId, type: 'test', status: 'QUEUED', ...extra } });
}

describe('global execution lock', () => {
  it('runs only ONE agent at a time even with 3 competing workers', async () => {
    const { state, def } = concurrencyProbe();
    const engines = ['w1', 'w2', 'w3'].map((w) => new Engine(db, { workerId: w, leaseSec: 10 }));
    for (const e of engines) await e.register([def]);
    await queue('probe', 6);

    const deadline = Date.now() + 40_000;
    await Promise.all(engines.map(async (e) => {
      while (state.done < 6 && Date.now() < deadline) {
        const r = await e.tick();
        if (r.kind !== 'ran') await sleep(50);
      }
    }));
    expect(state.done).toBe(6);
    expect(state.max).toBe(1);
    expect(await db.task.count({ where: { status: 'COMPLETED' } })).toBe(6);
    expect(await db.taskRun.count({ where: { status: 'SUCCEEDED' } })).toBe(6);
  }, 60_000);

  it('recovers after a crash: expired lease is taken over and the orphaned task is retried', async () => {
    const { def } = concurrencyProbe();
    const engine = new Engine(db, { workerId: 'survivor', leaseSec: 10, retryBaseSec: 0 });
    await engine.register([def]);
    const task = await db.task.create({ data: { agentId: 'probe', type: 'test', status: 'RUNNING', attempts: 1 } });
    // Simulate a worker that crashed mid-run: it holds the lock with a 1s lease and never releases.
    const token = await acquireLock(db, 'crashed-run', 'crashed-worker', 1);
    await db.taskRun.create({ data: { id: 'crashed-run', taskId: task.id, agentId: 'probe', attempt: 1, workerId: 'crashed-worker', lockToken: token! } });

    expect((await engine.tick()).kind).not.toBe('ran'); // lease still valid → busy/idle
    await sleep(1500);
    let r = await engine.tick();             // recovers orphan, schedules retry
    if (r.kind !== 'ran') r = await engine.tick();
    expect(r.kind).toBe('ran');
    const run = await db.taskRun.findUnique({ where: { id: 'crashed-run' } });
    expect(run?.status).toBe('ABORTED');
    expect((await db.task.findUnique({ where: { id: task.id } }))?.status).toBe('COMPLETED');
    expect((await getLock(db))?.holder).toBeNull();
    expect((await getLock(db))?.token).toBeGreaterThan(token!);
  }, 30_000);
});

describe('emergency stop', () => {
  it('prevents new runs and aborts the active run', async () => {
    const slow: AgentDefinition = { id: 'slow', name: 'Slow', department: 'Test', run: async (ctx) => {
      await new Promise((res, rej) => { const t = setTimeout(res, 10_000); ctx.signal.addEventListener('abort', () => { clearTimeout(t); rej(ctx.signal.reason); }); });
      return { output: {} };
    } };
    const engine = new Engine(db, { workerId: 'w', leaseSec: 3 });
    await engine.register([slow]);
    await queue('slow', 2);
    const running = engine.tick();
    await sleep(500);
    await setEmergencyStop(db, true, 'user:test');
    const r = await running;
    expect(r.kind === 'ran' && r.outcome).toBe('aborted');
    expect((await engine.tick()).kind).toBe('stopped');
    expect(await db.taskRun.count({ where: { status: 'ABORTED' } })).toBe(1);
    expect(await db.task.count({ where: { status: 'QUEUED' } })).toBe(2); // nothing lost
    expect((await getLock(db))?.holder).toBeNull();
  }, 30_000);
});

describe('retries and dead-letter', () => {
  it('retries a failing agent up to maxAttempts, then dead-letters it', async () => {
    let calls = 0;
    const flaky: AgentDefinition = { id: 'flaky', name: 'Flaky', department: 'Test', maxAttempts: 3, run: async () => { calls++; throw new Error('boom'); } };
    const engine = new Engine(db, { workerId: 'w', retryBaseSec: 0 });
    await engine.register([flaky]);
    await db.task.create({ data: { agentId: 'flaky', type: 'test', status: 'QUEUED', maxAttempts: 3 } });
    for (let i = 0; i < 6; i++) { await engine.tick(); await sleep(20); }
    const t = await db.task.findFirstOrThrow();
    expect(calls).toBe(3);
    expect(t.status).toBe('DEAD');
    expect(t.lastError).toBe('boom');
    expect(await db.taskRun.count({ where: { status: 'FAILED' } })).toBe(3);
  }, 30_000);
});
