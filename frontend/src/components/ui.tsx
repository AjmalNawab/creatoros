import React from 'react';

export const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  QUEUED: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  RUNNING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse',
  AWAITING_APPROVAL: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  SUCCEEDED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  FAILED: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  TIMED_OUT: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  DEAD: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  ABORTED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  CANCELLED: 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  WAITING_AI: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 animate-pulse',
  WAITING_HUMAN: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 animate-pulse',
  DEFERRED: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  BLOCKED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

export const Badge = ({ status }: { status: string }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? STATUS_STYLE.PENDING}`}>
    {status.replace(/_/g, ' ').toLowerCase()}
  </span>
);

export const Card = ({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
    {title && <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>}
    {children}
  </section>
);

export const Stat = ({ label, value, tone = '' }: { label: string; value: React.ReactNode; tone?: string }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div className="text-xs text-zinc-500">{label}</div>
    <div className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
  </div>
);

export const Btn = ({ children, tone = 'default', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'danger' | 'primary' | 'ghost' }) => {
  const t = {
    default: 'border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800',
    primary: 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
  }[tone];
  return <button {...p} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${t} ${p.className ?? ''}`}>{children}</button>;
};

export const ago = (d?: string | Date | null) => {
  if (!d) return '—';
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString();
};

export const Json = ({ value }: { value: unknown }) => (
  <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-950">{JSON.stringify(value, null, 2)}</pre>
);
