import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BP, Blueprint, Label, prog, ease } from '../common';

/**
 * p011 · "The Crack That Stranded a Space Station Crew (Shenzhou-20)" · 1920x1080 · Margin of Safety.
 * FIRST REAL-FOOTAGE VIDEO: licensed NASA public-domain clips (content/<slug>/footage/manifest.json) + blueprint diagrams.
 * No Chinese state-media or Roscosmos footage is used; Shenzhou/Tiangong are only drawn as diagrams. Every real clip is tagged.
 */
const W = 1920, H = 1080;
const AMBER = '#ffd27a';
const F = (f: string) => staticFile(`p011/footage/${f}`);

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d, fps } = useVideoConfig(); return { f, d, fps, at: (x: number, len = 14) => prog(f, x * d, x * d + len) }; };

const Beat: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const { f, d } = useT();
  const o = (a === 0 ? 1 : prog(f, a * d, a * d + 15)) * (b >= 1 ? 1 : 1 - prog(f, b * d - 15, b * d));
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** A real NASA clip, muted, starting at `from` seconds inside the file, with a slow push-in. */
const Clip: React.FC<{ src: string; from?: number; a?: number; b?: number; zoom?: [number, number]; dim?: number }> = ({ src, from = 0, a = 0, b = 1, zoom = [1.03, 1.1], dim = 0 }) => {
  const { f, d, fps } = useT();
  const t = prog(f, a * d, b * d);
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(t);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${s})` }}>
        {/* Restart the clip's clock at the beat start, so `from` is exactly what shows when the beat begins. */}
        <Sequence from={Math.round(a * d)} layout="none">
          <OffthreadVideo src={F(src)} muted startFrom={Math.round(from * fps)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Sequence>
      </AbsoluteFill>
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.5) 100%)' }} />
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string; sub?: string; o: number; color?: string }> = ({ text, sub, o, color = AMBER }) => (
  <div style={{ position: 'absolute', top: 60, left: 70, opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
    <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 8, background: 'rgba(5,14,28,.82)', border: `2px solid ${color}` }}>
      <Label size={26} color={color} weight={800} style={{ letterSpacing: 2 }}>{text}</Label>
    </div>
    {sub && <Label size={22} color="rgba(255,255,255,.85)" weight={600} style={{ marginTop: 6, letterSpacing: 2 }}>{sub}</Label>}
  </div>
);

const Chapter: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const { f } = useT();
  const o = prog(f, 0, 10) * (1 - prog(f, 90, 105));
  return (
    <div style={{ position: 'absolute', right: 70, top: 60, opacity: o, textAlign: 'right' }}>
      <Label size={22} color={AMBER} weight={700} style={{ letterSpacing: 5 }}>{`CHAPTER ${n}`}</Label>
      <Label size={40} color="#fff" weight={800}>{title}</Label>
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; o: number; color?: string; children: React.ReactNode }> = ({ x, y, w, o, color = BP.cyan, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, padding: '20px 26px', borderRadius: 16, background: 'rgba(5,14,28,.84)', border: `3px solid ${color}`, opacity: o, transform: `scale(${0.94 + 0.06 * o})`, transformOrigin: 'top left' }}>{children}</div>
);

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.12 }}><svg width="100%" height="100%"><filter id="g11"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 11} /></filter><rect width="100%" height="100%" filter="url(#g11)" /></svg></AbsoluteFill>);
};

const T: React.FC<{ x: number; y: number; s?: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode }> = ({ x, y, s = 30, c = '#fff', w = 800, a = 'middle', o = 1, children }) => (
  <text x={x} y={y} textAnchor={a} fill={c} fontSize={s} fontWeight={w} fontFamily="Helvetica Neue, Arial" opacity={o}>{children}</text>
);

/** Cracked window drawing: crack branches grow with k (0..1). */
const Window: React.FC<{ cx: number; cy: number; r: number; k: number }> = ({ cx, cy, r, k }) => {
  const cracks = Array.from({ length: 7 }).map((_, i) => {
    const ang = random(`ca${i}`) * Math.PI * 2; const len = r * (0.35 + random(`cl${i}`) * 0.5) * k;
    const mx = cx + Math.cos(ang + 0.3) * len * 0.5, my = cy + Math.sin(ang + 0.3) * len * 0.5;
    return `M${cx + 6} ${cy - 4} Q${mx} ${my} ${cx + Math.cos(ang) * len} ${cy + Math.sin(ang) * len}`;
  });
  return (<g>
    <circle cx={cx} cy={cy} r={r + 26} fill="none" stroke={BP.line} strokeWidth={6} />
    <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={BP.line} strokeWidth={2} opacity={0.6} />
    <circle cx={cx} cy={cy} r={r} fill="rgba(95,211,255,.12)" stroke={BP.cyan} strokeWidth={4} />
    {k > 0 && <circle cx={cx + 6} cy={cy - 4} r={10} fill={BP.fail} />}
    {cracks.map((dd, i) => <path key={i} d={dd} stroke={BP.fail} strokeWidth={4} fill="none" strokeLinecap="round" />)}
  </g>);
};

// ───────────── 1 · Cold open: a leaf on the window
const Scene1: React.FC = () => {
  const { at } = useT();
  const k = ease(at(0.42, 60));
  return (<AbsoluteFill>
    <Beat a={0} b={0.4}><Clip src="iss-earth-view.mp4" from={0} a={0} b={0.4} /><Tag text="NASA FOOTAGE" sub="EARTH FROM THE INTERNATIONAL SPACE STATION · ILLUSTRATIVE" o={at(0.02)} /></Beat>
    <Beat a={0.36} b={0.74}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><Window cx={760} cy={520} r={260} k={k} />
        <T x={1380} y={430} s={34} c={AMBER} a="start">FINAL CHECKS · NOV 2025</T>
        <T x={1380} y={490} s={30} a="start" o={at(0.45)}>“A leaf on the window?”</T>
        <T x={1380} y={560} s={30} c={BP.fail} a="start" o={at(0.6)}>Cracks · some through the pane</T>
      </svg></Beat>
    <Beat a={0.7} b={0.8}><Clip src="impact-testing.mp4" from={31.5} a={0.7} b={0.8} zoom={[1.05, 1.18]} /><Tag text="NASA ARCHIVE" sub="SPACE SHUTTLE WINDOW PITTED BY DEBRIS (STS-7, 1983)" o={at(0.71)} /></Beat>
    <Beat a={0.77} b={1}><Clip src="impact-testing.mp4" from={39} a={0.77} b={1} zoom={[1.04, 1.14]} /><Tag text="NASA FOOTAGE" sub="HYPERVELOCITY IMPACT TEST · WHAT A TINY PARTICLE DOES" o={at(0.79)} /></Beat>
    <Grain />
  </AbsoluteFill>);
};

// ───────────── 2 · Why the window matters
const Scene2: React.FC = () => {
  const { f, at } = useT();
  const heat = at(0.15, 30);
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform="translate(700 560)" opacity={at(0.02)}>
        <path d="M-260 180 L-150 -200 L150 -200 L260 180 Z" fill="rgba(95,211,255,.08)" stroke={BP.line} strokeWidth={5} />
        <path d="M-300 180 Q0 300 300 180" fill="rgba(255,122,26,.25)" stroke={BP.warn} strokeWidth={6} />
        <circle cx={80} cy={-40} r={46} fill="rgba(95,211,255,.2)" stroke={BP.cyan} strokeWidth={4} />
        {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${-320 + i * 80} ${330 + ((f * 6 + i * 30) % 90)} l20 -60`} stroke={BP.warn} strokeWidth={5} opacity={heat} />)}
      </g>
      <T x={700} y={240} s={34} c={AMBER} o={at(0.04)}>RETURN CAPSULE: THE ONLY PART THAT COMES HOME</T>
      <T x={700} y={1000} s={30} c={BP.warn} o={heat}>RE-ENTRY HEAT &amp; LOADS</T>
      <g opacity={at(0.5)} transform="translate(1450 520)">
        {[0, 1, 2].map((i) => <rect key={i} x={-120 + i * 34} y={-190} width={22} height={380} fill="rgba(95,211,255,.25)" stroke={BP.cyan} strokeWidth={3} />)}
        <path d={`M-108 -40 l${30 * at(0.6, 40)} 40 l${-20 * at(0.6, 40)} 50`} stroke={BP.fail} strokeWidth={5} fill="none" />
        <T x={0} y={250} s={28} c={BP.cyan}>MULTI-PANE WINDOW</T>
      </g>
    </svg>
    <Card x={1150} y={810} w={660} o={at(0.75)} color={BP.fail}><Label size={30} color={BP.fail} weight={800}>CMSA: “FAILED TO MEET REQUIREMENTS”</Label><Label size={26} color="#fff" weight={600}>Might be fine is not a standard for carrying people home.</Label></Card>
    <Chapter n={1} title="Why the window matters" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 3 · The likely culprit: debris
const Scene3: React.FC = () => {
  const { f, at } = useT();
  return (<AbsoluteFill>
    <Beat a={0} b={0.36}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={960} cy={560} r={230} fill="rgba(30,90,138,.5)" stroke={BP.cyan} strokeWidth={4} />
        {[300, 360, 420].map((r, i) => <ellipse key={i} cx={960} cy={560} rx={r + 60} ry={r * 0.55} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={2} transform={`rotate(${i * 35 - 20} 960 560)`} />)}
        {Array.from({ length: 120 }).map((_, i) => { const r = 300 + random(`dr${i}`) * 180; const a0 = random(`da${i}`) * 6.28 + f * (0.004 + random(`dv${i}`) * 0.01); return <circle key={i} cx={960 + Math.cos(a0) * (r + 60)} cy={560 + Math.sin(a0) * r * 0.55} r={2 + random(`ds${i}`) * 3} fill={i % 9 ? '#cfd6df' : BP.fail} />; })}
      </svg>
      <Card x={80} y={170} w={560} o={at(0.08)}><Label size={30} color={AMBER} weight={800}>LOW EARTH ORBIT IS CROWDED</Label><Label size={26} color="#fff" weight={600}>Paint flecks, rocket fragments, shards · most too small to track</Label></Card>
    </Beat>
    <Beat a={0.33} b={0.68}><Clip src="impact-testing.mp4" from={15} a={0.33} b={0.68} zoom={[1.02, 1.1]} /><Tag text="NASA FOOTAGE" sub="HYPERVELOCITY IMPACT TESTING · WHITE SANDS TEST FACILITY" o={at(0.35)} /></Beat>
    <Beat a={0.64} b={0.86}><Clip src="impact-testing.mp4" from={39} a={0.64} b={0.86} zoom={[1.05, 1.15]} /><Tag text="NASA FOOTAGE" sub="WHAT A TINY HIGH-SPEED PARTICLE DOES" o={at(0.66)} /></Beat>
    <Beat a={0.83} b={1}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <T x={960} y={360} s={40} c={AMBER}>SIZE OF THE OBJECT: UNKNOWN</T>
        <T x={960} y={470} s={34}>Estimates: under 1 mm … to 1–10 cm</T>
        <T x={960} y={580} s={30} c={BP.cyan} o={at(0.9)}>Station not leaking · crew safe · the ride home was the problem</T>
      </svg></Beat>
    <Chapter n={2} title="The likely culprit" /><Grain />
  </AbsoluteFill>);
};

/** Simple station + docked ships diagram. */
const StationDiagram: React.FC<{ swap: number; empty: boolean }> = ({ swap, empty }) => (
  <g>
    <rect x={760} y={500} width={400} height={80} rx={36} fill="rgba(95,211,255,.12)" stroke={BP.line} strokeWidth={4} />
    <rect x={910} y={580} width={100} height={220} rx={40} fill="rgba(95,211,255,.12)" stroke={BP.line} strokeWidth={4} />
    {[-1, 1].map((k) => <rect key={k} x={k < 0 ? 520 : 1160} y={515} width={240} height={50} fill="rgba(43,95,176,.6)" stroke="#9cc4ff" strokeWidth={3} />)}
    <g transform="translate(700 420)"><rect x={-60} y={-40} width={120} height={80} rx={20} fill="rgba(255,59,59,.25)" stroke={BP.fail} strokeWidth={4} /><T x={0} y={-60} s={24} c={BP.fail}>SHENZHOU-20 (damaged)</T></g>
    <g transform={`translate(${1220 + swap * 300} ${420 - swap * 180})`} opacity={1}><rect x={-60} y={-40} width={120} height={80} rx={20} fill="rgba(61,220,151,.2)" stroke={BP.ok} strokeWidth={4} /><T x={0} y={-60} s={24} c={BP.ok}>SHENZHOU-21</T></g>
    {empty && <T x={960} y={900} s={32} c={BP.fail}>NO CERTIFIED LIFEBOAT FOR THE CREW ABOARD</T>}
  </g>
);

// ───────────── 4 · The lifeboat swap
const Scene4: React.FC = () => {
  const { f, d, at } = useT();
  const swap = ease(prog(f, 0.45 * d, 0.7 * d));
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><StationDiagram swap={swap} empty={swap > 0.95} />
      <T x={960} y={220} s={36} c={AMBER} o={at(0.05)}>RULE: THE NEWEST SHIP STAYS DOCKED AS THE LIFEBOAT</T>
      <T x={1520} y={260} s={30} c={BP.ok} o={at(0.45)}>14 NOV 2025: Shenzhou-20 crew flies home in Shenzhou-21</T>
    </svg>
    <Chapter n={3} title="The lifeboat swap" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 5 · An empty ship to the rescue
const Scene5: React.FC = () => {
  const { at } = useT();
  const pts: [string, string, number, string][] = [['14 NOV 2025', 'Crew swap · gap begins', 0.1, BP.fail], ['~25 NOV 2025', 'Shenzhou-22 launched uncrewed', 0.3, BP.ok], ['DEC 2025', 'Spacewalk photographs the cracks', 0.55, BP.cyan], ['19 JAN 2026', 'Damaged Shenzhou-20 lands empty', 0.75, AMBER]];
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <line x1={180} y1={560} x2={1740} y2={560} stroke={BP.line} strokeWidth={4} opacity={0.7} />
      {pts.map(([dt, txt, a, c], i) => { const x = 260 + i * 470; return (<g key={i} opacity={at(a)}>
        <circle cx={x} cy={560} r={20} fill={c} /><T x={x} y={500} s={30} c={c}>{dt}</T><T x={x} y={630} s={26} w={600}>{txt}</T></g>); })}
      <g opacity={at(0.3)} transform="translate(730 820)"><rect x={-70} y={-40} width={140} height={80} rx={20} fill="rgba(61,220,151,.2)" stroke={BP.ok} strokeWidth={4} /><T x={0} y={10} s={22} c={BP.ok}>EMPTY</T><T x={0} y={90} s={24} w={600}>+ porthole crack repair device</T></g>
    </svg>
    <Card x={1260} y={760} w={560} o={at(0.4)} color={BP.ok}><Label size={30} color={BP.ok} weight={800}>GAP WITHOUT A LIFEBOAT</Label><Label size={28} color="#fff" weight={700}>≈ 11 days · not months</Label></Card>
    <Chapter n={4} title="An empty ship" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 6 · It has happened before (ISS, real NASA footage)
const Scene6: React.FC = () => {
  const { at } = useT();
  return (<AbsoluteFill>
    <Beat a={0} b={0.22}><Clip src="nasa-groundtrack-ms23.mp4" from={0} a={0} b={0.22} zoom={[1.0, 1.06]} /><Tag text="NASA FOOTAGE" sub="NASA BROADCAST · SOYUZ MS-23 DOCKING, FEB 2023" o={at(0.02)} /></Beat>
    <Beat a={0.19} b={0.62}><Clip src="houston-mcc-ms23.mp4" from={5} a={0.19} b={0.62} zoom={[1.02, 1.1]} /><Tag text="NASA FOOTAGE" sub="NASA BROADCAST · THE UNCREWED REPLACEMENT SOYUZ MS-23 ARRIVES, FEB 2023" o={at(0.22)} /></Beat>
    <Beat a={0.58} b={1}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <T x={520} y={300} s={36} c={BP.fail}>DEC 2022</T><T x={520} y={360} s={30}>Soyuz MS-22 coolant leak</T><T x={520} y={410} s={26} w={600} c="#cfd6df">suspected strike by a tiny object</T>
        <path d="M760 360 L1150 360" stroke={AMBER} strokeWidth={6} /><path d="M1125 340 L1155 360 L1125 380" fill="none" stroke={AMBER} strokeWidth={6} />
        <T x={1420} y={300} s={36} c={BP.ok}>FEB 2023</T><T x={1420} y={360} s={30}>Soyuz MS-23 launched EMPTY</T><T x={1420} y={410} s={26} w={600} c="#cfd6df">crew came home in it</T>
        <T x={960} y={640} s={40} c={AMBER} o={at(0.75)}>TWO STATIONS · SAME ENGINEERING LOGIC</T>
      </svg></Beat>
    <Chapter n={5} title="It has happened before" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 7 · Shenzhou-24 and Pakistan's first astronaut (diagram only)
const Scene7: React.FC = () => {
  const { f, d, at } = useT();
  const t = ease(prog(f, 0.2 * d, 0.5 * d));
  const mins = Math.round(218 * t);
  const seats: [string, string][] = [['TANG HONGBO', 'Commander'], ['WU YI', 'Flight engineer'], ['M. ZEESHAN ALI', 'Payload specialist · Pakistan']];
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <T x={960} y={190} s={36} c={AMBER} o={at(0.03)}>SHENZHOU-24 · 25 NOV 2026 · 08:18 BEIJING (05:18 PKT)</T>
      {seats.map(([n, r], i) => (<g key={i} opacity={at(0.06 + i * 0.04)} transform={`translate(${520 + i * 440} 380)`}>
        <rect x={-180} y={-60} width={360} height={120} rx={20} fill={i === 2 ? 'rgba(31,138,76,.3)' : 'rgba(95,211,255,.1)'} stroke={i === 2 ? '#3ddc97' : BP.line} strokeWidth={4} />
        <T x={0} y={-8} s={30}>{n}</T><T x={0} y={34} s={22} w={600} c="#cfd6df">{r}</T></g>))}
      <path d={`M300 900 Q 700 ${900 - 400 * t} ${300 + 1100 * t} ${900 - 300 * t}`} stroke={AMBER} strokeWidth={5} fill="none" strokeDasharray="14 10" />
      <T x={1500} y={700} s={64} c={AMBER} o={at(0.2)}>{`${Math.floor(mins / 60)} h ${mins % 60} min`}</T>
      <T x={1500} y={760} s={28} o={at(0.5)}>DOCKED WITH TIANGONG</T>
    </svg>
    <Card x={140} y={600} w={680} o={at(0.62)} color={BP.ok}><Label size={28} color={BP.ok} weight={800}>LIFEBOAT LOGIC</Label><Label size={26} color="#fff" weight={600}>Ali returns on Shenzhou-23 · Shenzhou-24 stays docked for those who remain</Label></Card>
    <Chapter n={6} title="Shenzhou-24" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 8 · The lesson
const Scene8: React.FC = () => {
  const { f, d, at } = useT();
  const needle = interpolate(f, [0.5 * d, 0.8 * d], [-70, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (<AbsoluteFill>
    <Beat a={0} b={0.48}><Clip src="iss-earth-view.mp4" from={30} a={0} b={0.48} dim={0.25} /><Tag text="NASA FOOTAGE" sub="EARTH FROM THE INTERNATIONAL SPACE STATION" o={at(0.02)} />
      <Card x={1120} y={640} w={700} o={at(0.12)} color={AMBER}><Label size={30} color={AMBER} weight={800}>THE THREAT IS GROWING</Label><Label size={26} color="#fff" weight={600}>A fragment too small to see can ground a spacecraft.</Label></Card></Beat>
    <Beat a={0.45} b={1}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(1400 640)">
          <path d="M-220 0 A 220 220 0 0 1 220 0" stroke="rgba(255,255,255,.25)" strokeWidth={30} fill="none" />
          <path d="M-220 0 A 220 220 0 0 1 -110 -190" stroke={BP.fail} strokeWidth={30} fill="none" />
          <path d="M110 -190 A 220 220 0 0 1 220 0" stroke={BP.ok} strokeWidth={30} fill="none" />
          <line x1={0} y1={0} x2={0} y2={-190} stroke="#fff" strokeWidth={8} strokeLinecap="round" transform={`rotate(${needle})`} /><circle r={16} fill="#fff" />
          <T x={0} y={70} s={30}>MARGIN OF SAFETY</T>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 140, top: 300 }}>
        {['Uncertainty is not optimism', 'A spare ship that can fly fast', 'Bring the damaged one home empty, and learn'].map((t, i) => <Label key={i} size={42} color={BP.ok} weight={800} style={{ opacity: at(0.5 + i * 0.08), marginBottom: 26 }}>{`✓  ${t}`}</Label>)}
      </div>
    </Beat>
    <Chapter n={7} title="The lesson" /><Grain />
  </AbsoluteFill>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];