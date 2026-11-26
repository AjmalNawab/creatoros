import Link from 'next/link';
import { CheckCircle2, FileText, Film, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { decide } from '@/lib/actions';
import { approvalWhat } from '@/lib/labels';
import { DecisionBar } from '@/components/decision-bar';
import { VideoTitle } from '@/components/video-title';
import { Badge, Card, EmptyState, Json, LinkBtn, PageHeader, Pill, ago } from '@/components/ui';
import { CheckRow, ScriptView, VideoPlayer, media } from '@/components/content';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Approval = {
  id: string; type: string; subjectRef: string; contentHash: string; decision: string; feedback: string | null; createdAt: string; decidedAt: string | null;
  task: { type: string; agentId: string; output?: any; input?: unknown; contentProjectId: string | null; contentProject: { id: string; title: string; slug: string; language: string } | null } | null;
  displayTitle: string | null;
};

const KIND: Record<string, { label: string; icon: typeof FileText; hint: string }> = {
  script: { label: 'Script', icon: FileText, hint: 'Approve to start voice, visuals and rendering. Request changes to have the script rewritten with your feedback.' },
  final_video: { label: 'Final video', icon: Film, hint: 'Watch it end to end. Approving marks the video as ready for publishing.' },
  facebook_package: { label: 'Facebook caption', icon: Package, hint: 'Approving allows posting exactly this video and caption to the Facebook Page shown, and nothing else.' },
  tiktok_package: { label: 'TikTok caption', icon: Package, hint: 'Approving allows posting exactly this video and caption to the TikTok account shown, and nothing else.' },
  youtube_package: { label: 'YouTube title & description', icon: Package, hint: 'Approving allows uploading exactly this video, title, description, tags and thumbnail, and nothing else.' },
};

/** The content being approved, shown the way it will appear. */
function Preview({ a }: { a: Approval }) {
  const o = a.task?.output;
  const pid = a.task?.contentProjectId;
  return (
    <>
      {a.task?.type === 'script' && o?.scenes ? (
        <ScriptView scenes={o.scenes} titleOptions={o.titleOptions} words={o.words} targetWords={o.targetWords} />
      ) : a.task?.type === 'final_video' && pid && o?.video ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2"><VideoPlayer vertical={o.format === 'short'} src={media(pid, String(o.video).replace(/^content\/[^/]+\//, ''))} /></div>
          <ul className="space-y-2">{(o.checks ?? []).map((c: { check: string; pass: boolean; detail: string }, i: number) => <CheckRow key={i} pass={c.pass} label={c.check} detail={c.detail} />)}</ul>
        </div>
      ) : a.task?.type === 'youtube_package' && pid ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-2">
            <VideoPlayer vertical={o.format === 'short'} src={media(pid, o.video)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {o.thumbnail ? <img src={media(pid, o.thumbnail)} alt="Thumbnail" className="w-full rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700" /> : <p className="text-xs text-zinc-500">Short: the cover frame is chosen in the YouTube app.</p>}
          </div>
          <div className="space-y-4 lg:col-span-3">
            <div><div className="text-xs font-medium text-zinc-500">Title</div><VideoTitle title={o.title} size="lg" className="mt-1 font-semibold" /></div>
            <div><div className="text-xs font-medium text-zinc-500">Description</div><pre className="bidi-lines mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 font-sans text-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{o.description}</pre></div>
            <div><div className="text-xs font-medium text-zinc-500">Tags</div><div className="mt-1.5 flex flex-wrap gap-1">{(o.tags ?? []).map((t: string) => <Pill key={t}>{t}</Pill>)}</div></div>
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {[['Format', o.format === 'short' ? 'Short (9:16)' : 'Long (16:9)'], ['Channel', o.channel?.handle ?? '—'], ['Playlist', o.playlist ?? '—'], ['Visibility', o.visibility], ['Made for kids', o.madeForKids ? 'Yes' : 'No'], ['Category', o.category], ['Language', o.language], ['Altered content', o.alteredContent ? 'Yes' : 'No']].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700"><dt className="text-[11px] text-zinc-500">{l}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      ) : a.task?.type === 'facebook_package' && pid ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2"><VideoPlayer vertical={o.format === 'short'} src={media(pid, o.video)} /></div>
          <div className="space-y-4 lg:col-span-3">
            <div><div className="text-xs font-medium text-zinc-500">Title</div><VideoTitle title={o.title} size="lg" className="mt-1 font-semibold" /></div>
            <div><div className="text-xs font-medium text-zinc-500">Caption</div><pre className="bidi-lines mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 font-sans text-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{o.caption}</pre></div>
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {[['Page', o.page?.name ?? '—'], ['Post as', o.postAs === 'reel' ? 'Reel (9:16)' : 'Video post'], ['Audience', o.audience], ['Also to Story', o.shareToStory ? 'Yes' : 'No'], ['Series', o.series], ['Language', o.language], ['AI disclosure', o.aiDisclosure ? 'AI narration' : 'None']].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700"><dt className="text-[11px] text-zinc-500">{l}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      ) : a.task?.type === 'tiktok_package' && pid ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2"><VideoPlayer vertical src={media(pid, o.video)} /></div>
          <div className="space-y-4 lg:col-span-3">
            <div><div className="text-xs font-medium text-zinc-500">Caption</div><pre className="bidi-lines mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 font-sans text-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{o.caption}</pre></div>
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {[['Account', o.account?.handle ?? '—'], ['Cover text', o.coverText], ['Who can watch', o.visibility], ['Comments', o.allowComments ? 'On' : 'Off'], ['AI-generated label', o.aiGeneratedLabel ? 'On (AI voice)' : 'Off'], ['Language', o.language]].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700"><dt className="text-[11px] text-zinc-500">{l}</dt><dd dir="auto" className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      ) : <Json value={o} />}
    </>
  );
}

export default async function ApprovalsPage() {
  const [pending, history] = await Promise.all([api<Approval[]>('/approvals?decision=PENDING'), api<Approval[]>('/approvals')]);
  // Group by video so all decisions about one video sit together.
  const groups = new Map<string, { title: string | null; pid: string | null; items: Approval[] }>();
  for (const a of pending) {
    const key = a.task?.contentProjectId ?? a.id;
    if (!groups.has(key)) groups.set(key, { title: a.displayTitle, pid: a.task?.contentProjectId ?? null, items: [] });
    groups.get(key)!.items.push(a);
  }
  return (
    <div className="space-y-8">
      <PageHeader icon={CheckCircle2} title="Approvals" description="Nothing moves forward or goes public without your decision. Each approval covers exactly what you see here." />
      {!pending.length && <EmptyState icon={CheckCircle2} title="You're all caught up">New scripts, final videos and captions will appear here.</EmptyState>}

      {[...groups.values()].map((g) => (
        <div key={g.pid ?? g.items[0].id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <VideoTitle title={g.title} className="min-w-0 font-semibold" />
            {g.pid && <LinkBtn href={`/content/${g.pid}`} size="sm" tone="ghost">Open video</LinkBtn>}
          </div>
          {g.items.map((a) => {
            const k = KIND[a.task?.type ?? a.type] ?? { label: a.type, icon: FileText, hint: '' };
            return (
              <section key={a.id} id={a.id} className="scroll-mt-20 overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm target:ring-4 target:ring-violet-500/30 dark:border-violet-900/60 dark:bg-zinc-900">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-violet-50/50 px-5 py-3.5 dark:border-zinc-800 dark:bg-violet-950/20">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><k.icon className="size-4" /></div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{approvalWhat(a.task?.type ?? a.type)}</div>
                      <div className="text-xs text-zinc-500">{k.label} · waiting {ago(a.createdAt)}</div>
                    </div>
                  </div>
                </header>
                <div className="space-y-4 p-5">
                  {k.hint && <p className="text-sm text-zinc-500">{k.hint}</p>}
                  <Preview a={a} />
                </div>
                <DecisionBar action={decide.bind(null, a.id)} />
              </section>
            );
          })}
        </div>
      ))}

      {history.length > 0 && (
        <Card title="Recent decisions" padded={false}>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {history.slice(0, 20).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <div className="min-w-0">
                  <div className="font-medium">{KIND[a.task?.type ?? a.type]?.label ?? a.type}</div>
                  <div className="flex min-w-0 gap-1 text-xs text-zinc-500">
                    {a.task?.contentProjectId ? <Link href={`/content/${a.task.contentProjectId}`} className="min-w-0 hover:underline"><VideoTitle title={a.displayTitle} oneLine size="sm" /></Link> : null}
                    {a.feedback && <span className="shrink-0 truncate text-zinc-400">· “{a.feedback}”</span>}
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-3"><Badge status={a.decision} /><span className="hidden w-16 text-right text-xs text-zinc-400 sm:block">{ago(a.decidedAt)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
