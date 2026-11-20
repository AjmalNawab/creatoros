export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export interface AgentContext {
  taskId: string;
  agentId: string;
  contentProjectId: string | null;
  runId: string;
  brandId: string | null;
  input: Json;
  /** Aborted on timeout, lost lease or emergency stop. Handlers must stop promptly. */
  signal: AbortSignal;
  log: (message: string, data?: Record<string, unknown>) => Promise<void>;
}

export interface AgentResult {
  output: Json;
  costUsd?: number;
  tokensIn?: number;
  tokensOut?: number;
}

export interface AgentDefinition {
  id: string;
  name: string;
  department: string;
  description?: string;
  timeoutSec?: number;
  maxAttempts?: number;
  requiresApprovalAfter?: boolean;
  run: (ctx: AgentContext) => Promise<AgentResult>;
}

export type TickResult =
  | { kind: 'stopped' }
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ran'; taskId: string; runId: string; outcome: 'succeeded' | 'failed' | 'dead' | 'awaiting_approval' | 'aborted' | 'deferred' };

/** Thrown by an agent to pause until an external dependency (e.g. an AI answer) is ready. Not a failure. */
export class DeferError extends Error {
  constructor(public readonly waitFor: 'ai' | 'human', public readonly ref: string, message?: string) {
    super(message ?? `waiting for ${waitFor} (${ref})`);
    this.name = 'DeferError';
  }
}
