You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p015.tsx
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
  "file": "p015/footage/hwy-aerial.mp4",
  "kind": "video",
  "note": "1954 film: aerial view of a new highway interchange (scene 5: the new highway)",
  "licence": "http://creativecommons.org/licenses/publicdomain/"
 },
 {
  "file": "p015/footage/road-car.mp4",
  "kind": "video",
  "note": "1954 film: 1950s car driving on a road (scene 6/8: on the road)",
  "licence": "http://creativecommons.org/licenses/publicdomain/"
 },
 {
  "file": "p015/footage/town-street.mp4",
  "kind": "video",
  "note": "1954 film: 1950s small-town main street with shops and cars (scene 4)",
  "licence": "http://creativecommons.org/licenses/publicdomain/"
 },
 {
  "file": "p015/footage/hwy-cars.mp4",
  "kind": "video",
  "note": "1954 film: cars on a new divided highway (scene 5)",
  "licence": "http://creativecommons.org/licenses/publicdomain/"
 },
 {
  "file": "p015/footage/freeway-sign.mp4",
  "kind": "video",
  "note": "1954 film: 'Another FREEWAY for your safety' sign (scene 5)",
  "licence": "http://creativecommons.org/licenses/publicdomain/"
 },
 {
  "file": "p015/footage/country-road.mp4",
  "kind": "video",
  "note": "1954 film: truck on a country road (scene 8: travelling)",
  "licence": "http://creativecommons.org/licenses/publicdomain/"
 },
 {
  "file": "p015/footage/steam.mp4",
  "kind": "video",
  "note": "stock: steam from a pressure cooker (scene 8)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p015/footage/lamp.mp4",
  "kind": "video",
  "note": "stock: old kerosene lamp (scene 2: a hard childhood, ~1890s feel)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p015/footage/steam-train.mp4",
  "kind": "video",
  "note": "stock: historical steam locomotive (scene 3: railway job)",
  "licence": "Pixabay Content License (free to use, no attribution required)"
 },
 {
  "file": "p015/footage/chicken-fries.mp4",
  "kind": "video",
  "note": "stock: fried chicken with fries (scenes 1, 4, 10)",
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
  "title": "Hook: the famous number",
  "seconds": 3.3,
  "visual": "Big '1009' slams in over real footage of fried chicken, then a question mark and a 'MYTH?' stamp",
  "narration": "ایک ہزار نو انکار، کیا یہ کہانی سچ ہے؟"
 },
 {
  "scene": 2,
  "title": "Hard childhood",
  "seconds": 5.2,
  "visual": "Old-photo style frame: 1890s Indiana farmhouse, a boy at a wood stove (silhouette, not a realistic face)",
  "narration": "ہارلینڈ سینڈرز کے والد بچپن میں چل بسے، تو وہ گھر کا کھانا پکانے لگے۔"
 },
 {
  "scene": 3,
  "title": "Many jobs",
  "seconds": 5.4,
  "visual": "Quick cuts of job icons sliding in: farm, railway, insurance papers; some get crossed out",
  "narration": "پھر کئی نوکریاں کیں: کھیتوں میں، ریلوے میں، انشورنس میں، اور کئی چھوٹ بھی گئیں۔"
 },
 {
  "scene": 4,
  "title": "Corbin service station",
  "seconds": 5.7,
  "visual": "Archive footage of a 1950s American roadside gas station and diner; label: Corbin, Kentucky 1930",
  "narration": "کینٹکی میں ایک پیٹرول پمپ پر مسافروں کو کھانا کھلایا، اور ان کی مرغی مشہور ہو گئی۔"
 },
 {
  "scene": 5,
  "title": "The highway bypass",
  "seconds": 4.9,
  "visual": "Map animation: a new highway line curves away from the small town dot; cars stream past it",
  "narration": "پھر نئی شاہراہ بنی، گاڑیاں دور ہو گئیں، اور ریستوران گھاٹے میں بیچنا پڑا۔"
 },
 {
  "scene": 6,
  "title": "Age 65, $105",
  "seconds": 4.6,
  "visual": "Counter counts up to '$105 / month' with 'age ~65' label over archive footage of an old car on a 1950s road",
  "narration": "عمر پینسٹھ کے قریب، آمدنی بس ایک سو پانچ ڈالر ماہانہ پنشن۔"
 },
 {
  "scene": 7,
  "title": "The turning point",
  "seconds": 5.2,
  "visual": "A small map pin in Salt Lake City lights up: 'first franchise, 1952, a friend's restaurant'",
  "narration": "ایک دوست کے ہوٹل میں نسخہ پہلے ہی بک رہا تھا، تو انہوں نے یہی راستہ چنا۔"
 },
 {
  "scene": 8,
  "title": "On the road",
  "seconds": 4.7,
  "visual": "Real footage of a 1950s road trip; icons of a pressure cooker and '+ few cents per chicken'",
  "narration": "پریشر ککر گاڑی میں رکھا، ہوٹل ہوٹل گئے، ہر مرغی پر چند سینٹ۔"
 },
 {
  "scene": 9,
  "title": "The 1009 myth",
  "seconds": 5.5,
  "visual": "The '1009' from the hook returns with a red 'NO PROOF' stamp; small source tags: Snopes, AAP FactCheck",
  "narration": "انکار بہت ہوئے، مگر ایک ہزار نو کا عدد؟ اس کا کوئی ثبوت نہیں۔"
 },
 {
  "scene": 10,
  "title": "Payoff and lesson",
  "seconds": 6.3,
  "visual": "Counter to '$2,000,000 · 1964' over real fried chicken footage, then the lesson text",
  "narration": "انیس سو چونسٹھ میں کمپنی بیس لاکھ ڈالر میں بکی۔ ہزار انکار نہیں، برسوں کی محنت۔"
 }
]

Answer with ONLY the complete TSX file content.