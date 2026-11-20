import { ListChecks, RotateCcw, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cancelTask, retryTask } from '@/lib/actions';
import { Badge, Btn, Card, EmptyState, PageHeader, ago } from '@/components/ui';

type Task = {
  id: string; type: string; status: string; agentId: string; attempts: number; maxAttempts: number; lastError: string | null;
  parentTaskId: string | null; createdAt: string; agent: { name: string }; dependsOn: { dependsOnId: string }[];
};
const RETRYABLE = ['DEAD', 'FAILED', 'CANCELLED'];
const CANCELLABLE = ['PENDING', 'QUEUED', 'FAILED', 'AWAITING_APPROVAL', 'BLOCKED', 'WAITING_AI', 'WAITING_HUMAN'];

export default async function TasksPage() {
  const tasks = await api<Task[]>('/tasks');
  return (
    <div>
      <PageHeader icon={ListChecks} title="Tasks" description="Every unit of work the agents do, newest first. Failed tasks retry automatically with backoff before going to dead-letter." />
      {!tasks.length ? <EmptyState icon={ListChecks} title="No tasks yet" /> : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-100 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-3">Task</th><th className="px-3">Agent</th><th className="px-3">Status</th><th className="px-3">Attempts</th><th className="px-3">Created</th><th className="px-5" />
              </tr></thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs">{t.type}</div>
                      <div className="font-mono text-[11px] text-zinc-400">{t.id.slice(0, 8)}{t.dependsOn.length ? ` · ${t.dependsOn.length} dep` : ''}</div>
                      {t.lastError && <div className="mt-1 max-w-md truncate text-xs text-red-600" title={t.lastError}>{t.lastError}</div>}
                    </td>
                    <td className="px-3 text-zinc-600 dark:text-zinc-300">{t.agent.name}</td>
                    <td className="px-3"><Badge status={t.status} /></td>
                    <td className="px-3 tabular-nums text-zinc-500">{t.attempts}/{t.maxAttempts}</td>
                    <td className="whitespace-nowrap px-3 text-zinc-500">{ago(t.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 text-right">
                      <div className="flex justify-end gap-1">
                        {RETRYABLE.includes(t.status) && <form action={retryTask.bind(null, t.id)}><Btn size="sm" icon={RotateCcw}>Retry</Btn></form>}
                        {CANCELLABLE.includes(t.status) && <form action={cancelTask.bind(null, t.id)}><Btn size="sm" tone="ghost" icon={X}>Cancel</Btn></form>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
