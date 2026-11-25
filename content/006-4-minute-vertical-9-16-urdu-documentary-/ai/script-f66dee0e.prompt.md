You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~240s animated video.

Brand: Urdu Science Explainers
Niche: Animated Urdu explainers: science, nature, space, the human body, how everyday things work
Audience: Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English
Tone: Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational
Editorial rules (mandatory):
- Only verified facts from authoritative sources.
- Include a Pakistan angle only when genuine.
Never: Politics and religion debates; Medical advice; Fear-mongering / disaster sensationalism; Unverified claims; Celebrity gossip

Topic: 4 minute vertical 9:16 Urdu documentary-style explainer : why a dead persons finger usually cannot unlock a phone fingerprint sensor, how fingerprints and fingerprint sensors work, and the surprising cases when it can
Research (use only these facts; prefer high confidence):
{
 "summary": "A 4-minute journey: how fingerprints form before birth and why even identical twins differ; how phone sensors read them (optical photo, capacitive electricity, ultrasonic sound); why a dead finger usually fails (no blood flow, cooling, drying and wrinkling skin, loss of conductance, plus phone rules like the iPhone's 48-hour passcode rule); and the twist that a very recently deceased finger can sometimes still work, which is why police have even tried 3D-printed fingertips.",
 "facts": [
  {
   "fact": "Fingerprint ridges form before birth, mostly between about the 13th and 19th week of pregnancy, and stay the same for life.",
   "confidence": "medium",
   "source": "MedlinePlus Genetics; Live Science; HowStuffWorks"
  },
  {
   "fact": "Even identical twins, who share the same genes, have different fingerprints, because tiny conditions in the womb (position, finger growth, contact with fluid) shape the fine details.",
   "confidence": "high",
   "source": "Live Science; MedlinePlus Genetics"
  },
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
   "fact": "Optical fingerprint sensors light up the finger and take a picture of it; they are cheaper and can sit under the screen.",
   "confidence": "high",
   "source": "Android Authority: How fingerprint scanners work"
  },
  {
   "fact": "Capacitive sensors use an array of extremely tiny capacitors that each hold a small electrical charge, and they are harder to fool than simple optical ones.",
   "confidence": "high",
   "source": "Android Authority: How fingerprint scanners work"
  },
  {
   "fact": "Ultrasonic sensors, found mainly in premium phones, send sound waves into the finger and measure the echo to build a 3D map of ridges and pores.",
   "confidence": "high",
   "source": "Android Authority / iFixit: How ultrasonic fingerprint sensors work"
  },
  {
   "fact": "Many sensors also try to check that a finger is real and alive (liveness detection), for example by its electrical or physical properties.",
   "confidence": "medium",
   "source": "arXiv review: Fingerprint-based authentication, liveness detection (2020); capacitive sensor patents"
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

Requirements:
- 700 words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Follow the brand tone. Short sentences (they become subtitles). Spell numbers as words.
- For each scene give a short English "visual" note describing an animated diagram in this style: Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}]}