import { ListChecks, RotateCcw, X } from 'lucide-react';
import { api } from '@/lib/api';
import { cancelTask, retryTask } from '@/lib/actions';
import { Badge, Btn, Card, ConfirmBtn, EmptyState, PageHeader, ago } from '@/components/ui';
import { stepLabel } from '@/components/content';
import { VideoTitle } from '@/components/video-title';

type Task = {
  id: string; type: string; status: string; agentId: string; attempts: number; maxAttempts: number; lastError: string | null;
  parentTaskId?: string | null; createdAt: string; agent: { name: string }; dependsOn: { dependsOnId: string }[]; displayTitle: string | null; contentProjectId: string | null;
};
const RETRYABLE = ['DEAD', 'FAILED', 'CANCELLED'];
const CANCELLABLE = ['PENDING', 'QUEUED', 'FAILED', 'AWAITING_APPROVAL', 'BLOCKED', 'WAITING_AI', 'WAITING_HUMAN'];

export default async function TasksPage() {
  const tasks = await api<Task[]>('/tasks');
  return (
    <div>
      <PageHeader icon={ListChecks} title="Tasks" description="Every step of every video, newest first. Failed steps retry automatically a few times before they stop." />
      {!tasks.length ? <EmptyState icon={ListChecks} title="No tasks yet" /> : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-100 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-3">Step</th><th className="px-3">Video</th><th className="px-3">Status</th><th className="px-3">Attempts</th><th className="px-3">Created</th><th className="px-5" />
              </tr></thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                    <td className="px-5 py-3">
                      <div className="font-medium">{stepLabel(t.agentId)}</div>
                      <div className="font-mono text-[11px] text-zinc-400">{t.type}</div>
                      {t.lastError && <div className="mt-1 max-w-md truncate text-xs text-red-600" title={t.lastError}>{t.lastError}</div>}
                    </td>
                    <td className="max-w-[16rem] px-3 text-zinc-600 dark:text-zinc-300">{t.contentProjectId ? <VideoTitle title={t.displayTitle} oneLine size="sm" /> : <span className="text-zinc-400">—</span>}</td>
                    <td className="px-3"><Badge status={t.status} /></td>
                    <td className="px-3 tabular-nums text-zinc-500">{t.attempts}/{t.maxAttempts}</td>
                    <td className="whitespace-nowrap px-3 text-zinc-500">{ago(t.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 text-right">
                      <div className="flex justify-end gap-1">
                        {RETRYABLE.includes(t.status) && <form action={retryTask.bind(null, t.id)}><Btn size="sm" icon={RotateCcw}>Retry</Btn></form>}
                        {CANCELLABLE.includes(t.status) && <form action={cancelTask.bind(null, t.id)}><ConfirmBtn size="sm" tone="ghost" icon={<X className="size-3.5" />} message="Cancel this step? Steps after it will not run.">Cancel</ConfirmBtn></form>}
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
