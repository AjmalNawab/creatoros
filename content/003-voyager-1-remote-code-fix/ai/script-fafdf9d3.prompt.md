You are the Script Writing Agent of CreatorOS. Write an ORIGINAL English (clear, natural spoken documentary English) narration script for a ~45s animated video.

Brand: Margin of Safety
Niche: Engineering stories: near-misses, failures and fixes (structures, bridges, aviation, space, energy, industry): what happened, why, and what engineers learned
Audience: Curious adults 18-45 worldwide who like engineering, science and real-story documentaries (students, engineers, technical professionals, documentary fans)
Tone: Calm, precise documentary storytelling with suspense; respectful; explains the engineering clearly without jargon
Editorial rules (mandatory):
- Base every claim on official investigation reports (NTSB, CSB, AAIB, NASA, ESA, national inquiries), engineering papers or reputable reporting; cite them.
- Separate established facts from analysis; say "investigators concluded" for findings.
- Treat victims and families with respect; mention loss of life plainly, never sensationally.
- Every story ends with the lesson: what changed in codes, design or practice.
- Use correct units and numbers; convert to metric+imperial where helpful.
Never: Speculating on blame beyond official findings; Graphic depiction of victims or gore; Ongoing incidents before facts are established; Political takes; Clickbait that misstates what happened

Topic: Voyager 1 remote code fix
Angle (owner-selected idea): Animate the 2024 rescue: a failed memory chip, code split into fragments and moved into free memory gaps, all commanded across a 22-hour signal delay. Timely because Voyager 1 went quiet again on Nov 14, 2026; we explain the past fix and say plainly that the current issue is still being diagnosed.
Target audience: Broad science and tech audience (16-45), programmers and space fans who share 'legendary engineering' clips
Working title: How NASA Fixed a 46-Year-Old Computer From 15 Billion Miles Away
Research (use only these facts; prefer high confidence):
{
 "summary": "In November 2023 Voyager 1, launched in 1977 and now in interstellar space, began sending unreadable data. In March 2024 JPL engineers traced the problem to one failed chip in the Flight Data Subsystem (FDS), one of the spacecraft's three onboard computers; the chip held part of the FDS memory, including some of its software. With no way to replace hardware, they split the affected code into pieces and relocated them into other parts of the FDS memory, updating references so it still worked as a whole. The first patch was sent on April 18, 2024 and confirmation of returning engineering data arrived on April 20, 2024. On November 14, 2026, Voyager 1 again stopped returning data (carrier signal only) just as it reached one light-day from Earth; NASA says engineers are still diagnosing it.",
 "facts": [
  {
   "fact": "Voyager 1 launched in 1977 and is the most distant human-made object, in interstellar space.",
   "confidence": "high",
   "source": "NASA/JPL"
  },
  {
   "fact": "In November 2023 Voyager 1 began sending data the team could not read.",
   "confidence": "high",
   "source": "NASA Voyager blog (Apr 2024)"
  },
  {
   "fact": "In March 2024 the team confirmed the issue was in the Flight Data Subsystem (FDS), one of three onboard computers.",
   "confidence": "high",
   "source": "NASA Voyager blog (Apr 2024)"
  },
  {
   "fact": "A single chip storing part of the FDS memory, including some of its software code, had stopped working.",
   "confidence": "high",
   "source": "NASA Voyager blog (Apr 2024)"
  },
  {
   "fact": "The failed chip held roughly 3 percent of the FDS memory.",
   "confidence": "medium",
   "source": "IEEE Spectrum / press reports"
  },
  {
   "fact": "No single free location in memory was large enough for the affected code, so engineers split it into pieces and stored them in different places, updating references so it still worked as a whole.",
   "confidence": "high",
   "source": "NASA Voyager blog (Apr 2024)"
  },
  {
   "fact": "The first relocated code (which packages engineering data) was sent on April 18, 2024; confirmation that it worked arrived on April 20, 2024.",
   "confidence": "high",
   "source": "NASA Voyager blog (Apr 2024)"
  },
  {
   "fact": "Commands then took about 22.5 hours to reach Voyager 1 and the reply as long to return, so each test took about two days round trip.",
   "confidence": "high",
   "source": "NASA/JPL (2024)"
  },
  {
   "fact": "Science data from instruments returned in further updates in May and June 2024.",
   "confidence": "medium",
   "source": "NASA / press reports"
  },
  {
   "fact": "On November 14, 2026 Voyager 1 stopped returning science and engineering data, sending only a carrier signal; NASA suspects the onboard data computer and is still diagnosing it.",
   "confidence": "high",
   "source": "NASA Voyager blog (Nov 18, 2026)"
  },
  {
   "fact": "In November 2026 Voyager 1 reached one light-day from Earth: a signal now takes about 24 hours each way.",
   "confidence": "high",
   "source": "NASA / Space.com (Nov 2026)"
  }
 ],
 "avoid": [
  "Claiming the cause of the 2026 data halt is known (it is still being diagnosed).",
  "Claiming a cosmic ray caused the 2023 chip failure (never confirmed).",
  "Saying engineers 'rewrote the whole software'; they relocated pieces of existing code.",
  "Exaggerating distances; use about 24 billion km / one light-day."
 ]
}

FORMAT: vertical YouTube SHORT (9:16), ~45s. Every second counts.
Requirements:
- 116 words total (±15%), split into 6-10 LINES (each "scene" is one spoken line of 4-16 words; each line gets its own visual beat and word-by-word captions).
- Line 1 is the HOOK: at most 10 words, a surprising fact or tension that makes people stop scrolling. No greeting, no channel intro, no "in this video".
- Then a fast, clear story: the key mechanism or twist in the middle, and one concrete number (it will count up on screen).
- The last line is a short payoff/lesson that loops back to the hook (Shorts replay). Do NOT say "subscribe" in narration; the end card does that.
- endCard: title (the lesson, max 6 words) and cta (e.g. "Follow for a new story every week").
- For each line, a short English "visual" note: one simple animated diagram in this style: Engineering blueprint look: deep navy background with faint grid, white/cyan line drawings, orange/red for stress, failure and warnings, clean sans-serif labels, cross-sections, force arrows, diagrams and timelines. No photos or real people.. Vertical layout.

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}], "endCard": {"title": string, "cta": string}}