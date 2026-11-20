/**
 * Human/operator action CLI. Claude Code uses this for browser uploads etc.
 *   pnpm action list                    pending actions
 *   pnpm action show <id>               instructions + exact payload
 *   pnpm action complete <id> <json>    report the result, e.g. '{"url":"https://youtu.be/..."}'
 */
import { getDb } from '@creatoros/db';
import { completeHumanAction } from '@creatoros/core';

const db = getDb();
const [cmd, id, json] = process.argv.slice(2);

async function resolve(prefix: string) {
  const rows = await db.humanActionRequest.findMany({ where: { id: { startsWith: prefix } }, take: 2 });
  if (rows.length !== 1) throw new Error(rows.length ? `ambiguous id ${prefix}` : `no action ${prefix}`);
  return rows[0];
}

async function main() {
  if (!cmd || cmd === 'list') {
    const rows = await db.humanActionRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } });
    if (!rows.length) return console.log('No pending actions.');
    for (const r of rows) console.log(`${r.id.slice(0, 8)}  ${r.kind.padEnd(16)} ${r.title}`);
  } else if (cmd === 'show') {
    const r = await resolve(id);
    console.log(`# ${r.title}\n(${r.id}, ${r.status})\n\n${r.instructions}\n\n## Payload\n${JSON.stringify(r.payload, null, 2)}`);
  } else if (cmd === 'complete') {
    const r = await resolve(id);
    await completeHumanAction(db, r.id, JSON.parse(json ?? '{}'), 'operator:claude-code');
    console.log(`completed ${r.id.slice(0, 8)} (${r.kind}); task re-queued`);
  } else throw new Error(`unknown command ${cmd}`);
}
main().then(() => db.$disconnect(), async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1); });
