import { createHash } from 'node:crypto';
import type { PrismaClient } from '@creatoros/db';
import { audit } from './system';
import { DeferError, type AgentContext, type Json } from './types';

/**
 * Human Action Handler (blueprint Rev 1.1). An agent that needs a person/operator to do something
 * (e.g. upload in the owner's Chrome via DevTools, solve a login) creates a request and pauses
 * (WAITING_HUMAN). When the action is completed with a result, the task is re-queued and
 * awaitHumanAction() returns that result on the next run.
 */
export interface HumanActionSpec {
  kind: string;
  title: string;
  instructions: string;   // markdown
  payload: Json;          // exactly what to use (approved package)
}

export async function awaitHumanAction<T = Json>(db: PrismaClient, ctx: AgentContext, spec: HumanActionSpec): Promise<T> {
  const inputHash = createHash('sha256').update(JSON.stringify({ input: ctx.input, payload: spec.payload })).digest('hex').slice(0, 32);
  const existing = await db.humanActionRequest.findFirst({
    where: { taskId: ctx.taskId, kind: spec.kind, inputHash, status: { in: ['PENDING', 'DONE'] } }, orderBy: { createdAt: 'desc' } });
  if (existing?.status === 'DONE') return existing.result as T;
  if (existing?.status === 'PENDING') throw new DeferError('human', existing.id);
  const req = await db.humanActionRequest.create({ data: {
    taskId: ctx.taskId, kind: spec.kind, inputHash, title: spec.title, instructions: spec.instructions, payload: spec.payload as never } });
  await audit(db, `agent:${ctx.agentId}`, 'human_action.requested', { entity: 'human_action', entityId: req.id, data: { taskId: ctx.taskId, kind: spec.kind } });
  throw new DeferError('human', req.id);
}

export async function completeHumanAction(db: PrismaClient, id: string, result: Json, by: string) {
  const req = await db.humanActionRequest.findUniqueOrThrow({ where: { id } });
  if (req.status !== 'PENDING') throw new Error(`action ${id} is ${req.status}, not PENDING`);
  await db.$transaction([
    db.humanActionRequest.update({ where: { id }, data: { status: 'DONE', result: result as never, completedBy: by, completedAt: new Date() } }),
    db.task.updateMany({ where: { id: req.taskId, status: 'WAITING_HUMAN' }, data: { status: 'QUEUED' } }),
  ]);
  await audit(db, by, 'human_action.completed', { entity: 'human_action', entityId: id, data: { taskId: req.taskId, kind: req.kind, result } });
}
