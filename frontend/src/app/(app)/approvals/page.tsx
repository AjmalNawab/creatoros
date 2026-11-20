import { api } from '@/lib/api';
import { decide } from '@/lib/actions';
import { Badge, Btn, Card, Json, ago } from '@/components/ui';

type Approval = {
  id: string; type: string; subjectRef: string; contentHash: string; decision: string; feedback: string | null;
  createdAt: string; decidedAt: string | null; task: { type: string; agentId: string; output: unknown; input: unknown } | null;
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
          <Json value={a.task?.output} />
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
