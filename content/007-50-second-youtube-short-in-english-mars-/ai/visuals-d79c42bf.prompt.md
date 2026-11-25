You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p007.tsx
Study the reference implementation first: media/renderer/src/videos/p001.tsx (style, helpers, quality bar) and media/renderer/src/common.tsx (helpers).

Rules:
- export const SCENES: React.FC[] = [Scene1, ..., Scene10];  (exactly 10, in order)
- Visual style for this brand: Engineering blueprint look: deep navy background with faint grid, white/cyan line drawings, orange/red for stress, failure and warnings, clean sans-serif labels, cross-sections, force arrows, diagrams and timelines. No photos or real people.
- Import helpers only from '../common' (C, NightSky, Blueprint, Particles, Tag, Label, UrduText, ease, prog) and from 'remotion'. No external images, fonts, or network.
- Animate with useCurrentFrame()/useVideoConfig() (durationInFrames = scene length). Deterministic: use remotion's random(seed), never Math.random.
- VERTICAL canvas 1080x1920 (use <svg width={1080} height={1920}>). Safe zones: keep text and key shapes out of the top 220px, the bottom 480px and the right 140px (platform UI). The band y=1000-1400 is reserved for big word-by-word captions drawn on top: put the main diagram in y=260-980.
- Shorts pace: motion in the first 3 frames of every scene; each scene is one quick visual beat (2-6 s). Big, bold, simple shapes readable on a phone.
- Numbers can count up: import { CountUp } from '../Short' and use <CountUp to={1940} /> inside a positioned <div>. On-screen labels in English via <Label>/<Tag lang="en">.
- Each scene must visually explain its narration (diagram, labels appearing in sync).

Storyboard:
[
 {
  "scene": 1,
  "title": "Hook",
  "seconds": 4.5,
  "visual": "Painted lander descending over the Martian south pole; altimeter HUD frozen at 40 m; engines cut.",
  "narration": "Forty metres above Mars, its engines simply switched off."
 },
 {
  "scene": 2,
  "title": "The descent",
  "seconds": 6.9,
  "visual": "Real NASA launch photo, then the painted lander under its parachute; date tag 3 Dec 1999.",
  "narration": "On December third, 1999, NASA's Mars Polar Lander began its final descent."
 },
 {
  "scene": 3,
  "title": "No one listening",
  "seconds": 6.1,
  "visual": "Painted mission control at night, NO SIGNAL on the big screen.",
  "narration": "Nobody on Earth was listening. The landing was never designed to send live data."
 },
 {
  "scene": 4,
  "title": "Legs deploy",
  "seconds": 4.9,
  "visual": "Lander under parachute, three legs swing down; small cyan blueprint callout of a leg.",
  "narration": "Under its parachute, the lander's three legs snapped out into position."
 },
 {
  "scene": 5,
  "title": "False touchdown",
  "seconds": 4.7,
  "visual": "Blueprint callout: touchdown sensor flickers red for an instant; label SPURIOUS SIGNAL.",
  "narration": "That jolt made the touchdown sensors flicker, just for a moment."
 },
 {
  "scene": 6,
  "title": "The software remembered",
  "seconds": 4.1,
  "visual": "A memory register lights up and stays lit: TOUCHDOWN = TRUE.",
  "narration": "The software should have ignored it. Instead, it remembered."
 },
 {
  "scene": 7,
  "title": "Forty metres",
  "seconds": 5.4,
  "visual": "Altimeter counts down 1500 to 40 m; sensing ON; the stored flag triggers.",
  "narration": "At forty metres, sensing switched on, and the lander believed it had landed."
 },
 {
  "scene": 8,
  "title": "Engines off",
  "seconds": 5.2,
  "visual": "Thruster plumes fade; lander drops; speed readout ~50 mph / 22 m/s.",
  "narration": "Engines off. It likely hit the ground at about fifty miles per hour."
 },
 {
  "scene": 9,
  "title": "The real cause",
  "seconds": 5.5,
  "visual": "Report page icon: MOST PROBABLE CAUSE, software design and testing.",
  "narration": "Investigators concluded the deeper cause was software design and testing."
 },
 {
  "scene": 10,
  "title": "Payoff",
  "seconds": 4.9,
  "visual": "Painted Phoenix lander standing safely on icy northern plains, 2008.",
  "narration": "Its twin later flew as Phoenix, and this time it touched down safely."
 }
]

Answer with ONLY the complete TSX file content.