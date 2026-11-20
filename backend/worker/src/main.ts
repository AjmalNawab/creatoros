import { getDb } from '@creatoros/db';
import { Engine, audit } from '@creatoros/core';
import { ALL_AGENTS } from '@creatoros/agents';

// CreatorOS worker: the only process that executes agents (one at a time, under the global DB lock).
// Agents: Main (orchestrator) → Production (makes the video) → Platforms (youtube, facebook, …).
const AGENTS = ALL_AGENTS;

async function main() {
  const db = getDb();
  const engine = new Engine(db, { workerId: process.env.WORKER_ID });
  await engine.register(AGENTS);
  const recovered = await engine.recover();
  await audit(db, `system:${engine.workerId}`, 'worker.started', { data: { recovered, agents: AGENTS.map((a) => a.id) } });
  console.log(`[worker] ${engine.workerId} started with ${AGENTS.length} agents (recovered ${recovered} orphaned runs)`);

  const ac = new AbortController();
  const shutdown = (sig: string) => { console.log(`[worker] ${sig}: finishing current tick then exiting`); ac.abort(); };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  await engine.runForever({ signal: ac.signal });
  await audit(db, `system:${engine.workerId}`, 'worker.stopped');
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
