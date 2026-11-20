import Link from 'next/link';
import { Clapperboard, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, EmptyState, PageHeader, Pill, ago } from '@/components/ui';
import { Pipeline, media } from '@/components/content';

type Project = { id: string; slug: string; title: string; status: string; language: string; createdAt: string; tasks: { agentId: string; status: string }[]; video: string | null; poster: string | null };

const PROJECT_STATUS: Record<string, { status?: string; label: string }> = {
  in_production: { status: 'RUNNING', label: 'In production' },
  awaiting_final_approval: { status: 'AWAITING_APPROVAL', label: 'Final review' },
  approved: { status: 'APPROVED', label: 'Approved' },
  published: { status: 'COMPLETED', label: 'Published' },
  pilot_complete: { status: 'COMPLETED', label: 'Pilot' },
};

export default async function ContentPage() {
  const projects = await api<Project[]>('/content');
  return (
    <div>
      <PageHeader icon={Clapperboard} title="Content Studio" description="Every video, from first research to published upload. Open one to watch it, read the script or review the scenes." />
      {!projects.length && <EmptyState icon={Clapperboard} title="No videos yet">Create one from the Overview page, or pick an idea.</EmptyState>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => {
          const st = PROJECT_STATUS[p.status] ?? { label: p.status.replace(/_/g, ' ') };
          const blocking = p.tasks.find((t) => ['AWAITING_APPROVAL', 'WAITING_AI', 'WAITING_HUMAN', 'DEAD'].includes(t.status));
          return (
            <Link key={p.id} href={`/content/${p.id}`} className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
                {p.poster || p.video ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.poster ? <img src={media(p.id, p.poster)} alt="" loading="lazy" className="size-full object-cover" /> : <div className="size-full bg-zinc-900" />}
                    <div className="absolute inset-0 grid place-items-center bg-zinc-950/0 transition group-hover:bg-zinc-950/30">
                      {p.video && <span className="grid size-12 scale-90 place-items-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100"><Play className="ml-0.5 size-5 fill-zinc-900 text-zinc-900" /></span>}
                    </div>
                  </>
                ) : (
                  <div className="grid size-full place-items-center text-center">
                    <div><Clapperboard className="mx-auto size-6 text-zinc-300 dark:text-zinc-600" /><div className="mt-1.5 text-xs text-zinc-400">Not rendered yet</div></div>
                  </div>
                )}
                <div className="absolute left-3 top-3"><Pill>{p.language === 'ur' ? 'اردو' : 'EN'}</Pill></div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="line-clamp-1 font-medium" dir="auto">{p.title}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-400">{p.slug} · {ago(p.createdAt)}</div>
                  </div>
                  <Badge status={st.status} label={st.label} />
                </div>
                {p.tasks.length > 0 && <Pipeline tasks={p.tasks} compact />}
                {blocking && <div className="text-xs text-zinc-500">Next: <span className="font-medium text-zinc-700 dark:text-zinc-300">{blocking.agentId.replace('youtube.', 'YouTube ')}</span> · {blocking.status === 'AWAITING_APPROVAL' ? 'needs your approval' : blocking.status === 'WAITING_AI' ? 'needs AI (process the queue)' : blocking.status === 'WAITING_HUMAN' ? 'ready to upload' : 'failed'}</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
