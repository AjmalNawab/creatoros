import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { btnCls, iconCls, type BtnSize, type BtnTone } from './btn-styles';
import { FormPending } from './buttons';

export { btnCls } from './btn-styles';
export { ConfirmBtn } from './buttons';

/* ------------------------------------------------------------------ status */

type Tone = 'neutral' | 'info' | 'progress' | 'review' | 'success' | 'warning' | 'danger' | 'ai' | 'human';

const TONE: Record<Tone, string> = {
  neutral: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:ring-zinc-700',
  info: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900',
  progress: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  review: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
  warning: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-900',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900',
  ai: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900',
  human: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:ring-fuchsia-900',
};
const DOT: Record<Tone, string> = {
  neutral: 'bg-zinc-400', info: 'bg-sky-500', progress: 'bg-amber-500', review: 'bg-violet-500', success: 'bg-emerald-500',
  warning: 'bg-orange-500', danger: 'bg-red-500', ai: 'bg-sky-500', human: 'bg-fuchsia-500',
};

const STATUS: Record<string, { tone: Tone; label: string; live?: boolean }> = {
  PENDING: { tone: 'neutral', label: 'Waiting' },
  QUEUED: { tone: 'info', label: 'Queued' },
  RUNNING: { tone: 'progress', label: 'Running', live: true },
  WAITING_AI: { tone: 'ai', label: 'Needs AI', live: true },
  WAITING_HUMAN: { tone: 'human', label: 'Ready to upload', live: true },
  AWAITING_APPROVAL: { tone: 'review', label: 'Needs approval' },
  COMPLETED: { tone: 'success', label: 'Done' },
  SUCCEEDED: { tone: 'success', label: 'Succeeded' },
  APPROVED: { tone: 'success', label: 'Approved' },
  SELECTED: { tone: 'success', label: 'Selected' },
  DONE: { tone: 'success', label: 'Done' },
  FAILED: { tone: 'warning', label: 'Retrying' },
  TIMED_OUT: { tone: 'warning', label: 'Timed out' },
  CHANGES_REQUESTED: { tone: 'warning', label: 'Changes requested' },
  DEFERRED: { tone: 'info', label: 'Paused' },
  DEAD: { tone: 'danger', label: 'Failed' },
  REJECTED: { tone: 'danger', label: 'Rejected' },
  ABORTED: { tone: 'danger', label: 'Aborted' },
  CANCELLED: { tone: 'neutral', label: 'Cancelled' },
  BLOCKED: { tone: 'danger', label: 'Blocked' },
  PROPOSED: { tone: 'review', label: 'Proposed' },
};
export const statusInfo = (s: string) => STATUS[s] ?? { tone: 'neutral' as Tone, label: s.replace(/_/g, ' ').toLowerCase() };

/** Back-compat for pages that colour by status. */
export const STATUS_STYLE: Record<string, string> = Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, TONE[v.tone]]));

export function Badge({ status, label, tone }: { status?: string; label?: string; tone?: Tone }) {
  const info = status ? statusInfo(status) : { tone: tone ?? 'neutral', label: label ?? '', live: false };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE[info.tone]}`}>
      <span className="relative flex size-1.5">
        {info.live && <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${DOT[info.tone]}`} />}
        <span className={`relative inline-flex size-1.5 rounded-full ${DOT[info.tone]}`} />
      </span>
      {label ?? info.label}
    </span>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE[tone]}`}>{children}</span>;
}

/* ------------------------------------------------------------------ layout */

export function PageHeader({ title, description, icon: Icon, actions }: { title: React.ReactNode; description?: React.ReactNode; icon?: LucideIcon; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"><Icon className="size-5 text-zinc-600 dark:text-zinc-300" /></div>}
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className = '', padded = true }: {
  title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; padded?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-950/[.03] dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, icon: Icon, tone = 'neutral', hint }: { label: string; value: React.ReactNode; icon?: LucideIcon; tone?: Tone; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-950/[.03] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        {Icon && <span className={`grid size-7 place-items-center rounded-lg ring-1 ring-inset ${TONE[tone]}`}><Icon className="size-3.5" /></span>}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="grid size-11 place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-800"><Icon className="size-5 text-zinc-500" /></div>
      <div className="mt-3 font-medium">{title}</div>
      {children && <div className="mt-1 max-w-md text-sm text-zinc-500">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ controls */

/**
 * Button. Inside a <form>, it shows a spinner while the action runs (and blocks double clicks).
 * Pass name/value when one form has several buttons, so only the clicked one spins.
 */
export function Btn({ children, tone = 'default', icon: Icon, size = 'md', pendingLabel, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: BtnTone; icon?: LucideIcon; size?: BtnSize; pendingLabel?: string }) {
  return (
    <button type="submit" {...p} className={`${btnCls(tone, size)} ${p.className ?? ''}`}>
      {Icon && <Icon className={iconCls(size)} />}{children}
      {(p.type ?? 'submit') === 'submit' && <FormPending name={p.name} value={typeof p.value === 'string' ? p.value : undefined} label={pendingLabel} />}
    </button>
  );
}

/** A link that looks like a button (navigation, external pages, downloads). */
export function LinkBtn({ href, children, tone = 'default', size = 'md', icon: Icon, external, className = '' }: {
  href: string; children: React.ReactNode; tone?: BtnTone; size?: BtnSize; icon?: LucideIcon; external?: boolean; className?: string;
}) {
  const cls = `${btnCls(tone, size)} ${className}`;
  const inner = <>{Icon && <Icon className={iconCls(size)} />}{children}</>;
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
    : <Link href={href} className={cls}>{inner}</Link>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70 ${className}`} />;
}

export const inputCls = 'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-900';
export const textareaCls = 'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-900';

/** Short (9:16) / Long (16:9) segmented control. Posts `format`. */
export function FormatToggle({ defaultValue = 'long' }: { defaultValue?: 'short' | 'long' }) {
  return (
    <div role="radiogroup" aria-label="Format" className="inline-flex h-10 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-sm dark:border-zinc-700 dark:bg-zinc-800">
      {[['short', 'Short'], ['long', 'Long']].map(([v, l]) => (
        <label key={v} className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 font-medium text-zinc-500 transition has-[:checked]:bg-white has-[:checked]:text-zinc-900 has-[:checked]:shadow-sm dark:has-[:checked]:bg-zinc-950 dark:has-[:checked]:text-white">
          <input type="radio" name="format" value={v} defaultChecked={v === defaultValue} className="sr-only" />
          <span className={`inline-block rounded-[3px] border-2 border-current ${v === 'short' ? 'h-3.5 w-2' : 'h-2 w-3.5'}`} />{l}
        </label>
      ))}
    </div>
  );
}

/** English / Urdu segmented control (works inside <form>, posts `language`). */
export function LanguageToggle({ defaultValue }: { defaultValue: string }) {
  return (
    <div role="radiogroup" aria-label="Video language" className="inline-flex h-10 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-sm dark:border-zinc-700 dark:bg-zinc-800">
      {[['en', 'English'], ['ur', 'اردو']].map(([v, l]) => (
        <label key={v} className="flex cursor-pointer items-center rounded-md px-3 font-medium text-zinc-500 transition has-[:checked]:bg-white has-[:checked]:text-zinc-900 has-[:checked]:shadow-sm dark:has-[:checked]:bg-zinc-950 dark:has-[:checked]:text-white">
          <input type="radio" name="language" value={v} defaultChecked={v === defaultValue} className="sr-only" />
          <span className={v === 'ur' ? 'urdu text-base leading-none' : ''}>{l}</span>
        </label>
      ))}
    </div>
  );
}

export type SeriesOption = { id: string; name: string; active: boolean; profile: { language: string } };

/** Pick which series (brand) a video or idea round is for; its language, voice and style follow. Posts `brandId`. */
export function SeriesPicker({ series }: { series: SeriesOption[] }) {
  const def = series.find((s) => s.active)?.id ?? series[0]?.id;
  return (
    <div role="radiogroup" aria-label="Series" className="inline-flex h-10 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-sm dark:border-zinc-700 dark:bg-zinc-800">
      {series.map((s) => (
        <label key={s.id} className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-3 font-medium text-zinc-500 transition has-[:checked]:bg-white has-[:checked]:text-zinc-900 has-[:checked]:shadow-sm dark:has-[:checked]:bg-zinc-950 dark:has-[:checked]:text-white">
          <input type="radio" name="brandId" value={s.id} defaultChecked={s.id === def} className="sr-only" />
          {s.profile.language === 'ur' ? <span className="urdu text-base leading-none">اردو</span> : <span>EN</span>}
          <span className="hidden sm:inline">· {s.name}</span>
        </label>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ misc */

export const ago = (d?: string | Date | null) => {
  if (!d) return '—';
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export const Json = ({ value }: { value: unknown }) => (
  <pre className="max-h-72 overflow-auto rounded-xl bg-zinc-50 p-3 font-mono text-xs leading-relaxed ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{JSON.stringify(value, null, 2)}</pre>
);
