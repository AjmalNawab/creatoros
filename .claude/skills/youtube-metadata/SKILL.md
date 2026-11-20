---
name: youtube-metadata
description: Playbook for CreatorOS "youtube_metadata" AI requests. Write honest, search-optimised YouTube title, description, chapter titles, tags, hashtags and thumbnail text in the brand's language. Use when answering youtube_metadata requests.
---

# YouTube metadata

- **title (≤100 chars):** lead with the curiosity hook plus the searchable subject.
  - Margin of Safety: story-style titles that are honest about what happened, e.g. "The Bridge That Tore Itself Apart (Tacoma Narrows, 1940)" or "How a Unit Mix-Up Lost a $125M Spacecraft". Include the incident name or year for search.
  - Urdu brand: Urdu first, then ` | ` and short English.
  - Never clickbait that misstates the facts. No ALL CAPS, no emoji spam, no `<` or `>`.
- **description:** 2–4 short paragraphs in the video's language. The first 150 characters matter most (shown in search): say what the viewer learns. No links. Chapters, sources and the AI-voice disclosure are appended automatically.
- **chapterTitles:** exactly one per scene, 2–5 words each.
- **tags (8–15, total <500 chars):** real search phrases: the incident name, location, year, engineering concept (e.g. "aeroelastic flutter") and "engineering disaster". For Urdu, mix Urdu script, Roman Urdu and English.
- **hashtags (≤3):** e.g. `#engineering #history`, or `#سائنس` for Urdu.
- **thumbnailText:** 2–4 bold words that are readable at small size (rendered uppercase for English). Complements the title rather than repeating it.
- Use the selected idea's keywords if present in the project. Never promise anything the video doesn't show.
