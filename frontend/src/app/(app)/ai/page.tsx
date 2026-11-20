import Link from 'next/link';
import { Sparkles, Terminal } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Card, EmptyState, PageHeader, ago } from '@/components/ui';

type Req = {
  id: string; kind: string; format: string; status: string; error: string | null; createdAt: string; answeredAt: string | null; answeredBy: string | null;
  task: { id: string; contentProject: { id: string; slug: string; title: string } | null };
};
const MAP: Record<string, string> = { PENDING: 'WAITING_AI', ANSWERED: 'QUEUED', CONSUMED: 'COMPLETED', REJECTED: 'FAILED' };
const LABEL: Record<string, string> = { PENDING: 'Waiting', ANSWERED: 'Answered', CONSUMED: 'Used', REJECTED: 'Rejected · re-asked' };

export default async function AiQueuePage() {
  const reqs = await api<Req[]>('/ai-requests');
  const pending = reqs.filter((r) => r.status === 'PENDING');
  return (
    <div className="space-y-6">
      <PageHeader icon={Sparkles} title="AI Queue" description="Operator mode ($0): agents that need thinking (research, scripts, visuals, metadata) pause here, and Claude Code answers them." />
      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${pending.length ? 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40' : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}>
        <Terminal className={`mt-0.5 size-5 shrink-0 ${pending.length ? 'text-sky-600' : 'text-zinc-400'}`} />
        <div className="text-sm">
          {pending.length ? <><b>{pending.length} request{pending.length > 1 ? 's' : ''} waiting.</b> Open Claude Code in this project and say <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs ring-1 ring-sky-200 dark:bg-zinc-900 dark:ring-sky-900">process the AI queue</code>.</> : <span className="text-zinc-500">Nothing waiting. New requests appear when an agent needs AI.</span>}
        </div>
      </div>
      {reqs.length ? (
        <Card padded={false}>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reqs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="font-mono text-xs text-zinc-400">{r.id.slice(0, 8)}</span>
                <span className="font-medium">{r.kind.replace(/_/g, ' ')}</span>
                {r.task.contentProject ? <Link href={`/content/${r.task.contentProject.id}`} dir="auto" className="min-w-0 truncate text-zinc-500 hover:underline">{r.task.contentProject.title}</Link> : <span className="text-zinc-400">strategy</span>}
                <span className="ml-auto flex items-center gap-3"><Badge status={MAP[r.status] ?? r.status} label={LABEL[r.status]} /><span className="w-16 text-right text-xs text-zinc-400">{ago(r.answeredAt ?? r.createdAt)}</span></span>
                {r.error && <div className="basis-full truncate text-xs text-orange-600" title={r.error}>Rejected: {r.error}</div>}
              </li>
            ))}
          </ul>
        </Card>
      ) : <EmptyState icon={Sparkles} title="No AI requests yet" />}
    </div>
  );
}
