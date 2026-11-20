import type { PrismaClient } from '@creatoros/db';

/** Brand profile = who we make content for. Every idea is scored against it. Editable in the dashboard. */
export interface BrandProfile {
  niche: string;
  audience: string;
  region: string;          // ISO country for trends, e.g. "PK"
  language: string;        // "ur"
  tone: string;
  pillars: string[];       // recurring content themes
  avoid: string[];         // topics/styles we never do
  formats: string[];       // e.g. ["long 1-3 min explainer", "short <60s"]
}

export const DEFAULT_BRAND = {
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
    formats: ['long: 1-3 minute animated explainer', 'short: under 60 seconds, vertical (later)'],
  } satisfies BrandProfile,
};

export async function getDefaultBrand(db: PrismaClient) {
  const existing = await db.brand.findUnique({ where: { slug: DEFAULT_BRAND.slug } });
  if (existing) return existing;
  return db.brand.create({ data: { slug: DEFAULT_BRAND.slug, name: DEFAULT_BRAND.name, description: DEFAULT_BRAND.description,
    language: 'ur', tone: DEFAULT_BRAND.profile.tone, settings: { profile: DEFAULT_BRAND.profile } as never } });
}

export const profileOf = (brand: { settings: unknown }) =>
  ((brand.settings as { profile?: BrandProfile })?.profile ?? DEFAULT_BRAND.profile);
