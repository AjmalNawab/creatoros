import Link from 'next/link';
import { ArrowLeft, AudioLines, Download, ExternalLink, FileText, FolderOpen, Images, Radio, ShieldCheck, Youtube } from 'lucide-react';
import { api } from '@/lib/api';
import { addPlatformToProject } from '@/lib/actions';
import { Badge, Btn, Card, Pill, ago } from '@/components/ui';
import { CheckRow, Pipeline, ScriptView, VideoPlayer, media } from '@/components/content';

type Task = {
  id: string; agentId: string; type: string; status: string; lastError: string | null; output: Record<string, unknown> | null;
  approvals: { id: string; decision: string; feedback: string | null }[];
  aiRequests: { id: string; kind: string; status: string; error: string | null; createdAt: string }[];
};
type Post = { id: string; platform: string; url: string | null; status: string; visibility: string | null; publishedAt: string };
type Project = {
  id: string; slug: string; title: string; status: string; language: string; createdAt: string; tasks: Task[]; posts: Post[];
  files: { path: string; bytes: number }[]; video: string | null;
  brand: { name: string; slug: string; youtube: { handle: string } | null } | null;
};

const num = (s: string) => parseInt(s.match(/(\d+)\.\w+$/)?.[1] ?? '0', 10);

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await api<Project>(`/content/${id}`);
  const script = p.tasks.find((t) => t.agentId === 'script')?.output as { scenes?: never[]; titleOptions?: string[]; words?: number; targetWords?: number } | null;
  const audio = p.files.filter((f) => /^audio\/scene_\d+\.mp3$/.test(f.path)).sort((a, b) => num(a.path) - num(b.path));
  const stills = p.files.filter((f) => /^(visuals\/stills|output\/stills)\/[^/]+\.(jpg|png)$/.test(f.path)).sort((a, b) => num(a.path) - num(b.path));
  const thumb = p.files.find((f) => f.path === 'platforms/youtube/thumbnail.jpg');
  const qa = p.tasks.find((t) => t.agentId === 'qa')?.output as { checks?: { check: string; pass: boolean; detail: string }[] } | null;
  const problems = p.tasks.filter((t) => t.lastError && !['COMPLETED', 'CANCELLED'].includes(t.status));
  const hasYT = p.tasks.some((t) => t.agentId === 'youtube.package' && t.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      <div>
        <Link href="/content" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><ArrowLeft className="size-3.5" />Content Studio</Link>
        <h1 dir="auto" className={`mt-2 text-xl font-semibold tracking-tight sm:text-2xl ${/[\u0600-\u06FF]/.test(p.title) ? 'urdu leading-[2]' : ''}`}>{p.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <Pill>{p.language === 'ur' ? 'Urdu' : 'English'}</Pill>
          {p.brand && <Pill>{p.brand.name}</Pill>}
          <span className="font-mono">content/{p.slug}</span><span>·</span><span>created {ago(p.createdAt)}</span>
        </div>
      </div>

      {p.tasks.length > 0 && <Card padded={false}><div className="p-3"><Pipeline tasks={p.tasks} /></div></Card>}

      {problems.map((t) => (
        <div key={t.id} className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <b className="font-medium">{t.agentId}</b>: {t.lastError}
        </div>
      ))}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title="Final video" actions={p.video && <a href={media(p.id, p.video)} download className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><Download className="size-3.5" />MP4</a>}>
            {p.video ? <VideoPlayer vertical={(p as unknown as { params?: { format?: string } }).params?.format === 'short'} src={media(p.id, p.video)} /> : (
              <div className="grid h-40 place-items-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/40">The video appears here once it is rendered</div>
            )}
          </Card>
          {stills.length > 0 && (
            <Card title="Scenes" description={`${stills.length} preview frames`} actions={<Images className="size-4 text-zinc-400" />}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {stills.map((f, i) => (
                  <a key={f.path} href={media(p.id, f.path)} target="_blank" className="group relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media(p.id, f.path)} alt={`Scene ${i + 1}`} className="aspect-video w-full object-cover transition group-hover:scale-[1.03]" />
                    <span className="absolute left-1.5 top-1.5 rounded bg-zinc-950/70 px-1.5 text-[11px] font-medium text-white">{i + 1}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}
          {script?.scenes && <Card title="Script" actions={<FileText className="size-4 text-zinc-400" />}><ScriptView scenes={script.scenes} titleOptions={script.titleOptions} words={script.words} targetWords={script.targetWords} /></Card>}
        </div>

        <div className="space-y-6">
          <Card title="Publishing" actions={<Radio className="size-4 text-zinc-400" />}>
            {p.posts.length > 0 && (
              <ul className="mb-4 space-y-2">{p.posts.map((x) => (
                <li key={x.id} className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 text-sm ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
                  <Youtube className="size-4 shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1"><div className="font-medium capitalize">{x.platform} <span className="font-normal text-zinc-500">· {x.visibility}</span></div>
                    {x.url && <a href={x.url} target="_blank" className="flex items-center gap-1 truncate text-xs text-sky-600 hover:underline">{x.url}<ExternalLink className="size-3" /></a>}</div>
                  <Badge status={x.status === 'published' ? 'COMPLETED' : 'FAILED'} label={x.status} />
                </li>
              ))}</ul>
            )}
            {thumb && (
              <div className="mb-4">
                <div className="mb-1.5 text-xs font-medium text-zinc-500">YouTube thumbnail</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media(p.id, thumb.path)} alt="Thumbnail" className="w-full rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700" />
              </div>
            )}
            {!p.posts.length && (p.brand?.youtube
              ? hasYT
                ? <p className="text-sm text-zinc-500">YouTube publishing is part of this video&apos;s pipeline ({p.brand.youtube.handle}).</p>
                : <form action={addPlatformToProject.bind(null, p.id, 'youtube')}><Btn icon={Youtube} className="w-full">Publish to {p.brand.youtube.handle}</Btn></form>
              : <p className="text-sm text-zinc-500">The brand “{p.brand?.name ?? 'none'}” has no YouTube channel yet. Add one on the <Link href="/brand" className="underline">Brands</Link> page to publish.</p>)}
          </Card>

          {qa?.checks && (
            <Card title="Quality checks" actions={<ShieldCheck className="size-4 text-zinc-400" />}>
              <ul className="space-y-2">{qa.checks.map((c, i) => <CheckRow key={i} pass={c.pass} label={c.check} detail={c.detail} />)}</ul>
            </Card>
          )}

          {audio.length > 0 && (
            <Card title="Narration" actions={<AudioLines className="size-4 text-zinc-400" />}>
              <ul className="space-y-2">{audio.map((f, i) => (
                <li key={f.path} className="flex items-center gap-2"><span className="w-6 text-xs text-zinc-400">{i + 1}</span><audio controls preload="none" src={media(p.id, f.path)} className="h-8 w-full" /></li>
              ))}</ul>
            </Card>
          )}

          <Card title="Files" description={`${p.files.length} files in content/${p.slug}`} actions={<FolderOpen className="size-4 text-zinc-400" />}>
            <ul className="max-h-72 space-y-0.5 overflow-auto font-mono text-[11px]">
              {p.files.map((f) => (
                <li key={f.path} className="flex justify-between gap-2"><a href={media(p.id, f.path)} target="_blank" className="truncate text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white">{f.path}</a><span className="shrink-0 text-zinc-400">{f.bytes > 1e6 ? `${(f.bytes / 1e6).toFixed(1)} MB` : `${Math.ceil(f.bytes / 1024)} KB`}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
