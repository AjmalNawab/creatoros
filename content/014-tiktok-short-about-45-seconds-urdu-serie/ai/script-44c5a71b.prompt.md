You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~45s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: TikTok short, about 45 seconds, Urdu, series Duniya ke Records (World Records): the hottest place on Earth, where NASA satellites measured extreme land surface temperatures (Lut Desert, Iran; also Death Valley air temperature record), explain surface vs air temperature. Wow-fact tone. Use real licensed footage. Platforms: tiktok, facebook
Research (use only these facts; prefer high confidence):
{
 "summary": "The hottest place on Earth depends on what you measure. Air temperature: the official World Meteorological Organization record is 56.7°C (134°F) at Furnace Creek, Death Valley, USA, on 10 July 1913 (some scientists question that reading; Libya's 58°C El Azizia record was disqualified by the WMO in 2012). Ground (land surface) temperature: NASA satellites (MODIS) measured 70.7°C in Iran's Lut Desert in 2005, the highest in their seven-year survey; a later study suggests the true peaks may be even higher. The ground gets far hotter than the air because dark, dry surfaces absorb sunlight. Pakistan's own Jacobabad is one of the hottest cities on Earth.",
 "facts": [
  {
   "fact": "NASA satellites measured a land surface temperature of 70.7°C (159.3°F) in Iran's Lut Desert in 2005, the highest in a seven-year survey.",
   "confidence": "high",
   "source": "NASA Earth Observatory: Where is the hottest place on Earth?"
  },
  {
   "fact": "The Lut Desert was the hottest place in five of the seven years NASA studied.",
   "confidence": "high",
   "source": "NASA Earth Observatory"
  },
  {
   "fact": "Satellites measure the temperature of the ground surface, which can be much hotter than the air temperature measured by weather stations in the shade.",
   "confidence": "high",
   "source": "NASA Earth Observatory: What does it mean to be hot?"
  },
  {
   "fact": "The Lut Desert's dark rocks and sand absorb sunlight strongly, which heats the ground.",
   "confidence": "medium",
   "source": "NASA Earth Observatory"
  },
  {
   "fact": "The official highest air temperature recognised by the World Meteorological Organization is 56.7°C (134°F), recorded at Furnace Creek in Death Valley, USA, on 10 July 1913.",
   "confidence": "high",
   "source": "WMO Weather and Climate Extremes Archive"
  },
  {
   "fact": "Some scientists question the 1913 Death Valley reading, but it remains the official WMO record.",
   "confidence": "medium",
   "source": "Weather/climate press coverage"
  },
  {
   "fact": "A 58°C reading from El Azizia, Libya (1922) was disqualified by the WMO in 2012.",
   "confidence": "high",
   "source": "WMO (2012)"
  },
  {
   "fact": "A later study using newer satellite data suggests land surface temperatures in the Lut Desert and Sonoran Desert may reach around 80°C.",
   "confidence": "low",
   "source": "NSF PAR paper (single source)"
  },
  {
   "fact": "Jacobabad in Pakistan is regularly described as one of the hottest cities on Earth.",
   "confidence": "medium",
   "source": "BBC / Amnesty reporting on Jacobabad heat"
  }
 ],
 "avoid": [
  "Mixing up ground temperature with air temperature",
  "Saying Libya's 58°C is the record (disqualified in 2012)",
  "Stating the ~80°C study as fact",
  "Fear-mongering about heat; keep it wonder plus a light Jacobabad link"
 ]
}

FORMAT: vertical YouTube SHORT (9:16), ~45s. Every second counts.
Requirements:
- 131 words total (±15%), split into 6-10 LINES (each "scene" is one spoken line of 4-16 words; each line gets its own visual beat and word-by-word captions).
- Line 1 is the HOOK: at most 10 words, a surprising fact or tension that makes people stop scrolling. No greeting, no channel intro, no "in this video".
- Then a fast, clear story: the key mechanism or twist in the middle, and one concrete number (it will count up on screen).
- The last line is a short payoff/lesson that loops back to the hook (Shorts replay). Do NOT say "subscribe" in narration; the end card does that.
- endCard: title (the lesson, max 6 words) and cta (e.g. "Follow for a new story every week").
- For each line, a short English "visual" note: one simple animated diagram in this style: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).. Vertical layout.

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}], "endCard": {"title": string, "cta": string}}

---
YOUR PREVIOUS ANSWER WAS REJECTED:
The hook (line 1) has 14 words; keep it to 10 or fewer.
Fix this and answer again.