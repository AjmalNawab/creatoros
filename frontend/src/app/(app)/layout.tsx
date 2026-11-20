import Link from 'next/link';
import { api } from '@/lib/api';
import { emergencyStop, resumeSystem } from '@/lib/actions';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Btn } from '@/components/ui';

type Overview = { emergencyStop: boolean; pendingApprovals: number };

const NAV = [
  ['/', 'Overview'], ['/agents', 'Agents'], ['/tasks', 'Tasks'], ['/approvals', 'Approvals'], ['/logs', 'System logs'],
] as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let ov: Overview | null = null;
  let apiError: string | null = null;
  try { ov = await api<Overview>('/overview'); } catch (e) { apiError = (e as Error).message; }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:flex">
      <AutoRefresh />
      <aside className="border-b border-zinc-200 p-4 dark:border-zinc-800 md:w-56 md:border-b-0 md:border-r">
        <div className="mb-4 text-lg font-semibold">CreatorOS</div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-zinc-200/60 dark:hover:bg-zinc-800">
              {label}{label === 'Approvals' && ov?.pendingApprovals ? <span className="ml-2 rounded-full bg-violet-600 px-1.5 text-xs text-white">{ov.pendingApprovals}</span> : null}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className={`flex items-center justify-between gap-3 border-b px-6 py-3 ${ov?.emergencyStop ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40' : 'border-zinc-200 dark:border-zinc-800'}`}>
          <div className="text-sm">
            {apiError ? <span className="text-red-600">API unreachable: {apiError}</span>
              : ov?.emergencyStop ? <span className="font-semibold text-red-700 dark:text-red-400">⛔ EMERGENCY STOP ACTIVE — no agents will run</span>
              : <span className="text-emerald-700 dark:text-emerald-400">● System running</span>}
          </div>
          {ov && (ov.emergencyStop
            ? <form action={resumeSystem}><Btn tone="primary">Resume system</Btn></form>
            : <form action={emergencyStop}><Btn tone="danger">Emergency stop</Btn></form>)}
        </header>
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </div>
    </div>
  );
}
