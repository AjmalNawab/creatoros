import type { PrismaClient } from '@creatoros/db';
import { audit } from '@creatoros/core';
import { getDefaultBrand, profileOf } from '../strategy/brand';
import { PLATFORMS, type PlatformId } from '../platforms';

/**
 * Main Agent planning. It never free-plans: an instruction maps to the production template
 * plus the steps of each requested platform (rule-based now; an LLM planner later).
 */
export interface WorkflowStep {
  key: string;
  agentId: string;
  type: string;
  dependsOn?: string[];
}

/** Production department: makes the master video once. */
export const PRODUCTION_STEPS: WorkflowStep[] = [
  { key: 'research', agentId: 'research', type: 'research_report' },
  { key: 'script', agentId: 'script', type: 'script', dependsOn: ['research'] },
  { key: 'voice', agentId: 'voice', type: 'narration', dependsOn: ['script'] },
  { key: 'storyboard', agentId: 'storyboard', type: 'storyboard', dependsOn: ['voice'] },
  { key: 'visuals', agentId: 'visuals', type: 'visuals', dependsOn: ['storyboard'] },
  { key: 'assembly', agentId: 'video', type: 'video', dependsOn: ['visuals'] },
  { key: 'qa', agentId: 'qa', type: 'final_video', dependsOn: ['assembly'] },
];

export interface Plan {
  topic: string; language: string; durationSec: number; platforms: PlatformId[];
  // Set when the project comes from a selected strategy idea:
  angle?: string; audience?: string; keywords?: string[]; titleHint?: string; ideaId?: string;
}

export function planInstruction(text: string): Plan {
  const minutes = Number(text.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:min|minute|منٹ)/i)?.[1] ?? 2);
  const all = Object.keys(PLATFORMS) as PlatformId[];
  const mentioned = /\ball (platforms|socials)\b/i.test(text) ? all
    : all.filter((p) => new RegExp(`\\b${p}\\b`, 'i').test(text) || (p === 'youtube' && /\byt\b|shorts/i.test(text)));
  const platformWords = all.join('|');
  const topic = text
    .replace(/^(please\s+)?(create|make|produce|generate)\s+/i, '')
    .replace(new RegExp(`\\b(for|on|to)\\s+(${platformWords})(\\s*(,|and|&)\\s*(${platformWords}))*\\b`, 'ig'), '')
    .replace(/^(an?\s+)?(\d+(\.\d+)?\s*-?\s*(min|minutes?)\s+)?((urdu|english)\s+)?((youtube|facebook|instagram|tiktok|linkedin)\s+)?(educational\s+)?(video|short|explainer|post)\s+(about|on)\s+/i, '')
    .replace(/\s+/g, ' ').trim() || text.trim();
  // Explicit language wins; otherwise the brand's language is applied in createContentWorkflow.
  const language = /english/i.test(text) ? 'en' : /urdu|اردو|[\u0600-\u06FF]/i.test(text) ? 'ur' : '';
  return { topic, language, durationSec: Math.round(minutes * 60), platforms: mentioned.length ? mentioned : ['youtube'] };
}

type Tx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

async function createSteps(tx: Tx, steps: WorkflowStep[], ctx: { projectId: string; rootId: string; brandId?: string | null; existing?: Record<string, string>; priorityBase: number }) {
  const ids: Record<string, string> = { ...ctx.existing };
  for (const [i, step] of steps.entries()) {
    const t = await tx.task.create({ data: {
      contentProjectId: ctx.projectId, brandId: ctx.brandId ?? undefined, parentTaskId: ctx.rootId, agentId: step.agentId, type: step.type,
      priority: ctx.priorityBase + i, status: step.dependsOn?.length ? 'PENDING' : 'QUEUED' } });
    ids[step.key] = t.id;
    for (const dep of step.dependsOn ?? []) await tx.taskDependency.create({ data: { taskId: t.id, dependsOnId: ids[dep] } });
  }
  return ids;
}

/** Instruction → content project + production workflow + platform workflows. */
export async function submitInstruction(db: PrismaClient, text: string, opts: { brandId?: string; actor?: string } = {}) {
  const brandId = opts.brandId ?? (await getDefaultBrand(db)).id;
  return createContentWorkflow(db, planInstruction(text), { brandId, actor: opts.actor, instruction: text });
}

/** Plan → content project + production steps + active platform steps (one transaction). */
export async function createContentWorkflow(db: PrismaClient, plan: Plan, opts: { brandId: string; actor?: string; instruction?: string }) {
  const actor = opts.actor ?? 'user:owner';
  if (!plan.language) {
    const brand = await db.brand.findUniqueOrThrow({ where: { id: opts.brandId } });
    plan = { ...plan, language: profileOf(brand).language };
  }
  const active = plan.platforms.filter((p) => PLATFORMS[p].status === 'active');
  const skipped = plan.platforms.filter((p) => PLATFORMS[p].status !== 'active');
  const brandId = opts.brandId;

  return db.$transaction(async (tx) => {
    // 001 is the hand-made pilot (content/001-volcanoes), so system projects start at 002.
    const num = String((await tx.contentProject.count()) + 2).padStart(3, '0');
    const ascii = plan.topic.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const project = await tx.contentProject.create({ data: {
      brandId, key: `p${num}`, slug: `${num}-${ascii || 'video'}`, title: plan.titleHint ?? plan.topic, language: plan.language, params: plan as never } });
    const root = await tx.task.create({ data: {
      contentProjectId: project.id, brandId, agentId: 'orchestrator', type: 'workflow:long_form_video',
      input: { instruction: opts.instruction ?? null, plan } as never, status: 'COMPLETED', completedAt: new Date(),
      output: { production: PRODUCTION_STEPS.map((s) => s.key), platforms: active, skipped } as never } });
    let ids = await createSteps(tx, PRODUCTION_STEPS, { projectId: project.id, rootId: root.id, brandId, priorityBase: 100 });
    for (const [n, p] of active.entries()) {
      ids = await createSteps(tx, PLATFORMS[p].steps, { projectId: project.id, rootId: root.id, brandId, existing: ids, priorityBase: 200 + n * 10 });
    }
    await tx.auditLog.create({ data: { actor, action: 'workflow.created', entity: 'task', entityId: root.id, brandId,
      data: { plan, active, skipped, steps: ids } as never } });
    return { rootTaskId: root.id, contentProjectId: project.id, slug: project.slug, params: plan, platforms: active, skipped, taskIds: ids };
  });
}

/** Strategy round: trends → ideas (proposed to the owner; nothing is produced until one is selected). */
export async function submitIdeation(db: PrismaClient, opts: { brandId?: string; count?: number; focus?: string; actor?: string } = {}) {
  const brandId = opts.brandId ?? (await getDefaultBrand(db)).id;
  const input = { count: opts.count ?? 5, focus: opts.focus ?? null };
  return db.$transaction(async (tx) => {
    const root = await tx.task.create({ data: { brandId, agentId: 'orchestrator', type: 'workflow:ideation', input: input as never,
      status: 'COMPLETED', completedAt: new Date(), output: { steps: ['trends', 'ideas'] } as never } });
    const t = await tx.task.create({ data: { brandId, parentTaskId: root.id, agentId: 'trends', type: 'trends_report', input: input as never, priority: 50, status: 'QUEUED' } });
    const i = await tx.task.create({ data: { brandId, parentTaskId: root.id, agentId: 'ideas', type: 'ideas', input: input as never, priority: 51, status: 'PENDING' } });
    await tx.taskDependency.create({ data: { taskId: i.id, dependsOnId: t.id } });
    await tx.auditLog.create({ data: { actor: opts.actor ?? 'user:owner', action: 'workflow.ideation_created', entity: 'task', entityId: root.id, brandId, data: input as never } });
    return { rootTaskId: root.id, trendsTaskId: t.id, ideasTaskId: i.id };
  });
}

/** Owner picks an idea → it becomes a content project with its angle/audience carried into research and script. */
export async function selectIdea(db: PrismaClient, ideaId: string, opts: { actor?: string; platforms?: PlatformId[] } = {}) {
  const idea = await db.idea.findUniqueOrThrow({ where: { id: ideaId } });
  if (idea.status !== 'PROPOSED') throw new Error(`idea is already ${idea.status}`);
  const plan: Plan = {
    topic: idea.topic, language: '', durationSec: idea.durationSec,
    platforms: opts.platforms ?? (idea.platforms as PlatformId[]),
    angle: idea.angle, audience: idea.audience, keywords: idea.keywords as string[], titleHint: idea.title, ideaId: idea.id,
  };
  const res = await createContentWorkflow(db, plan, { brandId: idea.brandId ?? (await getDefaultBrand(db)).id, actor: opts.actor });
  await db.idea.update({ where: { id: ideaId }, data: { status: 'SELECTED', contentProjectId: res.contentProjectId, decidedAt: new Date() } });
  await audit(db, opts.actor ?? 'user:owner', 'idea.selected', { entity: 'idea', entityId: ideaId, data: { contentProjectId: res.contentProjectId } });
  return res;
}

export async function rejectIdea(db: PrismaClient, ideaId: string, feedback: string | undefined, actor = 'user:owner') {
  await db.idea.update({ where: { id: ideaId }, data: { status: 'REJECTED', feedback, decidedAt: new Date() } });
  await audit(db, actor, 'idea.rejected', { entity: 'idea', entityId: ideaId, data: { feedback } });
}

/** Adds a platform's publishing steps to an existing content project (e.g. "also post this to YouTube"). */
export async function addPlatform(db: PrismaClient, contentProjectId: string, platform: PlatformId, actor = 'user:owner') {
  const mod = PLATFORMS[platform];
  if (!mod || mod.status !== 'active') throw new Error(`${platform} is not available yet`);
  return db.$transaction(async (tx) => {
    const qa = await tx.task.findFirst({ where: { contentProjectId, agentId: 'qa' }, orderBy: { createdAt: 'desc' } });
    const root = await tx.task.findFirst({ where: { contentProjectId, agentId: 'orchestrator' } });
    if (!qa || !root) throw new Error('project has no production workflow');
    const already = await tx.task.findFirst({ where: { contentProjectId, agentId: mod.steps[0].agentId, status: { not: 'CANCELLED' } } });
    if (already) throw new Error(`${platform} is already part of this project`);
    const ids = await createSteps(tx, mod.steps, { projectId: contentProjectId, rootId: root.id, existing: { qa: qa.id }, priorityBase: 300 });
    await tx.auditLog.create({ data: { actor, action: 'workflow.platform_added', entity: 'content', entityId: contentProjectId, data: { platform, steps: ids } as never } });
    return ids;
  });
}

