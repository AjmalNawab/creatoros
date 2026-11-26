import { Bot, ChevronDown, Square, Sparkles, Zap } from 'lucide-react';
import { runClaude, setClaudeAuto, stopClaude } from '@/lib/actions';
import { Btn, ago } from './ui';

export type OperatorStatus = {
  running: boolean; auto: boolean; pending: number; backoff: boolean;
  run: { trigger: 'button' | 'auto'; startedAt: string; finishedAt?: string; exitCode?: number | null; summary?: string; log: string[] } | null;
};

/** "Process with Claude": start/stop the background Claude run, the Auto switch, and its live log. */
export function ClaudePanel({ st, compact = false }: { st: OperatorStatus; compact?: boolean }) {
  const last = st.run;
  const state = st.running ? 'Claude is working on it…'
    : st.pending ? `${st.pending} thing${st.pending === 1 ? '' : 's'} waiting for Claude`
    : 'Nothing waiting for Claude';
  return (
    <section className={`rounded-2xl border bg-white shadow-sm dark:bg-zinc-900 ${st.running ? 'border-sky-300 dark:border-sky-800' : 'border-zinc-200/80 dark:border-zinc-800'}`}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${st.running ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600 dark:bg-sky-950/50'}`}>
          {st.running ? <Sparkles className="size-5 animate-pulse" /> : <Bot className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{state}</div>
          <div className="text-xs text-zinc-500">
            {st.running && last ? `Started ${ago(last.startedAt)}${last.trigger === 'auto' ? ' automatically' : ''}. It writes research, scripts, scenes and captions. You still approve and post.`
              : last?.finishedAt ? `Last run ${ago(last.finishedAt)}${last.exitCode === 0 ? '' : ' (stopped early)'}.`
              : 'Claude writes research, scripts, scenes and captions here. It never approves or posts.'}
            {st.auto && st.backoff && !st.running ? ' Auto is waiting a few minutes because the last runs changed nothing.' : ''}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <form action={setClaudeAuto.bind(null, !st.auto)}>
            <button type="submit" role="switch" aria-checked={st.auto} title="Start automatically whenever new work appears"
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${st.auto ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}>
              <span className={`relative h-5 w-9 rounded-full transition ${st.auto ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${st.auto ? 'left-[18px]' : 'left-0.5'}`} /></span>
              <Zap className="size-3.5" />Auto
            </button>
          </form>
          {st.running
            ? <form action={stopClaude}><Btn tone="default" icon={Square} pendingLabel="Stopping…">Stop</Btn></form>
            : <form action={runClaude}><Btn tone="primary" icon={Sparkles} disabled={!st.pending} pendingLabel="Starting…">Process with Claude</Btn></form>}
        </div>
      </div>
      {!compact && last && (
        <details open={st.running} className="group border-t border-zinc-100 dark:border-zinc-800">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 px-5 py-3 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><ChevronDown className="size-3.5 transition group-open:rotate-180" />{st.running ? 'What Claude is doing (live)' : 'What Claude did last time'}</summary>
          {last.summary && !st.running && <p className="bidi-lines mx-5 mb-3 rounded-xl bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-900 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:ring-emerald-900">{last.summary}</p>}
          <pre className="bidi-lines mx-5 mb-5 max-h-80 overflow-auto rounded-xl bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200">{last.log.join('\n') || 'Starting…'}</pre>
        </details>
      )}
    </section>
  );
}
