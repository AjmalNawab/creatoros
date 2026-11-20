import { execSync } from 'node:child_process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaClient } from '@creatoros/db';
import { Engine, decideApproval, type AgentDefinition } from '@creatoros/core';
import { PLATFORMS, addPlatform, planInstruction, submitInstruction } from '../src';

// Own schema (core tests use creatoros_test) so packages can run tests in parallel.
const withSchema = (url: string) => url + (url.includes('?') ? '&' : '?') + 'schema=creatoros_test_agents';
const TEST_URL = withSchema(process.env.DATABASE_URL!);
const db = new PrismaClient({ datasources: { db: { url: TEST_URL } } });

beforeAll(() => {
  execSync('npx prisma migrate deploy', { cwd: `${__dirname}/../../database`, stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: TEST_URL, DIRECT_URL: withSchema(process.env.DIRECT_URL ?? process.env.DATABASE_URL!) } });
}, 120_000);
beforeEach(async () => {
  await db.$executeRawUnsafe(`TRUNCATE "AuditLog","Approval","AiRequest","HumanActionRequest","PlatformPost","TaskRun","TaskDependency","Task","ContentProject","Agent","SystemSetting","ExecutionLock" CASCADE`);
});
afterAll(() => db.$disconnect());

describe('Main Agent planning', () => {
  it('extracts topic, duration, language and platforms', () => {
    expect(planInstruction('Create a 2 minute Urdu video about volcanoes for YouTube')).toEqual({ topic: 'volcanoes', language: 'ur', durationSec: 120, platforms: ['youtube'] });
    expect(planInstruction('make a 1 minute video about how rainbows form').platforms).toEqual(['youtube']); // default
    expect(planInstruction('Create a video about rain for youtube and tiktok').platforms).toEqual(['youtube', 'tiktok']);
    expect(planInstruction('Create a video about rain for youtube and tiktok').topic).toBe('rain');
  });
});

describe('workflow: production → YouTube', () => {
  it('runs production then the YouTube agent, with approval gates at script, final video and package', async () => {
    const order: string[] = [];
    const approvalAfter = new Set(['script', 'qa', 'youtube.package']);
    const ids = ['orchestrator', 'research', 'script', 'voice', 'storyboard', 'visuals', 'video', 'qa', ...PLATFORMS.youtube.agents.map((a) => a.id)];
    const engine = new Engine(db, { workerId: 'w' });
    await engine.register(ids.map((id): AgentDefinition => ({ id, name: id, department: 'Test', requiresApprovalAfter: approvalAfter.has(id),
      run: async () => { order.push(id); return { output: { by: id } }; } })));

    const res = await submitInstruction(db, 'Create a 1 minute Urdu video about rainbows for YouTube and TikTok');
    expect(res.platforms).toEqual(['youtube']);
    expect(res.skipped).toEqual(['tiktok']);           // planned, not built yet

    const approveNext = async () => {
      const a = await db.approval.findFirstOrThrow({ where: { decision: 'PENDING' } });
      await decideApproval(db, a.id, 'APPROVED', 'user:owner');
    };
    const drain = async () => { for (let i = 0; i < 12; i++) await engine.tick(); };

    await drain(); expect(order).toEqual(['research', 'script']);
    await approveNext(); await drain();
    expect(order.slice(2)).toEqual(['voice', 'storyboard', 'visuals', 'video', 'qa']);
    await approveNext(); await drain();
    expect(order.at(-1)).toBe('youtube.package');
    await approveNext(); await drain();
    expect(order.at(-1)).toBe('youtube.publish');
    const project = await db.contentProject.findUniqueOrThrow({ where: { id: res.contentProjectId } });
    expect(project.slug).toBe('002-rainbows');
  }, 90_000);

  it('can add YouTube to an existing project once, and refuses planned platforms', async () => {
    const engine = new Engine(db, { workerId: 'w' });
    await engine.register(['orchestrator', 'research', 'script', 'voice', 'storyboard', 'visuals', 'video', 'qa', 'youtube.package', 'youtube.publish']
      .map((id): AgentDefinition => ({ id, name: id, department: 'Test', run: async () => ({ output: {} }) })));
    const res = await submitInstruction(db, 'Create a video about clouds for youtube');
    await expect(addPlatform(db, res.contentProjectId, 'youtube')).rejects.toThrow(/already/);
    await expect(addPlatform(db, res.contentProjectId, 'tiktok')).rejects.toThrow(/not available/);
  }, 30_000);
});
