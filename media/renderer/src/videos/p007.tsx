import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BP, Label, prog, ease } from '../common';

/**
 * p007 · Mars Polar Lander Short (1080x1920). Painted illustrations (owner's ChatGPT; lander drawn with its
 * real THREE legs) + one NASA archive photo, with slow camera moves and blueprint HUD overlays.
 * Captions occupy y≈1000-1350, so overlays live in the top band (y 230-900).
 */
const W = 1080, H = 1920;
const P = (f: string) => staticFile(`p007/paintings/${f}`);

const Shot: React.FC<{ src: string; a?: number; b?: number; zoom?: [number, number]; dx?: number; dy?: number; shake?: number; archive?: boolean }> = ({ src, a = 0, b = 1, zoom = [1.04, 1.16], dx = 0, dy = 0, shake = 0, archive }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const t = prog(f, a * d, b * d);
  const o = (a === 0 ? 1 : prog(f, a * d, a * d + 8)) * (b >= 1 ? 1 : 1 - prog(f, b * d - 8, b * d));
  const sx = shake ? (random(`sx${f}`) - 0.5) * shake : 0, sy = shake ? (random(`sy${f}`) - 0.5) * shake : 0;
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(t);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={P(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s}) translate(${dx * t + sx}%, ${dy * t + sy}%)`,
        filter: archive ? 'sepia(.25) contrast(1.05) saturate(.85)' : 'none' }} />
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.18 }}>
      <svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 13} /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg>
    </AbsoluteFill>
  );
};

/** Pill tag: archive photo vs illustration vs data. */
const Tag: React.FC<{ text: string; sub?: string; o: number; color?: string; y?: number }> = ({ text, sub, o, color = BP.cyan, y = 240 }) => (
  <div style={{ position: 'absolute', top: y, left: 70, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
    <div style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 10, background: 'rgba(5,14,28,.78)', border: `2px solid ${color}` }}>
      <Label size={34} color={color} weight={800} style={{ letterSpacing: 2 }}>{text}</Label>
    </div>
    {sub && <Label size={24} color="rgba(255,255,255,.75)" weight={600} style={{ marginTop: 8, letterSpacing: 3 }}>{sub}</Label>}
  </div>
);

/** HUD panel (top right). */
const Panel: React.FC<{ o: number; color?: string; children: React.ReactNode; top?: number }> = ({ o, color = BP.cyan, children, top = 360 }) => (
  <div style={{ position: 'absolute', top, right: 70, width: 470, padding: '22px 26px', borderRadius: 18, background: 'rgba(5,14,28,.74)', border: `3px solid ${color}`, opacity: o,
    transform: `scale(${0.92 + 0.08 * o})`, transformOrigin: 'top right', fontFamily: 'inherit' }}>{children}</div>
);

const Vignette: React.FC = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,.6) 100%)' }} />;
const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return { f, d, at: (x: number, len = 8) => prog(f, x * d, x * d + len) }; };

// 1 · Hook: engines off at 40 m
const Scene1: React.FC = () => {
  const { f, at } = useT();
  const blink = Math.floor(f / 6) % 2 === 0;
  return (<AbsoluteFill><Shot src="3.png" zoom={[1.15, 1.05]} shake={0.6} /><Vignette />
    <Panel o={at(0, 6)} color={BP.fail}>
      <Label size={24} color={BP.fail} weight={700} style={{ letterSpacing: 3 }}>ALTITUDE</Label>
      <Label size={110} color={BP.fail} weight={900}>40 m</Label>
      <Label size={30} color={BP.fail} weight={800} style={{ opacity: blink ? 1 : 0.3, letterSpacing: 2 }}>ENGINES: OFF</Label>
    </Panel><Grain /></AbsoluteFill>);
};

// 2 · Launch (archive) → descent on 3 Dec 1999
const Scene2: React.FC = () => {
  const { at } = useT();
  return (<AbsoluteFill>
    <Shot src="launch.jpg" a={0} b={0.42} zoom={[1.0, 1.08]} dy={-2} archive />
    <Shot src="1.png" a={0.38} b={1} zoom={[1.05, 1.15]} />
    <Vignette />
    <Tag text="NASA ARCHIVE PHOTO" sub="LAUNCH · 3 JAN 1999" o={at(0.02) * (1 - at(0.38))} color="#ffd27a" />
    <Tag text="3 DEC 1999" sub="FINAL DESCENT · ILLUSTRATION" o={at(0.45)} />
    <Grain /></AbsoluteFill>);
};

// 3 · Nobody listening
const Scene3: React.FC = () => {
  const { at } = useT();
  return (<AbsoluteFill><Shot src="4.png" zoom={[1.03, 1.15]} /><Vignette />
    <Tag text="NO LIVE DATA PLANNED" sub="DURING LANDING · ILLUSTRATION" o={at(0.35)} color={BP.warn} />
    <Grain /></AbsoluteFill>);
};

/** Blueprint leg callout used in scenes 4-5. */
const LegCallout: React.FC<{ o: number; spike?: number }> = ({ o, spike = 0 }) => {
  const f = useCurrentFrame();
  const pts = Array.from({ length: 40 }).map((_, i) => {
    const x = 20 + i * 10; const hit = spike && i > 18 && i < 23 ? -60 * spike : 0;
    return `${x},${70 + Math.sin((i + f / 3) / 2) * 4 + hit}`;
  }).join(' ');
  return (
    <Panel o={o} color={spike ? BP.fail : BP.cyan} top={300}>
      <Label size={26} color={spike ? BP.fail : BP.cyan} weight={800} style={{ letterSpacing: 2 }}>TOUCHDOWN SENSOR</Label>
      <svg width={420} height={120} style={{ marginTop: 10 }}>
        <line x1={20} y1={70} x2={410} y2={70} stroke="rgba(255,255,255,.15)" strokeWidth={2} />
        <polyline points={pts} fill="none" stroke={spike ? BP.fail : BP.cyan} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {spike > 0 && <Label size={28} color={BP.fail} weight={900}>SPURIOUS SIGNAL!</Label>}
    </Panel>
  );
};

// 4 · Three legs deploy
const Scene4: React.FC = () => {
  const { at } = useT();
  return (<AbsoluteFill><Shot src="1.png" zoom={[1.15, 1.35]} dy={-3} /><Vignette />
    <Tag text="3 LEGS DEPLOY" sub="UNDER THE PARACHUTE" o={at(0.1)} />
    <LegCallout o={at(0.35)} /><Grain /></AbsoluteFill>);
};

// 5 · The jolt makes the sensors flicker
const Scene5: React.FC = () => {
  const { f, d, at } = useT();
  const spike = prog(f, 0.25 * d, 0.32 * d) * (1 - prog(f, 0.5 * d, 0.6 * d));
  return (<AbsoluteFill><Shot src="1.png" zoom={[1.35, 1.45]} dy={-3} shake={spike * 1.2} /><Vignette />
    <LegCallout o={at(0, 6)} spike={spike} /><Grain /></AbsoluteFill>);
};

// 6 · The software remembered
const Scene6: React.FC = () => {
  const { f, at } = useT();
  const lit = at(0.45);
  return (<AbsoluteFill><Shot src="2.png" zoom={[1.05, 1.12]} /><AbsoluteFill style={{ background: 'rgba(5,14,28,.45)' }} />
    <Panel o={at(0, 6)} color={lit ? BP.fail : BP.cyan} top={320}>
      <Label size={24} color="rgba(255,255,255,.7)" weight={700} style={{ letterSpacing: 3 }}>FLIGHT SOFTWARE MEMORY</Label>
      <div style={{ marginTop: 14, fontFamily: 'Menlo, monospace', fontSize: 36, color: lit ? BP.fail : '#9fb6c9' }}>touchdown =</div>
      <div style={{ fontFamily: 'Menlo, monospace', fontSize: 64, fontWeight: 800, color: lit ? BP.fail : '#9fb6c9', textShadow: lit && Math.floor(f / 8) % 2 ? `0 0 24px ${BP.fail}` : 'none' }}>{lit ? 'TRUE' : 'false'}</div>
      <Label size={24} color={BP.warn} weight={700} style={{ opacity: at(0.6), marginTop: 8 }}>should have been ignored</Label>
    </Panel><Grain /></AbsoluteFill>);
};

// 7 · At 40 m sensing switched on
const Scene7: React.FC = () => {
  const { f, d, at } = useT();
  const alt = Math.round(interpolate(ease(prog(f, 0, 0.55 * d)), [0, 1], [1500, 40]));
  const on = at(0.58);
  return (<AbsoluteFill><Shot src="2.png" zoom={[1.08, 1.2]} dy={2} /><Vignette />
    <Panel o={at(0, 6)} color={on ? BP.fail : BP.cyan}>
      <Label size={24} color={on ? BP.fail : BP.cyan} weight={700} style={{ letterSpacing: 3 }}>ALTITUDE</Label>
      <Label size={104} color={on ? BP.fail : BP.cyan} weight={900} style={{ fontVariantNumeric: 'tabular-nums' }}>{alt.toLocaleString('en-US')} m</Label>
      <Label size={28} color={on ? BP.fail : '#9fb6c9'} weight={800}>{on ? 'SENSING ON → "LANDED"' : 'TOUCHDOWN SENSING: OFF'}</Label>
    </Panel><Grain /></AbsoluteFill>);
};

// 8 · Engines off, ~50 mph
const Scene8: React.FC = () => {
  const { f, d, at } = useT();
  const mph = Math.round(interpolate(ease(prog(f, 0.15 * d, 0.7 * d)), [0, 1], [0, 50]));
  return (<AbsoluteFill><Shot src="3.png" zoom={[1.05, 1.3]} dy={3} shake={0.5} /><Vignette />
    <Panel o={at(0.05)} color={BP.fail}>
      <Label size={24} color={BP.fail} weight={700} style={{ letterSpacing: 3 }}>IMPACT SPEED (EST.)</Label>
      <Label size={88} color={BP.fail} weight={900} style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>~{mph} mph</Label>
      <Label size={28} color="rgba(255,255,255,.75)" weight={700}>≈ 22 m/s</Label>
    </Panel><Grain /></AbsoluteFill>);
};

// 9 · The deeper cause (review board)
const Scene9: React.FC = () => {
  const { at } = useT();
  return (<AbsoluteFill><Shot src="4.png" zoom={[1.15, 1.22]} /><AbsoluteFill style={{ background: 'rgba(5,14,28,.55)' }} />
    <div style={{ position: 'absolute', top: 280, left: 90, right: 90, padding: '30px 34px', borderRadius: 18, background: '#f3ead8', color: '#1a1a1a', opacity: at(0.05),
      transform: `rotate(-1.5deg) translateY(${(1 - at(0.05)) * 30}px)`, boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
      <Label size={24} color="#555" weight={700} style={{ letterSpacing: 2, textShadow: 'none' }}>JPL SPECIAL REVIEW BOARD · 2000</Label>
      <Label size={40} color="#1a1a1a" weight={900} style={{ marginTop: 12, textShadow: 'none' }}>Most probable cause: premature engine shutdown</Label>
      <Label size={34} color="#b3261e" weight={800} style={{ marginTop: 14, opacity: at(0.45), textShadow: 'none' }}>Underlying cause: software design &amp; testing</Label>
    </div><Grain /></AbsoluteFill>);
};

// 10 · Payoff: Phoenix landed safely
const Scene10: React.FC = () => {
  const { at } = useT();
  return (<AbsoluteFill><Shot src="5.png" zoom={[1.02, 1.12]} /><Vignette />
    <Tag text="PHOENIX · MAY 2008" sub="LANDED SAFELY · ILLUSTRATION" o={at(0.15)} color={BP.ok} />
    <Grain /></AbsoluteFill>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];