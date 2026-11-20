You are the Visual Generation Agent of CreatorOS. Write a Remotion (React + inline SVG) TSX module with one animated scene component per storyboard scene, for a VERTICAL 1080x1920 YouTube Short.

Write the file content for: media/renderer/src/videos/p003.tsx
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
  "visual": "Black space, tiny Voyager 1 line drawing far away; distance counter rolls up to 15,000,000,000 miles; a red 'ERROR' blink on the probe.",
  "narration": "Engineers repaired a computer fifteen billion miles from Earth."
 },
 {
  "scene": 2,
  "title": "Gibberish",
  "seconds": 5.6,
  "visual": "Blueprint data stream from the probe turns into scrambled random symbols; label 'Nov 2023'.",
  "narration": "In November 2023, Voyager 1 started sending back gibberish."
 },
 {
  "scene": 3,
  "title": "The dead chip",
  "seconds": 6.5,
  "visual": "Cross-section of the 1977 flight computer: a grid of memory chips, one chip flashes red and goes dark; label 'Flight Data Subsystem'.",
  "narration": "The culprit was one dead memory chip inside its 1977 flight computer."
 },
 {
  "scene": 4,
  "title": "What it held",
  "seconds": 4.9,
  "visual": "Zoom into the red chip: code blocks inside it labelled 'packs the data'.",
  "narration": "That chip held part of the software that packages Voyager's data."
 },
 {
  "scene": 5,
  "title": "No repairs possible",
  "seconds": 3.9,
  "visual": "A wrench icon flies toward the probe and stops at a huge distance line; label 'interstellar space'.",
  "narration": "And nobody can swap a chip in interstellar space."
 },
 {
  "scene": 6,
  "title": "Split the code",
  "seconds": 5.1,
  "visual": "Memory map grid: the code block splits into four pieces that slide into separate empty gaps; arrows re-link them.",
  "narration": "So engineers split the code into pieces and hid them in free memory."
 },
 {
  "scene": 7,
  "title": "22 hours per command",
  "seconds": 4.3,
  "visual": "A pulse travels from an Earth dish to Voyager along a long line; timer counts up to 22.5 hours.",
  "narration": "Every command took about twenty two and a half hours to arrive."
 },
 {
  "scene": 8,
  "title": "It worked",
  "seconds": 5.5,
  "visual": "Gibberish symbols turn back into clean bars of data; green check; label 'April 20, 2024'.",
  "narration": "On April 20, 2024, readable data finally came home."
 },
 {
  "scene": 9,
  "title": "Quiet again",
  "seconds": 6,
  "visual": "Data stream flatlines to a thin carrier line; label 'Nov 14, 2026: diagnosing'.",
  "narration": "This month, Voyager 1 went quiet again, and engineers are still diagnosing it."
 },
 {
  "scene": 10,
  "title": "Loop",
  "seconds": 4.3,
  "visual": "Distance counter from the hook returns, now showing 'one light-day'; question mark pulses.",
  "narration": "Can they fix a computer fifteen billion miles away twice?"
 }
]

Answer with ONLY the complete TSX file content.