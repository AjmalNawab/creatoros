You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p013.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene8];  (exactly 8, in order)
- Visual style for this brand: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No network URLs or external fonts; images/video only from this project's licensed footage list below via staticFile().
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- VERTICAL canvas 1080x1920 (use <svg width={1080} height={1920}>). Safe zones: keep text and key shapes out of the top 220px, the bottom 480px and the right 140px (platform UI). The band y=1000-1400 is reserved for big word-by-word captions drawn on top: put the main diagram in y=260-980.
- Shorts pace: motion in the first 3 frames of every scene; each scene is one quick visual beat (2-6 s). Big, bold, simple shapes readable on a phone.
- Numbers can count up: import { CountUp } from '../Short' and use <CountUp to={1940} /> inside a positioned <div>. On-screen labels in Urdu via <UrduText>/<Tag lang="ur">.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Licensed REAL FOOTAGE for this video (use it as the main picture where it fits; draw diagrams/labels on top):
[
 {
  "file": "p013/footage/great-wall-drone.mp4",
  "kind": "video",
  "note": "Great Wall over mountains (stock)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p013/footage/great-wall.mp4",
  "kind": "video",
  "note": "Great Wall close (stock)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p013/footage/chiao-great-wall-2004.jpg",
  "kind": "image",
  "note": "Leroy Chiao's first verifiable photo of the Great Wall from the ISS, 24 Nov 2004",
  "licence": "Public domain (NASA)"
 },
 {
  "file": "p013/footage/iss-earth-view.mp4",
  "kind": "video",
  "note": "Earth from the ISS",
  "licence": "Public domain (NASA)"
 }
]
- Load with staticFile('<file>'): videos via <OffthreadVideo src={staticFile(..)} muted style={{width:'100%',height:'100%',objectFit:'cover'}} />, images via <Img>. Both from 'remotion'.
- Slow push-in (scale 1.04→1.12) for life; cut between clips inside a long scene; keep each clip muted (narration is the audio).
- Tag every real clip in a corner: "NASA ARCHIVE" / "ARCHIVE FOOTAGE" / "STOCK FOOTAGE" (small, honest), and never present a clip as something it is not (no fake "live" or wrong place/date).

Storyboard:
[
 {
  "scene": 1,
  "title": "Hook",
  "seconds": 4.9,
  "visual": "Big stamp: سچ یا جھوٹ؟ over Earth-from-ISS footage",
  "narration": "سچ یا جھوٹ؟ دیوارِ چین خلا سے آنکھوں سے نظر آتی ہے۔"
 },
 {
  "scene": 2,
  "title": "The belief",
  "seconds": 4,
  "visual": "Great Wall stock footage; book icon",
  "narration": "یہ بات ہم سب نے بچپن سے کتابوں اور باتوں میں سنی ہے۔"
 },
 {
  "scene": 3,
  "title": "Verdict",
  "seconds": 4.4,
  "visual": "Red stamp: جھوٹ",
  "narration": "تو جواب ہے جھوٹ! کم از کم عام آنکھ سے تو نہیں۔"
 },
 {
  "scene": 4,
  "title": "Yang Liwei",
  "seconds": 5.7,
  "visual": "Card: 2003 · China's first astronaut · 'I could not see it' (no photo)",
  "narration": "دو ہزار تین میں چین کے پہلے خلا باز نے خود کہا: مجھے دیوار نظر نہیں آئی۔"
 },
 {
  "scene": 5,
  "title": "Too narrow",
  "seconds": 4.6,
  "visual": "Diagram: wall a few metres wide vs 400 km height",
  "narration": "وجہ یہ ہے کہ دیوار بہت لمبی ہے، مگر صرف چند میٹر چوڑی۔"
 },
 {
  "scene": 6,
  "title": "Same colour",
  "seconds": 4.5,
  "visual": "Wall blending into hills, colour swatches",
  "narration": "اور اس کا رنگ آس پاس کی زمین جیسا ہے، اس لیے وہ چھپ جاتی ہے۔"
 },
 {
  "scene": 7,
  "title": "Only with lenses",
  "seconds": 5.9,
  "visual": "Camera lens zoom diagram 180mm/800mm over ISS footage",
  "narration": "خلائی اسٹیشن سے اس کی تصویر صرف طاقتور لینز سے لی گئی ہے، اور چاند سے تو ناممکن۔"
 },
 {
  "scene": 8,
  "title": "Question",
  "seconds": 4.9,
  "visual": "Split poll: سچ / جھوٹ",
  "narration": "آپ کو پہلے کیا لگتا تھا، سچ یا جھوٹ؟ کمنٹ میں بتائیں۔"
 }
]

Answer with ONLY the complete TSX file content.