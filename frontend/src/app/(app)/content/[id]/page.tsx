import Link from 'next/link';
import { Archive, ArchiveRestore, ArrowLeft, ArrowRight, AudioLines, ChevronDown, Download, ExternalLink, Eye, FileText, FolderOpen, Heart, Images, MessageCircle, Plus, RotateCw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { addPlatformToProject, retryTask, setArchived } from '@/lib/actions';
import { approvalWhat, PLATFORM_NAME } from '@/lib/labels';
import { Btn, Card, LinkBtn, Pill, ago } from '@/components/ui';
import { CheckRow, Pipeline, ScriptView, VideoPlayer, media, stepLabel } from '@/components/content';
import { PlatformIcon } from '@/components/platform-icon';
import { VideoTitle } from '@/components/video-title';

type Task = {
  id: string; agentId: string; type: string; status: string; lastError: string | null; output: Record<string, unknown> | null;
  approvals: { id: string; decision: string; feedback: string | null }[];
};
type Metric = { views: number | null; likes: number | null; comments: number | null; capturedAt: string };
type Post = { id: string; platform: string; url: string | null; status: string; visibility: string | null; publishedAt: string; metrics: Metric[] };
type Project = {
  id: string; slug: string; title: string; displayTitle: string; language: string; createdAt: string; archivedAt: string | null;
  params: { format?: string; platforms?: string[] }; tasks: Task[]; posts: Post[];
  files: { path: string; bytes: number }[]; video: string | null;
  brand: { name: string; slug: string; youtube: { handle: string } | null } | null;
};
type Platform = { id: string; name: string; status: string };

const num = (s: string) => parseInt(s.match(/(\d+)\.\w+$/)?.[1] ?? '0', 10);
const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '–' : v.toLocaleString('en'));

/** One platform's row: posted (with link and numbers), or what is needed to get there. */
function PlatformRow({ id, p, active }: { id: string; p: Project; active: boolean }) {
  const pkg = p.tasks.find((t) => t.agentId === `${id}.package` && t.status !== 'CANCELLED');
  const pub = p.tasks.find((t) => t.agentId === `${id}.publish` && t.status !== 'CANCELLED');
  const post = p.posts.find((x) => x.platform === id);
  const caption = (pkg?.output?.caption ?? pkg?.output?.description) as string | undefined;
  const pendingApproval = pkg?.approvals.find((a) => a.decision === 'PENDING');
  const failed = [pkg, pub].find((t) => t?.status === 'DEAD');
  const m = post?.metrics[0];

  let state: React.ReactNode;
  if (post) {
    state = (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900">Posted {ago(post.publishedAt)}</span>
          {post.url && <LinkBtn href={post.url} external size="sm" tone="ghost" icon={ExternalLink}>Open</LinkBtn>}
        </div>
        <div className="flex gap-3 text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
          <span><Eye className="mr-1 inline size-3" />{fmt(m?.views)}</span><span><Heart className="mr-1 inline size-3" />{fmt(m?.likes)}</span>
          <span className={m?.comments ? 'font-semibold text-violet-600' : ''}><MessageCircle className="mr-1 inline size-3" />{fmt(m?.comments)}</span>
          <span className="text-zinc-400">{m ? `checked ${ago(m.capturedAt)}` : 'stats not checked yet'}</span>
        </div>
      </div>
    );
  } else if (failed) {
    state = (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-red-600">Problem at “{stepLabel(failed.agentId)}”</span>
        <form action={retryTask.bind(null, failed.id)}><Btn size="sm" icon={RotateCw} pendingLabel="Retrying…">Try again</Btn></form>
      </div>
    );
  } else if (pub?.status === 'WAITING_HUMAN') {
    state = <LinkBtn href="/actions" size="sm" tone="primary">Ready to post<ArrowRight className="size-3.5" /></LinkBtn>;
  } else if (pendingApproval) {
    state = <LinkBtn href={`/approvals#${pendingApproval.id}`} size="sm" tone="primary">{approvalWhat(pkg!.type)}<ArrowRight className="size-3.5" /></LinkBtn>;
  } else if (pkg?.status === 'WAITING_AI') {
    state = <span className="text-xs text-sky-600">Claude is writing the caption</span>;
  } else if (pkg || pub) {
    state = <span className="text-xs text-zinc-500">{pkg?.status === 'PENDING' ? 'Starts after you approve the final video' : 'In progress'}</span>;
  } else if (active) {
    state = <form action={addPlatformToProject.bind(null, p.id, id)}><Btn size="sm" icon={Plus} pendingLabel="Adding…">Post here too</Btn></form>;
  } else {
    state = <span className="text-xs text-zinc-400">Not set up yet</span>;
  }

  return (
    <li className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm font-medium"><PlatformIcon id={id} />{PLATFORM_NAME[id] ?? id}</div>
      {state}
      {caption && (
        <details className="group text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><ChevronDown className="size-3.5 transition group-open:rotate-180" />Caption</summary>
          <p className="bidi-lines mt-1.5 whitespace-pre-wrap rounded-lg bg-zinc-50 p-2.5 leading-relaxed ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">{caption}</p>
        </details>
      )}
    </li>
  );
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, platforms] = await Promise.all([api<Project>(`/content/${id}`), api<Platform[]>('/platforms')]);
  const script = p.tasks.find((t) => t.agentId === 'script')?.output as { scenes?: never[]; titleOptions?: string[]; words?: number; targetWords?: number } | null;
  const audio = p.files.filter((f) => /^audio\/scene_\d+\.mp3$/.test(f.path)).sort((a, b) => num(a.path) - num(b.path));
  const stills = p.files.filter((f) => /^(visuals\/stills|output\/stills)\/[^/]+\.(jpg|png)$/.test(f.path)).sort((a, b) => num(a.path) - num(b.path));
  const thumb = p.files.find((f) => f.path === 'platforms/youtube/thumbnail.jpg');
  const qa = p.tasks.find((t) => t.agentId === 'qa')?.output as { checks?: { check: string; pass: boolean; detail: string }[] } | null;
  const vertical = p.params?.format === 'short' || /vertical|9:16|reel|tiktok/i.test(p.title);
  const failed = p.tasks.filter((t) => t.status === 'DEAD');
  const needApproval = p.tasks.flatMap((t) => t.approvals.filter((a) => a.decision === 'PENDING').map((a) => ({ a, t })));
  const plannedPlatforms = [...new Set([...p.tasks.map((t) => t.agentId.split('.')[0]).filter((x) => PLATFORM_NAME[x]), ...p.posts.map((x) => x.platform)])];
  const otherActive = platforms.filter((x) => x.status === 'active' && !plannedPlatforms.includes(x.id)).map((x) => x.id);
  const archived = !!p.archivedAt;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/content" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><ArrowLeft className="size-3.5" />Videos</Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight"><VideoTitle title={p.displayTitle} size="lg" /></h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <Pill>{p.language === 'ur' ? 'Urdu' : 'English'}</Pill>
              <Pill>{p.params?.format === 'short' ? 'Short · vertical' : 'Long'}</Pill>
              {p.brand && <Pill>{p.brand.name}</Pill>}
              <span>started {ago(p.createdAt)}</span>
              {archived && <Pill tone="warning">Archived</Pill>}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {p.video && <LinkBtn href={media(p.id, p.video)} external size="sm" icon={Download}>Download</LinkBtn>}
            <form action={setArchived.bind(null, p.id, !archived)}><Btn size="sm" tone="ghost" icon={archived ? ArchiveRestore : Archive}>{archived ? 'Restore' : 'Archive'}</Btn></form>
          </div>
        </div>
      </div>

      {/* What needs you on this video */}
      {(needApproval.length > 0 || failed.length > 0) && (
        <div className="space-y-2">
          {needApproval.map(({ a, t }) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900 dark:bg-violet-950/40">
              <span className="text-sm font-medium text-violet-900 dark:text-violet-200">{approvalWhat(t.type)}</span>
              <LinkBtn href={`/approvals#${a.id}`} size="sm" tone="primary">Review<ArrowRight className="size-3.5" /></LinkBtn>
            </div>
          ))}
          {failed.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/40">
              <div className="min-w-0 text-sm text-red-800 dark:text-red-300">
                <div className="flex items-center gap-1.5 font-medium"><TriangleAlert className="size-4" />“{stepLabel(t.agentId)}” failed</div>
                {t.lastError && <details className="mt-1 text-xs"><summary className="cursor-pointer">Details</summary><p className="mt-1 break-words font-mono">{t.lastError.slice(0, 600)}</p></details>}
              </div>
              <form action={retryTask.bind(null, t.id)}><Btn size="sm" icon={RotateCw} pendingLabel="Retrying…">Try again</Btn></form>
            </div>
          ))}
        </div>
      )}

      {p.tasks.length > 0 && <Card padded={false}><div className="p-3"><Pipeline tasks={p.tasks} /></div></Card>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title="Final video">
            {p.video ? <VideoPlayer vertical={vertical} src={media(p.id, p.video)} /> : (
              <div className="grid h-40 place-items-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/40">The video appears here once it is rendered</div>
            )}
          </Card>
          {script?.scenes && <Card title="Script" actions={<FileText className="size-4 text-zinc-400" />}><ScriptView scenes={script.scenes} titleOptions={script.titleOptions} words={script.words} targetWords={script.targetWords} /></Card>}
          {stills.length > 0 && (
            <Card title="Scenes" description={`${stills.length} preview frames`} actions={<Images className="size-4 text-zinc-400" />}>
              <div className={`grid gap-2 ${vertical ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {stills.map((f, i) => (
                  <a key={f.path} href={media(p.id, f.path)} target="_blank" className="group relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media(p.id, f.path)} alt={`Scene ${i + 1}`} loading="lazy" className={`w-full object-cover transition group-hover:scale-[1.03] ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`} />
                    <span className="absolute left-1.5 top-1.5 rounded bg-zinc-950/70 px-1.5 text-[11px] font-medium text-white">{i + 1}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Where it's posted">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {plannedPlatforms.map((pl) => <PlatformRow key={pl} id={pl} p={p} active />)}
              {otherActive.map((pl) => <PlatformRow key={pl} id={pl} p={p} active />)}
            </ul>
          </Card>

          {thumb && (
            <Card title="YouTube thumbnail">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media(p.id, thumb.path)} alt="Thumbnail" className="w-full rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700" />
            </Card>
          )}

          <details className="group rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold">More details<ChevronDown className="size-4 text-zinc-400 transition group-open:rotate-180" /></summary>
            <div className="space-y-5 border-t border-zinc-100 p-5 dark:border-zinc-800">
              {qa?.checks && (
                <div><div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500"><ShieldCheck className="size-3.5" />Quality checks</div>
                  <ul className="space-y-2">{qa.checks.map((c, i) => <CheckRow key={i} pass={c.pass} label={c.check} detail={c.detail} />)}</ul></div>
              )}
              {audio.length > 0 && (
                <div><div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500"><AudioLines className="size-3.5" />Narration per scene</div>
                  <ul className="space-y-2">{audio.map((f, i) => (
                    <li key={f.path} className="flex items-center gap-2"><span className="w-6 text-xs text-zinc-400">{i + 1}</span><audio controls preload="none" src={media(p.id, f.path)} className="h-8 w-full" /></li>
                  ))}</ul></div>
              )}
              <div><div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-500"><FolderOpen className="size-3.5" />{p.files.length} files</div>
                <ul className="max-h-60 space-y-0.5 overflow-auto font-mono text-[11px]">
                  {p.files.map((f) => (
                    <li key={f.path} className="flex justify-between gap-2"><a href={media(p.id, f.path)} target="_blank" className="truncate text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white">{f.path}</a><span className="shrink-0 text-zinc-400">{f.bytes > 1e6 ? `${(f.bytes / 1e6).toFixed(1)} MB` : `${Math.ceil(f.bytes / 1024)} KB`}</span></li>
                  ))}
                </ul></div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
