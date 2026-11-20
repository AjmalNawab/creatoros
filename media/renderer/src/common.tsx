import React from 'react';
import {
  AbsoluteFill, continueRender, delayRender, cancelRender, interpolate, random,
  staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

export const C = {
  night: '#0b1020', night2: '#1a1f3a', rock: '#3b2a24', rockLight: '#5a4036', crust: '#7a5a43',
  mantle: '#c2410c', magma: '#ff6a00', magmaHot: '#ffb020', core: '#ffe08a', ash: '#6b6b74',
  sea: '#1e5a8a', green: '#3f8f3a', text: '#fff7ed',
};

// --- Urdu font (loaded once, blocks render until ready) ---
const fontHandle = delayRender('Loading Noto Nastaliq Urdu');
const face = new FontFace('Nastaliq', `url(${staticFile('fonts/NotoNastaliqUrdu.ttf')}) format('truetype')`);
face.load().then((f) => { document.fonts.add(f); continueRender(fontHandle); }).catch((e) => cancelRender(e));

export const URDU = 'Nastaliq, serif';
export const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** English on-screen text (same visual weight as UrduText). */
export const Label: React.FC<{ children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties }> = ({
  children, size = 56, color = C.text, weight = 700, style,
}) => (
  <div style={{ fontFamily: SANS, fontSize: size, fontWeight: weight, color, lineHeight: 1.25, letterSpacing: 0.5,
    textShadow: '0 4px 18px rgba(0,0,0,.6)', ...style }}>{children}</div>
);

export const UrduText: React.FC<{
  children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties;
}> = ({ children, size = 64, color = C.text, style }) => (
  <div style={{ fontFamily: URDU, direction: 'rtl', fontSize: size, color, lineHeight: 1.9,
    textShadow: '0 4px 18px rgba(0,0,0,.6)', ...style }}>{children}</div>
);

/** 0→1 progress between two frames, clamped */
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

export const ease = (x: number) => 1 - Math.pow(1 - x, 3);

/** Fade the whole scene in/out at its edges */
export const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = Math.min(prog(f, 0, 12), 1 - prog(f, durationInFrames - 10, durationInFrames));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const NightSky: React.FC<{ stars?: number }> = ({ stars = 70 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 120%, ${C.night2}, ${C.night} 70%)` }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: stars }).map((_, i) => (
          <circle key={i} cx={random(`sx${i}`) * 1920} cy={random(`sy${i}`) * 650} r={random(`sr${i}`) * 2 + 0.5}
            fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(f / 25 + i))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Labelled pill used for on-screen keywords. lang="en" uses the sans font. */
export const Tag: React.FC<{ x: number; y: number; text: string; o: number; color?: string; size?: number; lang?: 'ur' | 'en' }> = ({
  x, y, text, o, color = C.magma, size = 54, lang = 'ur',
}) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * o})`, opacity: o,
    background: 'rgba(11,16,32,.75)', border: `3px solid ${color}`, borderRadius: 24, padding: lang === 'en' ? '10px 30px' : '0 34px' }}>
    {lang === 'en'
      ? <Label size={size * 0.8} color={color} style={{ whiteSpace: 'nowrap' }}>{text}</Label>
      : <UrduText size={size} color={color} style={{ whiteSpace: 'nowrap' }}>{text}</UrduText>}
  </div>
);

/** Engineering blueprint background: navy with a fine + major grid (Margin of Safety style). */
export const BP = { bg: '#0b1d33', bg2: '#0e2747', line: '#e8f4ff', cyan: '#5fd3ff', grid: 'rgba(120,180,255,.10)', gridMajor: 'rgba(120,180,255,.22)', warn: '#ff7a1a', fail: '#ff3b3b', ok: '#3ddc97' };
export const Blueprint: React.FC<{ drift?: boolean }> = ({ drift = true }) => {
  const f = useCurrentFrame();
  const off = drift ? (f * 0.2) % 40 : 0;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${BP.bg2}, ${BP.bg} 75%)` }}>
      <svg width={1920} height={1080}>
        <defs>
          <pattern id="bpMinor" width={40} height={40} patternUnits="userSpaceOnUse" x={off} y={off}><path d="M40 0H0V40" fill="none" stroke={BP.grid} strokeWidth={1} /></pattern>
          <pattern id="bpMajor" width={200} height={200} patternUnits="userSpaceOnUse" x={off} y={off}><path d="M200 0H0V200" fill="none" stroke={BP.gridMajor} strokeWidth={1.5} /></pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#bpMinor)" />
        <rect width={1920} height={1080} fill="url(#bpMajor)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Deterministic lava/ash particles shooting out of a point */
export const Particles: React.FC<{ x: number; y: number; t: number; n?: number; colors?: string[]; spread?: number; power?: number }> = ({
  x, y, t, n = 60, colors = [C.magma, C.magmaHot, '#ff3b1f'], spread = 1, power = 1,
}) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const life = (t * 1.6 + random(`pl${i}`)) % 1;           // looping 0..1
      const ang = (-Math.PI / 2) + (random(`pa${i}`) - 0.5) * 1.3 * spread;
      const v = (420 + random(`pv${i}`) * 380) * power;
      const px = x + Math.cos(ang) * v * life;
      const py = y + Math.sin(ang) * v * life + 520 * life * life;   // gravity
      return <circle key={i} cx={px} cy={py} r={(1 - life) * 12 + 3} fill={colors[i % colors.length]} opacity={1 - life} />;
    })}
  </g>
);
