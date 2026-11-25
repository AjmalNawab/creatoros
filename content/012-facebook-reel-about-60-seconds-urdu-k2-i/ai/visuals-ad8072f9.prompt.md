You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p012.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene10];  (exactly 10, in order)
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
  "file": "p012/footage/k2-peak.mp4",
  "kind": "video",
  "note": "K2 summit pyramid (tagged k2)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/k2-basecamp.mp4",
  "kind": "video",
  "note": "K2 base camp tents",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/k2-climber-crampons.mp4",
  "kind": "video",
  "note": "climber with crampons/ice gear (tagged k2)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/ice-climbing.mp4",
  "kind": "video",
  "note": "ice climbing high Himalaya (generic)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/everest.mp4",
  "kind": "video",
  "note": "Mount Everest landscape (for comparison)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/steep-wall.mp4",
  "kind": "video",
  "note": "steep high-altitude wall with avalanche (generic)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/blizzard-peak.mp4",
  "kind": "video",
  "note": "blizzard on a peak (generic weather)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p012/footage/pakistan-flag.mp4",
  "kind": "video",
  "note": "Pakistan flag",
  "licence": "Pixabay Content License (free to use, no attribution required)"
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
  "seconds": 4.6,
  "visual": "Real K2-region footage at night, slow push-in; headline band; big pill: 8611 m",
  "narration": "ایورسٹ سے چھوٹا، مگر کہیں زیادہ خطرناک پہاڑ، پاکستان میں ہے۔"
 },
 {
  "scene": 2,
  "title": "The Savage Mountain",
  "seconds": 4.2,
  "visual": "K2 base camp footage; label: وحشی پہاڑ; map pin Gilgit-Baltistan",
  "narration": "اس کا نام ہے کے ٹو، اور کوہ پیما اسے وحشی پہاڑ کہتے ہیں۔"
 },
 {
  "scene": 3,
  "title": "Shorter than Everest",
  "seconds": 5,
  "visual": "Height comparison diagram: Everest 8849 m vs K2 8611 m bars, gap labelled 240 m; Everest footage inset",
  "narration": "مزے کی بات یہ ہے کہ کے ٹو ایورسٹ سے تقریباً دو سو چالیس میٹر چھوٹا ہے۔"
 },
 {
  "scene": 4,
  "title": "The grim ratio",
  "seconds": 5.6,
  "visual": "Four climber icons, one fades; counter 1 : 4; labelled 'historically'",
  "narration": "پھر بھی کئی دہائیوں تک، ہر چار کامیاب چڑھائیوں پر تقریباً ایک کوہ پیما جان سے گیا۔"
 },
 {
  "scene": 5,
  "title": "Everest comparison",
  "seconds": 3.2,
  "visual": "Bar: K2 risk bar much taller than Everest risk bar",
  "narration": "ایورسٹ پر یہ شرح اس سے کہیں کم ہے۔"
 },
 {
  "scene": 6,
  "title": "Steeper and technical",
  "seconds": 6.4,
  "visual": "Steep-wall climbing footage with slope-angle diagram overlay",
  "narration": "وجہ؟ کے ٹو زیادہ ڈھلوان والا ہے، اور اس پر چڑھنا کہیں زیادہ تکنیکی کام ہے۔"
 },
 {
  "scene": 7,
  "title": "Weather and descent",
  "seconds": 5.6,
  "visual": "Blizzard footage; arrow down labelled واپسی",
  "narration": "یہاں کا موسم اچانک بدلتا ہے، اور زیادہ تر حادثے چوٹی سے واپسی پر ہوتے ہیں۔"
 },
 {
  "scene": 8,
  "title": "Last in winter",
  "seconds": 5.1,
  "visual": "Ice-climbing footage; badge: سردیوں میں آخری ۲۰۲۱",
  "narration": "اسی لیے سردیوں میں کے ٹو دنیا کی بڑی چوٹیوں میں سب سے آخر میں سر ہوا۔"
 },
 {
  "scene": 9,
  "title": "Ali Sadpara",
  "seconds": 4.6,
  "visual": "Quiet K2 night footage; simple tribute card with name, no photo",
  "narration": "اور اسی پہاڑ پر پاکستان کے ہیرو علی سدپارہ نے اپنی جان دی۔"
 },
 {
  "scene": 10,
  "title": "Payoff",
  "seconds": 5.8,
  "visual": "Pakistan flag footage then K2 peak; question pill",
  "narration": "تو اگلی بار کوئی ایورسٹ کا ذکر کرے، تو بتائیے گا: اصل امتحان پاکستان میں ہے۔"
 }
]

Answer with ONLY the complete TSX file content.