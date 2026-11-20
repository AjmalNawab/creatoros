import Link from 'next/link';
import { api } from '@/lib/api';
import { activateBrand, saveBrand } from '@/lib/actions';
import { Btn, Card } from '@/components/ui';

type Profile = {
  niche: string; audience: string; region: string; language: 'en' | 'ur'; tone: string; pillars: string[]; avoid: string[]; rules: string[];
  formats: string[]; voice: string; voiceRate: string; wordsPerMinute: number; visualStyle: string; youtubeCategory: string;
  channels: { youtube?: { id: string; handle: string; name: string } };
};
type Brand = { id: string; slug: string; name: string; description: string | null; active: boolean; profile: Profile };

const field = 'w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700';

export default async function BrandPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const brands = await api<Brand[]>('/brands');
  const { slug } = await searchParams;
  const b = brands.find((x) => x.slug === slug) ?? brands.find((x) => x.active) ?? brands[0];
  const p = b.profile;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Brands</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {brands.map((x) => (
          <Card key={x.id} className={x.slug === b.slug ? 'ring-2 ring-zinc-400' : ''}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/brand?slug=${x.slug}`} className="font-medium hover:underline">{x.name}</Link>
                <div className="text-xs text-zinc-500">{x.profile.language === 'en' ? 'English' : 'Urdu'} · {x.profile.channels.youtube ? `YouTube: ${x.profile.channels.youtube.handle}` : 'no YouTube channel yet'}</div>
              </div>
              {x.active ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">active</span>
                : <form action={activateBrand.bind(null, x.slug)}><Btn>Make active</Btn></form>}
            </div>
            <p className="mt-2 text-sm text-zinc-500">{x.description}</p>
          </Card>
        ))}
      </div>
      <p className="text-sm text-zinc-500">New ideas and instructions are created for the <b>active</b> brand. Each project keeps its own brand, so its voice, style and channel stay consistent.</p>

      <Card title={`Edit: ${b.name}`}>
        <form action={saveBrand.bind(null, b.slug)} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">Name<input name="name" defaultValue={b.name} className={field} /></label>
          <div className="grid grid-cols-3 gap-2">
            <label className="space-y-1 text-sm">Region<input name="region" defaultValue={p.region} maxLength={2} className={field} /></label>
            <label className="space-y-1 text-sm">Language<select name="language" defaultValue={p.language} className={field}><option value="en">English</option><option value="ur">Urdu</option></select></label>
            <label className="space-y-1 text-sm">YT category<input name="youtubeCategory" defaultValue={p.youtubeCategory} className={field} /></label>
          </div>
          <label className="space-y-1 text-sm md:col-span-2">Niche<textarea name="niche" defaultValue={p.niche} rows={2} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Target audience<textarea name="audience" defaultValue={p.audience} rows={2} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Tone<input name="tone" defaultValue={p.tone} className={field} /></label>
          <label className="space-y-1 text-sm">Content pillars (one per line)<textarea name="pillars" defaultValue={p.pillars.join('\n')} rows={6} className={field} /></label>
          <label className="space-y-1 text-sm">Avoid (one per line)<textarea name="avoid" defaultValue={p.avoid.join('\n')} rows={6} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Editorial rules every agent must follow (one per line)<textarea name="rules" defaultValue={p.rules.join('\n')} rows={5} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Visual style<textarea name="visualStyle" defaultValue={p.visualStyle} rows={2} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Formats (one per line)<textarea name="formats" defaultValue={p.formats.join('\n')} rows={2} className={field} /></label>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <label className="space-y-1 text-sm">Voice<input name="voice" defaultValue={p.voice} className={field} /></label>
            <label className="space-y-1 text-sm">Voice speed<input name="voiceRate" defaultValue={p.voiceRate} className={field} /></label>
            <label className="space-y-1 text-sm">Words / minute<input name="wpm" type="number" defaultValue={p.wordsPerMinute} className={field} /></label>
          </div>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <label className="space-y-1 text-sm">YouTube channel ID<input name="ytId" defaultValue={p.channels.youtube?.id ?? ''} placeholder="UC…" className={field} /></label>
            <label className="space-y-1 text-sm">Handle<input name="ytHandle" defaultValue={p.channels.youtube?.handle ?? ''} className={field} /></label>
            <label className="space-y-1 text-sm">Channel name<input name="ytName" defaultValue={p.channels.youtube?.name ?? ''} className={field} /></label>
          </div>
          <div className="md:col-span-2"><Btn tone="primary">Save {b.name}</Btn></div>
        </form>
      </Card>
    </div>
  );
}
