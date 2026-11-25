import React from 'react';
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, UrduText, prog, ease } from '../common';

/**
 * p012 · "K2: shorter than Everest, far more dangerous" · vertical Short/Reel 1080x1920 for Chai & Curiosity.
 * REAL FOOTAGE: Pixabay Content License clips (content/<slug>/footage/manifest.json), honestly tagged; diagrams on top.
 * Captions own y≈1040-1380; overlays live in y 430-980.
 */
const W = 1080, H = 1920;
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc', RED = '#ff6a5a', ICE = '#9fd3ff';
const F = (f: string) => staticFile(`p012/footage/${f}`);

const Clip: React.FC<{ src: string; from?: number; zoom?: [number, number]; dim?: number; pos?: string }> = ({ src, from = 0, zoom = [1.04, 1.14], dim = 0.15, pos = 'center' }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d, fps } = useVideoConfig();
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(prog(f, 0, d));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${s})` }}>
        <OffthreadVideo src={F(src)} muted startFrom={Math.round(from * fps)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} />
    </AbsoluteFill>
  );
};

/** Fixed headline band + small honest footage tag + brand line. */
const Frame: React.FC<{ tag?: string; children: React.ReactNode }> = ({ tag, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#05090d' }}>
      {children}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,9,13,.9) 0%, rgba(5,9,13,0) 26%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: `linear-gradient(180deg, ${TEAL} 0%, rgba(15,59,68,.94) 80%, rgba(15,59,68,0) 100%)`, borderBottom: `4px solid ${AMBER}` }} />
      <div style={{ position: 'absolute', top: 200, left: 50, right: 50, textAlign: 'center' }}>
        <UrduText size={64} color={CREAM} style={{ lineHeight: 1.6 }}>کے ٹو: <span style={{ color: AMBER }}>چھوٹا</span> مگر زیادہ خطرناک</UrduText>
      </div>
      {tag && <div style={{ position: 'absolute', top: 420, left: 60, opacity: prog(f, 2, 12) }}>
        <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, background: 'rgba(5,9,13,.72)', border: '2px solid rgba(255,255,255,.55)' }}>
          <Label size={22} color="rgba(255,255,255,.9)" weight={700} style={{ letterSpacing: 2 }}>{tag}</Label>
        </div>
      </div>}
      <Label size={26} color="rgba(255,255,255,.75)" weight={600} style={{ position: 'absolute', bottom: 500, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 50 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ background: 'rgba(5,9,13,.8)', border: `3px solid ${color}`, borderRadius: 22, padding: '2px 30px 10px' }}><UrduText size={size} color={color}>{text}</UrduText></div>
  </div>
);
const Big: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 120 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', opacity: o, fontFamily: 'Helvetica Neue, Arial', fontWeight: 900, fontSize: size, color, textShadow: '0 6px 30px rgba(0,0,0,.7)' }}>{text}</div>
);
const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return { f, d, at: (x: number, len = 8) => prog(f, x * d, x * d + len) }; };
const STOCK = 'STOCK FOOTAGE';

// 1 · Hook
const Scene1: React.FC = () => { const { at } = useT(); return (<Frame tag={`${STOCK} · K2 REGION, KARAKORAM`}><Clip src="k2-peak.mp4" zoom={[1.1, 1.2]} /><Big text="8,611 m" o={at(0.1)} y={620} /></Frame>); };

// 2 · The Savage Mountain
const Scene2: React.FC = () => { const { at } = useT(); return (<Frame tag={`${STOCK} · K2 BASE CAMP`}><Clip src="k2-basecamp.mp4" /><Pill text="وحشی پہاڑ" o={at(0.25)} y={620} color={RED} size={62} /><Pill text="گلگت بلتستان، پاکستان" o={at(0.55)} y={760} color={CREAM} size={40} /></Frame>); };

// 3 · Shorter than Everest (height bars over Everest footage)
const Scene3: React.FC = () => {
  const { f, d, at } = useT();
  const g = ease(prog(f, 0.05 * d, 0.5 * d));
  return (<Frame tag={`${STOCK} · MOUNT EVEREST`}><Clip src="everest.mp4" from={10} dim={0.45} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <line x1={140} y1={1000} x2={940} y2={1000} stroke="#fff" strokeWidth={3} opacity={0.6} />
      <rect x={250} y={1000 - 330 * g} width={200} height={330 * g} fill="rgba(159,211,255,.55)" stroke={ICE} strokeWidth={4} />
      <rect x={630} y={1000 - 321 * g} width={200} height={321 * g} fill="rgba(255,106,90,.55)" stroke={RED} strokeWidth={4} />
      <text x={350} y={1000 - 330 * g - 20} textAnchor="middle" fill="#fff" fontSize={36} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={g}>8,849 m</text>
      <text x={730} y={1000 - 321 * g - 20} textAnchor="middle" fill="#fff" fontSize={36} fontWeight={800} fontFamily="Helvetica Neue, Arial" opacity={g}>8,611 m</text>
    </svg>
    <Label size={36} color={ICE} weight={800} style={{ position: 'absolute', top: 1015, left: 250, width: 200, textAlign: 'center', opacity: g }}>EVEREST</Label>
    <Label size={36} color={RED} weight={800} style={{ position: 'absolute', top: 1015, left: 630, width: 200, textAlign: 'center', opacity: g }}>K2</Label>
    <Pill text="تقریباً ۲۴۰ میٹر چھوٹا" o={at(0.6)} y={510} color={AMBER} size={44} />
  </Frame>);
};

// 4 · Historically ~1 in 4
const Scene4: React.FC = () => {
  const { at } = useT();
  return (<Frame tag={`${STOCK} · K2 REGION`}><Clip src="k2-peak.mp4" from={0} zoom={[1.2, 1.3]} dim={0.2} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {[0, 1, 2, 3].map((i) => { const dead = i === 3; const o = at(0.08 + i * 0.08); return (<g key={i} opacity={o * (dead ? 1 - 0.65 * at(0.6, 12) : 1)} transform={`translate(${210 + i * 220} 760)`}>
        <circle cy={-90} r={42} fill={dead ? RED : '#e6edf3'} /><path d="M-70 60 Q-70 -40 0 -40 Q70 -40 70 60 Z" fill={dead ? RED : '#e6edf3'} /></g>); })}
    </svg>
    <Big text="1 : 4" o={at(0.5)} y={880} color={RED} size={110} />
    <Pill text="کئی دہائیوں تک" o={at(0.3)} y={510} color={CREAM} size={40} />
  </Frame>);
};

// 5 · Everest much lower (risk bars)
const Scene5: React.FC = () => {
  const { f, d } = useT();
  const g = ease(prog(f, 0.05 * d, 0.6 * d));
  return (<Frame tag={`${STOCK} · MOUNT EVEREST`}><Clip src="everest.mp4" from={30} dim={0.5} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <rect x={250} y={1000 - 90 * g} width={200} height={90 * g} fill="rgba(159,211,255,.7)" />
      <rect x={630} y={1000 - 420 * g} width={200} height={420 * g} fill="rgba(255,106,90,.75)" />
      <line x1={140} y1={1000} x2={940} y2={1000} stroke="#fff" strokeWidth={3} />
    </svg>
    <Label size={34} color={ICE} weight={800} style={{ position: 'absolute', top: 1015, left: 250, width: 200, textAlign: 'center' }}>EVEREST</Label>
    <Label size={34} color={RED} weight={800} style={{ position: 'absolute', top: 1015, left: 630, width: 200, textAlign: 'center' }}>K2</Label>
    <Pill text="خطرہ" o={g} y={510} color={RED} size={50} />
  </Frame>);
};

// 6 · Steeper, technical
const Scene6: React.FC = () => {
  const { f, d, at } = useT();
  const ang = Math.round(interpolate(f, [0.15 * d, 0.6 * d], [0, 45], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (<Frame tag={`${STOCK} · HIGH-ALTITUDE CLIMBING`}><Clip src="steep-wall.mp4" />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: at(0.1) }}>
      <path d="M200 960 L880 960" stroke="#fff" strokeWidth={4} /><path d={`M200 960 L${200 + 680 * Math.cos(ang * Math.PI / 180)} ${960 - 680 * Math.sin(ang * Math.PI / 180)}`} stroke={AMBER} strokeWidth={8} strokeLinecap="round" />
    </svg>
    <Big text={`${ang}°+`} o={at(0.2)} y={640} size={100} />
    <Pill text="زیادہ ڈھلوان، زیادہ تکنیکی" o={at(0.55)} y={510} color={CREAM} size={40} />
  </Frame>);
};

// 7 · Sudden weather, accidents on the way down
const Scene7: React.FC = () => {
  const { at } = useT();
  return (<Frame tag={`${STOCK} · MOUNTAIN BLIZZARD`}><Clip src="blizzard-peak.mp4" />
    <Pill text="موسم اچانک بدلتا ہے" o={at(0.1)} y={560} color={ICE} size={46} />
    <Pill text="⬇ واپسی سب سے خطرناک" o={at(0.5)} y={700} color={RED} size={46} />
  </Frame>);
};

// 8 · Last 8000er in winter (2021)
const Scene8: React.FC = () => {
  const { at } = useT();
  return (<Frame tag={`${STOCK} · ICE CLIMBING`}><Clip src="k2-climber-crampons.mp4" from={6} />
    <Pill text="سردیوں میں سب سے آخر" o={at(0.15)} y={560} color={AMBER} size={46} />
    <Big text="2021" o={at(0.45)} y={680} size={120} />
  </Frame>);
};

// 9 · Ali Sadpara tribute (no photo)
const Scene9: React.FC = () => {
  const { at } = useT();
  return (<Frame tag={`${STOCK} · K2 REGION, KARAKORAM`}><Clip src="k2-peak.mp4" from={0} zoom={[1.0, 1.08]} dim={0.55} />
    <div style={{ position: 'absolute', top: 560, left: 140, right: 140, padding: '26px 30px', borderRadius: 24, background: 'rgba(5,9,13,.75)', border: `2px solid ${CREAM}`, textAlign: 'center', opacity: at(0.15, 14) }}>
      <UrduText size={58} color={CREAM}>محمد علی سدپارہ</UrduText>
      <Label size={28} color="rgba(255,255,255,.85)" weight={600}>SKARDU · 1976 – 2021</Label>
    </div>
  </Frame>);
};

// 10 · Payoff: the real test is in Pakistan
const Scene10: React.FC = () => {
  const { f, d } = useT();
  const flagOut = prog(f, 0.45 * d, 0.55 * d);
  return (<Frame tag={STOCK}>
    <AbsoluteFill style={{ opacity: 1 - flagOut }}><Clip src="pakistan-flag.mp4" /></AbsoluteFill>
    <AbsoluteFill style={{ opacity: flagOut }}><Clip src="k2-basecamp.mp4" from={6} /></AbsoluteFill>
    <Pill text="اصل امتحان پاکستان میں ہے" o={prog(f, 0.5 * d, 0.5 * d + 10)} y={620} color={AMBER} size={50} />
  </Frame>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];