import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Clapperboard, Cpu, Lightbulb, Lock, MonitorUp, Send, Sparkles, Unlock, Wand2, Youtube,
} from 'lucide-react';
import { api } from '@/lib/api';
import { submitInstruction, startIdeation } from '@/lib/actions';
import { Badge, Btn, Card, EmptyState, LanguageToggle, PageHeader, Stat, ago, inputCls } from '@/components/ui';
import { Pipeline, media } from '@/components/content';

type Overview = {
  tasks: Record<string, number>; pendingApprovals: number; aiPending: number; actionsPending: number; ideasProposed: number; posts: number;
  enabledAgents: number; activeBrand: { name: string; language: string; youtube: { handle: string } | null };
  lock: { holder: string | null; workerId: string | null; token: string };
  running: { agentId: string; type: string; startedAt: string } | null;
};
type Project = { id: string; slug: string; title: string; status: string; createdAt: string; video: string | null; poster: string | null; tasks: { agentId: string; status: string }[] };

export default async function OverviewPage() {
  const [ov, projects] = await Promise.all([api<Overview>('/overview'), api<Project[]>('/content')]);
  const todo = [
    { n: ov.pendingApprovals, href: '/approvals', icon: CheckCircle2, title: 'Approve', text: 'Scripts, final videos or upload packages are waiting for your decision.', tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50' },
    { n: ov.aiPending, href: '/ai', icon: Sparkles, title: 'AI thinking needed', text: 'In Claude Code, say “process the AI queue”.', tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50' },
    { n: ov.actionsPending, href: '/actions', icon: MonitorUp, title: 'Ready to upload', text: 'In Claude Code, say “upload it”, or upload manually.', tone: 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/50' },
    { n: ov.ideasProposed, href: '/ideas', icon: Lightbulb, title: 'Ideas to review', text: 'Pick the next video, or reject with a reason.', tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' },
  ].filter((t) => t.n > 0);
  const active = projects.filter((p) => !['approved', 'published', 'pilot_complete'].includes(p.status)).slice(0, 4);
  const t = (s: string) => ov.tasks[s] ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title={`Good to see you`} description={<>Active brand: <b className="font-medium text-zinc-700 dark:text-zinc-200">{ov.activeBrand.name}</b>{ov.activeBrand.youtube && <> · <Youtube className="-mt-0.5 inline size-3.5 text-red-500" /> {ov.activeBrand.youtube.handle}</>}</>} />

      {/* Create */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-300/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-semibold"><Wand2 className="size-4 text-orange-500" />Create a video</div>
          <p className="mt-1 text-sm text-zinc-500">Describe it in a sentence. The Main Agent plans research → script → voice → visuals → render → YouTube, and stops for your approval at each key step.</p>
          <form action={submitInstruction} className="mt-4 flex flex-col gap-2 lg:flex-row">
            <input name="text" required minLength={3} placeholder='e.g. "A 3 minute story about the Tacoma Narrows Bridge collapse"' className={`${inputCls} h-11 text-base lg:flex-1`} />
            <div className="flex gap-2">
              <LanguageToggle defaultValue={ov.activeBrand.language} />
              <Btn tone="accent" icon={Send} className="h-9 flex-1 lg:flex-none">Create</Btn>
            </div>
          </form>
          <form action={startIdeation} className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
            <input type="hidden" name="count" value="5" />
            <span>No topic in mind?</span>
            <button className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700"><Lightbulb className="size-3.5" />Suggest trending ideas</button>
          </form>
        </div>
      </section>

      {/* Needs you */}
      {todo.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {todo.map((x) => (
            <Link key={x.href} href={x.href} className="group flex gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${x.tone}`}><x.icon className="size-5" /></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold">{x.title}<span className="rounded-full bg-zinc-900 px-1.5 text-[11px] leading-5 text-white dark:bg-white dark:text-zinc-900">{x.n}</span></div>
                <p className="mt-0.5 text-xs text-zinc-500">{x.text}</p>
              </div>
              <ArrowRight className="ml-auto size-4 shrink-0 self-center text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500" />
            </Link>
          ))}
        </div>
      )}

      {/* In production */}
      <Card title="In production" description="Live progress of every video being made" actions={<Link href="/content" className="whitespace-nowrap text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Content Studio →</Link>} padded={false}>
        {active.length ? (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {active.map((p) => (
              <li key={p.id}>
                <Link href={`/content/${p.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-zinc-50 sm:flex-row sm:items-center dark:hover:bg-zinc-800/40">
                  <div className="aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:w-36 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.poster ? <img src={media(p.id, p.poster)} alt="" loading="lazy" className="size-full object-cover" /> : <div className="grid size-full place-items-center"><Clapperboard className="size-5 text-zinc-300" /></div>}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate font-medium" dir="auto">{p.title}</div>
                      <span className="shrink-0 text-xs text-zinc-400">{ago(p.createdAt)}</span>
                    </div>
                    <Pipeline tasks={p.tasks} compact />
                    <div className="flex flex-wrap gap-1.5">{p.tasks.filter((x) => ['AWAITING_APPROVAL', 'WAITING_AI', 'WAITING_HUMAN', 'RUNNING', 'DEAD'].includes(x.status)).map((x, i) => <Badge key={i} status={x.status} label={`${x.agentId.replace('youtube.', 'YouTube ')}: ${x.status === 'AWAITING_APPROVAL' ? 'needs approval' : x.status === 'WAITING_AI' ? 'needs AI' : x.status === 'WAITING_HUMAN' ? 'ready to upload' : x.status === 'DEAD' ? 'failed' : 'running'}`} />)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : <div className="p-5"><EmptyState icon={Clapperboard} title="Nothing in production">Create a video above, or pick one from Ideas.</EmptyState></div>}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Videos" value={projects.length} icon={Clapperboard} hint={`${projects.filter((p) => p.video).length} rendered`} />
        <Stat label="Published" value={ov.posts} icon={Youtube} tone="danger" />
        <Stat label="Tasks done" value={t('COMPLETED')} icon={CheckCircle2} tone="success" hint={`${t('QUEUED') + t('PENDING')} waiting · ${t('DEAD')} failed`} />
        <Stat label="Agents" value={ov.enabledAgents} icon={Cpu} tone="info" hint={ov.running ? `running: ${ov.running.agentId}` : 'all idle'} />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        {ov.running ? <Lock className="size-3.5 text-amber-500" /> : <Unlock className="size-3.5 text-emerald-500" />}
        <span><b className="font-medium text-zinc-700 dark:text-zinc-300">Global execution lock</b>: {ov.running ? <>held by <b>{ov.running.agentId}</b> since {ago(ov.running.startedAt)} (worker {ov.lock.workerId})</> : 'free'}. Only one agent can run at a time · fencing token {ov.lock.token}</span>
      </div>
    </div>
  );
}
