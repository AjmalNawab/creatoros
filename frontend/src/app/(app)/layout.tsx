import Link from 'next/link';
import { OctagonX, Play, TriangleAlert } from 'lucide-react';
import { api, currentUser } from '@/lib/api';
import { emergencyStop, resumeSystem } from '@/lib/actions';
import { LiveRefresh } from '@/components/live-refresh';
import { Sidebar } from '@/components/Sidebar';
import { Btn, ConfirmBtn } from '@/components/ui';
import { stepDoing } from '@/components/content';

export type Status = {
  pendingApprovals: number; aiPending: number; actionsPending: number; ideasProposed: number; emergencyStop: boolean;
  running: { agentId: string; type: string | null; projectId: string | null; title: string | null } | null;
  activeBrand: { name: string; youtube: { handle: string } | null } | null;
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [st, user] = await Promise.all([api<Status>('/status').catch(() => null), currentUser()]);

  return (
    <div className="min-h-screen lg:flex">
      <LiveRefresh />
      <Sidebar
        counts={{ approvals: st?.pendingApprovals ?? 0, ai: st?.aiPending ?? 0, actions: st?.actionsPending ?? 0, ideas: st?.ideasProposed ?? 0 }}
        brand={st?.activeBrand ? { name: st.activeBrand.name, handle: st.activeBrand.youtube?.handle } : null}
        email={user?.email}
      />
      <div className="min-w-0 flex-1">
        <header className={`sticky top-0 z-20 border-b backdrop-blur ${st?.emergencyStop
          ? 'border-red-200 bg-red-50/90 dark:border-red-900 dark:bg-red-950/70'
          : 'border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/80'}`}>
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              {!st ? (
                <span className="flex items-center gap-2 truncate text-red-600"><TriangleAlert className="size-4 shrink-0" />The system is offline. Ask Claude Code to start it.</span>
              ) : st.emergencyStop ? (
                <span className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400"><OctagonX className="size-4" />Paused: nothing will run until you resume</span>
              ) : (
                <span className="flex min-w-0 items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="relative flex size-2 shrink-0">
                    {st.running && <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60" />}
                    <span className={`relative inline-flex size-2 rounded-full ${st.running ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  </span>
                  {st.running ? (
                    <span className="truncate">
                      <b className="font-medium text-zinc-900 dark:text-zinc-100">{stepDoing(st.running.agentId)}</b>
                      {st.running.title && <> · <Link href={st.running.projectId ? `/content/${st.running.projectId}` : '/'} className="hover:underline"><bdi>{st.running.title.split(' | ')[0]}</bdi></Link></>}
                    </span>
                  ) : <span className="truncate">Ready · nothing running right now</span>}
                </span>
              )}
            </div>
            {st && (st.emergencyStop
              ? <form action={resumeSystem}><Btn tone="success" size="sm" icon={Play}>Resume</Btn></form>
              : <form action={emergencyStop}><ConfirmBtn tone="ghost" size="sm" message="Pause everything? Running work stops and nothing new starts until you press Resume." icon={<OctagonX className="size-3.5" />} className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">Pause all</ConfirmBtn></form>)}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
