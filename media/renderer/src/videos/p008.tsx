import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, UrduText, prog, ease } from '../common';
import { CountUp } from '../Short';

/**
 * p008 · "Why Lahore's smog comes every winter" · vertical Short/Reel 1080x1920 for Chai & Curiosity.
 * Four painted illustrations (owner's ChatGPT) with slow camera moves, a fixed Urdu headline band,
 * drifting smog layers and simple diagram overlays (the warm "lid"). Captions own y≈1040-1380.
 */
const W = 1080, H = 1920;
const P = (n: number) => staticFile(`p008/paintings/${n}.png`);
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc', SMOG = '200,185,150';

const Shot: React.FC<{ n: number; a?: number; b?: number; zoom?: [number, number]; dx?: number; dy?: number; filter?: string }> = ({ n, a = 0, b = 1, zoom = [1.05, 1.16], dx = 0, dy = 0, filter }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const t = prog(f, a * d, b * d);
  const o = (a === 0 ? 1 : prog(f, a * d, a * d + 10)) * (b >= 1 ? 1 : 1 - prog(f, b * d - 10, b * d));
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(t);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Img src={P(n)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s}) translate(${dx * t}%, ${dy * t}%)`, filter }} />
    </AbsoluteFill>
  );
};

/** Slow drifting smog bands; density 0..1. */
const Smog: React.FC<{ density: number; top?: number }> = ({ density, top = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: density }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const x = ((f * (0.6 + i * 0.25) + random(`sx${i}`) * W) % (W * 2)) - W;
        return <div key={i} style={{ position: 'absolute', left: x, top: top + 260 + i * 260, width: W * 1.6, height: 420, borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(${SMOG},.55) 0%, rgba(${SMOG},0) 70%)`, filter: 'blur(18px)' }} />;
      })}
    </AbsoluteFill>
  );
};

/** Fixed headline band + chapter pill; brand line above the platform UI. */
const Frame: React.FC<{ chapter: string; children: React.ReactNode }> = ({ chapter, children }) => {
  const f = useCurrentFrame();
  const o = prog(f, 3, 14);
  return (
    <AbsoluteFill style={{ background: '#05090d' }}>
      {children}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,9,13,.9) 0%, rgba(5,9,13,0) 26%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: `linear-gradient(180deg, ${TEAL} 0%, rgba(15,59,68,.94) 80%, rgba(15,59,68,0) 100%)`, borderBottom: `4px solid ${AMBER}` }} />
      <div style={{ position: 'absolute', top: 200, left: 50, right: 50, textAlign: 'center' }}>
        <UrduText size={64} color={CREAM} style={{ lineHeight: 1.6 }}>لاہور کی <span style={{ color: AMBER }}>سموگ</span> سردیوں میں ہی کیوں؟</UrduText>
      </div>
      <div style={{ position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o }}>
        <div style={{ background: 'rgba(5,9,13,.72)', border: `2px solid ${AMBER}`, borderRadius: 40, padding: '0 34px 6px' }}>
          <UrduText size={42} color={AMBER}>{chapter}</UrduText>
        </div>
      </div>
      <Label size={26} color="rgba(255,255,255,.75)" weight={600} style={{ position: 'absolute', bottom: 500, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 50 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ background: 'rgba(5,9,13,.78)', border: `3px solid ${color}`, borderRadius: 22, padding: '2px 30px 10px' }}>
      <UrduText size={size} color={color}>{text}</UrduText>
    </div>
  </div>
);

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return { f, d, at: (x: number, len = 10) => prog(f, x * d, x * d + len) }; };

// 1 · Hook: Minar-e-Pakistan vanishing
const Scene1: React.FC = () => {
  const { f, d } = useT();
  return (<Frame chapter="مینار کہاں گیا؟"><Shot n={1} zoom={[1.02, 1.14]} dy={1.5} /><Smog density={interpolate(f, [0, d], [0.3, 0.9], { extrapolateRight: 'clamp' })} /></Frame>);
};

// 2 · Not fog: smoke (droplet vs soot)
const Scene2: React.FC = () => {
  const { at } = useT();
  return (<Frame chapter="دھند یا دھواں؟"><Shot n={1} zoom={[1.14, 1.24]} dy={-2} /><Smog density={0.7} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={at(0.15)}><circle cx={330} cy={720} r={80} fill="rgba(160,220,255,.35)" stroke="#9fd3ff" strokeWidth={4} /><circle cx={310} cy={700} r={18} fill="rgba(255,255,255,.7)" /></g>
      <g opacity={at(0.45)}>{Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={720 + (random(`p${i}`) - 0.5) * 150} cy={720 + (random(`q${i}`) - 0.5) * 150} r={8 + random(`r${i}`) * 12} fill="#3a3530" stroke="#8a7b62" strokeWidth={2} />)}</g>
    </svg>
    <Pill text="پانی کے قطرے" o={at(0.15)} y={830} color="#9fd3ff" size={40} />
    <Pill text="دھوئیں کے ذرات" o={at(0.45)} y={900} color={AMBER} size={40} />
  </Frame>);
};

// 3 · Smoke all year (sunny city)
const Scene3: React.FC = () => {
  const { at } = useT();
  const items: [string, number][] = [['گاڑیاں', 0.1], ['کارخانے', 0.35], ['بھٹے', 0.6]];
  return (<Frame chapter="دھواں سارا سال"><Shot n={2} zoom={[1.04, 1.16]} dx={-1.5} />
    {items.map(([t, x], i) => <Pill key={i} text={t} o={at(x)} y={560 + i * 120} size={46} />)}
  </Frame>);
};

// 4 · Summer: warm air lifts smoke away
const Scene4: React.FC = () => {
  const { f, at } = useT();
  return (<Frame chapter="گرمیوں میں"><Shot n={2} zoom={[1.16, 1.06]} dy={2} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: at(0.1) }}>
      {[260, 540, 820].map((x, i) => { const y = 980 - ((f * 4 + i * 90) % 420); return <g key={i}><path d={`M${x} 1000 L${x} ${y}`} stroke="#ffb070" strokeWidth={10} strokeLinecap="round" opacity={0.85} /><path d={`M${x - 26} ${y + 30} L${x} ${y} L${x + 26} ${y + 30}`} fill="none" stroke="#ffb070" strokeWidth={10} strokeLinecap="round" /></g>; })}
    </svg>
    <Pill text="گرم ہوا اوپر ← دھواں دور" o={at(0.35)} y={600} color="#ffb070" size={46} />
  </Frame>);
};

// 5 · Winter night: cold ground, warm layer above
const Scene5: React.FC = () => {
  const { at } = useT();
  return (<Frame chapter="سردی کی رات"><Shot n={3} zoom={[1.04, 1.14]} />
    <Pill text="اوپر: گرم ہوا" o={at(0.45)} y={560} color={AMBER} size={44} />
    <Pill text="نیچے: ٹھنڈی ہوا" o={at(0.2)} y={860} color="#7fd0ff" size={44} />
  </Frame>);
};

// 6 · The lid (diagram over the painting)
const Scene6: React.FC = () => {
  const { f, at } = useT();
  const lid = ease(at(0.1, 18));
  return (<Frame chapter="ڈھکن"><Shot n={3} zoom={[1.14, 1.2]} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <rect x={60} y={560 - (1 - lid) * 200} width={960} height={70} rx={35} fill="rgba(255,170,60,.45)" stroke={AMBER} strokeWidth={5} opacity={lid} />
      {Array.from({ length: 6 }).map((_, i) => { const x = 140 + i * 160; const up = 960 - ((f * 3 + i * 47) % 320); return <g key={i} opacity={at(0.3)}><path d={`M${x} 960 Q ${x + 20} ${(up + 960) / 2} ${x} ${Math.max(up, 650)}`} stroke="rgba(210,200,180,.85)" strokeWidth={8} fill="none" strokeLinecap="round" /><circle cx={x} cy={Math.max(up, 650)} r={10} fill="rgba(210,200,180,.9)" /></g>; })}
    </svg>
    <Pill text="ڈھکن" o={lid} y={650} color={AMBER} size={58} />
  </Frame>);
};

// 7 · Still air: smoke piles up
const Scene7: React.FC = () => {
  const { f, d } = useT();
  return (<Frame chapter="رکی ہوئی ہوا"><Shot n={3} zoom={[1.2, 1.26]} dx={1} filter="saturate(.85)" /><Smog density={interpolate(f, [0, d], [0.25, 0.85])} top={180} />
    <Pill text="نہ اوپر، نہ دور" o={prog(f, 0.4 * d, 0.4 * d + 10)} y={640} color="#d8cdb6" size={50} />
  </Frame>);
};

// 8 · November crop fires
const Scene8: React.FC = () => {
  const { at } = useT();
  return (<Frame chapter="نومبر کی آگ"><Shot n={4} zoom={[1.04, 1.16]} dx={1.5} />
    <Pill text="فصلوں کی باقیات" o={at(0.15)} y={600} color="#ff9a5a" size={46} />
    <Pill text="سرحد کے دونوں طرف" o={at(0.5)} y={720} color={AMBER} size={42} />
  </Frame>);
};

// 9 · Record: AQI above 1,000 (2024)
const Scene9: React.FC = () => {
  const { f, at } = useT();
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(f / 8));
  return (<Frame chapter="دو ہزار چوبیس"><Shot n={1} zoom={[1.2, 1.3]} filter="brightness(.75) sepia(.3)" /><Smog density={0.8} />
    <div style={{ position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', opacity: at(0.05) }}>
      <Label size={32} color="rgba(255,255,255,.85)" weight={700} style={{ letterSpacing: 4 }}>AIR QUALITY INDEX</Label>
      <div style={{ fontSize: 190, fontWeight: 900, color: `rgba(255,80,60,${pulse})`, fontFamily: 'Helvetica Neue, Arial', lineHeight: 1.05 }}><CountUp to={1000} suffix="+" durationFrames={40} /></div>
    </div>
    <Pill text="اسکول بند" o={at(0.6)} y={860} color="#ff6a5a" size={46} />
  </Frame>);
};

// 10 · Payoff: lid stays, smoke clears
const Scene10: React.FC = () => {
  const { f, d } = useT();
  return (<Frame chapter="حل کیا ہے؟"><Shot n={1} zoom={[1.06, 1.0]} /><Shot n={2} a={0.45} b={1} zoom={[1.0, 1.08]} />
    <Smog density={interpolate(f, [0, 0.5 * d], [0.8, 0], { extrapolateRight: 'clamp' })} />
    <Pill text="دھواں کم ← آسمان صاف" o={prog(f, 0.55 * d, 0.55 * d + 10)} y={620} color="#7dffb0" size={46} />
  </Frame>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];