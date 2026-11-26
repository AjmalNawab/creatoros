import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, UrduText, prog, ease } from '../common';

/**
 * p015 · کامیابی کی اصل کہانی: Colonel Sanders & KFC · vertical Reel 1080x1920 (Instagram).
 * REAL FOOTAGE: "Give Yourself the Green Light" (1954, Prelinger Archives, public domain) for 1950s America and the
 * new highways; Pixabay stock for chicken, steam, lamp, steam train. No KFC logos, no image of Sanders himself.
 * Captions own y≈1040-1380; overlays in y 430-980.
 */
const W = 1080, H = 1920;
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc', RED = '#ff5a5a', GREEN = '#5bd68a';
const F = (f: string) => staticFile(`p015/footage/${f}`);
const ARCHIVE = 'ARCHIVE FILM · USA 1954 (PUBLIC DOMAIN)';

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d, fps } = useVideoConfig(); return { f, d, fps, at: (x: number, len = 8) => prog(f, x * d, x * d + len) }; };

/** A muted clip with a slow push-in. `old` gives archive film a light vintage grade. */
const Clip: React.FC<{ src: string; from?: number; zoom?: [number, number]; dim?: number; old?: boolean }> = ({ src, from = 0, zoom = [1.04, 1.14], dim = 0.15, old }) => {
  const { f, d, fps } = useT();
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(prog(f, 0, d));
  return (<AbsoluteFill style={{ background: '#000' }}>
    <AbsoluteFill style={{ transform: `scale(${s})`, filter: old ? 'sepia(0.25) contrast(1.06) saturate(0.9)' : undefined }}>
      <OffthreadVideo src={F(src)} muted startFrom={Math.round(from * fps)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: `rgba(5,9,13,${dim})` }} /></AbsoluteFill>);
};

const Frame: React.FC<{ tag?: string; children: React.ReactNode }> = ({ tag, children }) => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ background: '#05090d' }}>
    {children}
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,9,13,.9) 0%, rgba(5,9,13,0) 26%)' }} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: `linear-gradient(180deg, ${TEAL} 0%, rgba(15,59,68,.94) 80%, rgba(15,59,68,0) 100%)`, borderBottom: `4px solid ${AMBER}` }} />
    <div style={{ position: 'absolute', top: 200, left: 50, right: 50, textAlign: 'center' }}><UrduText size={58} color={CREAM} style={{ lineHeight: 1.6 }}><span style={{ color: AMBER }}>کامیابی کی اصل کہانی:</span> کے ایف سی</UrduText></div>
    {tag && <div style={{ position: 'absolute', top: 420, left: 60, opacity: prog(f, 2, 12) }}><div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 8, background: 'rgba(5,9,13,.72)', border: '2px solid rgba(255,255,255,.55)' }}><Label size={22} color="rgba(255,255,255,.9)" weight={700} style={{ letterSpacing: 2 }}>{tag}</Label></div></div>}
    <Label size={26} color="rgba(255,255,255,.75)" weight={600} style={{ position: 'absolute', bottom: 500, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
  </AbsoluteFill>);
};

const Pill: React.FC<{ text: string; o: number; y: number; color?: string; size?: number; strike?: number }> = ({ text, o, y, color = AMBER, size = 48, strike = 0 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ position: 'relative', background: 'rgba(5,9,13,.8)', border: `3px solid ${color}`, borderRadius: 22, padding: '2px 30px 10px' }}>
      <UrduText size={size} color={color}>{text}</UrduText>
      {strike > 0 && <div style={{ position: 'absolute', left: 16, top: '52%', height: 6, width: `${strike * 88}%`, background: RED, borderRadius: 3 }} />}
    </div></div>
);
const Big: React.FC<{ text: string; o: number; y: number; color?: string; size?: number }> = ({ text, o, y, color = AMBER, size = 170 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', opacity: o, transform: `scale(${1.25 - 0.25 * o})`, fontFamily: 'Helvetica Neue, Arial', fontWeight: 900, fontSize: size, color, textShadow: '0 6px 30px rgba(0,0,0,.75)', fontVariantNumeric: 'tabular-nums' }}>{text}</div>
);
const Stamp: React.FC<{ text: string; color: string; o: number; y?: number; size?: number }> = ({ text, color, o, y = 640, size = 96 }) => (
  <div style={{ position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o, transform: `rotate(-8deg) scale(${1.6 - 0.6 * o})` }}>
    <div style={{ border: `9px solid ${color}`, borderRadius: 26, padding: '0 46px 16px', background: 'rgba(5,9,13,.6)' }}><UrduText size={size} color={color}>{text}</UrduText></div></div>
);
const count = (f: number, d: number, to: number, a = 0.08, b = 0.6) => Math.round(interpolate(f, [a * d, b * d], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

// 1 · Hook: "1009 rejections?"
const Scene1: React.FC = () => { const { f, d, at } = useT(); return (<Frame tag="STOCK FOOTAGE"><Clip src="chicken-fries.mp4" dim={0.4} />
  <Big text={`${count(f, d, 1009, 0, 0.45)}`} o={at(0)} y={540} />
  <Pill text="انکار؟" o={at(0.35)} y={760} color={CREAM} size={56} />
  <Stamp text="سچ یا قصہ؟" color={RED} o={ease(at(0.62, 8))} y={860} size={64} /></Frame>); };

// 2 · Hard childhood (no image of Sanders)
const Scene2: React.FC = () => { const { at } = useT(); return (<Frame tag="STOCK FOOTAGE"><Clip src="lamp.mp4" dim={0.3} />
  <Pill text="انڈیانا، امریکہ (۱۸۹۰)" o={at(0.08)} y={560} />
  <Pill text="والد کا انتقال، گھر کا کھانا اس کے ذمے" o={at(0.45)} y={700} color={CREAM} size={40} /></Frame>); };

// 3 · Many jobs, several lost
const Scene3: React.FC = () => { const { f, d, at } = useT(); const s = (x: number) => prog(f, x * d, x * d + 10);
  return (<Frame tag="STOCK FOOTAGE"><Clip src="steam-train.mp4" dim={0.35} />
    <Pill text="کھیت" o={at(0.1)} y={520} size={46} strike={s(0.75)} />
    <Pill text="ریلوے" o={at(0.3)} y={640} size={46} strike={s(0.82)} />
    <Pill text="انشورنس" o={at(0.5)} y={760} size={46} strike={s(0.9)} /></Frame>); };

// 4 · Roadside cafe, chicken becomes famous (archive shows 1950s America, not Corbin itself)
const Scene4: React.FC = () => { const { f, d, at } = useT(); return (<Frame tag={f < d * 0.55 ? ARCHIVE : 'STOCK FOOTAGE'}>
  <Clip src="town-street.mp4" old dim={0.3} />
  <Sequence from={Math.round(d * 0.55)} layout="none"><Clip src="chicken-fries.mp4" from={5} dim={0.3} /></Sequence>
  <Pill text="کوربن، کینٹکی (۱۹۳۰)" o={at(0.08)} y={560} />
  <Pill text="پیٹرول پمپ پر مسافروں کا کھانا" o={at(0.3)} y={680} color={CREAM} size={40} /></Frame>); };

// 5 · The new highway takes the traffic away
const Scene5: React.FC = () => { const { d, at } = useT(); return (<Frame tag={ARCHIVE}>
  <Clip src="hwy-aerial.mp4" old dim={0.25} />
  <Sequence from={Math.round(d * 0.5)} layout="none"><Clip src="freeway-sign.mp4" old dim={0.3} /></Sequence>
  <Pill text="نئی شاہراہ" o={at(0.1)} y={560} />
  <Pill text="گاہک غائب، ریستوران گھاٹے میں بکا" o={at(0.55)} y={680} color={RED} size={40} /></Frame>); };

// 6 · Age ~65, $105 a month
const Scene6: React.FC = () => { const { f, d, at } = useT(); return (<Frame tag={ARCHIVE}><Clip src="road-car.mp4" old dim={0.45} />
  <Big text={`$${count(f, d, 105, 0.15, 0.6)}`} o={at(0.1)} y={540} color={AMBER} />
  <Pill text="ماہانہ پنشن" o={at(0.35)} y={740} color={CREAM} size={44} />
  <Pill text="عمر: تقریباً ۶۵ سال" o={at(0.55)} y={850} color={AMBER} size={40} /></Frame>); };

// 7 · The turning point: a friend's restaurant was already selling it (Salt Lake City, 1952)
const Scene7: React.FC = () => { const { f, d, at } = useT(); const pulse = 1 + 0.12 * Math.sin(f / 5);
  return (<Frame tag="STOCK FOOTAGE"><Clip src="chicken-fries.mp4" from={8} dim={0.55} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: at(0.05, 10) }}>
      <circle cx={540} cy={640} r={34 * pulse} fill="none" stroke={GREEN} strokeWidth={6} opacity={0.7} />
      <path d="M540 700 C500 640 500 600 540 580 C580 600 580 640 540 700 Z" fill={GREEN} />
      <circle cx={540} cy={615} r={12} fill="#05090d" />
    </svg>
    <Pill text="سالٹ لیک سٹی (۱۹۵۲)" o={at(0.2)} y={730} color={GREEN} size={44} />
    <Pill text="پہلی فرنچائز: ایک دوست کا ہوٹل" o={at(0.5)} y={840} color={CREAM} size={40} /></Frame>); };

// 8 · On the road: a pressure cooker and a few cents per chicken
const Scene8: React.FC = () => { const { f, d, at } = useT(); return (<Frame tag={f < d * 0.5 ? ARCHIVE : 'STOCK FOOTAGE'}>
  <Clip src="country-road.mp4" old dim={0.3} />
  <Sequence from={Math.round(d * 0.5)} layout="none"><Clip src="steam.mp4" dim={0.35} /></Sequence>
  <Pill text="ہوٹل ہوٹل، شہر شہر" o={at(0.1)} y={560} />
  <Pill text="ہر مرغی پر چند سینٹ" o={at(0.55)} y={680} color={GREEN} size={46} /></Frame>); };

// 9 · The myth check
const Scene9: React.FC = () => { const { at } = useT(); return (<Frame><Clip src="chicken-fries.mp4" from={3} dim={0.7} zoom={[1.1, 1.2]} />
  <Big text="1009" o={at(0.05)} y={520} color={CREAM} size={150} />
  <Stamp text="ثبوت نہیں" color={RED} o={ease(at(0.3, 8))} y={560} size={80} />
  <Pill text="انکار بہت ہوئے، مگر یہ عدد ایک قصہ ہے" o={at(0.55)} y={800} color={AMBER} size={38} />
  <Label size={24} color="rgba(255,255,255,.75)" weight={700} style={{ position: 'absolute', top: 930, width: '100%', textAlign: 'center', letterSpacing: 2, opacity: at(0.7) }}>FACT-CHECKS: SNOPES · AAP FACTCHECK</Label></Frame>); };

// 10 · Payoff: $2,000,000 in 1964, and the lesson
const Scene10: React.FC = () => { const { f, d, at } = useT(); const v = count(f, d, 2000000, 0.05, 0.45);
  return (<Frame tag="STOCK FOOTAGE"><Clip src="chicken-fries.mp4" from={10} dim={0.4} />
    <Big text={`$${v.toLocaleString('en-US')}`} o={at(0.02)} y={540} color={GREEN} size={118} />
    <Label size={40} color={CREAM} weight={800} style={{ position: 'absolute', top: 700, width: '100%', textAlign: 'center', opacity: at(0.25) }}>1964</Label>
    <Pill text="ہزار انکار نہیں، برسوں کی محنت" o={at(0.55)} y={800} color={AMBER} size={46} /></Frame>); };

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];