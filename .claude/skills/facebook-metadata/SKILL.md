---
name: facebook-metadata
description: Playbook for CreatorOS "facebook_metadata" AI requests. Write the Facebook Reel/video title, caption and hashtags for the Page "Chai & Curiosity" in the video's language. Use when answering facebook_metadata requests.
---

# Facebook metadata (Page: Chai & Curiosity)

The Page mixes English and Urdu content: stories, science and lighter moments. Its voice is warm and curious, "best enjoyed with a cup of chai". The brand block in the prompt still sets the facts and tone of this particular video.

## How Facebook differs from YouTube
- People scroll a feed with the sound off. The **first caption line** must hook on its own: a surprising fact or a question. The topic name alone doesn't count.
- Shares come from feeling (awe, surprise, a smile). Search matters much less than on YouTube, so skip keyword stuffing.
- Short captions work best: 2–4 lines, then the sources line and hashtags (both appended automatically).

## Rules
- `title`: honest, ≤100 characters, matches what the video shows. In Urdu for Urdu videos.
- `caption`: line 1 is the hook; line 2 gives the context; the last line is a genuine, light question that invites comments (e.g. "Would you have trusted a 47-year-old computer?").
  - No engagement bait ("like if…", "share if…", "tag 3 friends"). Meta demotes it.
  - No links.
  - No clickbait that the video doesn't deliver.
- `hashtags`: 2–5 relevant ones. Include `#reels` for Shorts. No banned or spammy tags.
- Never invent facts. Use only what the narration and research say.

Answer with ONLY `{"title": string, "caption": string, "hashtags": [string]}`.
