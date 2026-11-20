You are the Script Writing Agent of CreatorOS. Write an ORIGINAL Urdu (natural spoken Pakistani Urdu, Urdu script) narration script for a ~60s animated educational video.

Topic: how rainbows form
Research (use only these facts; prefer high confidence):
{
 "summary": "A rainbow appears when sunlight shines into falling raindrops while the Sun is behind the viewer. Each drop bends (refracts) the light as it enters, reflects it off the back of the drop, and bends it again as it leaves. Because each colour bends by a slightly different amount, white sunlight spreads into a band of colours, seen as an arc about 42 degrees from the point directly opposite the Sun.",
 "facts": [
  {
   "fact": "Sunlight looks white but is a mix of all colours of light.",
   "confidence": "high",
   "source": "NOAA SciJinks"
  },
  {
   "fact": "Light bends (refracts) when it passes from air into water and back into air.",
   "confidence": "high",
   "source": "NOAA SciJinks"
  },
  {
   "fact": "Inside a raindrop, light refracts on entry, reflects off the back of the drop, and refracts again on exit.",
   "confidence": "high",
   "source": "Met Office"
  },
  {
   "fact": "Each colour bends by a slightly different amount (dispersion), so the colours separate; violet bends most, red least.",
   "confidence": "high",
   "source": "Britannica"
  },
  {
   "fact": "To see a rainbow the Sun must be behind you and rain in front of you.",
   "confidence": "high",
   "source": "Met Office"
  },
  {
   "fact": "The main rainbow forms an arc about 42 degrees from the point directly opposite the Sun, with red on the outside and violet on the inside.",
   "confidence": "high",
   "source": "Britannica"
  },
  {
   "fact": "Rainbows are most often seen in the early morning or late afternoon, when the Sun is low in the sky.",
   "confidence": "high",
   "source": "Met Office"
  },
  {
   "fact": "Every person sees their own rainbow, made by a different set of raindrops.",
   "confidence": "high",
   "source": "NOAA SciJinks"
  },
  {
   "fact": "A rainbow is really a full circle; from the ground the horizon hides the lower part, but it can be seen as a circle from an aeroplane.",
   "confidence": "high",
   "source": "Met Office"
  },
  {
   "fact": "In a double rainbow, light reflects twice inside the drops; the second bow is fainter and its colours are reversed.",
   "confidence": "high",
   "source": "Met Office"
  },
  {
   "fact": "Around 1300 CE the Persian scientist Kamal al-Din al-Farisi explained the rainbow using a water-filled glass sphere as a model raindrop (Theodoric of Freiberg did similar work in Europe at about the same time).",
   "confidence": "high",
   "source": "Britannica"
  },
  {
   "fact": "In Urdu a rainbow is called qaus-e-qazah or dhanak; in Pakistan rainbows are often seen after monsoon showers when the Sun comes out.",
   "confidence": "medium",
   "source": "General knowledge (language); Met Office (sun-after-showers condition)"
  }
 ],
 "avoid": [
  "Saying raindrops 'contain' colours or are coloured; the colours come from sunlight.",
  "Saying a rainbow is a physical object at a fixed place that can be reached.",
  "Claiming exactly seven colours exist; seven is a naming convention for a continuous spectrum.",
  "Myths presented as fact (pot of gold, etc.)."
 ]
}

Requirements:
- 175 words total (±15%), split into 5-8 scenes. Scene 1 is a strong hook (question or vivid image), the last scene ends with a short subscribe/comment call to action.
- Simple, warm, curious tone. Short sentences (they become subtitles). Spell numbers as words.
- For each scene give a short English "visual" note describing an animated diagram that can be drawn with simple SVG shapes (no photos, no real people, no logos).

Answer with ONLY a JSON object:
{"titleOptions": [string, string, string], "scenes": [{"title": string (English), "visual": string (English), "text": string (narration)}]}