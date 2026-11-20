import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { NightSky, Particles, Tag, UrduText, ease, prog } from '../common';

// Rainbow colours, outer (red) → inner (violet)
const RB = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
const NAMES = ['سرخ', 'نارنجی', 'پیلا', 'سبز', 'نیلا', 'بنفشی'];

const useP = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  return { f, d };
};

/** Semicircular rainbow centred at (cx, cy); grow 0→1 draws it. */
const Rainbow: React.FC<{ cx: number; cy: number; r: number; band: number; grow: number; opacity?: number }> = ({ cx, cy, r, band, grow, opacity = 1 }) => (
  <g opacity={opacity}>
    {RB.map((c, i) => {
      const rr = r - i * band;
      const len = Math.PI * rr;
      return <path key={i} d={`M ${cx - rr} ${cy} A ${rr} ${rr} 0 0 1 ${cx + rr} ${cy}`} stroke={c} strokeWidth={band + 1} fill="none"
        strokeDasharray={len} strokeDashoffset={len * (1 - grow)} />;
    })}
  </g>
);

const Hills: React.FC = () => (
  <g>
    <path d="M0 820 Q 300 700 640 790 T 1280 770 T 1920 800 L1920 1080 L0 1080 Z" fill="#4f9a45" />
    <path d="M0 880 Q 420 790 900 870 T 1920 860 L1920 1080 L0 1080 Z" fill="#3c7f36" />
  </g>
);

// 1 — Hook: clouds part, sun, rainbow grows, title
const Scene1: React.FC = () => {
  const { f, d } = useP();
  const clear = ease(prog(f, d * 0.1, d * 0.45));
  const bow = ease(prog(f, d * 0.35, d * 0.7));
  const title = prog(f, d * 0.72, d * 0.82);
  const sky = interpolate(clear, [0, 1], [0, 1]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${sky > 0.5 ? '#5fb4ef' : '#7b8794'}, ${sky > 0.5 ? '#cfeaf8' : '#b8c0c8'})` }} />
      <AbsoluteFill style={{ background: 'linear-gradient(#5fb4ef, #cfeaf8)', opacity: sky }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <circle cx={300} cy={220} r={90} fill="#ffd54f" opacity={clear} style={{ filter: 'drop-shadow(0 0 40px #ffe082)' }} />
        <Rainbow cx={1100} cy={820} r={560} band={26} grow={bow} />
        <Hills />
        {/* clouds part to the sides */}
        {[[-1, 260, 160], [-1, 520, 240], [1, 1300, 180], [1, 1600, 260], [-1, 860, 120], [1, 1050, 300]].map(([dir, x, y], i) => (
          <g key={i} transform={`translate(${dir * clear * 900},0)`} opacity={1 - clear * 0.6}>
            <ellipse cx={x} cy={y} rx={190} ry={70} fill="#8f98a3" />
            <ellipse cx={x + 90} cy={y - 35} rx={120} ry={60} fill="#9aa3ad" />
            <ellipse cx={x - 80} cy={y - 20} rx={110} ry={50} fill="#a5adb6" />
          </g>
        ))}
        {/* rain streaks fade out */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = random(`r${i}`) * 1920; const y = ((f * 14 + random(`ry${i}`) * 900) % 900);
          return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 30} stroke="#dfe7ef" strokeWidth={3} opacity={(1 - clear) * 0.7} />;
        })}
      </svg>
      <div style={{ position: 'absolute', top: 70, width: '100%', textAlign: 'center', opacity: title, transform: `scale(${0.9 + 0.1 * title})` }}>
        <UrduText size={104} color="#ffffff" style={{ textShadow: '0 6px 24px rgba(0,0,0,.45)' }}>دھنک کیسے بنتی ہے؟</UrduText>
      </div>
    </AbsoluteFill>
  );
};

// 2 — White light holds all colours
const Scene2: React.FC = () => {
  const { f, d } = useP();
  const beam = ease(prog(f, 5, d * 0.3));
  const split = ease(prog(f, d * 0.4, d * 0.55));
  const sx = 900, sy = 470;
  return (
    <AbsoluteFill>
      <NightSky stars={50} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <circle cx={120} cy={sy} r={70} fill="#ffd54f" style={{ filter: 'drop-shadow(0 0 40px #ffe082)' }} />
        <line x1={190} y1={sy} x2={190 + (sx - 190) * beam} y2={sy} stroke="#fff" strokeWidth={34} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 18px #fff)' }} />
        {RB.map((c, i) => {
          const ang = (-0.28 + i * 0.11) * split;
          const ex = sx + Math.cos(ang) * 820 * split, ey = sy + Math.sin(ang) * 820 * split;
          return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={c} strokeWidth={26} strokeLinecap="round" opacity={split} />;
        })}
      </svg>
      <Tag x={540} y={360} text="سفید روشنی" o={prog(f, d * 0.15, d * 0.25)} color="#ffffff" />
      {NAMES.map((n, i) => {
        const ang = -0.28 + i * 0.11;
        const o = prog(f, d * (0.5 + i * 0.07), d * (0.56 + i * 0.07));
        return <Tag key={n} x={sx + Math.cos(ang) * 860 - 60} y={sy + Math.sin(ang) * 860} text={n} o={o} color={RB[i]} size={46} />;
      })}
    </AbsoluteFill>
  );
};

// geometry for the big raindrop
const DROP = { cx: 960, cy: 470, r: 300 };
const at = (deg: number, k = 1) => [DROP.cx + DROP.r * k * Math.cos((deg * Math.PI) / 180), DROP.cy + DROP.r * k * Math.sin((deg * Math.PI) / 180)];
const ENTRY = at(200), BACK = at(-12), EXIT = at(135);

const Drop: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`translate(${DROP.cx},${DROP.cy}) scale(${scale}) translate(${-DROP.cx},${-DROP.cy})`}>
    <defs>
      <radialGradient id="dropG" cx="35%" cy="30%"><stop offset="0" stopColor="#e3f6ff" stopOpacity="0.9" /><stop offset="1" stopColor="#4fa9e0" stopOpacity="0.35" /></radialGradient>
    </defs>
    <circle cx={DROP.cx} cy={DROP.cy} r={DROP.r} fill="url(#dropG)" stroke="#bfe7ff" strokeWidth={5} />
    <ellipse cx={DROP.cx - 110} cy={DROP.cy - 140} rx={60} ry={30} fill="#fff" opacity={0.55} />
  </g>
);

const seg = (a: number[], b: number[], t: number) => `M ${a[0]} ${a[1]} L ${a[0] + (b[0] - a[0]) * t} ${a[1] + (b[1] - a[1]) * t}`;

// 3 — Inside a raindrop: enter-bend, reflect, exit-bend
const Scene3: React.FC = () => {
  const { f, d } = useP();
  const t1 = ease(prog(f, d * 0.05, d * 0.25)), t2 = ease(prog(f, d * 0.25, d * 0.45)), t3 = ease(prog(f, d * 0.45, d * 0.65)), t4 = ease(prog(f, d * 0.65, d * 0.82));
  const start = [120, 300];
  const out = [EXIT[0] - 420, EXIT[1] + 200];
  const ray = { stroke: '#fff', strokeWidth: 12, strokeLinecap: 'round' as const, fill: 'none', style: { filter: 'drop-shadow(0 0 10px #fff)' } };
  return (
    <AbsoluteFill>
      <NightSky stars={40} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <Drop />
        <path d={seg(start, ENTRY, t1)} {...ray} />
        <path d={seg(ENTRY, BACK, t2)} {...ray} />
        <path d={seg(BACK, EXIT, t3)} {...ray} />
        <path d={seg(EXIT, out, t4)} {...ray} />
        {[[ENTRY, t1 >= 1], [BACK, t2 >= 1], [EXIT, t3 >= 1]].map(([p, on], i) => (
          <circle key={i} cx={(p as number[])[0]} cy={(p as number[])[1]} r={16} fill="#ffd54f" opacity={on ? 1 : 0} />
        ))}
      </svg>
      <Tag x={ENTRY[0] - 120} y={ENTRY[1] - 90} text="مڑنا" o={prog(f, d * 0.25, d * 0.32)} color="#ffd54f" />
      <Tag x={BACK[0] + 150} y={BACK[1] - 40} text="ٹکرانا" o={prog(f, d * 0.45, d * 0.52)} color="#80d8ff" />
      <Tag x={EXIT[0] - 170} y={EXIT[1] + 10} text="پھر مڑنا" o={prog(f, d * 0.82, d * 0.9)} color="#ffd54f" />
    </AbsoluteFill>
  );
};

// 4 — Colours spread out, then many drops form the arc
const Scene4: React.FC = () => {
  const { f, d } = useP();
  const fan = ease(prog(f, d * 0.05, d * 0.3));
  const zoom = ease(prog(f, d * 0.55, d * 0.7));
  const arc = ease(prog(f, d * 0.68, d * 0.92));
  return (
    <AbsoluteFill>
      <NightSky stars={40} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <g opacity={1 - zoom}>
          <Drop />
          <path d={`M ${ENTRY[0]} ${ENTRY[1]} L ${BACK[0]} ${BACK[1]} L ${EXIT[0]} ${EXIT[1]}`} stroke="#fff" strokeWidth={10} fill="none" opacity={0.7} />
          {RB.map((c, i) => {
            const ang = (Math.PI * (0.78 + i * 0.035));
            const len = 520 * fan;
            return <line key={i} x1={EXIT[0]} y1={EXIT[1]} x2={EXIT[0] + Math.cos(ang) * len} y2={EXIT[1] + Math.sin(ang) * len * 0.55} stroke={c} strokeWidth={14} strokeLinecap="round" />;
          })}
        </g>
        <g opacity={zoom}>
          <Rainbow cx={960} cy={900} r={640} band={24} grow={arc} />
          {Array.from({ length: 26 }).map((_, i) => {
            const a = Math.PI * (1 - i / 25);
            const x = 960 + Math.cos(a) * 560, y = 900 - Math.sin(a) * 560;
            return <circle key={i} cx={x} cy={y} r={12 * zoom} fill="#cfefff" stroke="#fff" strokeWidth={2} opacity={0.9} />;
          })}
          {Array.from({ length: 60 }).map((_, i) => (
            <circle key={`d${i}`} cx={random(`dx${i}`) * 1920} cy={((f * 6 + random(`dy${i}`) * 900) % 900)} r={4} fill="#cfefff" opacity={0.6} />
          ))}
        </g>
      </svg>
      <Tag x={430} y={940 - 100} text="بنفشی: سب سے زیادہ مڑتا ہے" o={prog(f, d * 0.25, d * 0.32) * (1 - zoom)} color="#ce93d8" size={44} />
      <Tag x={430} y={940 - 220} text="سرخ: سب سے کم" o={prog(f, d * 0.35, d * 0.42) * (1 - zoom)} color="#ef9a9a" size={44} />
      <Tag x={960} y={120} text="لاکھوں قطرے = ایک دھنک" o={prog(f, d * 0.75, d * 0.85)} color="#fff59d" />
    </AbsoluteFill>
  );
};

// 5 — How to see one: sun behind, rain in front; morning/evening; your own rainbow
const Scene5: React.FC = () => {
  const { f, d } = useP();
  const bow = ease(prog(f, d * 0.2, d * 0.45));
  const clock = prog(f, d * 0.5, d * 0.6);
  const own = prog(f, d * 0.78, d * 0.86);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(#f6b26b, #ffe0b2 55%, #b3e5fc)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <circle cx={220} cy={600} r={85} fill="#ffca28" style={{ filter: 'drop-shadow(0 0 40px #ffe082)' }} />
        {/* rain curtain */}
        <rect x={1180} y={180} width={640} height={640} fill="#90a4ae" opacity={0.35} />
        {Array.from({ length: 70 }).map((_, i) => {
          const x = 1180 + random(`cx${i}`) * 640, y = 180 + ((f * 16 + random(`cy${i}`) * 640) % 640);
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke="#eceff1" strokeWidth={3} opacity={0.8} />;
        })}
        <Rainbow cx={1500} cy={820} r={420} band={20} grow={bow} />
        <rect x={0} y={820} width={1920} height={260} fill="#558b2f" />
        {/* person facing the rain */}
        <g transform="translate(820,0)">
          <circle cx={0} cy={640} r={34} fill="#5d4037" />
          <line x1={0} y1={674} x2={0} y2={760} stroke="#5d4037" strokeWidth={14} strokeLinecap="round" />
          <line x1={0} y1={700} x2={40} y2={735} stroke="#5d4037" strokeWidth={12} strokeLinecap="round" />
          <line x1={0} y1={700} x2={-34} y2={735} stroke="#5d4037" strokeWidth={12} strokeLinecap="round" />
          <line x1={0} y1={760} x2={26} y2={818} stroke="#5d4037" strokeWidth={12} strokeLinecap="round" />
          <line x1={0} y1={760} x2={-26} y2={818} stroke="#5d4037" strokeWidth={12} strokeLinecap="round" />
          <path d="M 30 620 L 80 600" stroke="#fff" strokeWidth={4} strokeDasharray="8 8" opacity={bow} />
        </g>
        {/* clock */}
        <g transform="translate(960,190)" opacity={clock}>
          <circle r={70} fill="#fff" stroke="#5d4037" strokeWidth={6} />
          <line x1={0} y1={0} x2={0} y2={-48} stroke="#5d4037" strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 4})`} />
          <line x1={0} y1={0} x2={34} y2={0} stroke="#5d4037" strokeWidth={6} strokeLinecap="round" />
        </g>
      </svg>
      <Tag x={260} y={470} text="سورج پیچھے" o={prog(f, d * 0.08, d * 0.16)} color="#ffcc80" />
      <Tag x={1500} y={130} text="بارش سامنے" o={prog(f, d * 0.16, d * 0.24)} color="#e0f7fa" />
      <Tag x={960} y={320} text="صبح یا شام" o={clock} color="#fff3e0" size={46} />
      <Tag x={820} y={560} text="آپ کی اپنی دھنک" o={own} color="#f3e5f5" size={44} />
    </AbsoluteFill>
  );
};

// 6 — History (Kamal al-Din al-Farisi, glass sphere) + outro
const Scene6: React.FC = () => {
  const { f, d } = useP();
  const ray = ease(prog(f, d * 0.12, d * 0.32));
  const end = prog(f, d * 0.58, d * 0.66);
  const flick = 1 + 0.08 * Math.sin(f / 3) + 0.05 * Math.sin(f / 1.7);
  const pulse = 1 + 0.05 * Math.sin(f / 5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 30% 40%, #5d4037, #2b1d17 75%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <rect x={0} y={700} width={1920} height={380} fill="#6d4c41" />
        <rect x={0} y={700} width={1920} height={20} fill="#8d6e63" />
        {/* candle */}
        <rect x={300} y={540} width={50} height={160} fill="#fff8e1" />
        <ellipse cx={325} cy={515} rx={18 * flick} ry={36 * flick} fill="#ffb300" style={{ filter: 'drop-shadow(0 0 30px #ffca28)' }} />
        {/* scroll */}
        <rect x={1300} y={640} width={360} height={60} rx={30} fill="#f3e5ab" />
        <line x1={1340} y1={670} x2={1620} y2={670} stroke="#a1887f" strokeWidth={4} />
        {/* glass sphere on stand */}
        <rect x={900} y={640} width={120} height={60} fill="#4e342e" />
        <circle cx={960} cy={510} r={140} fill="#b3e5fc" opacity={0.45} stroke="#e1f5fe" strokeWidth={5} />
        <ellipse cx={910} cy={450} rx={36} ry={18} fill="#fff" opacity={0.6} />
        <line x1={420} y1={470} x2={420 + (820 - 420) * ray} y2={470 + (500 - 470) * ray} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
        {RB.map((c, i) => (
          <line key={i} x1={1060} y1={560} x2={1060 + 420 * ray} y2={560 + (40 + i * 26) * ray} stroke={c} strokeWidth={10} strokeLinecap="round" opacity={ray} />
        ))}
        <Particles x={325} y={500} t={f / 30} n={10} power={0.15} colors={['#ffe082', '#ffca28']} />
      </svg>
      <Tag x={960} y={150} text="کمال الدین فارسی — تقریباً 1300ء" o={prog(f, d * 0.05, d * 0.14) * (1 - end)} color="#ffe082" size={58} />
      <AbsoluteFill style={{ background: `rgba(11,16,32,${0.88 * end})`, alignItems: 'center', justifyContent: 'center', opacity: end }}>
        <div style={{ transform: `scale(${pulse})`, background: '#e11d1d', borderRadius: 26, padding: '6px 70px 24px' }}>
          <UrduText size={84}>سبسکرائب کریں</UrduText>
        </div>
        <UrduText size={52} style={{ marginTop: 50 }}>اگلی ویڈیو کا موضوع کمنٹس میں بتائیں</UrduText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];