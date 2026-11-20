import { Bot, Power, PowerOff } from 'lucide-react';
import { api } from '@/lib/api';
import { setAgentEnabled } from '@/lib/actions';
import { Badge, Btn, PageHeader, Pill, ago } from '@/components/ui';
import { STEPS } from '@/components/content';

type Agent = {
  id: string; name: string; department: string; description: string | null; enabled: boolean; timeoutSec: number; maxAttempts: number;
  requiresApprovalAfter: boolean; runs: number; successRate: number | null; costUsd: number; lastRun: { startedAt: string; status: string } | null;
};
const ORDER = ['Main', 'Strategy & Research', 'Content Creation', 'Compliance & Protection'];

export default async function AgentsPage() {
  const agents = await api<Agent[]>('/agents');
  const depts = [...new Set(agents.map((a) => a.department))].sort((a, b) => (ORDER.indexOf(a) + 99 * +(ORDER.indexOf(a) < 0)) - (ORDER.indexOf(b) + 99 * +(ORDER.indexOf(b) < 0)));
  return (
    <div className="space-y-8">
      <PageHeader icon={Bot} title="Agents" description="Every agent, grouped by department. Only one runs at a time (global lock). Disable an agent to pause that step everywhere." />
      {depts.map((d) => (
        <section key={d}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{d}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {agents.filter((a) => a.department === d).map((a) => {
              const Icon = STEPS[a.id]?.icon ?? Bot;
              return (
                <div key={a.id} className={`flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${a.enabled ? '' : 'opacity-60'}`}>
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-100 dark:bg-zinc-800"><Icon className="size-4 text-zinc-600 dark:text-zinc-300" /></div>
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{a.name}</div><div className="font-mono text-[11px] text-zinc-400">{a.id}</div></div>
                    <Badge status={a.enabled ? 'COMPLETED' : 'CANCELLED'} label={a.enabled ? 'On' : 'Off'} />
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-zinc-50 py-2 dark:bg-zinc-800/50"><dt className="text-[10px] text-zinc-500">Runs</dt><dd className="text-sm font-semibold tabular-nums">{a.runs}</dd></div>
                    <div className="rounded-lg bg-zinc-50 py-2 dark:bg-zinc-800/50"><dt className="text-[10px] text-zinc-500">Success</dt><dd className="text-sm font-semibold tabular-nums">{a.successRate == null ? '—' : `${Math.round(a.successRate * 100)}%`}</dd></div>
                    <div className="rounded-lg bg-zinc-50 py-2 dark:bg-zinc-800/50"><dt className="text-[10px] text-zinc-500">Cost</dt><dd className="text-sm font-semibold tabular-nums">${a.costUsd.toFixed(2)}</dd></div>
                  </dl>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                    <Pill>{a.timeoutSec}s timeout</Pill><Pill>{a.maxAttempts}× retries</Pill>{a.requiresApprovalAfter && <Pill tone="review">your approval</Pill>}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-zinc-400">Last run {ago(a.lastRun?.startedAt)}</span>
                    <form action={setAgentEnabled.bind(null, a.id, !a.enabled)}><Btn size="sm" tone={a.enabled ? 'ghost' : 'default'} icon={a.enabled ? PowerOff : Power}>{a.enabled ? 'Disable' : 'Enable'}</Btn></form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
