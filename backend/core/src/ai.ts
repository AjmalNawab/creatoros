import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PrismaClient } from '@creatoros/db';
import { audit } from './system';
import { DeferError, type AgentContext } from './types';

/**
 * Provider-agnostic AI access for agents.
 *
 * AI_PROVIDER=operator (default, $0): the request is stored in the AI queue and the task
 *   pauses (WAITING_AI). A human-supervised Claude Code session answers it via the `ai` CLI;
 *   the task is then re-queued and this call returns the (validated) answer.
 * AI_PROVIDER=anthropic: reserved for direct API calls (not enabled yet; owner chose $0).
 */
export interface AskOptions<T> {
  kind: string;                 // logical request name, e.g. "script"
  prompt: string;               // full instructions incl. required output format
  format: 'json' | 'text';
  /** Validate + transform the raw answer. Throw an Error with a helpful message to reject it. */
  validate: (raw: string) => T | Promise<T>;
  /** Folder where the prompt is mirrored as a readable file for the operator. */
  promptDir?: string;
}

export const provider = () => (process.env.AI_PROVIDER ?? 'operator') as 'operator' | 'anthropic';

export async function askAi<T>(db: PrismaClient, ctx: AgentContext, opts: AskOptions<T>): Promise<T> {
  if (provider() !== 'operator') throw new Error(`AI provider "${provider()}" is not configured yet`);

  const inputHash = createHash('sha256').update(JSON.stringify({ input: ctx.input, prompt: opts.prompt })).digest('hex').slice(0, 32);
  const existing = await db.aiRequest.findFirst({
    where: { taskId: ctx.taskId, kind: opts.kind, inputHash, status: { in: ['PENDING', 'ANSWERED'] } },
    orderBy: { createdAt: 'desc' },
  });

  if (existing?.status === 'ANSWERED' && existing.response != null) {
    try {
      const value = await opts.validate(existing.response);
      await db.aiRequest.update({ where: { id: existing.id }, data: { status: 'CONSUMED' } });
      await audit(db, `agent:${ctx.agentId}`, 'ai.consumed', { entity: 'ai_request', entityId: existing.id, data: { taskId: ctx.taskId, kind: opts.kind } });
      return value;
    } catch (e) {
      const error = (e as Error).message;
      await db.aiRequest.update({ where: { id: existing.id }, data: { status: 'REJECTED', error } });
      await audit(db, `agent:${ctx.agentId}`, 'ai.rejected', { entity: 'ai_request', entityId: existing.id, data: { error } });
      // Ask again, including why the previous answer was rejected.
      const retry = await createRequest(db, ctx, opts, inputHash,
        `${opts.prompt}\n\n---\nYOUR PREVIOUS ANSWER WAS REJECTED:\n${error}\nFix this and answer again.`);
      throw new DeferError('ai', retry.id);
    }
  }
  if (existing?.status === 'PENDING') throw new DeferError('ai', existing.id);

  const req = await createRequest(db, ctx, opts, inputHash, opts.prompt);
  throw new DeferError('ai', req.id);
}

async function createRequest<T>(db: PrismaClient, ctx: AgentContext, opts: AskOptions<T>, inputHash: string, prompt: string) {
  const req = await db.aiRequest.create({ data: {
    taskId: ctx.taskId, agentId: ctx.agentId, kind: opts.kind, inputHash, format: opts.format, prompt, provider: provider() } });
  if (opts.promptDir) {
    await mkdir(opts.promptDir, { recursive: true });
    await writeFile(path.join(opts.promptDir, `${opts.kind}-${req.id.slice(0, 8)}.prompt.md`), prompt);
  }
  await audit(db, `agent:${ctx.agentId}`, 'ai.requested', { entity: 'ai_request', entityId: req.id, data: { taskId: ctx.taskId, kind: opts.kind } });
  return req;
}

/** Operator submits an answer; the waiting task goes back to the queue. */
export async function answerAiRequest(db: PrismaClient, id: string, response: string, by: string) {
  const req = await db.aiRequest.findUniqueOrThrow({ where: { id } });
  if (req.status !== 'PENDING') throw new Error(`request ${id} is ${req.status}, not PENDING`);
  await db.$transaction([
    db.aiRequest.update({ where: { id }, data: { response, status: 'ANSWERED', answeredBy: by, answeredAt: new Date() } }),
    db.task.updateMany({ where: { id: req.taskId, status: 'WAITING_AI' }, data: { status: 'QUEUED' } }),
  ]);
  await audit(db, by, 'ai.answered', { entity: 'ai_request', entityId: id, data: { taskId: req.taskId, kind: req.kind, chars: response.length } });
}

/** Extracts a JSON value from a raw answer (tolerates ```json fences). */
export function parseJson(raw: string): unknown {
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  try { return JSON.parse((m ? m[1] : raw).trim()); }
  catch (e) { throw new Error(`Answer is not valid JSON: ${(e as Error).message}`); }
}
