import Link from 'next/link';
import { Building2, Check, Save, Youtube } from 'lucide-react';
import { api } from '@/lib/api';
import { activateBrand, saveBrand } from '@/lib/actions';
import { Badge, Btn, Card, PageHeader, Pill, inputCls, textareaCls } from '@/components/ui';

type Profile = {
  niche: string; audience: string; region: string; language: 'en' | 'ur'; tone: string; pillars: string[]; avoid: string[]; rules: string[];
  formats: string[]; voice: string; voiceRate: string; wordsPerMinute: number; visualStyle: string; youtubeCategory: string; youtubePlaylist?: string;
  channels: { youtube?: { id: string; handle: string; name: string } };
};
type Brand = { id: string; slug: string; name: string; description: string | null; active: boolean; profile: Profile };


export default async function BrandPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const brands = await api<Brand[]>('/brands');
  const { slug } = await searchParams;
  const b = brands.find((x) => x.slug === slug) ?? brands.find((x) => x.active) ?? brands[0];
  const p = b.profile;
  return (
    <div className="space-y-6">
      <PageHeader icon={Building2} title="Series" description="Each series has its own language, voice, look and editorial rules. Several series can share one YouTube channel; each gets its own playlist. The active series is the default for new work." />
      <div className="grid gap-3 md:grid-cols-2">
        {brands.map((x) => (
          <Card key={x.id} className={x.slug === b.slug ? 'ring-2 ring-orange-400/60' : ''}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/brand?slug=${x.slug}`} className="font-semibold hover:underline">{x.name}</Link>
                <div className="mt-1 flex flex-wrap gap-1.5"><Pill>{x.profile.language === 'en' ? 'English' : 'Urdu'}</Pill>{x.profile.channels.youtube ? <Pill tone="danger"><Youtube className="size-3" />{x.profile.channels.youtube.handle}</Pill> : <Pill>no channel</Pill>}</div>
              </div>
              {x.active ? <Badge status="COMPLETED" label="Active" />
                : <form action={activateBrand.bind(null, x.slug)}><Btn size="sm" icon={Check}>Make active</Btn></form>}
            </div>
            <p className="mt-2 text-sm text-zinc-500">{x.description}</p>
          </Card>
        ))}
      </div>

      <Card title={`Edit: ${b.name}`}>
        <form action={saveBrand.bind(null, b.slug)} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Name<input className={inputCls} name="name" defaultValue={b.name} /></label>
          <div className="grid grid-cols-3 gap-2">
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Region<input className={inputCls} name="region" defaultValue={p.region} maxLength={2} /></label>
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Language<select className={inputCls} name="language" defaultValue={p.language}><option value="en">English</option><option value="ur">Urdu</option></select></label>
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">YT category<input className={inputCls} name="youtubeCategory" defaultValue={p.youtubeCategory} /></label>
          </div>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 md:col-span-2">Niche<textarea className={textareaCls} name="niche" defaultValue={p.niche} rows={2} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 md:col-span-2">Target audience<textarea className={textareaCls} name="audience" defaultValue={p.audience} rows={2} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 md:col-span-2">Tone<input className={inputCls} name="tone" defaultValue={p.tone} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Content pillars (one per line)<textarea className={textareaCls} name="pillars" defaultValue={p.pillars.join('\n')} rows={6} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Avoid (one per line)<textarea className={textareaCls} name="avoid" defaultValue={p.avoid.join('\n')} rows={6} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 md:col-span-2">Editorial rules every agent must follow (one per line)<textarea className={textareaCls} name="rules" defaultValue={p.rules.join('\n')} rows={5} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 md:col-span-2">Visual style<textarea className={textareaCls} name="visualStyle" defaultValue={p.visualStyle} rows={2} /></label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 md:col-span-2">Formats (one per line)<textarea className={textareaCls} name="formats" defaultValue={p.formats.join('\n')} rows={2} /></label>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Voice<input className={inputCls} name="voice" defaultValue={p.voice} /></label>
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Voice speed<input className={inputCls} name="voiceRate" defaultValue={p.voiceRate} /></label>
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Words / minute<input className={inputCls} name="wpm" type="number" defaultValue={p.wordsPerMinute} /></label>
          </div>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">YouTube channel ID<input className={inputCls} name="ytId" defaultValue={p.channels.youtube?.id ?? ''} placeholder="UC…" /></label>
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Handle<input className={inputCls} name="ytHandle" defaultValue={p.channels.youtube?.handle ?? ''} /></label>
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">Channel name<input className={inputCls} name="ytName" defaultValue={p.channels.youtube?.name ?? ''} /></label>
          </div>
          <div className="md:col-span-2">
            <label className="space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">YouTube playlist for this series<input className={inputCls} name="youtubePlaylist" defaultValue={p.youtubePlaylist ?? ''} placeholder="e.g. Engineering Stories (English)" /></label>
          </div>
          <div className="md:col-span-2"><Btn tone="accent" icon={Save}>Save {b.name}</Btn></div>
        </form>
      </Card>
    </div>
  );
}
