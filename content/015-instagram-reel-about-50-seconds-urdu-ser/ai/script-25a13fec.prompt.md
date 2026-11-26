You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~50s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: Instagram Reel, about 50 seconds, Urdu, series Kamyabi ki Asal Kahani (The real story of success): Colonel Harland Sanders and KFC. Tell the true turning point: losing his roadside cafe business in his 60s and starting to franchise his chicken recipe instead. Verified facts only, and honestly check the famous '1,009 rejections' claim (is it documented or a myth?). End with one honest lesson and a question for viewers. No KFC logos, no realistic AI images of Sanders; use real licensed footage (fried chicken, 1950s American roads/diners) where available.
Research (use only these facts; prefer high confidence):
{
 "summary": "The real Colonel Sanders story: a man who failed or quit many jobs, built a roadside cafe in Corbin, Kentucky, lost its traffic when a new interstate bypassed the town in the mid-1950s, and in his mid-60s, living on a $105 monthly Social Security check, drove from restaurant to restaurant selling his chicken recipe for a few cents per chicken. He had already signed his first franchisee (Pete Harman, Salt Lake City) in 1952, so the true turning point was choosing to grow franchising instead of rebuilding a single cafe. The famous '1,009 rejections' number has no documented primary source: he was rejected many times, but the exact number is legend. By 1964 he sold the company for $2 million and stayed on as its face.",
 "facts": [
  {
   "fact": "Harland Sanders was born in 1890 in Henryville, Indiana; his father died when he was a young boy and he cooked for his younger siblings while his mother worked.",
   "confidence": "high",
   "source": "Britannica / Biography.com"
  },
  {
   "fact": "Before KFC he worked many jobs, including farmhand, streetcar conductor, railroad worker and insurance salesman, and lost or left several of them.",
   "confidence": "high",
   "source": "History.com: 8 facts about the real Colonel Sanders"
  },
  {
   "fact": "In 1930 he began serving meals to travellers and truck drivers at his service station in Corbin, Kentucky, which grew into a roadside restaurant.",
   "confidence": "high",
   "source": "History.com"
  },
  {
   "fact": "Kentucky's governor gave him the honorary title 'Kentucky Colonel' in the 1930s; he was never a military colonel.",
   "confidence": "high",
   "source": "Britannica / History.com"
  },
  {
   "fact": "He fried chicken in pressure cookers so it cooked much faster than in a pan.",
   "confidence": "medium",
   "source": "Christian Science Monitor obituary (1980); History.com"
  },
  {
   "fact": "In 1952 his friend Pete Harman in Salt Lake City became the first restaurant to sell his chicken under a franchise deal, and the name 'Kentucky Fried Chicken' was coined there.",
   "confidence": "high",
   "source": "History.com; University of New Hampshire Rosenberg Center"
  },
  {
   "fact": "In the mid-1950s a new interstate highway (I-75) took traffic away from his Corbin restaurant, and he sold it at a loss.",
   "confidence": "high",
   "source": "New York Times (via The Nightly); historical marker HMdb"
  },
  {
   "fact": "In his mid-60s, living on a $105-a-month Social Security check, he drove to restaurants with a pressure cooker and his seasoning, offering his recipe in exchange for a few cents per chicken sold.",
   "confidence": "high",
   "source": "Christian Science Monitor obituary quoting his autobiography; Snopes; History.com"
  },
  {
   "fact": "The popular claim that he was rejected exactly 1,009 times has no documented primary source; even articles repeating it call it legend. He did face many rejections.",
   "confidence": "high",
   "source": "Snopes; AAP FactCheck; HowStuffWorks 'Legends about Colonel Sanders'"
  },
  {
   "fact": "The viral meme that he started from nothing at 65 is exaggerated: franchising had already begun in 1952, when he was about 62, before the Social Security check.",
   "confidence": "high",
   "source": "AAP FactCheck: Barely a nugget of truth in Colonel Sanders rags-to-riches meme"
  },
  {
   "fact": "In 1964 he sold the company to investors led by John Y. Brown Jr. and Jack Massey for $2 million, plus a yearly salary to remain its spokesman.",
   "confidence": "high",
   "source": "Britannica Money; History of KFC"
  },
  {
   "fact": "In 1971 the company was sold again, to Heublein, for about $285 million.",
   "confidence": "high",
   "source": "History of KFC; Benzinga"
  },
  {
   "fact": "Sanders died in 1980 in Louisville, Kentucky; his face is still the brand's logo, and KFC operates restaurants in Pakistan today.",
   "confidence": "medium",
   "source": "Britannica; KFC global history"
  }
 ],
 "avoid": [
  "Stating '1,009 rejections' as fact (only as the famous legend, then correct it)",
  "Claiming he started from zero at 65 or that the $105 check started his business",
  "Invented motivational quotes attributed to Sanders",
  "Claims about the secret recipe's ingredients",
  "KFC logos, ads or the company's own footage; realistic AI images of Sanders",
  "'Get rich' promises or money advice",
  "Calling him a military colonel"
 ]
}

FORMAT: vertical YouTube SHORT (9:16), ~50s. Every second counts.
Requirements:
- 146 words total (±15%), split into 6-10 LINES (each "scene" is one spoken line of 4-16 words; each line gets its own visual beat and word-by-word captions).
- Line 1 is the HOOK: at most 10 words, a surprising fact or tension that makes people stop scrolling. No greeting, no channel intro, no "in this video".
- Then a fast, clear story: the key mechanism or twist in the middle, and one concrete number (it will count up on screen).
- The last line is a short payoff/lesson that loops back to the hook (Shorts replay). Do NOT say "subscribe" in narration; the end card does that.
- endCard: title (the lesson, max 6 words) and cta (e.g. "Follow for a new story every week").
- For each line, a short English "visual" note: one simple animated diagram in this style: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).. Vertical layout.

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}], "endCard": {"title": string, "cta": string}}