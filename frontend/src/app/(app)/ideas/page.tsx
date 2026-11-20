import Link from 'next/link';
import { Lightbulb, Search, Sparkles, Target, ThumbsDown, TrendingUp, Users, Wand2, Swords } from 'lucide-react';
import { api } from '@/lib/api';
import { rejectIdea, selectIdea, startIdeation } from '@/lib/actions';
import { Badge, Btn, Card, EmptyState, PageHeader, Pill, SeriesPicker, ago, inputCls, type SeriesOption } from '@/components/ui';

type Idea = {
  id: string; brandId: string | null; taskId: string; rank: number; title: string; topic: string; angle: string; audience: string; whyNow: string;
  evidence: { source: string; detail: string; url?: string }[]; competition: string; keywords: string[]; format: string; durationSec: number;
  score: number; status: string; contentProjectId: string | null; feedback: string | null; createdAt: string;
};
type Round = { id: string; agentId: string; status: string; createdAt: string; input: { focus?: string | null } };

const scoreTone = (s: number) => (s >= 8 ? 'from-emerald-500 to-emerald-600' : s >= 6 ? 'from-amber-400 to-orange-500' : 'from-zinc-400 to-zinc-500');

export default async function IdeasPage() {
  const [{ ideas, rounds }, brands] = await Promise.all([
    api<{ ideas: Idea[]; rounds: Round[] }>('/ideas'), api<(SeriesOption & { name: string })[]>('/brands')]);
  const seriesName = (id: string | null) => brands.find((b) => b.id === id);
  const busy = rounds.filter((r) => !['COMPLETED', 'CANCELLED', 'DEAD'].includes(r.status));
  const proposed = ideas.filter((i) => i.status === 'PROPOSED');
  const decided = ideas.filter((i) => i.status !== 'PROPOSED').slice(0, 20);

  return (
    <div className="space-y-6">
      <PageHeader icon={Lightbulb} title="Ideas" description={<>Pick a series, and the Trend agent scans what is timely for it, and the Strategy agent ranks ideas by fit, demand and competition. Nothing is produced until you pick one.</>} />

      <Card>
        <form action={startIdeation} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input name="focus" placeholder="Optional focus: e.g. aviation, bridges, anniversaries this month…" className={`${inputCls} pl-9`} /></div>
          <SeriesPicker series={brands} />
          <select name="count" defaultValue="5" className={`${inputCls} sm:w-32`}>{[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} ideas</option>)}</select>
          <Btn tone="accent" icon={Wand2}>Suggest ideas</Btn>
        </form>
        {busy.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
            <Sparkles className="size-4" />{busy.map((r) => <Badge key={r.id} status={r.status} label={`${r.agentId}: ${r.status === 'WAITING_AI' ? 'needs AI' : r.status.toLowerCase()}`} />)}
            {busy.some((r) => r.status === 'WAITING_AI') && <span>In Claude Code, say <b>“process the AI queue”</b>.</span>}
          </div>
        )}
      </Card>

      {!proposed.length && !busy.length && <EmptyState icon={Lightbulb} title="No ideas waiting">Click “Suggest ideas” to get a fresh, ranked list.</EmptyState>}

      <div className="grid gap-4 xl:grid-cols-2">
        {proposed.map((i) => (
          <section key={i.id} className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4 p-5">
              <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${scoreTone(i.score)}`}>
                <div className="text-center leading-none"><div className="text-xl font-bold">{i.score}</div><div className="text-[9px] opacity-80">/10</div></div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">{seriesName(i.brandId) && <Pill tone="info">{seriesName(i.brandId)!.profile.language === 'ur' ? 'اردو' : 'EN'} · {seriesName(i.brandId)!.name}</Pill>}<Pill>#{i.rank}</Pill><Pill>{i.format}</Pill><Pill>{Math.round(i.durationSec / 6) / 10} min</Pill><span>{ago(i.createdAt)}</span></div>
                <h3 dir="auto" className="mt-1.5 text-lg font-semibold leading-snug">{i.title}</h3>
                <div className="text-sm text-zinc-500">{i.topic}</div>
              </div>
            </div>
            <dl className="grid gap-3 border-t border-zinc-100 px-5 py-4 text-sm sm:grid-cols-2 dark:border-zinc-800">
              {[[TrendingUp, 'Why now', i.whyNow], [Users, 'Audience', i.audience], [Target, 'Our angle', i.angle], [Swords, 'Competition', i.competition]].map(([Icon, l, v]) => {
                const I = Icon as typeof Target;
                return <div key={l as string}><dt className="flex items-center gap-1.5 text-xs font-medium text-zinc-500"><I className="size-3.5" />{l as string}</dt><dd className="mt-0.5 leading-relaxed">{v as string}</dd></div>;
              })}
            </dl>
            <div className="space-y-2 px-5 pb-4">
              <div className="flex flex-wrap gap-1">{i.keywords.map((k) => <Pill key={k}>{k}</Pill>)}</div>
              <details className="text-sm"><summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-800">Evidence ({i.evidence.length})</summary>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">{i.evidence.map((e, n) => <li key={n}>• <b className="font-medium">{e.source}</b>: {e.detail} {e.url && <a href={e.url} target="_blank" className="text-sky-600 hover:underline">source</a>}</li>)}</ul>
              </details>
            </div>
            <div className="mt-auto flex flex-col gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3 sm:flex-row dark:border-zinc-800 dark:bg-zinc-950/30">
              <form action={rejectIdea.bind(null, i.id)} className="flex flex-1 gap-2">
                <input name="feedback" placeholder="Why not? (teaches the next round)" className={`${inputCls} flex-1`} />
                <Btn tone="ghost" icon={ThumbsDown}>Reject</Btn>
              </form>
              <form action={selectIdea.bind(null, i.id)} className="flex gap-2">
                <Btn tone="accent" icon={Wand2}>Make this</Btn>
              </form>
            </div>
          </section>
        ))}
      </div>

      {decided.length > 0 && (
        <Card title="Decided" padded={false}>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {decided.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate" dir="auto">{i.title}{i.feedback && <span className="text-zinc-400"> · “{i.feedback}”</span>}</span>
                <span className="flex items-center gap-3">
                  {i.contentProjectId && <Link href={`/content/${i.contentProjectId}`} className="text-xs font-medium text-sky-600 hover:underline">Open video</Link>}
                  <Badge status={i.status} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
