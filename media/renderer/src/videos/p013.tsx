import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, UrduText, prog, ease } from '../common';

/**
 * p013 · سچ یا جھوٹ؟ "Is the Great Wall visible from space?" · vertical Short 1080x1920 (TikTok + Facebook).
 * REAL FOOTAGE: Pixabay stock of the Great Wall, NASA ISS Earth view, and NASA photo ISS010-E-08497 (Leroy Chiao, 2004).
 * Captions own y≈1040-1380; overlays in y 430-980.
 */
const W = 1080, H = 1920;
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc', RED = '#ff5a5a', GREEN = '#5bd68a';
const F = (f: string) => staticFile(`p013/footage/${f}`);

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d, fps } = useVideoConfig(); return { f, d, fps, at: (x: number, len = 8) => prog(f, x * d, x * d + len) }; };

const Clip: React.FC<{ src: string; from?: number; zoom?: [number, number]; dim?: number }> = ({ src, from = 0, zoom = [1.04, 1.14], dim = 0.15 }) => {
  const { f, d, fps } = useT();
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(prog(f, 0, d));
  return (<AbsoluteFill style={{ background: '#000' }}>
    <AbsoluteFill style={{ transform: `scale(${s})` }}><OffthreadVideo src={F(src)} muted startFrom={Math.round(from * fps)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} /></AbsoluteFill>);
};
const Still: React.FC<{ src: string; zoom?: [number, number]; dim?: number }> = ({ src, zoom = [1.05, 1.25], dim = 0.1 }) => {
  const { f, d } = useT();
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(prog(f, 0, d));
  return (<AbsoluteFill style={{ background: '#000' }}>
    <AbsoluteFill style={{ transform: `scale(${s})` }}><Img src={F(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} /></AbsoluteFill>);
};

const Frame: React.FC<{ tag?: string; children: React.ReactNode }> = ({ tag, children }) => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ background: '#05090d' }}>
    {children}
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,9,13,.9) 0%, rgba(5,9,13,0) 26%)' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: `linear-gradient(180deg, ${TEAL} 0%, rgba(15,59,68,.94) 80%, rgba(15,59,68,0) 100%)`, borderBottom: `4px solid ${AMBER}` }} />
    <div style={{ position: 'absolute', top: 200, left: 50, right: 50, textAlign: 'center' }}><UrduText size={62} color={CREAM} style={{ lineHeight: 1.6 }}><span style={{ color: AMBER }}>سچ یا جھوٹ؟</span> دیوارِ چین اور خلا</UrduText></div>
    {tag && <div style={{ position: 'absolute', top: 420, left: 60, opacity: prog(f, 2, 12) }}><div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, background: 'rgba(5,9,13,.72)', border: '2px solid rgba(255,255,255,.55)' }}><Label size={22} color="rgba(255,255,255,.9)" weight={700} style={{ letterSpacing: 2 }}>{tag}</Label></div></div>}
    <Label size={26} color="rgba(255,255,255,.75)" weight={600} style={{ position: 'absolute', bottom: 500, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
  </AbsoluteFill>);
};
const Pill: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 48 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ background: 'rgba(5,9,13,.8)', border: `3px solid ${color}`, borderRadius: 22, padding: '2px 30px 10px' }}><UrduText size={size} color={color}>{text}</UrduText></div></div>
);
const Stamp: React.FC<{ text: string; color: string; o: number }> = ({ text, color, o }) => (
  <div style={{ position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `rotate(-8deg) scale(${1.6 - 0.6 * o})` }}>
    <div style={{ border: `10px solid ${color}`, borderRadius: 30, padding: '0 60px 20px', background: 'rgba(5,9,13,.55)' }}><UrduText size={140} color={color}>{text}</UrduText></div></div>
);

// 1 · Hook
const Scene1: React.FC = () => { const { at } = useT(); return (<Frame tag="NASA FOOTAGE · EARTH FROM THE ISS"><Clip src="iss-earth-view.mp4" /><Pill text="خلا سے نظر آتی ہے؟" o={at(0.15)} y={620} size={56} /></Frame>); };
// 2 · The belief
const Scene2: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE · GREAT WALL OF CHINA"><Clip src="great-wall-drone.mp4" from={4} /><Pill text="بچپن سے یہی سنا" o={at(0.3)} y={620} color={CREAM} /></Frame>); };
// 3 · Verdict
const Scene3: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE · GREAT WALL OF CHINA"><Clip src="great-wall-drone.mp4" from={14} dim={0.45} /><Stamp text="جھوٹ" color={RED} o={ease(at(0.2, 10))} /></Frame>); };
// 4 · China's first astronaut (no photo)
const Scene4: React.FC = () => { const { at } = useT(); return (<Frame tag="NASA FOOTAGE · EARTH FROM THE ISS"><Clip src="iss-earth-view.mp4" from={8} dim={0.4} />
  <div style={{ position: 'absolute', top: 560, left: 120, right: 120, padding: '24px 30px', borderRadius: 24, background: 'rgba(5,9,13,.78)', border: `2px solid ${CREAM}`, textAlign: 'center', opacity: at(0.1, 12) }}>
    <Label size={30} color={AMBER} weight={800}>2003 · CHINA'S FIRST ASTRONAUT</Label>
    <UrduText size={52} color={CREAM}>”مجھے دیوار نظر نہیں آئی“</UrduText>
  </div></Frame>); };
// 5 · Too narrow (scale diagram)
const Scene5: React.FC = () => {
  const { f, d, at } = useT();
  const h = interpolate(f, [0.1 * d, 0.7 * d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (<Frame tag="STOCK FOOTAGE · GREAT WALL OF CHINA"><Clip src="great-wall.mp4" dim={0.55} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <line x1={540} y1={960} x2={540} y2={960 - 420 * ease(h)} stroke={AMBER} strokeWidth={6} strokeDasharray="14 10" />
      <circle cx={540} cy={960 - 420 * ease(h)} r={16} fill={AMBER} />
      <rect x={500} y={955} width={80} height={10} fill={CREAM} />
    </svg>
    <Label size={44} color={AMBER} weight={900} style={{ position: 'absolute', top: 500, width: '100%', textAlign: 'center', opacity: at(0.4) }}>≈ 400 km ↑</Label>
    <Pill text="چوڑائی: صرف چند میٹر" o={at(0.6)} y={850} color={CREAM} size={42} />
  </Frame>);
};
// 6 · Same colour as the land
const Scene6: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE · GREAT WALL OF CHINA"><Clip src="great-wall-drone.mp4" from={26} zoom={[1.0, 1.06]} />
  <Pill text="زمین جیسا رنگ" o={at(0.3)} y={620} color={AMBER} /></Frame>); };
// 7 · Only with a powerful lens: Chiao's real photo
const Scene7: React.FC = () => { const { at } = useT(); return (<Frame tag="NASA PHOTO · ISS010-E-08497 · 24 NOV 2004"><Still src="chiao-great-wall-2004.jpg" zoom={[1.0, 1.35]} />
  <Pill text="صرف طاقتور لینز سے" o={at(0.2)} y={560} color={AMBER} size={46} />
  <Pill text="چاند سے: ناممکن" o={at(0.62)} y={690} color={RED} size={46} /></Frame>); };
// 8 · Question (poll)
const Scene8: React.FC = () => {
  const { at } = useT();
  return (<Frame><Clip src="great-wall-drone.mp4" from={34} dim={0.5} />
    <div style={{ position: 'absolute', top: 580, left: 120, right: 120, display: 'flex', gap: 40, justifyContent: 'center', opacity: at(0.1) }}>
      {[['سچ', GREEN], ['جھوٹ', RED]].map(([t, c]) => <div key={t} style={{ flex: 1, textAlign: 'center', border: `5px solid ${c}`, borderRadius: 28, background: 'rgba(5,9,13,.7)', padding: '6px 0 18px' }}><UrduText size={76} color={c}>{t}</UrduText></div>)}
    </div>
    <Pill text="کمنٹ میں بتائیں 👇" o={at(0.45)} y={800} color={CREAM} size={42} />
  </Frame>);
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];