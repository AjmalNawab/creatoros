You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a 1920x1080 educational video.

Write the file content for: media/renderer/src/videos/p002.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene6];  (exactly 6, in order)
- Visual style for this brand: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No external images, fonts, or network.
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- Keep the bottom 170px clear of important content (subtitles are drawn there). On-screen labels in Urdu via <UrduText>/<Tag lang="ur">.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Storyboard:
[
 {
  "scene": 1,
  "title": "Hook",
  "seconds": 12,
  "visual": "Grey rain clouds part, the sun comes out, a colourful rainbow arc grows across the sky above green fields; title text appears.",
  "narration": "بارش کے بعد جب سورج نکلتا ہے، تو کبھی کبھی آسمان پر رنگوں کی ایک خوبصورت کمان نظر آتی ہے۔ اسے قوسِ قزح یا دھنک کہتے ہیں۔ لیکن یہ رنگ آتے کہاں سے ہیں؟"
 },
 {
  "scene": 2,
  "title": "White light holds all colours",
  "seconds": 9.6,
  "visual": "A white beam of sunlight enters from the left; as the narration lists colours, the beam splits into six coloured bands with Urdu colour labels appearing one by one.",
  "narration": "سورج کی روشنی ہمیں سفید لگتی ہے، لیکن اصل میں اس کے اندر سارے رنگ چھپے ہوتے ہیں۔ سرخ، نارنجی، پیلا، سبز، نیلا اور بنفشی۔"
 },
 {
  "scene": 3,
  "title": "Inside a raindrop",
  "seconds": 11.6,
  "visual": "A big close-up raindrop (circle). A white ray enters, bends (label: مڑنا), hits the back wall and reflects (label: ٹکرانا), then exits bending again. Animated arrow path.",
  "narration": "جب یہ روشنی بارش کے ایک قطرے میں داخل ہوتی ہے، تو تھوڑا سا مڑ جاتی ہے۔ پھر قطرے کی پچھلی دیوار سے ٹکرا کر واپس آتی ہے، اور باہر نکلتے ہوئے ایک بار پھر مڑتی ہے۔"
 },
 {
  "scene": 4,
  "title": "Colours spread out",
  "seconds": 14.2,
  "visual": "Same raindrop; the exiting ray fans out into coloured rays, violet bending most and red least (labels). Then zoom out: many small drops, each sending colours, forming an arc.",
  "narration": "ہر رنگ تھوڑا مختلف مڑتا ہے۔ بنفشی سب سے زیادہ، اور سرخ سب سے کم۔ اسی لیے سفید روشنی بکھر کر رنگوں کی پٹی بن جاتی ہے۔ لاکھوں قطرے مل کر آسمان پر یہ کمان بنا دیتے ہیں۔"
 },
 {
  "scene": 5,
  "title": "How to see one",
  "seconds": 11.9,
  "visual": "Side view: sun low on the left behind a small person, rain curtain on the right, rainbow arc in front of the person; labels 'سورج پیچھے' and 'بارش سامنے'. A clock icon shows morning/evening.",
  "narration": "دھنک دیکھنے کے لیے سورج آپ کے پیچھے، اور بارش آپ کے سامنے ہونی چاہیے۔ اسی لیے یہ اکثر صبح یا شام کو نظر آتی ہے۔ اور ہاں، ہر شخص اپنی الگ دھنک دیکھتا ہے!"
 },
 {
  "scene": 6,
  "title": "History and outro",
  "seconds": 13.2,
  "visual": "A glass sphere filled with water on a wooden desk with a candle-lit study and a scroll; label 'کمال الدین فارسی — تقریباً 1300ء'. Then end card with subscribe button.",
  "narration": "تقریباً سات سو سال پہلے، فارسی سائنس دان کمال الدین فارسی نے پانی سے بھرے شیشے کے گولے سے یہ راز سمجھایا تھا۔ ویڈیو پسند آئی ہو تو سبسکرائب کریں، اور بتائیں اگلی ویڈیو کس موضوع پر ہو۔"
 }
]

Answer with ONLY the complete TSX file content.