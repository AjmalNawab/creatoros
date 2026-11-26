import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, Clapperboard, Eye, Lightbulb, MessageCircle, MonitorUp, PartyPopper, Send, TriangleAlert, Upload, Wand2 } from 'lucide-react';
import { api } from '@/lib/api';
import { submitInstruction, startIdeation } from '@/lib/actions';
import { approvalWhat, PLATFORM_NAME, platformOf, platformOfAction, postWhat } from '@/lib/labels';
import { Btn, Card, EmptyState, FormatToggle, LinkBtn, SeriesPicker, Stat, ago, inputCls, type SeriesOption } from '@/components/ui';
import { Pipeline, media, stepLabel } from '@/components/content';
import { PlatformIcon } from '@/components/platform-icon';
import { ClaudePanel, type OperatorStatus } from '@/components/claude-panel';
import { VideoTitle } from '@/components/video-title';

type Need = { kind: 'approve' | 'post' | 'failed'; id: string; what: string; projectId: string | null; title: string | null; since: string; error?: string | null };
type Making = { id: string; title: string | null; poster: string | null; createdAt: string; tasks: { agentId: string; status: string }[] };
type Today = { needs: Need[]; aiPending: number; making: Making[]; week: { posts: number; views: number | null; comments: number | null } };
type Platform = { id: string; name: string; status: string };

const fmt = (n: number | null) => (n === null ? '–' : n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString('en'));

function NeedRow({ n }: { n: Need }) {
  const plat = n.kind === 'post' ? platformOfAction(n.what) : platformOf(n.what);
  const [label, href, btn, Icon, tone] = n.kind === 'approve'
    ? [approvalWhat(n.what), `/approvals#${n.id}`, 'Review', CheckCircle2, 'bg-violet-50 text-violet-600 dark:bg-violet-950/50']
    : n.kind === 'post'
      ? [postWhat(n.what), `/actions#${n.id}`, 'Post', Upload, 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/50']
      : [`Step failed: ${stepLabel(n.what)}`, n.projectId ? `/content/${n.projectId}` : '/tasks', 'Open', TriangleAlert, 'bg-red-50 text-red-600 dark:bg-red-950/50'];
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>{plat ? <PlatformIcon id={plat} /> : <Icon className="size-4" />}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex min-w-0 items-baseline gap-1 text-xs text-zinc-500"><VideoTitle title={n.title} oneLine size="sm" className="min-w-0" /><span className="shrink-0">· {ago(n.since)}</span></div>
      </div>
      <LinkBtn href={href} size="sm" tone={n.kind === 'failed' ? 'default' : 'primary'}>{btn}<ArrowRight className="size-3.5" /></LinkBtn>
    </li>
  );
}

export default async function OverviewPage() {
  const [today, series, platforms, op] = await Promise.all([api<Today>('/today'), api<SeriesOption[]>('/brands'), api<Platform[]>('/platforms'), api<OperatorStatus>('/operator')]);
  const active = platforms.filter((p) => p.status === 'active');
  const hour = new Date().getHours();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}</h1>
        <p className="mt-1 text-sm text-zinc-500">{today.needs.length ? `${today.needs.length} thing${today.needs.length === 1 ? '' : 's'} need${today.needs.length === 1 ? 's' : ''} you.` : 'Nothing needs you right now.'}</p>
      </div>

      {/* Needs you */}
      <Card title="Needs you" padded={false}>
        {today.needs.length ? (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {today.needs.map((n) => <NeedRow key={`${n.kind}-${n.id}`} n={n} />)}
          </ul>
        ) : (
          <div className="flex items-center gap-3 px-5 py-6 text-sm text-zinc-500"><PartyPopper className="size-5 text-emerald-500" />All clear. Create a video below, or check how your posts are doing.</div>
        )}
      </Card>

      {(op.pending > 0 || op.running || op.auto) && <ClaudePanel st={op} compact />}

      {/* Create */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-300/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-semibold"><Wand2 className="size-4 text-orange-500" />Make a new video</div>
          <p className="mt-1 text-sm text-zinc-500">Describe it in a sentence. It stops for your approval at the script, the final video and each platform caption.</p>
          <form action={submitInstruction} className="mt-4 space-y-3">
            <input name="text" required minLength={3} placeholder='e.g. "Why does Karachi get sea breeze in the evening?"' className={`${inputCls} h-11 text-base`} />
            <div className="flex flex-wrap items-center gap-2">
              <FormatToggle defaultValue="short" />
              <SeriesPicker series={series} />
              <div role="group" aria-label="Post to" className="flex flex-wrap gap-1.5">
                {active.map((p) => (
                  <label key={p.id} className="flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-500 transition has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-900 has-[:checked]:text-white dark:border-zinc-700 dark:has-[:checked]:border-white dark:has-[:checked]:bg-white dark:has-[:checked]:text-zinc-900">
                    <input type="checkbox" name="platforms" value={p.id} className="sr-only" />
                    <PlatformIcon id={p.id} className="size-3.5" />{PLATFORM_NAME[p.id] ?? p.name}
                  </label>
                ))}
              </div>
              <Btn tone="accent" icon={Send} pendingLabel="Creating…" className="ml-auto">Create video</Btn>
            </div>
            <p className="text-xs text-zinc-400">Tick where to post. If none are ticked, it follows your text (YouTube by default).</p>
          </form>
          <form action={startIdeation} className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 text-sm text-zinc-500 dark:border-zinc-800">
            <input type="hidden" name="count" value="5" />
            <input type="hidden" name="brandId" value={series.find((s) => s.active)?.id ?? ''} />
            <span>No topic in mind?</span>
            <Btn tone="soft" size="sm" icon={Lightbulb} pendingLabel="Asking…">Suggest ideas</Btn>
          </form>
        </div>
      </section>

      {/* In production */}
      <Card title="Being made" description="Videos in progress, step by step" padded={false}
        actions={<LinkBtn href="/content" size="sm" tone="ghost">All videos<ArrowRight className="size-3.5" /></LinkBtn>}>
        {today.making.length ? (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {today.making.map((p) => {
              const now = p.tasks.find((t) => ['RUNNING', 'AWAITING_APPROVAL', 'WAITING_AI', 'WAITING_HUMAN', 'QUEUED', 'FAILED'].includes(t.status));
              const done = p.tasks.filter((t) => t.status === 'COMPLETED' && t.agentId !== 'orchestrator').length;
              const total = p.tasks.filter((t) => t.status !== 'CANCELLED' && t.agentId !== 'orchestrator').length;
              return (
                <li key={p.id}>
                  <Link href={`/content/${p.id}`} className="flex items-center gap-4 px-4 py-3 transition hover:bg-zinc-50 sm:px-5 dark:hover:bg-zinc-800/40">
                    <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:w-32 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.poster ? <img src={media(p.id, p.poster)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="grid size-full place-items-center"><Clapperboard className="size-5 text-zinc-300" /></div>}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <VideoTitle title={p.title} oneLine size="sm" className="font-medium" />
                      <Pipeline tasks={p.tasks} compact />
                      <div className="text-xs text-zinc-500">{now ? <>Now: <b className="font-medium text-zinc-700 dark:text-zinc-300">{stepLabel(now.agentId)}</b> · </> : null}{done} of {total} steps done</div>
                    </div>
                    <ArrowRight className="hidden size-4 shrink-0 text-zinc-300 sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : <div className="p-5"><EmptyState icon={Clapperboard} title="Nothing being made">Create a video above, or pick one from Ideas.</EmptyState></div>}
      </Card>

      {/* This week */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Posted (7 days)" value={today.week.posts} icon={MonitorUp} tone="human" />
        <Stat label="Views (latest check)" value={fmt(today.week.views)} icon={Eye} tone="info" hint={today.week.views === null ? 'Say “check stats” to Claude' : undefined} />
        <Stat label="Comments" value={fmt(today.week.comments)} icon={MessageCircle} tone="review" />
        <Link href="/published" className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex items-center justify-between text-xs font-medium text-zinc-500">All results<BarChart3 className="size-4" /></span>
          <span className="mt-2 flex items-center gap-1 text-sm font-semibold">Published & stats<ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
        </Link>
      </div>
    </div>
  );
}
