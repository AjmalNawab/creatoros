import Link from 'next/link';
import { Check, MonitorUp, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { completeHumanAction } from '@/lib/actions';
import { Badge, Btn, Card, EmptyState, Json, PageHeader, ago, inputCls } from '@/components/ui';

type Action = {
  id: string; kind: string; title: string; instructions: string; payload: Record<string, unknown>; status: string; result: Record<string, unknown> | null;
  completedBy: string | null; createdAt: string; completedAt: string | null;
  task: { id: string; agentId: string; contentProject: { id: string; slug: string; title: string } | null };
};

export default async function ActionsPage() {
  const actions = await api<Action[]>('/human-actions');
  const pending = actions.filter((a) => a.status === 'PENDING');
  const done = actions.filter((a) => a.status !== 'PENDING');
  return (
    <div className="space-y-6">
      <PageHeader icon={MonitorUp} title="Browser actions" description="Approved uploads happen in your own Chrome. Say “upload it” in Claude Code and it uploads via DevTools while you watch, or upload yourself and paste the link." />
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" />
        <div>Safety rules: only approved packages are uploaded, the channel must match the brand, and any login, CAPTCHA or 2FA screen is handed back to you.</div>
      </div>
      {!pending.length && <EmptyState icon={MonitorUp} title="Nothing to upload">Approved YouTube packages will appear here.</EmptyState>}
      {pending.map((a) => (
        <section key={a.id} className="overflow-hidden rounded-2xl border border-fuchsia-200 bg-white shadow-sm dark:border-fuchsia-900/60 dark:bg-zinc-900">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 bg-fuchsia-50/50 px-5 py-3.5 dark:border-zinc-800 dark:bg-fuchsia-950/20">
            <div className="min-w-0"><div className="flex items-center gap-2 text-sm font-semibold" dir="auto">{a.title}<Badge status="WAITING_HUMAN" /></div>
              {a.task.contentProject && <Link href={`/content/${a.task.contentProject.id}`} className="text-xs text-zinc-500 hover:underline">content/{a.task.contentProject.slug}</Link>}</div>
            <span className="font-mono text-xs text-zinc-400">{a.id.slice(0, 8)} · {ago(a.createdAt)}</span>
          </header>
          <div className="space-y-3 p-5">
            <pre className="whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 font-sans text-sm leading-relaxed ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{a.instructions}</pre>
            <details><summary className="cursor-pointer text-xs font-medium text-zinc-500">Exact approved values</summary><div className="mt-2"><Json value={a.payload} /></div></details>
          </div>
          <form action={completeHumanAction.bind(null, a.id)} className="flex flex-col gap-2 border-t border-zinc-100 px-5 py-3 sm:flex-row dark:border-zinc-800">
            <input name="url" required placeholder="Paste the published link (https://youtu.be/…)" className={`${inputCls} flex-1`} />
            <input name="notes" placeholder="Notes (optional)" className={`${inputCls} sm:w-56`} />
            <Btn tone="success" icon={Check}>Mark uploaded</Btn>
          </form>
        </section>
      ))}
      {done.length > 0 && (
        <Card title="History" padded={false}>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {done.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate" dir="auto">{a.title}{typeof a.result?.url === 'string' && <a href={a.result.url} target="_blank" className="ml-2 text-sky-600 hover:underline">{a.result.url}</a>}</span>
                <span className="flex items-center gap-3"><Badge status={a.status} /><span className="text-xs text-zinc-400">{ago(a.completedAt)}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
