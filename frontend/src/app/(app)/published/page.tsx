import Link from 'next/link';
import { BarChart3, ExternalLink, Eye, Heart, MessageCircle, Plus, RefreshCw, Share2 } from 'lucide-react';
import { api } from '@/lib/api';
import { recordPostStats, refreshYouTubeStats } from '@/lib/actions';
import { PLATFORM_NAME } from '@/lib/labels';
import { Btn, Card, EmptyState, LinkBtn, PageHeader, Stat, ago, inputCls } from '@/components/ui';
import { PlatformIcon, PLATFORM_ICON } from '@/components/platform-icon';
import { VideoTitle } from '@/components/video-title';

type Metric = { views: number | null; likes: number | null; comments: number | null; shares: number | null; reach: number | null; source: string; capturedAt: string };
type Post = { id: string; platform: string; url: string | null; status: string; publishedAt: string; title: string | null; latest: Metric | null; previous: Metric | null };
type Group = { project: { id: string; slug: string; title: string }; title: string; firstPublishedAt: string; posts: Post[] };
type Platform = { id: string; name: string; status: string };

const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '–' : v >= 10000 ? `${(v / 1000).toFixed(1)}k` : v.toLocaleString('en'));
const sum = (posts: Post[], k: 'views' | 'likes' | 'comments' | 'shares') => {
  const vals = posts.map((p) => p.latest?.[k]).filter((v): v is number => typeof v === 'number');
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
};

function Delta({ now, before }: { now: number | null | undefined; before: number | null | undefined }) {
  if (typeof now !== 'number' || typeof before !== 'number' || now === before) return null;
  return <span title="since the previous check" className={now > before ? 'text-emerald-600' : 'text-rose-500'}> {now > before ? '+' : ''}{now - before}</span>;
}

function Numbers({ post }: { post: Post }) {
  const l = post.latest, p = post.previous;
  if (!l) return <div className="text-[11px] text-zinc-400">stats not checked yet</div>;
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
        <span title="views"><Eye className="mr-1 inline size-3" />{fmt(l.views)}<Delta now={l.views} before={p?.views} /></span>
        <span title="likes"><Heart className="mr-1 inline size-3" />{fmt(l.likes)}<Delta now={l.likes} before={p?.likes} /></span>
        <span title="comments" className={l.comments ? 'font-semibold text-violet-600' : ''}><MessageCircle className="mr-1 inline size-3" />{fmt(l.comments)}<Delta now={l.comments} before={p?.comments} /></span>
        <span title="shares"><Share2 className="mr-1 inline size-3" />{fmt(l.shares)}<Delta now={l.shares} before={p?.shares} /></span>
      </div>
      <div className="text-[10px] text-zinc-400">checked {ago(l.capturedAt)}{l.reach !== null ? ` · reached ${fmt(l.reach)}` : ''}</div>
    </div>
  );
}

function Cell({ post, projectId }: { post?: Post; projectId: string }) {
  if (!post) return <Link href={`/content/${projectId}`} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"><Plus className="size-3" />Post here</Link>;
  return (
    <div className="space-y-1">
      {post.url ? <a href={post.url} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline">Open post<ExternalLink className="size-3" /></a> : <span className="text-xs">no link</span>}
      <Numbers post={post} />
    </div>
  );
}

export default async function PublishedPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const [{ msg }, groups, platforms] = await Promise.all([searchParams, api<Group[]>('/published'), api<Platform[]>('/platforms')]);
  const all = groups.flatMap((g) => g.posts);
  // Columns: platforms you post to (active), plus any platform that already has posts.
  const cols = Object.keys(PLATFORM_ICON).filter((id) => PLATFORM_NAME[id] && (platforms.some((p) => p.id === id && p.status === 'active') || all.some((p) => p.platform === id)));

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Published & stats"
        description="Every video, where it was posted, and how it is doing. “–” means not checked yet (not zero). Say “check stats” to Claude to update Facebook and TikTok."
        actions={<form action={refreshYouTubeStats}><Btn icon={RefreshCw} size="sm" pendingLabel="Updating…">Update YouTube stats</Btn></form>} />
      {msg && <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">{msg}</div>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cols.map((id) => {
          const posts = all.filter((p) => p.platform === id);
          return <Stat key={id} label={PLATFORM_NAME[id]} icon={PLATFORM_ICON[id][0]} value={`${posts.length} post${posts.length === 1 ? '' : 's'}`} hint={`${fmt(sum(posts, 'views'))} views · ${fmt(sum(posts, 'comments'))} comments`} />;
        })}
      </div>

      {!groups.length && <EmptyState icon={BarChart3} title="Nothing published yet">Posts appear here with their links once published.</EmptyState>}

      {/* Phones and tablets: one card per video */}
      <div className="space-y-3 lg:hidden">
        {groups.map((g) => (
          <Card key={g.project.id} padded={false}>
            <Link href={`/content/${g.project.id}`} className="block border-b border-zinc-100 px-4 py-3 dark:border-zinc-800"><VideoTitle title={g.title} size="sm" className="font-medium" /></Link>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {g.posts.map((p) => (
                <li key={p.id} className="flex items-start gap-3 px-4 py-3">
                  <PlatformIcon id={p.platform} className="mt-0.5 size-4" />
                  <div className="min-w-0 flex-1"><Numbers post={p} /></div>
                  {p.url && <LinkBtn href={p.url} external size="sm" tone="ghost" icon={ExternalLink}>Open</LinkBtn>}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Wide screens: video × platform table */}
      {groups.length > 0 && (
        <Card title="Videos" description="One row per video; one column per platform." padded={false} className="hidden lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                <th className="px-5 py-2 font-medium">Video</th>
                {cols.map((id) => <th key={id} className="px-3 py-2 font-medium"><PlatformIcon id={id} className="mr-1 inline size-3.5" />{PLATFORM_NAME[id]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {groups.map((g) => (
                <tr key={g.project.id} className="align-top">
                  <td className="max-w-xs px-5 py-3">
                    <Link href={`/content/${g.project.id}`} className="hover:underline"><VideoTitle title={g.title} size="sm" className="font-medium" /></Link>
                    <div className="mt-0.5 text-xs text-zinc-400">first posted {ago(g.firstPublishedAt)}</div>
                  </td>
                  {cols.map((id) => <td key={id} className="px-3 py-3"><Cell post={g.posts.find((p) => p.platform === id)} projectId={g.project.id} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {all.length > 0 && (
        <Card title="Enter numbers by hand" description="If you read the numbers yourself. Leave a box empty if the platform doesn't show it.">
          <form action={recordPostStats} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_repeat(5,1fr)_auto] lg:items-end">
            <label className="text-xs text-zinc-500 sm:col-span-2 lg:col-span-1">Post
              <select name="postId" required className={inputCls}>
                {groups.flatMap((g) => g.posts.map((p) => <option key={p.id} value={p.id}>{PLATFORM_NAME[p.platform] ?? p.platform} · {g.title.split(' | ').pop()?.slice(0, 48)}</option>))}
              </select>
            </label>
            {(['views', 'likes', 'comments', 'shares', 'reach'] as const).map((k) => (
              <label key={k} className="text-xs capitalize text-zinc-500">{k}<input name={k} inputMode="numeric" pattern="[0-9,]*" className={inputCls} /></label>
            ))}
            <Btn tone="primary" pendingLabel="Saving…" className="sm:col-span-2 lg:col-span-1">Save</Btn>
          </form>
        </Card>
      )}
    </div>
  );
}
