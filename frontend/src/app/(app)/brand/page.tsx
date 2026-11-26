import Link from 'next/link';
import { Building2, Check, CheckCircle2, ChevronDown, ExternalLink, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { activateBrand, saveBrand } from '@/lib/actions';
import { PLATFORM_NAME } from '@/lib/labels';
import { Badge, Btn, Card, EmptyState, LinkBtn, PageHeader, Pill, inputCls, textareaCls } from '@/components/ui';
import { PlatformIcon } from '@/components/platform-icon';

type Profile = {
  niche: string; audience: string; region: string; language: 'en' | 'ur'; tone: string; pillars: string[]; avoid: string[]; rules: string[];
  formats: string[]; voice: string; voiceRate: string; wordsPerMinute: number; visualStyle: string; youtubeCategory: string; youtubePlaylist?: string;
  channels: { youtube?: { id: string; handle: string; name: string } };
};
type Brand = { id: string; slug: string; name: string; description: string | null; active: boolean; profile: Profile };
type Platform = { id: string; name: string; status: string; account: { name: string; handle?: string; url: string } | null };

const label = 'space-y-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400';
const help = 'block text-[11px] font-normal text-zinc-400';

export default async function SeriesPage({ searchParams }: { searchParams: Promise<{ slug?: string; saved?: string }> }) {
  const [brands, platforms, { slug, saved }] = await Promise.all([api<Brand[]>('/brands'), api<Platform[]>('/platforms'), searchParams]);
  const b = brands.find((x) => x.slug === slug) ?? brands.find((x) => x.active) ?? brands[0];
  if (!b) return <EmptyState icon={Building2} title="No series yet">Ask Claude Code to set one up.</EmptyState>;
  const p = b.profile;
  const yt = brands.map((x) => x.profile.channels.youtube).find(Boolean);
  const accounts = [
    { id: 'youtube', connected: !!yt, name: yt?.name, handle: yt?.handle, url: yt ? `https://www.youtube.com/${yt.handle}` : null, note: 'Shared by both series; each series has its own playlist.' },
    ...['facebook', 'tiktok', 'instagram', 'snapchat'].map((id) => {
      const pl = platforms.find((x) => x.id === id);
      return { id, connected: !!pl?.account, name: pl?.account?.name, handle: pl?.account?.handle, url: pl?.account?.url ?? null, note: pl?.account ? (id === 'facebook' ? 'Posts as the Page, not your profile.' : 'Separate account, not linked to you.') : 'Not set up yet.' };
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader icon={Building2} title="Series & accounts" description="Where your videos go, and how each series sounds and looks." />
      {saved && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><CheckCircle2 className="size-4" />Saved. New videos use these settings.</div>}

      <Card title="Your accounts" description="Claude posts only to these accounts, in your Chrome, after you approve." padded={false}>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-5 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"><PlatformIcon id={a.id} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{PLATFORM_NAME[a.id]}{a.connected && <span className="font-normal text-zinc-500"> · {a.name}{a.handle ? ` (${a.handle})` : ''}</span>}</div>
                <div className="text-xs text-zinc-500">{a.note}</div>
              </div>
              {a.connected ? <><Badge status="COMPLETED" label="Connected" />{a.url && <LinkBtn href={a.url} external size="sm" tone="ghost" icon={ExternalLink}>Open</LinkBtn>}</> : <Badge status="PENDING" label="Not connected" />}
            </li>
          ))}
        </ul>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Series</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {brands.map((x) => (
            <Card key={x.id} className={x.slug === b.slug ? 'ring-2 ring-orange-400/60' : ''}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/brand?slug=${x.slug}`} className="font-semibold hover:underline">{x.name}</Link>
                  <div className="mt-1 flex flex-wrap gap-1.5"><Pill>{x.profile.language === 'en' ? 'English' : 'Urdu'}</Pill>{x.profile.youtubePlaylist && <Pill>Playlist: {x.profile.youtubePlaylist}</Pill>}</div>
                </div>
                {x.active ? <Badge status="COMPLETED" label="Default" />
                  : <form action={activateBrand.bind(null, x.slug)}><Btn size="sm" icon={Check} pendingLabel="Saving…">Make default</Btn></form>}
              </div>
              <p className="mt-2 text-sm text-zinc-500">{x.description}</p>
              {x.slug !== b.slug && <LinkBtn href={`/brand?slug=${x.slug}`} size="sm" tone="soft" className="mt-3">Edit this series</LinkBtn>}
            </Card>
          ))}
        </div>
      </div>

      <Card title={`Edit: ${b.name}`} description="These settings guide Claude when it researches, writes and designs videos for this series.">
        <form action={saveBrand.bind(null, b.slug)} className="grid gap-4 md:grid-cols-2">
          <label className={label}>Series name<input className={inputCls} name="name" defaultValue={b.name} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className={label}>Language<select className={inputCls} name="language" defaultValue={p.language}><option value="en">English</option><option value="ur">Urdu</option></select></label>
            <label className={label}>Country<input className={inputCls} name="region" defaultValue={p.region} maxLength={2} /><span className={help}>2 letters, e.g. PK</span></label>
          </div>
          <label className={`${label} md:col-span-2`}>What the series is about<textarea className={textareaCls} name="niche" defaultValue={p.niche} rows={2} /></label>
          <label className={`${label} md:col-span-2`}>Who it is for<textarea className={textareaCls} name="audience" defaultValue={p.audience} rows={2} /></label>
          <label className={`${label} md:col-span-2`}>Tone of voice<input className={inputCls} name="tone" defaultValue={p.tone} /></label>
          <label className={label}>Main topics<textarea className={textareaCls} name="pillars" defaultValue={p.pillars.join('\n')} rows={6} /><span className={help}>One per line</span></label>
          <label className={label}>Never cover<textarea className={textareaCls} name="avoid" defaultValue={p.avoid.join('\n')} rows={6} /><span className={help}>One per line</span></label>
          <label className={`${label} md:col-span-2`}>Rules Claude must always follow<textarea className={textareaCls} name="rules" defaultValue={p.rules.join('\n')} rows={5} /><span className={help}>One per line</span></label>
          <label className={`${label} md:col-span-2`}>Look of the videos<textarea className={textareaCls} name="visualStyle" defaultValue={p.visualStyle} rows={2} /></label>
          <label className={`${label} md:col-span-2`}>YouTube playlist for this series<input className={inputCls} name="youtubePlaylist" defaultValue={p.youtubePlaylist ?? ''} placeholder="e.g. Engineering Stories (English)" /></label>

          <details className="group md:col-span-2">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><ChevronDown className="size-3.5 transition group-open:rotate-180" />Advanced: voice, pace and YouTube channel</summary>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <label className={label}>Narrator voice<input className={inputCls} name="voice" defaultValue={p.voice} /></label>
              <label className={label}>Voice speed<input className={inputCls} name="voiceRate" defaultValue={p.voiceRate} /><span className={help}>e.g. -8% is slightly slower</span></label>
              <label className={label}>Speaking pace<input className={inputCls} name="wpm" type="number" defaultValue={p.wordsPerMinute} /><span className={help}>Words per minute (sets script length)</span></label>
              <label className={label}>Video formats<textarea className={textareaCls} name="formats" defaultValue={p.formats.join('\n')} rows={2} /></label>
              <label className={label}>YouTube category<input className={inputCls} name="youtubeCategory" defaultValue={p.youtubeCategory} /></label>
              <div />
              <label className={label}>YouTube channel ID<input className={inputCls} name="ytId" defaultValue={p.channels.youtube?.id ?? ''} placeholder="UC…" /></label>
              <label className={label}>Channel handle<input className={inputCls} name="ytHandle" defaultValue={p.channels.youtube?.handle ?? ''} /></label>
              <label className={label}>Channel name<input className={inputCls} name="ytName" defaultValue={p.channels.youtube?.name ?? ''} /></label>
            </div>
          </details>
          <div className="md:col-span-2"><Btn tone="accent" icon={Save} pendingLabel="Saving…">Save changes</Btn></div>
        </form>
      </Card>
    </div>
  );
}
