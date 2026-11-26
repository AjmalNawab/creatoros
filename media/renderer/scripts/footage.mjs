#!/usr/bin/env node
// Real-footage collector for CreatorOS. Only sources whose licence allows reuse in monetised videos.
//
//   node scripts/footage.mjs search <nasa|archive|pexels|pixabay|wikimedia> "<query>" [video|image]
//   node scripts/footage.mjs add <slug> <key> <source> <id> [--name file-stem] [--note "why/which scene"] [--start s --dur s]
//   node scripts/footage.mjs remove <slug> <file>
//   node scripts/footage.mjs list <slug>
//
// Files go to media/renderer/public/<key>/footage/, and every clip is recorded in
// content/<slug>/footage/manifest.json with its source page, licence and required credit (proof of licence).
// Licence policy: public domain (NASA, US gov), CC0, CC BY / CC BY-SA (credit required), Pexels and Pixabay licences.
// Anything else (no licence, NC, ND, "all rights reserved") is refused.
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const UA = 'CreatorOS-footage/0.1 (local tool)';
const env = Object.fromEntries(existsSync(path.join(ROOT, '.env')) ? readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n').filter((l) => /^\w+=/.test(l)).map((l) => [l.split('=')[0], l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]) : []);
const KEY = (k) => process.env[k] || env[k];

const get = async (url, headers = {}) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};
const json = async (url, headers) => (await get(url, headers)).json();
const OK_LICENCE = /public domain|^pd|cc0|cc[- ]by(?![- ]?nc)(?![- ]?nd)|creativecommons\.org\/(publicdomain|licenses\/publicdomain|licenses\/by(-sa)?\/)/i;

const SOURCES = {
  async nasa(q, type = 'video') {
    const d = await json(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=${type}&page_size=12`);
    return d.collection.items.map((i) => ({ id: i.data[0].nasa_id, title: i.data[0].title, date: i.data[0].date_created?.slice(0, 10), licence: 'Public domain (NASA)', credit: 'NASA' }));
  },
  async archive(q) {
    const d = await json(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${q}) AND mediatype:movies AND licenseurl:*`)}&fl[]=identifier&fl[]=title&fl[]=licenseurl&rows=15&output=json`);
    return d.response.docs.filter((x) => OK_LICENCE.test(x.licenseurl || '')).map((x) => ({ id: x.identifier, title: x.title, licence: x.licenseurl, credit: /publicdomain/.test(x.licenseurl) ? '' : `Internet Archive: ${x.identifier}` }));
  },
  async pexels(q, type = 'video') {
    const k = KEY('PEXELS_API_KEY'); if (!k) throw new Error('PEXELS_API_KEY missing (free key from pexels.com/api)');
    const d = await json(`https://api.pexels.com/${type === 'video' ? 'videos/' : 'v1/'}search?query=${encodeURIComponent(q)}&per_page=12`, { Authorization: k });
    return (d.videos ?? d.photos).map((v) => ({ id: String(v.id), title: v.url, duration: v.duration, licence: 'Pexels License', credit: '' }));
  },
  async pixabay(q, type = 'video') {
    const k = KEY('PIXABAY_API_KEY'); if (!k) throw new Error('PIXABAY_API_KEY missing (free key from pixabay.com/api/docs)');
    const d = await json(`https://pixabay.com/api/${type === 'video' ? 'videos/' : ''}?key=${k}&q=${encodeURIComponent(q)}&per_page=12&safesearch=true`);
    return d.hits.map((h) => ({ id: String(h.id), title: h.tags, duration: h.duration, licence: 'Pixabay Content License', credit: '' }));
  },
  async wikimedia(q, type = 'video') {
    const d = await json(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(`${type === 'video' ? 'filetype:video ' : ''}${q}`)}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|extmetadata|mime&format=json`);
    return Object.values(d.query?.pages ?? {}).map((p) => { const m = p.imageinfo[0].extmetadata; return { id: p.title, title: p.title, licence: m.LicenseShortName?.value, credit: `${(m.Artist?.value || '').replace(/<[^>]+>/g, '').trim()} / Wikimedia Commons (${m.LicenseShortName?.value})` }; })
      .filter((x) => OK_LICENCE.test(x.licence || ''));
  },
};

/** Resolve a downloadable file URL + metadata for one item. */
async function resolve(source, id) {
  if (source === 'nasa') {
    const files = (await json(`https://images-api.nasa.gov/asset/${encodeURIComponent(id)}`)).collection.items.map((i) => i.href.replace(/^http:/, 'https:'));
    const url = files.find((f) => /~large\.mp4$/.test(f)) || files.find((f) => /~medium\.mp4$/.test(f)) || files.find((f) => /\.mp4$/.test(f)) || files.find((f) => /~large\.jpg$/.test(f)) || files.find((f) => /~orig\.(jpg|png)$/.test(f));
    return { url, page: `https://images.nasa.gov/details/${id}`, licence: 'Public domain (NASA)', credit: 'NASA' };
  }
  if (source === 'archive') {
    const m = await json(`https://archive.org/metadata/${encodeURIComponent(id)}`);
    const lic = m.metadata.licenseurl || '';
    if (!OK_LICENCE.test(lic)) throw new Error(`Refused: licence "${lic || 'none'}" does not allow reuse`);
    const f = m.files.find((x) => /\.mp4$/i.test(x.name) && !/thumb/i.test(x.name)) || m.files.find((x) => /h\.264|mpeg4/i.test(x.format || ''));
    return { url: `https://archive.org/download/${id}/${encodeURIComponent(f.name)}`, page: `https://archive.org/details/${id}`, licence: lic, credit: /publicdomain/.test(lic) ? '' : `${m.metadata.creator || id} / Internet Archive` };
  }
  if (source === 'pexels') {
    const v = await json(`https://api.pexels.com/videos/videos/${id}`, { Authorization: KEY('PEXELS_API_KEY') });
    const f = v.video_files.filter((x) => x.file_type === 'video/mp4').sort((a, b) => Math.abs(a.height - 1080) - Math.abs(b.height - 1080))[0];
    return { url: f.link, page: v.url, licence: 'Pexels License (free to use, no attribution required)', credit: '' };
  }
  if (source === 'pixabay') {
    const d = await json(`https://pixabay.com/api/videos/?key=${KEY('PIXABAY_API_KEY')}&id=${id}`);
    const h = d.hits[0]; const v = h.videos.large?.url ? h.videos.large : h.videos.medium;
    return { url: v.url, page: h.pageURL, licence: 'Pixabay Content License (free to use, no attribution required)', credit: '' };
  }
  if (source === 'wikimedia') {
    const d = await json(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(id)}&prop=imageinfo&iiprop=url|extmetadata&format=json`);
    const p = Object.values(d.query.pages)[0]; const m = p.imageinfo[0].extmetadata;
    if (!OK_LICENCE.test(m.LicenseShortName?.value || '')) throw new Error(`Refused: licence ${m.LicenseShortName?.value}`);
    return { url: p.imageinfo[0].url, page: p.imageinfo[0].descriptionurl, licence: m.LicenseShortName.value, credit: `${(m.Artist?.value || '').replace(/<[^>]+>/g, '').trim()} / Wikimedia Commons (${m.LicenseShortName.value})` };
  }
  throw new Error(`Unknown source ${source}`);
}


const FFDIR = path.join(ROOT, 'media', 'renderer', 'node_modules', '@remotion', 'compositor-darwin-x64');
const ff = (bin, args) => execFileSync(path.join(FFDIR, bin), args, { env: { ...process.env, DYLD_LIBRARY_PATH: FFDIR } }).toString();
/** Renders need light, seekable clips: cap at 1920 px on the long side, keyframe every second, no audio. */
function normalise(file) {
  const [w, h] = ff('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).trim().split(',').map(Number);
  if (Math.max(w, h) <= 1920) return;
  const tmp = file.replace(/(\.\w+)$/, '.tmp$1');
  const scale = w >= h ? 'scale=1920:-2' : 'scale=-2:1920';
  ff('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', scale, '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-g', '30', '-pix_fmt', 'yuv420p', '-an', tmp]);
  renameSync(tmp, file);
  console.log(`normalised ${path.basename(file)}: ${w}x${h} → max 1920`);
}

const manifestPath = (slug) => path.join(ROOT, 'content', slug, 'footage', 'manifest.json');
const readManifest = (slug) => (existsSync(manifestPath(slug)) ? JSON.parse(readFileSync(manifestPath(slug), 'utf8')) : { clips: [] });

async function add(slug, key, source, id, name, note) {
  const r = await resolve(source, id);
  if (!r.url) throw new Error('No downloadable file found');
  const ext = path.extname(new URL(r.url).pathname).toLowerCase() || '.mp4';
  const stem = (name || `${source}-${id}`).replace(/[^\w.-]+/g, '_').slice(0, 60);
  const dir = path.join(ROOT, 'media', 'renderer', 'public', key, 'footage');
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, stem + ext);
  const start = flag('start'), dur = flag('dur');
  if (start || dur) {
    // Cut only the needed part straight from the (large) remote file: no multi-GB downloads.
    const FF = path.join(ROOT, 'media', 'renderer', 'node_modules', '@remotion', 'compositor-darwin-x64');
    execFileSync(path.join(FF, 'ffmpeg'), ['-v', 'error', '-y', '-ss', start || '0', '-i', r.url, ...(dur ? ['-t', dur] : []), '-an', '-c:v', 'copy', file],
      { env: { ...process.env, DYLD_LIBRARY_PATH: FF }, stdio: 'inherit' });
  } else {
    const res = await get(r.url);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
  }
  if (/\.(mp4|mov|webm)$/.test(ext)) normalise(file);
  const sha256 = createHash('sha256').update(readFileSync(file)).digest('hex');
  const m = readManifest(slug);
  m.clips = m.clips.filter((c) => c.file !== `${key}/footage/${stem}${ext}`);
  m.clips.push({ file: `${key}/footage/${stem}${ext}`, kind: /\.(mp4|webm|mov)$/.test(ext) ? 'video' : 'image', source, id, page: r.page, licence: r.licence, credit: r.credit, note: note || '', ...(flag('start') || flag('dur') ? { segment: { start: Number(flag('start') || 0), dur: flag('dur') ? Number(flag('dur')) : null } } : {}), sha256, addedAt: new Date().toISOString() });
  mkdirSync(path.dirname(manifestPath(slug)), { recursive: true });
  writeFileSync(manifestPath(slug), JSON.stringify(m, null, 1));
  console.log(`added ${key}/footage/${stem}${ext} (${r.licence})`);
}

const [cmd, ...a] = process.argv.slice(2);
const flag = (n) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : undefined; };
try {
  if (cmd === 'search') {
    const [source, q, type] = a;
    const rows = await SOURCES[source](q, type);
    for (const r of rows) console.log([r.id, r.duration ? `${r.duration}s` : '', r.date || '', (r.title || '').slice(0, 70), `[${r.licence}]`].filter(Boolean).join(' | '));
    if (!rows.length) console.log('(no reusable results)');
  } else if (cmd === 'add') {
    const [slug, key, source, id] = a;
    await add(slug, key, source, id, flag('name'), flag('note'));
  } else if (cmd === 'remove') {
    const [slug, name] = a; const m = readManifest(slug);
    // Accept the full path (p015/footage/x.mp4) or just the file name (x.mp4).
    const hit = m.clips.filter((c) => c.file === name || path.basename(c.file) === name);
    if (!hit.length) throw new Error(`no clip "${name}" in the manifest (see: list ${slug})`);
    m.clips = m.clips.filter((c) => !hit.includes(c));
    writeFileSync(manifestPath(slug), JSON.stringify(m, null, 1));
    for (const c of hit) { const abs = path.join(ROOT, 'media', 'renderer', 'public', c.file); if (existsSync(abs)) (await import('node:fs')).rmSync(abs); }
    console.log(`removed ${hit.map((c) => c.file).join(', ')}`);
  } else if (cmd === 'normalise') {
    const m = readManifest(a[0]);
    for (const c of m.clips.filter((x) => x.kind === 'video')) {
      const abs = path.join(ROOT, 'media', 'renderer', 'public', c.file);
      normalise(abs); c.sha256 = createHash('sha256').update(readFileSync(abs)).digest('hex'); c.normalised = true;
    }
    writeFileSync(manifestPath(a[0]), JSON.stringify(m, null, 1)); console.log('ok');
  } else if (cmd === 'list') {
    for (const c of readManifest(a[0]).clips) console.log(`${c.file} | ${c.licence} | ${c.credit || 'no credit needed'} | ${c.note}`);
  } else {
    console.log('usage: search <source> "<query>" [video|image] | add <slug> <key> <source> <id> [--name n] [--note t] | list <slug>');
  }
} catch (e) { console.error(String(e.message || e)); process.exit(1); }
