import { ArrowRight, Radio } from 'lucide-react';
import { api } from '@/lib/api';
import { PLATFORM_NAME } from '@/lib/labels';
import { Badge, LinkBtn, PageHeader } from '@/components/ui';
import { PlatformIcon } from '@/components/platform-icon';

type Platform = { id: string; name: string; status: 'active' | 'planned'; route: string; notes: string; account: { name: string; handle?: string; url: string } | null };

export default async function PlatformsPage() {
  const platforms = await api<Platform[]>('/platforms');
  const order = (p: Platform) => (p.status === 'active' ? 0 : 1);
  return (
    <div className="space-y-6">
      <PageHeader icon={Radio} title="Platforms" description="Each video is made once, then adapted for every platform you choose: its own caption, hashtags and settings, each approved by you."
        actions={<LinkBtn href="/published" size="sm">See what&apos;s posted<ArrowRight className="size-3.5" /></LinkBtn>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...platforms].sort((a, b) => order(a) - order(b)).map((p) => (
          <div key={p.id} className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900 ${p.status === 'active' ? 'border-zinc-200/80 dark:border-zinc-800' : 'border-dashed border-zinc-300 opacity-80 dark:border-zinc-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"><PlatformIcon id={p.id} className="size-5" /></div><div className="font-semibold">{PLATFORM_NAME[p.id] ?? p.name}</div></div>
              <Badge status={p.status === 'active' ? 'COMPLETED' : 'PENDING'} label={p.status === 'active' ? 'In use' : 'Coming later'} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{p.notes}</p>
            <div className="mt-3 text-xs text-zinc-500">
              {p.account ? <>Account: <a href={p.account.url} target="_blank" className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">{p.account.name}{p.account.handle ? ` (${p.account.handle})` : ''}</a></> : p.status === 'active' ? 'Account: set per series' : 'No account yet'}
              {' · '}{p.route === 'browser' ? 'Posted by Claude in your Chrome' : 'Posted through the official app connection'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
