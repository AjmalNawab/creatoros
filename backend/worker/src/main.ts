import { getDb } from '@creatoros/db';
import { CONTENT_AGENTS, Engine, PLACEHOLDER_AGENTS, audit } from '@creatoros/core';

// CreatorOS worker: the only process that executes agents (one at a time, under the global DB lock).
// Real content agents replace the placeholders; the orchestrator placeholder owns workflow root tasks.
const AGENTS = [...PLACEHOLDER_AGENTS.filter((a) => a.id === 'orchestrator'), ...CONTENT_AGENTS];

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
