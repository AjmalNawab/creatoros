import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, NightSky, UrduText, prog, ease } from '../common';

/**
 * p010 · "Pakistan's first astronaut to China's space station" (Shenzhou-24) · vertical 1080x1920, Chai & Curiosity.
 * Colourful night-sky SVG animation (no photos of real people or agency imagery). Fixed Urdu headline band on top;
 * diagrams in y≈460-1300; captions sit near the bottom (bottom 330).
 */
const W = 1080, H = 1920;
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc', PK = '#1f8a4c', CYAN = '#7fe0ff';

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return { f, d, at: (x: number, len = 14) => prog(f, x * d, x * d + len) }; };

const Frame: React.FC<{ chapter: string; children: React.ReactNode }> = ({ chapter, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a2350 0%, #0b1020 60%, #05070f 100%)' }}>
      <NightSky stars={110} />
      {children}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 330, background: `linear-gradient(180deg, ${TEAL} 0%, rgba(15,59,68,.95) 80%, rgba(15,59,68,0) 100%)`, borderBottom: `4px solid ${AMBER}` }} />
      <div style={{ position: 'absolute', top: 120, left: 40, right: 40, textAlign: 'center' }}>
        <UrduText size={60} color={CREAM} style={{ lineHeight: 1.6 }}>پہلا <span style={{ color: '#7dffb0' }}>پاکستانی</span>، چین کے خلائی اسٹیشن پر</UrduText>
      </div>
      <div style={{ position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: prog(f, 3, 15) }}>
        <div style={{ background: 'rgba(5,9,13,.72)', border: `2px solid ${AMBER}`, borderRadius: 40, padding: '0 34px 6px' }}>
          <UrduText size={42} color={AMBER}>{chapter}</UrduText>
        </div>
      </div>
      <Label size={26} color="rgba(255,255,255,.7)" weight={600} style={{ position: 'absolute', bottom: 250, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 46 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ background: 'rgba(5,9,13,.8)', border: `3px solid ${color}`, borderRadius: 22, padding: '2px 30px 10px' }}><UrduText size={size} color={color}>{text}</UrduText></div>
  </div>
);

/** Long March-style rocket (generic, white with a green band for Pakistan's first astronaut). */
const Rocket: React.FC<{ x: number; y: number; s?: number; flame?: number; rot?: number }> = ({ x, y, s = 1, flame = 1, rot = 0 }) => {
  const f = useCurrentFrame();
  const fl = 0.8 + 0.2 * Math.sin(f / 2);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {flame > 0 && <g opacity={flame}><ellipse cx={0} cy={250} rx={34} ry={110 * fl} fill="#ffb020" /><ellipse cx={0} cy={230} rx={18} ry={70 * fl} fill="#fff3c4" /></g>}
      <rect x={-30} y={-180} width={60} height={360} rx={10} fill="#eef2f7" />
      <path d="M-30 -180 Q0 -280 30 -180 Z" fill="#dde3ea" />
      <rect x={-30} y={-40} width={60} height={22} fill={PK} />
      {[-1, 1].map((k) => <rect key={k} x={k * 30 + (k < 0 ? -26 : 0)} y={60} width={26} height={120} rx={8} fill="#cfd6df" />)}
      <path d="M-56 180 L-30 120 L-30 180 Z M56 180 L30 120 L30 180 Z" fill="#9aa4b2" />
    </g>
  );
};

/** T-shaped station: core with two lab modules and solar wings. */
const Station: React.FC<{ x: number; y: number; s?: number; hi?: number }> = ({ x, y, s = 1, hi = -1 }) => {
  const mod = (i: number) => (hi === i ? AMBER : '#dfe6ee');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-1, 1].map((k) => <g key={k}><rect x={k * 260 + (k < 0 ? -200 : 0)} y={-26} width={200} height={52} fill="#2b5fb0" stroke="#9cc4ff" strokeWidth={3} />{Array.from({ length: 5 }).map((_, i) => <line key={i} x1={k * 260 + (k < 0 ? -200 : 0) + 40 * i} y1={-26} x2={k * 260 + (k < 0 ? -200 : 0) + 40 * i} y2={26} stroke="#9cc4ff" strokeWidth={2} />)}</g>)}
      <rect x={-260} y={-34} width={520} height={68} rx={30} fill={mod(1)} />
      <rect x={-50} y={-34} width={100} height={260} rx={34} fill={mod(0)} />
      <circle cx={0} cy={240} r={22} fill="#b9c3cf" />
    </g>
  );
};

const Earth: React.FC<{ cy?: number; r?: number }> = ({ cy = 2300, r = 1300 }) => (
  <g><circle cx={W / 2} cy={cy} r={r + 30} fill="rgba(127,224,255,.18)" /><circle cx={W / 2} cy={cy} r={r} fill="#1e5a8a" /><path d={`M${W / 2 - 500} ${cy - r + 120} q160 -60 300 10 t260 -20`} stroke="#3f8f3a" strokeWidth={60} fill="none" strokeLinecap="round" opacity={0.8} /></g>
);

// 1 · Hook: night launch with a Pakistani aboard
const Scene1: React.FC = () => {
  const { f, d, at } = useT();
  const lift = ease(prog(f, 0.15 * d, d));
  return (<Frame chapter="ایک تاریخی صبح">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={1320} width={W} height={600} fill="#3a2a1c" />
      <path d="M0 1320 Q270 1280 540 1320 T1080 1300 L1080 1340 L0 1340Z" fill="#5a4030" />
      <rect x={350} y={940} width={40} height={380} fill="#6b7280" opacity={1 - lift} />
      <Rocket x={540} y={1100 - lift * 900} flame={at(0.1)} />
      {Array.from({ length: 26 }).map((_, i) => { const t = (f / 40 + random(`sm${i}`)) % 1; return <circle key={i} cx={540 + (random(`sx${i}`) - 0.5) * 520 * t} cy={1320 - 40 * t} r={30 + 60 * t} fill={`rgba(220,220,230,${0.45 * (1 - t) * at(0.1)})`} />; })}
    </svg>
    <Pill text="پہلا پاکستانی، مدار میں" o={at(0.45)} y={520} color="#7dffb0" size={50} />
  </Frame>);
};

// 2 · How he was chosen
const Scene2: React.FC = () => {
  const { at } = useT();
  const pick = at(0.55, 20);
  return (<Frame chapter="انتخاب اور تربیت">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={at(0.05)}><circle cx={250} cy={640} r={90} fill="rgba(31,138,76,.3)" stroke={PK} strokeWidth={5} /><circle cx={830} cy={640} r={90} fill="rgba(255,90,90,.25)" stroke="#ff7a7a" strokeWidth={5} />
        <path d="M350 640 L730 640" stroke={AMBER} strokeWidth={6} strokeDasharray="20 14" /><path d="M705 620 L735 640 L705 660" fill="none" stroke={AMBER} strokeWidth={6} /></g>
      {[380, 700].map((x, i) => { const chosen = i === 0; const o = chosen ? 1 : 1 - 0.6 * pick; return (<g key={i} opacity={at(0.25) * o} transform={`translate(${x} 930)`}>
        <circle cy={-120} r={56} fill={chosen && pick > 0.5 ? AMBER : '#cfd6df'} /><path d="M-90 80 Q-90 -50 0 -50 Q90 -50 90 80 Z" fill={chosen && pick > 0.5 ? AMBER : '#cfd6df'} />
        {chosen && <circle cx={50} cy={-20} r={16} fill={PK} stroke="#fff" strokeWidth={4} />}</g>); })}
    </svg>
    <Label size={34} color={CREAM} weight={700} style={{ position: 'absolute', top: 750, left: 150, opacity: at(0.08) }}>PAKISTAN</Label>
    <Label size={34} color={CREAM} weight={700} style={{ position: 'absolute', top: 750, right: 170, opacity: at(0.08) }}>CHINA</Label>
    <Pill text="دو امیدوار ← ایک پرواز" o={at(0.3)} y={1070} size={44} />
    <Pill text="کردار: پے لوڈ اسپیشلسٹ" o={at(0.75)} y={1170} color={CYAN} size={44} />
  </Frame>);
};

// 3 · The launch: up and sideways into orbit
const Scene3: React.FC = () => {
  const { f, d, at } = useT();
  const t = ease(prog(f, 0.05 * d, 0.85 * d));
  const x = 200 + 680 * t, y = 1250 - 700 * Math.sin(t * Math.PI / 2);
  return (<Frame chapter="روانگی">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <Earth cy={2500} r={1250} />
      <path d={`M200 1250 Q 200 550 880 550`} stroke={AMBER} strokeWidth={5} fill="none" strokeDasharray="14 12" opacity={0.7} />
      <Rocket x={x} y={y} s={0.45} rot={90 * t} />
    </svg>
    <Label size={40} color={AMBER} weight={800} style={{ position: 'absolute', top: 470, width: '100%', textAlign: 'center', opacity: at(0.08) }}>5:18 AM · PAKISTAN TIME</Label>
    <Pill text="جیوچوان ← لانگ مارچ ٹو ایف" o={at(0.25)} y={560} color={CREAM} size={42} />
    <Pill text="تیز رفتاری = مدار" o={at(0.7)} y={1170} color={CYAN} size={46} />
  </Frame>);
};

// 4 · The chase and docking (~3.5 h)
const Scene4: React.FC = () => {
  const { f, d, at } = useT();
  const t = prog(f, 0.05 * d, 0.8 * d);
  const R = 340, cx = W / 2, cy = 830;
  const aS = -Math.PI / 2 + 1.2 + t * 2.2, aC = -Math.PI / 2 - 0.6 + t * (2.2 + 1.8);
  const hrs = (3.5 * t).toFixed(1);
  const docked = t >= 0.999;
  return (<Frame chapter="پیچھا اور ڈاکنگ">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={cy} r={200} fill="#1e5a8a" /><circle cx={cx} cy={cy} r={215} fill="none" stroke="rgba(127,224,255,.35)" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={3} strokeDasharray="10 10" />
      <g transform={`translate(${cx + R * Math.cos(aS)} ${cy + R * Math.sin(aS)})`}><Station x={0} y={0} s={0.12} /></g>
      {!docked && <circle cx={cx + (R - 10) * Math.cos(aC)} cy={cy + (R - 10) * Math.sin(aC)} r={14} fill={AMBER} />}
      {docked && <circle cx={cx + R * Math.cos(aS)} cy={cy + R * Math.sin(aS)} r={50 + 20 * Math.sin(f / 4)} fill="none" stroke="#7dffb0" strokeWidth={5} />}
    </svg>
    <Label size={70} color={AMBER} weight={900} style={{ position: 'absolute', top: 1190, width: '100%', textAlign: 'center', fontVariantNumeric: 'tabular-nums', opacity: at(0.05) }}>{`${hrs} h`}</Label>
    <Pill text="ڈاکنگ: تیانہے سے" o={at(0.82)} y={470} color="#7dffb0" size={46} />
  </Frame>);
};

// 5 · What Tiangong is
const Scene5: React.FC = () => {
  const { f, d, at } = useT();
  const hi = f < 0.35 * d ? 0 : f < 0.65 * d ? 1 : -1;
  return (<Frame chapter="تیان گونگ: آسمانی محل">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <Earth cy={2350} r={1100} />
      <g transform={`rotate(${interpolate(f, [0, d], [-4, 4])} 540 820)`}><Station x={540} y={760} s={1.25} hi={hi} /></g>
    </svg>
    <Pill text="تیانہے · دو ہزار اکیس" o={at(0.08) * (1 - at(0.35))} y={1180} color={AMBER} size={44} />
    <Pill text="وین تیان + منگ تیان · دو ہزار بائیس" o={at(0.38) * (1 - at(0.65))} y={1180} color={AMBER} size={42} />
    <Pill text="پہلا غیر ملکی مہمان" o={at(0.72)} y={1180} color="#7dffb0" size={46} />
  </Frame>);
};

// 6 · A week of science
const Scene6: React.FC = () => {
  const { f, at } = useT();
  const day = Math.min(7, 1 + Math.floor(at(0.1, 1) * f / 26));
  return (<Frame chapter="ایک ہفتہ، سائنس کے نام">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <rect x={140} y={560} width={800} height={620} rx={40} fill="rgba(223,230,238,.08)" stroke="#9cc4ff" strokeWidth={4} />
      {Array.from({ length: 6 }).map((_, i) => { const x = 260 + i * 115 + Math.sin(f / 20 + i) * 10; const y = 780 + Math.cos(f / 25 + i * 1.7) * 40; return <g key={i} opacity={at(0.2 + i * 0.04)} transform={`translate(${x} ${y}) rotate(${Math.sin(f / 30 + i) * 20})`}><rect x={-22} y={-70} width={44} height={140} rx={20} fill="rgba(127,224,255,.25)" stroke={CYAN} strokeWidth={4} /><rect x={-18} y={0} width={36} height={60} rx={16} fill={['#7dffb0', '#ffb070', '#ff8ad8'][i % 3]} opacity={0.8} /></g>; })}
      {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={230 + i * 90} y={1050} width={70} height={70} rx={12} fill={i < day ? AMBER : 'rgba(255,255,255,.12)'} opacity={at(0.1)} />)}
    </svg>
    <Pill text="پاکستانی یونیورسٹیوں کے تجربے" o={at(0.35)} y={470} color="#7dffb0" size={44} />
    <Label size={30} color={CREAM} weight={700} style={{ position: 'absolute', top: 1140, width: '100%', textAlign: 'center', opacity: at(0.1) }}>{`DAY ${day} / 7`}</Label>
  </Frame>);
};

// 7 · The way home (seat swap) + question
const Scene7: React.FC = () => {
  const { f, d, at } = useT();
  const down = ease(prog(f, 0.4 * d, 0.85 * d));
  return (<Frame chapter="واپسی کا راستہ">
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <Station x={540} y={620} s={0.6} />
      <g opacity={at(0.08)} transform="translate(840 560)"><circle r={42} fill={AMBER} /><text y={14} textAnchor="middle" fontSize={34} fontWeight={900} fill="#0b1020" fontFamily="Helvetica Neue, Arial">1y</text></g>
      <g transform={`translate(540 ${840 + down * 230})`} opacity={at(0.3)}>
        {down > 0.2 && <path d="M-110 -170 Q0 -300 110 -170 Z" fill="#ff7a5a" stroke="#fff" strokeWidth={3} />}
        {down > 0.2 && <path d="M-100 -175 L-30 -40 M100 -175 L30 -40" stroke="#fff" strokeWidth={3} />}
        <path d="M-60 -40 L60 -40 L80 40 L-80 40 Z" fill="#cfd6df" />
        {[-40, 0, 40].map((x, i) => <circle key={i} cx={x} cy={0} r={12} fill={i === 1 ? PK : '#6b7280'} />)}
      </g>
    </svg>
    <Pill text="شین ژو تئیس سے واپسی" o={at(0.35) * (1 - at(0.75))} y={1170} color={CYAN} size={44} />
    <Pill text="آپ خلا میں پہلے کیا دیکھنا چاہیں گے؟" o={at(0.8)} y={1170} color={AMBER} size={42} />
  </Frame>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];