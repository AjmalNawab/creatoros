import { Facebook, Instagram, Linkedin, Music2, Radio, Youtube, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Card, EmptyState, PageHeader, Pill, ago } from '@/components/ui';

type Platform = { id: string; name: string; status: 'active' | 'planned'; route: string; notes: string; agents: string[] };
type Post = { id: string; platform: string; url: string | null; status: string; visibility: string | null; publishedAt: string; contentProject: { title: string; slug: string } };
const ICON: Record<string, [LucideIcon, string]> = {
  youtube: [Youtube, 'text-red-500 bg-red-50 dark:bg-red-950/40'], facebook: [Facebook, 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'],
  instagram: [Instagram, 'text-pink-500 bg-pink-50 dark:bg-pink-950/40'], tiktok: [Music2, 'text-zinc-900 bg-zinc-100 dark:text-white dark:bg-zinc-800'],
  linkedin: [Linkedin, 'text-sky-700 bg-sky-50 dark:bg-sky-950/40'],
};

export default async function PlatformsPage() {
  const [platforms, posts] = await Promise.all([api<Platform[]>('/platforms'), api<Post[]>('/posts')]);
  return (
    <div className="space-y-6">
      <PageHeader icon={Radio} title="Platforms" description="Each platform has its own agents and folder (backend/agents/src/platforms/…). Production makes the video once; platform agents adapt and publish it." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {platforms.map((p) => {
          const [Icon, cls] = ICON[p.id] ?? [Radio, 'bg-zinc-100'];
          return (
            <div key={p.id} className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900 ${p.status === 'active' ? 'border-zinc-200/80 dark:border-zinc-800' : 'border-dashed border-zinc-300 opacity-80 dark:border-zinc-700'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className={`grid size-10 place-items-center rounded-xl ${cls}`}><Icon className="size-5" /></div><div className="font-semibold">{p.name}</div></div>
                <Badge status={p.status === 'active' ? 'COMPLETED' : 'PENDING'} label={p.status === 'active' ? 'Active' : 'Planned'} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{p.notes}</p>
              <div className="mt-3 flex flex-wrap gap-1.5"><Pill>{p.route === 'browser' ? 'Your Chrome (DevTools)' : 'Official API'}</Pill>{p.agents.map((a) => <Pill key={a}>{a}</Pill>)}</div>
            </div>
          );
        })}
      </div>
      <Card title="Published" padded={false}>
        {posts.length ? (
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {posts.map((p) => {
              const [Icon] = ICON[p.platform] ?? [Radio];
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <Icon className="size-4 text-zinc-500" /><span dir="auto" className="font-medium">{p.contentProject.title}</span>
                  {p.url && <a href={p.url} target="_blank" className="truncate text-sky-600 hover:underline">{p.url}</a>}
                  <span className="ml-auto text-xs text-zinc-400">{p.visibility} · {ago(p.publishedAt)}</span>
                </li>
              );
            })}
          </ul>
        ) : <div className="p-5"><EmptyState icon={Youtube} title="Nothing published yet">Your first upload will show up here with its link.</EmptyState></div>}
      </Card>
    </div>
  );
}
