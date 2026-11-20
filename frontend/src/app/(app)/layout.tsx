import { OctagonX, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { emergencyStop, resumeSystem } from '@/lib/actions';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Sidebar } from '@/components/Sidebar';
import { Btn } from '@/components/ui';
import { createClient } from '@/utils/supabase/server';

type Overview = {
  emergencyStop: boolean; pendingApprovals: number; aiPending: number; actionsPending: number; ideasProposed: number;
  running: { agentId: string; type: string } | null;
  activeBrand: { name: string; youtube: { handle: string } | null };
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let ov: Overview | null = null;
  let apiError: string | null = null;
  try { ov = await api<Overview>('/overview'); } catch (e) { apiError = (e as Error).message; }
  const { data: { user } } = await (await createClient()).auth.getUser();

  return (
    <div className="min-h-screen lg:flex">
      <AutoRefresh />
      <Sidebar
        counts={{ approvals: ov?.pendingApprovals ?? 0, ai: ov?.aiPending ?? 0, actions: ov?.actionsPending ?? 0, ideas: ov?.ideasProposed ?? 0 }}
        brand={ov ? { name: ov.activeBrand.name, handle: ov.activeBrand.youtube?.handle } : null}
        email={user?.email}
      />
      <div className="min-w-0 flex-1">
        <header className={`sticky top-0 z-20 border-b backdrop-blur ${ov?.emergencyStop
          ? 'border-red-200 bg-red-50/90 dark:border-red-900 dark:bg-red-950/70'
          : 'border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/80'}`}>
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              {apiError ? (
                <span className="truncate text-red-600">⚠ API unreachable. Start it with <code className="font-mono">pnpm api</code></span>
              ) : ov?.emergencyStop ? (
                <span className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400"><OctagonX className="size-4" />Emergency stop active: no agent will run</span>
              ) : (
                <span className="flex min-w-0 items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
                  <span className="truncate">{ov?.running ? <>Working: <b className="font-medium text-zinc-900 dark:text-zinc-100">{ov.running.agentId}</b> · {ov.running.type}</> : 'System running · idle'}</span>
                </span>
              )}
            </div>
            {ov && (ov.emergencyStop
              ? <form action={resumeSystem}><Btn tone="primary" size="sm" icon={Play}>Resume system</Btn></form>
              : <form action={emergencyStop}><Btn tone="danger" size="sm" icon={OctagonX}>Emergency stop</Btn></form>)}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
