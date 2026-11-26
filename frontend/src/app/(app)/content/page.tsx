import Link from 'next/link';
import { Archive, ArchiveRestore, Clapperboard, Play, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { setArchived } from '@/lib/actions';
import { Btn, EmptyState, PageHeader, Pill, ago, btnCls, inputCls } from '@/components/ui';
import { Pipeline, media, stepLabel } from '@/components/content';
import { PlatformIcon } from '@/components/platform-icon';
import { VideoTitle } from '@/components/video-title';

type Project = {
  id: string; slug: string; title: string; displayTitle: string; language: string; createdAt: string; archivedAt: string | null;
  tasks: { agentId: string; status: string }[]; posts: { platform: string; url: string | null }[]; video: string | null; poster: string | null;
};
type State = 'needs' | 'failed' | 'making' | 'posted' | 'done' | 'archived';

function stateOf(p: Project): State {
  if (p.archivedAt) return 'archived';
  if (p.tasks.some((t) => ['AWAITING_APPROVAL', 'WAITING_HUMAN'].includes(t.status))) return 'needs';
  if (p.tasks.some((t) => t.status === 'DEAD')) return 'failed';
  if (p.tasks.some((t) => !['COMPLETED', 'CANCELLED', 'DEAD'].includes(t.status))) return 'making';
  return p.posts.length ? 'posted' : 'done';
}
const STATE_UI: Record<State, { label: string; cls: string }> = {
  needs: { label: 'Needs you', cls: 'bg-violet-600 text-white' },
  failed: { label: 'Problem', cls: 'bg-red-600 text-white' },
  making: { label: 'Being made', cls: 'bg-amber-500 text-white' },
  posted: { label: 'Posted', cls: 'bg-emerald-600 text-white' },
  done: { label: 'Finished', cls: 'bg-zinc-700 text-white' },
  archived: { label: 'Archived', cls: 'bg-zinc-400 text-white' },
};
const FILTERS: { id: string; label: string; match: (s: State) => boolean }[] = [
  { id: 'all', label: 'All', match: (s) => s !== 'archived' },
  { id: 'needs', label: 'Needs you', match: (s) => s === 'needs' || s === 'failed' },
  { id: 'making', label: 'Being made', match: (s) => s === 'making' },
  { id: 'posted', label: 'Posted', match: (s) => s === 'posted' || s === 'done' },
  { id: 'archived', label: 'Archived', match: (s) => s === 'archived' },
];

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ show?: string; q?: string }> }) {
  const [{ show = 'all', q = '' }, projects] = await Promise.all([searchParams, api<Project[]>('/content')]);
  const filter = FILTERS.find((f) => f.id === show) ?? FILTERS[0];
  const needle = q.trim().toLowerCase();
  const withState = projects.map((p) => ({ p, s: stateOf(p) }));
  const list = withState.filter(({ p, s }) => filter.match(s) && (!needle || `${p.displayTitle} ${p.title}`.toLowerCase().includes(needle)));
  const count = (f: (typeof FILTERS)[number]) => withState.filter(({ s }) => f.match(s)).length;
  const href = (id: string) => `/content?show=${id}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  return (
    <div>
      <PageHeader icon={Clapperboard} title="Videos" description="Every video from first research to posting. Open one to watch it, read the script, or see where it was posted." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" aria-label="Filter videos">
          {FILTERS.map((f) => (
            <Link key={f.id} href={href(f.id)} className={`${btnCls(f.id === filter.id ? 'primary' : 'soft', 'sm')}`}>
              {f.label}<span className={`rounded-full px-1.5 text-[11px] leading-4 ${f.id === filter.id ? 'bg-white/20' : 'bg-zinc-200 dark:bg-zinc-700'}`}>{count(f)}</span>
            </Link>
          ))}
        </nav>
        <form className="relative lg:w-72" action="/content">
          <input type="hidden" name="show" value={filter.id} />
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input name="q" defaultValue={q} placeholder="Search videos…" className={`${inputCls} pl-9`} />
        </form>
      </div>

      {!list.length && (
        <EmptyState icon={Clapperboard} title={needle ? 'No videos match' : 'Nothing here'}>
          {needle ? 'Try another word, or clear the search.' : filter.id === 'archived' ? 'Archived videos appear here. Nothing is ever deleted.' : 'Create a video from the Overview page, or pick an idea.'}
        </EmptyState>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(({ p, s }) => {
          const ui = STATE_UI[s];
          const blocking = p.tasks.find((t) => ['AWAITING_APPROVAL', 'WAITING_HUMAN', 'DEAD', 'RUNNING', 'WAITING_AI'].includes(t.status));
          const platforms = [...new Set(p.posts.map((x) => x.platform))];
          return (
            <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <Link href={`/content/${p.id}`} className="relative block aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {p.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media(p.id, p.poster)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-center"><div><Clapperboard className="mx-auto size-6 text-zinc-300 dark:text-zinc-600" /><div className="mt-1.5 text-xs text-zinc-400">No preview yet</div></div></div>
                )}
                {p.video && <span className="absolute inset-0 grid place-items-center bg-zinc-950/0 transition group-hover:bg-zinc-950/30"><span className="grid size-12 scale-90 place-items-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100"><Play className="ml-0.5 size-5 fill-zinc-900 text-zinc-900" /></span></span>}
                <span className="absolute left-3 top-3 flex gap-1.5"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm ${ui.cls}`}>{ui.label}</span><Pill>{p.language === 'ur' ? 'اردو' : 'EN'}</Pill></span>
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <Link href={`/content/${p.id}`} className="font-medium leading-snug hover:underline"><VideoTitle title={p.displayTitle} /></Link>
                {p.tasks.length > 0 && s !== 'archived' && <Pipeline tasks={p.tasks} compact />}
                <div className="text-xs text-zinc-500">
                  {blocking && s !== 'archived'
                    ? <>Now: <b className="font-medium text-zinc-700 dark:text-zinc-300">{stepLabel(blocking.agentId)}</b> · {blocking.status === 'AWAITING_APPROVAL' ? 'needs your approval' : blocking.status === 'WAITING_HUMAN' ? 'ready to post' : blocking.status === 'WAITING_AI' ? 'Claude is writing' : blocking.status === 'RUNNING' ? 'working' : 'failed'}</>
                    : `Started ${ago(p.createdAt)}`}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5" aria-label="Posted on">
                    {platforms.length ? platforms.map((pl) => <PlatformIcon key={pl} id={pl} />) : <span className="text-xs text-zinc-400">Not posted yet</span>}
                  </div>
                  <form action={setArchived.bind(null, p.id, s !== 'archived')}>
                    <Btn tone="ghost" size="sm" icon={s === 'archived' ? ArchiveRestore : Archive} title={s === 'archived' ? 'Show it in the lists again' : 'Hide from the lists (nothing is deleted)'}>{s === 'archived' ? 'Restore' : 'Archive'}</Btn>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
