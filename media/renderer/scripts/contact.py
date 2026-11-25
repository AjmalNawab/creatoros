# Contact sheet of a video: python contact.py <video> <out.jpg> <start> <end> <n>
import sys, subprocess, os, tempfile
from PIL import Image, ImageDraw
v, out, a, b, n = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5])
FF = os.path.join(os.path.dirname(__file__), '..', 'node_modules', '@remotion', 'compositor-darwin-x64')
env = {**os.environ, 'DYLD_LIBRARY_PATH': FF}
tiles = []
with tempfile.TemporaryDirectory() as d:
    for i in range(n):
        t = a + (b - a) * i / max(1, n - 1)
        f = os.path.join(d, f'{i}.jpg')
        subprocess.run([os.path.join(FF, 'ffmpeg'), '-v', 'error', '-y', '-ss', str(t), '-i', v, '-frames:v', '1', '-vf', 'scale=320:-2', f], env=env)
        if os.path.exists(f):
            im = Image.open(f).convert('RGB'); ImageDraw.Draw(im).text((4, 4), f'{int(t)}s', fill=(255, 255, 0)); tiles.append(im)
cols = 4; w, h = tiles[0].size; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h))
for i, im in enumerate(tiles): sheet.paste(im, ((i % cols) * w, (i // cols) * h))
sheet.save(out, quality=80)
