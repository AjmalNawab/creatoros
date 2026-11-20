---
name: scene-visuals
description: Playbook for CreatorOS "visuals" AI requests. Write the Remotion TSX module (one animated SVG scene per storyboard scene) that must compile and look good at 1920x1080. Use when answering visuals requests or fixing rejected visuals.
---

# Scene visuals (Remotion TSX)

**Output:** the full file `media/renderer/src/videos/<key>.tsx`, exporting `SCENES: React.FC[]` with exactly one component per storyboard scene, in order.

## Before writing
- Read `media/renderer/src/videos/p001.tsx` (the reference quality and patterns) and `media/renderer/src/common.tsx`.
- Helpers available from `../common`:
  - `C` (palette), `NightSky`, `Particles`
  - **`Blueprint`** (navy grid background) and **`BP`** palette (`line`, `cyan`, `warn`, `fail`, `ok`) for the engineering look
  - `Tag` (labelled pill, `lang="en"|"ur"`), **`Label`** (English text), `UrduText`
  - `prog(f, a, b)` (clamped 0→1), `ease`
- Follow the brand's **visual style** given in the prompt. Margin of Safety means blueprint: line drawings, cross-sections, force/load arrows (orange), failure in red, clean sans-serif labels, timelines and simple charts. Urdu Science means the colourful p001 style.
- From `remotion`: `AbsoluteFill`, `useCurrentFrame`, `useVideoConfig`, `interpolate`, `random`.

## Rules (the validator compiles with tsc; the render must not crash)
- Each scene: `const { durationInFrames: d } = useVideoConfig(); const f = useCurrentFrame();`. Time animations as fractions of `d`, so they follow the narration (labels appear as the words are spoken).
- Deterministic only: `random('seed')`, never `Math.random()` or `Date`.
- No external images, fonts or URLs. Draw with SVG shapes, gradients and `<UrduText>` / `<Tag>` labels.
- Keep the bottom ~170 px free of important content (subtitles go there).
- Each scene gets a clear focal diagram, motion within the first second, 1–3 labels in the video's language and a background that fits the topic (sky, sea, lab, space). Use the palette `C`, or add topic colours locally.
- Keep each component under ~80 lines. Reuse local helper components within the file.

## After answering
The agent renders preview stills into `content/<slug>/visuals/stills/`. Open 2–3 of them with Read to check layout and labels. If something overlaps or is empty, the owner can request changes. Better: fix it proactively before the video step, by re-answering when the agent re-asks.
