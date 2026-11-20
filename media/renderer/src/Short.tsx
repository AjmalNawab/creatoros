import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction,
} from 'remotion';
import { BP, SANS, URDU } from './common';
import { VIDEOS } from './videos';

/**
 * Vertical Short (1080x1920, 20-60 s). One narration line per beat; each line has its own visual
 * (from the per-video scene registry), word-level captions, and the first line is the hook.
 *
 * Safe zones (YouTube Shorts / Reels / TikTok UI): keep text out of the top 220 px, the bottom 480 px
 * and the right 140 px. Captions sit in the band y≈1040-1380.
 */
export type Word = { text: string; start: number; end: number }; // seconds, relative to the line
export type ShortLine = { id: number; text: string; audio: string; startFrame: number; durationFrames: number; words: Word[]; visual?: string };
export type ShortData = {
  key: string; language?: string; fps: number; width: number; height: number; totalFrames: number;
  lines: ShortLine[];
  brand: { name: string; handle?: string; accent?: string };
  endCard?: { title: string; cta: string };
  music?: { src: string; volume: number }; // optional bed, already mixed level (0-1)
};
type Props = { data: ShortData };

export const SAFE = { top: 220, bottom: 480, right: 140, side: 64 };
const END_FRAMES = 45; // end card length (frames), overlaps the last line's tail

/** Number that counts up while visible. Use inside scenes: <CountUp to={1940} /> */
export const CountUp: React.FC<{ to: number; from?: number; durationFrames?: number; decimals?: number; prefix?: string; suffix?: string; style?: React.CSSProperties }> = ({
  to, from = 0, durationFrames = 24, decimals = 0, prefix = '', suffix = '', style,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [0, durationFrames], [from, to], { extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  return <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{prefix}{v.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
};

/** Word-by-word captions: 2-4 words per page, active word pops and takes the accent colour. */
const Captions: React.FC<{ words: Word[]; accent: string; urdu: boolean; big?: boolean }> = ({ words, accent, urdu, big }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  if (!words.length) return null;
  // Page words: break on max 3 words or punctuation.
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= (big ? 2 : 3) || /[.,!?;:]$/.test(w.text)) { pages.push(cur); cur = []; }
  }
  if (cur.length) pages.push(cur);
  const page = pages.find((p) => t >= p[0].start - 0.05 && t < (pages[pages.indexOf(p) + 1]?.[0].start ?? Infinity) - 0.05) ?? (t < pages[0][0].start ? null : pages[pages.length - 1]);
  if (!page) return null;
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.right, top: big ? 1000 : 1080, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
      gap: '0 26px', direction: urdu ? 'rtl' : 'ltr' }}>
      {page.map((w, i) => {
        const appear = spring({ frame: f - Math.round(w.start * fps), fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
        // Exactly one highlighted word: active from its start until the next word starts (or its own end).
        const next = page[i + 1];
        const active = t >= w.start && t < (next ? next.start : w.end + 0.15);
        const shown = t >= w.start - 0.02;
        return (
          <span key={i} style={{
            fontFamily: urdu ? URDU : SANS, fontWeight: 900, fontSize: big ? 132 : 96, lineHeight: urdu ? 1.9 : 1.08,
            textTransform: urdu ? 'none' : 'uppercase', letterSpacing: urdu ? 0 : -1,
            color: active ? accent : '#ffffff', opacity: shown ? 1 : 0,
            transform: `scale(${shown ? 0.7 + 0.3 * appear : 0.7}) translateY(${(1 - appear) * 30}px)`,
            WebkitTextStroke: urdu ? undefined : '3px rgba(0,0,0,.85)', paintOrder: 'stroke fill',
            textShadow: '0 10px 30px rgba(0,0,0,.65), 0 3px 0 rgba(0,0,0,.6)',
          }}>{w.text}</span>
        );
      })}
    </div>
  );
};

/** Hook line: words slam in from oversized + blurred. */
const HookFlash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, 10], [0.55, 0.25, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: '#fff', opacity: o }} />;
};

const ProgressBar: React.FC<{ accent: string; total: number }> = ({ accent, total }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', top: 150, left: SAFE.side, right: SAFE.side, height: 10, borderRadius: 10, background: 'rgba(255,255,255,.18)' }}>
      <div style={{ width: `${Math.min(100, (f / total) * 100)}%`, height: '100%', borderRadius: 10, background: accent, boxShadow: `0 0 18px ${accent}` }} />
    </div>
  );
};

const EndCard: React.FC<{ title: string; cta: string; brand: ShortData['brand']; accent: string }> = ({ title, cta, brand, accent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 15 } });
  return (
    <AbsoluteFill style={{ background: `rgba(6,14,28,${0.82 * s})`, alignItems: 'center', justifyContent: 'center', paddingBottom: 200 }}>
      <div style={{ transform: `scale(${0.85 + 0.15 * s})`, opacity: s, textAlign: 'center', fontFamily: SANS, color: '#fff', padding: '0 90px' }}>
        <div style={{ width: 120, height: 120, margin: '0 auto 40px', borderRadius: 30, background: accent, display: 'grid', placeItems: 'center',
          fontSize: 58, fontWeight: 900 }}>{brand.name.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 2)}</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>{title}</div>
        <div style={{ marginTop: 34, fontSize: 46, fontWeight: 600, color: accent }}>{cta}</div>
        {brand.handle && <div style={{ marginTop: 24, fontSize: 38, opacity: 0.7 }}>{brand.handle}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Fallback visual when a line has no scene: blueprint grid + slow drift. */
const DefaultBackdrop: React.FC = () => {
  const f = useCurrentFrame();
  const off = (f * 0.4) % 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${BP.bg2}, ${BP.bg} 75%)` }}>
      <svg width={1080} height={1920}>
        <defs><pattern id="g" width={60} height={60} patternUnits="userSpaceOnUse" x={off} y={off}><path d="M60 0H0V60" fill="none" stroke={BP.grid} strokeWidth={1.5} /></pattern></defs>
        <rect width={1080} height={1920} fill="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Short: React.FC<Props> = ({ data }) => {
  const accent = data.brand.accent ?? BP.warn;
  const scenes = VIDEOS[`${data.key}`] ?? [];
  const urdu = data.language === 'ur';
  const last = data.lines[data.lines.length - 1];
  if (!last) return <AbsoluteFill style={{ background: BP.bg }} />;
  return (
    <AbsoluteFill style={{ background: BP.bg }}>
      {data.lines.map((l, i) => {
        const Scene = scenes[i] ?? DefaultBackdrop;
        return (
          <Sequence key={l.id} from={l.startFrame} durationInFrames={l.durationFrames} name={`${l.id}. ${l.text.slice(0, 30)}`}>
            <Scene />
            {/* darken behind captions for readability */}
            <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 58%, rgba(0,0,0,.55) 72%, rgba(0,0,0,0) 82%)' }} />
            <Audio src={staticFile(l.audio)} />
            <Captions words={l.words} accent={accent} urdu={urdu} big={i === 0} />
            {i === 0 && <HookFlash />}
          </Sequence>
        );
      })}
      {data.music && <Audio src={staticFile(data.music.src)} volume={data.music.volume} />}
      <ProgressBar accent={accent} total={data.totalFrames} />
      {data.endCard && (
        <Sequence from={Math.max(0, last.startFrame + last.durationFrames - END_FRAMES)} durationInFrames={END_FRAMES + 30}>
          <EndCard title={data.endCard.title} cta={data.endCard.cta} brand={data.brand} accent={accent} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

export const shortMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: props.data.totalFrames + (props.data.endCard ? 30 : 0), fps: props.data.fps, width: 1080, height: 1920,
});
