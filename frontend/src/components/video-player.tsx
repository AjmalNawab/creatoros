'use client';
import { useState } from 'react';

/**
 * Plays a rendered video in the right frame shape. `vertical` is a hint from the server; the player also
 * checks the real video size once metadata loads, so vertical long-form videos never get side bars.
 */
export function VideoPlayer({ src, poster, vertical }: { src: string; poster?: string; vertical?: boolean }) {
  const [detected, setDetected] = useState<boolean | null>(null);
  const isVertical = detected ?? !!vertical;
  const onMeta = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.videoWidth && v.videoHeight) setDetected(v.videoHeight > v.videoWidth);
  };
  return isVertical
    ? <div className="flex justify-center rounded-xl bg-zinc-950 p-3"><video src={src} poster={poster} controls preload="metadata" onLoadedMetadata={onMeta} className="aspect-[9/16] max-h-[70vh] rounded-lg bg-black" /></div>
    : <video src={src} poster={poster} controls preload="metadata" onLoadedMetadata={onMeta} className="aspect-video w-full rounded-xl bg-black shadow-lg shadow-zinc-950/10" />;
}
