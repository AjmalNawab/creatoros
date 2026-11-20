import type { PrismaClient } from '@creatoros/db';

/**
 * Brand profile = who we make content for and how. Ideas are scored against it; research, script,
 * voice, visuals and metadata follow it. Each brand owns its own platform channels (multi-brand).
 */
export interface BrandProfile {
  niche: string;
  audience: string;
  region: string;          // ISO country used for trend charts, e.g. "US", "PK"
  language: 'en' | 'ur';
  tone: string;
  pillars: string[];       // recurring content themes
  avoid: string[];         // topics/styles we never do
  rules: string[];         // editorial rules every agent must follow
  formats: string[];
  voice: string;           // edge-tts voice
  voiceRate: string;       // e.g. "+0%"
  wordsPerMinute: number;  // measured for voice+rate; drives script length
  visualStyle: string;     // guidance for the visuals agent
  channels: { youtube?: { id: string; handle: string; name: string } };
  youtubeCategory: string; // YouTube Studio category name
}

export const BRANDS: { slug: string; name: string; description: string; profile: BrandProfile }[] = [
  {
    slug: 'margin-of-safety',
    name: 'Margin of Safety',
    description: "True stories behind engineering's greatest near-misses, failures and fixes, told with original animation.",
    profile: {
      niche: "Engineering stories: near-misses, failures and fixes (structures, bridges, aviation, space, energy, industry): what happened, why, and what engineers learned",
      audience: 'Curious adults 18-45 worldwide who like engineering, science and real-story documentaries (students, engineers, technical professionals, documentary fans)',
      region: 'US',
      language: 'en',
      tone: 'Calm, precise documentary storytelling with suspense; respectful; explains the engineering clearly without jargon',
      pillars: ['Structures that almost failed (and the fix)', 'Bridges and wind/vibration', 'Aviation and space mishaps (units, software, materials)',
        'Industrial and energy accidents and the safety rules they created', 'Brilliant engineering fixes and redesigns'],
      avoid: ['Speculating on blame beyond official findings', 'Graphic depiction of victims or gore', 'Ongoing incidents before facts are established',
        'Political takes', 'Clickbait that misstates what happened'],
      rules: [
        'Base every claim on official investigation reports (NTSB, CSB, AAIB, NASA, ESA, national inquiries), engineering papers or reputable reporting; cite them.',
        'Separate established facts from analysis; say "investigators concluded" for findings.',
        'Treat victims and families with respect; mention loss of life plainly, never sensationally.',
        'Every story ends with the lesson: what changed in codes, design or practice.',
        'Use correct units and numbers; convert to metric+imperial where helpful.',
      ],
      formats: ['long: 2-6 minute animated story (default)', 'short: under 60 seconds, one striking fact (later)'],
      voice: 'en-GB-RyanNeural',   // measured 170 wpm at +0%; -8% ≈ 157 wpm documentary pace
      voiceRate: '-8%',
      wordsPerMinute: 157,
      visualStyle: 'Engineering blueprint look: deep navy background with faint grid, white/cyan line drawings, orange/red for stress, failure and warnings, clean sans-serif labels, cross-sections, force arrows, diagrams and timelines. No photos or real people.',
      channels: { youtube: { id: 'UCvugPJLIN5Wr5JeddlTrvKg', handle: '@MarginOfSafetyTV', name: 'Margin of Safety' } },
      youtubeCategory: 'Science & Technology',
    },
  },
  {
    slug: 'urdu-science',
    name: 'Urdu Science Explainers',
    description: 'Original animated Urdu explainers about science, nature, space and how things work.',
    profile: {
      niche: 'Animated Urdu explainers: science, nature, space, the human body, how everyday things work',
      audience: 'Curious Pakistanis aged 12-35 (students, young professionals, families) who prefer Urdu over English',
      region: 'PK',
      language: 'ur',
      tone: 'Warm, curious, clear; simple spoken Urdu; wonder over fear; never sensational',
      pillars: ['How nature works', 'Space and planets', 'Human body and health basics (non-medical-advice)', 'Science behind everyday life', 'Pakistan geography and nature'],
      avoid: ['Politics and religion debates', 'Medical advice', 'Fear-mongering / disaster sensationalism', 'Unverified claims', 'Celebrity gossip'],
      rules: ['Only verified facts from authoritative sources.', 'Include a Pakistan angle only when genuine.'],
      formats: ['long: 1-3 minute animated explainer', 'short: under 60 seconds, vertical (later)'],
      voice: 'ur-PK-AsadNeural',
      voiceRate: '+8%',
      wordsPerMinute: 175,
      visualStyle: 'Colourful night-sky/nature palette, simple SVG diagrams, Urdu Nastaliq labels (see media/renderer/src/videos/p001.tsx).',
      channels: {},
      youtubeCategory: 'Education',
    },
  },
];

export const DEFAULT_BRAND = BRANDS[0];

/** Ensures all built-in brands exist (profile defaults are only applied on first creation). */
export async function ensureBrands(db: PrismaClient) {
  for (const b of BRANDS) {
    const existing = await db.brand.findUnique({ where: { slug: b.slug } });
    if (!existing) {
      await db.brand.create({ data: { slug: b.slug, name: b.name, description: b.description, language: b.profile.language,
        tone: b.profile.tone, settings: { profile: b.profile } as never } });
    } else {
      // Fill in fields added after the brand was created, without overwriting owner edits.
      const current = (existing.settings as { profile?: Partial<BrandProfile> })?.profile ?? {};
      const merged = { ...b.profile, ...current };
      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        await db.brand.update({ where: { id: existing.id }, data: { settings: { ...(existing.settings as object), profile: merged } as never } });
      }
    }
  }
}

/** The brand new work is created for (SystemSetting "active_brand", default: Margin of Safety). */
export async function getDefaultBrand(db: PrismaClient) {
  await ensureBrands(db);
  const s = await db.systemSetting.findUnique({ where: { key: 'active_brand' } });
  const slug = typeof s?.value === 'string' ? s.value : DEFAULT_BRAND.slug;
  return (await db.brand.findUnique({ where: { slug } })) ?? (await db.brand.findUniqueOrThrow({ where: { slug: DEFAULT_BRAND.slug } }));
}

export async function setActiveBrand(db: PrismaClient, slug: string, actor: string) {
  await db.brand.findUniqueOrThrow({ where: { slug } });
  await db.systemSetting.upsert({ where: { key: 'active_brand' }, create: { key: 'active_brand', value: slug, updatedBy: actor }, update: { value: slug, updatedBy: actor } });
}

export const profileOf = (brand: { slug?: string; settings: unknown }): BrandProfile => {
  const fallback = BRANDS.find((b) => b.slug === brand.slug)?.profile ?? DEFAULT_BRAND.profile;
  return { ...fallback, ...((brand.settings as { profile?: Partial<BrandProfile> })?.profile ?? {}) } as BrandProfile;
};

/** Brand for a content project (falls back to the active brand for legacy projects). */
export async function brandForProject(db: PrismaClient, project: { brandId: string | null }) {
  return project.brandId ? db.brand.findUniqueOrThrow({ where: { id: project.brandId } }) : getDefaultBrand(db);
}
