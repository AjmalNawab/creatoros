import { api } from '@/lib/api';
import { saveBrand } from '@/lib/actions';
import { Btn, Card } from '@/components/ui';

type Brand = { id: string; name: string; profile: { niche: string; audience: string; region: string; language: string; tone: string; pillars: string[]; avoid: string[]; formats: string[] } };

const field = 'w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700';

export default async function BrandPage() {
  const b = await api<Brand>('/brand');
  const p = b.profile;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Brand profile</h1>
      <Card>
        <p className="mb-4 text-sm text-zinc-500">Who the channel is for. The Trend and Strategy agents score every idea against this, and research and scripts follow it.</p>
        <form action={saveBrand} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">Name<input name="name" defaultValue={b.name} className={field} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-sm">Region (country code)<input name="region" defaultValue={p.region} maxLength={2} className={field} /></label>
            <label className="space-y-1 text-sm">Language<input name="language" defaultValue={p.language} className={field} /></label>
          </div>
          <label className="space-y-1 text-sm md:col-span-2">Niche<textarea name="niche" defaultValue={p.niche} rows={2} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Target audience<textarea name="audience" defaultValue={p.audience} rows={2} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Tone<input name="tone" defaultValue={p.tone} className={field} /></label>
          <label className="space-y-1 text-sm">Content pillars (one per line)<textarea name="pillars" defaultValue={p.pillars.join('\n')} rows={6} className={field} /></label>
          <label className="space-y-1 text-sm">Avoid (one per line)<textarea name="avoid" defaultValue={p.avoid.join('\n')} rows={6} className={field} /></label>
          <label className="space-y-1 text-sm md:col-span-2">Formats (one per line)<textarea name="formats" defaultValue={p.formats.join('\n')} rows={2} className={field} /></label>
          <div className="md:col-span-2"><Btn tone="primary">Save profile</Btn></div>
        </form>
      </Card>
    </div>
  );
}
