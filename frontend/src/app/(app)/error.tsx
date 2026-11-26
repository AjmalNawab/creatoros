'use client';
import { RotateCw, TriangleAlert } from 'lucide-react';
import { btnCls } from '@/components/btn-styles';

/** Friendly page error with a retry, instead of a crash screen. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = /fetch failed|ECONNREFUSED|API 5\d\d/.test(error.message);
  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto grid size-11 place-items-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50"><TriangleAlert className="size-5" /></div>
      <h2 className="mt-3 font-semibold">{offline ? 'The system is not responding' : 'This page could not load'}</h2>
      <p className="mt-1 text-sm text-zinc-500">{offline ? 'It may be restarting. Try again in a few seconds, or ask Claude Code to start it.' : 'Something went wrong while loading. Trying again usually fixes it.'}</p>
      <button onClick={reset} className={`${btnCls('primary')} mt-4`}><RotateCw className="size-4" />Try again</button>
      {error.digest && <p className="mt-3 font-mono text-[11px] text-zinc-400">ref {error.digest}</p>}
    </div>
  );
}
