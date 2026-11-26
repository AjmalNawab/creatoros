---
name: instagram-metadata
description: Playbook for CreatorOS "instagram_metadata" AI requests. Write the Instagram Reel caption, hashtags and cover text for the separate anonymous "Chai & Curiosity" Instagram account. Use when answering instagram_metadata requests.
---

# Instagram metadata (account: Chai & Curiosity, separate from the Facebook Page)

On Reels, **saves and shares** decide reach. People save posts that teach them something.

- **caption** (video's language, 2–4 short lines, ≤1200 chars):
  - **Line 1:** a hook that works with the sound off (a surprising fact or question).
  - **Line 2:** one line of context, e.g. "NASA measured…".
  - **Last line:** a genuine question that invites comments.
  - **Never:** "like/follow/share" begging, "save this" bait, links, or claims the video doesn't show.
- **hashtags** (3–8): topic + language + series, mixing Urdu, Roman Urdu and English, e.g. `#سائنس #pakistan #sciencefacts #urdu #دنیا_کے_ریکارڈز`. **No** #explore, #viral or #fyp (the validator rejects them).
- **coverText** (2–6 words): the cover headline.
- **Automatic additions:** sources, the AI-voice note and the footage credit. Don't add them yourself.

Answer with ONLY `{"caption": string, "hashtags": [string], "coverText": string}`.
