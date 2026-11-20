import Link from 'next/link';
import { api } from '@/lib/api';
import { completeHumanAction } from '@/lib/actions';
import { Badge, Btn, Card, Json, ago } from '@/components/ui';

type Action = {
  id: string; kind: string; title: string; instructions: string; payload: Record<string, unknown>; status: string; result: Record<string, unknown> | null;
  completedBy: string | null; createdAt: string; completedAt: string | null;
  task: { id: string; agentId: string; contentProject: { id: string; slug: string; title: string } | null };
};

export default async function ActionsPage() {
  const actions = await api<Action[]>('/human-actions');
  const pending = actions.filter((a) => a.status === 'PENDING');
  const done = actions.filter((a) => a.status !== 'PENDING');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Browser & Human Actions</h1>
      <Card>
        <p className="text-sm">
          Uploads happen in <span className="font-medium">your Chrome</span>. Open Claude Code and say
          <span className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">upload it</span>
          and it will do the upload through DevTools while you watch. Or upload it yourself and paste the link below.
        </p>
      </Card>
      {!pending.length && <Card><p className="text-sm text-zinc-500">Nothing waiting.</p></Card>}
      {pending.map((a) => (
        <Card key={a.id}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium" dir="auto">{a.title}</div>
            <span className="font-mono text-xs text-zinc-500">{a.id.slice(0, 8)} · {ago(a.createdAt)}</span>
          </div>
          {a.task.contentProject && <Link href={`/content/${a.task.contentProject.id}`} className="text-sm text-zinc-500 hover:underline">content/{a.task.contentProject.slug}</Link>}
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-950">{a.instructions}</pre>
          <details className="mt-2"><summary className="cursor-pointer text-sm text-zinc-500">Exact approved values</summary><Json value={a.payload} /></details>
          <form action={completeHumanAction.bind(null, a.id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input name="url" required placeholder="Paste the published link (e.g. https://youtu.be/…)" className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-sm dark:border-zinc-700" />
            <input name="notes" placeholder="Notes (optional)" className="rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-sm sm:w-56 dark:border-zinc-700" />
            <Btn tone="primary">Mark done</Btn>
          </form>
        </Card>
      ))}
      {!!done.length && (
        <Card title="History">
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {done.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <span dir="auto">{a.title} {typeof a.result?.url === 'string' && <a href={a.result.url} target="_blank" className="ml-2 text-sky-600 hover:underline">{a.result.url}</a>}</span>
                <span className="flex items-center gap-3"><Badge status={a.status === 'DONE' ? 'COMPLETED' : 'CANCELLED'} /><span className="text-xs text-zinc-500">{ago(a.completedAt)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
