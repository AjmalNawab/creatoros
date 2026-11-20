import Link from 'next/link';
import { api } from '@/lib/api';
import { rejectIdea, selectIdea, startIdeation } from '@/lib/actions';
import { Badge, Btn, Card, ago } from '@/components/ui';

type Idea = {
  id: string; taskId: string; rank: number; title: string; topic: string; angle: string; audience: string; whyNow: string;
  evidence: { source: string; detail: string; url?: string }[]; competition: string; keywords: string[]; format: string; durationSec: number;
  score: number; status: string; contentProjectId: string | null; feedback: string | null; createdAt: string;
};
type Round = { id: string; agentId: string; status: string; createdAt: string; input: { focus?: string | null } };

export default async function IdeasPage() {
  const { ideas, rounds } = await api<{ ideas: Idea[]; rounds: Round[] }>('/ideas');
  const busy = rounds.filter((r) => !['COMPLETED', 'CANCELLED', 'DEAD'].includes(r.status));
  const proposed = ideas.filter((i) => i.status === 'PROPOSED');
  const decided = ideas.filter((i) => i.status !== 'PROPOSED');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ideas</h1>
      <Card title="Suggest next videos">
        <p className="mb-3 text-sm text-zinc-500">The Trend agent finds what is trending now for your <Link href="/brand" className="underline">brand profile</Link>. The Strategy agent proposes ranked ideas with audience, angle, competition and evidence. Nothing is produced until you pick one.</p>
        <form action={startIdeation} className="flex flex-col gap-2 sm:flex-row">
          <input name="focus" placeholder="Optional focus, e.g. space, monsoon, exams season…" className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" />
          <select name="count" defaultValue="5" className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700">
            {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} ideas</option>)}
          </select>
          <Btn tone="primary">Suggest ideas</Btn>
        </form>
        {busy.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">{busy.map((r) => <span key={r.id} className="flex items-center gap-2">{r.agentId} <Badge status={r.status} /></span>)}
            {busy.some((r) => r.status === 'WAITING_AI') && <span className="text-sky-700 dark:text-sky-400">In Claude Code, say “process the AI queue”.</span>}
          </div>
        )}
      </Card>

      {proposed.map((i) => (
        <Card key={i.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs text-zinc-500">#{i.rank} · {i.format} · {Math.round(i.durationSec / 60 * 10) / 10} min · {ago(i.createdAt)}</div>
              <div className="text-lg font-medium" dir="auto">{i.title}</div>
              <div className="text-sm text-zinc-500">{i.topic}</div>
            </div>
            <div className="text-right"><div className="text-3xl font-semibold tabular-nums">{i.score}</div><div className="text-xs text-zinc-500">score /10</div></div>
          </div>
          <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div><dt className="text-xs uppercase text-zinc-500">Why now</dt><dd>{i.whyNow}</dd></div>
            <div><dt className="text-xs uppercase text-zinc-500">Target audience</dt><dd>{i.audience}</dd></div>
            <div><dt className="text-xs uppercase text-zinc-500">Our angle</dt><dd>{i.angle}</dd></div>
            <div><dt className="text-xs uppercase text-zinc-500">Competition</dt><dd>{i.competition}</dd></div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-1">{i.keywords.map((k) => <span key={k} dir="auto" className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{k}</span>)}</div>
          <details className="mt-2 text-sm"><summary className="cursor-pointer text-zinc-500">Evidence ({i.evidence.length})</summary>
            <ul className="mt-1 list-disc pl-5">{i.evidence.map((e, n) => <li key={n}>{e.source}: {e.detail} {e.url && <a href={e.url} target="_blank" className="text-sky-600 hover:underline">link</a>}</li>)}</ul>
          </details>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <form action={selectIdea.bind(null, i.id)}><Btn tone="primary">Make this video</Btn></form>
            <form action={rejectIdea.bind(null, i.id)} className="flex flex-1 gap-2">
              <input name="feedback" placeholder="Why not? (teaches the next round)" className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-sm dark:border-zinc-700" />
              <Btn>Reject</Btn>
            </form>
          </div>
        </Card>
      ))}

      {!!decided.length && (
        <Card title="Decided">
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {decided.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <span dir="auto">{i.title} {i.feedback && <span className="text-zinc-500">· “{i.feedback}”</span>}</span>
                <span className="flex items-center gap-3">
                  {i.contentProjectId && <Link href={`/content/${i.contentProjectId}`} className="text-sky-600 hover:underline">project</Link>}
                  <Badge status={i.status === 'SELECTED' ? 'APPROVED' : 'REJECTED'} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
