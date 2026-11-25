import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, UrduText, prog, ease } from '../common';

/**
 * p014 · دنیا کے ریکارڈز "The hottest place on Earth" · vertical Short 1080x1920 (TikTok + Facebook).
 * REAL FOOTAGE: Pixabay desert/Death Valley/thermometer stock + NASA ISS photo of the Lut Desert (ISS012-E-18779).
 * Captions own y≈1040-1380; overlays in y 430-980.
 */
const W = 1080, H = 1920;
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc', HOT = '#ff6a3a', SKY = '#9fd3ff';
const F = (f: string) => staticFile(`p014/footage/${f}`);
const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d, fps } = useVideoConfig(); return { f, d, fps, at: (x: number, len = 8) => prog(f, x * d, x * d + len) }; };

const Clip: React.FC<{ src: string; from?: number; zoom?: [number, number]; dim?: number }> = ({ src, from = 0, zoom = [1.04, 1.14], dim = 0.15 }) => {
  const { f, d, fps } = useT();
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(prog(f, 0, d));
  return (<AbsoluteFill style={{ background: '#000' }}>
    <AbsoluteFill style={{ transform: `scale(${s})` }}><OffthreadVideo src={F(src)} muted startFrom={Math.round(from * fps)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} /></AbsoluteFill>);
};
const Still: React.FC<{ src: string; zoom?: [number, number]; dim?: number }> = ({ src, zoom = [1.05, 1.25], dim = 0.15 }) => {
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
    <div style={{ position: 'absolute', top: 200, left: 50, right: 50, textAlign: 'center' }}><UrduText size={62} color={CREAM} style={{ lineHeight: 1.6 }}><span style={{ color: AMBER }}>دنیا کا ریکارڈ:</span> سب سے گرم جگہ</UrduText></div>
    {tag && <div style={{ position: 'absolute', top: 420, left: 60, opacity: prog(f, 2, 12) }}><div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, background: 'rgba(5,9,13,.72)', border: '2px solid rgba(255,255,255,.55)' }}><Label size={22} color="rgba(255,255,255,.9)" weight={700} style={{ letterSpacing: 2 }}>{tag}</Label></div></div>}
    <Label size={26} color="rgba(255,255,255,.75)" weight={600} style={{ position: 'absolute', bottom: 500, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
  </AbsoluteFill>);
};
const Pill: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 48 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ background: 'rgba(5,9,13,.8)', border: `3px solid ${color}`, borderRadius: 22, padding: '2px 30px 10px' }}><UrduText size={size} color={color}>{text}</UrduText></div></div>
);
const Big: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = HOT, size = 150 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', opacity: o, fontFamily: 'Helvetica Neue, Arial', fontWeight: 900, fontSize: size, color, textShadow: '0 6px 30px rgba(0,0,0,.7)', fontVariantNumeric: 'tabular-nums' }}>{text}</div>
);

// 1 · Hook: counter to 70°
const Scene1: React.FC = () => { const { f, d, at } = useT(); const t = Math.round(interpolate(f, [0.05 * d, 0.7 * d], [30, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })); return (<Frame tag="STOCK FOOTAGE · DESERT"><Clip src="desert-heat.mp4" /><Big text={`${t}°C`} o={at(0.03)} y={600} /></Frame>); };
// 2 · Where: Lut Desert, measured by NASA
const Scene2: React.FC = () => { const { at } = useT(); return (<Frame tag="NASA PHOTO · DASHT-E-LUT, IRAN · FROM THE ISS"><Still src="lut-desert-iss.jpg" zoom={[1.0, 1.3]} /><Pill text="دشتِ لوت، ایران" o={at(0.15)} y={580} /><Pill text="ناسا سیٹلائٹ" o={at(0.5)} y={700} color={SKY} size={42} /></Frame>); };
// 3 · The number 70.7 (2005)
const Scene3: React.FC = () => { const { at } = useT(); return (<Frame tag="NASA PHOTO · DASHT-E-LUT, IRAN"><Still src="lut-desert-iss.jpg" zoom={[1.3, 1.5]} dim={0.45} /><Big text="70.7°C" o={at(0.1)} y={560} /><Label size={44} color={CREAM} weight={800} style={{ position: 'absolute', top: 760, width: '100%', textAlign: 'center', opacity: at(0.4) }}>2005 · NASA MODIS</Label></Frame>); };
// 4 · Ground vs air (diagram)
const Scene4: React.FC = () => {
  const { at } = useT();
  return (<Frame tag="STOCK FOOTAGE · DESERT"><Clip src="desert-heat.mp4" from={20} dim={0.55} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <rect x={120} y={540} width={840} height={240} rx={20} fill="rgba(159,211,255,.18)" stroke={SKY} strokeWidth={3} opacity={at(0.4)} />
      <rect x={120} y={800} width={840} height={110} rx={20} fill="rgba(255,106,58,.45)" stroke={HOT} strokeWidth={4} opacity={at(0.1)} />
    </svg>
    <Pill text="زمین کی سطح" o={at(0.1)} y={815} color={HOT} size={44} />
    <Pill text="ہوا" o={at(0.4)} y={610} color={SKY} size={44} />
  </Frame>);
};
// 5 · Why: dark ground absorbs sunlight
const Scene5: React.FC = () => {
  const { f, at } = useT();
  return (<Frame tag="STOCK FOOTAGE · SUN AND HEAT"><Clip src="thermometer.mp4" dim={0.3} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: at(0.1) }}>
      {[260, 440, 620, 800].map((x, i) => { const y = 480 + ((f * 6 + i * 60) % 360); return <path key={i} d={`M${x} ${y} l0 70 M${x - 18} ${y + 52} l18 18 l18 -18`} stroke={AMBER} strokeWidth={8} fill="none" strokeLinecap="round" />; })}
    </svg>
    <Pill text="سیاہ پتھر دھوپ جذب کرتے ہیں" o={at(0.45)} y={860} color={AMBER} size={42} />
  </Frame>);
};
// 6 · Air record: Death Valley 56.7°C
const Scene6: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE · DEATH VALLEY, USA"><Clip src="death-valley.mp4" from={10} /><Big text="56.7°C" o={at(0.2)} y={580} color={AMBER} size={140} /><Label size={40} color={CREAM} weight={800} style={{ position: 'absolute', top: 760, width: '100%', textAlign: 'center', opacity: at(0.45) }}>AIR RECORD · 1913</Label></Frame>); };
// 7 · Pakistan: Jacobabad
const Scene7: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE · SUN AND HEAT"><Clip src="thermometer.mp4" from={8} dim={0.35} /><Pill text="جیکب آباد، پاکستان" o={at(0.15)} y={600} color={HOT} size={54} /><Pill text="دنیا کے گرم ترین شہروں میں" o={at(0.5)} y={730} color={CREAM} size={40} /></Frame>); };
// 8 · Question
const Scene8: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE · DESERT"><Clip src="desert-heat.mp4" from={40} dim={0.4} /><Big text="?°C" o={at(0.1)} y={600} color={AMBER} size={150} /><Pill text="آپ کے شہر میں کتنی گرمی؟" o={at(0.45)} y={820} color={CREAM} size={42} /></Frame>); };

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];