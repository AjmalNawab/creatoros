"""Build storyboard.json from approved script scenes + per-scene narration (edge-tts mp3 + srt).

Usage: python3 -I media/tools/build_storyboard.py content/001-volcanoes p001
Writes: <project>/storyboard/storyboard.json and media/renderer/src/data/<key>.json, copies audio to media/renderer/public/<key>/.
"""
import json, os, re, shutil, sys

FPS = 30
TAIL_SEC = 0.6          # breathing room after each scene's narration
MP3_KBPS = 48           # edge-tts default output: 24kHz mono 48kbps CBR

proj, key = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # repo root
proj = os.path.join(root, proj)
pub = os.path.join(root, "media", "renderer", "public", key)
os.makedirs(pub, exist_ok=True)
os.makedirs(os.path.join(root, "media", "renderer", "src", "data"), exist_ok=True)


def ts(s):
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def parse_srt(path):
    cues = []
    for block in open(path, encoding="utf-8").read().strip().split("\n\n"):
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        a, b = [x.strip() for x in lines[1].split("-->")]
        cues.append({"start": ts(a), "end": ts(b), "text": " ".join(lines[2:])})
    return cues


scenes = json.load(open(os.path.join(proj, "storyboard", "scenes_raw.json"), encoding="utf-8"))
out, cursor = [], 0
for s in scenes:
    mp3 = os.path.join(proj, "audio", f"scene_{s['id']}.mp3")
    size = os.path.getsize(mp3)
    if size == 0:
        sys.exit(f"scene {s['id']}: empty audio")
    audio_sec = size * 8 / (MP3_KBPS * 1000)
    frames = int((audio_sec + TAIL_SEC) * FPS + 0.999)
    shutil.copy(mp3, os.path.join(pub, f"scene_{s['id']}.mp3"))
    out.append({
        "id": s["id"], "title": s["title"], "visual": s["visual"],
        "audio": f"{key}/scene_{s['id']}.mp3", "audioSec": round(audio_sec, 3),
        "startFrame": cursor, "durationFrames": frames,
        "captions": parse_srt(os.path.join(proj, "audio", f"scene_{s['id']}.srt")),
    })
    cursor += frames

data = {"fps": FPS, "width": 1920, "height": 1080, "totalFrames": cursor, "scenes": out}
for p in (os.path.join(proj, "storyboard", "storyboard.json"), os.path.join(root, "media", "renderer", "src", "data", f"{key}.json")):
    json.dump(data, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(out)} scenes, {cursor} frames = {cursor / FPS:.1f}s")
