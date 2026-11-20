import type { PrismaClient } from '@creatoros/db';
import { hashJson } from './engine';
import { audit } from './system';

/** Human decision on an approval; on approve the task completes and dependants can proceed. */
export async function decideApproval(db: PrismaClient, approvalId: string, decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', by: string, feedback?: string) {
  const a = await db.approval.update({ where: { id: approvalId }, data: { decision, decidedBy: by, feedback, decidedAt: new Date() } });
  if (a.taskId) {
    if (decision === 'APPROVED') {
      const t = await db.task.update({ where: { id: a.taskId }, data: { status: 'COMPLETED', completedAt: new Date() } });
      if (t.type === 'final_video' && t.contentProjectId) {
        await db.contentProject.update({ where: { id: t.contentProjectId }, data: { status: 'approved' } });
      }
    } else {
      // Rejected / changes requested: back to the agent with feedback as a new attempt.
      const t = await db.task.findUniqueOrThrow({ where: { id: a.taskId } });
      await db.task.update({ where: { id: a.taskId }, data: {
        status: 'QUEUED', input: { ...(t.input as object), feedback: feedback ?? decision } as never } });
    }
  }
  await audit(db, by, `approval.${decision.toLowerCase()}`, { entity: 'approval', entityId: approvalId, data: { taskId: a.taskId, feedback } });
  return a;
}

/**
 * Backend enforcement: is there an APPROVED approval for exactly this content (hash of the agent output)?
 * Publishing agents must call this immediately before any external action.
 */
export async function findValidApproval(db: PrismaClient, taskId: string, output: unknown) {
  return db.approval.findFirst({ where: { taskId, decision: 'APPROVED', contentHash: hashJson(output) }, orderBy: { decidedAt: 'desc' } });
}
