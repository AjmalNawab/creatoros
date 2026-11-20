import React from 'react';

export const media = (projectId: string, rel: string) => `/media/${projectId}?path=${encodeURIComponent(rel)}`;

type Scene = { title: string; visual: string; text: string };

/** Renders a script (scenes) for review: Urdu narration right-to-left, English notes left. */
export function ScriptView({ scenes, titleOptions, words, targetWords }: { scenes: Scene[]; titleOptions?: string[]; words?: number; targetWords?: number }) {
  return (
    <div className="space-y-4">
      {titleOptions?.length ? (
        <div>
          <div className="text-xs font-semibold uppercase text-zinc-500">Title options</div>
          <ol className="mt-1 list-decimal pl-5 text-sm" dir="auto">{titleOptions.map((t, i) => <li key={i} dir="auto">{t}</li>)}</ol>
        </div>
      ) : null}
      {words ? <div className="text-xs text-zinc-500">{words} words (target {targetWords})</div> : null}
      <ol className="space-y-3">
        {scenes.map((s, i) => (
          <li key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs font-semibold text-zinc-500">Scene {i + 1}: {s.title}</div>
            <div className="mt-0.5 text-xs italic text-zinc-500">{s.visual}</div>
            <p dir="rtl" lang="ur" className="mt-2 text-lg leading-loose" style={{ fontFamily: 'var(--font-urdu), "Noto Nastaliq Urdu", serif' }}>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function VideoPlayer({ src }: { src: string }) {
  return <video src={src} controls preload="metadata" className="aspect-video w-full rounded-lg bg-black" />;
}
