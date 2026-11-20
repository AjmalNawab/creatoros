import type { AgentDefinition } from '@creatoros/core';

/**
 * The Main Agent (orchestrator). It never does production work itself: it turns an instruction
 * into a workflow (see orchestrator.ts) whose tasks are executed by the department agents.
 * Its own tasks are the workflow roots, created already COMPLETED with the plan as output.
 */
export const MAIN_AGENT: AgentDefinition = {
  id: 'orchestrator', name: 'Main Agent (Orchestrator)', department: 'Main', timeoutSec: 30,
  run: async (ctx) => ({ output: { note: 'workflow root', input: ctx.input } }),
};
