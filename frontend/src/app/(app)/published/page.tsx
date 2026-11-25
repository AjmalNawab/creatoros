import { BarChart3, Eye, Facebook, Heart, Instagram, MessageCircle, Music2, RefreshCw, Share2, Youtube, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { recordPostStats, refreshYouTubeStats } from '@/lib/actions';
import { Btn, Card, EmptyState, PageHeader, Stat, ago, inputCls } from '@/components/ui';

type Metric = { views: number | null; likes: number | null; comments: number | null; shares: number | null; reach: number | null; source: string; capturedAt: string };
type Post = { id: string; platform: string; url: string | null; status: string; publishedAt: string; title: string | null; latest: Metric | null; previous: Metric | null };
type Group = { project: { id: string; slug: string; title: string }; title: string; firstPublishedAt: string; posts: Post[] };

const COLS: { id: string; name: string; icon: LucideIcon; cls: string; connected: boolean }[] = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, cls: 'text-blue-600', connected: true },
  { id: 'youtube', name: 'YouTube', icon: Youtube, cls: 'text-red-500', connected: true },
  { id: 'tiktok', name: 'TikTok', icon: Music2, cls: 'text-zinc-900 dark:text-white', connected: true },
  { id: 'instagram', name: 'Instagram', icon: Instagram, cls: 'text-pink-500', connected: false },
];
const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '–' : v >= 10000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString('en'));
const sum = (posts: Post[], k: keyof Pick<Metric, 'views' | 'likes' | 'comments' | 'shares'>) => {
  const vals = posts.map((p) => p.latest?.[k]).filter((v): v is number => typeof v === 'number');
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
};

function Delta({ now, before }: { now: number | null | undefined; before: number | null | undefined }) {
  if (typeof now !== 'number' || typeof before !== 'number' || now === before) return null;
  return <span className={now > before ? 'text-emerald-600' : 'text-rose-500'}> {now > before ? '+' : ''}{now - before}</span>;
}

function PostCell({ post }: { post?: Post }) {
  if (!post) return <span className="text-xs text-zinc-300 dark:text-zinc-600">not posted</span>;
  const l = post.latest, p = post.previous;
  return (
    <div className="space-y-1">
      {post.url ? <a href={post.url} target="_blank" className="text-xs font-medium text-sky-600 hover:underline">Open post ↗</a> : <span className="text-xs">no link</span>}
      {l ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
          <span title="views"><Eye className="mr-1 inline size-3" />{fmt(l.views)}<Delta now={l.views} before={p?.views} /></span>
          <span title="likes"><Heart className="mr-1 inline size-3" />{fmt(l.likes)}<Delta now={l.likes} before={p?.likes} /></span>
          <span title="comments" className={l.comments ? 'font-semibold text-violet-600' : ''}><MessageCircle className="mr-1 inline size-3" />{fmt(l.comments)}<Delta now={l.comments} before={p?.comments} /></span>
          <span title="shares"><Share2 className="mr-1 inline size-3" />{fmt(l.shares)}<Delta now={l.shares} before={p?.shares} /></span>
          <span className="col-span-2 text-[10px] text-zinc-400">checked {ago(l.capturedAt)}{l.reach !== null ? ` · reach ${fmt(l.reach)}` : ''}</span>
        </div>
      ) : <div className="text-[11px] text-zinc-400">stats not checked yet</div>}
    </div>
  );
}

export default async function PublishedPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const [{ msg }, groups] = await Promise.all([searchParams, api<Group[]>('/published')]);
  const all = groups.flatMap((g) => g.posts);
  const perPlatform = COLS.map((c) => ({ ...c, posts: all.filter((p) => p.platform === c.id) }));
  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Published & stats"
        description="Every video, where it was posted, and how it is doing. Numbers are dated snapshots: “–” means not available or not checked yet (not zero)."
        actions={<form action={refreshYouTubeStats}><Btn icon={RefreshCw} size="sm">Update YouTube stats</Btn></form>} />
      {msg && <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">{msg}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {perPlatform.map((c) => (
          <Stat key={c.id} label={c.name} icon={c.icon} value={c.connected ? `${c.posts.length} post${c.posts.length === 1 ? '' : 's'}` : 'Not connected'}
            hint={c.connected ? `${fmt(sum(c.posts, 'views'))} views · ${fmt(sum(c.posts, 'comments'))} comments` : 'Not set up yet'} />
        ))}
      </div>

      <Card title="Videos" description="One row per video; one column per platform." padded={false}>
        {groups.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                  <th className="px-5 py-2 font-medium">Video</th>
                  {COLS.map((c) => <th key={c.id} className="px-3 py-2 font-medium"><c.icon className={`mr-1 inline size-3.5 ${c.cls}`} />{c.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {groups.map((g) => (
                  <tr key={g.project.id} className="align-top">
                    <td className="max-w-xs px-5 py-3">
                      <div dir="auto" className="font-medium leading-snug">{g.title}</div>
                      <div className="mt-0.5 text-xs text-zinc-400">{g.project.slug.slice(0, 3)} · first posted {ago(g.firstPublishedAt)}</div>
                    </td>
                    {COLS.map((c) => (
                      <td key={c.id} className="px-3 py-3">
                        {c.connected ? <PostCell post={g.posts.find((p) => p.platform === c.id)} /> : <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-5"><EmptyState icon={BarChart3} title="Nothing published yet">Posts appear here with their links once published.</EmptyState></div>}
      </Card>

      <Card title="Enter numbers by hand" description="For Facebook or TikTok, if you read the numbers yourself. Leave a box empty if the platform doesn't show it. (Or ask Claude Code to “check stats”.)">
        <form action={recordPostStats} className="grid gap-3 sm:grid-cols-[2fr_repeat(5,1fr)_auto] sm:items-end">
          <label className="text-xs text-zinc-500">Post
            <select name="postId" required className={inputCls}>
              {groups.flatMap((g) => g.posts.map((p) => <option key={p.id} value={p.id}>{p.platform} · {g.title.slice(0, 50)}</option>))}
            </select>
          </label>
          {(['views', 'likes', 'comments', 'shares', 'reach'] as const).map((k) => (
            <label key={k} className="text-xs capitalize text-zinc-500">{k}<input name={k} inputMode="numeric" pattern="[0-9,]*" className={inputCls} /></label>
          ))}
          <Btn tone="primary">Save</Btn>
        </form>
      </Card>
    </div>
  );
}
