import { api } from '@/lib/api';
import { cancelTask, retryTask } from '@/lib/actions';
import { Badge, Btn, Card, ago } from '@/components/ui';

type Task = {
  id: string; type: string; status: string; agentId: string; attempts: number; maxAttempts: number; lastError: string | null;
  parentTaskId: string | null; createdAt: string; agent: { name: string }; dependsOn: { dependsOnId: string }[];
};

const RETRYABLE = ['DEAD', 'FAILED', 'CANCELLED'];
const CANCELLABLE = ['PENDING', 'QUEUED', 'FAILED', 'AWAITING_APPROVAL', 'BLOCKED'];

export default async function TasksPage() {
  const tasks = await api<Task[]>('/tasks');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-zinc-500">
              <tr><th className="py-2">Task</th><th>Agent</th><th>Status</th><th>Attempts</th><th>Deps</th><th>Created</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="py-2.5">
                    <div className="font-mono">{t.type}</div>
                    <div className="font-mono text-xs text-zinc-500">{t.id.slice(0, 8)}{t.parentTaskId && ` ← ${t.parentTaskId.slice(0, 8)}`}</div>
                    {t.lastError && <div className="mt-1 max-w-md truncate text-xs text-red-600" title={t.lastError}>{t.lastError}</div>}
                  </td>
                  <td>{t.agent.name}</td>
                  <td><Badge status={t.status} /></td>
                  <td className="tabular-nums">{t.attempts}/{t.maxAttempts}</td>
                  <td className="tabular-nums text-zinc-500">{t.dependsOn.length || '—'}</td>
                  <td className="text-zinc-500">{ago(t.createdAt)}</td>
                  <td className="space-x-1 whitespace-nowrap text-right">
                    {RETRYABLE.includes(t.status) && <form action={retryTask.bind(null, t.id)} className="inline"><Btn>Retry</Btn></form>}
                    {CANCELLABLE.includes(t.status) && <form action={cancelTask.bind(null, t.id)} className="inline"><Btn tone="ghost">Cancel</Btn></form>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!tasks.length && <p className="py-4 text-sm text-zinc-500">No tasks yet.</p>}
        </div>
      </Card>
    </div>
  );
}
