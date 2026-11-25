You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~60s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: Facebook Reel, about 60 seconds, Urdu: why Lahore smog gets trapped every winter (temperature inversion: cold air near the ground under a warm lid, crop-residue burning, traffic and brick-kiln smoke, still winter air) and what actually helps. Hook: a famous Lahore landmark disappearing in smog. Platforms: facebook
Research (use only these facts; prefer high confidence):
{
 "summary": "Every winter Lahore's smog is not mainly new pollution; it is the same year-round smoke trapped close to the ground. In winter the ground cools fast at night, a layer of warmer air sits above the cold air (a temperature inversion) and acts like a lid, the layer in which smoke can mix and spread shrinks sharply, and winds over eastern Punjab are often very weak. Under this lid, emissions from vehicles, industry and brick kilns build up, and late-season crop-residue burning around Lahore (on both sides of the border) adds a big seasonal burst. In November 2024 Lahore recorded its worst readings ever, and Punjab closed schools across many districts. What helps is cutting the sources (crop burning, dirty vehicles and kilns), because the weather lid cannot be removed.",
 "facts": [
  {
   "fact": "A temperature inversion is when warmer air sits above colder air near the ground; it stops the normal upward movement of air and acts like a lid that traps pollutants near the surface.",
   "confidence": "high",
   "source": "Dawn explainer on smog (dawn.com/news/1518238)"
  },
  {
   "fact": "In winter the height of the atmospheric layer into which Lahore's pollution can disperse drops sharply, which is one of the main reasons air quality worsens in winter.",
   "confidence": "high",
   "source": "Hamari Hawa report via Dawn (dawn.com/news/2042329)"
  },
  {
   "fact": "From November to January, eastern Punjab often has very weak winds (below about 1.5 metres per second) and deep inversions that prevent natural ventilation of the air.",
   "confidence": "medium",
   "source": "KFUPM study of winter fog episodes over Punjab"
  },
  {
   "fact": "An emissions inventory based on 2020-21 data put transport at about 35 percent and crop-residue burning at about 33 percent of Lahore's PM2.5 emissions.",
   "confidence": "medium",
   "source": "Hamari Hawa report via Dawn (dawn.com/news/2042329)"
  },
  {
   "fact": "Between 37 and 63 percent of crop-fire detections within 100 km of Lahore on the Pakistani side came after 1 November in each season from 2019 to 2025, the same time the mixing layer becomes shallow.",
   "confidence": "high",
   "source": "Hamari Hawa report via Dawn (dawn.com/news/2042329)"
  },
  {
   "fact": "Lahore's air pollution is a year-round problem; winter weather and crop burning make an existing baseline much worse.",
   "confidence": "high",
   "source": "Dawn (dawn.com/news/2042329)"
  },
  {
   "fact": "Seasonal winds can carry smoke from crop burning in Indian Punjab across the border to Pakistan, so smog is a shared regional problem.",
   "confidence": "medium",
   "source": "Dawn (dawn.com/news/1458693)"
  },
  {
   "fact": "Peer-reviewed research concludes crop-residue burning and motor vehicles have greatly increased the frequency and intensity of smog events, with weather (humidity, wind, dew point) deciding how bad each episode gets.",
   "confidence": "high",
   "source": "Majeed et al., Frontiers in Sustainable Cities (2024)"
  },
  {
   "fact": "In early November 2024 Lahore's air quality index exceeded 1,000, a record for Pakistan, and primary schools in Lahore were closed for a week from 4 November.",
   "confidence": "high",
   "source": "AP via PBS NewsHour (Nov 2024)"
  },
  {
   "fact": "Punjab later closed schools and colleges across 18 districts from 7 to 17 November 2024 and set up a smog war room.",
   "confidence": "high",
   "source": "Dawn; Al Jazeera (Nov 2024)"
  },
  {
   "fact": "Because the weather lid cannot be removed, lasting improvement depends on cutting the sources: crop-residue burning, smoky vehicles, and industrial and brick-kiln emissions.",
   "confidence": "medium",
   "source": "Frontiers 2024; Hamari Hawa report via Dawn"
  }
 ],
 "avoid": [
  "Blaming only India or only farmers; sources differ on the shares and the problem is shared",
  "Quoting a single record AQI number as exact (monitors disagree: AP said over 1,000, others cited higher local readings)",
  "Medical advice or specific mask/health claims",
  "Fear-mongering ('poison air will kill you')",
  "Calling smog 'fog'; fog is water droplets, smog is pollution (they often mix)"
 ]
}

FORMAT: vertical YouTube SHORT (9:16), ~60s. Every second counts.
Requirements:
- 175 words total (±15%), split into 6-10 LINES (each "scene" is one spoken line of 4-16 words; each line gets its own visual beat and word-by-word captions).
- Line 1 is the HOOK: at most 10 words, a surprising fact or tension that makes people stop scrolling. No greeting, no channel intro, no "in this video".
- Then a fast, clear story: the key mechanism or twist in the middle, and one concrete number (it will count up on screen).
- The last line is a short payoff/lesson that loops back to the hook (Shorts replay). Do NOT say "subscribe" in narration; the end card does that.
- endCard: title (the lesson, max 6 words) and cta (e.g. "Follow for a new story every week").
- For each line, a short English "visual" note: one simple animated diagram in this style: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).. Vertical layout.

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}], "endCard": {"title": string, "cta": string}}