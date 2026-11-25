/**
 * Post engagement CLI (operator). Snapshots are append-only; omit a field when the platform doesn't show it.
 *   pnpm stats list                              every post with its latest numbers
 *   pnpm stats youtube                           fetch YouTube stats via the API (needs YOUTUBE_API_KEY)
 *   pnpm stats record <postId> '<json>'          e.g. '{"views":120,"likes":9,"comments":2,"shares":1,"reach":95}'
 */
import { getDb } from '@creatoros/db';
import { publishedOverview, recordPostMetric, refreshYouTubeMetrics } from '../platforms/metrics';

const db = getDb();
const [cmd, id, json] = process.argv.slice(2);
const ACTOR = 'operator:claude-code';
const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '–' : String(v));

async function main() {
  if (!cmd || cmd === 'list') {
    for (const g of await publishedOverview(db)) {
      console.log(`\n${g.project.slug}  ${g.title}`);
      for (const p of g.posts as { id: string; platform: string; url: string | null; latest: Record<string, number | null> & { capturedAt: Date } | null }[]) {
        const l = p.latest;
        console.log(`  ${p.id.slice(0, 8)} ${p.platform.padEnd(9)} views ${fmt(l?.views)} likes ${fmt(l?.likes)} comments ${fmt(l?.comments)} shares ${fmt(l?.shares)} reach ${fmt(l?.reach)}  ${l ? `(checked ${l.capturedAt.toISOString().slice(0, 16)})` : '(never checked)'}  ${p.url ?? ''}`);
      }
    }
  } else if (cmd === 'youtube') {
    const r = await refreshYouTubeMetrics(db, ACTOR);
    console.log(`recorded ${r.recorded} YouTube snapshot(s)${r.missing.length ? `; not found (private/removed?): ${r.missing.join(', ')}` : ''}`);
  } else if (cmd === 'record') {
    const rows = await db.platformPost.findMany({ where: { id: { startsWith: id ?? '-' } }, take: 2 });
    if (rows.length !== 1) throw new Error(rows.length ? `ambiguous id ${id}` : `no post ${id}`);
    const { note, ...values } = JSON.parse(json ?? '{}');
    await recordPostMetric(db, rows[0].id, values, { source: 'browser', actor: ACTOR, note });
    console.log(`recorded snapshot for ${rows[0].platform} post ${rows[0].id.slice(0, 8)}`);
  } else throw new Error(`unknown command ${cmd}`);
}
main().then(() => db.$disconnect(), async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1); });
