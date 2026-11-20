import type { PrismaClient } from '@creatoros/db';
import type { Json } from '@creatoros/core';
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

export interface Plan { topic: string; language: string; durationSec: number; platforms: PlatformId[] }

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
  const language = /english/i.test(text) ? 'en' : 'ur';
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
  const plan = planInstruction(text);
  const actor = opts.actor ?? 'user:owner';
  const active = plan.platforms.filter((p) => PLATFORMS[p].status === 'active');
  const skipped = plan.platforms.filter((p) => PLATFORMS[p].status !== 'active');

  return db.$transaction(async (tx) => {
    // 001 is the hand-made pilot (content/001-volcanoes), so system projects start at 002.
    const num = String((await tx.contentProject.count()) + 2).padStart(3, '0');
    const ascii = plan.topic.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const project = await tx.contentProject.create({ data: {
      brandId: opts.brandId, key: `p${num}`, slug: `${num}-${ascii || 'video'}`, title: plan.topic, language: plan.language, params: plan as never } });
    const root = await tx.task.create({ data: {
      contentProjectId: project.id, brandId: opts.brandId, agentId: 'orchestrator', type: 'workflow:long_form_video',
      input: { instruction: text, plan } as never, status: 'COMPLETED', completedAt: new Date(),
      output: { production: PRODUCTION_STEPS.map((s) => s.key), platforms: active, skipped } as never } });
    let ids = await createSteps(tx, PRODUCTION_STEPS, { projectId: project.id, rootId: root.id, brandId: opts.brandId, priorityBase: 100 });
    for (const [n, p] of active.entries()) {
      ids = await createSteps(tx, PLATFORMS[p].steps, { projectId: project.id, rootId: root.id, brandId: opts.brandId, existing: ids, priorityBase: 200 + n * 10 });
    }
    await tx.auditLog.create({ data: { actor, action: 'workflow.created', entity: 'task', entityId: root.id, brandId: opts.brandId,
      data: { plan, active, skipped, steps: ids } as never } });
    return { rootTaskId: root.id, contentProjectId: project.id, slug: project.slug, params: plan, platforms: active, skipped, taskIds: ids };
  });
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

