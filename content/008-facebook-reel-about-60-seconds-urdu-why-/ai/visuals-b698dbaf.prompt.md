You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p008.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene10];  (exactly 10, in order)
- Visual style for this brand: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No external images, fonts, or network.
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- VERTICAL canvas 1080x1920 (use <svg width={1080} height={1920}>). Safe zones: keep text and key shapes out of the top 220px, the bottom 480px and the right 140px (platform UI). The band y=1000-1400 is reserved for big word-by-word captions drawn on top: put the main diagram in y=260-980.
- Shorts pace: motion in the first 3 frames of every scene; each scene is one quick visual beat (2-6 s). Big, bold, simple shapes readable on a phone.
- Numbers can count up: import { CountUp } from '../Short' and use <CountUp to={1940} /> inside a positioned <div>. On-screen labels in Urdu via <UrduText>/<Tag lang="ur">.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Storyboard:
[
 {
  "scene": 1,
  "title": "Hook",
  "seconds": 4.4,
  "visual": "Minar-e-Pakistan painted at dusk, slowly vanishing behind a grey-yellow haze; headline band asks the question",
  "narration": "مینارِ پاکستان سامنے کھڑا ہے، مگر نظر کیوں نہیں آ رہا؟"
 },
 {
  "scene": 2,
  "title": "Not fog",
  "seconds": 5.2,
  "visual": "Close-up: water droplets (fog) vs dark soot particles (smog) side by side with Urdu labels",
  "narration": "ہر سردی لاہور پر یہ سرمئی چادر آتی ہے، مگر یہ صرف دھند نہیں، دھواں ہے۔"
 },
 {
  "scene": 3,
  "title": "Smoke all year",
  "seconds": 5.2,
  "visual": "City painting with cars, factories and brick kilns sending smoke upward on a clear summer day",
  "narration": "حیرت کی بات یہ ہے کہ گاڑیوں، کارخانوں اور بھٹوں کا دھواں سارا سال نکلتا ہے۔"
 },
 {
  "scene": 4,
  "title": "Summer escape",
  "seconds": 5.5,
  "visual": "Animated arrows carry smoke high into the sky and away; warm sun",
  "narration": "گرمیوں میں گرم ہوا اوپر اٹھتی ہے، اور یہ دھواں اپنے ساتھ آسمان میں لے جاتی ہے۔"
 },
 {
  "scene": 5,
  "title": "Winter nights",
  "seconds": 5.5,
  "visual": "Night scene: ground glowing blue-cold, a warm orange layer slides in above the city",
  "narration": "مگر سردی کی راتوں میں زمین جلد ٹھنڈی ہوتی ہے، اور اوپر گرم ہوا کی تہہ آتی ہے۔"
 },
 {
  "scene": 6,
  "title": "The lid",
  "seconds": 5.2,
  "visual": "Diagram: cold air box at bottom, warm layer drawn as a pot lid; smoke arrows bounce off it; label: ڈھکن",
  "narration": "یہ گرم تہہ ایک ڈھکن بن جاتی ہے، اور ٹھنڈی ہوا کو نیچے قید کر دیتی ہے۔"
 },
 {
  "scene": 7,
  "title": "Still air",
  "seconds": 4.5,
  "visual": "Wind-sock hanging limp; smoke piles up under the lid layer by layer",
  "narration": "ہوا بھی تقریباً رک جاتی ہے، تو دھواں نہ اوپر جا سکتا ہے، نہ دور۔"
 },
 {
  "scene": 8,
  "title": "Crop fires",
  "seconds": 6.1,
  "visual": "Map of Punjab with small fire dots appearing on both sides of the border in November; smoke drifts toward Lahore",
  "narration": "نومبر میں سرحد کے دونوں طرف فصلوں کی باقیات جلتی ہیں، دھواں اسی ڈھکن تلے جمع ہوتا ہے۔"
 },
 {
  "scene": 9,
  "title": "Record",
  "seconds": 6.3,
  "visual": "Big counter counts up to 1000 over the haze; school bag and closed gate icon",
  "narration": "دو ہزار چوبیس میں لاہور کا ایئر کوالٹی انڈیکس ایک ہزار سے اوپر گیا، اور اسکول بند ہوئے۔"
 },
 {
  "scene": 10,
  "title": "Payoff",
  "seconds": 5,
  "visual": "Lid stays; smoke sources dim one by one; Minar-e-Pakistan slowly reappears",
  "narration": "موسم کا ڈھکن ہم نہیں ہٹا سکتے، مگر اس کے نیچے کا دھواں کم کر سکتے ہیں۔"
 }
]

Answer with ONLY the complete TSX file content.