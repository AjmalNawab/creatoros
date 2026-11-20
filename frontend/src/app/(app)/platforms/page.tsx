import { api } from '@/lib/api';
import { Card, ago } from '@/components/ui';

type Platform = { id: string; name: string; status: 'active' | 'planned'; route: string; notes: string; agents: string[] };
type Post = { id: string; platform: string; url: string | null; status: string; visibility: string | null; publishedAt: string; contentProject: { title: string; slug: string } };

export default async function PlatformsPage() {
  const [platforms, posts] = await Promise.all([api<Platform[]>('/platforms'), api<Post[]>('/posts')]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Platforms</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {platforms.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.name}</div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>{p.status}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{p.notes}</p>
            <div className="mt-2 text-xs text-zinc-500">Route: <span className="font-mono">{p.route === 'browser' ? "your Chrome (DevTools)" : 'official API'}</span>{p.agents.length ? <> · agents: <span className="font-mono">{p.agents.join(', ')}</span></> : null} · folder: <span className="font-mono">backend/agents/src/platforms/{p.id}/</span></div>
          </Card>
        ))}
      </div>
      <Card title="Published posts">
        <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
              <span><span className="font-medium capitalize">{p.platform}</span> · <span dir="auto">{p.contentProject.title}</span> {p.url && <a href={p.url} target="_blank" className="ml-2 text-sky-600 hover:underline">{p.url}</a>}</span>
              <span className="text-xs text-zinc-500">{p.status} · {p.visibility} · {ago(p.publishedAt)}</span>
            </li>
          ))}
          {!posts.length && <li className="py-2 text-zinc-500">Nothing published yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
