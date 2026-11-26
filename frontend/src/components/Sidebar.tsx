'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Activity, BarChart3, Bot, Building2, CheckCircle2, ChevronDown, Clapperboard, LayoutDashboard, Lightbulb, ListChecks, LogOut, Menu, MonitorUp,
  Radio, ScrollText, Sparkles, X,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export type NavCounts = { approvals: number; ai: number; actions: number; ideas: number };

type Item = { href: string; label: string; icon: typeof Activity; count?: keyof NavCounts; tone?: string };
const GROUPS: { label: string; items: Item[]; advanced?: boolean }[] = [
  { label: 'Today', items: [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/approvals', label: 'Approvals', icon: CheckCircle2, count: 'approvals', tone: 'bg-violet-600' },
    { href: '/actions', label: 'Ready to post', icon: MonitorUp, count: 'actions', tone: 'bg-fuchsia-600' },
    { href: '/ai', label: 'Waiting for Claude', icon: Sparkles, count: 'ai', tone: 'bg-sky-600' },
  ] },
  { label: 'Create', items: [
    { href: '/ideas', label: 'Ideas', icon: Lightbulb, count: 'ideas' },
    { href: '/content', label: 'Videos', icon: Clapperboard },
  ] },
  { label: 'Results', items: [
    { href: '/published', label: 'Published & stats', icon: BarChart3 },
  ] },
  { label: 'Settings', items: [
    { href: '/brand', label: 'Series & accounts', icon: Building2 },
    { href: '/platforms', label: 'Platforms', icon: Radio },
  ] },
  { label: 'Advanced', advanced: true, items: [
    { href: '/tasks', label: 'Tasks', icon: ListChecks },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/logs', label: 'Activity log', icon: ScrollText },
  ] },
];

export function Sidebar({ counts, brand, email }: { counts: NavCounts; brand: { name: string; handle?: string | null } | null; email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const [showAdvanced, setShowAdvanced] = useState(() => GROUPS.some((g) => g.advanced && g.items.some((it) => isActive(it.href))));
  const needsYou = counts.approvals + counts.actions;

  async function signOut() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {GROUPS.map((g) => (
        <div key={g.label}>
          {g.advanced ? (
            <button type="button" onClick={() => setShowAdvanced((v) => !v)} aria-expanded={showAdvanced}
              className="flex w-full items-center justify-between rounded-md px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              {g.label}<ChevronDown className={`size-3.5 transition ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          ) : <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{g.label}</div>}
          {(!g.advanced || showAdvanced) && <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(it.href);
              const n = it.count ? counts[it.count] : 0;
              return (
                <li key={it.href}>
                  <Link href={it.href} onClick={() => setOpen(false)}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${active
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'}`}>
                    <it.icon className={`size-4 shrink-0 ${active ? '' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200'}`} />
                    <span className="flex-1">{it.label}</span>
                    {n > 0 && <span className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 text-white ${it.tone ?? 'bg-zinc-500'}`}>{n}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>}
        </div>
      ))}
    </nav>
  );

  const header = (
    <div className="flex items-center gap-2.5 px-5 pt-5">
      <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm"><Activity className="size-4" /></div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">CreatorOS</div>
        <div className="text-[11px] text-zinc-500">AI content operations</div>
      </div>
    </div>
  );

  const brandBox = brand && (
    <Link href="/brand" className="mx-3 mt-4 flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">{brand.name.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 2) || brand.name.slice(0, 2)}</div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-medium">{brand.name}</div>
        <div className="truncate text-[11px] text-zinc-500">{brand.handle ?? 'Active brand'}</div>
      </div>
    </Link>
  );

  const footer = (
    <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <div className="grid size-7 place-items-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">{(email ?? '?')[0]?.toUpperCase()}</div>
        <div className="min-w-0 flex-1 truncate text-xs text-zinc-500">{email}</div>
        <button onClick={signOut} title="Sign out" className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"><LogOut className="size-4" /></button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-2 font-semibold"><Activity className="size-4 text-orange-500" />CreatorOS</div>
        <div className="flex items-center gap-2">
          {needsYou > 0 && <Link href="/approvals" className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">{needsYou} need you</Link>}
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Menu className="size-5" /></button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-zinc-50 shadow-xl dark:bg-zinc-950">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-md p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"><X className="size-4" /></button>
            {header}{brandBox}{nav}{footer}
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 lg:flex dark:border-zinc-800 dark:bg-zinc-950">
        {header}{brandBox}{nav}{footer}
      </aside>
    </>
  );
}
