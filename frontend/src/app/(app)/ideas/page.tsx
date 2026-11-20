import Link from 'next/link';
import { ChevronDown, Clock, ExternalLink, Lightbulb, Search, Sparkles, Star, Swords, Target, ThumbsDown, TrendingUp, Users, Wand2 } from 'lucide-react';
import { api } from '@/lib/api';
import { rejectIdea, selectIdea, startIdeation } from '@/lib/actions';
import { Badge, Btn, Card, EmptyState, PageHeader, Pill, SeriesPicker, ago, inputCls, type SeriesOption } from '@/components/ui';

type Idea = {
  id: string; brandId: string | null; taskId: string; rank: number; title: string; topic: string; angle: string; audience: string; whyNow: string;
  evidence: { source: string; detail: string; url?: string }[]; competition: string; keywords: string[]; format: string; durationSec: number;
  score: number; status: string; contentProjectId: string | null; feedback: string | null; createdAt: string;
};
type Round = { id: string; agentId: string; status: string; createdAt: string; input: { focus?: string | null } };

const scoreStyle = (s: number) =>
  s >= 8 ? 'bg-emerald-500 text-white' : s >= 6 ? 'bg-amber-400 text-amber-950' : 'bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200';
const fmtDur = (sec: number) => (sec < 90 ? `${sec}s` : `${Math.round(sec / 6) / 10} min`);

export default async function IdeasPage() {
  const [{ ideas, rounds }, series] = await Promise.all([
    api<{ ideas: Idea[]; rounds: Round[] }>('/ideas'), api<SeriesOption[]>('/brands')]);
  const seriesOf = (id: string | null) => series.find((b) => b.id === id);
  const busy = rounds.filter((r) => !['COMPLETED', 'CANCELLED', 'DEAD'].includes(r.status));
  // Best first: newest round first, then by score, then by the agent's rank.
  const proposed = ideas.filter((i) => i.status === 'PROPOSED')
    .sort((a, b) => (a.taskId === b.taskId ? b.score - a.score || a.rank - b.rank : +new Date(b.createdAt) - +new Date(a.createdAt)));
  const decided = ideas.filter((i) => i.status !== 'PROPOSED').slice(0, 20);
  const topId = proposed[0]?.id;

  return (
    <div className="space-y-6">
      <PageHeader icon={Lightbulb} title="Ideas" description="Ranked by fit, demand and competition, with sources. Nothing is produced until you pick one." />

      <Card>
        <form action={startIdeation} className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 self-stretch xl:self-auto"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input name="focus" placeholder="Optional focus: aviation, bridges, anniversaries this month…" className={`${inputCls} pl-9`} /></div>
          <div className="flex flex-wrap items-center gap-2">
            <SeriesPicker series={series} />
            <select name="count" defaultValue="5" className="h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900">{[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} ideas</option>)}</select>
            <Btn tone="accent" icon={Wand2}>Suggest ideas</Btn>
          </div>
        </form>
        {busy.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
            <Sparkles className="size-4" />{busy.map((r) => <Badge key={r.id} status={r.status} label={`${r.agentId}: ${r.status === 'WAITING_AI' ? 'needs AI' : r.status.toLowerCase()}`} />)}
            {busy.some((r) => r.status === 'WAITING_AI') && <span>In Claude Code, say <b>“process the AI queue”</b>.</span>}
          </div>
        )}
      </Card>

      {!proposed.length && !busy.length && <EmptyState icon={Lightbulb} title="No ideas waiting">Click “Suggest ideas” to get a fresh, ranked list.</EmptyState>}

      {proposed.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 text-sm dark:border-zinc-800">
            <span className="font-semibold">{proposed.length} ideas to review</span>
            <span className="text-xs text-zinc-500">Best first · click an idea for details</span>
          </header>
          <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {proposed.map((i, n) => {
              const s = seriesOf(i.brandId);
              const top = i.id === topId;
              return (
                <li key={i.id} className={`flex items-start gap-2 pr-5 ${top ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : ''}`}>
                  <details className="group min-w-0 flex-1">
                    <summary className="flex cursor-pointer list-none items-start gap-4 py-4 pl-5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 [&::-webkit-details-marker]:hidden">
                      <div className={`grid size-12 shrink-0 place-items-center rounded-xl text-center leading-none shadow-sm ${scoreStyle(i.score)}`}>
                        <div><div className="text-lg font-bold">{i.score}</div><div className="text-[9px] opacity-80">/10</div></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                          <span className="font-semibold text-zinc-400">#{n + 1}</span>
                          {top && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><Star className="size-3 fill-current" />Recommended</span>}
                          {s && <Pill tone="info">{s.profile.language === 'ur' ? 'اردو' : 'EN'} · {s.name}</Pill>}
                          <Pill>{i.format === 'short' ? 'Short' : 'Long'}</Pill>
                          <span className="inline-flex items-center gap-1"><Clock className="size-3" />{fmtDur(i.durationSec)}</span>
                        </div>
                        <h3 dir="auto" className="mt-1 font-semibold leading-snug">{i.title}</h3>
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-500"><TrendingUp className="-mt-0.5 mr-1 inline size-3.5 text-zinc-400" />{i.whyNow}</p>
                      </div>
                      <ChevronDown className="mt-1 size-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
                    </summary>

                    <div className="space-y-4 pb-5 pl-5 sm:pl-[5.25rem]">
                      <dl className="grid gap-4 text-sm md:grid-cols-2">
                        {([[Target, 'Our angle', i.angle], [Users, 'Audience', i.audience], [TrendingUp, 'Why now', i.whyNow], [Swords, 'Competition', i.competition]] as const).map(([Icon, l, v]) => (
                          <div key={l}><dt className="flex items-center gap-1.5 text-xs font-medium text-zinc-500"><Icon className="size-3.5" />{l}</dt><dd className="mt-1 leading-relaxed">{v}</dd></div>
                        ))}
                      </dl>
                      <div className="flex flex-wrap gap-1">{i.keywords.map((k) => <Pill key={k}>{k}</Pill>)}</div>
                      <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {i.evidence.map((e, k) => (
                          <li key={k} className="flex gap-1.5"><span className="font-medium text-zinc-800 dark:text-zinc-200">{e.source}:</span><span>{e.detail}</span>
                            {e.url && <a href={e.url} target="_blank" className="inline-flex shrink-0 items-center gap-0.5 text-sky-600 hover:underline">source<ExternalLink className="size-3" /></a>}</li>
                        ))}
                      </ul>
                      <form action={rejectIdea.bind(null, i.id)} className="flex gap-2">
                        <input name="feedback" placeholder="Not this one? Say why (it teaches the next round)" className={`${inputCls} flex-1`} />
                        <Btn tone="ghost" icon={ThumbsDown}>Reject</Btn>
                      </form>
                    </div>
                  </details>
                  <form action={selectIdea.bind(null, i.id)} className="shrink-0 pt-4"><Btn tone={top ? 'accent' : 'default'} size="sm" icon={Wand2}>Make this</Btn></form>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {decided.length > 0 && (
        <Card title="Decided" padded={false}>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {decided.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate" dir="auto">{i.title}{i.feedback && <span className="text-zinc-400"> · “{i.feedback}”</span>}</span>
                <span className="flex items-center gap-3">
                  {i.contentProjectId && <Link href={`/content/${i.contentProjectId}`} className="text-xs font-medium text-sky-600 hover:underline">Open video</Link>}
                  <Badge status={i.status} /><span className="text-xs text-zinc-400">{ago(i.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
