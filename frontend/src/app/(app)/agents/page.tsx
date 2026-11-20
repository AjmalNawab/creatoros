import { api } from '@/lib/api';
import { setAgentEnabled } from '@/lib/actions';
import { Btn, Card, ago } from '@/components/ui';

type Agent = {
  id: string; name: string; department: string; description: string | null; enabled: boolean; timeoutSec: number; maxAttempts: number;
  requiresApprovalAfter: boolean; runs: number; successRate: number | null; costUsd: number; lastRun: { startedAt: string; status: string } | null;
};

export default async function AgentsPage() {
  const agents = await api<Agent[]>('/agents');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Agent Control Centre</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-zinc-500">
              <tr><th className="py-2">Agent</th><th>Department</th><th>Runs</th><th>Success</th><th>Cost</th><th>Last run</th><th>Limits</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {agents.map((a) => (
                <tr key={a.id} className={a.enabled ? '' : 'opacity-50'}>
                  <td className="py-2.5"><div className="font-medium">{a.name}</div><div className="font-mono text-xs text-zinc-500">{a.id}</div></td>
                  <td>{a.department}</td>
                  <td className="tabular-nums">{a.runs}</td>
                  <td className="tabular-nums">{a.successRate == null ? '—' : `${Math.round(a.successRate * 100)}%`}</td>
                  <td className="tabular-nums">${a.costUsd.toFixed(4)}</td>
                  <td className="text-zinc-500">{ago(a.lastRun?.startedAt)}</td>
                  <td className="text-xs text-zinc-500">{a.timeoutSec}s · {a.maxAttempts}× {a.requiresApprovalAfter && '· approval'}</td>
                  <td className="text-right">
                    <form action={setAgentEnabled.bind(null, a.id, !a.enabled)}>
                      <Btn tone={a.enabled ? 'default' : 'primary'}>{a.enabled ? 'Disable' : 'Enable'}</Btn>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!agents.length && <p className="py-4 text-sm text-zinc-500">No agents registered yet. Start the worker to register them.</p>}
        </div>
      </Card>
    </div>
  );
}
