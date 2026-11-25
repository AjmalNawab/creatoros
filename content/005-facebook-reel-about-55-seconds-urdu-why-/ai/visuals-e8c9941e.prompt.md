You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p005.tsx
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
  "seconds": 3.5,
  "visual": "Close-up of a glowing phone fingerprint sensor in a dark room; a pale, still hand hovers above it; the sensor stays red: LOCKED.",
  "narration": "مرنے کے بعد انگلی اکثر فون کیوں نہیں کھولتی؟"
 },
 {
  "scene": 2,
  "title": "Not the pattern",
  "seconds": 4.8,
  "visual": "A fingertip with its ridge pattern glowing, tiny blue sparks running along the skin; label: زندہ جلد",
  "narration": "اصل وجہ انگلی کے نشان نہیں، بلکہ زندہ جلد کی ہلکی سی بجلی ہے۔"
 },
 {
  "scene": 3,
  "title": "The sensor grid",
  "seconds": 4.8,
  "visual": "Zoom into the phone sensor: a grid of tiny glowing cells like a city seen from above.",
  "narration": "زیادہ تر فونز کا سینسر بہت سے ننھے ننھے خانوں کا ایک جال ہوتا ہے۔"
 },
 {
  "scene": 4,
  "title": "Ridges and valleys",
  "seconds": 5.5,
  "visual": "Side cross-section: finger ridges touch the cells, small air gaps under the valleys; labels: لکیر / خلا",
  "narration": "آپ کی انگلی کی لکیریں سینسر کو چھوتی ہیں، اور بیچ میں ہوا کا باریک خلا رہتا ہے۔"
 },
 {
  "scene": 5,
  "title": "The map",
  "seconds": 5,
  "visual": "Cells light up brighter under ridges, dimmer under valleys, assembling a glowing fingerprint map.",
  "narration": "یہ فرق برقی طور پر ناپ کر سینسر آپ کی انگلی کا پورا نقشہ بنا لیتا ہے۔"
 },
 {
  "scene": 6,
  "title": "Living skin",
  "seconds": 5.2,
  "visual": "Inside a living fingertip: warm red blood flowing, the skin glowing warm, current flowing easily.",
  "narration": "زندہ جلد میں خون دوڑتا ہے، اس لیے وہ بجلی کو اچھی طرح گزرنے دیتی ہے۔"
 },
 {
  "scene": 7,
  "title": "After death",
  "seconds": 5.8,
  "visual": "The same fingertip turns cool blue-grey, blood flow stops, skin dries and wrinkles slightly; the fingerprint map flickers and breaks apart. No gore.",
  "narration": "موت کے بعد خون رک جاتا ہے، جلد سوکھنے اور سکڑنے لگتی ہے، اور نقشہ بدل جاتا ہے۔"
 },
 {
  "scene": 8,
  "title": "48 hours",
  "seconds": 4.9,
  "visual": "A phone lock screen with a clock counter rolling up to 48 hours, then a passcode keypad appears; big number 48.",
  "narration": "اور اگر فون اڑتالیس گھنٹے نہ کھلے، تو آئی فون پاس کوڈ مانگنے لگتا ہے۔"
 },
 {
  "scene": 9,
  "title": "The twist",
  "seconds": 5.6,
  "visual": "The sensor flickers from red to green for a moment; a question mark glows; label: کبھی کبھی",
  "narration": "لیکن ماہرین کہتے ہیں، کسی کی موت کے فوراً بعد کبھی کبھی یہ کام کر بھی جاتا ہے۔"
 },
 {
  "scene": 10,
  "title": "Payoff",
  "seconds": 4.6,
  "visual": "Back to the glowing sensor from the hook; a living warm hand touches it and it turns green with a soft pulse.",
  "narration": "یعنی آپ کے فون کا تالا صرف نشان نہیں، زندہ جلد بھی پڑھتا ہے۔"
 }
]

Answer with ONLY the complete TSX file content.