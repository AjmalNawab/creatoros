import { api } from '@/lib/api';
import { decide } from '@/lib/actions';
import { Badge, Btn, Card, Json, ago } from '@/components/ui';
import { ScriptView, VideoPlayer, media } from '@/components/content';

type Approval = {
  id: string; type: string; subjectRef: string; contentHash: string; decision: string; feedback: string | null;
  createdAt: string; decidedAt: string | null; task: { type: string; agentId: string; output: any; input: unknown; contentProjectId: string | null } | null; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default async function ApprovalsPage() {
  const all = await api<Approval[]>('/approvals');
  const pending = all.filter((a) => a.decision === 'PENDING');
  const history = all.filter((a) => a.decision !== 'PENDING');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Approval Centre</h1>
      {!pending.length && <Card><p className="text-sm text-zinc-500">Nothing waiting for your approval.</p></Card>}
      {pending.map((a) => (
        <Card key={a.id}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div><span className="font-medium">{a.type}</span> <span className="text-sm text-zinc-500">from {a.task?.agentId} · {ago(a.createdAt)}</span></div>
            <span className="font-mono text-xs text-zinc-500" title="Approval is valid only for this exact content">#{a.contentHash.slice(0, 12)}</span>
          </div>
          {a.task?.type === 'script' && a.task.output?.scenes
            ? <ScriptView scenes={a.task.output.scenes} titleOptions={a.task.output.titleOptions} words={a.task.output.words} targetWords={a.task.output.targetWords} />
            : a.task?.type === 'final_video' && a.task.contentProjectId && a.task.output?.video
            ? <div className="space-y-3">
                <VideoPlayer src={media(a.task.contentProjectId, String(a.task.output.video).replace(/^content\/[^/]+\//, ''))} />
                <ul className="text-sm">{(a.task.output.checks ?? []).map((c: { check: string; pass: boolean; detail: string }, i: number) => <li key={i}>{c.pass ? '✅' : '❌'} {c.check} <span className="text-zinc-500">{c.detail}</span></li>)}</ul>
              </div>
            : a.task?.type === 'youtube_package' && a.task.contentProjectId
            ? <div className="space-y-3">
                <div className="text-sm text-zinc-500">YouTube upload package. Approving allows uploading <b>exactly</b> this, and nothing else.</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <VideoPlayer src={media(a.task.contentProjectId, a.task.output.video)} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media(a.task.contentProjectId, a.task.output.thumbnail)} alt="Thumbnail" className="w-full rounded-lg" />
                </div>
                <div><div className="text-xs uppercase text-zinc-500">Title</div><div dir="auto" className="font-medium">{a.task.output.title}</div></div>
                <div><div className="text-xs uppercase text-zinc-500">Description</div><pre dir="auto" className="whitespace-pre-wrap rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-950">{a.task.output.description}</pre></div>
                <div className="flex flex-wrap gap-1">{(a.task.output.tags ?? []).map((t: string) => <span key={t} dir="auto" className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{t}</span>)}</div>
                <div className="text-sm">Visibility: <b>{a.task.output.visibility}</b> · Made for kids: <b>{a.task.output.madeForKids ? 'yes' : 'no'}</b> · Category: {a.task.output.category} · Language: {a.task.output.language}</div>
              </div>
            : <Json value={a.task?.output} />}
          <form action={decide.bind(null, a.id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input name="feedback" placeholder="Feedback (optional)" className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-sm dark:border-zinc-700" />
            <div className="flex gap-2">
              <Btn tone="primary" name="decision" value="APPROVED">Approve</Btn>
              <Btn name="decision" value="CHANGES_REQUESTED">Request changes</Btn>
              <Btn tone="danger" name="decision" value="REJECTED">Reject</Btn>
            </div>
          </form>
        </Card>
      ))}
      {!!history.length && (
        <Card title="History">
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {history.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                <span>{a.type} {a.feedback && <span className="text-zinc-500">· “{a.feedback}”</span>}</span>
                <span className="flex items-center gap-3"><Badge status={a.decision} /><span className="text-xs text-zinc-500">{ago(a.decidedAt)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
