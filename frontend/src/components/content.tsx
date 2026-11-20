import React from 'react';
import {
  AudioLines, Check, CheckCircle2, Clapperboard, FileText, LayoutPanelTop, Lightbulb, Loader2, Network, Package, Palette, Search, ShieldCheck, Sparkles, TrendingUp, Upload, UserRound, X,
  type LucideIcon,
} from 'lucide-react';
import { statusInfo } from './ui';

export const media = (projectId: string, rel: string) => `/media/${projectId}?path=${encodeURIComponent(rel)}`;

export const STEPS: Record<string, { label: string; icon: LucideIcon }> = {
  orchestrator: { label: 'Main Agent', icon: Network },
  trends: { label: 'Trends', icon: TrendingUp },
  ideas: { label: 'Ideas', icon: Lightbulb },
  research: { label: 'Research', icon: Search },
  script: { label: 'Script', icon: FileText },
  voice: { label: 'Voice', icon: AudioLines },
  storyboard: { label: 'Storyboard', icon: LayoutPanelTop },
  visuals: { label: 'Visuals', icon: Palette },
  video: { label: 'Render', icon: Clapperboard },
  qa: { label: 'Quality check', icon: ShieldCheck },
  'youtube.package': { label: 'YouTube package', icon: Package },
  'youtube.publish': { label: 'Upload', icon: Upload },
};

type StepTask = { agentId: string; status: string };

/** The video's journey: every agent step with its live state. */
export function Pipeline({ tasks, compact = false }: { tasks: StepTask[]; compact?: boolean }) {
  const steps = tasks.filter((t) => t.agentId !== 'orchestrator' && t.status !== 'CANCELLED');
  if (compact) {
    return (
      <div className="flex gap-1" aria-label="pipeline progress">
        {steps.map((t, i) => {
          const tone = statusInfo(t.status).tone;
          const c = tone === 'success' ? 'bg-emerald-500' : tone === 'review' ? 'bg-violet-500' : tone === 'ai' ? 'bg-sky-500 animate-pulse'
            : tone === 'human' ? 'bg-fuchsia-500 animate-pulse' : tone === 'progress' ? 'bg-amber-500 animate-pulse' : tone === 'danger' ? 'bg-red-500'
            : tone === 'warning' ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-700';
          return <div key={i} title={`${STEPS[t.agentId]?.label ?? t.agentId}: ${statusInfo(t.status).label}`} className={`h-1.5 flex-1 rounded-full ${c}`} />;
        })}
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
      {steps.map((t, i) => {
        const s = STEPS[t.agentId] ?? { label: t.agentId, icon: Sparkles };
        const info = statusInfo(t.status);
        const done = info.tone === 'success';
        const active = ['progress', 'ai', 'human', 'review'].includes(info.tone);
        const failed = info.tone === 'danger';
        const ring = done ? 'bg-emerald-500 text-white ring-emerald-500' : failed ? 'bg-red-500 text-white ring-red-500'
          : info.tone === 'review' ? 'bg-violet-500 text-white ring-violet-500' : info.tone === 'ai' ? 'bg-sky-500 text-white ring-sky-500'
          : info.tone === 'human' ? 'bg-fuchsia-500 text-white ring-fuchsia-500' : info.tone === 'progress' ? 'bg-amber-500 text-white ring-amber-500'
          : 'bg-white text-zinc-400 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700';
        const Icon = done ? Check : failed ? X : info.tone === 'progress' ? Loader2 : info.tone === 'review' ? UserRound : info.tone === 'ai' ? Sparkles : s.icon;
        return (
          <li key={i} className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-center ${active ? 'bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700' : ''}`}>
            <span className={`grid size-9 place-items-center rounded-full ring-2 ${ring}`}><Icon className={`size-4 ${info.tone === 'progress' ? 'animate-spin' : ''}`} /></span>
            <span className="text-xs font-medium leading-tight">{s.label}</span>
            <span className={`text-[11px] leading-tight ${active ? 'font-medium text-zinc-700 dark:text-zinc-200' : 'text-zinc-400'}`}>{info.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

type Scene = { title: string; visual: string; text: string };

/** Script for review: narration in its language, English production notes beside it. */
export function ScriptView({ scenes, titleOptions, words, targetWords }: { scenes: Scene[]; titleOptions?: string[]; words?: number; targetWords?: number }) {
  const urdu = (t: string) => /[؀-ۿ]/.test(t);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {titleOptions?.length ? (
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-zinc-500">Title options</div>
            <ol className="mt-1.5 space-y-1">{titleOptions.map((t, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm"><span className="text-xs text-zinc-400">{i + 1}</span><span dir="auto" className={urdu(t) ? 'urdu' : ''}>{t}</span></li>
            ))}</ol>
          </div>
        ) : null}
        {words ? (
          <div className="rounded-xl bg-zinc-50 px-4 py-2.5 text-center ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
            <div className="text-lg font-semibold tabular-nums">{words}</div>
            <div className="text-[11px] text-zinc-500">words · target {targetWords}</div>
          </div>
        ) : null}
      </div>
      <ol className="divide-y divide-zinc-100 overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:divide-zinc-800 dark:ring-zinc-800">
        {scenes.map((s, i) => (
          <li key={i} className="grid gap-3 bg-white p-4 md:grid-cols-[220px_1fr] dark:bg-zinc-900">
            <div>
              <div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-md bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">{i + 1}</span><span className="text-sm font-medium">{s.title}</span></div>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{s.visual}</p>
            </div>
            <p dir="auto" className={urdu(s.text) ? 'urdu text-[17px]' : 'text-[15px] leading-relaxed'}>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  return <video src={src} poster={poster} controls preload="metadata" className="aspect-video w-full rounded-xl bg-black shadow-lg shadow-zinc-950/10" />;
}

export const CheckRow = ({ pass, label, detail }: { pass: boolean; label: string; detail?: string }) => (
  <li className="flex items-start gap-2 text-sm">
    {pass ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <X className="mt-0.5 size-4 shrink-0 text-red-500" />}
    <span>{label}{detail ? <span className="ml-1 text-zinc-500">{detail}</span> : null}</span>
  </li>
);
