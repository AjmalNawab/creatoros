You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~180s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: 3 minute vertical 9:16 Urdu explainer : Pakistan's Muhammad Zeeshan Ali flies on China's Shenzhou-24 to the Tiangong space station, the first foreign astronaut to visit it and the first Pakistani on an orbital mission. Who he is, how the launch, orbit and docking work, the Pakistani university experiments, life on the station, and how he returns. Publish only after the launch is confirmed. Platforms: facebook
Research (use only these facts; prefer high confidence):
{
 "summary": "Pakistani payload specialist Muhammad Zeeshan Ali is part of the three-person Shenzhou-24 crew with commander Tang Hongbo and flight engineer Wu Yi. The launch is scheduled for 25 November 2026 at 08:18 Beijing time (05:18 Pakistan time) on a Long March 2F rocket from the Jiuquan launch centre, with docking to the Tianhe core module of China's Tiangong space station planned about 3.5 hours after reaching orbit. He would be the first foreign astronaut to visit Tiangong and the first Pakistani on an orbital mission (Namira Salim flew a suborbital Virgin Galactic flight in 2023). He came out of a China-Pakistan astronaut agreement signed in early 2025, a selection in which two Pakistani candidates (Ali and Khurram Daud) trained in Beijing, and he flies as a payload specialist focused on experiments, including biotechnology experiments from Pakistani universities. He is expected to stay about a week and return to Earth with two Shenzhou-23 crew members, while one Shenzhou-23 astronaut stays for a year-long mission. NOTE: the launch had not happened when this was researched; confirm launch and docking before publishing.",
 "facts": [
  {
   "fact": "The Shenzhou-24 crew is commander Tang Hongbo, flight engineer Wu Yi and Pakistani payload specialist Muhammad Zeeshan Ali.",
   "confidence": "high",
   "source": "China Manned Space Agency news conference via Hong Kong Free Press / Reuters (24 Nov 2026)"
  },
  {
   "fact": "Launch is scheduled for 25 November 2026 at 08:18 Beijing time (05:18 Pakistan time) from the Jiuquan Satellite Launch Center on a Long March 2F rocket. (Must be confirmed after launch.)",
   "confidence": "medium",
   "source": "Hong Kong Free Press (24 Nov 2026); Wikipedia: Shenzhou 24"
  },
  {
   "fact": "The primary plan is to dock with the Tianhe core module about 3 hours 30 minutes after entering orbit.",
   "confidence": "medium",
   "source": "China-Global South Project (23 Nov 2026)"
  },
  {
   "fact": "Ali would be the first foreign astronaut to visit China's Tiangong space station.",
   "confidence": "high",
   "source": "Nature (Nov 2026); Al Jazeera (7 Nov 2026)"
  },
  {
   "fact": "He would be the first Pakistani on an orbital mission; Namira Salim, a Pakistani, flew a suborbital Virgin Galactic flight in October 2023.",
   "confidence": "high",
   "source": "Dawn (Nov 2026); Yahoo News UK"
  },
  {
   "fact": "China and Pakistan signed an astronaut cooperation agreement in early 2025 covering selection, training and flights to China's space station.",
   "confidence": "high",
   "source": "Dawn (2025); Express Tribune"
  },
  {
   "fact": "Two Pakistani candidates, Muhammad Zeeshan Ali and Khurram Daud, were selected and trained for months at China's astronaut training centre in Beijing; only one would fly.",
   "confidence": "high",
   "source": "Express Tribune; Geo News; Arab News (Sep 2026)"
  },
  {
   "fact": "As a payload specialist, Ali's main job is running scientific experiments rather than flying the spacecraft.",
   "confidence": "high",
   "source": "Space.com; Al Jazeera (Nov 2026)"
  },
  {
   "fact": "A SUPARCO official said the mission aims to host biotechnology experiments developed by Pakistani universities.",
   "confidence": "medium",
   "source": "Nature (Nov 2026)"
  },
  {
   "fact": "Ali is expected to spend about a week on Tiangong and return to Earth aboard the Shenzhou-23 spacecraft with two of its crew.",
   "confidence": "medium",
   "source": "Hong Kong Free Press; Wikipedia: Shenzhou 24"
  },
  {
   "fact": "One Shenzhou-23 astronaut is staying aboard for China's first year-long orbital stay, which frees the seat for Ali's return.",
   "confidence": "medium",
   "source": "China-Global South Project; Wikipedia: Shenzhou 24"
  },
  {
   "fact": "Tiangong is China's permanently crewed space station; its core module Tianhe was launched in 2021 and the station was completed in 2022 with the Wentian and Mengtian lab modules.",
   "confidence": "high",
   "source": "Britannica / Wikipedia: Tiangong space station"
  }
 ],
 "avoid": [
  "Saying he is the first Pakistani in space (Namira Salim flew suborbital in 2023); say first Pakistani in orbit / on a space station",
  "Stating the launch or docking happened before it is confirmed",
  "Inventing personal biography details (rank, hometown, education) not in sources",
  "Political framing about China-Pakistan relations or other countries",
  "Claiming specific experiment results"
 ]
}

Requirements:
- 525 words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Follow the brand tone. Short sentences (they become subtitles). Spell numbers as words.
- For each scene give a short English "visual" note describing an animated diagram in this style: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}]}