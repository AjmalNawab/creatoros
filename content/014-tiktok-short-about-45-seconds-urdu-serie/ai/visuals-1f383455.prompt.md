You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p014.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene8];  (exactly 8, in order)
- Visual style for this brand: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No network URLs or external fonts; images/video only from this project's licensed footage list (none collected: draw everything) via staticFile().
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
  "seconds": 4.3,
  "visual": "Desert heat-shimmer footage; counter to 70°",
  "narration": "دنیا کی گرم ترین جگہ پر زمین ستر ڈگری تک تپتی ہے۔"
 },
 {
  "scene": 2,
  "title": "Where",
  "seconds": 4.6,
  "visual": "Map pin Lut Desert, Iran; NASA satellite icon",
  "narration": "یہ جگہ ہے ایران کا دشتِ لوت، اور اسے ناسا کے سیٹلائٹ نے ناپا۔"
 },
 {
  "scene": 3,
  "title": "The number",
  "seconds": 5,
  "visual": "Big 70.7°C, 2005, thermometer fills",
  "narration": "دو ہزار پانچ میں یہاں زمین کا درجۂ حرارت ستر اعشاریہ سات ڈگری تھا۔"
 },
 {
  "scene": 4,
  "title": "Ground vs air",
  "seconds": 4.3,
  "visual": "Diagram: ground layer hot red, air above cooler",
  "narration": "مگر ٹھہریں، یہ ہوا کا نہیں، زمین کی سطح کا درجۂ حرارت ہے۔"
 },
 {
  "scene": 5,
  "title": "Why",
  "seconds": 5.8,
  "visual": "Dark rocks absorbing sun arrows",
  "narration": "سیاہ پتھر اور ریت دھوپ جذب کرتے ہیں، اسی لیے زمین ہوا سے کہیں زیادہ گرم ہوتی ہے۔"
 },
 {
  "scene": 6,
  "title": "Air record",
  "seconds": 5.2,
  "visual": "Death Valley footage; 56.7°C 1913",
  "narration": "ہوا کا ریکارڈ امریکہ کی ڈیتھ ویلی کے پاس ہے: چھپن اعشاریہ سات ڈگری۔"
 },
 {
  "scene": 7,
  "title": "Pakistan",
  "seconds": 4.6,
  "visual": "Pakistan map pin Jacobabad; sun",
  "narration": "اور ہمارا جیکب آباد بھی دنیا کے گرم ترین شہروں میں گنا جاتا ہے۔"
 },
 {
  "scene": 8,
  "title": "Question",
  "seconds": 5.3,
  "visual": "Thermometer with question mark",
  "narration": "آپ کے شہر میں سب سے زیادہ گرمی کتنی پڑی ہے؟ کمنٹ میں لکھیں۔"
 }
]

Answer with ONLY the complete TSX file content.