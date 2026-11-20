import React from 'react';
import {
  AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig,
  type CalculateMetadataFunction,
} from 'remotion';
import { SANS, prog, ease } from './common';

/**
 * Documentary style test: real archive photos + painted illustrations + motion + diagram overlay.
 * Each shot: a still image brought to life (slow push/drift), grain, vignette, dust, and an honest source tag.
 */
type Shot = { img: string; audio: string; seconds: number; tag: string; kind: 'archive' | 'illustration';
  move: { from: [number, number, number]; to: [number, number, number] }; // scale, x%, y%
  overlay?: 'launch' | 'control' | 'descent' | 'cutoff' };
export type StyleTestProps = { shots: Shot[]; fps: number };

const PAD = 0.7; // seconds of breathing room after each line

export const styleTestMetadata: CalculateMetadataFunction<StyleTestProps> = ({ props }) => ({
  durationInFrames: Math.round(props.shots.reduce((s, x) => s + x.seconds + PAD, 0) * props.fps) + 45,
  fps: props.fps, width: 1920, height: 1080,
});

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.22, pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 17} /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Dust: React.FC<{ n?: number; color?: string }> = ({ n = 40, color = '255,220,170' }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: n }).map((_, i) => {
          const x = (random(`dx${i}`) * 1920 + f * (0.3 + random(`dv${i}`) * 0.8)) % 1920;
          const y = (random(`dy${i}`) * 1080 - f * (0.1 + random(`du${i}`) * 0.3) + 1080) % 1080;
          return <circle key={i} cx={x} cy={y} r={0.8 + random(`dr${i}`) * 2.2} fill={`rgba(${color},${0.15 + random(`do${i}`) * 0.35})`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ kind: Shot['kind']; text: string }> = ({ kind, text }) => {
  const f = useCurrentFrame();
  const o = prog(f, 8, 22);
  return (
    <div style={{ position: 'absolute', left: 72, top: 64, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontFamily: SANS }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#fff7ed', letterSpacing: 1, textShadow: '0 2px 12px rgba(0,0,0,.7)' }}>{text}</div>
      <div style={{ marginTop: 8, display: 'inline-block', fontSize: 18, letterSpacing: 2, padding: '4px 10px', borderRadius: 4,
        color: kind === 'archive' ? '#0b1020' : '#ffe7b0', background: kind === 'archive' ? '#ffd27a' : 'rgba(255,231,176,.12)',
        border: kind === 'archive' ? 'none' : '1px solid rgba(255,231,176,.5)' }}>
        {kind === 'archive' ? 'NASA ARCHIVE PHOTO' : 'ILLUSTRATION'}
      </div>
    </div>
  );
};

/** Blueprint-style altimeter used in the descent shots. */
const Altimeter: React.FC<{ from: number; to: number; alert?: boolean }> = ({ from, to, alert }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const alt = Math.round(interpolate(ease(prog(f, 10, durationInFrames * 0.6)), [0, 1], [from, to]));
  const blink = alert && Math.floor(f / 8) % 2 === 0;
  const col = alert ? '#ff5a4f' : '#7fe0ff';
  return (
    <div style={{ position: 'absolute', right: 80, top: 80, width: 330, fontFamily: SANS, color: col, opacity: prog(f, 6, 20),
      border: `2px solid ${col}`, borderRadius: 10, padding: '18px 22px', background: 'rgba(5,15,30,.55)', backdropFilter: 'blur(2px)' }}>
      <div style={{ fontSize: 18, letterSpacing: 3, opacity: 0.85 }}>ALTITUDE</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{alt.toLocaleString()} m</div>
      <div style={{ height: 2, background: col, opacity: 0.5, margin: '10px 0' }} />
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, opacity: alert ? (blink ? 1 : 0.35) : 0.9 }}>
        {alert ? 'ENGINES: CUT OFF' : 'LEGS: DEPLOYED'}
      </div>
    </div>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: prog(f, 4, 12) }}>
      <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 600, color: '#fff', padding: '10px 22px', borderRadius: 10,
        background: 'rgba(0,0,0,.45)', lineHeight: 1.5 }}>{text}</span>
    </div>
  );
};

const ShotView: React.FC<{ s: Shot; line: string; dur: number }> = ({ s, line, dur }) => {
  const f = useCurrentFrame();
  const t = ease(prog(f, 0, dur));
  const [s0, x0, y0] = s.move.from; const [s1, x1, y1] = s.move.to;
  const scale = s0 + (s1 - s0) * t; const x = x0 + (x1 - x0) * t; const y = y0 + (y1 - y0) * t;
  const fade = Math.min(prog(f, 0, 14), 1 - prog(f, dur - 12, dur));
  // Launch: brief camera shake. Cut-off: a slow drop, as if the camera holds while the lander falls.
  const shake = s.overlay === 'launch' ? (random(`sh${f}`) - 0.5) * 6 * (1 - prog(f, 0, dur)) : 0;
  const flicker = s.overlay === 'control' ? 0.92 + 0.08 * Math.sin(f / 3) * random(`fl${Math.floor(f / 4)}`) : 1;
  return (
    <AbsoluteFill style={{ opacity: fade, background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translate(${x + shake}%, ${y + shake * 0.6}%)`, filter: `brightness(${flicker})` }}>
        <Img src={staticFile(s.img)} style={{ width: '100%', height: '100%', objectFit: 'cover',
          filter: s.kind === 'archive' ? 'sepia(.25) contrast(1.05) saturate(.85)' : 'none' }} />
      </AbsoluteFill>
      {(s.overlay === 'descent' || s.overlay === 'cutoff') && <Dust n={55} />}
      {s.overlay === 'control' && <Dust n={20} color="200,230,255" />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.65) 100%)' }} />
      {s.overlay === 'descent' && <Altimeter from={1500} to={60} />}
      {s.overlay === 'cutoff' && <Altimeter from={60} to={40} alert />}
      {s.overlay === 'cutoff' && <AbsoluteFill style={{ background: '#ff2a1a', mixBlendMode: 'overlay', opacity: 0.12 + 0.1 * Math.sin(f / 5) }} />}
      <Tag kind={s.kind} text={s.tag} />
      <Subtitle text={line} />
      <Grain />
    </AbsoluteFill>
  );
};

const LINES = [
  'In 1998, NASA engineers finished a small robot bound for the south pole of Mars.',
  'On January third, 1999, it left Earth.',
  'Eleven months later, on December third, the team waited for its first call home.',
  'As it descended, its three landing legs swung out into position.',
  'Investigators believe that about forty metres above the ground, its engines shut off. The call never came.',
];

export const StyleTest: React.FC<StyleTestProps> = ({ shots, fps }) => {
  let at = 0;
  const end = Math.round(shots.reduce((s, x) => s + x.seconds + PAD, 0) * fps);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {shots.map((s, i) => {
        const dur = Math.round((s.seconds + PAD) * fps);
        const from = at; at += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur + 12} name={s.tag}>
            <ShotView s={s} line={LINES[i]} dur={dur + 12} />
            <Audio src={staticFile(s.audio)} />
          </Sequence>
        );
      })}
      <Sequence from={end} durationInFrames={45} name="End card">
        <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: SANS, color: '#ffd27a', fontSize: 34, letterSpacing: 6 }}>MARGIN OF SAFETY</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
