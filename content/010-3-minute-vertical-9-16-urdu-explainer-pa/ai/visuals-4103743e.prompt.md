You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a 1920x1080 educational video.

Write the file content for: media/renderer/src/videos/p010.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene7];  (exactly 7, in order)
- Visual style for this brand: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No external images, fonts, or network.
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- Keep the bottom 170px clear of important content (subtitles are drawn there). On-screen labels in Urdu via <UrduText>/<Tag lang="ur">.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Storyboard:
[
 {
  "scene": 1,
  "title": "Hook: a Pakistani on the rocket",
  "seconds": 33.5,
  "visual": "Night launch pad in the desert, a white rocket with flame and steam; a small Pakistani flag badge glows on a crew silhouette; headline band",
  "narration": "پچیس نومبر کی صبح، چین کے صحرا سے ایک راکٹ آسمان کی طرف اٹھا۔ اس راکٹ میں تین خلا باز تھے، اور ان میں سے ایک پاکستانی تھا: محمد ذیشان علی۔ وہ مدار میں جانے والا پہلا پاکستانی ہے، اور چین کے خلائی اسٹیشن پر جانے والا پہلا غیر ملکی۔ اس سے پہلے، دو ہزار تئیس میں، نمیرہ سلیم ایک مختصر پرواز میں خلا کی سرحد تک گئی تھیں۔ مگر زمین کے گرد چکر لگانے والے اسٹیشن تک پہنچنا ایک بالکل الگ سفر ہے۔ تو آخر یہ سفر ہوتا کیسے ہے؟ آئیے قدم بہ قدم دیکھتے ہیں۔"
 },
 {
  "scene": 2,
  "title": "How he was chosen",
  "seconds": 29.9,
  "visual": "Map line Pakistan to China; two candidate silhouettes; training centre building in Beijing; label: payload specialist",
  "narration": "یہ کہانی دو ہزار پچیس میں شروع ہوئی، جب پاکستان اور چین نے خلا بازوں کے تعاون کا معاہدہ کیا۔ اس کے تحت دو پاکستانی امیدوار چنے گئے، ذیشان علی اور خرم داؤد۔ دونوں نے بیجنگ میں چین کے خلا باز تربیتی مرکز میں کئی مہینے سخت تربیت کی۔ مگر پرواز ایک ہی کو ملنی تھی، اور یہ موقع ذیشان علی کو ملا۔ ان کا کردار پے لوڈ اسپیشلسٹ کا ہے۔ یعنی وہ خلائی جہاز نہیں اڑائیں گے، بلکہ ان کا اصل کام سائنسی تجربے کرنا ہے۔"
 },
 {
  "scene": 3,
  "title": "The launch",
  "seconds": 30.4,
  "visual": "Long March 2F rocket climbing on a curved arc from Jiuquan; stage labels; crew of three icons with names",
  "narration": "سفر شروع ہوا چین کے جیوچوان لانچ سینٹر سے، لانگ مارچ ٹو ایف راکٹ پر۔ پاکستانی وقت کے مطابق صبح پانچ بج کر اٹھارہ منٹ۔ جہاز کا نام ہے شین ژو چوبیس۔ کمانڈر ہیں تانگ ہونگ بو، فلائٹ انجینئر وو یی، اور تیسری نشست پر ذیشان علی۔ راکٹ کا کام صرف اوپر جانا نہیں۔ اسے جہاز کو اتنی تیزی سے آگے دھکیلنا ہوتا ہے کہ وہ زمین پر واپس گرنے کے بجائے اس کے گرد چکر لگانے لگے۔ اسی کو مدار کہتے ہیں۔"
 },
 {
  "scene": 4,
  "title": "The chase and docking",
  "seconds": 29,
  "visual": "Earth curve with two dots on orbits: the station ahead, Shenzhou behind catching up; timer counts to three and a half hours; docking port lights up",
  "narration": "مدار میں پہنچ کر ایک دلچسپ دوڑ شروع ہوتی ہے۔ خلائی اسٹیشن پہلے سے بہت تیزی سے زمین کے گرد گھوم رہا ہے، اور شین ژو کو اس کا پیچھا کر کے اس تک پہنچنا ہے۔ اسی لیے راکٹ بالکل اس لمحے چھوڑا جاتا ہے جب اسٹیشن صحیح جگہ پر ہو۔ منصوبے کے مطابق تقریباً ساڑھے تین گھنٹے میں جہاز اسٹیشن کے مرکزی حصے تیانہے سے جڑ جاتا ہے۔ اسے ڈاکنگ کہتے ہیں۔ پھر دروازے کھلتے ہیں، اور نیا عملہ اسٹیشن میں داخل ہوتا ہے۔"
 },
 {
  "scene": 5,
  "title": "What Tiangong is",
  "seconds": 26.8,
  "visual": "Painted Tiangong station over the blue Earth: T-shaped modules labelled تیانہے، وین تیان، منگ تیان; stars",
  "narration": "یہ اسٹیشن ہے تیان گونگ، یعنی آسمانی محل۔ یہ چین کا اپنا مستقل خلائی اسٹیشن ہے، جس پر ہر وقت خلا باز رہتے ہیں۔ اس کا مرکزی حصہ تیانہے دو ہزار اکیس میں خلا میں بھیجا گیا۔ پھر دو ہزار بائیس میں دو تجربہ گاہیں، وین تیان اور منگ تیان، اس سے جوڑ دی گئیں، اور اسٹیشن مکمل ہو گیا۔ اب تک یہاں صرف چینی خلا باز گئے تھے۔ ذیشان علی اس کے پہلے غیر ملکی مہمان ہیں۔"
 },
 {
  "scene": 6,
  "title": "A week of science",
  "seconds": 29,
  "visual": "Inside the station: floating lab racks, small sample tubes glowing; label: پاکستانی یونیورسٹیوں کے تجربے; a calendar with seven days",
  "narration": "اسٹیشن پر ذیشان علی تقریباً ایک ہفتہ گزاریں گے۔ اس دوران ان کا کام تجربے کرنا ہے۔ پاکستان کے خلائی ادارے سپارکو کے مطابق اس مشن میں پاکستانی یونیورسٹیوں کے بنائے ہوئے حیاتیاتی تجربے بھی شامل ہیں۔ خلا میں وزن محسوس نہیں ہوتا، اس لیے وہاں جاندار خلیے اور مادے زمین سے مختلف طریقے سے برتاؤ کر سکتے ہیں۔ یہی فرق سائنس دانوں کو نئی باتیں سکھاتا ہے۔ ان تجربوں کے نتائج بعد میں سامنے آئیں گے۔"
 },
 {
  "scene": 7,
  "title": "The way home",
  "seconds": 29.8,
  "visual": "Seat swap diagram: Shenzhou-24 stays docked, Shenzhou-23 capsule undocks with three seats; one astronaut icon stays aboard with a one-year badge; capsule under parachute",
  "narration": "اور واپسی؟ ذیشان علی اسی جہاز سے واپس نہیں آئیں گے جس سے گئے تھے۔ اسٹیشن پر پہلے سے موجود شین ژو تئیس کے عملے میں سے ایک خلا باز ایک پورا سال خلا میں رہے گا، جو چین کا پہلا ایک سالہ مشن ہے۔ اس کی خالی نشست پر ذیشان علی، شین ژو تئیس کے دو خلا بازوں کے ساتھ، زمین پر لوٹیں گے۔ آج ایک پاکستانی مدار میں ہے۔ کل شاید آپ میں سے کوئی ہو۔ اگر آپ کو خلا میں ایک دن ملے، تو سب سے پہلے کیا دیکھنا چاہیں گے؟"
 }
]

Answer with ONLY the complete TSX file content.