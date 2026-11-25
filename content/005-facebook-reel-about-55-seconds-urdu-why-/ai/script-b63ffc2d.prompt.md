You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~55s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: Facebook Reel, about 55 seconds, Urdu: why a dead person's finger usually cannot unlock a phone fingerprint sensor (and the surprising cases when it can). Platforms: facebook
Research (use only these facts; prefer high confidence):
{
 "summary": "Most phone fingerprint sensors are capacitive: they read the tiny electrical differences between the ridges and valleys of living skin. After death, blood flow stops, the skin cools, dries and can wrinkle, so the sensor usually cannot read a match, and phones add their own barriers such as asking for the passcode after 48 hours. But it is not impossible: experts say a very recently deceased person's finger can sometimes still work, which is the surprising twist.",
 "facts": [
  {
   "fact": "Most smartphone fingerprint sensors identify a finger through electrical conductance rather than by taking a photo.",
   "confidence": "high",
   "source": "Live Science (Anil Jain, Michigan State University)"
  },
  {
   "fact": "A capacitive sensor is a grid of tiny cells; fingerprint ridges touch the sensor and give a stronger electrical reading than the valleys, which leave a small air gap, so the chip builds a map of the print.",
   "confidence": "high",
   "source": "Capacitive fingerprint sensor patents (US4353056, US6016355)"
  },
  {
   "fact": "Fingerprint expert Anil Jain says it gets more difficult to unlock a phone with fingertips the longer a person has been dead.",
   "confidence": "high",
   "source": "Live Science"
  },
  {
   "fact": "Jain explained that without blood flow the fingers can start to wrinkle or shrivel, which changes the print the sensor sees.",
   "confidence": "medium",
   "source": "Live Science / Fortune coverage quoting Anil Jain"
  },
  {
   "fact": "Jain also said that if a person has only recently died, it is possible to unlock a phone with their finger.",
   "confidence": "high",
   "source": "Live Science"
  },
  {
   "fact": "Scientists are not sure exactly how long after death the skin stops conducting electricity well enough for a sensor.",
   "confidence": "medium",
   "source": "Live Science"
  },
  {
   "fact": "iPhones ask for the passcode instead of Touch ID if the phone has not been unlocked for more than 48 hours, after a restart, or after five failed fingerprint attempts.",
   "confidence": "high",
   "source": "Apple Support: If Touch ID isn't working; Apple Platform Security guide"
  },
  {
   "fact": "In 2016, US police asked Jain's lab to make 3D-printed fingertip copies from a murder victim's fingerprints to try to unlock his phone.",
   "confidence": "high",
   "source": "NPR / WBUR (2016)"
  },
  {
   "fact": "Your fingerprint pattern itself does not disappear at death; the problem for phone sensors is the skin's changing electrical and physical condition.",
   "confidence": "medium",
   "source": "HowStuffWorks; Live Science"
  }
 ],
 "avoid": [
  "Saying it NEVER works (experts say a recently deceased finger sometimes can)",
  "Any step-by-step advice on unlocking someone else's or a deceased person's phone",
  "Graphic or gory depictions of bodies or severed fingers",
  "Naming specific criminal cases or victims sensationally",
  "Claiming all phones work the same way (optical and ultrasonic sensors also exist)"
 ]
}

FORMAT: vertical YouTube SHORT (9:16), ~55s. Every second counts.
Requirements:
- 160 words total (±15%), split into 6-10 LINES (each "scene" is one spoken line of 4-16 words; each line gets its own visual beat and word-by-word captions).
- Line 1 is the HOOK: at most 10 words, a surprising fact or tension that makes people stop scrolling. No greeting, no channel intro, no "in this video".
- Then a fast, clear story: the key mechanism or twist in the middle, and one concrete number (it will count up on screen).
- The last line is a short payoff/lesson that loops back to the hook (Shorts replay). Do NOT say "subscribe" in narration; the end card does that.
- endCard: title (the lesson, max 6 words) and cta (e.g. "Follow for a new story every week").
- For each line, a short English "visual" note: one simple animated diagram in this style: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).. Vertical layout.

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}], "endCard": {"title": string, "cta": string}}