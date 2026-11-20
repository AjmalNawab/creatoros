import type { PrismaClient } from '@creatoros/db';
import { audit } from './system';
import type { Json } from './types';

/**
 * Workflow templates: the Main Orchestrator never free-plans. It picks a template
 * and fills its parameters (later via an LLM; for now via simple rules).
 */
export interface WorkflowStep {
  key: string;
  agentId: string;
  type: string;
  dependsOn?: string[];
  input?: (params: Record<string, Json>) => Json;
}
export interface WorkflowTemplate {
  id: string;
  description: string;
  steps: WorkflowStep[];
}

export const TEMPLATES: Record<string, WorkflowTemplate> = {
  long_form_video: {
    id: 'long_form_video',
    description: 'Topic → research → script (approval) → voice → storyboard → visuals → video → QA (final approval)',
    steps: [
      { key: 'research', agentId: 'research', type: 'research_report' },
      { key: 'script', agentId: 'script', type: 'script', dependsOn: ['research'] },
      { key: 'voice', agentId: 'voice', type: 'narration', dependsOn: ['script'] },
      { key: 'storyboard', agentId: 'storyboard', type: 'storyboard', dependsOn: ['voice'] },
      { key: 'visuals', agentId: 'visuals', type: 'visuals', dependsOn: ['storyboard'] },
      { key: 'assembly', agentId: 'video', type: 'video', dependsOn: ['visuals'] },
      { key: 'qa', agentId: 'qa', type: 'final_video', dependsOn: ['assembly'] },
    ],
  },
};

/** Phase 1 rule-based intent → template. Replaced by an LLM planner in a later phase. */
export function planInstruction(text: string): { templateId: string; params: Record<string, Json> } {
  const minutes = Number(text.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:min|minute|منٹ)/i)?.[1] ?? 2);
  const topic = text
    .replace(/^(please\s+)?(create|make|produce|generate)\s+/i, '')
    .replace(/^(an?\s+)?(\d+(\.\d+)?\s*-?\s*(min|minutes?)\s+)?((urdu|english)\s+)?(educational\s+)?(video|short|explainer)\s+(about|on)\s+/i, '')
    .trim() || text.trim();
  const language = /urdu|اردو|[؀-ۿ]/i.test(text) ? 'ur' : 'en';
  return { templateId: 'long_form_video', params: { topic, language, durationSec: Math.round(minutes * 60) } };
}

/** Creates a content workflow: one root task plus step tasks wired with dependencies. */
export async function submitInstruction(db: PrismaClient, text: string, opts: { brandId?: string; actor?: string } = {}) {
  const { templateId, params } = planInstruction(text);
  const tpl = TEMPLATES[templateId];
  const actor = opts.actor ?? 'user:owner';

  return db.$transaction(async (tx) => {
    // Content project: content/<NNN-slug>/ and renderer key pNNN.
    // 001 is the hand-made pilot (content/001-volcanoes), so system projects start at 002.
    const num = String((await tx.contentProject.count()) + 2).padStart(3, '0');
    const ascii = String(params.topic).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const projectRow = await tx.contentProject.create({ data: {
      brandId: opts.brandId, key: `p${num}`, slug: `${num}-${ascii || 'video'}`, title: String(params.topic),
      language: String(params.language), params: params as never } });
    const root = await tx.task.create({ data: {
      contentProjectId: projectRow.id, brandId: opts.brandId, agentId: 'orchestrator', type: `workflow:${templateId}`,
      input: { instruction: text, params } as never, status: 'COMPLETED', completedAt: new Date(),
      output: { plan: tpl.steps.map((s) => s.key) } as never } });
    const ids: Record<string, string> = {};
    for (const [i, step] of tpl.steps.entries()) {
      const t = await tx.task.create({ data: {
        contentProjectId: projectRow.id, brandId: opts.brandId, parentTaskId: root.id, agentId: step.agentId, type: step.type,
        input: (step.input?.(params) ?? {}) as never, priority: 100 + i,
        status: step.dependsOn?.length ? 'PENDING' : 'QUEUED' } });
      ids[step.key] = t.id;
      for (const dep of step.dependsOn ?? []) {
        await tx.taskDependency.create({ data: { taskId: t.id, dependsOnId: ids[dep] } });
      }
    }
    await tx.auditLog.create({ data: { actor, action: 'workflow.created', entity: 'task', entityId: root.id,
      brandId: opts.brandId, data: { templateId, params, steps: ids } as never } });
    return { rootTaskId: root.id, contentProjectId: projectRow.id, slug: projectRow.slug, templateId, params, taskIds: ids };
  });
}

/** Human decision on an approval; on approve, the task completes and dependants can proceed. */
export async function decideApproval(db: PrismaClient, approvalId: string, decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', by: string, feedback?: string) {
  const a = await db.approval.update({ where: { id: approvalId }, data: { decision, decidedBy: by, feedback, decidedAt: new Date() } });
  if (a.taskId) {
    if (decision === 'APPROVED') {
      const t = await db.task.update({ where: { id: a.taskId }, data: { status: 'COMPLETED', completedAt: new Date() } });
      if (t.type === 'final_video' && t.contentProjectId) {
        await db.contentProject.update({ where: { id: t.contentProjectId }, data: { status: 'approved' } });
      }
    } else {
      // Rejected / changes requested: send back to the agent with feedback as a new attempt.
      const t = await db.task.findUniqueOrThrow({ where: { id: a.taskId } });
      await db.task.update({ where: { id: a.taskId }, data: {
        status: 'QUEUED', input: { ...(t.input as object), feedback: feedback ?? decision } as never } });
    }
  }
  await audit(db, by, `approval.${decision.toLowerCase()}`, { entity: 'approval', entityId: approvalId, data: { taskId: a.taskId, feedback } });
  return a;
}
