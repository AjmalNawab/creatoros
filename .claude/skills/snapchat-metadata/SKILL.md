---
name: snapchat-metadata
description: Playbook for CreatorOS "snapchat_metadata" AI requests. Write the one-line Snapchat Spotlight caption and topic hashtags for the anonymous "Chai & Curiosity" public profile. Use when answering snapchat_metadata requests.
---

# Snapchat Spotlight metadata (public profile: Chai & Curiosity)

Spotlight is fast and young. The caption is tiny and **topics** decide who sees the post.

- **caption**: ONE short line, ≤120 chars, in the video's language. A hook or a question, e.g. "دیوارِ چین خلا سے نظر آتی ہے؟ 🤔". No links, no begging, nothing the video doesn't show.
- **hashtags** (1–3): simple topics people follow, e.g. `#science #facts #pakistan`. No #fyp or #viral.
- **coverText** (2–6 words).
- **Automatic additions:** the AI-voice note and the footage credit (no sources line, which doesn't fit). Keep the caption short so the whole thing still fits Spotlight.

Answer with ONLY `{"caption": string, "hashtags": [string], "coverText": string}`.
