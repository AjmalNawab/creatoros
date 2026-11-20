---
name: trend-ideas
description: Playbook for CreatorOS "trends" and "ideas" AI requests. Find what is genuinely trending now for the brand (Pakistan / Urdu audience), check competition, and propose ranked, evidence-backed video ideas. Use when answering trends/ideas requests or when the owner asks "what should we make next?".
---

# Trends → Ideas

## Trends request: gather REAL, current signals (cite every one)
Work through these sources, newest first:
1. **The prompt's YouTube API data**, if present: popular videos in PK. Look for topics, not channels.
2. **Web search** (WebSearch tool, mode "standard"; use "extended" for fresh news). Try queries like:
   - `<niche topic> news this week`
   - `NASA / ESA news <month year>`
   - `Pakistan weather / monsoon / heatwave <month year>`
   - `upcoming meteor shower / eclipse <month year>`
   - `exam season Pakistan <month>`
3. **YouTube search** in the owner's Chrome (chrome-devtools MCP), only if connected: type the topic in Urdu, Roman Urdu and English; note the autocomplete suggestions and recent uploads (view counts, upload age).
4. **Seasonal and calendar events**: national days, school calendar, Ramadan or Eid timing (only for science angles such as moon sighting), weather seasons.

For each signal, give: `topic`, `signal` (the concrete evidence), `source`, `url` when available, `freshness`, `relevance` (1–5 brand fit). Aim for 8–15 signals. Mix fresh items (this week) with evergreen-but-rising topics. Drop anything on the brand's `avoid` list.

## Ideas request: turn signals into the best next videos
For each candidate idea, check:
- **Fit:** is it in a brand pillar, and can it be explained with simple animated diagrams (no real footage needed)?
- **Demand:** is there a trend signal, or a search phrase people actually use?
- **Competition:** search YouTube for the Urdu/Hindi/English topic. Note how many relevant videos exist, their age and quality, and whether Urdu ones exist. A gap is an opportunity: say exactly what ours does better (clearer animation, Urdu, a local angle, fresher facts).
- **Audience:** who specifically (age, situation) and why they'll care *this week*.
- **Angle:** one sentence on the unique hook. Avoid generic "Everything about X".
- **Score (1–10):** fit × demand ÷ competition. Be honest, use the full range, and rank best first.
- **Keywords:** real search phrases in Urdu script, Roman Urdu and English.
- **Format:** `long` (60–180 s) by default; `short` only for one-fact ideas.

Learn from the prompt's "previously rejected" feedback. Never repeat "already made" topics.
