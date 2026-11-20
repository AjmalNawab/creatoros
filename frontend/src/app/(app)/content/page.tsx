import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, ago } from '@/components/ui';
import { STATUS_STYLE } from '@/components/ui';
import { media } from '@/components/content';

type Project = { id: string; slug: string; title: string; status: string; createdAt: string; tasks: { agentId: string; status: string }[]; video: string | null };

const STEP_COLOR: Record<string, string> = {
  COMPLETED: 'bg-emerald-500', RUNNING: 'bg-amber-500 animate-pulse', WAITING_AI: 'bg-sky-500 animate-pulse',
  AWAITING_APPROVAL: 'bg-violet-500', FAILED: 'bg-orange-500', DEAD: 'bg-red-600', QUEUED: 'bg-zinc-400', PENDING: 'bg-zinc-300 dark:bg-zinc-700',
};

export default async function ContentPage() {
  const projects = await api<Project[]>('/content');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Content Studio</h1>
      {!projects.length && <Card><p className="text-sm text-zinc-500">No content projects yet. Submit an instruction on the Overview page.</p></Card>}
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => {
          const steps = p.tasks.filter((t) => t.agentId !== 'orchestrator');
          return (
            <Link key={p.id} href={`/content/${p.id}`} className="block rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
              {p.video
                ? <video src={`${media(p.id, p.video)}#t=45`} preload="metadata" muted className="mb-3 aspect-video w-full rounded-lg bg-black object-cover" />
                : <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800">video not rendered yet</div>}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium" dir="auto">{p.title}</div>
                  <div className="font-mono text-xs text-zinc-500">{p.slug} · {ago(p.createdAt)}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${STATUS_STYLE[p.status === 'approved' ? 'APPROVED' : 'QUEUED']}`}>{p.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="mt-3 flex gap-1" aria-label="pipeline progress">
                {steps.map((t, i) => <div key={i} title={`${t.agentId}: ${t.status}`} className={`h-1.5 flex-1 rounded-full ${STEP_COLOR[t.status] ?? 'bg-zinc-300'}`} />)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
