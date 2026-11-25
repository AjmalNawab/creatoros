---
name: tiktok-metadata
description: Playbook for CreatorOS "tiktok_metadata" AI requests. Write the TikTok caption, hashtags and cover text for the anonymous "Chai & Curiosity" TikTok account (Urdu science myths, world records, Pakistan facts). Use when answering tiktok_metadata requests.
---

# TikTok metadata (account: Chai & Curiosity)

TikTok is a one-second feed. Comments push a video to more people.

- **caption** (in the video's language, 1–3 short lines):
  - **Line 1:** a punchy hook or question that works without sound. For example: "دیوارِ چین خلا سے نظر آتی ہے؟ 🤔"
  - **Last line:** a genuine question that starts a debate, for example "آپ کو پہلے کیا لگتا تھا؟". Series hooks work well: سچ یا جھوٹ؟ (myth or fact) and دنیا کا ریکارڈ (world record).
  - **Never:** "like/follow/share" begging, engagement bait, links, or claims the video doesn't show.
- **hashtags** (3–6): topic + language + series. Examples: #سائنس #سچ_یا_جھوٹ #pakistan #facts #urdu. **No** #fyp, #foryou or #viral (the validator rejects them).
- **coverText** (2–6 words, the first-frame text): for example "سچ یا جھوٹ؟" or "دنیا کی گرم ترین جگہ".
- **Automatic additions:** sources, the AI-voice note and the footage credit are added for you.

Answer with ONLY `{"caption": string, "hashtags": [string], "coverText": string}`.
