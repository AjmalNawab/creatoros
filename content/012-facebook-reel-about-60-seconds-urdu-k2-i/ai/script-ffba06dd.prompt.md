You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~60s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: Facebook Reel, about 60 seconds, Urdu: K2 in Pakistan is shorter than Everest but far more dangerous. Why the Savage Mountain is deadlier (steeper, more technical, worse and less predictable weather, further north, avalanches, the Bottleneck), the last 8000 m peak climbed in winter, and a respectful nod to Pakistani climbers. Entertaining surprising-fact tone. Use real licensed footage. Platforms: facebook
Research (use only these facts; prefer high confidence):
{
 "summary": "K2 (8,611 m), on Pakistan's border in Gilgit-Baltistan's Karakoram range, is about 240 m shorter than Everest (8,849 m) but far more dangerous, which is why climbers call it the Savage Mountain. Per summit, K2's death rate has historically been many times Everest's: close to 1 death for every 4 summits until about 2000, and still roughly 13-14% by 2022, against roughly 1-4% on Everest. It is steeper and more technical, its weather is harsher and less predictable, and most deaths happen during or just after the summit push (including the Bottleneck). It was the last of the world's fourteen 8,000 m peaks to be climbed in winter: ten Nepali climbers reached the top on 16 January 2021. Pakistan's Muhammad Ali Sadpara, from Skardu, the only Pakistani to have climbed eight of the 14 eight-thousanders and the first to climb Nanga Parbat in winter, lost his life on K2 in February 2021.",
 "facts": [
  {
   "fact": "K2 is 8,611 metres high, the second-highest mountain on Earth.",
   "confidence": "high",
   "source": "Guinness World Records: First winter ascent of K2"
  },
  {
   "fact": "Mount Everest is about 8,849 metres high, so K2 is roughly 240 metres shorter.",
   "confidence": "medium",
   "source": "2020 China-Nepal survey (widely reported)"
  },
  {
   "fact": "K2 is in the Karakoram range on the Pakistan-China border, in Gilgit-Baltistan.",
   "confidence": "high",
   "source": "Britannica: K2; Dawn"
  },
  {
   "fact": "Climbers call K2 the 'Savage Mountain'.",
   "confidence": "high",
   "source": "Islands.com; Climbing.com"
  },
  {
   "fact": "Until about 2000, K2's death rate was close to one death for every four summits (about 25-29%).",
   "confidence": "medium",
   "source": "Yahoo/Outside: Is K2 becoming less savage?; himalayantrekking.com"
  },
  {
   "fact": "By 2022, after many more successful climbs, K2's death rate per summit was still roughly 13-14%.",
   "confidence": "medium",
   "source": "Statista; Wikipedia: List of deaths on eight-thousanders"
  },
  {
   "fact": "Everest's death rate per summit is much lower, roughly 1-4% depending on how it is counted.",
   "confidence": "medium",
   "source": "Alan Arnette analysis; Statista"
  },
  {
   "fact": "Most deaths on K2 above 8,000 m happen during or just after the summit push.",
   "confidence": "medium",
   "source": "Climbing statistics summarised by Islands.com/Advnture"
  },
  {
   "fact": "K2 is steeper and more technical than Everest, with harsher and less predictable weather.",
   "confidence": "medium",
   "source": "Islands.com; National Geographic"
  },
  {
   "fact": "K2 was the last of the world's fourteen 8,000-metre peaks to be climbed in winter.",
   "confidence": "high",
   "source": "UKClimbing; Guinness World Records"
  },
  {
   "fact": "A team of 10 Nepali climbers made the first winter ascent of K2 on 16 January 2021.",
   "confidence": "high",
   "source": "Guinness World Records; Al Jazeera; Dawn"
  },
  {
   "fact": "Muhammad Ali Sadpara from Skardu was the only Pakistani to have climbed eight of the 14 eight-thousanders and made the first winter ascent of Nanga Parbat; he died on K2 in February 2021 during a winter attempt.",
   "confidence": "high",
   "source": "Dawn: A heart as big as K2; Al Jazeera (Feb 2021)"
  },
  {
   "fact": "K2 was first climbed in 1954 by an Italian expedition.",
   "confidence": "high",
   "source": "Britannica: K2"
  }
 ],
 "avoid": [
  "Exact single death-rate number as fact (counts differ); use 'about 1 in 4 historically' and 'still much higher than Everest'",
  "Sensationalising deaths; mention Ali Sadpara with respect",
  "Saying K2 is the most dangerous mountain overall (Annapurna's rate is sometimes higher)",
  "Politics about the border",
  "Using climber footage as if it were a specific named expedition"
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