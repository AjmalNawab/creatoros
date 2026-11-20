import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge, Card, ago } from '@/components/ui';

type Req = {
  id: string; kind: string; format: string; status: string; error: string | null; createdAt: string; answeredAt: string | null; answeredBy: string | null;
  task: { id: string; contentProject: { id: string; slug: string; title: string } | null };
};

const STATUS_MAP: Record<string, string> = { PENDING: 'WAITING_AI', ANSWERED: 'QUEUED', CONSUMED: 'COMPLETED', REJECTED: 'FAILED' };

export default async function AiQueuePage() {
  const reqs = await api<Req[]>('/ai-requests');
  const pending = reqs.filter((r) => r.status === 'PENDING');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Queue</h1>
      <Card>
        <p className="text-sm">
          Mode: <span className="font-medium">Operator ($0)</span>. Agents that need AI thinking pause here.
          {pending.length
            ? <> <span className="font-semibold text-sky-700 dark:text-sky-400">{pending.length} waiting.</span> Open Claude Code in this project and say <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">process the AI queue</span>.</>
            : ' Nothing waiting.'}
        </p>
      </Card>
      <Card title="Requests">
        <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          {reqs.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
              <span>
                <span className="font-mono text-xs text-zinc-500">{r.id.slice(0, 8)}</span> <span className="font-medium">{r.kind}</span>
                {r.task.contentProject && <> · <Link href={`/content/${r.task.contentProject.id}`} className="hover:underline" dir="auto">{r.task.contentProject.title}</Link></>}
                {r.error && <div className="mt-1 max-w-2xl truncate text-xs text-orange-600" title={r.error}>Rejected: {r.error}</div>}
              </span>
              <span className="flex items-center gap-3"><Badge status={STATUS_MAP[r.status] ?? r.status} /><span className="w-20 text-right text-xs text-zinc-500">{ago(r.answeredAt ?? r.createdAt)}</span></span>
            </li>
          ))}
          {!reqs.length && <li className="py-2 text-zinc-500">No AI requests yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
