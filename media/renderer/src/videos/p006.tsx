import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, Tag, UrduText, prog, ease } from '../common';

/**
 * p006 · "Why a dead finger can't unlock a phone" · vertical 1080x1920, Chai & Curiosity Facebook style.
 * Painted illustrations (ChatGPT, owner's account) brought to life with slow camera moves, a fixed headline
 * band on top, chapter tag, light particles and diagram overlays. Bottom area is left for the captions.
 */
const W = 1080, H = 1920;
const P = (n: number) => staticFile(`p006/paintings/${n}.png`);
const TEAL = '#0f3b44', AMBER = '#ffd27a', CREAM = '#fff4dc';

/** One painting, slowly pushing in/drifting, fading in/out between [a,b] (fractions of the scene). */
const Shot: React.FC<{ n: number; a?: number; b?: number; zoom?: [number, number]; dx?: number; dy?: number; tint?: string }> = ({ n, a = 0, b = 1, zoom = [1.05, 1.18], dx = 0, dy = 0, tint }) => {
  const f = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const t = prog(f, a * d, b * d);
  const fadeIn = a === 0 ? 1 : prog(f, a * d, a * d + 18);
  const fadeOut = b >= 1 ? 1 : 1 - prog(f, b * d - 18, b * d);
  const s = zoom[0] + (zoom[1] - zoom[0]) * ease(t);
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <Img src={P(n)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s}) translate(${dx * t}%, ${dy * t}%)` }} />
      {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: 'color', opacity: 0.35 }} />}
    </AbsoluteFill>
  );
};

/** Dust/light motes so even still moments move. */
const Motes: React.FC<{ color?: string; n?: number }> = ({ color = '255,210,122', n = 40 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = (random(`mx${i}`) * W + f * (0.2 + random(`mv${i}`) * 0.6)) % W;
        const y = (random(`my${i}`) * H - f * (0.15 + random(`mu${i}`) * 0.4) + H * 2) % H;
        return <circle key={i} cx={x} cy={y} r={1 + random(`mr${i}`) * 2.4} fill={`rgba(${color},${0.12 + random(`mo${i}`) * 0.35})`} />;
      })}
    </svg>
  );
};

/** Fixed headline band (the video's question) + the chapter name; vignette for readability. */
const Frame: React.FC<{ chapter: string; children: React.ReactNode }> = ({ chapter, children }) => {
  const f = useCurrentFrame();
  const o = prog(f, 4, 20);
  return (
    <AbsoluteFill style={{ background: '#05090d' }}>
      {children}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,9,13,.92) 0%, rgba(5,9,13,0) 24%, rgba(5,9,13,0) 62%, rgba(5,9,13,.85) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: `linear-gradient(180deg, ${TEAL} 0%, rgba(15,59,68,.94) 78%, rgba(15,59,68,0) 100%)`, borderBottom: `4px solid ${AMBER}` }} />
      <div style={{ position: 'absolute', top: 70, left: 40, right: 40, textAlign: 'center' }}>
        <UrduText size={62} color={CREAM} style={{ lineHeight: 1.7 }}>مرنے کے بعد انگلی <span style={{ color: AMBER }}>فون کیوں نہیں</span> کھولتی؟</UrduText>
      </div>
      <div style={{ position: 'absolute', top: 320, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o }}>
        <div style={{ background: 'rgba(5,9,13,.7)', border: `2px solid ${AMBER}`, borderRadius: 40, padding: '0 34px 6px' }}>
          <UrduText size={42} color={AMBER}>{chapter}</UrduText>
        </div>
      </div>
      <Label size={26} color="rgba(255,255,255,.7)" weight={600} style={{ position: 'absolute', bottom: 210, width: '100%', textAlign: 'center', letterSpacing: 3 }}>☕ CHAI & CURIOSITY</Label>
    </AbsoluteFill>
  );
};

const useT = () => { const f = useCurrentFrame(); const { durationInFrames: d } = useVideoConfig(); return { f, d, at: (x: number, len = 16) => prog(f, x * d, x * d + len) }; };

// 1 · Hook: the phone that refuses
const Scene1: React.FC = () => {
  const { f, at } = useT();
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(f / 9));
  return (
    <Frame chapter="ایک فون جو نہیں کھلا">
      <Shot n={1} zoom={[1.02, 1.2]} dy={2} />
      <div style={{ position: 'absolute', left: 445, top: 1180, width: 190, height: 120, borderRadius: '50%', background: `radial-gradient(rgba(255,60,50,${0.5 * pulse}), transparent 70%)` }} />
      <Tag x={540} y={560} text="؟" o={at(0.55)} color={AMBER} size={110} />
      <Motes />
    </Frame>
  );
};

// 2 · Where fingerprints come from (womb → twins)
const Scene2: React.FC = () => {
  const { at } = useT();
  return (
    <Frame chapter="نشان کہاں سے آتے ہیں؟">
      <Shot n={6} a={0} b={0.56} zoom={[1.05, 1.2]} dx={-2} />
      <Shot n={7} a={0.5} b={1} zoom={[1.0, 1.14]} dy={-2} />
      <Tag x={540} y={520} text="تیرہ سے انیس ہفتے" o={at(0.12) * (1 - at(0.5))} color={AMBER} size={56} />
      <Tag x={540} y={520} text="جڑواں بچے: مختلف نشان" o={at(0.6)} color="#7fe0ff" size={56} />
      <Motes />
    </Frame>
  );
};

// 3 · Three kinds of sensors
const Scene3: React.FC = () => {
  const { at } = useT();
  const rows: [string, string, number][] = [['آپٹیکل: روشنی', '#ffffff', 0.18], ['الٹراسونک: آواز', '#7fe0ff', 0.45], ['کیپیسیٹو: بجلی', AMBER, 0.78]];
  return (
    <Frame chapter="تین طرح کے سینسر">
      <Shot n={8} zoom={[1.04, 1.18]} dy={1.5} />
      {rows.map(([t, c, x], i) => <Tag key={i} x={540} y={540 + i * 120} text={t} o={at(x)} color={c} size={52} />)}
      <Motes color="127,224,255" />
    </Frame>
  );
};

// 4 · How a capacitive sensor reads you (grid + ridge/valley diagram)
const Scene4: React.FC = () => {
  const { at } = useT();
  const diag = at(0.32, 20);
  return (
    <Frame chapter="سینسر آپ کو کیسے پڑھتا ہے">
      <Shot n={3} zoom={[1.05, 1.25]} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: diag }}>
        <rect x={90} y={560} width={900} height={420} rx={28} fill="rgba(5,9,13,.72)" stroke={AMBER} strokeWidth={3} />
        <path d={`M140 700 ${Array.from({ length: 8 }).map((_, i) => `Q ${175 + i * 100} 640 ${210 + i * 100} 700 Q ${245 + i * 100} 760 ${290 + i * 100} 700`).join(' ')}`} fill="none" stroke="#f0a070" strokeWidth={10} />
        {Array.from({ length: 16 }).map((_, i) => {
          const ridge = i % 2 === 0; const lit = at(0.45 + i * 0.012, 10);
          return <rect key={i} x={140 + i * 52} y={800} width={44} height={44} rx={6} fill={ridge ? `rgba(255,210,122,${0.25 + 0.7 * lit})` : `rgba(127,224,255,${0.15 + 0.25 * lit})`} />;
        })}
      </svg>
      <Tag x={330} y={900} text="لکیر" o={at(0.4)} color={AMBER} size={44} />
      <Tag x={760} y={900} text="ہوا کا خلا" o={at(0.5)} color="#7fe0ff" size={44} />
      <Tag x={540} y={1060} text="برقی نقشہ" o={at(0.78)} color={AMBER} size={52} />
    </Frame>
  );
};

// 5 · Living skin vs after death
const Scene5: React.FC = () => {
  const { at } = useT();
  return (
    <Frame chapter="زندہ جلد اور موت کے بعد">
      <Shot n={4} a={0} b={0.5} zoom={[1.05, 1.18]} />
      <Shot n={5} a={0.46} b={1} zoom={[1.02, 1.16]} dx={1} />
      <Tag x={540} y={520} text="گرم، نم، خون کی گردش" o={at(0.1) * (1 - at(0.46))} color="#ffb070" size={52} />
      <Tag x={540} y={520} text="ٹھنڈی، خشک، جھریاں" o={at(0.6)} color="#9fd3ff" size={52} />
      <Motes color="159,211,255" n={30} />
    </Frame>
  );
};

// 6 · The phone's own locks (48 hours)
const Scene6: React.FC = () => {
  const { f, d, at } = useT();
  const hours = Math.round(interpolate(f, [0.12 * d, 0.45 * d], [0, 48], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Frame chapter="فون کے اپنے تالے">
      <Shot n={9} zoom={[1.04, 1.18]} />
      <div style={{ position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', opacity: at(0.1) }}>
        <Label size={150} weight={800} color={AMBER} style={{ fontVariantNumeric: 'tabular-nums' }}>{hours}</Label>
        <UrduText size={52} color={CREAM}>گھنٹے</UrduText>
      </div>
      <Tag x={540} y={880} text="پاس کوڈ ضروری" o={at(0.55)} color="#ff6a5a" size={50} />
    </Frame>
  );
};

// 7 · The surprising twist (sometimes possible; 2016 3D-printed fingers)
const Scene7: React.FC = () => {
  const { f, at } = useT();
  const flick = Math.floor(f / 6) % 3 === 0 ? 1 : 0.4;
  return (
    <Frame chapter="حیران کن موڑ">
      <Shot n={2} a={0} b={0.5} zoom={[1.08, 1.22]} />
      <Shot n={10} a={0.46} b={1} zoom={[1.02, 1.16]} dy={-1.5} />
      <Tag x={540} y={520} text="کبھی کبھی ممکن!" o={at(0.1) * (1 - at(0.46)) * flick} color="#7dffb0" size={58} />
      <Tag x={540} y={520} text="دو ہزار سولہ" o={at(0.6)} color={AMBER} size={58} />
      <Motes />
    </Frame>
  );
};

// 8 · Payoff and question
const Scene8: React.FC = () => {
  const { at } = useT();
  return (
    <Frame chapter="آپ کا فون زندگی کو پہچانتا ہے">
      <Shot n={11} zoom={[1.02, 1.16]} dy={1} />
      <Tag x={540} y={540} text="آپ کے فون میں کون سا سینسر ہے؟" o={at(0.45)} color={AMBER} size={50} />
      <Motes />
    </Frame>
  );
};

export const SCENES: React.FC[] = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];