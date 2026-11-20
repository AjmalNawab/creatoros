import type { AgentDefinition } from '../types';

/**
 * Phase 1 placeholder agents: same IDs/departments as the real ones, but they only
 * simulate work. They are replaced one by one in Phase 3 with real implementations.
 */
const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((res, rej) => {
    const t = setTimeout(res, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); rej(signal.reason); }, { once: true });
  });

const dummy = (id: string, name: string, department: string, extra: Partial<AgentDefinition> = {}): AgentDefinition => ({
  id, name, department, description: `${name} (placeholder)`, timeoutSec: 60, maxAttempts: 3,
  run: async (ctx) => {
    await ctx.log(`${name} started`);
    await sleep(1500, ctx.signal);
    return { output: { agent: id, note: 'placeholder output', input: ctx.input } };
  },
  ...extra,
});

export const PLACEHOLDER_AGENTS: AgentDefinition[] = [
  dummy('orchestrator', 'Main Orchestrator', 'Core'),
  dummy('research', 'Research Agent', 'Strategy & Research'),
  dummy('script', 'Script Writing Agent', 'Content Creation', { requiresApprovalAfter: true }),
  dummy('storyboard', 'Storyboard Agent', 'Content Creation'),
  dummy('voice', 'Voice Agent', 'Content Creation'),
  dummy('visuals', 'Visual Generation Agent', 'Content Creation'),
  dummy('video', 'Video Production Agent', 'Content Creation'),
  dummy('qa', 'Quality Assurance Agent', 'Compliance & Protection', { requiresApprovalAfter: true }),
];
