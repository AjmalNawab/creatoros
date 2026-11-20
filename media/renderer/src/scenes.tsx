import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, NightSky, Particles, Tag, UrduText, ease, prog } from './common';

const useP = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d, fps } = useVideoConfig();
  return { f, d, fps, p: f / d };
};

/** Mountain cross-section used by scenes 3 & 4 */
const Volcano: React.FC<{ glow: number; shake?: number; cut?: boolean }> = ({ glow, shake = 0, cut = true }) => {
  const { f } = useP();
  const dx = shake * Math.sin(f * 2.3) * 6, dy = shake * Math.cos(f * 3.1) * 4;
  return (
    <g transform={`translate(${dx},${dy})`}>
      <path d="M260 700 L860 300 L1060 300 L1660 700 Z" fill={C.rockLight} />
      <path d="M860 300 Q960 330 1060 300 L1030 330 Q960 350 890 330 Z" fill={C.magma} opacity={0.4 + glow * 0.6} />
      {cut && <>
        <rect x={-800} y={700} width={3600} height={380} fill={C.rock} />
        <rect x={-800} y={700} width={3600} height={30} fill={C.crust} />
        {/* conduit */}
        <path d="M940 330 L980 330 L995 760 L925 760 Z" fill={C.mantle} opacity={0.5 + glow * 0.5} />
        {/* magma chamber */}
        <ellipse cx={960} cy={860} rx={330} ry={120} fill="url(#magmaGrad)" />
      </>}
      <defs>
        <radialGradient id="magmaGrad"><stop offset="0" stopColor={C.magmaHot} /><stop offset="1" stopColor={C.mantle} /></radialGradient>
      </defs>
    </g>
  );
};

// 1 — Hook: glowing crack → volcano silhouette → title
export const Scene1: React.FC = () => {
  const { f, d } = useP();
  const crack = ease(prog(f, 10, d * 0.45));
  const vol = ease(prog(f, d * 0.45, d * 0.65));
  const title = prog(f, d * 0.7, d * 0.8);
  return (
    <AbsoluteFill>
      <NightSky />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <g opacity={vol} transform={`translate(0,${(1 - vol) * 120})`}>
          <path d="M360 800 L880 380 L1040 380 L1560 800 Z" fill="#20141a" />
          <ellipse cx={960} cy={380} rx={80} ry={14} fill={C.magma} opacity={0.6 + 0.4 * Math.sin(f / 6)} />
          <circle cx={960} cy={360} r={140} fill={C.magma} opacity={0.12 * vol} />
        </g>
        <rect x={0} y={800} width={1920} height={280} fill="#140c0c" />
        <path d="M120 900 L420 870 L560 920 L800 880 L960 930 L1150 885 L1380 925 L1600 880 L1800 910"
          stroke={C.magma} strokeWidth={8} fill="none" strokeDasharray={2200} strokeDashoffset={2200 * (1 - crack)}
          style={{ filter: `drop-shadow(0 0 ${10 + 14 * crack}px ${C.magma})` }} />
      </svg>
      <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: title,
        transform: `scale(${0.9 + 0.1 * title})` }}>
        <UrduText size={110} color={C.magmaHot}>آتش فشاں کیسے پھٹتے ہیں؟</UrduText>
      </div>
    </AbsoluteFill>
  );
};

// 2 — Earth layers
export const Scene2: React.FC = () => {
  const { f, d } = useP();
  const layers = [
    { r: 400, c: C.crust, label: 'کرسٹ', at: 0.05 },
    { r: 385, c: C.mantle, label: 'مینٹل', at: 0.3 },
    { r: 200, c: C.magmaHot, label: 'بیرونی مرکز', at: 0.45 },
    { r: 110, c: C.core, label: 'اندرونی مرکز', at: 0.5 },
  ];
  const rot = f * 0.15;
  const mag = prog(f, d * 0.62, d * 0.72);
  return (
    <AbsoluteFill>
      <NightSky stars={50} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <g transform={`translate(640,520)`}>
          {layers.map((l, i) => {
            const s = ease(prog(f, d * l.at, d * l.at + 25));
            return <circle key={i} r={l.r * s} fill={l.c} />;
          })}
          {/* magma blobs in upper mantle */}
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (i / 9) * Math.PI * 2 + rot / 30;
            return <circle key={i} cx={Math.cos(a) * 340} cy={Math.sin(a) * 340} r={18 * mag} fill={C.magmaHot}
              style={{ filter: `drop-shadow(0 0 12px ${C.magma})` }} />;
          })}
        </g>
      </svg>
      {layers.slice(0, 2).map((l, i) => (
        <Tag key={i} x={1400} y={300 + i * 170} text={l.label} o={prog(f, d * l.at + 10, d * l.at + 25)} color={l.c === C.crust ? '#e2b48a' : C.magma} />
      ))}
      <Tag x={1400} y={640} text="میگما" o={mag} color={C.magmaHot} size={64} />
      <div style={{ position: 'absolute', left: 1400, top: 760, transform: 'translateX(-50%)', opacity: prog(f, d * 0.8, d * 0.88),
        fontFamily: 'Helvetica, Arial', fontWeight: 800, fontSize: 72, color: C.magmaHot }}>700–1200°C</div>
    </AbsoluteFill>
  );
};

// 3 — Magma rises, holds gas (soda bottle)
export const Scene3: React.FC = () => {
  const { f, d } = useP();
  const soda = prog(f, d * 0.68, d * 0.78);
  return (
    <AbsoluteFill>
      <NightSky stars={40} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <g transform={`translate(${-260 * soda},0) scale(${1 - 0.15 * soda})`} style={{ transformOrigin: '960px 700px' }}>
          <Volcano glow={0.3} />
          {/* rising blobs */}
          {Array.from({ length: 10 }).map((_, i) => {
            const life = ((f / 90) + random(`b${i}`)) % 1;
            return <circle key={i} cx={760 + random(`bx${i}`) * 400} cy={1080 - life * 220} r={14 + random(`br${i}`) * 10}
              fill={C.magmaHot} opacity={life < 0.9 ? 0.9 : (1 - life) * 9} />;
          })}
          {/* gas bubbles in chamber */}
          {Array.from({ length: 14 }).map((_, i) => {
            const life = ((f / 40) + random(`g${i}`)) % 1;
            return <circle key={i} cx={700 + random(`gx${i}`) * 520} cy={900 - life * 90} r={5 + 4 * life}
              fill="none" stroke="#fff" strokeWidth={2} opacity={prog(f, d * 0.4, d * 0.5) * (1 - life)} />;
          })}
        </g>
        {/* soda bottle */}
        <g opacity={soda} transform={`translate(${1520 + (1 - soda) * 200},560)`}>
          <rect x={-90} y={-180} width={180} height={420} rx={50} fill="rgba(80,200,120,.25)" stroke="#9fe0b0" strokeWidth={5} />
          <rect x={-35} y={-260} width={70} height={90} rx={12} fill="rgba(80,200,120,.25)" stroke="#9fe0b0" strokeWidth={5} />
          <rect x={-42} y={-290} width={84} height={34} rx={8} fill="#d33" />
          {Array.from({ length: 18 }).map((_, i) => {
            const life = ((f / 35) + random(`s${i}`)) % 1;
            return <circle key={i} cx={-60 + random(`sx${i}`) * 120} cy={220 - life * 380} r={4 + random(`ss${i}`) * 6} fill="#fff" opacity={0.8 * (1 - life)} />;
          })}
        </g>
      </svg>
      <Tag x={960 - 260 * soda} y={160} text="میگما اوپر اٹھتا ہے" o={prog(f, 10, 30) * (1 - soda * 0.0)} />
      <Tag x={1520} y={180} text="گیس" o={soda} color="#9fe0b0" />
    </AbsoluteFill>
  );
};

// 4 — Pressure builds → eruption → lava
export const Scene4: React.FC = () => {
  const { f, d } = useP();
  const pressure = ease(prog(f, 0, d * 0.5));
  const erupt = prog(f, d * 0.52, d * 0.56);
  const t = Math.max(0, f - d * 0.52) / 30;
  const flash = interpolate(f, [d * 0.52, d * 0.54, d * 0.6], [0, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lavaFlow = ease(prog(f, d * 0.6, d * 0.9));
  return (
    <AbsoluteFill>
      <NightSky stars={40} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {/* ash cloud */}
        {erupt > 0 && Array.from({ length: 16 }).map((_, i) => {
          const g = Math.min(1, t / 3);
          return <circle key={i} cx={960 + (random(`ax${i}`) - 0.5) * 700 * g} cy={260 - random(`ay${i}`) * 260 * g}
            r={(60 + random(`ar${i}`) * 90) * g} fill={C.ash} opacity={0.75} />;
        })}
        <Volcano glow={pressure} shake={erupt > 0 ? 0.6 : pressure * 1.4} />
        {erupt > 0 && <Particles x={960} y={300} t={t} n={80} power={1.1} />}
        {/* lava flows down slopes */}
        <path d="M900 305 Q760 420 620 520 T420 690" stroke={C.magma} strokeWidth={26} fill="none" strokeLinecap="round"
          strokeDasharray={700} strokeDashoffset={700 * (1 - lavaFlow)} style={{ filter: `drop-shadow(0 0 14px ${C.magma})` }} />
        <path d="M1020 305 Q1160 430 1300 540 T1500 690" stroke={C.magma} strokeWidth={26} fill="none" strokeLinecap="round"
          strokeDasharray={700} strokeDashoffset={700 * (1 - lavaFlow)} style={{ filter: `drop-shadow(0 0 14px ${C.magma})` }} />
        {/* pressure gauge */}
        <g transform="translate(220,220)" opacity={1 - erupt * 0.6}>
          <circle r={110} fill="rgba(11,16,32,.85)" stroke="#fff" strokeWidth={6} />
          <path d="M-80 40 A90 90 0 1 1 80 40" stroke="url(#gg)" strokeWidth={16} fill="none" />
          <line x1={0} y1={0} x2={0} y2={-80} stroke="#fff" strokeWidth={8} strokeLinecap="round"
            transform={`rotate(${-130 + 260 * Math.min(1, pressure + erupt) + Math.sin(f) * 3 * pressure})`} />
          <defs><linearGradient id="gg"><stop offset="0" stopColor="#3c3" /><stop offset=".6" stopColor="#fc0" /><stop offset="1" stopColor="#f22" /></linearGradient></defs>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 120, top: 350, width: 200, textAlign: 'center' }}>
        <UrduText size={44}>دباؤ</UrduText>
      </div>
      <AbsoluteFill style={{ background: '#fff3c4', opacity: flash }} />
      <Tag x={420} y={620} text="لاوا" o={prog(f, d * 0.78, d * 0.86)} size={70} />
    </AbsoluteFill>
  );
};

// 5 — Explosive vs effusive
export const Scene5: React.FC = () => {
  const { f, d } = useP();
  const left = prog(f, 0, 20), right = prog(f, d * 0.55, d * 0.62);
  const t = f / 30;
  const river = ease(prog(f, d * 0.6, d * 0.95));
  return (
    <AbsoluteFill>
      <NightSky stars={40} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <line x1={960} y1={60} x2={960} y2={1020} stroke="rgba(255,255,255,.25)" strokeWidth={4} strokeDasharray="14 14" />
        {/* LEFT explosive stratovolcano */}
        <g opacity={left}>
          {Array.from({ length: 22 }).map((_, i) => {
            const life = (t / 4 + random(`c${i}`)) % 1;
            return <circle key={i} cx={480 + (random(`cx${i}`) - 0.5) * 300 * life} cy={430 - life * 380}
              r={40 + life * 90} fill={C.ash} opacity={0.85 * (1 - life * 0.6)} />;
          })}
          <path d="M140 860 L430 440 L530 440 L820 860 Z" fill={C.rockLight} />
          <Particles x={480} y={440} t={t} n={40} power={0.7} spread={0.8} />
        </g>
        {/* RIGHT shield volcano with lava river */}
        <g opacity={right}>
          <path d="M1000 860 Q1440 560 1880 860 Z" fill={C.rockLight} />
          <ellipse cx={1440} cy={642} rx={60} ry={12} fill={C.magma} />
          <path d="M1440 645 Q1380 700 1330 740 T1180 850" stroke={C.magma} strokeWidth={30} fill="none" strokeLinecap="round"
            strokeDasharray={420} strokeDashoffset={420 * (1 - river)} style={{ filter: `drop-shadow(0 0 16px ${C.magma})` }} />
          <path d="M1450 645 Q1530 720 1600 760 T1760 850" stroke={C.magmaHot} strokeWidth={22} fill="none" strokeLinecap="round"
            strokeDasharray={420} strokeDashoffset={420 * (1 - river)} />
        </g>
        <rect x={0} y={860} width={1920} height={220} fill={C.rock} />
      </svg>
      <Tag x={480} y={110} text="گاڑھا میگما = دھماکا" o={left} size={50} />
      <Tag x={1440} y={110} text="پتلا میگما = بہتا لاوا" o={right} color={C.magmaHot} size={50} />
      <div style={{ position: 'absolute', left: 480, top: 175, transform: 'translateX(-50%)', whiteSpace: 'nowrap', opacity: prog(f, d * 0.25, d * 0.32) }}>
        <UrduText size={42}>ماؤنٹ سینٹ ہیلنز، امریکہ — 1980</UrduText>
      </div>
      <div style={{ position: 'absolute', left: 1440, top: 175, transform: 'translateX(-50%)', opacity: prog(f, d * 0.8, d * 0.88) }}>
        <UrduText size={42}>ہوائی</UrduText>
      </div>
    </AbsoluteFill>
  );
};

// 6 — Ring of Fire + Pakistan (Koh-e-Sultan)
export const Scene6: React.FC = () => {
  const { f, d } = useP();
  const ring = ease(prog(f, 10, d * 0.4));
  const count = Math.round(1350 * ease(prog(f, 5, d * 0.25)));
  const pk = prog(f, d * 0.62, d * 0.7);
  const N = 46;
  return (
    <AbsoluteFill>
      <NightSky stars={40} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <g opacity={1 - pk} transform={`translate(860,560)`}>
          <circle r={400} fill={C.sea} />
          <circle r={400} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth={3} />
          {/* stylised continents on Pacific rim */}
          <path d="M-390 -120 Q-300 -300 -150 -360 L-120 -250 Q-260 -150 -300 40 Q-330 160 -260 300 L-360 200 Z" fill={C.green} opacity={0.75} />
          <path d="M150 -360 Q320 -280 390 -60 L360 120 Q300 300 160 370 L120 260 Q260 120 250 -80 Q220 -230 120 -300 Z" fill={C.green} opacity={0.75} />
          {/* ring of fire dots (horseshoe) */}
          {Array.from({ length: N }).map((_, i) => {
            const a = Math.PI * (0.62 + 1.76 * (i / (N - 1)));
            const show = ring * N > i ? 1 : 0;
            return <circle key={i} cx={Math.cos(a + Math.PI / 2) * 290} cy={Math.sin(a + Math.PI / 2) * 290} r={10} fill={C.magma} opacity={show}
              style={{ filter: `drop-shadow(0 0 10px ${C.magma})` }} />;
          })}
        </g>
        {/* Pakistan card */}
        <g opacity={pk} transform={`translate(960,520) scale(${0.9 + 0.1 * pk})`}>
          <path d="M-260 260 L-30 -150 L60 -150 L290 260 Z" fill={C.rockLight} />
          <path d="M-30 -150 Q15 -130 60 -150" stroke="#888" strokeWidth={8} fill="none" />
          {/* pin */}
          <g transform="translate(15,-260)">
            <path d="M0 70 C-60 0 -50 -60 0 -60 C50 -60 60 0 0 70 Z" fill={C.green} stroke="#fff" strokeWidth={5} />
            <circle cy={-12} r={18} fill="#fff" />
          </g>
        </g>
      </svg>
      <div style={{ position: 'absolute', right: 120, top: 260, textAlign: 'center', opacity: 1 - pk }}>
        <div style={{ fontFamily: 'Helvetica, Arial', fontWeight: 900, fontSize: 130, color: C.magmaHot }}>~{count}</div>
        <UrduText size={48}>فعال ہو سکنے والے آتش فشاں</UrduText>
      </div>
      <Tag x={1550} y={760} text="رنگ آف فائر" o={prog(f, d * 0.3, d * 0.38) * (1 - pk)} />
      <Tag x={960} y={150} text="کوہِ سلطان — بلوچستان، پاکستان" o={pk} color="#9fe0b0" size={58} />
      <div style={{ position: 'absolute', top: 860, width: '100%', textAlign: 'center', opacity: prog(f, d * 0.85, d * 0.92) }}>
        <UrduText size={46}>ایک قدیم، خاموش آتش فشاں</UrduText>
      </div>
    </AbsoluteFill>
  );
};

// 7 — Benefits + outro
export const Scene7: React.FC = () => {
  const { f, d } = useP();
  const fields = prog(f, 0, 25);
  const island = ease(prog(f, d * 0.22, d * 0.45));
  const end = prog(f, d * 0.5, d * 0.58);
  const pulse = 1 + 0.05 * Math.sin(f / 5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(#7cc4f0, #cfeaf8)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <circle cx={1650} cy={180} r={90} fill="#ffd34d" />
        <rect x={0} y={760} width={1920} height={320} fill={C.sea} />
        {/* green volcano with fields */}
        <g opacity={fields}>
          <path d="M80 780 L520 360 L640 360 L1080 780 Z" fill="#4c7a3a" />
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M${170 + i * 40} ${760 - i * 52} L${990 - i * 40} ${760 - i * 52}`} stroke="#a7d16b" strokeWidth={10} opacity={0.8} />
          ))}
        </g>
        {/* new island rising */}
        <g transform={`translate(1450,${880 - island * 140})`}>
          <ellipse rx={200} ry={70} fill="#2b2b2b" />
          <ellipse cy={-30} rx={60} ry={20} fill={C.magma} opacity={island} />
          <Particles x={0} y={-40} t={f / 30} n={20} power={0.35} colors={['#ddd', '#bbb']} />
        </g>
      </svg>
      <Tag x={580} y={240} text="زرخیز مٹی" o={prog(f, 10, 30) * (1 - end)} color="#2f6b28" />
      <Tag x={1450} y={560} text="نئے جزیرے" o={prog(f, d * 0.3, d * 0.4) * (1 - end)} color="#1e5a8a" />
      {/* end card */}
      <AbsoluteFill style={{ background: `rgba(11,16,32,${0.88 * end})`, alignItems: 'center', justifyContent: 'center', opacity: end }}>
        <div style={{ transform: `scale(${pulse})`, background: '#e11d1d', borderRadius: 26, padding: '6px 70px 24px' }}>
          <UrduText size={84}>سبسکرائب کریں</UrduText>
        </div>
        <UrduText size={52} style={{ marginTop: 50 }}>اگلی ویڈیو کا موضوع کمنٹس میں بتائیں</UrduText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];
