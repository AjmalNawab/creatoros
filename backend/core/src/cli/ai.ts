/**
 * AI queue CLI (operator mode). Claude Code uses this to see and answer pending AI requests.
 *   pnpm ai list                 pending requests
 *   pnpm ai show <id>            full prompt (+ previous rejection, if any)
 *   pnpm ai answer <id> <file>   submit the answer from a file (JSON or TSX/text)
 */
import { readFile } from 'node:fs/promises';
import { getDb } from '@creatoros/db';
import { answerAiRequest } from '../ai';

const db = getDb();
const [cmd, id, file] = process.argv.slice(2);

async function resolveId(prefix: string) {
  const rows = await db.aiRequest.findMany({ where: { id: { startsWith: prefix } }, take: 2 });
  if (rows.length !== 1) throw new Error(rows.length ? `ambiguous id prefix ${prefix}` : `no AI request ${prefix}`);
  return rows[0];
}

async function main() {
  if (cmd === 'list' || !cmd) {
    const rows = await db.aiRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' },
      include: { task: { select: { contentProject: { select: { slug: true } } } } } });
    if (!rows.length) return console.log('AI queue is empty.');
    for (const r of rows) console.log(`${r.id.slice(0, 8)}  ${r.kind.padEnd(10)} ${r.format.padEnd(5)} ${r.task.contentProject?.slug ?? '-'}  ${r.createdAt.toISOString()}`);
  } else if (cmd === 'show') {
    const r = await resolveId(id);
    console.log(`# AI request ${r.id} (${r.kind}, ${r.format}, ${r.status})\n\n${r.prompt}`);
  } else if (cmd === 'answer') {
    if (!file) throw new Error('usage: answer <id> <file>');
    const r = await resolveId(id);
    await answerAiRequest(db, r.id, await readFile(file, 'utf8'), 'operator:claude-code');
    console.log(`answered ${r.id.slice(0, 8)} (${r.kind}); task re-queued`);
  } else throw new Error(`unknown command ${cmd}`);
}
main().then(() => db.$disconnect(), async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1); });
