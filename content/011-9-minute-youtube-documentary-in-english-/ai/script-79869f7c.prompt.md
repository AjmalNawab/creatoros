You are the Script Writing Agent of CreatorOS. Write an ORIGINAL English (clear, natural spoken documentary English) narration script for a ~540s animated video.

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

Topic: 9 minute YouTube documentary in English: the Shenzhou-20 near-miss (November 2025), when a suspected debris strike cracked the returning capsule window, the crew came home on Shenzhou-21 and China launched an uncrewed Shenzhou-22 as a lifeboat; how China's crewed program handles lifeboats and risk, leading to Shenzhou-24 carrying Pakistan's first astronaut to Tiangong. Platforms: youtube
Research (use only these facts; prefer high confidence):
{
 "summary": "In November 2025 the Shenzhou-20 crew (commander Chen Dong) were about to leave China's Tiangong space station when, during final checks, Chen Dong spotted what looked like a leaf on the return capsule's window. It was a set of cracks, most likely from an impact by a tiny piece of space debris, and later the crew said some cracks had penetrated through the outer pane. The 5 November return was postponed; on 14 November the crew came home in the Shenzhou-21 capsule instead, leaving the newly arrived Shenzhou-21 crew without a safe ride home. China launched the uncrewed Shenzhou-22 around 25 November 2025 as a replacement lifeboat, carrying a porthole crack repair device; a spacewalk in December photographed the damage, and Shenzhou-20 returned uncrewed on 19 January 2026. A similar lifeboat swap happened on the ISS in 2022-23 when Soyuz MS-22 sprang a coolant leak and Soyuz MS-23 was launched empty to replace it. The lesson: crewed stations depend on always having a healthy lifeboat docked, and debris risk is growing. Shenzhou-24, scheduled for 25 November 2026, carries Pakistan's Muhammad Zeeshan Ali as the first foreign visitor to Tiangong.",
 "facts": [
  {
   "fact": "During final checks before the planned 5 November 2025 return, Shenzhou-20 commander Chen Dong noticed damage on the return capsule window; his first thought was that a small leaf had stuck to the outside.",
   "confidence": "high",
   "source": "Live Science; Space.com (crew interviews, 2026)"
  },
  {
   "fact": "China's space agency postponed the return because of a suspected space-debris impact and said the window glass had a crack that failed the requirements for a safe crewed return.",
   "confidence": "high",
   "source": "CMSA statements via PBS NewsHour / AP (Nov 2025)"
  },
  {
   "fact": "Examined under a microscope, the window showed several relatively long cracks and a shorter one, and the crew later said some of the cracks had penetrated through.",
   "confidence": "high",
   "source": "Space.com (Leonard David, 2026); Live Science"
  },
  {
   "fact": "Sources disagree on the size of the debris: one report says under 1 mm, while an expert quoted by Scientific American speculated it could be 1-10 cm; what hit it is not known.",
   "confidence": "medium",
   "source": "Scientific American; Universe Today"
  },
  {
   "fact": "On 14 November 2025 the Shenzhou-20 crew returned to Earth aboard the Shenzhou-21 spacecraft, leaving the damaged Shenzhou-20 docked in orbit.",
   "confidence": "high",
   "source": "PBS NewsHour; Space.com; The Register (14 Nov 2025)"
  },
  {
   "fact": "That left the Shenzhou-21 crew aboard Tiangong temporarily without a crewed return vehicle.",
   "confidence": "high",
   "source": "Astronomy.com; Scientific American"
  },
  {
   "fact": "China launched Shenzhou-22 uncrewed around 25 November 2025 (sources give 24 or 25 November) as a replacement return vehicle; it carried a porthole crack repair device.",
   "confidence": "high",
   "source": "Space.com; Universe Today; Yahoo/Space.com (2026)"
  },
  {
   "fact": "In early December 2025, astronauts on a spacewalk took high-resolution photos of the cracked window.",
   "confidence": "high",
   "source": "The Register (11 Dec 2025); Futurism"
  },
  {
   "fact": "The damaged Shenzhou-20 capsule returned to Earth uncrewed, landing at the Dongfeng site in Inner Mongolia on 19 January 2026.",
   "confidence": "high",
   "source": "Space.com / Yahoo (Jan 2026); Heise"
  },
  {
   "fact": "A similar lifeboat swap happened on the International Space Station: Soyuz MS-22 developed a coolant leak in December 2022, and Soyuz MS-23 was launched uncrewed in February 2023 to bring its crew home.",
   "confidence": "medium",
   "source": "NASA / Roscosmos reporting (2022-23)"
  },
  {
   "fact": "Shenzhou-24 is scheduled to launch on 25 November 2026 from Jiuquan with Tang Hongbo, Wu Yi and Pakistani payload specialist Muhammad Zeeshan Ali, the first foreign astronaut to visit Tiangong.",
   "confidence": "medium",
   "source": "Hong Kong Free Press (24 Nov 2026); Nature"
  },
  {
   "fact": "Ali is expected to stay about a week and return on Shenzhou-23, while one Shenzhou-23 astronaut stays for a year-long mission.",
   "confidence": "medium",
   "source": "Hong Kong Free Press; Wikipedia: Shenzhou 24"
  }
 ],
 "avoid": [
  "Saying the crew was in immediate danger of dying; they were never stranded without options for long and no one was hurt",
  "Stating a debris size as fact (sources disagree)",
  "Saying Shenzhou-24 launched or docked before it is confirmed",
  "Political framing (space race, military) or speculation beyond official statements",
  "Calling Ali the first Pakistani in space (Namira Salim flew suborbital in 2023)"
 ]
}

Requirements:
- 1395 words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Follow the brand tone. Short sentences (they become subtitles).
- For each scene give a short English "visual" note describing an animated diagram in this style: Engineering blueprint look: deep navy background with faint grid, white/cyan line drawings, orange/red for stress, failure and warnings, clean sans-serif labels, cross-sections, force arrows, diagrams and timelines. No photos or real people.

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}]}