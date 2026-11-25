import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BP, Blueprint, Label, prog, ease } from '../common';

/**
 * p009 · "The Year NASA Lost Mars Twice" · 1920x1080 documentary for Margin of Safety.
 * Mix: painted illustrations (owner's ChatGPT, approved documentary style), NASA archive photos (public domain,
 * always tagged ARCHIVE) and blueprint diagrams. Each chapter is ~60-85 s, so every scene has 3-4 beats
 * timed as fractions of the scene. Bottom ~170 px stays free for captions.
 */
const W = 1920, H = 1080;
const PNT = (f: string) => staticFile(`p009/paintings/${f}`);
const ARC = (f: string) => staticFile(`p009/archive/${f}`);
const AMBER = '#ffd27a';

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return { f, d, at: (x: number, len = 14) => prog(f, x * d, x * d + len) }; };

/** Visible only between fractions a..b with short fades. */
const Beat: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const { f, d } = useT();
  const o = (a === 0 ? 1 : prog(f, a * d, a * d + 15)) * (b >= 1 ? 1 : 1 - prog(f, b * d - 15, b * d));
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Landscape image with a slow push; portrait images get a blurred fill behind a centred copy. */
const Shot: React.FC<{ src: string; a?: number; b?: number; zoom?: [number, number]; dx?: number; dy?: number; portrait?: boolean; archive?: boolean; dim?: number }> = ({ src, a = 0, b = 1, zoom = [1.04, 1.14], dx = 0, dy = 0, portrait, archive, dim = 0 }) => {
  const { f, d } = useT();
  const t = prog(f, a * d, b * d);
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(t);
  const filt = archive ? 'sepia(.2) contrast(1.05) saturate(.85)' : 'none';
  return (
    <AbsoluteFill style={{ background: '#05090d' }}>
      {portrait ? (<>
        <Img src={src} style={{ position: 'absolute', inset: -40, width: W + 80, height: H + 80, objectFit: 'cover', filter: 'blur(30px) brightness(.45)' }} />
        <Img src={src} style={{ position: 'absolute', left: '50%', top: 0, height: H, transform: `translateX(-50%) scale(${s}) translate(${dx * t}%, ${dy * t}%)`, filter: filt, boxShadow: '0 0 80px rgba(0,0,0,.8)' }} />
      </>) : (
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s}) translate(${dx * t}%, ${dy * t}%)`, filter: filt }} />
      )}
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)' }} />
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.14 }}><svg width="100%" height="100%"><filter id="g9"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 11} /></filter><rect width="100%" height="100%" filter="url(#g9)" /></svg></AbsoluteFill>);
};

/** Top-left tag: what kind of image this is. */
const Tag: React.FC<{ text: string; sub?: string; o: number; color?: string }> = ({ text, sub, o, color = BP.cyan }) => (
  <div style={{ position: 'absolute', top: 60, left: 70, opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
    <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 8, background: 'rgba(5,14,28,.8)', border: `2px solid ${color}` }}>
      <Label size={26} color={color} weight={800} style={{ letterSpacing: 2 }}>{text}</Label>
    </div>
    {sub && <Label size={22} color="rgba(255,255,255,.8)" weight={600} style={{ marginTop: 6, letterSpacing: 3 }}>{sub}</Label>}
  </div>
);

/** Chapter card at the start of each scene. */
const Chapter: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const { f } = useT();
  const o = prog(f, 0, 10) * (1 - prog(f, 80, 95));
  return (
    <div style={{ position: 'absolute', right: 70, top: 60, opacity: o, textAlign: 'right' }}>
      <Label size={22} color={AMBER} weight={700} style={{ letterSpacing: 5 }}>{`CHAPTER ${n}`}</Label>
      <Label size={40} color="#fff" weight={800}>{title}</Label>
    </div>
  );
};

const Card: React.FC<{ x: number; y: number; w: number; o: number; color?: string; children: React.ReactNode }> = ({ x, y, w, o, color = BP.cyan, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, padding: '20px 26px', borderRadius: 16, background: 'rgba(5,14,28,.82)', border: `3px solid ${color}`, opacity: o, transform: `scale(${0.94 + 0.06 * o})`, transformOrigin: 'top left' }}>{children}</div>
);

// ───────────── 1 · Cold open: the silence
const Scene1: React.FC = () => {
  const { f, d, at } = useT();
  const blink = Math.floor(f / 8) % 2 === 0;
  return (<AbsoluteFill>
    <Beat a={0} b={0.38}><Shot src={PNT('room.png')} zoom={[1.02, 1.12]} /><Tag text="ILLUSTRATION" sub="JPL · 3 DECEMBER 1999" o={at(0.02)} /></Beat>
    <Beat a={0.34} b={0.74}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={200} y1={540} x2={1720} y2={540} stroke={BP.line} strokeWidth={3} opacity={0.6} />
        {[{ x: 640, t: 'MARS CLIMATE ORBITER', dt: '23 SEP 1999', s: 0.42 }, { x: 1280, t: 'MARS POLAR LANDER', dt: '3 DEC 1999', s: 0.56 }].map((m, i) => {
          const on = at(m.s); const lost = at(m.s + 0.06);
          return (<g key={i} opacity={on}>
            <circle cx={m.x} cy={540} r={34} fill={lost ? 'rgba(255,59,59,.25)' : 'rgba(95,211,255,.25)'} stroke={lost > 0.5 ? BP.fail : BP.cyan} strokeWidth={4} />
            <text x={m.x} y={470} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial">{m.t}</text>
            <text x={m.x} y={630} textAnchor="middle" fill={BP.fail} fontSize={30} fontWeight={700} fontFamily="Helvetica Neue, Arial" opacity={lost}>{`LOST · ${m.dt}`}</text>
          </g>);
        })}
        <text x={960} y={800} textAnchor="middle" fill={AMBER} fontSize={44} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.64)}>TWO MISSIONS · ONE YEAR</text>
      </svg>
    </Beat>
    <Beat a={0.7} b={1}><Shot src={PNT('descent.png')} zoom={[1.05, 1.15]} dy={1} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: at(0.76) }}>
        <rect x={1360} y={120} width={460} height={150} rx={14} fill="rgba(5,14,28,.8)" stroke={BP.fail} strokeWidth={3} />
        <path d={`M1390 210 ${Array.from({ length: 20 }).map((_, i) => `L${1390 + i * 20} 210`).join(' ')}`} stroke={BP.fail} strokeWidth={4} fill="none" />
        <text x={1590} y={170} textAnchor="middle" fill={BP.fail} fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={blink ? 1 : 0.4}>NO SIGNAL</text>
      </svg>
    </Beat>
    <Grain />
  </AbsoluteFill>);
};

// ───────────── 2 · Faster, better, cheaper
const Scene2: React.FC = () => {
  const { at } = useT();
  const g = ease(at(0.08, 30));
  return (<AbsoluteFill>
    <Beat a={0} b={0.46}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <text x={960} y={200} textAnchor="middle" fill={AMBER} fontSize={56} fontWeight={900} fontFamily="Helvetica Neue, Arial" letterSpacing={4}>FASTER · BETTER · CHEAPER</text>
        <rect x={420} y={820 - 520 * g} width={260} height={520 * g} fill="rgba(95,211,255,.35)" stroke={BP.cyan} strokeWidth={3} />
        <text x={550} y={870} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={700} fontFamily="Helvetica Neue, Arial">1970s · FEW, BIG</text>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={1000 + i * 150} y={820 - 120 * g} width={110} height={120 * g} fill="rgba(255,122,26,.35)" stroke={BP.warn} strokeWidth={3} opacity={at(0.18 + i * 0.04)} />)}
        <text x={1280} y={870} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={700} fontFamily="Helvetica Neue, Arial">1990s · MANY, SMALL</text>
        <text x={960} y={960} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize={26} fontFamily="Helvetica Neue, Arial" opacity={at(0.32)}>ILLUSTRATIVE · NOT TO SCALE</text>
      </svg>
    </Beat>
    <Beat a={0.42} b={0.74}><Shot src={ARC('KSC-98pc1082.jpg')} archive zoom={[1.02, 1.1]} /><Tag text="NASA ARCHIVE PHOTO" sub="MARS CLIMATE ORBITER · 1998" o={at(0.45)} color={AMBER} /></Beat>
    <Beat a={0.7} b={1}><Shot src={ARC('KSC-98pc1212.jpg')} archive zoom={[1.02, 1.1]} dx={-1} /><Tag text="NASA ARCHIVE PHOTO" sub="MARS POLAR LANDER · 1998" o={at(0.73)} color={AMBER} />
      <Card x={1240} y={640} w={560} o={at(0.84)} color={BP.warn}><Label size={30} color={BP.warn} weight={800}>SHARED TEAM · SHARED BUDGET</Label><Label size={26} color="#fff" weight={600}>Fewer people checking more work</Label></Card>
    </Beat>
    <Chapter n={1} title="The plan" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 3 · Climate Orbiter's approach
const Scene3: React.FC = () => {
  const { f, d, at } = useT();
  const p = ease(prog(f, 0.1 * d, 0.6 * d));
  const planned = (t: number) => [700 - 520 * t, 250 + 340 * t - 120 * t * t] as const;
  const actual = (t: number) => [700 - 520 * t, 250 + 420 * t] as const;
  const path = (fn: (t: number) => readonly [number, number], k: number) => Array.from({ length: 40 }).map((_, i) => { const [x, y] = fn((i / 39) * k); return `${i ? 'L' : 'M'}${960 + x} ${y}`; }).join(' ');
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={960} cy={700} r={260} fill="rgba(255,122,26,.18)" stroke={BP.warn} strokeWidth={3} />
      <circle cx={960} cy={700} r={300} fill="none" stroke={BP.warn} strokeWidth={2} strokeDasharray="10 10" opacity={0.7} />
      <text x={960} y={720} textAnchor="middle" fill={BP.warn} fontSize={40} fontWeight={800} fontFamily="Helvetica Neue, Arial">MARS</text>
      <text x={1290} y={420} fill={BP.warn} fontSize={24} fontFamily="Helvetica Neue, Arial" opacity={at(0.15)}>ATMOSPHERE</text>
      <path d={path(planned, p)} stroke={BP.cyan} strokeWidth={5} fill="none" strokeDasharray="14 10" />
      <path d={path(actual, p)} stroke={BP.fail} strokeWidth={5} fill="none" opacity={at(0.3)} />
      <text x={1700} y={260} fill={BP.cyan} fontSize={28} fontWeight={700} fontFamily="Helvetica Neue, Arial" opacity={at(0.2)}>PLANNED</text>
      <text x={1700} y={300} fill={BP.fail} fontSize={28} fontWeight={700} fontFamily="Helvetica Neue, Arial" opacity={at(0.35)}>ACTUAL (TOO LOW)</text>
      {Array.from({ length: 6 }).map((_, i) => { const [x, y] = planned(i / 6 * p); return <circle key={i} cx={960 + x} cy={y} r={7} fill="#fff" opacity={at(0.1 + i * 0.05)} />; })}
    </svg>
    <Card x={80} y={170} w={520} o={at(0.62)} color={BP.fail}>
      <Label size={24} color={BP.fail} weight={700} style={{ letterSpacing: 3 }}>23 SEPTEMBER 1999</Label>
      <Label size={38} color="#fff" weight={800}>Behind the planet…</Label>
      <Label size={30} color={BP.fail} weight={800} style={{ opacity: Math.floor(f / 10) % 2 ? 1 : 0.4 }}>NEVER REAPPEARED</Label>
    </Card>
    <Chapter n={2} title="Climate Orbiter" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 4 · The unit mismatch
const Scene4: React.FC = () => {
  const { f, d, at } = useT();
  const flow = (f % 60) / 60;
  const err = ease(prog(f, 0.6 * d, 0.95 * d));
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={at(0.03)}><rect x={150} y={230} width={520} height={260} rx={18} fill="rgba(95,211,255,.12)" stroke={BP.cyan} strokeWidth={4} />
        <text x={410} y={320} textAnchor="middle" fill="#fff" fontSize={34} fontWeight={800} fontFamily="Helvetica Neue, Arial">GROUND SOFTWARE</text>
        <text x={410} y={400} textAnchor="middle" fill={BP.warn} fontSize={38} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.18)}>pound-force · s</text></g>
      <g opacity={at(0.1)}><rect x={1250} y={230} width={520} height={260} rx={18} fill="rgba(95,211,255,.12)" stroke={BP.cyan} strokeWidth={4} />
        <text x={1510} y={320} textAnchor="middle" fill="#fff" fontSize={34} fontWeight={800} fontFamily="Helvetica Neue, Arial">NAVIGATION</text>
        <text x={1510} y={400} textAnchor="middle" fill={BP.ok} fontSize={38} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.22)}>newton · s</text></g>
      <line x1={670} y1={360} x2={1250} y2={360} stroke={BP.line} strokeWidth={4} strokeDasharray="16 10" opacity={at(0.12)} />
      <circle cx={670 + 580 * flow} cy={360} r={14} fill={BP.warn} opacity={at(0.14)} />
      <g opacity={at(0.36)}><rect x={610} y={560} width={700} height={130} rx={16} fill="rgba(5,14,28,.85)" stroke={AMBER} strokeWidth={3} />
        <text x={960} y={642} textAnchor="middle" fill={AMBER} fontSize={50} fontWeight={900} fontFamily="Helvetica Neue, Arial">1 lbf·s ≈ 4.45 N·s</text></g>
      <g opacity={at(0.58)}>
        <line x1={300} y1={900} x2={1620} y2={900} stroke={BP.line} strokeWidth={2} opacity={0.5} />
        <path d={`M300 900 Q ${300 + 660 * err} ${900 - 40 * err} ${300 + 1320 * err} ${900 - 160 * err}`} stroke={BP.fail} strokeWidth={6} fill="none" />
        <text x={1620} y={720 + (1 - err) * 160} textAnchor="end" fill={BP.fail} fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={err}>SMALL ERRORS ADD UP</text>
      </g>
    </svg>
    <Card x={1320} y={560} w={480} o={at(0.8)} color={BP.fail}><Label size={28} color={BP.fail} weight={800}>NOT CAUGHT BY</Label><Label size={28} color="#fff" weight={700}>verification &amp; validation</Label></Card>
    <Chapter n={3} title="The unit mix-up" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 5 · Polar Lander's descent
const Scene5: React.FC = () => {
  const { f, d, at } = useT();
  const alt = Math.round(interpolate(f, [0.8 * d, 0.88 * d], [1500, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const spike = at(0.48, 4) * (1 - at(0.5, 6));
  return (<AbsoluteFill>
    <Beat a={0} b={0.17}><Shot src={ARC('mpl-launch.jpg')} archive zoom={[1.0, 1.08]} dy={-1} /><Tag text="NASA ARCHIVE PHOTO" sub="POLAR LANDER LAUNCH · 3 JAN 1999" o={at(0.02)} color={AMBER} /></Beat>
    <Beat a={0.14} b={0.42}><Shot src={PNT('descent.png')} zoom={[1.04, 1.16]} dy={1.5} /><Tag text="ILLUSTRATION" sub="DESCENT · 3 DEC 1999" o={at(0.17)} /></Beat>
    <Beat a={0.38} b={0.62}><Shot src={PNT('legs-v.png')} portrait zoom={[1.0, 1.1]} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>{[760, 960, 1160].map((x, i) => <circle key={i} cx={x} cy={820} r={26 + 30 * spike} fill={`rgba(255,59,59,${0.25 + 0.6 * spike})`} stroke={BP.fail} strokeWidth={4} opacity={at(0.44)} />)}</svg>
      <Card x={80} y={200} w={520} o={at(0.45)} color={BP.fail}><Label size={26} color={BP.fail} weight={800}>LEGS SNAP OPEN</Label><Label size={30} color="#fff" weight={700}>Touchdown sensors flicker: a false “touchdown”</Label></Card>
    </Beat>
    <Beat a={0.58} b={0.8}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <rect x={660} y={300} width={600} height={300} rx={20} fill="rgba(95,211,255,.1)" stroke={BP.cyan} strokeWidth={4} />
        <text x={960} y={370} textAnchor="middle" fill="#fff" fontSize={34} fontWeight={800} fontFamily="Helvetica Neue, Arial">SOFTWARE MEMORY</text>
        <rect x={810} y={420} width={300} height={110} rx={12} fill="rgba(255,59,59,.25)" stroke={BP.fail} strokeWidth={4} opacity={at(0.62)} />
        <text x={960} y={490} textAnchor="middle" fill={BP.fail} fontSize={36} fontWeight={900} fontFamily="Helvetica Neue, Arial" opacity={at(0.62)}>TOUCHDOWN = 1</text>
        <text x={960} y={700} textAnchor="middle" fill={AMBER} fontSize={34} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.68)}>REMEMBERED, NOT CLEARED</text>
      </svg>
    </Beat>
    <Beat a={0.76} b={1}><Shot src={PNT('engines-off.png')} zoom={[1.04, 1.18]} dy={2} />
      <Card x={1340} y={150} w={460} o={at(0.79)} color={BP.fail}>
        <Label size={22} color={BP.fail} weight={700} style={{ letterSpacing: 3 }}>ALTITUDE</Label>
        <Label size={84} color={BP.fail} weight={900} style={{ fontVariantNumeric: 'tabular-nums' }}>{`${alt} m`}</Label>
        <Label size={28} color={BP.fail} weight={800} style={{ opacity: at(0.88) }}>ENGINES: OFF</Label>
        <Label size={28} color="#fff" weight={700} style={{ opacity: at(0.93) }}>≈ 22 m/s (50 mph) at impact (estimate)</Label>
      </Card>
    </Beat>
    <Chapter n={4} title="Polar Lander" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 6 · What the boards found
const Scene6: React.FC = () => {
  const { at } = useT();
  const items = ['Under-funded', 'Under-staffed', 'Inadequate testing', 'Poor communication'];
  return (<AbsoluteFill>
    <Beat a={0} b={0.24}><Shot src={ARC('PIA02349.jpg')} archive zoom={[1.0, 1.1]} /><Tag text="NASA ARCHIVE IMAGE" sub="ORBITAL SEARCH FOR THE LANDER · 2000" o={at(0.02)} color={AMBER} />
      <Card x={1260} y={700} w={560} o={at(0.08)} color={AMBER}><Label size={30} color={AMBER} weight={800}>NO TELEMETRY · NO WRECK FOUND</Label><Label size={26} color="#fff" weight={600}>“Most probable cause” — not certainty</Label></Card></Beat>
    <Beat a={0.2} b={0.55}><Blueprint />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <rect x={360} y={260} width={420} height={420} rx={20} fill="none" stroke={BP.cyan} strokeWidth={4} />
        <text x={570} y={240} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial">SYSTEM TEST</text>
        <path d="M570 300 L570 620 M480 620 L660 620" stroke={BP.line} strokeWidth={6} />
        <path d="M780 470 C 960 470, 960 470, 1140 470" stroke={BP.fail} strokeWidth={6} strokeDasharray="14 10" opacity={at(0.28)} />
        <text x={960} y={440} textAnchor="middle" fill={BP.fail} fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.28)}>SENSORS WIRED WRONG</text>
        <rect x={1140} y={380} width={420} height={180} rx={16} fill="rgba(255,59,59,.12)" stroke={BP.fail} strokeWidth={4} opacity={at(0.38)} />
        <text x={1350} y={460} textAnchor="middle" fill="#fff" fontSize={32} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.38)}>Wiring fixed…</text>
        <text x={1350} y={515} textAnchor="middle" fill={BP.fail} fontSize={32} fontWeight={900} fontFamily="Helvetica Neue, Arial" opacity={at(0.44)}>TEST NOT REPEATED</text>
      </svg>
    </Beat>
    <Beat a={0.51} b={1}><Shot src={PNT('board-v.png')} portrait zoom={[1.0, 1.06]} dim={0.35} />
      <Card x={90} y={200} w={600} o={at(0.55)}>
        <Label size={24} color={AMBER} weight={700} style={{ letterSpacing: 3 }}>YOUNG REPORT · MARCH 2000</Label>
        {items.map((t, i) => <Label key={i} size={34} color={BP.fail} weight={800} style={{ opacity: at(0.62 + i * 0.05), marginTop: 10 }}>{`✕  ${t}`}</Label>)}
      </Card>
      <Card x={1240} y={640} w={580} o={at(0.86)} color={BP.ok}><Label size={30} color={BP.ok} weight={800}>“FASTER, BETTER, CHEAPER” CAN WORK</Label><Label size={26} color="#fff" weight={600}>…if properly implemented. Every flaw correctable.</Label></Card>
    </Beat>
    <Chapter n={5} title="What investigators found" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 7 · The fix and Phoenix
const Scene7: React.FC = () => {
  const { at } = useT();
  const fixes = ['More people & money for testing', 'Independent review', 'Test as you fly, fly as you test'];
  return (<AbsoluteFill>
    <Beat a={0} b={0.34}><Blueprint />
      <div style={{ position: 'absolute', left: 260, top: 230 }}>
        {fixes.map((t, i) => <Label key={i} size={50} color={BP.ok} weight={800} style={{ opacity: at(0.05 + i * 0.07), marginBottom: 34 }}>{`✓  ${t}`}</Label>)}
      </div>
    </Beat>
    <Beat a={0.3} b={0.6}><Shot src={PNT('phoenix-v.png')} portrait zoom={[1.0, 1.08]} /><Tag text="ILLUSTRATION" sub="PHOENIX · MAY 2008" o={at(0.33)} />
      <Card x={90} y={640} w={560} o={at(0.4)} color={AMBER}><Label size={30} color={AMBER} weight={800}>THE 2001 LANDER, REBORN</Label><Label size={28} color="#fff" weight={700}>42 corrective actions</Label></Card></Beat>
    <Beat a={0.56} b={0.8}><Shot src={ARC('PIA10701.jpg')} portrait archive zoom={[1.0, 1.08]} /><Tag text="NASA ARCHIVE IMAGE" sub="PHOENIX ON MARS, SEEN FROM ORBIT · 2008" o={at(0.59)} color={AMBER} /></Beat>
    <Beat a={0.76} b={1}><Shot src={ARC('PIA10910.jpg')} portrait archive zoom={[1.0, 1.1]} /><Tag text="NASA ARCHIVE IMAGE" sub="WATER ICE IN PHOENIX'S TRENCH · 2008" o={at(0.79)} color={AMBER} /></Beat>
    <Chapter n={6} title="The fix" /><Grain />
  </AbsoluteFill>);
};

// ───────────── 8 · The lesson
const Scene8: React.FC = () => {
  const { f, d, at } = useT();
  const needle = interpolate(f, [0.35 * d, 0.7 * d], [-70, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (<AbsoluteFill><Blueprint />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {[{ x: 420, t: 'CLIMATE ORBITER', c: BP.fail, s: 0.04 }, { x: 420, t: 'POLAR LANDER', c: BP.fail, s: 0.1, y: 520 }].map((m, i) => (
        <g key={i} opacity={at(m.s)}><circle cx={m.x} cy={m.y ?? 300} r={40} fill="rgba(255,59,59,.2)" stroke={m.c} strokeWidth={4} /><text x={m.x + 70} y={(m.y ?? 300) + 10} fill="#fff" fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial">{m.t}</text></g>))}
      <path d="M470 300 C 700 300, 700 410, 900 410 M470 520 C 700 520, 700 410, 900 410" stroke={BP.line} strokeWidth={3} fill="none" opacity={at(0.16)} />
      <text x={920} y={420} fill={AMBER} fontSize={34} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={at(0.2)}>SMALL ERRORS + THIN CHECKS</text>
      <g transform="translate(1460 760)" opacity={at(0.3)}>
        <path d="M-220 0 A 220 220 0 0 1 220 0" stroke="rgba(255,255,255,.25)" strokeWidth={30} fill="none" />
        <path d="M-220 0 A 220 220 0 0 1 -110 -190" stroke={BP.fail} strokeWidth={30} fill="none" />
        <path d="M110 -190 A 220 220 0 0 1 220 0" stroke={BP.ok} strokeWidth={30} fill="none" />
        <line x1={0} y1={0} x2={0} y2={-190} stroke="#fff" strokeWidth={8} strokeLinecap="round" transform={`rotate(${needle})`} />
        <circle r={16} fill="#fff" />
        <text y={70} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={800} fontFamily="Helvetica Neue, Arial">MARGIN OF SAFETY</text>
      </g>
    </svg>
    <Card x={140} y={680} w={720} o={at(0.6)} color={BP.ok}><Label size={30} color={BP.ok} weight={800}>CLEAR INTERFACES · HONEST TESTING</Label><Label size={28} color="#fff" weight={700}>Listen to the worried engineer.</Label></Card>
    <Chapter n={7} title="The lesson" /><Grain />
  </AbsoluteFill>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];