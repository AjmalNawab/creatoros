You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a 1920x1080 educational video.

Write the file content for: media/renderer/src/videos/p006.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene8];  (exactly 8, in order)
- Visual style for this brand: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No external images, fonts, or network.
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- Keep the bottom 170px clear of important content (subtitles are drawn there). On-screen labels in Urdu via <UrduText>/<Tag lang="ur">.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Storyboard:
[
 {
  "scene": 1,
  "title": "Hook: the phone that refuses",
  "seconds": 26.1,
  "visual": "Night, a phone on a wooden table, a still pale hand touches the glowing red locked fingerprint sensor; the phone refuses.",
  "narration": "رات کا وقت ہے۔ میز پر ایک فون پڑا ہے، اور اس کے سینسر پر ایک انگلی رکھی جاتی ہے۔ لیکن فون نہیں کھلتا۔ وہ انگلی کسی ایسے شخص کی ہے جو اب اس دنیا میں نہیں رہا۔ نشان وہی ہیں، لکیریں وہی ہیں، پھر بھی فون انکار کر دیتا ہے۔ آخر کیوں؟ آج ہم چائے کے ایک کپ کے ساتھ یہی راز سمجھیں گے، اور آخر میں ایک ایسی بات بھی بتائیں گے جو شاید آپ کو حیران کر دے۔"
 },
 {
  "scene": 2,
  "title": "Where fingerprints come from",
  "seconds": 32.8,
  "visual": "Soft painted womb glow; tiny developing fingertips forming ridges; two twin fingerprints side by side, similar but different. Label: تیرہ سے انیس ہفتے",
  "narration": "پہلے یہ جانتے ہیں کہ انگلی کے یہ نشان آتے کہاں سے ہیں۔ جب بچہ ابھی ماں کے پیٹ میں ہوتا ہے، تو تقریباً تیرہویں سے انیسویں ہفتے کے درمیان اس کی انگلیوں پر یہ باریک لکیریں بنتی ہیں۔ اور پھر یہ ساری زندگی ویسی ہی رہتی ہیں۔ دلچسپ بات یہ ہے کہ جڑواں بچے، جن کے جینز بالکل ایک جیسے ہوتے ہیں، ان کے نشان بھی مختلف ہوتے ہیں۔ کیونکہ ماں کے پیٹ میں ہر بچے کی جگہ، انگلیوں کے بڑھنے کی رفتار اور اردگرد کا ماحول ذرا سا مختلف ہوتا ہے۔ یہی چھوٹے چھوٹے فرق ہر انگلی کو ایک الگ پہچان دے دیتے ہیں۔"
 },
 {
  "scene": 3,
  "title": "Three kinds of sensors",
  "seconds": 37,
  "visual": "Three panels: light beam photographing a finger (optical), sound waves echoing from ridges (ultrasonic), a grid of tiny charged cells (capacitive). Urdu labels.",
  "narration": "اب سوال یہ ہے کہ فون ان لکیروں کو پڑھتا کیسے ہے؟ اس کے لیے فونز میں عام طور پر تین طرح کے سینسر ہوتے ہیں۔ پہلا آپٹیکل سینسر۔ یہ روشنی ڈال کر انگلی کی ایک تصویر لیتا ہے۔ یہ سستا ہوتا ہے اور اکثر اسکرین کے نیچے چھپا ہوتا ہے۔ دوسرا الٹراسونک سینسر۔ یہ انگلی میں آواز کی ایسی لہریں بھیجتا ہے جو ہم سن نہیں سکتے، اور واپس آنے والی گونج سے لکیروں کا تین رخی نقشہ بناتا ہے۔ یہ زیادہ تر مہنگے فونز میں ملتا ہے۔ اور تیسرا، جو بہت عام ہے، کیپیسیٹو سینسر۔ آج کی کہانی کا اصل ہیرو یہی ہے۔"
 },
 {
  "scene": 4,
  "title": "How a capacitive sensor reads you",
  "seconds": 32.8,
  "visual": "Zoom into the glowing sensor grid; side cross-section of ridges touching cells and air gaps under valleys; cells light up to build a fingerprint map.",
  "narration": "کیپیسیٹو سینسر بہت سے ننھے ننھے خانوں کا ایک جال ہوتا ہے۔ ہر خانہ ایک چھوٹا سا برقی ذخیرہ ہے، جس میں ذرا سی بجلی جمع رہتی ہے۔ جب آپ انگلی رکھتے ہیں، تو لکیریں سینسر کو چھو لیتی ہیں، جبکہ لکیروں کے بیچ ہوا کا ایک باریک سا خلا رہ جاتا ہے۔ جلد اور ہوا، بجلی پر الگ الگ اثر ڈالتے ہیں۔ اس لیے جہاں لکیر ہے وہاں کی ریڈنگ مختلف آتی ہے، اور جہاں خلا ہے وہاں مختلف۔ ان سب ریڈنگز کو جوڑ کر سینسر آپ کی انگلی کا ایک برقی نقشہ بنا لیتا ہے، اور اسے فون میں محفوظ نقشے سے ملاتا ہے۔"
 },
 {
  "scene": 5,
  "title": "Living skin vs after death",
  "seconds": 36.5,
  "visual": "Split: warm living fingertip with blood flow and sparks; then the same fingertip cooling to blue-grey, drying, fine wrinkles, the glowing map breaking apart. No gore.",
  "narration": "یہیں سے ہماری کہانی کا راز کھلتا ہے۔ یہ سینسر صرف لکیروں کی شکل نہیں دیکھتا، بلکہ جلد کی برقی خاصیت پر بھی انحصار کرتا ہے۔ زندہ جلد میں خون دوڑتا ہے، وہ گرم اور نم ہوتی ہے، اور بجلی کے ساتھ ایک خاص طرح سے ردعمل دیتی ہے۔ موت کے بعد خون کی گردش رک جاتی ہے۔ جسم آہستہ آہستہ ٹھنڈا ہونے لگتا ہے، جلد سوکھنے لگتی ہے، اور فنگر پرنٹ کے ماہر پروفیسر انیل جین کے مطابق انگلیوں پر جھریاں سی پڑنے لگتی ہیں۔ یعنی نقشہ وہ نہیں رہتا جو سینسر کو یاد تھا۔ اور جتنا وقت گزرتا ہے، فون کھلنا اتنا ہی مشکل ہوتا جاتا ہے۔"
 },
 {
  "scene": 6,
  "title": "The phone's own locks",
  "seconds": 26.4,
  "visual": "A phone lock screen with a clock rolling up to 48 hours, a restart icon, five red X marks, then a passcode keypad appears; a shield icon for liveness check.",
  "narration": "اوپر سے، فون بنانے والی کمپنیاں بھی کچھ حفاظتی تالے لگاتی ہیں۔ مثال کے طور پر آئی فون میں اگر فون اڑتالیس گھنٹے تک نہ کھولا جائے، یا اسے دوبارہ آن کیا جائے، یا پانچ بار غلط انگلی لگائی جائے، تو وہ انگلی کو چھوڑ کر پاس کوڈ مانگنے لگتا ہے۔ اور بہت سے سینسر یہ بھی جانچنے کی کوشش کرتے ہیں کہ سامنے والی انگلی واقعی اصلی اور زندہ ہے یا نہیں۔ یوں ایک ٹھنڈی، بے جان انگلی کے لیے کئی دروازے ایک ساتھ بند ہو جاتے ہیں۔"
 },
 {
  "scene": 7,
  "title": "The surprising twist",
  "seconds": 32.4,
  "visual": "The sensor flickers from red to green for a moment; a question mark; then a lab bench with a 3D printer printing a grey fingertip replica (no body shown).",
  "narration": "لیکن اب آتی ہے وہ حیران کن بات۔ ماہرین کہتے ہیں کہ یہ بالکل ناممکن نہیں ہے۔ اگر کسی کی موت کو بہت تھوڑا وقت گزرا ہو، تو کبھی کبھی اس کی انگلی سے فون کھل بھی سکتا ہے۔ سائنس دان ابھی تک یقین سے نہیں جانتے کہ موت کے کتنی دیر بعد جلد کی یہ برقی خاصیت ختم ہو جاتی ہے۔ دو ہزار سولہ میں امریکہ کی پولیس نے پروفیسر انیل جین کی لیب سے ایک انوکھی درخواست کی۔ انہوں نے ایک مقتول کے فنگر پرنٹس سے تھری ڈی پرنٹ کی ہوئی انگلیاں بنوائیں، تاکہ اس کا فون کھولنے کی کوشش کی جا سکے۔"
 },
 {
  "scene": 8,
  "title": "Payoff and question",
  "seconds": 21.9,
  "visual": "Back to the table at night: a warm living hand touches the sensor and it glows green; a cup of chai steams beside it.",
  "narration": "تو اگلی بار جب آپ اپنے فون پر انگلی رکھیں، تو یاد رکھیں کہ وہ صرف لکیروں کی تصویر نہیں دیکھ رہا۔ وہ آپ کی زندہ، گرم جلد کی ہلکی سی بجلی کو بھی محسوس کر رہا ہے۔ آپ کے فون میں کون سا سینسر ہے، اسکرین کے نیچے والا یا پیچھے والا؟ کمنٹ میں ضرور بتائیں، اور ایسی مزید دلچسپ کہانیوں کے لیے چائے اینڈ کیوریاسٹی کو فالو کریں۔"
 }
]

Answer with ONLY the complete TSX file content.