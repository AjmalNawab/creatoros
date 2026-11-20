import { execSync } from 'node:child_process';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PrismaClient } from '@creatoros/db';
import { Engine, answerAiRequest, decideApproval, type AgentDefinition } from '@creatoros/core';
import { PLATFORMS, STRATEGY_AGENTS, addPlatform, planInstruction, rejectIdea, selectIdea, submitIdeation, submitInstruction } from '../src';

// Own schema (core tests use creatoros_test) so packages can run tests in parallel.
const withSchema = (url: string) => url + (url.includes('?') ? '&' : '?') + 'schema=creatoros_test_agents';
const TEST_URL = withSchema(process.env.DATABASE_URL!);
const db = new PrismaClient({ datasources: { db: { url: TEST_URL } } });
// Real agents use the shared getDb() client: point it at the test schema too (it is created lazily).
process.env.DATABASE_URL = TEST_URL;

beforeAll(() => {
  execSync('npx prisma migrate deploy', { cwd: `${__dirname}/../../database`, stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: TEST_URL, DIRECT_URL: withSchema(process.env.DIRECT_URL ?? process.env.DATABASE_URL!) } });
}, 120_000);
beforeEach(async () => {
  await db.$executeRawUnsafe(`TRUNCATE "AuditLog","Approval","AiRequest","HumanActionRequest","PlatformPost","TaskRun","TaskDependency","Task","ContentProject","Idea","Brand","Agent","SystemSetting","ExecutionLock" CASCADE`);
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

describe('strategy: trends → ideas → owner picks one', () => {
  it('proposes ranked ideas from cited trends, and a selected idea becomes a project carrying its angle', async () => {
    const engine = new Engine(db, { workerId: 'w' });
    await engine.register([{ id: 'orchestrator', name: 'o', department: 'Main', run: async () => ({ output: {} }) }, ...STRATEGY_AGENTS,
      ...['research', 'script', 'voice', 'storyboard', 'visuals', 'video', 'qa', 'youtube.package', 'youtube.publish']
        .map((id): AgentDefinition => ({ id, name: id, department: 'Test', run: async () => ({ output: {} }) }))]);
    const r = await submitIdeation(db, { count: 3, focus: 'space' });

    await engine.tick();                                    // trends → WAITING_AI
    const tReq = await db.aiRequest.findFirstOrThrow({ where: { kind: 'trends', status: 'PENDING' } });
    expect(tReq.prompt).toContain('Owner focus for this round: space');
    await answerAiRequest(db, tReq.id, JSON.stringify({ trends: Array.from({ length: 5 }, (_, i) => ({
      topic: `t${i}`, signal: 'search interest up', source: 'Google Trends PK', freshness: 'this_week', relevance: 4 })), notes: '' }), 'test');
    await engine.tick(); await engine.tick();               // trends completes; ideas → WAITING_AI
    const iReq = await db.aiRequest.findFirstOrThrow({ where: { kind: 'ideas', status: 'PENDING' } });
    const idea = (topic: string, score: number) => ({ title: `عنوان ${topic}`, topic, angle: 'Explained with a simple animated model',
      audience: 'Students 12-18', whyNow: 'Rising searches this week', evidence: [{ source: 'Google Trends PK', detail: '+300%' }],
      competition: 'Few Urdu videos, mostly low quality', keywords: ['a', 'b', 'c'], format: 'long', durationSec: 90, score });
    // First answer is invalid (2 ideas, min is 3) → rejected and re-asked with the error.
    await answerAiRequest(db, iReq.id, JSON.stringify({ ideas: [idea('x', 5), idea('y', 6)] }), 'test');
    await engine.tick();
    const retry = await db.aiRequest.findFirstOrThrow({ where: { kind: 'ideas', status: 'PENDING' } });
    expect(retry.prompt).toContain('YOUR PREVIOUS ANSWER WAS REJECTED');
    await answerAiRequest(db, retry.id, JSON.stringify({ ideas: [idea('black holes', 7), idea('auroras', 9), idea('comets', 4)] }), 'test');
    await engine.tick();

    const ideas = await db.idea.findMany({ where: { taskId: r.ideasTaskId }, orderBy: { rank: 'asc' } });
    expect(ideas.map((i) => [i.topic, i.rank])).toEqual([['auroras', 1], ['black holes', 2], ['comets', 3]]);
    expect(await db.contentProject.count()).toBe(0);        // nothing produced before the owner chooses

    await rejectIdea(db, ideas[2].id, 'too similar to last week');
    const sel = await selectIdea(db, ideas[0].id);
    const project = await db.contentProject.findUniqueOrThrow({ where: { id: sel.contentProjectId } });
    expect(project.params).toMatchObject({ topic: 'auroras', angle: 'Explained with a simple animated model', audience: 'Students 12-18', durationSec: 90 });
    expect((await db.idea.findUniqueOrThrow({ where: { id: ideas[0].id } })).status).toBe('SELECTED');
    await expect(selectIdea(db, ideas[0].id)).rejects.toThrow(/already/);
  }, 90_000);
});
