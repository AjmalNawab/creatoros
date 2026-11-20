import Link from 'next/link';
import { api } from '@/lib/api';
import { submitInstruction } from '@/lib/actions';
import { Badge, Btn, Card, Stat, ago } from '@/components/ui';

type Overview = {
  tasks: Record<string, number>; pendingApprovals: number; emergencyStop: boolean; enabledAgents: number; brands: number;
  lock: { holder: string | null; workerId: string | null; leaseUntil: string | null; token: string };
  running: { runId: string; taskId: string; agentId: string; type: string; startedAt: string } | null;
};
type Task = { id: string; type: string; status: string; agentId: string; createdAt: string; agent: { name: string } };

export default async function OverviewPage() {
  const [ov, tasks, brands] = await Promise.all([api<Overview>('/overview'), api<Task[]>('/tasks'), api<{ name: string; active: boolean; profile: { language: string } }[]>('/brands')]);
  const brand = brands.find((b) => b.active);
  const lang = brand?.profile.language ?? 'en';
  const t = (s: string) => ov.tasks[s] ?? 0;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <Card title={`Instruct the Main Orchestrator · ${brand?.name ?? ''}`}>
        <form action={submitInstruction} className="flex flex-col gap-2 sm:flex-row">
          <input name="text" required minLength={3} placeholder='e.g. "Create a 3 minute video about the Tacoma Narrows Bridge"'
            className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700" />
          <div role="radiogroup" aria-label="Language" className="flex overflow-hidden rounded-lg border border-zinc-300 text-sm dark:border-zinc-700">
            {[['en', 'English'], ['ur', 'اردو Urdu']].map(([v, l]) => (
              <label key={v} className="cursor-pointer px-3 py-2 has-[:checked]:bg-zinc-900 has-[:checked]:text-white dark:has-[:checked]:bg-white dark:has-[:checked]:text-zinc-900">
                <input type="radio" name="language" value={v} defaultChecked={v === lang} className="sr-only" />{l}
              </label>
            ))}
          </div>
          <Btn tone="primary" type="submit">Submit</Btn>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Running" value={t('RUNNING')} tone="text-amber-600" />
        <Stat label="Queued / pending" value={t('QUEUED') + t('PENDING')} />
        <Stat label="Pending approvals" value={ov.pendingApprovals} tone="text-violet-600" />
        <Stat label="Completed" value={t('COMPLETED')} tone="text-emerald-600" />
        <Stat label="Failed (retrying)" value={t('FAILED')} tone="text-orange-600" />
        <Stat label="Dead-letter" value={t('DEAD')} tone="text-red-600" />
        <Stat label="Enabled agents" value={ov.enabledAgents} />
        <Stat label="Brands" value={ov.brands} />
      </div>

      <Card title="Global execution lock">
        {ov.running ? (
          <p className="text-sm">
            <span className="font-medium">{ov.running.agentId}</span> is running <span className="font-mono">{ov.running.type}</span>
            {' '}· started {ago(ov.running.startedAt)} · worker <span className="font-mono">{ov.lock.workerId}</span> · fencing token {ov.lock.token}
          </p>
        ) : <p className="text-sm text-zinc-500">Free. No agent is executing (token {ov.lock.token}).</p>}
      </Card>

      <Card title="Recent tasks">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {tasks.slice(0, 12).map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="truncate"><span className="font-medium">{x.agent.name}</span> · <span className="font-mono text-zinc-500">{x.type}</span></span>
              <span className="flex shrink-0 items-center gap-3"><Badge status={x.status} /><span className="w-16 text-right text-xs text-zinc-500">{ago(x.createdAt)}</span></span>
            </li>
          ))}
          {!tasks.length && <li className="py-2 text-sm text-zinc-500">No tasks yet. Submit an instruction above.</li>}
        </ul>
        <Link href="/tasks" className="mt-3 inline-block text-sm text-zinc-500 hover:underline">All tasks →</Link>
      </Card>
    </div>
  );
}
