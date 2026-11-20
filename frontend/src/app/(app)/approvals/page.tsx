import Link from 'next/link';
import { Check, CheckCircle2, FileText, Film, MessageSquareWarning, Package, X } from 'lucide-react';
import { api } from '@/lib/api';
import { decide } from '@/lib/actions';
import { Badge, Btn, Card, EmptyState, Json, PageHeader, Pill, ago, inputCls } from '@/components/ui';
import { CheckRow, ScriptView, VideoPlayer, media } from '@/components/content';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Approval = {
  id: string; type: string; subjectRef: string; contentHash: string; decision: string; feedback: string | null; createdAt: string; decidedAt: string | null;
  task: { type: string; agentId: string; output: any; input: unknown; contentProjectId: string | null; contentProject: { title: string; slug: string; language: string } | null } | null;
};

const KIND: Record<string, { label: string; icon: typeof FileText; hint: string }> = {
  script: { label: 'Script', icon: FileText, hint: 'Approve to start voice, visuals and rendering. Request changes to have the script rewritten with your feedback.' },
  final_video: { label: 'Final video', icon: Film, hint: 'Watch it end to end. Approving marks the video as ready for publishing.' },
  facebook_package: { label: 'Facebook post package', icon: Package, hint: 'Approving allows posting exactly this video and caption to the Facebook Page shown, and nothing else.' },
  youtube_package: { label: 'YouTube upload package', icon: Package, hint: 'Approving allows uploading exactly this video, title, description, tags and thumbnail, and nothing else.' },
};

export default async function ApprovalsPage() {
  const all = await api<Approval[]>('/approvals');
  const pending = all.filter((a) => a.decision === 'PENDING');
  const history = all.filter((a) => a.decision !== 'PENDING').slice(0, 15);
  return (
    <div className="space-y-6">
      <PageHeader icon={CheckCircle2} title="Approvals" description="Nothing moves forward or goes public without your decision. Every approval is tied to the exact content shown here." />
      {!pending.length && <EmptyState icon={CheckCircle2} title="You're all caught up">New scripts, final videos and upload packages will appear here.</EmptyState>}

      {pending.map((a) => {
        const k = KIND[a.task?.type ?? a.type] ?? { label: a.type, icon: FileText, hint: '' };
        const o = a.task?.output;
        const pid = a.task?.contentProjectId;
        return (
          <section key={a.id} className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm dark:border-violet-900/60 dark:bg-zinc-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-violet-50/50 px-5 py-3.5 dark:border-zinc-800 dark:bg-violet-950/20">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><k.icon className="size-4" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold">{k.label}<Badge status="AWAITING_APPROVAL" /></div>
                  {a.task?.contentProject && pid && <Link href={`/content/${pid}`} dir="auto" className="block truncate text-xs text-zinc-500 hover:underline">{a.task.contentProject.title} · {a.task.contentProject.slug}</Link>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400"><span>{ago(a.createdAt)}</span><span className="font-mono" title="Approval is valid only for this exact content">#{a.contentHash.slice(0, 8)}</span></div>
            </header>

            <div className="space-y-4 p-5">
              {k.hint && <p className="text-sm text-zinc-500">{k.hint}</p>}
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
                    <div><div className="text-xs font-medium text-zinc-500">Title</div><div dir="auto" className="mt-1 text-lg font-semibold">{o.title}</div></div>
                    <div><div className="text-xs font-medium text-zinc-500">Description</div><pre dir="auto" className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 font-sans text-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{o.description}</pre></div>
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
                    <div><div className="text-xs font-medium text-zinc-500">Title</div><div dir="auto" className="mt-1 text-lg font-semibold">{o.title}</div></div>
                    <div><div className="text-xs font-medium text-zinc-500">Caption</div><pre dir="auto" className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 font-sans text-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{o.caption}</pre></div>
                    <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                      {[['Page', o.page?.name ?? '—'], ['Post as', o.postAs === 'reel' ? 'Reel (9:16)' : 'Video post'], ['Audience', o.audience], ['Series', o.series], ['Language', o.language], ['AI disclosure', o.aiDisclosure ? 'AI narration' : 'None']].map(([l, v]) => (
                        <div key={l} className="rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700"><dt className="text-[11px] text-zinc-500">{l}</dt><dd className="font-medium">{v}</dd></div>
                      ))}
                    </dl>
                  </div>
                </div>
              ) : <Json value={o} />}
            </div>

            <form action={decide.bind(null, a.id)} className="sticky bottom-0 flex flex-col gap-2 border-t border-zinc-100 bg-white/95 px-5 py-3 backdrop-blur sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900/95">
              <input name="feedback" placeholder="Feedback for the agent (required to request changes)" className={`${inputCls} flex-1`} />
              <div className="flex gap-2">
                <Btn name="decision" value="REJECTED" tone="ghost" icon={X}>Reject</Btn>
                <Btn name="decision" value="CHANGES_REQUESTED" icon={MessageSquareWarning}>Request changes</Btn>
                <Btn name="decision" value="APPROVED" tone="success" icon={Check}>Approve</Btn>
              </div>
            </form>
          </section>
        );
      })}

      {history.length > 0 && (
        <Card title="Recent decisions" padded={false}>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {history.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate"><span className="font-medium">{KIND[a.task?.type ?? a.type]?.label ?? a.type}</span>{a.task?.contentProject && <span dir="auto" className="text-zinc-500"> · {a.task.contentProject.title}</span>}{a.feedback && <span className="text-zinc-400"> · “{a.feedback}”</span>}</span>
                <span className="flex items-center gap-3"><Badge status={a.decision} /><span className="w-16 text-right text-xs text-zinc-400">{ago(a.decidedAt)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
