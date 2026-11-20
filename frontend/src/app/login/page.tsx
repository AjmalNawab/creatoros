'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Loader2, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { inputCls } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('denied') ? 'This account is not allowed to use this workspace.' : null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(null);
    const f = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({ email: String(f.get('email')).trim(), password: String(f.get('password')) });
    if (error) { setBusy(false); return setError(error.message); }
    router.replace('/');
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,.12),transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"><Activity className="size-6" /></div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Sign in to CreatorOS</h1>
          <p className="mt-1 text-sm text-zinc-500">Your AI content operations control centre</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Email
            <input name="email" type="email" required autoComplete="email" className={`${inputCls} h-10`} />
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Password
            <input name="password" type="password" required autoComplete="current-password" className={`${inputCls} h-10`} />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          <button disabled={busy} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}{busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-400">Private workspace · runs locally on your Mac</p>
      </div>
    </main>
  );
}
