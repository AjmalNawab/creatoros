---
name: research
description: Playbook for CreatorOS "research" AI requests. Build a sourced fact sheet for an Urdu educational video, with honest confidence levels and an optional genuine Pakistan angle. Use when answering research requests.
---

# Research fact sheet

1. Start from the chosen **angle and audience** in the prompt (from the selected idea). Every fact should serve that angle.
2. For engineering stories, the **primary source is the official investigation report**: NTSB, CSB, AAIB, BEA, a national inquiry or a NASA/ESA board report. Get the timeline, the root cause, the contributing factors and the recommendations. Add engineering papers or textbooks for the mechanism, and reputable press for human context.
3. Collect 8–14 facts. Prefer USGS, NASA, ESA, NOAA, WHO, Smithsonian, Britannica, National Geographic, the Met Office and peer-reviewed reviews. Use WebSearch to verify anything recent or numeric; don't rely on memory for numbers, dates or records.
4. Confidence:
   - **high:** stated by an authoritative source.
   - **medium:** widely reported, or rounded.
   - **low:** needs checking. Low-confidence facts must not reach the script.
5. **Local angle** (Urdu brand only): include one only if it is real and verifiable (a place, an event, a scientist, a season). Never invent one.
6. `sources` must be real URLs you actually used. `avoid` lists common misconceptions and sensational framings for this topic.
7. Keep each fact one sentence, plain English. The script agent translates.
