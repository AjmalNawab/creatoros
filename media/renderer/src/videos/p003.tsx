import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { BP, Label, Tag, ease, prog } from '../common';

// Vertical 1080x1920 blueprint scenes for "How NASA fixed Voyager 1".
// Main diagrams live in y=260-980 (captions are drawn at y=1000-1400 by the Short template).
const W = 1080, H = 1920;

const useP = () => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  return { f, d };
};

/** Vertical blueprint background with drifting grid. */
const VBG: React.FC = () => {
  const f = useCurrentFrame();
  const off = (f * 0.5) % 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${BP.bg2}, ${BP.bg} 70%)` }}>
      <svg width={W} height={H}>
        <defs>
          <pattern id="vg1" width={60} height={60} patternUnits="userSpaceOnUse" x={off} y={off}><path d="M60 0H0V60" fill="none" stroke={BP.grid} strokeWidth={1.5} /></pattern>
          <pattern id="vg2" width={300} height={300} patternUnits="userSpaceOnUse" x={off} y={off}><path d="M300 0H0V300" fill="none" stroke={BP.gridMajor} strokeWidth={2} /></pattern>
        </defs>
        <rect width={W} height={H} fill="url(#vg1)" />
        <rect width={W} height={H} fill="url(#vg2)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Voyager line drawing: dish, bus, magnetometer boom, RTG boom. */
const Probe: React.FC<{ x: number; y: number; s?: number; glow?: string }> = ({ x, y, s = 1, glow }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} style={glow ? { filter: `drop-shadow(0 0 18px ${glow})` } : undefined}>
    <ellipse cx={0} cy={0} rx={120} ry={34} fill="none" stroke={BP.line} strokeWidth={6} />
    <line x1={0} y1={-34} x2={0} y2={-70} stroke={BP.line} strokeWidth={5} />
    <rect x={-50} y={34} width={100} height={46} fill="none" stroke={BP.cyan} strokeWidth={5} />
    <line x1={50} y1={57} x2={260} y2={20} stroke={BP.line} strokeWidth={4} />
    <line x1={-50} y1={57} x2={-200} y2={110} stroke={BP.line} strokeWidth={4} />
    <rect x={-236} y={100} width={44} height={22} fill="none" stroke={BP.cyan} strokeWidth={4} />
  </g>
);

const Stars: React.FC<{ n?: number }> = ({ n = 70 }) => {
  const f = useCurrentFrame();
  return (
    <g>{Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={random(`s${i}`) * W} cy={240 + random(`t${i}`) * 760} r={1 + random(`r${i}`) * 2.5} fill="#fff"
        opacity={0.25 + 0.5 * Math.abs(Math.sin(f / 18 + i))} />
    ))}</g>
  );
};

/** Number that counts up (local, avoids importing the Short template). */
const Count: React.FC<{ to: number; dur: number; decimals?: number; suffix?: string }> = ({ to, dur, decimals = 0, suffix = '' }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [2, dur], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });
  return <>{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
};

const Center: React.FC<{ y: number; children: React.ReactNode; o?: number }> = ({ y, children, o = 1 }) => (
  <div style={{ position: 'absolute', top: y, left: 64, right: 140, textAlign: 'center', opacity: o }}>{children}</div>
);

// 1 — Hook: tiny probe, distance counts up, ERROR blink
const Scene1: React.FC = () => {
  const { f, d } = useP();
  const err = f > d * 0.55 && Math.floor(f / 6) % 2 === 0;
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Stars />
        <Probe x={470} y={640} s={0.55 + 0.1 * ease(prog(f, 0, d))} glow={err ? BP.fail : undefined} />
      </svg>
      <Center y={270}>
        <Label size={98} color={BP.warn} style={{ fontVariantNumeric: 'tabular-nums' }}><Count to={15000000000} dur={Math.round(d * 0.5)} /></Label>
        <Label size={48} color={BP.line} weight={600}>MILES FROM EARTH</Label>
      </Center>
      <Tag x={470} y={860} text="ERROR" o={err ? 1 : 0} color={BP.fail} lang="en" size={64} />
    </AbsoluteFill>
  );
};

const GLYPHS = '#%&@$?!*/\\<>{}[]~^';
// 2 — Gibberish: clean data turns into noise
const Scene2: React.FC = () => {
  const { f, d } = useP();
  const noise = prog(f, d * 0.25, d * 0.5);
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Probe x={470} y={330} s={0.6} />
        {Array.from({ length: 9 }).map((_, row) => {
          const y = 480 + row * 56 + ((f * 4) % 56);
          return Array.from({ length: 12 }).map((__, col) => {
            const bad = random(`b${row}-${col}`) < noise;
            const x = 140 + col * 66;
            return bad
              ? <text key={`${row}-${col}`} x={x} y={y} fill={BP.fail} fontSize={40} fontFamily="monospace" opacity={0.85}>{GLYPHS[Math.floor(random(`g${row}${col}${Math.floor(f / 4)}`) * GLYPHS.length)]}</text>
              : <rect key={`${row}-${col}`} x={x} y={y - 26} width={46} height={26} rx={4} fill={BP.cyan} opacity={0.75} />;
          });
        })}
      </svg>
      <Tag x={470} y={1000 - 70} text="NOV 2023" o={prog(f, 3, 12)} color={BP.warn} lang="en" />
    </AbsoluteFill>
  );
};

// 3 — The dead chip inside the 1977 flight computer
const Scene3: React.FC = () => {
  const { f, d } = useP();
  const dead = prog(f, d * 0.4, d * 0.55);
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <rect x={150} y={390} width={640} height={540} rx={18} fill="none" stroke={BP.line} strokeWidth={6} />
        {Array.from({ length: 16 }).map((_, i) => {
          const cx = 210 + (i % 4) * 140, cy = 440 + Math.floor(i / 4) * 116;
          const isDead = i === 9;
          const s = ease(prog(f, i * 1.2, i * 1.2 + 8));
          const fill = isDead ? interpolate(dead, [0, 0.5, 1], [0.25, 1, 0.15]) : 0.25;
          return (
            <g key={i} opacity={s}>
              <rect x={cx} y={cy} width={100} height={76} rx={8} fill={isDead && dead > 0 ? BP.fail : BP.cyan} fillOpacity={fill} stroke={isDead && dead > 0 ? BP.fail : BP.cyan} strokeWidth={4} />
              {[0, 1, 2].map((k) => <line key={k} x1={cx + 18 + k * 32} y1={cy + 76} x2={cx + 18 + k * 32} y2={cy + 92} stroke={BP.line} strokeWidth={3} />)}
            </g>
          );
        })}
      </svg>
      <Center y={280}><Label size={50} color={BP.line}>FLIGHT DATA SUBSYSTEM</Label></Center>
      <Tag x={800} y={350} text="1977" o={prog(f, 6, 14)} color={BP.warn} lang="en" />
      <Tag x={490} y={980} text="1 dead chip" o={dead} color={BP.fail} lang="en" />
    </AbsoluteFill>
  );
};

// 4 — What the chip held: the code that packages the data
const Scene4: React.FC = () => {
  const { f, d } = useP();
  const code = ease(prog(f, 3, d * 0.5));
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <rect x={190} y={330} width={560} height={600} rx={24} fill={BP.fail} fillOpacity={0.12} stroke={BP.fail} strokeWidth={8} style={{ filter: `drop-shadow(0 0 24px ${BP.fail})` }} />
        {Array.from({ length: 11 }).map((_, i) => {
          const w = 120 + random(`w${i}`) * 300;
          const flick = Math.floor(f / 5 + i) % 7 === 0 ? 0.3 : 1;
          return <rect key={i} x={240 + (i % 3 === 0 ? 0 : 40)} y={380 + i * 48} width={w * code} height={22} rx={6} fill={i % 4 === 1 ? BP.warn : BP.line} opacity={0.8 * flick} />;
        })}
      </svg>
      <Tag x={470} y={290} text="packs Voyager's data" o={prog(f, d * 0.35, d * 0.5)} color={BP.warn} lang="en" />
    </AbsoluteFill>
  );
};

// 5 — No repairs in interstellar space
const Scene5: React.FC = () => {
  const { f, d } = useP();
  const t = ease(prog(f, 2, d * 0.55));
  const wx = 230 + t * 300;
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Stars n={40} />
        <circle cx={200} cy={820} r={90} fill="#1e5a8a" stroke={BP.cyan} strokeWidth={5} />
        <Probe x={760} y={380} s={0.45} />
        <line x1={260} y1={760} x2={700} y2={430} stroke={BP.line} strokeWidth={4} strokeDasharray="14 14" opacity={0.6} />
        {/* wrench travels, then stops short */}
        <g transform={`translate(${wx},${760 - (wx - 230) * 0.75}) rotate(${-35 + f * 2})`} opacity={1 - prog(f, d * 0.75, d * 0.95)}>
          <rect x={-60} y={-10} width={120} height={20} rx={8} fill={BP.warn} />
          <circle cx={-62} cy={0} r={24} fill="none" stroke={BP.warn} strokeWidth={10} />
        </g>
        <text x={560} y={640} fill={BP.fail} fontSize={120} fontWeight={900} fontFamily="Helvetica, Arial" opacity={prog(f, d * 0.55, d * 0.65)}>✕</text>
      </svg>
      <Center y={280}><Label size={52} color={BP.line}>INTERSTELLAR SPACE</Label></Center>
    </AbsoluteFill>
  );
};

// 6 — Split the code into pieces, hide them in free memory
const Scene6: React.FC = () => {
  const { f, d } = useP();
  const split = ease(prog(f, d * 0.15, d * 0.7));
  const cols = 6, rows = 7, cw = 120, ch = 80, ox = 120, oy = 330;
  const used = (i: number) => random(`u${i}`) < 0.62;
  const free = Array.from({ length: cols * rows }).map((_, i) => i).filter((i) => !used(i) && i > 8);
  const targets = [free[1], free[4], free[7], free[10]].map((i) => i ?? 30);
  const cell = (i: number) => ({ x: ox + (i % cols) * (cw + 12), y: oy + Math.floor(i / cols) * (ch + 12) });
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const c = cell(i);
          return <rect key={i} x={c.x} y={c.y} width={cw} height={ch} rx={8} fill={used(i) ? BP.cyan : 'none'} fillOpacity={0.18} stroke={BP.cyan} strokeOpacity={0.5} strokeWidth={2} />;
        })}
        {[0, 1, 2, 3].map((k) => {
          const from = { x: ox + k * (cw + 12) * 0.5 + 20, y: oy - 0 + 2 * (ch + 12) };
          const to = cell(targets[k]);
          const x = from.x + (to.x - from.x) * split, y = from.y + (to.y - from.y) * split;
          return <rect key={k} x={x} y={y} width={cw} height={ch} rx={8} fill={BP.warn} stroke="#fff" strokeWidth={3} style={{ filter: `drop-shadow(0 0 12px ${BP.warn})` }} />;
        })}
        {split > 0.95 && [0, 1, 2].map((k) => {
          const a = cell(targets[k]), b = cell(targets[k + 1]);
          return <line key={k} x1={a.x + cw / 2} y1={a.y + ch / 2} x2={b.x + cw / 2} y2={b.y + ch / 2} stroke={BP.warn} strokeWidth={4} strokeDasharray="10 8" opacity={prog(f, d * 0.72, d * 0.85)} />;
        })}
      </svg>
      <Center y={270}><Label size={48} color={BP.line}>FDS MEMORY MAP</Label></Center>
    </AbsoluteFill>
  );
};

// 7 — 22.5 hours per command
const Scene7: React.FC = () => {
  const { f, d } = useP();
  const t = prog(f, 2, d * 0.9);
  const ax = 190, ay = 900, bx = 800, by = 420;
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Stars n={30} />
        {/* Earth dish */}
        <path d={`M ${ax - 80} ${ay} Q ${ax} ${ay - 90} ${ax + 80} ${ay}`} fill="none" stroke={BP.line} strokeWidth={8} />
        <line x1={ax} y1={ay} x2={ax} y2={ay + 60} stroke={BP.line} strokeWidth={8} />
        <Probe x={bx} y={by} s={0.38} />
        <line x1={ax} y1={ay - 40} x2={bx - 30} y2={by + 20} stroke={BP.cyan} strokeWidth={3} strokeDasharray="6 12" opacity={0.6} />
        <circle cx={ax + (bx - 30 - ax) * t} cy={ay - 40 + (by + 20 - (ay - 40)) * t} r={16} fill={BP.warn} style={{ filter: `drop-shadow(0 0 14px ${BP.warn})` }} />
      </svg>
      <Center y={280}>
        <Label size={120} color={BP.warn} style={{ fontVariantNumeric: 'tabular-nums' }}><Count to={22.5} dur={Math.round(d * 0.85)} decimals={1} /> h</Label>
        <Label size={44} color={BP.line} weight={600}>ONE WAY, PER COMMAND</Label>
      </Center>
    </AbsoluteFill>
  );
};

// 8 — It worked: noise turns back into clean data
const Scene8: React.FC = () => {
  const { f, d } = useP();
  const clean = prog(f, 3, d * 0.5);
  const check = ease(prog(f, d * 0.5, d * 0.65));
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {Array.from({ length: 8 }).map((_, row) => Array.from({ length: 12 }).map((__, col) => {
          const ok = random(`c${row}-${col}`) < clean;
          const x = 140 + col * 66, y = 380 + row * 56;
          return ok
            ? <rect key={`${row}-${col}`} x={x} y={y - 26} width={46} height={26} rx={4} fill={BP.ok} opacity={0.8} />
            : <text key={`${row}-${col}`} x={x} y={y} fill={BP.fail} fontSize={40} fontFamily="monospace" opacity={0.7}>{GLYPHS[Math.floor(random(`h${row}${col}${Math.floor(f / 4)}`) * GLYPHS.length)]}</text>;
        }))}
        <g transform={`translate(470,640) scale(${check})`} opacity={check}>
          <circle r={130} fill={BP.bg} stroke={BP.ok} strokeWidth={12} />
          <path d="M -60 0 L -15 45 L 65 -45" fill="none" stroke={BP.ok} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <Tag x={470} y={290} text="APRIL 20, 2024" o={prog(f, 4, 12)} color={BP.ok} lang="en" />
    </AbsoluteFill>
  );
};

// 9 — Quiet again (Nov 2026), still diagnosing
const Scene9: React.FC = () => {
  const { f, d } = useP();
  const fade = prog(f, 3, d * 0.35);
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Probe x={470} y={420} s={0.5} />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={150 + i * 64} y={720 - 40 - random(`q${i}`) * 140 * (1 - fade)} width={40} height={40 + random(`q${i}`) * 140 * (1 - fade)} rx={4} fill={BP.cyan} opacity={0.7} />
        ))}
        <path d={Array.from({ length: 60 }).map((_, i) => `${i === 0 ? 'M' : 'L'} ${130 + i * 12} ${780 + Math.sin(i / 2 + f / 4) * 6}`).join(' ')} fill="none" stroke={BP.warn} strokeWidth={5} opacity={fade} />
      </svg>
      <Tag x={470} y={290} text="NOV 14, 2026" o={prog(f, 3, 10)} color={BP.warn} lang="en" />
      <Tag x={470} y={900} text="carrier only · diagnosing" o={prog(f, d * 0.45, d * 0.6)} color={BP.line} lang="en" size={44} />
    </AbsoluteFill>
  );
};

// 10 — Loop back to the hook: one light-day away, can they do it twice?
const Scene10: React.FC = () => {
  const { f, d } = useP();
  const q = 1 + 0.08 * Math.sin(f / 4);
  return (
    <AbsoluteFill>
      <VBG />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <Stars />
        <Probe x={470} y={560} s={0.6} glow={BP.warn} />
      </svg>
      <Center y={270}>
        <Label size={96} color={BP.warn}>1 LIGHT-DAY</Label>
        <Label size={44} color={BP.line} weight={600}>AWAY FROM EARTH</Label>
      </Center>
      <div style={{ position: 'absolute', top: 700, left: 0, right: 140, textAlign: 'center', transform: `scale(${q})`, opacity: prog(f, d * 0.3, d * 0.45) }}>
        <Label size={220} color={BP.line} weight={900}>?</Label>
      </div>
    </AbsoluteFill>
  );
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];