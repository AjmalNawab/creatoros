---
name: footage
description: Collect licensed REAL footage (NASA, Internet Archive, Pexels, Pixabay, Wikimedia) for a CreatorOS video before writing its visuals. Use when a visuals request arrives for a project, or the owner asks for "real footage" / "real look".
---

# Real footage (licensed only)

The owner wants a real look. Use real clips **only** from sources that allow reuse in monetised videos. Never take clips from YouTube, Facebook, TikTok, news sites or TV, even short parts. There is no "few seconds" rule: Content ID and Meta's unoriginal-content policy catch partial clips, and strikes can delete the channel.

## Allowed sources (tool: `media/renderer/scripts/footage.mjs`)
| source | licence | credit |
|---|---|---|
| `nasa` (images.nasa.gov) | Public domain | "NASA" (automatic) |
| `archive` (archive.org, filtered to PD, CC0, CC BY and CC BY-SA) | as listed | automatic when needed |
| `pixabay` (key `PIXABAY_API_KEY` in `.env`, **working since 2026-11-25**) | Pixabay Content License | none |
| `pexels` (Pexels paused new API keys in Nov 2026; download single clips by hand from pexels.com in the owner's Chrome and record them manually) | Pexels License | none |
| `wikimedia` (CC0, CC BY and CC BY-SA only) | as listed | automatic; **unreachable from the owner's network as of 2026-11-25** |
- **Not allowed:** China's state media (CMSA, Xinhua, CCTV), news agencies, other creators. For those topics, use diagrams or paintings instead.

## Steps (run from `media/renderer`)
1. **Plan:** read the storyboard scenes and list 1–2 shots per scene that real footage can show (place, object, event). Skip scenes that need diagrams.
2. **Search:** `node scripts/footage.mjs search nasa "<query>" video`. The same command works for `archive`, `pexels` and `pixabay`; use `image` instead of `video` for stills.
3. **Check:** each candidate must truly show what the narration says. Same place/object, no misleading date or location. Prefer clips under 60 MB.
4. **Add:**
   ```
   node scripts/footage.mjs add <slug> <key> <source> <id> --name s3-launch --note "scene 3: launch"
   ```
   This downloads the clip to `public/<key>/footage/` and records the source page, licence, credit and sha256 in `content/<slug>/footage/manifest.json` (proof of licence).
5. **Visuals:** answer the visuals request. The prompt now lists the clips. Use `<OffthreadVideo muted>` or `<Img>` via `staticFile()`, with a slow push-in, diagrams and labels on top, and a small honest corner tag ("NASA ARCHIVE", "STOCK FOOTAGE").
6. **Credits:** the YouTube and Facebook packages add a "🎞️ Footage: …" line automatically from the manifest.

## Rules
- People in stock clips: no poverty/pity framing, no implying a real person is part of our story; prefer scenes, places, hands, crowds.
- Our narration, captions, diagrams and labels must still carry the story. That is what keeps the video original.
- Never show a clip as something it isn't (for example, a NASA launch presented as a Chinese launch). Label generic or stand-in clips as such, or don't use them.
- AI labels stay as before (AI narration). Real footage doesn't need the AI label, but stays tagged as archive or stock.
